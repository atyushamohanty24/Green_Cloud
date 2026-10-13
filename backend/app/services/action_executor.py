from datetime import datetime
from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.models import Recommendation, CloudResource, Action, AuditLog, Metric
from app.services.mock_provider import mock_aws

class ActionExecutor:
    def execute_action(self, db: Session, recommendation_id: int, user_role: str = "operator") -> Tuple[bool, str, Action]:
        rec = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
        if not rec:
            return False, "Recommendation not found", None

        if rec.status in ["Executed", "Rolled Back"]:
            return False, f"Recommendation is already in '{rec.status}' status", None

        # Check IAM permission logic
        if rec.risk_level == "High" and user_role not in ["admin"]:
            return False, "High-risk actions require 'admin' IAM role authorization.", None

        res = db.query(CloudResource).filter(CloudResource.id == rec.resource_id).first()
        if not res:
            return False, "Resource not found", None

        # 1. Capture BEFORE Snapshot
        recent_metrics = db.query(Metric).filter(Metric.resource_id == res.id).order_by(Metric.timestamp.desc()).first()
        before_snapshot = {
            "resource_id": res.id,
            "name": res.name,
            "service_type": res.service_type,
            "instance_type": res.instance_type,
            "status": res.status,
            "hourly_cost": res.hourly_cost,
            "carbon_footprint_hourly": res.carbon_footprint_hourly,
            "latest_cpu": recent_metrics.cpu_utilization if recent_metrics else 0.0,
            "latest_memory": recent_metrics.memory_utilization if recent_metrics else 0.0
        }

        # 2. Perform Mock AWS Action
        if rec.recommendation_type == "Rightsize":
            aws_resp = mock_aws.execute_resize(res.id, rec.target_spec)
            res.instance_type = rec.target_spec
            res.status = "resized"
            # Update hourly cost estimates based on target spec
            res.hourly_cost = round(res.hourly_cost * 0.5, 4)
            res.carbon_footprint_hourly = round(res.carbon_footprint_hourly * 0.5, 2)

        elif rec.recommendation_type == "Stop Idle":
            aws_resp = mock_aws.execute_stop(res.id)
            res.status = "stopped"
            res.hourly_cost = 0.0
            res.carbon_footprint_hourly = 0.0

        elif rec.recommendation_type == "Storage Lifecycle":
            aws_resp = mock_aws.execute_s3_lifecycle(res.id, rec.target_spec)
            res.instance_type = rec.target_spec
            res.status = "optimized"
            res.hourly_cost = round(res.hourly_cost * 0.2, 4)

        elif rec.recommendation_type == "Scale Down":
            aws_resp = mock_aws.execute_resize(res.id, rec.target_spec)
            res.instance_type = rec.target_spec
            res.status = "scaled_down"
            res.hourly_cost = round(res.hourly_cost * 0.2, 4)

        # 3. Capture AFTER Snapshot
        after_snapshot = {
            "resource_id": res.id,
            "name": res.name,
            "service_type": res.service_type,
            "instance_type": res.instance_type,
            "status": res.status,
            "hourly_cost": res.hourly_cost,
            "carbon_footprint_hourly": res.carbon_footprint_hourly,
            "aws_response": aws_resp
        }

        rec.status = "Executed"
        
        # Log Action
        action_log = Action(
            recommendation_id=rec.id,
            resource_id=res.id,
            user_role=user_role,
            action_type=rec.recommendation_type,
            before_snapshot=before_snapshot,
            after_snapshot=after_snapshot,
            status="Success",
            executed_at=datetime.utcnow()
        )
        db.add(action_log)

        # Log Audit Event
        audit = AuditLog(
            event_type="ACTION_EXECUTED",
            actor=f"IAM:{user_role.upper()}",
            resource_id=res.id,
            recommendation_id=rec.id,
            details=f"Executed '{rec.title}' on {res.name}. Spec modified from '{rec.current_spec}' to '{rec.target_spec}'. Estimated monthly savings: ${rec.estimated_savings_monthly}/mo."
        )
        db.add(audit)

        db.commit()
        db.refresh(action_log)
        return True, "Action executed successfully", action_log

    def rollback_action(self, db: Session, action_id: int, reason: str = "Automated post-action regression check failed") -> Tuple[bool, str]:
        action = db.query(Action).filter(Action.id == action_id).first()
        if not action:
            return False, "Action log not found"

        if action.status == "Rolled Back":
            return False, "Action has already been rolled back."

        rec = db.query(Recommendation).filter(Recommendation.id == action.recommendation_id).first()
        res = db.query(CloudResource).filter(CloudResource.id == action.resource_id).first()

        if action.before_snapshot and res:
            res.instance_type = action.before_snapshot.get("instance_type", res.instance_type)
            res.status = action.before_snapshot.get("status", "running")
            res.hourly_cost = action.before_snapshot.get("hourly_cost", res.hourly_cost)
            res.carbon_footprint_hourly = action.before_snapshot.get("carbon_footprint_hourly", res.carbon_footprint_hourly)

        action.status = "Rolled Back"
        if rec:
            rec.status = "Rolled Back"

        audit = AuditLog(
            event_type="ROLLBACK_TRIGGERED",
            actor="SYSTEM_AUTO_VERIFIER",
            resource_id=res.id if res else None,
            recommendation_id=rec.id if rec else None,
            details=f"AUTOMATED ROLLBACK: Undid action #{action.id} for {res.name if res else 'resource'}. Reason: {reason}. Restored baseline spec to {res.instance_type if res else 'original'}."
        )
        db.add(audit)
        db.commit()

        return True, f"Successfully rolled back action #{action_id}."

action_executor = ActionExecutor()
