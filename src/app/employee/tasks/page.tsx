import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import StatusBadge from '@/components/tasks/StatusBadge';
import ProgressBar from '@/components/tasks/ProgressBar';

function isOverdue(deadline?: string, status?: string) {
  if (!deadline || status === 'Completed') return false;
  return new Date(deadline) < new Date();
}

export default async function EmployeeTasksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: assignments } = await supabase
    .from('task_assignments')
    .select('*, tasks(*)')
    .eq('employee_id', user.id);

  const tasks = assignments?.map((a: any) => a.tasks).filter(Boolean) || [];

  const filterGroups = [
    { label: 'All', statuses: null },
    { label: 'Active', statuses: ['Not Started', 'In Progress', 'Rejected'] },
    { label: 'In Review', statuses: ['Submitted for Review'] },
    { label: 'Done', statuses: ['Completed'] },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">My Tasks</h2>
        <p className="text-brand-muted">View and update the status of your assigned tasks.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', count: tasks.length, color: 'text-brand-text' },
          { label: 'In Progress', count: tasks.filter((t: any) => t.status === 'In Progress').length, color: 'text-blue-400' },
          { label: 'In Review', count: tasks.filter((t: any) => t.status === 'Submitted for Review').length, color: 'text-yellow-400' },
          { label: 'Completed', count: tasks.filter((t: any) => t.status === 'Completed').length, color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl bg-brand-surface border border-brand-border text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-brand-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Task Cards */}
      <div className="space-y-4">
        {tasks.map((task: any) => {
          const overdue = isOverdue(task.deadline, task.status);
          const effectiveStatus = overdue ? 'Overdue' : task.status;

          return (
            <Link key={task.id} href={`/employee/tasks/${task.id}`}
              className="block p-5 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-teal transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h4 className="font-bold text-lg">{task.title}</h4>
                    <StatusBadge status={effectiveStatus} size="sm" />
                    {overdue && <AlertTriangle className="w-4 h-4 text-orange-400" />}
                  </div>
                  <p className="text-sm text-brand-muted line-clamp-2 mb-3">{task.description}</p>
                  <ProgressBar value={task.progress ?? 0} showLabel={false} />
                  <div className="flex items-center gap-4 mt-2 text-xs text-brand-muted">
                    <span>{task.progress ?? 0}% complete</span>
                    {task.deadline && (
                      <span className={overdue ? 'text-orange-400' : ''}>
                        Due {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                    task.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    task.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                    task.priority === 'medium' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  }`}>
                    {task.priority.toUpperCase()}
                  </span>
                  <ChevronRight className="w-5 h-5 text-brand-muted group-hover:text-brand-teal transition-colors mt-auto" />
                </div>
              </div>
            </Link>
          );
        })}

        {tasks.length === 0 && (
          <div className="text-center p-12 border border-dashed border-brand-border rounded-2xl text-brand-muted">
            You don't have any assigned tasks right now.
          </div>
        )}
      </div>
    </div>
  );
}
