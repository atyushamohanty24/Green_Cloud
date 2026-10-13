from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import CloudResource, Metric
from app.schemas.schemas import CloudResourceRead

router = APIRouter(prefix="/resources", tags=["Cloud Resources"])

@router.get("", response_model=List[CloudResourceRead])
def list_resources(service_type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(CloudResource)
    if service_type:
        query = query.filter(CloudResource.service_type == service_type)
    
    resources = query.all()
    res_list = []
    
    for r in resources:
        # Calculate recent 24-hour averages
        metrics_24h = db.query(Metric).filter(Metric.resource_id == r.id).order_by(Metric.timestamp.desc()).limit(24).all()
        avg_cpu = (sum(m.cpu_utilization for m in metrics_24h) / len(metrics_24h)) if metrics_24h else 0.0
        avg_mem = (sum(m.memory_utilization for m in metrics_24h) / len(metrics_24h)) if metrics_24h else 0.0
        
        item = CloudResourceRead.from_orm(r)
        item.avg_cpu_24h = round(avg_cpu, 1)
        item.avg_memory_24h = round(avg_mem, 1)
        res_list.append(item)
        
    return res_list

@router.get("/{id}", response_model=CloudResourceRead)
def get_resource_by_id(id: str, db: Session = Depends(get_db)):
    resource = db.query(CloudResource).filter(CloudResource.id == id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Cloud resource not found")
        
    metrics_24h = db.query(Metric).filter(Metric.resource_id == id).order_by(Metric.timestamp.desc()).limit(24).all()
    avg_cpu = (sum(m.cpu_utilization for m in metrics_24h) / len(metrics_24h)) if metrics_24h else 0.0
    avg_mem = (sum(m.memory_utilization for m in metrics_24h) / len(metrics_24h)) if metrics_24h else 0.0
    
    item = CloudResourceRead.from_orm(resource)
    item.avg_cpu_24h = round(avg_cpu, 1)
    item.avg_memory_24h = round(avg_mem, 1)
    return item
