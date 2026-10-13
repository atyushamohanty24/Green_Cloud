'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  colorScheme?: 'emerald' | 'amber' | 'cyan' | 'purple';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendUp = true,
  colorScheme = 'emerald'
}) => {
  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-glow-emerald">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{title}</span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colorMap[colorScheme]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div className="text-3xl font-extrabold tracking-tight text-foreground">{value}</div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
          }`}>
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-400 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};
