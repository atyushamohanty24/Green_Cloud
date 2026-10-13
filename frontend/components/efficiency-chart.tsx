'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface ServiceCostData {
  service: string;
  estimated_monthly_cost: number;
}

interface EfficiencyChartProps {
  data: ServiceCostData[];
}

const COLORS = ['#10B981', '#34D399', '#F59E0B', '#06B6D4', '#8B5CF6'];

export const EfficiencyChart: React.FC<EfficiencyChartProps> = ({ data }) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Service-Level Cost Breakdown</h3>
          <p className="text-xs text-slate-400">Monthly estimated spend per AWS service</p>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
          Real-time
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1C332C" opacity={0.5} />
            <XAxis dataKey="service" stroke="#9CA3AF" fontSize={11} tickLine={false} />
            <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111C19',
                borderColor: '#1C332C',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#F3F4F6',
              }}
              formatter={(value: any) => [`$${value}`, 'Est. Cost']}
            />
            <Bar dataKey="estimated_monthly_cost" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
