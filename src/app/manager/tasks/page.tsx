import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Clock } from 'lucide-react';
import StatusBadge from '@/components/tasks/StatusBadge';
import ProgressBar from '@/components/tasks/ProgressBar';
import TaskCardActions from '@/components/manager/TaskCardActions';

export default async function ManagerTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, task_assignments(profiles(name, id))')
    .order('created_at', { ascending: false });

  const { data: employees } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('role', 'employee')
    .order('name');

  // Filter by status if provided
  const activeFilter = filter || 'all';
  const filteredTasks = tasks?.filter((t: any) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'review') return t.status === 'Submitted for Review';
    if (activeFilter === 'active') return ['Not Started', 'In Progress'].includes(t.status);
    if (activeFilter === 'done') return ['Completed', 'Rejected'].includes(t.status);
    return true;
  }) || [];

  const pendingReviewCount = tasks?.filter((t: any) => t.status === 'Submitted for Review').length || 0;

  const filterTabs = [
    { key: 'all', label: 'All Tasks' },
    { key: 'review', label: `Needs Review${pendingReviewCount > 0 ? ` (${pendingReviewCount})` : ''}` },
    { key: 'active', label: 'Active' },
    { key: 'done', label: 'Done' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">All Tasks</h2>
          <p className="text-brand-muted">Manage and track all tasks across the team.</p>
        </div>
        <Link href="/manager/tasks/create"
          className="px-5 py-2.5 bg-gradient-to-r from-brand-teal to-brand-aqua text-white rounded-xl font-medium hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" /> Create Task
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', count: tasks?.length || 0, color: 'text-brand-text' },
          { label: 'In Progress', count: tasks?.filter((t: any) => t.status === 'In Progress').length || 0, color: 'text-blue-400' },
          { label: 'Needs Review', count: pendingReviewCount, color: 'text-yellow-400' },
          { label: 'Completed', count: tasks?.filter((t: any) => t.status === 'Completed').length || 0, color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl bg-brand-surface border border-brand-border text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-brand-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map(tab => (
          <Link key={tab.key} href={`/manager/tasks?filter=${tab.key}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeFilter === tab.key
                ? 'bg-brand-teal text-white'
                : 'bg-brand-surface border border-brand-border text-brand-muted hover:border-brand-teal'
            } ${tab.key === 'review' && pendingReviewCount > 0 ? 'ring-1 ring-yellow-500/50' : ''}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.map((task: any) => {
          const assignee = task.task_assignments?.[0]?.profiles;

          return (
            <div key={task.id} className="block p-5 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-teal transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h4 className="font-bold text-lg">{task.title}</h4>
                    <StatusBadge status={task.status} size="sm" />
                  </div>
                  <p className="text-sm text-brand-muted line-clamp-1 mb-3">{task.description}</p>
                  <ProgressBar value={task.progress ?? 0} showLabel={false} />
                  <div className="flex items-center gap-4 mt-2 text-xs text-brand-muted">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple text-xs font-bold">
                        {assignee ? (assignee.name || '?').charAt(0).toUpperCase() : '?'}
                      </div>
                      <span>{assignee ? (assignee.name || 'Unnamed') : 'Unassigned'}</span>
                    </div>
                    {task.deadline && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    )}
                    <span>{task.progress ?? 0}% complete</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                    task.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    task.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                    task.priority === 'medium' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  }`}>
                    {task.priority.toUpperCase()}
                  </span>
                  <div className="mt-auto">
                    <TaskCardActions task={task} employees={employees || []} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="text-center p-12 border border-dashed border-brand-border rounded-2xl text-brand-muted">
            No tasks found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}
