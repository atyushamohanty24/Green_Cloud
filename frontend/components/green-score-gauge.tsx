'use client';

import React from 'react';
import { GreenScoreData } from '@/lib/api';
import { ShieldCheck, Cpu, DollarSign, Leaf } from 'lucide-react';

interface GreenScoreGaugeProps {
  data: GreenScoreData;
}

export const GreenScoreGauge: React.FC<GreenScoreGaugeProps> = ({ data }) => {
  const score = data?.score ?? 85.0;

  // Rating label based on score
  let ratingLabel = "Optimal Efficiency";
  let ratingColor = "text-emerald-400";
  if (score < 60) {
    ratingLabel = "Needs Optimization";
    ratingColor = "text-amber-400";
  } else if (score < 80) {
    ratingLabel = "Good Performance";
    ratingColor = "text-cyan-400";
  }

  // Calculate SVG circular arc offset
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Arc Visualizer */}
        <div className="relative flex items-center justify-center">
          <svg className="w-36 h-36 transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="72"
              cy="72"
              r="45"
              className="stroke-slate-800 dark:stroke-slate-800"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Value ring */}
            <circle
              cx="72"
              cy="72"
              r="45"
              className="stroke-emerald-400 transition-all duration-1000 ease-out"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-foreground tracking-tight">{score}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">/ 100</span>
          </div>
        </div>

        {/* Center Details */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <h2 className="text-lg font-bold text-foreground">Composite Green Score</h2>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 ${ratingColor} border border-emerald-500/20`}>
              {ratingLabel}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Weighted composite metric combining workload utilization (30%), cost efficiency (35%), carbon footprint reduction (25%), and safety governance compliance (10%).
          </p>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border bg-background p-2.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                <span>Utilization</span>
              </div>
              <div className="mt-1 text-sm font-bold text-foreground">{data?.utilization_efficiency}%</div>
            </div>

            <div className="rounded-xl border border-border bg-background p-2.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <DollarSign className="h-3.5 w-3.5 text-amber-400" />
                <span>Cost Eff.</span>
              </div>
              <div className="mt-1 text-sm font-bold text-foreground">{data?.cost_efficiency}%</div>
            </div>

            <div className="rounded-xl border border-border bg-background p-2.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Leaf className="h-3.5 w-3.5 text-emerald-400" />
                <span>Carbon Eff.</span>
              </div>
              <div className="mt-1 text-sm font-bold text-foreground">{data?.carbon_efficiency}%</div>
            </div>

            <div className="rounded-xl border border-border bg-background p-2.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span>Safety</span>
              </div>
              <div className="mt-1 text-sm font-bold text-foreground">{data?.safety_score}%</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
