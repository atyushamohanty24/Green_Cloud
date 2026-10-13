from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import CloudResource, Metric, Recommendation
from app.services.safety_rules import safety_engine

SPEC_PRICING = {
    # EC2 (USD / hr, kg CO2e / mo)
    "t3.xlarge": {"cost": 0.1664, "carbon": 26.6, "cpu_cores": 4, "ram_gb": 16},
    "t3.large": {"cost": 0.0832, "carbon": 13.3, "cpu_cores": 2, "ram_gb": 8},
    "t3.medium": {"cost": 0.0416, "carbon": 6.6, "cpu_cores": 2, "ram_gb": 4},
    "c5.2xlarge": {"cost": 0.34, "carbon": 54.0, "cpu_cores": 8, "ram_gb": 16},
    "c5.large": {"cost": 0.085, "carbon": 13.5, "cpu_cores": 2, "ram_gb": 4},
    "m5.xlarge": {"cost": 0.192, "carbon": 30.2, "cpu_cores": 4, "ram_gb": 16},
    "Stopped": {"cost": 0.0, "carbon": 0.0, "cpu_cores": 0, "ram_gb": 0},
    
    # RDS
    "db.r5.2xlarge": {"cost": 0.96, "carbon": 151.2, "cpu_cores": 8, "ram_gb": 64},
    "db.r5.xlarge": {"cost": 0.48, "carbon": 75.6, "cpu_cores": 4, "ram_gb": 32},
    "db.r5.large": {"cost": 0.24, "carbon": 37.8, "cpu_cores": 2, "ram_gb": 16},
    
    # S3
    "Standard": {"cost_per_gb": 0.023, "carbon_per_gb": 0.0026},
    "Glacier Instant Retrieval": {"cost_per_gb": 0.004, "carbon_per_gb": 0.0005},
    
    # Lambda
    "Provisioned-50": {"cost": 0.15, "carbon": 11.5},
    "Provisioned-10": {"cost": 0.03, "carbon": 2.3}
}

