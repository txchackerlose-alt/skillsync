'use client';

import React, { useTransition, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createTask } from '@/actions/tasks';
import { getBestMatch, type EmployeeWithSkills } from '@/lib/skillMatch';
import { Loader2, Users, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  deadline: z.string().optional(),
  requiredSkills: z.string().optional(),
});

type TaskForm = z.infer<typeof taskSchema>;

export default function CreateTaskForm({ employees }: { employees: EmployeeWithSkills[] }) {
  const [isPending, startTransition] = useTransition();
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const router = useRouter();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'medium',
      requiredSkills: '',
    }
  });

  const requiredSkillsInput = watch('requiredSkills') || '';

  // Dynamic skill matching
  const matchedEmployees = useMemo(() => {
    const skills = requiredSkillsInput.split(',').map(s => s.trim()).filter(Boolean);
    if (skills.length === 0) return employees.map(e => ({ ...e, matchPercentage: 100, matchedSkills: [], missingSkills: [] }));
    return getBestMatch(skills, employees);
  }, [requiredSkillsInput, employees]);

  const onSubmit = (data: TaskForm) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('priority', data.priority);
      formData.append('deadline', data.deadline || '');
      formData.append('requiredSkills', data.requiredSkills || '');
      formData.append('assigneeId', selectedAssigneeId); // Use state directly

      const result = await createTask(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Task created and assigned successfully!');
        setTimeout(() => router.push('/manager/tasks'), 500);
      }
    });
  };

  const selectedEmployee = employees.find(e => e.id === selectedAssigneeId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form */}
      <div className="lg:col-span-2 p-8 rounded-3xl bg-brand-surface border border-brand-border">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-brand-muted mb-2">Task Title</label>
            <input
              {...register('title')}
              className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-teal transition-colors"
              placeholder="E.g., Implement login page"
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-muted mb-2">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-teal transition-colors"
              placeholder="Task details..."
            />
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
            <p className="text-xs text-brand-muted mt-1">Type skills to see matched employees on the right →</p>
          </div>

          {/* Show selected assignee summary */}
          {selectedEmployee && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-brand-teal/10 border border-brand-teal/30">
              <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0" />
              <div>
                <p className="text-sm font-semibold text-brand-teal">Assigning to: {selectedEmployee.name || 'Unnamed Employee'}</p>
                <p className="text-xs text-brand-muted">{selectedEmployee.skills.join(', ') || 'No skills listed'}</p>
              </div>
            </div>
          )}

          {!selectedEmployee && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-brand-bg border border-dashed border-brand-border">
              <Users className="w-5 h-5 text-brand-muted shrink-0" />
              <p className="text-sm text-brand-muted">No assignee selected — click an employee on the right to assign</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-brand-teal to-brand-aqua text-white hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] disabled:opacity-70"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create & Assign Task'}
          </button>
        </form>
      </div>

      {/* Skill Match / Employee Selection */}
      <div className="p-6 rounded-3xl bg-brand-bg/50 border border-brand-border h-fit sticky top-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-brand-purple/20 text-brand-purple rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold">Select Assignee</h3>
        </div>

        {employees.length === 0 && (
          <div className="text-center text-brand-muted py-6 text-sm">
            No employees available. Ask employees to set up their profiles first.
          </div>
        )}

        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {matchedEmployees.map((emp) => (
            <button
              key={emp.id}
              type="button"
              onClick={() => setSelectedAssigneeId(selectedAssigneeId === emp.id ? '' : emp.id)}
              className={`w-full text-left p-4 rounded-xl transition-all border ${
                selectedAssigneeId === emp.id
                  ? 'bg-brand-surface border-brand-teal shadow-[0_0_15px_rgba(45,212,191,0.15)]'
                  : 'bg-brand-surface/30 border-brand-border hover:border-brand-muted'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {selectedAssigneeId === emp.id && (
                    <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                  )}
                  <span className="font-semibold text-sm">{emp.name || 'Unnamed Employee'}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  emp.matchPercentage >= 80 ? 'bg-green-500/20 text-green-400' :
                  emp.matchPercentage >= 50 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {emp.matchPercentage}%
                </span>
              </div>

              {'matchedSkills' in emp && (emp as any).matchedSkills?.length > 0 && (
                <div className="text-xs text-green-400/80 mb-0.5">
                  <span className="font-medium text-green-400">✓ </span>{(emp as any).matchedSkills.join(', ')}
                </div>
              )}
              {'missingSkills' in emp && (emp as any).missingSkills?.length > 0 && (
                <div className="text-xs text-red-400/70">
                  <span className="font-medium text-red-400">✗ </span>{(emp as any).missingSkills.join(', ')}
                </div>
              )}
              {!('matchedSkills' in emp) && (
                <div className="text-xs text-brand-muted mt-1 line-clamp-1">
                  {(emp as any).skills?.join(', ') || 'No skills listed'}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
