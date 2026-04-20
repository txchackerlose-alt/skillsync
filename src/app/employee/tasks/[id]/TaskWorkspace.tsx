'use client';

import { useTransition, useState } from 'react';
import { updateTaskProgress, startTask, submitTaskForReview, uploadTaskFile } from '@/actions/tasks';
import { toast } from 'sonner';
import { Loader2, Play, Send, Upload, FileText } from 'lucide-react';
import ProgressBar from '@/components/tasks/ProgressBar';
import type { Task, TaskFile } from '@/lib/types';

export default function TaskWorkspace({ task, files }: { task: Task; files: TaskFile[] }) {
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = useState(task.progress ?? 0);
  const [note, setNote] = useState('');

  const isCompleted = task.status === 'Completed' || task.status === 'Submitted for Review';

  const handleStart = () => {
    startTransition(async () => {
      const res = await startTask(task.id);
      if (res.error) toast.error(res.error);
      else toast.success('Task started!');
    });
  };

  const handleProgressSave = () => {
    startTransition(async () => {
      const res = await updateTaskProgress(task.id, progress, note);
      if (res.error) toast.error(res.error);
      else {
        toast.success('Progress saved!');
        setNote('');
      }
    });
  };

  const handleSubmitReview = () => {
    startTransition(async () => {
      const res = await submitTaskForReview(task.id);
      if (res.error) toast.error(res.error);
      else toast.success('Task submitted for review!');
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadTaskFile(task.id, fd);
      if (res.error) toast.error(res.error);
      else toast.success('File uploaded!');
    });
  };

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
        <h3 className="font-bold text-lg">Progress</h3>

        <ProgressBar value={progress} />

        {!isCompleted && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-brand-muted mb-2">Update Progress: {progress}%</label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={progress}
                onChange={e => setProgress(Number(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
            </div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="Add a progress note (optional)..."
              className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-sm focus:outline-none focus:border-brand-teal transition-colors"
            />
            <div className="flex gap-3">
              <button
                onClick={handleProgressSave}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-brand-surface border border-brand-teal text-brand-teal hover:bg-brand-teal/10 font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Progress'}
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={isPending || progress < 100}
                title={progress < 100 ? 'Set progress to 100% before submitting' : ''}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-teal to-brand-aqua text-white font-medium transition-all disabled:opacity-50 hover:shadow-[0_0_15px_rgba(45,212,191,0.4)] flex items-center justify-center gap-2 text-sm"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Submit for Review</>}
              </button>
            </div>
          </div>
        )}

        {task.status === 'Not Started' && (
          <button
            onClick={handleStart}
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-violet text-white font-medium hover:shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Play className="w-4 h-4" /> Start Task</>}
          </button>
        )}
      </div>

      {/* Manager Feedback */}
      {task.manager_feedback && (
        <div className={`p-5 rounded-2xl border ${
          task.review_status === 'Approved'
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <h3 className={`font-bold mb-2 ${task.review_status === 'Approved' ? 'text-green-400' : 'text-red-400'}`}>
            {task.review_status === 'Approved' ? '✓ Manager Approved' : '✗ Manager Rejected'}
          </h3>
          <p className="text-sm text-brand-text/80">{task.manager_feedback}</p>
        </div>
      )}

      {/* File Attachments */}
      <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
        <h3 className="font-bold text-lg">Attachments</h3>
        <div className="space-y-2">
          {files.map((f) => (
            <a
              key={f.id}
              href={f.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-brand-bg border border-brand-border hover:border-brand-teal transition-colors group"
            >
              <FileText className="w-5 h-5 text-brand-muted group-hover:text-brand-teal" />
              <span className="text-sm font-medium">{f.file_name}</span>
            </a>
          ))}
          {files.length === 0 && (
            <p className="text-sm text-brand-muted italic">No files uploaded yet.</p>
          )}
        </div>

        {!isCompleted && (
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border border-dashed border-brand-border hover:border-brand-teal text-brand-muted hover:text-brand-teal transition-all text-sm font-medium">
            <Upload className="w-4 h-4" />
            Upload Attachment
            <input type="file" className="hidden" onChange={handleFileUpload} disabled={isPending} />
          </label>
        )}
      </div>
    </div>
  );
}
