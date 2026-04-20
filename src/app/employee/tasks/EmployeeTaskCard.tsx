'use client';

import { useTransition } from 'react';
import { updateTaskStatus } from '@/actions/tasks';
import { toast } from 'sonner';

export default function EmployeeTaskCard({ task }: { task: any }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      const res = await updateTaskStatus(task.id, newStatus);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Task marked as ${newStatus}`);
      }
    });
  };

  return (
    <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-bold text-xl">{task.title}</h4>
          <div className="text-brand-muted text-sm mt-1">Due: {task.deadline || 'No deadline'}</div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          task.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
          task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
          task.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {task.priority.toUpperCase()}
        </span>
      </div>

      <p className="text-brand-text/80 text-sm whitespace-pre-line">{task.description}</p>
      
      {task.required_skills && task.required_skills.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {task.required_skills.map((skill: string, i: number) => (
            <span key={i} className="px-2 py-1 text-xs rounded-lg bg-brand-bg border border-brand-border text-brand-muted">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="pt-4 border-t border-brand-border flex items-center justify-between">
        <span className="text-sm font-medium text-brand-muted">Status:</span>
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={isPending}
          className={`px-4 py-2 rounded-xl text-sm font-medium focus:outline-none appearance-none cursor-pointer transition-colors ${
            task.status === 'Completed' ? 'bg-brand-aqua/20 text-brand-aqua border border-brand-aqua/30' :
            task.status === 'In Progress' ? 'bg-brand-teal/20 text-brand-teal border border-brand-teal/30' :
            'bg-brand-bg border border-brand-border text-brand-text'
          }`}
        >
          <option value="Not Started" className="bg-brand-bg text-brand-text">Not Started</option>
          <option value="In Progress" className="bg-brand-bg text-brand-text">In Progress</option>
          <option value="Completed" className="bg-brand-bg text-brand-text">Completed</option>
        </select>
      </div>
    </div>
  );
}
