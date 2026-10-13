from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Metric
from app.schemas.schemas import MetricRead

router = APIRouter(prefix="/metrics", tags=["Metrics"])

@router.get("/{resourceId}", response_model=List[MetricRead])
def get_resource_metrics(
    resourceId: str, 
    limit: int = Query(168, ge=1, le=1000),  # Default 7 days (168 hours)
    db: Session = Depends(get_db)
):
    metrics = (
        db.query(Metric)
        .filter(Metric.resource_id == resourceId)
        .order_by(Metric.timestamp.asc())
        .limit(limit)
        .all()
    )
    if not metrics:
        return []
    return metrics
