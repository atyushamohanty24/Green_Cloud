'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, CloudResource, MetricPoint } from '@/lib/api';
import { ArrowLeft, Server, Cpu, HardDrive, Zap, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/utils';

export default function ResourceDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [resource, setResource] = useState<CloudResource | null>(null);
  const [metrics, setMetrics] = useState<MetricPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [resData, metricData] = await Promise.all([
          api.getResourceById(id),
          api.getMetrics(id, 168),
        ]);
        setResource(resData);
        setMetrics(metricData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse-slow">
        <div className="h-24 rounded-2xl bg-card border border-border" />
        <div className="h-96 rounded-2xl bg-card border border-border" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <Server className="mx-auto h-10 w-10 text-slate-500" />
        <h3 className="mt-3 text-sm font-bold text-foreground">Resource Not Found</h3>
        <p className="mt-1 text-xs text-slate-400">The requested resource ID `{id}` does not exist.</p>
        <Link href="/resources" className="mt-4 inline-block text-xs font-bold text-emerald-400 hover:underline">
          Return to Resources List
        </Link>
      </div>
    );
  }

  const chartData = metrics.map((m) => ({
    time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cpu: m.cpu_utilization,
    memory: m.memory_utilization,
  }));

  return (
    <div className="space-y-6">
      
      {/* Back Link */}
      <Link href="/resources" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Fleet Overview
      </Link>

      {/* Header Info Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-400">
              {resource.service_type}
            </span>
            <span className="font-mono text-xs text-slate-400">{resource.id}</span>
          </div>
          <h1 className="text-2xl font-black text-foreground mt-1">{resource.name}</h1>
          <p className="text-xs text-slate-400 mt-1">Region: {resource.region} • Baseline Spec: {resource.instance_type}</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">ESTIMATED Hourly Spend</div>
            <div className="text-lg font-extrabold text-amber-400">${resource.hourly_cost}/hr</div>
            <div className="text-[11px] text-slate-500">{formatCurrency(resource.hourly_cost * 720)}/mo</div>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">ESTIMATED Hourly Carbon</div>
            <div className="text-lg font-extrabold text-emerald-400">{resource.carbon_footprint_hourly} g CO2e</div>
          </div>
        </div>
      </div>

      {/* Utilization History Chart */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-foreground">7-Day Telemetry History</h2>
            <p className="text-xs text-slate-400">Hourly CPU and Memory utilization percentages</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-400">CPU %</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
              <span className="text-cyan-400">RAM %</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C332C" opacity={0.5} />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={11} tickLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111C19',
                  borderColor: '#1C332C',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#F3F4F6',
                }}
              />
              <Line type="monotone" dataKey="cpu" stroke="#10B981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="memory" stroke="#06B6D4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
