import random
import math
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

# List of realistic simulated resources
RESOURCE_SPECS = [
    {
        "id": "i-0a82b3c14f91e",
        "name": "prod-web-frontend-01",
        "service_type": "EC2",
        "region": "us-east-1",
        "instance_type": "t3.large",
        "base_cpu": 65.0,
        "cpu_variance": 18.0,
        "base_mem": 70.0,
        "base_cost_hourly": 0.0832,
        "base_carbon_hourly": 18.5,
        "overprovisioned": False,
        "idle": False
    },
    {
        "id": "i-0f9e1a2b3c4d5",
        "name": "dev-api-backend-02",
        "service_type": "EC2",
        "region": "us-east-1",
        "instance_type": "t3.xlarge",
        "base_cpu": 11.5,
        "cpu_variance": 4.0,
        "base_mem": 22.0,
        "base_cost_hourly": 0.1664,
        "base_carbon_hourly": 37.0,
        "overprovisioned": True,
        "target_spec": "t3.medium",
        "idle": False
    },
    {
        "id": "i-0d7c6b5a4f3e2",
        "name": "staging-worker-cluster",
        "service_type": "EC2",
        "region": "eu-west-1",
        "instance_type": "c5.2xlarge",
        "base_cpu": 8.2,
        "cpu_variance": 3.0,
        "base_mem": 18.0,
        "base_cost_hourly": 0.34,
        "base_carbon_hourly": 75.0,
        "overprovisioned": True,
        "target_spec": "c5.large",
        "idle": False
    },
    {
        "id": "i-0b1a2c3d4e5f6",
        "name": "legacy-batch-runner",
        "service_type": "EC2",
        "region": "us-east-1",
        "instance_type": "t3.medium",
        "base_cpu": 2.1,
        "cpu_variance": 0.8,
        "base_mem": 14.0,
        "base_cost_hourly": 0.0416,
        "base_carbon_hourly": 9.2,
        "overprovisioned": False,
        "idle": True,
        "target_spec": "Stopped"
    },
    {
        "id": "i-0e8d7c6b5a4f3",
        "name": "analytics-ml-node-01",
        "service_type": "EC2",
        "region": "ap-southeast-1",
        "instance_type": "m5.xlarge",
        "base_cpu": 78.0,
        "cpu_variance": 12.0,
        "base_mem": 82.0,
        "base_cost_hourly": 0.192,
        "base_carbon_hourly": 42.0,
        "overprovisioned": False,
        "idle": False
    },
    {
        "id": "rds-db-prod-main",
        "name": "prod-postgresql-primary",
        "service_type": "RDS",
        "region": "us-east-1",
        "instance_type": "db.r5.2xlarge",
        "base_cpu": 54.0,
        "cpu_variance": 15.0,
        "base_mem": 62.0,
        "base_cost_hourly": 0.96,
        "base_carbon_hourly": 210.0,
        "overprovisioned": False,
        "idle": False
    },
    {
        "id": "rds-db-staging-analytics",
        "name": "staging-db-replica",
        "service_type": "RDS",
        "region": "eu-west-1",
        "instance_type": "db.r5.xlarge",
        "base_cpu": 13.5,
        "cpu_variance": 4.5,
        "base_mem": 24.0,
        "base_cost_hourly": 0.48,
        "base_carbon_hourly": 105.0,
        "overprovisioned": True,
        "target_spec": "db.r5.large",
        "idle": False
    },
    {
        "id": "s3-logs-archival-prod",
        "name": "prod-raw-access-logs",
        "service_type": "S3",
        "region": "us-east-1",
        "instance_type": "Standard",
        "base_cpu": 0.0,
        "cpu_variance": 0.0,
        "base_mem": 0.0,
        "base_cost_hourly": 0.1035, # 4500 GB * $0.023 / 720
        "base_carbon_hourly": 12.0,
        "storage_gb": 4500.0,
        "access_count_daily": 0,
        "overprovisioned": True,
        "target_spec": "Glacier Instant Retrieval",
        "idle": False
    },
    {
        "id": "s3-user-uploads-live",
        "name": "media-user-uploads-bucket",
        "service_type": "S3",
        "region": "us-east-1",
        "instance_type": "Standard",
        "base_cpu": 0.0,
        "cpu_variance": 0.0,
        "base_mem": 0.0,
        "base_cost_hourly": 0.0276, # 1200 GB
        "base_carbon_hourly": 3.2,
        "storage_gb": 1200.0,
        "access_count_daily": 14500,
        "overprovisioned": False,
        "idle": False
    },
    {
        "id": "lambda-image-resizer",
        "name": "thumbnail-resizer-service",
        "service_type": "Lambda",
        "region": "eu-west-1",
        "instance_type": "Provisioned-50",
        "base_cpu": 4.2,
        "cpu_variance": 2.0,
        "base_mem": 12.0,
        "base_cost_hourly": 0.15,
        "base_carbon_hourly": 16.0,
        "overprovisioned": True,
        "target_spec": "Provisioned-10",
        "idle": False
    }
]

