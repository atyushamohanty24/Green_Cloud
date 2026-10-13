from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import AuditLog, Action

router = APIRouter(prefix="/audit-logs", tags=["Audit & Governance"])

@router.get("")
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    actions = db.query(Action).order_by(Action.executed_at.desc()).limit(limit).all()
    
    result_logs = []
    for l in logs:
        result_logs.append({
            "id": l.id,
            "event_type": l.event_type,
            "actor": l.actor,
            "resource_id": l.resource_id,
            "recommendation_id": l.recommendation_id,
            "details": l.details,
            "timestamp": l.timestamp
        })

    result_actions = []
    for a in actions:
        result_actions.append({
            "id": a.id,
            "recommendation_id": a.recommendation_id,
            "resource_id": a.resource_id,
            "user_role": a.user_role,
            "action_type": a.action_type,
            "status": a.status,
            "before_snapshot": a.before_snapshot,
            "after_snapshot": a.after_snapshot,
            "executed_at": a.executed_at
        })

    return {
        "audit_events": result_logs,
        "action_history": result_actions
    }
