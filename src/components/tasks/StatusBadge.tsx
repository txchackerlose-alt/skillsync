import type { TaskStatus } from '@/lib/types';

const statusConfig: Record<TaskStatus, { label: string; classes: string }> = {
  'Not Started':          { label: 'Not Started',          classes: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  'In Progress':          { label: 'In Progress',           classes: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'Submitted for Review': { label: 'Submitted for Review',  classes: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  'Completed':            { label: 'Completed',             classes: 'bg-green-500/20 text-green-400 border-green-500/30' },
  'Rejected':             { label: 'Rejected',              classes: 'bg-red-500/20 text-red-400 border-red-500/30' },
  'Overdue':              { label: 'Overdue',               classes: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
};

export default function StatusBadge({ status, size = 'md' }: { status: string; size?: 'sm' | 'md' }) {
  const config = statusConfig[status as TaskStatus] ?? {
    label: status,
    classes: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${sizeClass} ${config.classes}`}>
      {config.label}
    </span>
  );
}
