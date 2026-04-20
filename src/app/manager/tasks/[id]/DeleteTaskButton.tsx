'use client';

import { useTransition } from 'react';
import { deleteTask } from '@/actions/tasks';
import { toast } from 'sonner';
import { Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DeleteTaskButton({ taskId }: { taskId: number }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm('Are you sure you want to permanently delete this task? This cannot be undone.')) return;
    startTransition(async () => {
      const res = await deleteTask(taskId);
      if (res.error) toast.error(res.error);
      else {
        toast.success('Task deleted.');
        router.push('/manager/tasks');
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
      title="Delete task"
    >
      {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
    </button>
  );
}
