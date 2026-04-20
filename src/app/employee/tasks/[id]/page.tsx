import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import StatusBadge from '@/components/tasks/StatusBadge';
import ProgressBar from '@/components/tasks/ProgressBar';
import CommentThread from '@/components/tasks/CommentThread';
import TaskWorkspace from './TaskWorkspace';
import type { TaskComment, TaskFile } from '@/lib/types';

function isOverdue(deadline?: string, status?: string) {
  if (!deadline || status === 'Completed') return false;
  return new Date(deadline) < new Date();
}

export default async function EmployeeTaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: task } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();

  if (!task) notFound();

  // Verify this task is assigned to the employee
  const { data: assignment } = await supabase
    .from('task_assignments')
    .select('employee_id')
    .eq('task_id', id)
    .eq('employee_id', user.id)
    .single();

  if (!assignment) redirect('/employee/tasks');

  // Fetch comments with profiles
  const { data: comments } = await supabase
    .from('task_comments')
    .select('*, profiles(name)')
    .eq('task_id', id)
    .order('created_at', { ascending: true });

  // Fetch files
  const { data: files } = await supabase
    .from('task_files')
    .select('*')
    .eq('task_id', id)
    .order('created_at', { ascending: false });

  // Fetch timeline updates
  const { data: updates } = await supabase
    .from('task_updates')
    .select('*, profiles(name)')
    .eq('task_id', id)
    .order('created_at', { ascending: false });

  const overdue = isOverdue(task.deadline, task.status);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/employee/tasks" className="p-2 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-teal transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{task.title}</h1>
            <StatusBadge status={overdue && task.status !== 'Completed' ? 'Overdue' : task.status} />
          </div>
          {task.deadline && (
            <div className={`flex items-center gap-1.5 text-sm mt-1 ${overdue ? 'text-orange-400' : 'text-brand-muted'}`}>
              {overdue && <AlertTriangle className="w-4 h-4" />}
              Due: {new Date(task.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              {overdue && ' (Overdue)'}
            </div>
          )}
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
          task.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
          task.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
          task.priority === 'medium' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
          'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }`}>
          {task.priority.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Task Info + Workspace */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h3 className="font-bold text-lg mb-3">Description</h3>
            <p className="text-brand-text/80 whitespace-pre-line text-sm leading-relaxed">
              {task.description || 'No description provided.'}
            </p>
            {task.required_skills && task.required_skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-brand-border">
                {task.required_skills.map((s: string, i: number) => (
                  <span key={i} className="px-2 py-1 text-xs rounded-lg bg-brand-bg border border-brand-border">{s}</span>
                ))}
              </div>
            )}
          </div>

          {/* Progress + Actions */}
          <TaskWorkspace task={task} files={files || []} />

          {/* Comments */}
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <CommentThread
              taskId={task.id}
              comments={(comments || []) as TaskComment[]}
              currentUserId={user.id}
            />
          </div>
        </div>

        {/* Right — Timeline */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h3 className="font-bold text-lg mb-4">Progress Timeline</h3>
            <div className="space-y-4">
              {(updates || []).map((u: any, i: number) => (
                <div key={u.id} className="relative pl-6">
                  <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-brand-teal border-2 border-brand-bg" />
                  {i < (updates || []).length - 1 && (
                    <div className="absolute left-1.5 top-4 w-px h-full bg-brand-border" />
                  )}
                  <div className="text-sm font-bold text-brand-teal">{u.progress}% complete</div>
                  {u.note && <p className="text-xs text-brand-muted mt-0.5">{u.note}</p>}
                  <p className="text-xs text-brand-muted/60 mt-0.5">
                    {new Date(u.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {(!updates || updates.length === 0) && (
                <p className="text-sm text-brand-muted italic">No progress updates yet.</p>
              )}
            </div>
          </div>

          {/* Overview stats */}
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-3">
            <h3 className="font-bold text-lg">Overview</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-brand-muted">Status</span>
                <StatusBadge status={task.status} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Progress</span>
                <span className="font-bold">{task.progress ?? 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Comments</span>
                <span className="font-bold">{comments?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Files</span>
                <span className="font-bold">{files?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
