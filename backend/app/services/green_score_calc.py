from sqlalchemy.orm import Session
from app.models.models import CloudResource, Metric, Recommendation, Action
from app.config import settings

class GreenScoreCalculator:
    def calculate_score(
        self, 
        db: Session,
        w_util: float = settings.DEFAULT_WEIGHT_UTILIZATION,
        w_cost: float = settings.DEFAULT_WEIGHT_COST,
        w_carbon: float = settings.DEFAULT_WEIGHT_CARBON,
        w_safety: float = settings.DEFAULT_WEIGHT_SAFETY
    ) -> dict:
        resources = db.query(CloudResource).all()
        if not resources:
            return {
                "score": 85.0,
                "utilization_efficiency": 80.0,
                "cost_efficiency": 85.0,
                "carbon_efficiency": 88.0,
                "safety_score": 95.0,
                "weight_utilization": w_util,
                "weight_cost": w_cost,
                "weight_carbon": w_carbon,
                "weight_safety": w_safety,
                "recommendations_summary": {"total": 0, "pending": 0, "executed": 0},
                "total_estimated_monthly_savings": 0.0,
                "total_estimated_monthly_carbon_reduction": 0.0
            }

        # 1. Utilization Efficiency Component (Target optimal CPU band: 40-75%)
        # Penalize over-provisioned (<15% CPU) and under-provisioned (>90% CPU)
        active_res_count = 0
        total_util_score = 0.0

        for r in resources:
            if r.service_type in ["EC2", "RDS", "Lambda"]:
                latest_metric = db.query(Metric).filter(Metric.resource_id == r.id).order_by(Metric.timestamp.desc()).first()
                if latest_metric:
                    active_res_count += 1
                    cpu = latest_metric.cpu_utilization
                    if 35.0 <= cpu <= 75.0:
                        res_score = 100.0
                    elif cpu < 35.0:
                        res_score = max(20.0, 100.0 - (35.0 - cpu) * 2.2)
                    else:
                        res_score = max(30.0, 100.0 - (cpu - 75.0) * 2.8)
                    total_util_score += res_score

        util_eff = (total_util_score / active_res_count) if active_res_count > 0 else 75.0

        # 2. Cost & Carbon Efficiency Components
        recs = db.query(Recommendation).all()
        pending_recs = [rec for rec in recs if rec.status in ["Pending", "Approved"]]
        executed_recs = [rec for rec in recs if rec.status == "Executed"]

        total_pending_savings = sum(rec.estimated_savings_monthly for rec in pending_recs)
        total_executed_savings = sum(rec.estimated_savings_monthly for rec in executed_recs)

        total_pending_carbon = sum(rec.estimated_carbon_reduction_monthly for rec in pending_recs)
        total_executed_carbon = sum(rec.estimated_carbon_reduction_monthly for rec in executed_recs)

        # Higher score if more recommendations have been executed rather than left pending
        all_potential_savings = total_pending_savings + total_executed_savings
        cost_eff = 100.0 if all_potential_savings == 0 else min(100.0, 60.0 + (total_executed_savings / all_potential_savings) * 40.0)

        all_potential_carbon = total_pending_carbon + total_executed_carbon
        carbon_eff = 100.0 if all_potential_carbon == 0 else min(100.0, 60.0 + (total_executed_carbon / all_potential_carbon) * 40.0)

        # 3. Safety Governance Component
        rolled_back_count = db.query(Action).filter(Action.status == "Rolled Back").count()
        safety_score = max(50.0, 100.0 - (rolled_back_count * 15.0))

        # 4. Composite Green Score
        total_weight = w_util + w_cost + w_carbon + w_safety
        norm_w_util = w_util / total_weight
        norm_w_cost = w_cost / total_weight
        norm_w_carbon = w_carbon / total_weight
        norm_w_safety = w_safety / total_weight

        composite_score = (
            util_eff * norm_w_util +
            cost_eff * norm_w_cost +
            carbon_eff * norm_w_carbon +
            safety_score * norm_w_safety
        )

        return {
            "score": round(composite_score, 1),
            "utilization_efficiency": round(util_eff, 1),
            "cost_efficiency": round(cost_eff, 1),
            "carbon_efficiency": round(carbon_eff, 1),
            "safety_score": round(safety_score, 1),
            "weight_utilization": w_util,
            "weight_cost": w_cost,
            "weight_carbon": w_carbon,
            "weight_safety": w_safety,
            "recommendations_summary": {
                "total": len(recs),
                "pending": len(pending_recs),
                "executed": len(executed_recs)
            },
            "total_estimated_monthly_savings": round(total_pending_savings + total_executed_savings, 2),
            "total_estimated_monthly_carbon_reduction": round(total_pending_carbon + total_executed_carbon, 2)
        }

green_score_calculator = GreenScoreCalculator()
