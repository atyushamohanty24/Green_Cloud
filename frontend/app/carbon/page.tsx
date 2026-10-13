'use client';

import React, { useState, useEffect } from 'react';
import { api, CarbonSummary } from '@/lib/api';
import { SchedulerTool } from '@/components/scheduler-tool';
import { CarbonTrendChart } from '@/components/carbon-trend-chart';
import { Leaf, MapPin, Zap, RefreshCw } from 'lucide-react';

export default function CarbonPage() {
  const [carbonData, setCarbonData] = useState<CarbonSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCarbonData = async () => {
    setLoading(true);
    try {
      const data = await api.getCarbon();
      setCarbonData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCarbonData();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Carbon & Sustainability Intelligence</h1>
          <p className="text-xs text-slate-400 mt-1">
            Regional power grid carbon intensity analysis and carbon-aware spatial/temporal workload scheduling.
          </p>
        </div>

        <button
          onClick={loadCarbonData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-card-hover transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Grid Data
        </button>
      </div>

      {/* Hero Carbon KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase">
            <Leaf className="h-4 w-4" />
            <span>ESTIMATED Monthly CO2 Reduction</span>
          </div>
          <div className="text-3xl font-black text-foreground mt-2">
            {carbonData?.total_estimated_monthly_reduction_kg || 0} kg CO2e
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {carbonData?.executed_monthly_reduction_kg || 0} kg realized from executed actions
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs font-bold text-slate-400 uppercase">Environmental Offset Equivalent</div>
          <div className="text-3xl font-black text-emerald-400 mt-2">
            ~{carbonData?.equivalent_trees_planted_annually || 0} Trees
          </div>
          <div className="text-xs text-slate-400 mt-1">Annual tree absorption equivalent</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs font-bold text-slate-400 uppercase">Cleanest Grid Monitored</div>
          <div className="text-3xl font-black text-foreground mt-2">eu-west-1</div>
          <div className="text-xs text-emerald-400 mt-1">78% Renewable Wind & Hydro Grid</div>
        </div>
      </div>

      {/* Regional Power Grid Intensity Cards */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-3">Regional Power Grid Carbon Intensity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {carbonData?.regional_grid_intensity.map((grid) => (
            <div key={grid.region} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  {grid.region}
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">{grid.cost_index} Cost</span>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-slate-400">Grid Carbon Intensity:</span>
                  <span className="font-bold text-foreground">{grid.carbon_intensity_g_co2_kwh} g CO2/kWh</span>
                </div>
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-slate-400">Renewable Energy Mix:</span>
                  <span className="font-bold text-emerald-400">{grid.grid_cleanliness_pct}% Clean</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="text-slate-400">Primary Power Source:</span>
                  <span className="font-semibold text-slate-300">{grid.primary_energy}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carbon-Aware Workload Scheduler Component */}
      <SchedulerTool />

      {/* 24-Hour Emissions Trend Chart */}
      {carbonData && <CarbonTrendChart data={carbonData.emissions_trend_24h} />}

    </div>
  );
}
