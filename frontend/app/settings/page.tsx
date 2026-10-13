'use client';

import React, { useState } from 'react';
import { Sliders, Shield, Cpu, DollarSign, Leaf, Save, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [wUtil, setWUtil] = useState(30);
  const [wCost, setWCost] = useState(35);
  const [wCarbon, setWCarbon] = useState(25);
  const [wSafety, setWSafety] = useState(10);

  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const totalWeight = wUtil + wCost + wCarbon + wSafety;

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Platform Policy & Score Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure composite Green Score weights, risk automation rules, and IAM governance roles.
        </p>
      </div>

      {savedMsg && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Green Score weight settings updated successfully!</span>
        </div>
      )}

      {/* Green Score Weight Sliders */}
      <form onSubmit={handleSave} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-400" />
              Composite Green Score Weights
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Customize relative weight percentages for overall score calculation.</p>
          </div>
          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
            totalWeight === 100 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            Total: {totalWeight}% {totalWeight !== 100 && '(Normalizes to 100%)'}
          </span>
        </div>

        <div className="space-y-4">
          {/* Utilization Weight */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                Workload Utilization Efficiency
              </span>
              <span className="text-emerald-400 font-mono">{wUtil}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={wUtil}
              onChange={(e) => setWUtil(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Cost Weight */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-amber-400" />
                Cost Efficiency & ROI
              </span>
              <span className="text-amber-400 font-mono">{wCost}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={wCost}
              onChange={(e) => setWCost(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Carbon Weight */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Leaf className="h-3.5 w-3.5 text-emerald-400" />
                Carbon Footprint Reduction
              </span>
              <span className="text-emerald-400 font-mono">{wCarbon}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={wCarbon}
              onChange={(e) => setWCarbon(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Safety Weight */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-cyan-400" />
                Safety Governance & Zero-Regression
              </span>
              <span className="text-cyan-400 font-mono">{wSafety}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={wSafety}
              onChange={(e) => setWSafety(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-md"
          >
            <Save className="h-4 w-4" />
            Save Weight Policy
          </button>
        </div>
      </form>

      {/* Risk Policy Rule Thresholds */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-400" />
          Automated Risk Policy Threshold Rules
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-border bg-background p-4 space-y-1">
            <div className="font-bold text-foreground">High-Risk Savings Threshold</div>
            <div className="text-slate-400">Recommendations with estimated savings exceeding <span className="text-amber-400 font-bold">$200.00/mo</span> automatically classify as High Risk.</div>
          </div>

          <div className="rounded-xl border border-border bg-background p-4 space-y-1">
            <div className="font-bold text-foreground">Production Database Protection</div>
            <div className="text-slate-400">Any resize or modification targeted at production RDS instances strictly requires <span className="text-amber-400 font-bold">Admin IAM Role Approval</span>.</div>
          </div>
        </div>
      </div>

    </div>
  );
}
