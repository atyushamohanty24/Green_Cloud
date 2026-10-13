from fastapi import APIRouter
from app.schemas.schemas import SchedulerRequest, SchedulerResponse

router = APIRouter(prefix="/scheduler", tags=["Carbon Scheduler"])

REGIONS_DATA = {
    "us-east-1": {
        "name": "us-east-1 (N. Virginia)",
        "carbon_intensity_g_co2_kwh": 375.0,
        "hourly_cost_per_vcpu": 0.042,
        "clean_energy_pct": 42.0,
        "optimal_window": "02:00 UTC - 06:00 UTC"
    },
    "eu-west-1": {
        "name": "eu-west-1 (Ireland)",
        "carbon_intensity_g_co2_kwh": 180.0,
        "hourly_cost_per_vcpu": 0.048,
        "clean_energy_pct": 78.0,
        "optimal_window": "11:00 UTC - 17:00 UTC"
    },
    "ap-southeast-1": {
        "name": "ap-southeast-1 (Singapore)",
        "carbon_intensity_g_co2_kwh": 410.0,
        "hourly_cost_per_vcpu": 0.045,
        "clean_energy_pct": 28.0,
        "optimal_window": "04:00 UTC - 08:00 UTC"
    }
}

@router.post("/recommend", response_model=SchedulerResponse)
def calculate_optimal_schedule(payload: SchedulerRequest):
    vcpus = payload.required_vcpu
    duration = payload.duration_hours
    
    comparisons = []
    best_region = None
    min_carbon = float("inf")
    
    for r_code in payload.preferred_regions:
        r_info = REGIONS_DATA.get(r_code, REGIONS_DATA["us-east-1"])
        
        # Energy estimate (kWh): ~50 Watts per vCPU hour = 0.05 kWh/vCPU/hr
        kwh_consumed = 0.05 * vcpus * duration
        carbon_emitted_g = kwh_consumed * r_info["carbon_intensity_g_co2_kwh"]
        cost_usd = vcpus * r_info["hourly_cost_per_vcpu"] * duration
        
        comp_item = {
            "region_code": r_code,
            "region_name": r_info["name"],
            "carbon_intensity": r_info["carbon_intensity_g_co2_kwh"],
            "clean_energy_pct": r_info["clean_energy_pct"],
            "estimated_cost_usd": round(cost_usd, 3),
            "estimated_carbon_g_co2": round(carbon_emitted_g, 1),
            "optimal_window": r_info["optimal_window"]
        }
        comparisons.append(comp_item)
        
        if carbon_emitted_g < min_carbon:
            min_carbon = carbon_emitted_g
            best_region = comp_item

    # Calculate savings vs worst region
    worst_carbon = max(c["estimated_carbon_g_co2"] for c in comparisons)
    carbon_saved_pct = round(((worst_carbon - min_carbon) / worst_carbon) * 100.0, 1)

    explanation = (
        f"Selected {best_region['region_name']} because its grid is powered by {best_region['clean_energy_pct']}% renewable "
        f"energy (wind/hydro), resulting in a low carbon intensity of {best_region['carbon_intensity']} g CO2/kWh. "
        f"Running the job '{payload.job_name}' in this region during the recommended window ({best_region['optimal_window']}) "
        f"reduces estimated carbon emissions by {carbon_saved_pct}% compared to high-intensity regions."
    )

    return SchedulerResponse(
        recommended_region=best_region["region_code"],
        recommended_start_time=best_region["optimal_window"],
        estimated_cost_usd=best_region["estimated_cost_usd"],
        estimated_carbon_g_co2=best_region["estimated_carbon_g_co2"],
        carbon_intensity=best_region["carbon_intensity"],
        cost_per_hour=round(best_region["estimated_cost_usd"] / duration, 3),
        explanation=explanation,
        comparison=comparisons
    )
