import os
import sys
from datetime import datetime

# Add root and backend to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.database import engine, Base, SessionLocal
from app.models.models import User, CloudResource, Metric, CarbonData, AuditLog
from app.services.optimizer import optimizer
from ml.synthetic_generator import generate_synthetic_data

def seed_database():
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # 1. Seed Users (IAM Roles)
        print("Seeding IAM simulated users...")
        users = [
            User(username="admin_sustainability", email="admin@greencloud.ai", role="admin"),
            User(username="devops_operator", email="operator@greencloud.ai", role="operator"),
            User(username="auditor_viewer", email="viewer@greencloud.ai", role="viewer")
        ]
        db.add_all(users)
        db.commit()

        # 2. Seed Carbon Regional Grid Data
        print("Seeding Regional Carbon Intensity data...")
        carbon_data = [
            CarbonData(region="us-east-1", carbon_intensity_g_co2_kwh=375.0, grid_cleanliness_pct=42.0),
            CarbonData(region="eu-west-1", carbon_intensity_g_co2_kwh=180.0, grid_cleanliness_pct=78.0),
            CarbonData(region="ap-southeast-1", carbon_intensity_g_co2_kwh=410.0, grid_cleanliness_pct=28.0)
        ]
        db.add_all(carbon_data)
        db.commit()

        # 3. Generate and Seed Resources & Synthetic Metrics
        print("Generating 35 days of hourly synthetic metrics...")
        df, specs = generate_synthetic_data(days=35)

        print("Seeding Cloud Resources...")
        for spec in specs:
            res = CloudResource(
                id=spec["id"],
                name=spec["name"],
                service_type=spec["service_type"],
                region=spec["region"],
                instance_type=spec["instance_type"],
                status="running",
                hourly_cost=spec["base_cost_hourly"],
                carbon_footprint_hourly=spec["base_carbon_hourly"],
                created_at=datetime.utcnow()
            )
            db.add(res)
        db.commit()

        print(f"Bulk inserting {len(df)} metric records...")
        metrics_objs = []
        for idx, row in df.iterrows():
            m = Metric(
                resource_id=row["resource_id"],
                timestamp=pd_to_dt(row["timestamp"]),
                cpu_utilization=float(row["cpu_utilization"]),
                memory_utilization=float(row["memory_utilization"]),
                network_in_kb=float(row["network_in_kb"]),
                network_out_kb=float(row["network_out_kb"]),
                request_count=float(row["request_count"]),
                storage_used_gb=float(row["storage_used_gb"])
            )
            metrics_objs.append(m)

        # Batch insert
        db.bulk_save_objects(metrics_objs)
        db.commit()

        # 4. Generate Recommendations via Optimization Engine
        print("Generating optimization recommendations...")
        recs = optimizer.scan_and_generate_recommendations(db)
        print(f"Generated {len(recs)} optimization recommendations.")

        # 5. Log Initial Audit Event
        audit = AuditLog(
            event_type="SYSTEM_INITIALIZED",
            actor="SYSTEM_INIT",
            details=f"GreenCloud AI engine initialized. Ingested {len(df)} telemetry metric points across {len(specs)} AWS cloud resources."
        )
        db.add(audit)
        db.commit()

        print("\nDatabase seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

def pd_to_dt(val):
    if hasattr(val, "to_pydatetime"):
        return val.to_pydatetime()
    return val

if __name__ == "__main__":
    seed_database()
