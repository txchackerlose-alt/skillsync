import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, User } from 'lucide-react';
import StatusBadge from '@/components/tasks/StatusBadge';
import ProgressBar from '@/components/tasks/ProgressBar';
import CommentThread from '@/components/tasks/CommentThread';
import ReviewForm from './ReviewForm';
import TaskDetailActions from './TaskDetailActions';
import type { TaskComment, TaskFile } from '@/lib/types';

export default async function ManagerTaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Fetch assigned employee
  const { data: assignment } = await supabase
    .from('task_assignments')
    .select('employee_id, profiles(name, email, dept)')
    .eq('task_id', id)
    .single();

  // Fetch comments
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

  // Fetch timeline
  const { data: updates } = await supabase
    .from('task_updates')
    .select('*, profiles(name)')
    .eq('task_id', id)
    .order('created_at', { ascending: false });

  // Fetch employees for Edit Modal
  const { data: employees } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('role', 'employee')
    .order('name');

  const employee = (assignment as any)?.profiles;
  const isPendingReview = task.status === 'Submitted for Review';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/manager/tasks" className="p-2 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-teal transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{task.title}</h1>
            <StatusBadge status={task.status} />
          </div>
          {task.deadline && (
            <div className="text-sm text-brand-muted mt-1">
              Due: {new Date(task.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
            task.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
            task.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
            task.priority === 'medium' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
            'bg-gray-500/20 text-gray-400 border-gray-500/30'
          }`}>
            {task.priority.toUpperCase()}
          </span>
          <TaskDetailActions task={task} employees={employees || []} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Details + Review */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <h3 className="font-bold text-lg mb-3">Task Description</h3>
            <p className="text-brand-text/80 text-sm leading-relaxed whitespace-pre-line">
              {task.description || 'No description.'}
            </p>
            {task.required_skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-brand-border">
                {task.required_skills.map((s: string, i: number) => (
                  <span key={i} className="px-2 py-1 text-xs rounded-lg bg-brand-bg border border-brand-border">{s}</span>
                ))}
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
            <h3 className="font-bold text-lg">Employee Progress</h3>
            <ProgressBar value={task.progress ?? 0} />
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {(updates || []).map((u: any) => (
                <div key={u.id} className="flex items-start gap-3 text-sm">
                  <span className="text-brand-teal font-bold shrink-0">{u.progress}%</span>
                  <p className="text-brand-muted">{u.note || 'Progress updated'}</p>
                  <span className="text-xs text-brand-muted/60 ml-auto shrink-0">
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {!updates?.length && <p className="text-sm text-brand-muted italic">No progress updates yet.</p>}
            </div>
          </div>

          {/* Review Panel */}
          {isPendingReview && (
            <div className="p-6 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 space-y-4">
              <h3 className="font-bold text-lg text-yellow-400">⏳ Submitted for Review</h3>
              <p className="text-sm text-brand-muted">This task has been submitted by the employee. Review their work and approve or reject below.</p>
              <ReviewForm taskId={task.id} />
            </div>
          )}

          {task.manager_feedback && !isPendingReview && (
            <div className={`p-6 rounded-2xl border ${
              task.review_status === 'Approved'
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <h3 className={`font-bold mb-2 ${task.review_status === 'Approved' ? 'text-green-400' : 'text-red-400'}`}>
                {task.review_status === 'Approved' ? '✓ Task Approved' : '✗ Task Rejected'}
              </h3>
              <p className="text-sm text-brand-text/80">{task.manager_feedback}</p>
            </div>
          )}

          {/* Comments */}
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border">
            <CommentThread
              taskId={task.id}
              comments={(comments || []) as TaskComment[]}
              currentUserId={user.id}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Assigned Employee */}
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
            <h3 className="font-bold text-lg">Assigned To</h3>
            {employee ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple to-brand-teal flex items-center justify-center text-white font-bold">
                  {(employee.name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{employee.name || 'Unnamed'}</div>
                  <div className="text-sm text-brand-muted">{employee.dept || 'No dept'}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-brand-muted">
                <User className="w-5 h-5" /> Unassigned
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-3">
            <h3 className="font-bold text-lg">Attachments</h3>
            {(files || []).map((f: any) => (
              <a key={f.id} href={f.file_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-xl bg-brand-bg border border-brand-border hover:border-brand-teal text-sm transition-colors">
                <FileText className="w-4 h-4 text-brand-muted" />
                {f.file_name}
              </a>
            ))}
            {!files?.length && <p className="text-sm text-brand-muted italic">No attachments.</p>}
          </div>

          {/* Stats */}
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-3">
            <h3 className="font-bold text-lg">Stats</h3>
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
              {task.completed_at && (
                <div className="flex justify-between">
                  <span className="text-brand-muted">Completed</span>
                  <span className="font-bold">{new Date(task.completed_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
