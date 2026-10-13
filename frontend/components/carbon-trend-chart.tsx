'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface CarbonTrendPoint {
  hour: string;
  estimated_baseline_kg: number;
  estimated_optimized_kg: number;
}

interface CarbonTrendChartProps {
  data: CarbonTrendPoint[];
}

export const CarbonTrendChart: React.FC<CarbonTrendChartProps> = ({ data }) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">24-Hour Carbon Emission Reduction</h3>
          <p className="text-xs text-slate-400">Baseline vs. AI-Optimized hourly carbon footprint (kg CO2e)</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-slate-500" />
            <span className="text-slate-400">Baseline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400">Optimized</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64748B" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#64748B" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorOptimized" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1C332C" opacity={0.5} />
            <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={11} tickLine={false} />
            <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}kg`} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111C19',
                borderColor: '#1C332C',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#F3F4F6',
              }}
              formatter={(val: any) => [`${val} kg CO2e`, 'Emissions']}
            />
            <Area type="monotone" dataKey="estimated_baseline_kg" stroke="#64748B" fillOpacity={1} fill="url(#colorBaseline)" strokeWidth={2} />
            <Area type="monotone" dataKey="estimated_optimized_kg" stroke="#10B981" fillOpacity={1} fill="url(#colorOptimized)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
