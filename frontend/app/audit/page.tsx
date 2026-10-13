'use client';

import React, { useState, useEffect } from 'react';
import { api, AuditData } from '@/lib/api';
import { ShieldCheck, History, RotateCcw, AlertTriangle, CheckCircle2, User, Clock, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AuditPage() {
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rollbackMsg, setRollbackMsg] = useState<string | null>(null);

  const loadAuditData = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs();
      setAuditData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditData();
  }, []);

  const handleTriggerRollback = async (actionId: number) => {
    setLoading(true);
    try {
      const res = await api.rollbackAction(actionId, "Manual simulated post-action latency regression test");
      setRollbackMsg(res.message);
      await loadAuditData();
    } catch (err: any) {
      setRollbackMsg(`Rollback error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Governance Audit & Activity Trail</h1>
          <p className="text-xs text-slate-400 mt-1">
            Timestamped governance log of all optimization decisions, approvals, execution snapshots, and rollback events.
          </p>
        </div>

        <button
          onClick={loadAuditData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-card-hover transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Log
        </button>
      </div>

      {rollbackMsg && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-400 font-semibold flex items-center justify-between">
          <span>{rollbackMsg}</span>
          <button onClick={() => setRollbackMsg(null)} className="text-slate-400 hover:text-foreground">Dismiss</button>
        </div>
      )}

      {/* Action Execution History with Before / After Snapshots */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <History className="h-4 w-4 text-emerald-400" />
          Action Execution History & Snapshots
        </h2>

        {loading ? (
          <div className="space-y-3 animate-pulse-slow">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 rounded-2xl bg-card border border-border" />
            ))}
          </div>
        ) : !auditData?.action_history.length ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-xs text-slate-400">
            No executed actions logged yet. Execute an action from the Action Hub to view before/after snapshots.
          </div>
        ) : (
          <div className="space-y-4">
            {auditData.action_history.map((act) => {
              const isRolledBack = act.status === 'Rolled Back';
              return (
                <div
                  key={act.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    isRolledBack ? 'border-red-500/30 bg-red-950/10' : 'border-border bg-card'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        isRolledBack
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {act.status}
                      </span>
                      <span className="font-mono text-xs font-bold text-foreground">Action #{act.id} • {act.action_type}</span>
                      <span className="text-xs text-slate-400">Target: {act.resource_id}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-cyan-400" />
                        Role: {act.user_role}
                      </span>
                      <span className="text-slate-500 font-mono">
                        {new Date(act.executed_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Before / After Snapshot Details */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-border bg-background/50 p-3 text-xs">
                      <div className="font-bold text-slate-400 mb-1">BEFORE Snapshot</div>
                      <div className="space-y-1 font-mono text-[11px] text-slate-300">
                        <div>Instance Type: {act.before_snapshot?.instance_type || 'N/A'}</div>
                        <div>Status: {act.before_snapshot?.status || 'running'}</div>
                        <div>Est. Cost: ${act.before_snapshot?.hourly_cost}/hr</div>
                        <div>CPU Utilization: {act.before_snapshot?.latest_cpu}%</div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-background/50 p-3 text-xs">
                      <div className="font-bold text-emerald-400 mb-1">AFTER Snapshot (Optimized)</div>
                      <div className="space-y-1 font-mono text-[11px] text-slate-300">
                        <div>Instance Type: {act.after_snapshot?.instance_type || 'N/A'}</div>
                        <div>Status: {act.after_snapshot?.status || 'optimized'}</div>
                        <div>Est. Cost: ${act.after_snapshot?.hourly_cost}/hr</div>
                        <div>AWS Response: OK 200</div>
                      </div>
                    </div>
                  </div>

                  {/* Rollback Trigger Button */}
                  {!isRolledBack && (
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleTriggerRollback(act.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Simulate Post-Action Rollback
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-cyan-400" />
          Chronological Audit Event Stream
        </h2>

        {loading ? (
          <div className="h-48 rounded-xl bg-card border border-border animate-pulse-slow" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-background/50 text-slate-400 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Event Type</th>
                  <th className="px-4 py-3">Actor / Role</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {auditData?.audit_events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-card-hover transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-emerald-400">{evt.event_type}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-cyan-400">{evt.actor}</td>
                    <td className="px-4 py-3 text-slate-300">{evt.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
