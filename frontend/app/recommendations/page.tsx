'use client';

import React, { useState, useEffect } from 'react';
import { api, Recommendation } from '@/lib/api';
import { RecommendationCard } from '@/components/recommendation-card';
import { ShieldCheck, AlertTriangle, Filter, CheckCircle2, Play, RefreshCw, Zap } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function RecommendationsPage() {
  const currentRole = 'admin';
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const data = await api.getRecommendations();
      setRecommendations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleApprove = async (id: number) => {
    await api.approveRecommendation(id, currentRole);
    await loadRecommendations();
  };

  const handleExecute = async (id: number) => {
    await api.executeRecommendation(id, currentRole);
    await loadRecommendations();
  };

  const filteredRecs = recommendations.filter((r) => {
    if (riskFilter !== 'ALL' && r.risk_level !== riskFilter) return false;
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    return true;
  });

  const pendingCount = recommendations.filter((r) => r.status === 'Pending').length;
  const highRiskPending = recommendations.filter((r) => r.risk_level === 'High' && r.status === 'Pending').length;
  const totalPotentialSavings = recommendations
    .filter((r) => r.status in ['Pending', 'Approved'])
    .reduce((sum, r) => sum + r.estimated_savings_monthly, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Action Hub & Recommendations Queue</h1>
          <p className="text-xs text-slate-400 mt-1">
            Governance pipeline classifying rightsizing, lifecycle, and scale actions by risk level.
          </p>
        </div>

        <button
          onClick={loadRecommendations}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-card-hover transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Rescan Rules
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase">Pending Recommendations</div>
          <div className="text-2xl font-extrabold text-foreground mt-1">{pendingCount} Actionable</div>
          <div className="text-xs text-amber-400 mt-0.5">{highRiskPending} require admin approval</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase">ESTIMATED Potential Monthly Savings</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">{formatCurrency(totalPotentialSavings)}/mo</div>
          <div className="text-xs text-slate-400 mt-0.5">Upon full queue execution</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase">Current Governance Role</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 capitalize">{currentRole}</div>
          <div className="text-xs text-slate-400 mt-0.5">
            {currentRole === 'admin' ? 'Can approve & execute all actions' : 'Low-risk actions only'}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border">
        {/* Risk Level Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            Risk Level:
          </span>
          {['ALL', 'Low', 'High'].map((risk) => (
            <button
              key={risk}
              onClick={() => setRiskFilter(risk)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                riskFilter === risk
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-foreground hover:bg-card-hover'
              }`}
            >
              {risk === 'ALL' ? 'All Risks' : `${risk} Risk`}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Status:</span>
          {['ALL', 'Pending', 'Approved', 'Executed', 'Rolled Back'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === st
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-foreground hover:bg-card-hover'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Queue Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse-slow">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-card border border-border" />
          ))}
        </div>
      ) : filteredRecs.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-emerald-400" />
          <h3 className="mt-3 text-sm font-bold text-foreground">No Matching Recommendations</h3>
          <p className="mt-1 text-xs text-slate-400">No items match your selected risk level or status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecs.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              currentRole={currentRole}
              onApprove={handleApprove}
              onExecute={handleExecute}
            />
          ))}
        </div>
      )}

    </div>
  );
}
