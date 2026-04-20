'use client';

import { useTransition, useState } from 'react';
import { approveTask, rejectTask } from '@/actions/tasks';
import { toast } from 'sonner';
import { Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ReviewForm({ taskId }: { taskId: number }) {
  const [feedback, setFeedback] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleApprove = () => {
    startTransition(async () => {
      const res = await approveTask(taskId, feedback);
      if (res.error) toast.error(res.error);
      else {
        toast.success('Task approved!');
        setTimeout(() => router.push('/manager/tasks'), 500);
      }
    });
  };

  const handleReject = () => {
    if (!feedback.trim()) {
      toast.error('Please provide feedback before rejecting.');
      return;
    }
    startTransition(async () => {
      const res = await rejectTask(taskId, feedback);
      if (res.error) toast.error(res.error);
      else {
        toast.success('Task rejected with feedback.');
        setTimeout(() => router.push('/manager/tasks'), 500);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-brand-muted mb-2">
          Feedback / Comments
        </label>
        <textarea
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          rows={4}
          placeholder="Provide detailed feedback for the employee..."
          className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-sm focus:outline-none focus:border-brand-teal transition-colors"
        />
        <p className="text-xs text-brand-muted mt-1">Required for rejection, optional for approval.</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="flex-1 py-3 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
          Approve
        </button>
        <button
          onClick={handleReject}
          disabled={isPending}
          className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
          Reject
        </button>
      </div>
    </div>
  );
}
