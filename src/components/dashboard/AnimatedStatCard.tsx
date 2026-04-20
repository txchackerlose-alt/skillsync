'use client';

import { useEffect, useRef, useState } from 'react';

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let start = 0;
    const steps = 40;
    const increment = target / steps;
    const delay = duration / steps;

    const tick = () => {
      start += increment;
      if (start >= target) {
        setValue(target);
        return;
      }
      setValue(Math.floor(start));
      ref.current = setTimeout(tick, delay);
    };

    setValue(0);
    ref.current = setTimeout(tick, 80);
    return () => { if (ref.current) clearTimeout(ref.current); };
  }, [target, duration]);

  return value;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;          // e.g. 'brand-purple'
  bgColor: string;        // e.g. 'brand-purple/20'
  suffix?: string;
  delay?: string;         // CSS delay class e.g. 'delay-100'
}

export function AnimatedStatCard({ icon, label, value, color, bgColor, suffix = '', delay = '' }: StatCardProps) {
  const count = useCountUp(value);

  return (
    <div className={`animate-fade-in-up ${delay} p-6 rounded-2xl bg-brand-surface border border-brand-border flex items-center gap-4 hover:border-opacity-50 transition-all group`}>
      <div className={`p-4 bg-${bgColor} text-${color} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div>
        <div className={`text-3xl font-bold text-${color}`} style={{ animation: 'countUp 0.6s ease both' }}>
          {count}{suffix}
        </div>
        <div className="text-brand-muted text-sm font-medium uppercase tracking-wider mt-0.5">{label}</div>
      </div>
    </div>
  );
}
