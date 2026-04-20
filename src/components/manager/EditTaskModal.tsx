'use client';

import React, { useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateTask } from '@/actions/tasks';
import { Loader2, Edit3, X } from 'lucide-react';
import { toast } from 'sonner';

const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  deadline: z.string().optional(),
  requiredSkills: z.string().optional(),
  status: z.enum(['Not Started', 'In Progress', 'Submitted for Review', 'Completed', 'Rejected', 'Overdue']),
  assigneeId: z.string().optional(),
});

type TaskForm = z.infer<typeof taskSchema>;

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
  employees: any[];
}

export default function EditTaskModal({ isOpen, onClose, task, employees }: EditTaskModalProps) {
  const [isPending, startTransition] = useTransition();

  const currentAssignee = task?.task_assignments?.[0]?.employee_id || '';

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'medium',
      deadline: task?.deadline || '',
      requiredSkills: task?.required_skills?.join(', ') || '',
      status: task?.status || 'Not Started',
      assigneeId: currentAssignee,
    }
  });

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      reset({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        deadline: task.deadline || '',
        requiredSkills: task.required_skills?.join(', ') || '',
        status: task.status || 'Not Started',
        assigneeId: task.task_assignments?.[0]?.employee_id || '',
      });
    }
  }, [task, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: TaskForm) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('priority', data.priority);
      formData.append('deadline', data.deadline || '');
      formData.append('requiredSkills', data.requiredSkills || '');
      formData.append('status', data.status);
      
      // If assignee changed, append it. If it's empty, we send empty string to unassign.
      if (data.assigneeId !== currentAssignee) {
        formData.append('assigneeId', data.assigneeId || '');
      }

      const result = await updateTask(task.id, formData);
      
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Task updated successfully');
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-2xl shadow-2xl animate-scale-in my-auto">
        <div className="flex items-center justify-between p-5 border-b border-brand-border sticky top-0 bg-brand-surface rounded-t-2xl z-10">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-brand-teal" />
            Edit Task
          </h3>
          <button onClick={onClose} disabled={isPending} className="text-brand-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-brand-muted mb-2">Task Title</label>
            <input
              {...register('title')}
              className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-teal transition-colors"
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-muted mb-2">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-teal transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-2">Status</label>
              <select
                {...register('status')}
                className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-teal transition-colors"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Submitted for Review">Submitted for Review</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-2">Assignee</label>
              <select
                {...register('assigneeId')}
                className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-teal transition-colors"
              >
                <option value="">Unassigned</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-2">Priority</label>
              <select
                {...register('priority')}
                className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-teal transition-colors"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-2">Deadline</label>
              <input
                type="date"
                {...register('deadline')}
                className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-teal transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-muted mb-2">Required Skills (comma separated)</label>
            <input
              {...register('requiredSkills')}
              className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-teal transition-colors"
              placeholder="React, Node.js, Tailwind"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-brand-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl text-sm font-medium border border-brand-border hover:bg-brand-surface2 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-brand-teal to-brand-aqua hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] text-white transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
