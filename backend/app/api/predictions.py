import os
import sys
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import CloudResource, Metric
from app.schemas.schemas import PredictionRead

# Import DemandPredictor from ml package
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
from ml.predictor import DemandPredictor

router = APIRouter(prefix="/predictions", tags=["Predictions"])
predictor = DemandPredictor()

@router.get("")
def get_resource_predictions(db: Session = Depends(get_db)):
    resources = db.query(CloudResource).all()
    results = []

    for r in resources:
        if r.service_type in ["EC2", "RDS", "Lambda"]:
            recent = db.query(Metric).filter(Metric.resource_id == r.id).order_by(Metric.timestamp.desc()).limit(24).all()
            if recent:
                latest = recent[0]
                avg_cpu_24h = sum(m.cpu_utilization for m in recent) / len(recent)
                max_cpu_24h = max(m.cpu_utilization for m in recent)
                avg_mem_24h = sum(m.memory_utilization for m in recent) / len(recent)

                features = {
                    'hour_of_day': latest.timestamp.hour,
                    'day_of_week': latest.timestamp.weekday(),
                    'cpu_utilization': latest.cpu_utilization,
                    'memory_utilization': latest.memory_utilization,
                    'network_in_kb': latest.network_in_kb,
                    'network_out_kb': latest.network_out_kb,
                    'request_count': latest.request_count,
                    'cpu_rolling_6h_mean': avg_cpu_24h, # approximate
                    'cpu_rolling_24h_mean': avg_cpu_24h,
                    'cpu_rolling_24h_max': max_cpu_24h,
                    'mem_rolling_6h_mean': avg_mem_24h
                }
                
                pred = predictor.predict(features)
                results.append({
                    "resource_id": r.id,
                    "resource_name": r.name,
                    "service_type": r.service_type,
                    "current_cpu": round(latest.cpu_utilization, 1),
                    "predicted_cpu_24h": pred["predicted_cpu"],
                    "predicted_demand": pred["predicted_demand"],
                    "confidence_score": pred["confidence_score"],
                    "evaluation_metrics": pred["evaluation_metrics"]
                })

    return results
