const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  // When running in the browser on EC2 or behind Nginx, use relative /api
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return 'http://127.0.0.1:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

export interface GreenScoreData {
  score: number;
  utilization_efficiency: number;
  cost_efficiency: number;
  carbon_efficiency: number;
  safety_score: number;
  weight_utilization: number;
  weight_cost: number;
  weight_carbon: number;
  weight_safety: number;
  recommendations_summary: {
    total: number;
    pending: number;
    executed: number;
  };
  total_estimated_monthly_savings: number;
  total_estimated_monthly_carbon_reduction: number;
}

export interface CloudResource {
  id: string;
  name: string;
  service_type: string;
  region: string;
  instance_type: string;
  status: string;
  hourly_cost: number;
  carbon_footprint_hourly: number;
  created_at: string;
  avg_cpu_24h?: number;
  avg_memory_24h?: number;
}

export interface MetricPoint {
  id: number;
  resource_id: string;
  timestamp: string;
  cpu_utilization: number;
  memory_utilization: number;
  network_in_kb: number;
  network_out_kb: number;
  request_count: number;
  storage_used_gb: number;
}

export interface Recommendation {
  id: number;
  resource_id: string;
  recommendation_type: string;
  title: string;
  description: string;
  current_spec: string;
  target_spec: string;
  estimated_savings_monthly: number;
  estimated_carbon_reduction_monthly: number;
  risk_level: 'Low' | 'High';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Executed' | 'Rolled Back';
  created_at: string;
  resource_name?: string;
  service_type?: string;
}

export interface Prediction {
  resource_id: string;
  resource_name: string;
  service_type: string;
  current_cpu: number;
  predicted_cpu_24h: number;
  predicted_demand: 'Low' | 'Medium' | 'High' | 'Very High';
  confidence_score: number;
  evaluation_metrics: {
    accuracy: number;
    f1_score: number;
    mae: number;
    rmse: number;
  };
}

export interface CarbonSummary {
  total_estimated_monthly_reduction_kg: number;
  executed_monthly_reduction_kg: number;
  equivalent_trees_planted_annually: number;
  regional_grid_intensity: Array<{
    region: string;
    carbon_intensity_g_co2_kwh: number;
    grid_cleanliness_pct: number;
    primary_energy: string;
    cost_index: string;
  }>;
  emissions_trend_24h: Array<{
    hour: string;
    estimated_baseline_kg: number;
    estimated_optimized_kg: number;
  }>;
}

export interface CostAnalysis {
  current_estimated_monthly_spend: number;
  potential_monthly_savings: number;
  realized_monthly_savings: number;
  projected_optimized_monthly_spend: number;
  breakdown_by_service: Array<{
    service: string;
    estimated_monthly_cost: number;
  }>;
}

export interface AuditData {
  audit_events: Array<{
    id: number;
    event_type: string;
    actor: string;
    resource_id?: string;
    recommendation_id?: number;
    details: string;
    timestamp: string;
  }>;
  action_history: Array<{
    id: number;
    recommendation_id: number;
    resource_id: string;
    user_role: string;
    action_type: string;
    status: string;
    before_snapshot?: any;
    after_snapshot?: any;
    executed_at: string;
  }>;
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error ${res.status}: ${errText}`);
  }
  return res.json();
}

export const api = {
  getGreenScore: (weights?: { w_util?: number; w_cost?: number; w_carbon?: number; w_safety?: number }) => {
    const params = new URLSearchParams();
    if (weights?.w_util !== undefined) params.append('w_util', weights.w_util.toString());
    if (weights?.w_cost !== undefined) params.append('w_cost', weights.w_cost.toString());
    if (weights?.w_carbon !== undefined) params.append('w_carbon', weights.w_carbon.toString());
    if (weights?.w_safety !== undefined) params.append('w_safety', weights.w_safety.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<GreenScoreData>(`/green-score${query}`);
  },

  getResources: (serviceType?: string) => {
    const query = serviceType ? `?service_type=${serviceType}` : '';
    return fetchJson<CloudResource[]>(`/resources${query}`);
  },

  getResourceById: (id: string) => fetchJson<CloudResource>(`/resources/${id}`),

  getMetrics: (resourceId: string, limit = 168) => fetchJson<MetricPoint[]>(`/metrics/${resourceId}?limit=${limit}`),

  getRecommendations: (status?: string, riskLevel?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (riskLevel) params.append('risk_level', riskLevel);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<Recommendation[]>(`/recommendations${query}`);
  },

  approveRecommendation: (id: number, userRole = 'operator') => fetchJson<{ success: boolean; message: string; status: string }>(`/recommendations/${id}/approve`, {
    method: 'POST',
    headers: { 'X-User-Role': userRole },
  }),

  executeRecommendation: (id: number, userRole = 'operator') => fetchJson<{ success: boolean; message: string; action_id?: number }>(`/recommendations/${id}/execute`, {
    method: 'POST',
    headers: { 'X-User-Role': userRole },
  }),

  getPredictions: () => fetchJson<Prediction[]>('/predictions'),

  getCarbon: () => fetchJson<CarbonSummary>('/carbon'),

  getCostAnalysis: () => fetchJson<CostAnalysis>('/cost-analysis'),

  getAuditLogs: () => fetchJson<AuditData>('/audit-logs'),

  scheduleJob: (payload: { job_name: string; duration_hours: number; required_vcpu: number; required_ram_gb: number; preferred_regions?: string[] }) =>
    fetchJson<any>('/scheduler/recommend', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  rollbackAction: (actionId: number, reason: string) => fetchJson<{ success: boolean; message: string }>(`/simulation/rollback/${actionId}?reason=${encodeURIComponent(reason)}`, {
    method: 'POST',
  }),
};
