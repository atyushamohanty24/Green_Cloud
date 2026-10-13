from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class CloudResourceBase(BaseModel):
    id: str
    name: str
    service_type: str
    region: str
    instance_type: str
    status: str
    hourly_cost: float
    carbon_footprint_hourly: float

class CloudResourceRead(CloudResourceBase):
    created_at: datetime
    avg_cpu_24h: Optional[float] = None
    avg_memory_24h: Optional[float] = None
    
    class Config:
        from_attributes = True

class MetricRead(BaseModel):
    id: int
    resource_id: str
    timestamp: datetime
    cpu_utilization: float
    memory_utilization: float
    network_in_kb: float
    network_out_kb: float
    request_count: float
    storage_used_gb: float

    class Config:
        from_attributes = True

class PredictionRead(BaseModel):
    id: int
    resource_id: str
    timestamp: datetime
    predicted_demand: str
    confidence_score: float
    predicted_cpu: float

    class Config:
        from_attributes = True

class RecommendationRead(BaseModel):
    id: int
    resource_id: str
    recommendation_type: str
    title: str
    description: str
    current_spec: str
    target_spec: str
    estimated_savings_monthly: float
    estimated_carbon_reduction_monthly: float
    risk_level: str
    status: str
    created_at: datetime
    resource_name: Optional[str] = None
    service_type: Optional[str] = None

    class Config:
        from_attributes = True

class ActionRead(BaseModel):
    id: int
    recommendation_id: int
    resource_id: str
    user_role: str
    action_type: str
    before_snapshot: Optional[Dict[str, Any]] = None
    after_snapshot: Optional[Dict[str, Any]] = None
    status: str
    executed_at: datetime

    class Config:
        from_attributes = True

class CarbonDataRead(BaseModel):
    id: int
    region: str
    carbon_intensity_g_co2_kwh: float
    grid_cleanliness_pct: float
    timestamp: datetime

    class Config:
        from_attributes = True

class GreenScoreRead(BaseModel):
    score: float  # 0 to 100
    utilization_efficiency: float
    cost_efficiency: float
    carbon_efficiency: float
    safety_score: float
    weight_utilization: float
    weight_cost: float
    weight_carbon: float
    weight_safety: float
    recommendations_summary: Dict[str, int]
    total_estimated_monthly_savings: float
    total_estimated_monthly_carbon_reduction: float

class SchedulerRequest(BaseModel):
    job_name: str
    duration_hours: int = 4
    required_vcpu: int = 4
    required_ram_gb: int = 16
    preferred_regions: Optional[List[str]] = ["us-east-1", "eu-west-1", "ap-southeast-1"]

class SchedulerResponse(BaseModel):
    recommended_region: str
    recommended_start_time: str
    estimated_cost_usd: float
    estimated_carbon_g_co2: float
    carbon_intensity: float
    cost_per_hour: float
    explanation: str
    comparison: List[Dict[str, Any]]
