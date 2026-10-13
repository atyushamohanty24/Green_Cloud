from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Recommendation, CloudResource, AuditLog, Action
from app.schemas.schemas import RecommendationRead, ActionRead
from app.services.action_executor import action_executor
from app.services.optimizer import optimizer

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("", response_model=List[RecommendationRead])
def list_recommendations(
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # Trigger optimization scan to ensure fresh recommendations exist
    optimizer.scan_and_generate_recommendations(db)

    query = db.query(Recommendation)
    if status:
        query = query.filter(Recommendation.status == status)
    if risk_level:
        query = query.filter(Recommendation.risk_level == risk_level)

    recs = query.order_by(Recommendation.created_at.desc()).all()
    res_map = {r.id: r for r in db.query(CloudResource).all()}

    output = []
    for r in recs:
        item = RecommendationRead.from_orm(r)
        if r.resource_id in res_map:
            item.resource_name = res_map[r.resource_id].name
            item.service_type = res_map[r.resource_id].service_type
        output.append(item)

    return output

@router.post("/{id}/approve")
def approve_recommendation(
    id: int, 
    x_user_role: Optional[str] = Header("operator", alias="X-User-Role"),
    db: Session = Depends(get_db)
):
    rec = db.query(Recommendation).filter(Recommendation.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    if rec.risk_level == "High" and x_user_role != "admin":
        raise HTTPException(status_code=403, detail="Approving High-Risk actions requires 'admin' IAM role privilege.")

    rec.status = "Approved"
    
    audit = AuditLog(
        event_type="APPROVAL_GRANTED",
        actor=f"IAM:{x_user_role.upper()}",
        resource_id=rec.resource_id,
        recommendation_id=rec.id,
        details=f"Human approval granted for recommendation '{rec.title}' by {x_user_role} role."
    )
    db.add(audit)
    db.commit()

    return {"success": True, "message": f"Recommendation #{id} approved", "status": rec.status}

@router.post("/{id}/execute")
def execute_recommendation(
    id: int, 
    x_user_role: Optional[str] = Header("operator", alias="X-User-Role"),
    db: Session = Depends(get_db)
):
    success, message, action_log = action_executor.execute_action(db, recommendation_id=id, user_role=x_user_role)
    if not success:
        raise HTTPException(status_code=400, detail=message)

    return {
        "success": True, 
        "message": message, 
        "action_id": action_log.id if action_log else None
    }
