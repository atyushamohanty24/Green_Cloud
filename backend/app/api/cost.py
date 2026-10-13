from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import CloudResource, Recommendation

router = APIRouter(prefix="/cost-analysis", tags=["Cost Analysis"])

@router.get("")
def get_cost_analysis(db: Session = Depends(get_db)):
    resources = db.query(CloudResource).all()
    recs = db.query(Recommendation).all()

    total_monthly_spend = sum(r.hourly_cost * 720 for r in resources)
    
    pending_savings = sum(r.estimated_savings_monthly for r in recs if r.status in ["Pending", "Approved"])
    executed_savings = sum(r.estimated_savings_monthly for r in recs if r.status == "Executed")
    
    breakdown_by_service = {}
    for r in resources:
        st = r.service_type
        if st not in breakdown_by_service:
            breakdown_by_service[st] = 0.0
        breakdown_by_service[st] += r.hourly_cost * 720

    service_breakdown_list = [
        {"service": k, "estimated_monthly_cost": round(v, 2)} 
        for k, v in breakdown_by_service.items()
    ]

    return {
        "current_estimated_monthly_spend": round(total_monthly_spend, 2),
        "potential_monthly_savings": round(pending_savings, 2),
        "realized_monthly_savings": round(executed_savings, 2),
        "projected_optimized_monthly_spend": round(max(0.0, total_monthly_spend - pending_savings), 2),
        "breakdown_by_service": service_breakdown_list
    }