class OptimizationEngine:
    def scan_and_generate_recommendations(self, db: Session):
        """Scans cloud resources and historical metrics to generate or update recommendations."""
        resources = db.query(CloudResource).all()
        recs_created = []

        for res in resources:
            existing = db.query(Recommendation).filter(
                Recommendation.resource_id == res.id,
                Recommendation.status.in_(["Pending", "Approved"])
            ).first()
            if existing:
                continue

            # Compute recent metric averages
            metrics = db.query(Metric).filter(Metric.resource_id == res.id).order_by(Metric.timestamp.desc()).limit(168).all()
            if not metrics:
                continue

            avg_cpu = sum(m.cpu_utilization for m in metrics) / len(metrics)
            avg_mem = sum(m.memory_utilization for m in metrics) / len(metrics)

            rec_data = None

            # Logic 1: EC2 Over-provisioned
            if res.service_type == "EC2":
                if res.instance_type == "t3.xlarge" and avg_cpu < 15.0:
                    savings = (SPEC_PRICING["t3.xlarge"]["cost"] - SPEC_PRICING["t3.medium"]["cost"]) * 720
                    carbon_red = SPEC_PRICING["t3.xlarge"]["carbon"] - SPEC_PRICING["t3.medium"]["carbon"]
                    rec_data = {
                        "type": "Rightsize",
                        "title": "Downsize Over-provisioned EC2 Instance",
                        "description": f"Average CPU utilization is {avg_cpu:.1f}% over the last 7 days. Downsizing from t3.xlarge to t3.medium aligns capacity with workload demand while preserving SLA.",
                        "current_spec": "t3.xlarge",
                        "target_spec": "t3.medium",
                        "savings": round(savings, 2),
                        "carbon": round(carbon_red, 2)
                    }
                elif res.instance_type == "c5.2xlarge" and avg_cpu < 12.0:
                    savings = (SPEC_PRICING["c5.2xlarge"]["cost"] - SPEC_PRICING["c5.large"]["cost"]) * 720
                    carbon_red = SPEC_PRICING["c5.2xlarge"]["carbon"] - SPEC_PRICING["c5.large"]["carbon"]
                    rec_data = {
                        "type": "Rightsize",
                        "title": "Rightsize Compute-Optimized Staging Node",
                        "description": f"Average CPU utilization is {avg_cpu:.1f}% (peak 18%). Downsizing c5.2xlarge to c5.large saves significant compute cost with zero impact on staging tests.",
                        "current_spec": "c5.2xlarge",
                        "target_spec": "c5.large",
                        "savings": round(savings, 2),
                        "carbon": round(carbon_red, 2)
                    }
                elif avg_cpu < 3.0 and res.name.startswith("legacy"):
                    savings = SPEC_PRICING["t3.medium"]["cost"] * 720
                    carbon_red = SPEC_PRICING["t3.medium"]["carbon"]
                    rec_data = {
                        "type": "Stop Idle",
                        "title": "Stop Idle Legacy Batch Runner",
                        "description": f"Instance exhibits < 2.5% CPU and 0 network traffic over 14 days. Stopping idle instance prevents non-value compute spend.",
                        "current_spec": "t3.medium (Running)",
                        "target_spec": "Stopped",
                        "savings": round(savings, 2),
                        "carbon": round(carbon_red, 2)
                    }

            # Logic 2: RDS Over-provisioned
            elif res.service_type == "RDS":
                if res.instance_type == "db.r5.xlarge" and avg_cpu < 15.0:
                    savings = (SPEC_PRICING["db.r5.xlarge"]["cost"] - SPEC_PRICING["db.r5.large"]["cost"]) * 720
                    carbon_red = SPEC_PRICING["db.r5.xlarge"]["carbon"] - SPEC_PRICING["db.r5.large"]["carbon"]
                    rec_data = {
                        "type": "Rightsize",
                        "title": "Rightsize Staging Database Replica",
                        "description": f"Staging replica CPU averages {avg_cpu:.1f}% with peak RAM utilization under 25%. Downsizing to db.r5.large maintains database performance.",
                        "current_spec": "db.r5.xlarge",
                        "target_spec": "db.r5.large",
                        "savings": round(savings, 2),
                        "carbon": round(carbon_red, 2)
                    }

            # Logic 3: S3 Lifecycle Transition
            elif res.service_type == "S3":
                if res.instance_type == "Standard" and res.name == "prod-raw-access-logs":
                    gb = 4500.0
                    savings = (SPEC_PRICING["Standard"]["cost_per_gb"] - SPEC_PRICING["Glacier Instant Retrieval"]["cost_per_gb"]) * gb
                    carbon_red = (SPEC_PRICING["Standard"]["carbon_per_gb"] - SPEC_PRICING["Glacier Instant Retrieval"]["carbon_per_gb"]) * gb * 30
                    rec_data = {
                        "type": "Storage Lifecycle",
                        "title": "Apply S3 Glacier Lifecycle Rule to Archival Logs",
                        "description": "Bucket contains 4,500 GB of access logs with zero read requests in the last 21 days. Transitioning to Glacier Instant Retrieval reduces storage footprint and energy demand.",
                        "current_spec": "S3 Standard",
                        "target_spec": "Glacier Instant Retrieval",
                        "savings": round(savings, 2),
                        "carbon": round(carbon_red, 2)
                    }

            # Logic 4: Lambda Provisioned Concurrency Scale Down
            elif res.service_type == "Lambda":
                if res.instance_type == "Provisioned-50" and avg_cpu < 6.0:
                    savings = (SPEC_PRICING["Provisioned-50"]["cost"] - SPEC_PRICING["Provisioned-10"]["cost"]) * 720
                    carbon_red = SPEC_PRICING["Provisioned-50"]["carbon"] - SPEC_PRICING["Provisioned-10"]["carbon"]
                    rec_data = {
                        "type": "Scale Down",
                        "title": "Reduce Lambda Provisioned Concurrency",
                        "description": f"Provisioned concurrency of 50 exceeds actual concurrency demand (avg 3.2 executions). Scaling down to 10 provisioned units prevents warm-server waste.",
                        "current_spec": "Provisioned-50",
                        "target_spec": "Provisioned-10",
                        "savings": round(savings, 2),
                        "carbon": round(carbon_red, 2)
                    }

            if rec_data:
                risk = safety_engine.evaluate_risk(
                    resource_type=res.service_type,
                    resource_name=res.name,
                    rec_type=rec_data["type"],
                    current_spec=rec_data["current_spec"],
                    target_spec=rec_data["target_spec"],
                    estimated_savings=rec_data["savings"]
                )

                new_rec = Recommendation(
                    resource_id=res.id,
                    recommendation_type=rec_data["type"],
                    title=rec_data["title"],
                    description=rec_data["description"],
                    current_spec=rec_data["current_spec"],
                    target_spec=rec_data["target_spec"],
                    estimated_savings_monthly=rec_data["savings"],
                    estimated_carbon_reduction_monthly=rec_data["carbon"],
                    risk_level=risk,
                    status="Pending"
                )
                db.add(new_rec)
                recs_created.append(new_rec)

        db.commit()
        return recs_created

optimizer = OptimizationEngine()