def generate_synthetic_data(days=35):
    """Generates hourly synthetic metric records for 35 days (840 hours per resource)."""
    end_time = datetime.now().replace(minute=0, second=0, microsecond=0)
    start_time = end_time - timedelta(days=days)
    
    data = []
    
    total_hours = days * 24
    for hour_idx in range(total_hours):
        current_time = start_time + timedelta(hours=hour_idx)
        hour_of_day = current_time.hour
        day_of_week = current_time.weekday()
        
        # Diurnal (daily) cycle factor: peak at 14:00 (2 PM), low at 04:00 (4 AM)
        daily_factor = 0.5 + 0.5 * math.sin((hour_of_day - 8) * math.pi / 12)
        # Weekly cycle factor: weekdays higher, weekend lower
        weekly_factor = 1.0 if day_of_week < 5 else 0.6
        
        for spec in RESOURCE_SPECS:
            res_id = spec["id"]
            
            if spec["service_type"] in ["EC2", "RDS", "Lambda"]:
                # Calculate CPU
                base_cpu = spec["base_cpu"]
                variance = spec["cpu_variance"]
                noise = np.random.normal(0, variance * 0.4)
                
                if spec["overprovisioned"]:
                    # Stay consistently low even during peak
                    cpu = max(1.0, min(100.0, base_cpu + daily_factor * variance * 0.3 + noise))
                elif spec["idle"]:
                    cpu = max(0.5, min(5.0, base_cpu + noise))
                else:
                    # Normal active resource
                    cpu = max(5.0, min(99.0, base_cpu + (daily_factor * weekly_factor * variance) + noise))
                
                # RAM correlation
                mem_base = spec["base_mem"]
                mem = max(5.0, min(99.0, mem_base + (cpu * 0.2) + np.random.normal(0, 2.0)))
                
                net_in = max(10.0, cpu * 150 + np.random.normal(0, 100))
                net_out = max(20.0, cpu * 300 + np.random.normal(0, 200))
                requests = max(0, int(cpu * 45 + np.random.normal(0, 50))) if spec["service_type"] != "RDS" else max(0, int(cpu * 120 + np.random.normal(0, 100)))
                storage = 100.0 if spec["service_type"] == "EC2" else 500.0
            else:
                # S3
                cpu = 0.0
                mem = 0.0
                net_in = 500.0 if not spec["overprovisioned"] else 0.0
                net_out = 2500.0 if not spec["overprovisioned"] else 0.0
                requests = spec.get("access_count_daily", 0) / 24.0
                storage = spec.get("storage_gb", 100.0)
            
            # Demand classification label for ML
            if cpu < 15.0:
                demand_label = "Low"
            elif cpu < 50.0:
                demand_label = "Medium"
            elif cpu < 80.0:
                demand_label = "High"
            else:
                demand_label = "Very High"
                
            data.append({
                "resource_id": res_id,
                "timestamp": current_time,
                "hour_of_day": hour_of_day,
                "day_of_week": day_of_week,
                "cpu_utilization": round(cpu, 2),
                "memory_utilization": round(mem, 2),
                "network_in_kb": round(net_in, 2),
                "network_out_kb": round(net_out, 2),
                "request_count": float(requests),
                "storage_used_gb": round(storage, 2),
                "demand_label": demand_label
            })
            
    df = pd.DataFrame(data)
    return df, RESOURCE_SPECS

if __name__ == "__main__":
    df, specs = generate_synthetic_data(days=35)
    print(f"Generated {len(df)} metric records for {len(specs)} resources.")
    print(df.head(10))
    df.to_csv("ml/synthetic_metrics.csv", index=False)
    print("Saved to ml/synthetic_metrics.csv")
