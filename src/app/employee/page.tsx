import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CheckCircle2, Clock, PlayCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { AnimatedStatCard } from '@/components/dashboard/AnimatedStatCard';
import { HorizontalBar } from '@/components/dashboard/TaskBarChart';
import StatusBadge from '@/components/tasks/StatusBadge';
import ProgressBar from '@/components/tasks/ProgressBar';

export default async function EmployeeDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const { data: assignments } = await supabase
    .from('task_assignments')
    .select('*, tasks(*)')
    .eq('employee_id', user.id);

  const tasks = assignments?.map((a: any) => a.tasks).filter(Boolean) || [];

  const completed  = tasks.filter((t: any) => t.status === 'Completed').length;
  const inProgress = tasks.filter((t: any) => t.status === 'In Progress').length;
  const notStarted = tasks.filter((t: any) => t.status === 'Not Started').length;
  const inReview   = tasks.filter((t: any) => t.status === 'Submitted for Review').length;
  const totalTasks = tasks.length;

  const completionPct = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  // Sort: active first
  const sortedTasks = [...tasks].sort((a: any, b: any) => {
    const order: Record<string, number> = {
      'Rejected': 0, 'In Progress': 1, 'Not Started': 2,
      'Submitted for Review': 3, 'Completed': 4,
    };
    return (order[a.status] ?? 5) - (order[b.status] ?? 5);
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="animate-fade-in-up">
        <h2 className="text-3xl font-bold mb-1">Welcome back, {profile?.name || 'Employee'} 👋</h2>
        <p className="text-brand-muted">Here's an overview of your tasks and progress.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <AnimatedStatCard
          icon={<Clock className="w-7 h-7" />}
          label="Not Started" value={notStarted}
          color="brand-violet" bgColor="brand-purple/20" delay="delay-100"
        />
        <AnimatedStatCard
          icon={<PlayCircle className="w-7 h-7" />}
          label="In Progress" value={inProgress}
          color="brand-teal" bgColor="brand-teal/20" delay="delay-200"
        />
        <AnimatedStatCard
          icon={<TrendingUp className="w-7 h-7" />}
          label="In Review" value={inReview}
          color="brand-aqua" bgColor="brand-aqua/20" delay="delay-300"
        />
        <AnimatedStatCard
          icon={<CheckCircle2 className="w-7 h-7" />}
          label="Completed" value={completed}
          color="brand-teal" bgColor="brand-teal/20" delay="delay-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Progress */}
        <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-5 animate-fade-in-up delay-200">
          <h3 className="text-lg font-bold">Overall Completion</h3>

          {/* Big ring-style progress indicator */}
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle
                  cx="48" cy="48" r="38" fill="none"
                  stroke="url(#grad)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - completionPct / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0d9488" />
                    <stop offset="100%" stopColor="#2dd4bf" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-brand-teal">{completionPct}%</span>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              <div className="text-sm text-brand-muted">{completed} of {totalTasks} tasks done</div>
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="space-y-3 pt-2 border-t border-brand-border">
            <HorizontalBar label="In Progress"  value={inProgress} max={totalTasks} color="from-brand-teal to-brand-aqua"   delay={100} />
            <HorizontalBar label="In Review"    value={inReview}   max={totalTasks} color="from-yellow-500 to-amber-400"    delay={200} />
            <HorizontalBar label="Completed"    value={completed}  max={totalTasks} color="from-green-500 to-emerald-400"   delay={300} />
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="lg:col-span-2 animate-fade-in-up delay-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Active Tasks</h3>
            <Link href="/employee/tasks" className="text-brand-teal hover:text-brand-aqua text-sm font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {sortedTasks.slice(0, 5).map((task: any, i: number) => (
              <Link
                key={task.id}
                href={`/employee/tasks/${task.id}`}
                className={`block p-4 rounded-2xl bg-brand-surface/60 border border-brand-border hover:border-brand-teal transition-all animate-fade-in-up`}
                style={{ animationDelay: `${400 + i * 80}ms` }}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="font-semibold text-sm line-clamp-1">{task.title}</span>
                  <StatusBadge status={task.status} size="sm" />
                </div>
                <ProgressBar value={task.progress ?? 0} showLabel={false} />
                <div className="flex items-center justify-between mt-2 text-xs text-brand-muted">
                  <span>{task.progress ?? 0}% complete</span>
                  {task.deadline && <span>Due {new Date(task.deadline).toLocaleDateString()}</span>}
                </div>
              </Link>
            ))}
            {sortedTasks.length === 0 && (
              <div className="text-center p-10 border border-dashed border-brand-border rounded-2xl text-brand-muted">
                No assigned tasks yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
