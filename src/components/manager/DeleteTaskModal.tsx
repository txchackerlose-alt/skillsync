'use client';

import { useTransition } from 'react';
import { deleteTask } from '@/actions/tasks';
import { Loader2, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number;
  taskTitle: string;
  onDeleted?: () => void;
}

export default function DeleteTaskModal({ isOpen, onClose, taskId, taskTitle, onDeleted }: DeleteTaskModalProps) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTask(taskId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Task deleted successfully');
        if (onDeleted) {
          onDeleted();
        } else {
          onClose();
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-md shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-brand-border">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Delete Task
          </h3>
          <button onClick={onClose} disabled={isPending} className="text-brand-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-brand-muted">
            Are you sure you want to delete <span className="text-white font-semibold">"{taskTitle}"</span>?
          </p>
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            This action cannot be undone. It will also delete all associated assignments, files, updates, and comments.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-brand-border bg-black/20 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-brand-border hover:bg-brand-surface2 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
