import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Briefcase, Users, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { AnimatedStatCard } from '@/components/dashboard/AnimatedStatCard';
import { TaskBarChart, HorizontalBar } from '@/components/dashboard/TaskBarChart';
import StatusBadge from '@/components/tasks/StatusBadge';
import ProgressBar from '@/components/tasks/ProgressBar';

export default async function ManagerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const { data: employees } = await supabase
    .from('profiles')
    .select(`id, name, dept, email, employee_skills(skill)`)
    .eq('role', 'employee');
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, task_assignments(profiles(name))')
    .order('created_at', { ascending: false });

  const totalEmployees = employees?.length || 0;
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter((t: any) => t.status === 'Completed').length || 0;
  const inProgressTasks = tasks?.filter((t: any) => t.status === 'In Progress').length || 0;
  const pendingReview = tasks?.filter((t: any) => t.status === 'Submitted for Review').length || 0;

  // Bar chart data — task counts by status
  const barData = [
    { label: 'Not Started',  value: tasks?.filter((t: any) => t.status === 'Not Started').length || 0,  color: 'from-gray-600 to-gray-500' },
    { label: 'In Progress',  value: inProgressTasks,  color: 'from-blue-600 to-cyan-500' },
    { label: 'In Review',    value: pendingReview,     color: 'from-yellow-600 to-amber-400' },
    { label: 'Completed',    value: completedTasks,    color: 'from-green-600 to-emerald-400' },
    { label: 'Rejected',     value: tasks?.filter((t: any) => t.status === 'Rejected').length || 0,     color: 'from-red-600 to-rose-500' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h2 className="text-3xl font-bold mb-1">Manager Dashboard</h2>
          <p className="text-brand-muted">Welcome back, {profile?.name || 'Manager'}. Here's your team overview.</p>
        </div>
        <Link href="/manager/tasks/create"
          className="px-6 py-3 bg-gradient-to-r from-brand-teal to-brand-aqua text-white rounded-xl font-medium hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all animate-pulse-glow">
          + Create Task
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <AnimatedStatCard
          icon={<Users className="w-7 h-7" />}
          label="Employees" value={totalEmployees}
          color="brand-violet" bgColor="brand-purple/20" delay="delay-100"
        />
        <AnimatedStatCard
          icon={<Briefcase className="w-7 h-7" />}
          label="Total Tasks" value={totalTasks}
          color="brand-teal" bgColor="brand-teal/20" delay="delay-200"
        />
        <AnimatedStatCard
          icon={<Clock className="w-7 h-7" />}
          label="Needs Review" value={pendingReview}
          color="brand-aqua" bgColor="brand-aqua/20" delay="delay-300"
        />
        <AnimatedStatCard
          icon={<CheckCircle2 className="w-7 h-7" />}
          label="Completed" value={completedTasks}
          color="brand-teal" bgColor="brand-teal/20" delay="delay-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4 animate-fade-in-up delay-200">
          <h3 className="text-lg font-bold">Task Status Breakdown</h3>
          <TaskBarChart bars={barData} />
          <div className="pt-4 border-t border-brand-border space-y-3">
            <HorizontalBar label="Completion Rate" value={completedTasks} max={totalTasks} color="from-green-500 to-emerald-400" delay={300} />
            <HorizontalBar label="In Progress"     value={inProgressTasks} max={totalTasks} color="from-brand-teal to-brand-aqua" delay={400} />
            <HorizontalBar label="Pending Review"  value={pendingReview}   max={totalTasks} color="from-yellow-500 to-amber-400" delay={500} />
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="lg:col-span-2 space-y-4 animate-fade-in-up delay-300">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Recent Tasks</h3>
            <Link href="/manager/tasks" className="text-brand-teal hover:text-brand-aqua text-sm font-medium">View All →</Link>
          </div>
          <div className="space-y-3">
            {tasks?.slice(0, 5).map((task: any, i: number) => {
              const assignee = task.task_assignments?.[0]?.profiles;
              return (
                <Link
                  key={task.id}
                  href={`/manager/tasks/${task.id}`}
                  className="block p-4 rounded-2xl bg-brand-surface/60 border border-brand-border hover:border-brand-teal transition-all animate-fade-in-up"
                  style={{ animationDelay: `${400 + i * 80}ms` }}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-brand-purple/20 text-brand-purple font-bold text-xs flex items-center justify-center shrink-0">
                        {assignee ? (assignee.name || '?').charAt(0).toUpperCase() : '?'}
                      </div>
                      <span className="font-semibold text-sm line-clamp-1">{task.title}</span>
                    </div>
                    <StatusBadge status={task.status} size="sm" />
                  </div>
                  <ProgressBar value={task.progress ?? 0} showLabel={false} />
                  <div className="flex items-center justify-between mt-2 text-xs text-brand-muted">
                    <span>{assignee ? assignee.name : 'Unassigned'}</span>
                    <span>{task.progress ?? 0}% complete</span>
                  </div>
                </Link>
              );
            })}
            {!tasks?.length && (
              <div className="text-center p-10 border border-dashed border-brand-border rounded-2xl text-brand-muted">
                No tasks created yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Members Preview */}
      <div className="animate-fade-in-up delay-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Team Members</h3>
          <Link href="/manager/employees" className="text-brand-teal hover:text-brand-aqua text-sm font-medium">View All →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {employees?.slice(0, 4).map((emp: any, i: number) => {
            const skills = emp.employee_skills?.map((es: any) => es.skill) || [];
            return (
              <div
                key={emp.id}
                className="p-5 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-teal transition-all animate-scale-in"
                style={{ animationDelay: `${600 + i * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-purple to-brand-teal flex items-center justify-center text-white font-bold text-lg mb-3">
                  {(emp.name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="font-semibold text-sm">{emp.name || 'Unnamed'}</div>
                <div className="text-xs text-brand-teal mb-2">{emp.dept || 'No dept'}</div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {skills.slice(0, 2).map((s: string, j: number) => (
                      <span key={j} className="px-1.5 py-0.5 text-xs rounded bg-brand-bg border border-brand-border text-brand-muted">{s}</span>
                    ))}
                    {skills.length > 2 && (
                      <span className="px-1.5 py-0.5 text-xs rounded bg-brand-bg border border-brand-border text-brand-muted">+{skills.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
