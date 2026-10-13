'use client';

import React, { useState, useEffect } from 'react';
import { api, GreenScoreData, Recommendation, CarbonSummary, CostAnalysis } from '@/lib/api';
import { GreenScoreGauge } from '@/components/green-score-gauge';
import { KPICard } from '@/components/kpi-card';
import { RecommendationCard } from '@/components/recommendation-card';
import { EfficiencyChart } from '@/components/efficiency-chart';
import { CarbonTrendChart } from '@/components/carbon-trend-chart';
import { Server, DollarSign, Leaf, ShieldAlert, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function OverviewDashboard() {
  const currentRole = 'admin';
  const [greenScore, setGreenScore] = useState<GreenScoreData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [carbonSummary, setCarbonSummary] = useState<CarbonSummary | null>(null);
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [scoreRes, recsRes, carbonRes, costRes] = await Promise.all([
        api.getGreenScore(),
        api.getRecommendations(),
        api.getCarbon(),
        api.getCostAnalysis(),
      ]);
      setGreenScore(scoreRes);
      setRecommendations(recsRes);
      setCarbonSummary(carbonRes);
      setCostAnalysis(costRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleApprove = async (id: number) => {
    await api.approveRecommendation(id, currentRole);
    await loadDashboardData();
  };

  const handleExecute = async (id: number) => {
    await api.executeRecommendation(id, currentRole);
    await loadDashboardData();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse-slow">
        <div className="h-44 rounded-2xl bg-card border border-border" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-card border border-border" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-2xl bg-card border border-border" />
          <div className="h-96 rounded-2xl bg-card border border-border" />
        </div>
      </div>
    );
  }

  const pendingRecs = recommendations.filter((r) => r.status === 'Pending' || r.status === 'Approved');

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Infrastructure Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, demand forecasts, and carbon optimization recommendations.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-card-hover transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Metrics
        </button>
      </div>

      {/* Hero Green Score Gauge */}
      {greenScore && <GreenScoreGauge data={greenScore} />}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Monitored Resources"
          value="10 Cloud Assets"
          subtitle="EC2, RDS, S3, Lambda"
          icon={Server}
          colorScheme="cyan"
        />

        <KPICard
          title="ESTIMATED Monthly Savings"
          value={formatCurrency(greenScore?.total_estimated_monthly_savings || 0)}
          subtitle={`${formatCurrency(costAnalysis?.realized_monthly_savings || 0)} realized`}
          icon={DollarSign}
          trend="+32% ROI"
          trendUp={true}
          colorScheme="amber"
        />

        <KPICard
          title="ESTIMATED Carbon Reduction"
          value={`${greenScore?.total_estimated_monthly_carbon_reduction || 0} kg`}
          subtitle={`~${carbonSummary?.equivalent_trees_planted_annually || 0} trees/year equivalent`}
          icon={Leaf}
          trend="-28% CO2"
          trendUp={true}
          colorScheme="emerald"
        />

        <KPICard
          title="Pending Governance Actions"
          value={`${pendingRecs.length} Actionable`}
          subtitle={`${recommendations.filter(r => r.risk_level === 'High' && r.status === 'Pending').length} High-Risk require review`}
          icon={ShieldAlert}
          colorScheme="purple"
        />
      </div>

      {/* Two Column Layout: Recommendations Feed + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recommendations Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Actionable Optimization Feed</h2>
              <p className="text-xs text-slate-400">Prioritized rightsizing, lifecycle, and scaling rules</p>
            </div>
            <Link href="/recommendations" className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
              View All ({recommendations.length})
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {pendingRecs.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <Leaf className="mx-auto h-10 w-10 text-emerald-400/50" />
              <h3 className="mt-3 text-sm font-bold text-foreground">Infrastructure Fully Optimized</h3>
              <p className="mt-1 text-xs text-slate-400">All low-risk and high-risk recommendations have been executed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRecs.slice(0, 3).map((rec) => (
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

        {/* Right Column: Service Efficiency & Carbon Trend (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {costAnalysis && <EfficiencyChart data={costAnalysis.breakdown_by_service} />}
          {carbonSummary && <CarbonTrendChart data={carbonSummary.emissions_trend_24h} />}
        </div>

      </div>

    </div>
  );
}
