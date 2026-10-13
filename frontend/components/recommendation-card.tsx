'use client';

import React, { useState } from 'react';
import { Recommendation } from '@/lib/api';
import { ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2, Play, DollarSign, Leaf, Zap, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface RecommendationCardProps {
  recommendation: Recommendation;
  currentRole: string;
  onApprove: (id: number) => void;
  onExecute: (id: number) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  currentRole,
  onApprove,
  onExecute
}) => {
  const [loading, setLoading] = useState(false);
  const isHighRisk = recommendation.risk_level === 'High';
  const isPending = recommendation.status === 'Pending';
  const isApproved = recommendation.status === 'Approved';
  const isExecuted = recommendation.status === 'Executed';
  const isRolledBack = recommendation.status === 'Rolled Back';

  // Permission checks
  const canApprove = isPending && (currentRole === 'admin' || (currentRole === 'operator' && !isHighRisk));
  const canExecute = (isApproved || (!isHighRisk && isPending)) && (currentRole === 'admin' || currentRole === 'operator');

  const handleApprove = async () => {
    setLoading(true);
    await onApprove(recommendation.id);
    setLoading(false);
  };

  const handleExecute = async () => {
    setLoading(true);
    await onExecute(recommendation.id);
    setLoading(false);
  };

  return (
    <div className={`relative rounded-2xl border p-5 transition-all ${
      isExecuted
        ? 'border-emerald-500/30 bg-emerald-950/10'
        : isRolledBack
        ? 'border-red-500/30 bg-red-950/10'
        : isHighRisk
        ? 'border-amber-500/30 bg-card hover:border-amber-500/50'
        : 'border-border bg-card hover:border-emerald-500/30'
    }`}>
      {/* Header Badge Strip */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Risk Badge with Icon + Text */}
          {isHighRisk ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/20">
              <AlertTriangle className="h-3.5 w-3.5" />
              High Risk Review
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              Low Risk Auto-Eligible
            </span>
          )}

          <span className="text-xs font-mono font-medium text-slate-400">
            {recommendation.service_type || 'AWS Resource'}
          </span>
        </div>

        {/* Status Badge */}
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
          isExecuted
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            : isRolledBack
            ? 'bg-red-500/20 text-red-400 border-red-500/30'
            : isApproved
            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
        }`}>
          {recommendation.status}
        </span>
      </div>

      {/* Recommendation Title & Resource Info */}
      <div className="mt-3">
        <h3 className="text-sm font-bold text-foreground">{recommendation.title}</h3>
        <p className="mt-1 text-xs text-slate-400 leading-relaxed">{recommendation.description}</p>
      </div>

      {/* Specification Change Indicator */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-background/50 p-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Current:</span>
          <span className="font-mono font-bold text-foreground">{recommendation.current_spec}</span>
        </div>
        <ArrowRight className="h-4 w-4 text-emerald-400" />
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Target:</span>
          <span className="font-mono font-bold text-emerald-400">{recommendation.target_spec}</span>
        </div>
      </div>

      {/* Impact Strip with ESTIMATED Labels */}
      <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-border">
        <div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <DollarSign className="h-3 w-3 text-amber-400" />
            <span>ESTIMATED Monthly Savings</span>
          </div>
          <div className="text-base font-extrabold text-amber-400 mt-0.5">
            {formatCurrency(recommendation.estimated_savings_monthly)}/mo
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <Leaf className="h-3 w-3 text-emerald-400" />
            <span>ESTIMATED Carbon Reduction</span>
          </div>
          <div className="text-base font-extrabold text-emerald-400 mt-0.5">
            {recommendation.estimated_carbon_reduction_monthly} kg CO2e/mo
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!isExecuted && !isRolledBack && (
        <div className="mt-4 flex items-center justify-end gap-2">
          {isPending && (
            <button
              onClick={handleApprove}
              disabled={loading || !canApprove}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                canApprove
                  ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'
                  : 'border-slate-800 bg-slate-900 text-slate-600 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approve
            </button>
          )}

          <button
            onClick={handleExecute}
            disabled={loading || !canExecute}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              canExecute
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            Execute Action
          </button>
        </div>
      )}
    </div>
  );
};
