'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { parseResume } from '@/lib/resume-parser';
import { extractSkillsFromText, mergeSkills } from '@/lib/skill-extractor';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXT = /\.(pdf|doc|docx)$/i;
const ALLOWED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export interface ResumeUploadResult {
  success?: boolean;
  error?: string;
  extractedSkills?: string[];
  resumeText?: string;
}

export async function uploadResumeAndExtractSkills(
  formData: FormData
): Promise<ResumeUploadResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const file = formData.get('resume') as File | null;
  if (!file || file.size === 0) return { error: 'No file provided.' };

  // ── Validate ──────────────────────────────────────────
  if (!ALLOWED_MIME.includes(file.type) && !ALLOWED_EXT.test(file.name)) {
    return { error: 'Only PDF, DOC, and DOCX files are allowed.' };
  }
  if (file.size > MAX_SIZE) {
    return { error: `File too large. Max is 5 MB (yours is ${(file.size / 1024 / 1024).toFixed(1)} MB).` };
  }

  // ── Upload to Supabase Storage ─────────────────────────
  const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
  const storagePath = `${user.id}/resume.${ext}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(storagePath, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    if (uploadError.message?.toLowerCase().includes('not found')) {
      return {
        error:
          'Storage bucket "resumes" does not exist. ' +
          'Please create a PUBLIC bucket named "resumes" in your Supabase Dashboard → Storage.',
      };
    }
    return { error: 'Upload failed: ' + uploadError.message };
  }

  const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(storagePath);
  const publicUrl = urlData.publicUrl;

  // ── Parse resume text ──────────────────────────────────
  const parseResult = await parseResume(file);
  if (parseResult.error) {
    // We still inserted the resume, but we let them know parsing failed.
    return { error: 'Upload successful, but parsing failed: ' + parseResult.error };
  }
  const resumeText = parseResult.text;

  // ── Extract skills ─────────────────────────────────────
  const extractedSkills = extractSkillsFromText(resumeText);

  // ── Fetch existing manual skills ───────────────────────
  const { data: existingRows } = await supabase
    .from('employee_skills')
    .select('skill')
    .eq('employee_id', user.id);

  const manualSkills = existingRows?.map((r: any) => r.skill) || [];
  const mergedSkills = mergeSkills(manualSkills, extractedSkills);

  // ── Save merged skills (replace all) ──────────────────
  await supabase.from('employee_skills').delete().eq('employee_id', user.id);
  if (mergedSkills.length > 0) {
    await supabase.from('employee_skills').insert(
      mergedSkills.map(skill => ({ employee_id: user.id, skill }))
    );
  }

  // ── Save resume record ─────────────────────────────────
  await supabase.from('resumes').delete().eq('employee_id', user.id);
  const { error: dbError } = await supabase.from('resumes').insert({
    employee_id: user.id,
    file_url: publicUrl,
    file_name: file.name,
  });
  if (dbError) return { error: 'Saved to storage but DB record failed: ' + dbError.message };

  // ── Update profile's resume_text if column exists ─────
  // (Safe — will silently skip if column doesn't exist yet)
  await supabase
    .from('profiles')
    .update({ resume_text: resumeText.slice(0, 10000) } as any)
    .eq('id', user.id);

  revalidatePath('/employee/profile');
  revalidatePath('/manager/employees');

  return {
    success: true,
    extractedSkills,
    resumeText: resumeText.slice(0, 500), // preview only
  };
}
