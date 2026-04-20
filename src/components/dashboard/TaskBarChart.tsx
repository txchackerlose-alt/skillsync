'use client';

import { useEffect, useRef } from 'react';

interface Bar {
  label: string;
  value: number;
  color: string; // Tailwind gradient classes
}

interface TaskBarChartProps {
  bars: Bar[];
  maxValue?: number;
}

export function TaskBarChart({ bars, maxValue }: TaskBarChartProps) {
  const max = maxValue ?? Math.max(...bars.map(b => b.value), 1);

  return (
    <div className="flex items-end justify-around gap-3 h-40 px-2">
      {bars.map((bar, i) => {
        const pct = Math.round((bar.value / max) * 100);
        const delay = i * 100;

        return (
          <div key={bar.label} className="flex flex-col items-center gap-2 flex-1 h-full">
            <span className="text-xs font-bold text-brand-muted">{bar.value}</span>
            <div className="flex-1 w-full flex items-end">
              <div
                className={`w-full rounded-t-lg bg-gradient-to-t ${bar.color} opacity-90 transition-all duration-700`}
                style={{
                  height: `${pct}%`,
                  animation: `growBarHeight 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms both`,
                }}
              />
            </div>
            <span className="text-xs text-brand-muted text-center leading-tight">{bar.label}</span>
          </div>
        );
      })}
    </div>
  );
}

interface HorizontalBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  delay?: number;
}

export function HorizontalBar({ label, value, max, color, delay = 0 }: HorizontalBarProps) {
  const pct = Math.round((value / Math.max(max, 1)) * 100);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const timer = setTimeout(() => {
      el.style.width = `${pct}%`;
    }, delay + 100);
    return () => clearTimeout(timer);
  }, [pct, delay]);

  return (
    <div className={`animate-fade-in-up`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-brand-muted">{label}</span>
        <span className="text-sm font-bold">{value}</span>
      </div>
      <div className="w-full h-2.5 bg-brand-bg rounded-full overflow-hidden">
        <div
          ref={barRef}
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700 ease-out`}
          style={{ width: '0%' }}
        />
      </div>
    </div>
  );
}
