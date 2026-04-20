export default function ProgressBar({ value, showLabel = true }: { value: number; showLabel?: boolean }) {
  const pct = Math.min(100, Math.max(0, value));

  const color =
    pct >= 100 ? 'from-green-500 to-emerald-400' :
    pct >= 60  ? 'from-brand-teal to-brand-aqua' :
    pct >= 30  ? 'from-blue-500 to-cyan-400' :
    'from-gray-500 to-gray-400';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-brand-muted font-medium">Progress</span>
          <span className="text-xs font-bold text-brand-text">{pct}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-brand-bg rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
