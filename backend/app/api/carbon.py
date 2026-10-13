from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import CarbonData, Recommendation, CloudResource

router = APIRouter(prefix="/carbon", tags=["Carbon & Sustainability"])

@router.get("")
def get_carbon_summary(db: Session = Depends(get_db)):
    carbon_records = db.query(CarbonData).all()
    recs = db.query(Recommendation).all()

    total_est_carbon_reduction_kg = sum(r.estimated_carbon_reduction_monthly for r in recs if r.status in ["Pending", "Approved", "Executed"])
    executed_carbon_reduction_kg = sum(r.estimated_carbon_reduction_monthly for r in recs if r.status == "Executed")

    regional_grid = [
        {
            "region": "us-east-1 (N. Virginia)",
            "carbon_intensity_g_co2_kwh": 375.0,
            "grid_cleanliness_pct": 42.0,
            "primary_energy": "Natural Gas & Nuclear",
            "cost_index": "$$"
        },
        {
            "region": "eu-west-1 (Ireland)",
            "carbon_intensity_g_co2_kwh": 180.0,
            "grid_cleanliness_pct": 78.0,
            "primary_energy": "Wind & Hydro",
            "cost_index": "$$$"
        },
        {
            "region": "ap-southeast-1 (Singapore)",
            "carbon_intensity_g_co2_kwh": 410.0,
            "grid_cleanliness_pct": 28.0,
            "primary_energy": "Natural Gas & Solar",
            "cost_index": "$$"
        }
    ]

    # Hourly carbon emission trend over 24h
    trend_24h = []
    for h in range(24):
        trend_24h.append({
            "hour": f"{h:02d}:00",
            "estimated_baseline_kg": round(42.5 + (h % 6) * 1.5, 1),
            "estimated_optimized_kg": round(28.0 + (h % 6) * 0.8, 1)
        })

    return {
        "total_estimated_monthly_reduction_kg": round(total_est_carbon_reduction_kg, 1),
        "executed_monthly_reduction_kg": round(executed_carbon_reduction_kg, 1),
        "equivalent_trees_planted_annually": int(total_est_carbon_reduction_kg * 12 / 21.77), # ~21.77 kg CO2/tree/year
        "regional_grid_intensity": regional_grid,
        "emissions_trend_24h": trend_24h
    }
