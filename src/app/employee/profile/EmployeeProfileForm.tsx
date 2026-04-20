'use client';

import React, { useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { updateProfile } from '@/actions/profile';
import { uploadResumeAndExtractSkills } from '@/actions/resume-actions';
import { Loader2, Upload, FileText, X, CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';

const MAX_MB = 5;
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_EXT = /\.(pdf|doc|docx)$/i;

export default function EmployeeProfileForm({ profile, initialSkills, latestResume }: any) {
  const [isPending, startTransition] = useTransition();
  const [isParsingResume, setIsParsingResume] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [uploadedResumeName, setUploadedResumeName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      name:   profile?.name  || '',
      dept:   profile?.dept  || '',
      bio:    profile?.bio   || '',
      skills: initialSkills  || '',
    },
  });

  const currentSkillsValue = watch('skills');

  // ── File selection & validation ──────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    setSelectedFile(null);
    setExtractedSkills([]);

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXT.test(file.name)) {
      setFileError('Only PDF, DOC, and DOCX files are allowed.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setFileError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is ${MAX_MB} MB.`);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFileError(null);
    setExtractedSkills([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Upload + parse resume ────────────────────────────
  const handleResumeUpload = () => {
    if (!selectedFile) return;
    setIsParsingResume(true);

    startTransition(async () => {
      const fd = new FormData();
      fd.append('resume', selectedFile);

      const result = await uploadResumeAndExtractSkills(fd);
      setIsParsingResume(false);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Resume uploaded!');
      setUploadedResumeName(selectedFile.name);

      if (result.extractedSkills && result.extractedSkills.length > 0) {
        setExtractedSkills(result.extractedSkills);
        toast.success(`${result.extractedSkills.length} skills extracted from your resume!`);

        // Merge extracted skills with current manual skills
        const currentSkills = currentSkillsValue
          .split(',').map((s: string) => s.trim()).filter(Boolean);
        const merged = [...new Set([...currentSkills, ...result.extractedSkills])];
        setValue('skills', merged.join(', '));
      } else {
        toast.info('Resume uploaded but no skills were automatically detected. Please add skills manually.');
      }

      clearFile();
    });
  };

  // ── Save profile ─────────────────────────────────────
  const onSubmit = (data: any) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.append('name',   data.name);
      fd.append('dept',   data.dept);
      fd.append('bio',    data.bio);
      fd.append('skills', data.skills);

      const result = await updateProfile(fd);
      if (result?.error) toast.error(result.error);
      else toast.success('Profile saved!');
    });
  };

  const addExtractedSkill = (skill: string) => {
    const current = currentSkillsValue
      .split(',').map((s: string) => s.trim()).filter(Boolean);
    if (!current.map((s: string) => s.toLowerCase()).includes(skill.toLowerCase())) {
      setValue('skills', [...current, skill].join(', '));
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Profile Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-brand-muted mb-2">Full Name</label>
            <input
              {...register('name')}
              className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-purple transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-muted mb-2">Department</label>
            <input
              {...register('dept')}
              className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-purple transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-muted mb-2">Bio / Experience</label>
          <textarea
            {...register('bio')}
            rows={3}
            placeholder="Tell managers about your background..."
            className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-purple transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-muted mb-2">
            Skills
            <span className="ml-2 text-xs text-brand-teal font-normal">(comma separated)</span>
          </label>
          <input
            {...register('skills')}
            className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-purple transition-colors"
            placeholder="e.g., React, Node.js, Python, Figma"
          />
          <p className="text-xs text-brand-muted mt-1.5">
            These skills are used to match you with tasks. Upload your resume below to auto-extract them.
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-brand-purple to-brand-violet text-white hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:opacity-60"
        >
          {isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving…</> : 'Save Profile'}
        </button>
      </form>

      {/* ── Divider ── */}
      <div className="border-t border-brand-border" />

      {/* ── Resume Upload & Skill Extraction Section ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-teal" />
          <h3 className="font-bold text-lg">Resume Upload & Auto Skill Extraction</h3>
        </div>
        <p className="text-sm text-brand-muted">
          Upload your resume and we'll automatically extract your skills and add them to your profile.
        </p>

        {/* Current resume */}
        {(latestResume || uploadedResumeName) && !selectedFile && (
          <div className="p-4 rounded-xl bg-brand-bg border border-brand-border flex items-center gap-3">
            <FileText className="w-5 h-5 text-brand-purple shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                Current: {uploadedResumeName || latestResume?.file_name}
              </div>
              {latestResume?.file_url && !uploadedResumeName && (
                <a href={latestResume.file_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-brand-teal hover:underline">
                  View resume ↗
                </a>
              )}
            </div>
          </div>
        )}

        {/* Selected file preview */}
        {selectedFile && (
          <div className="p-4 rounded-xl bg-brand-teal/10 border border-brand-teal/30 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{selectedFile.name}</div>
              <div className="text-xs text-brand-muted">{(selectedFile.size / 1024).toFixed(0)} KB — ready to upload</div>
            </div>
            <button type="button" onClick={clearFile}
              className="p-1 rounded-lg hover:bg-brand-surface transition-colors text-brand-muted hover:text-brand-text">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Drop zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl transition-colors cursor-pointer ${
            fileError ? 'border-red-500/50 bg-red-500/5' : 'border-brand-border bg-brand-bg hover:border-brand-purple'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center justify-center py-8 pointer-events-none select-none">
            <Upload className={`w-8 h-8 mb-2 ${fileError ? 'text-red-400' : 'text-brand-muted'}`} />
            <div className="text-sm font-medium">
              {selectedFile ? 'Click to change file' : 'Click to upload or drag and drop'}
            </div>
            <div className="text-xs text-brand-muted mt-1">PDF, DOC, DOCX · Max {MAX_MB} MB</div>
          </div>
        </div>

        {fileError && (
          <p className="text-red-400 text-sm flex items-center gap-1.5">
            <X className="w-3.5 h-3.5 shrink-0" /> {fileError}
          </p>
        )}

        {/* Upload & Extract button */}
        {selectedFile && (
          <button
            type="button"
            onClick={handleResumeUpload}
            disabled={isParsingResume || isPending}
            className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-brand-teal to-brand-aqua text-white hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all disabled:opacity-60"
          >
            {isParsingResume ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Parsing resume & extracting skills…</>
            ) : (
              <><Zap className="w-5 h-5" /> Upload & Extract Skills</>
            )}
          </button>
        )}

        {/* Extracted skills preview */}
        {extractedSkills.length > 0 && (
          <div className="p-5 rounded-xl bg-brand-surface border border-brand-teal/30 space-y-3">
            <div className="flex items-center gap-2 text-brand-teal font-semibold">
              <Sparkles className="w-4 h-4" />
              {extractedSkills.length} skills extracted from your resume
            </div>
            <div className="flex flex-wrap gap-2">
              {extractedSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => addExtractedSkill(skill)}
                  title="Click to add to your skills"
                  className="px-3 py-1 text-sm rounded-lg bg-brand-teal/10 border border-brand-teal/30 text-brand-teal hover:bg-brand-teal/20 transition-colors"
                >
                  + {skill}
                </button>
              ))}
            </div>
            <p className="text-xs text-brand-muted">
              These have been automatically added to your Skills field above. Click any badge to re-add it if you removed it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
