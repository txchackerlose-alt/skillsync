'use client';

import { useTransition, useState } from 'react';
import { addComment } from '@/actions/tasks';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';
import type { TaskComment } from '@/lib/types';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

export default function CommentThread({
  taskId,
  comments,
  currentUserId,
}: {
  taskId: number;
  comments: TaskComment[];
  currentUserId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    startTransition(async () => {
      const res = await addComment(taskId, text.trim());
      if (res.error) {
        toast.error(res.error);
      } else {
        setText('');
      }
    });
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-brand-muted uppercase tracking-wider text-xs">
        Comments ({comments.length})
      </h4>

      {/* Thread */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {comments.map((c) => {
          const isOwn = c.user_id === currentUserId;
          return (
            <div key={c.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 shrink-0 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple text-xs font-bold">
                {(c.profiles?.name || '?').charAt(0).toUpperCase()}
              </div>
              <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                  isOwn
                    ? 'bg-brand-teal/20 text-brand-text rounded-tr-sm'
                    : 'bg-brand-surface border border-brand-border rounded-tl-sm'
                }`}>
                  {c.comment}
                </div>
                <span className="text-xs text-brand-muted mt-1 px-1">
                  {c.profiles?.name || 'Unknown'} · {formatDate(c.created_at)}
                </span>
              </div>
            </div>
          );
        })}
        {comments.length === 0 && (
          <p className="text-sm text-brand-muted italic text-center py-4">No comments yet. Start the conversation!</p>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm focus:outline-none focus:border-brand-teal transition-colors"
        />
        <button
          type="submit"
          disabled={isPending || !text.trim()}
          className="px-4 py-2.5 bg-brand-teal text-white rounded-xl hover:bg-brand-aqua transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
