'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, CloudResource } from '@/lib/api';
import { Server, Search, Filter, ArrowUpRight, Cpu, HardDrive, Zap, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ResourcesListPage() {
  const [resources, setResources] = useState<CloudResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('ALL');

  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await api.getResources(serviceFilter === 'ALL' ? undefined : serviceFilter);
      setResources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [serviceFilter]);

  const filteredResources = resources.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.instance_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Cloud Resource Fleet</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitored EC2 instances, RDS databases, S3 buckets, and Lambda functions with real-time telemetry.
          </p>
        </div>

        <button
          onClick={loadResources}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-card-hover transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Sync State
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, name, or instance type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Service Type Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'EC2', 'RDS', 'S3', 'Lambda'].map((type) => (
            <button
              key={type}
              onClick={() => setServiceFilter(type)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                serviceFilter === type
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-foreground hover:bg-card-hover'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Table */}
      {loading ? (
        <div className="space-y-3 animate-pulse-slow">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-card border border-border" />
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Server className="mx-auto h-10 w-10 text-slate-500" />
          <h3 className="mt-3 text-sm font-bold text-foreground">No Resources Found</h3>
          <p className="mt-1 text-xs text-slate-400">Try adjusting your search query or service filter.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-background/50 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Resource ID & Name</th>
                  <th className="px-5 py-3.5">Service</th>
                  <th className="px-5 py-3.5">Region</th>
                  <th className="px-5 py-3.5">Provisioned Spec</th>
                  <th className="px-5 py-3.5">Avg CPU / RAM (24h)</th>
                  <th className="px-5 py-3.5">Est. Cost</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {filteredResources.map((res) => {
                  const isLowUtil = (res.avg_cpu_24h ?? 100) < 15.0 && res.service_type !== 'S3';
                  return (
                    <tr key={res.id} className="hover:bg-card-hover transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-foreground">{res.name}</div>
                        <div className="font-mono text-[11px] text-slate-400">{res.id}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-300">
                          {res.service_type}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-400">{res.region}</td>
                      <td className="px-5 py-4 font-mono font-bold text-foreground">{res.instance_type}</td>
                      <td className="px-5 py-4">
                        {res.service_type === 'S3' ? (
                          <span className="text-slate-500 font-mono">N/A (Storage)</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold ${isLowUtil ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {res.avg_cpu_24h}% CPU
                            </span>
                            <span className="text-slate-500 text-[10px]">/ {res.avg_memory_24h}% RAM</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 font-bold text-amber-400">
                        {formatCurrency(res.hourly_cost * 720)}/mo
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/resources/${res.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-card-hover transition-colors"
                        >
                          View Details
                          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
