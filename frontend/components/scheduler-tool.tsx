'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Zap, MapPin, Clock, Cpu, Leaf, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const SchedulerTool: React.FC = () => {
  const [jobName, setJobName] = useState('Nightly ML Model Training');
  const [durationHours, setDurationHours] = useState(4);
  const [vcpus, setVcpus] = useState(8);
  const [ramGb, setRamGb] = useState(32);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await api.scheduleJob({
        job_name: jobName,
        duration_hours: durationHours,
        required_vcpu: vcpus,
        required_ram_gb: ramGb,
        preferred_regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
      });
      setResult(resp);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-foreground">Carbon-Aware Workload Scheduler</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Recommends the cleanest region and optimal execution window to minimize grid carbon intensity.
          </p>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
          Multi-Region AI
        </span>
      </div>

      <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-background/50 p-4 rounded-xl border border-border">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Job Name</label>
          <input
            type="text"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Duration (Hours)</label>
          <input
            type="number"
            min="1"
            max="48"
            value={durationHours}
            onChange={(e) => setDurationHours(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Required vCPUs</label>
          <input
            type="number"
            min="1"
            max="128"
            value={vcpus}
            onChange={(e) => setVcpus(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-md"
          >
            {loading ? 'Evaluating Grids...' : 'Calculate Optimal Schedule'}
          </button>
        </div>
      </form>

      {/* Result Card */}
      {result && (
        <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                Recommended Region
              </span>
              <h3 className="text-lg font-extrabold text-foreground mt-1 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-400" />
                {result.recommended_region}
              </h3>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <div className="text-[11px] text-slate-400">Optimal Window</div>
                <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {result.recommended_start_time}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400">ESTIMATED Carbon</div>
                <div className="text-sm font-bold text-foreground">
                  {result.estimated_carbon_g_co2} g CO2
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400">ESTIMATED Cost</div>
                <div className="text-sm font-bold text-amber-400">
                  {formatCurrency(result.estimated_cost_usd)}
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-300 leading-relaxed bg-background/50 p-3 rounded-lg border border-border">
            {result.explanation}
          </p>

          {/* Regional Grid Comparison Matrix */}
          <div className="mt-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Regional Grid Comparison Matrix</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {result.comparison?.map((comp: any) => {
                const isSelected = comp.region_code === result.recommended_region;
                return (
                  <div
                    key={comp.region_code}
                    className={`rounded-xl border p-3 transition-all ${
                      isSelected
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-foreground">
                      <span>{comp.region_name}</span>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                    </div>

                    <div className="mt-2 space-y-1 text-[11px] text-slate-400">
                      <div className="flex justify-between">
                        <span>Carbon Intensity:</span>
                        <span className="font-semibold text-foreground">{comp.carbon_intensity} g/kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Clean Energy Grid:</span>
                        <span className="font-semibold text-emerald-400">{comp.clean_energy_pct}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Est. Job Cost:</span>
                        <span className="font-semibold text-amber-400">${comp.estimated_cost_usd}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
