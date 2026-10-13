from typing import Dict, Any

class SafetyRuleEngine:
    """
    Evaluates optimization recommendations against security and operational safety rules
    to classify them as 'Low' or 'High' risk.
    """

    def evaluate_risk(self, resource_type: str, resource_name: str, rec_type: str, current_spec: str, target_spec: str, estimated_savings: float) -> str:
        # Rule 1: Any modification to Production databases is HIGH RISK
        if resource_type == "RDS" and "prod" in resource_name.lower():
            return "High"

        # Rule 2: Production web server rightsizing is HIGH RISK (requires admin review)
        if "prod" in resource_name.lower() and rec_type == "Rightsize":
            return "High"

        # Rule 3: High financial impact recommendations (>$200/mo) require human review
        if estimated_savings > 200.0:
            return "High"

        # Rule 4: Stopping a resource permanently is HIGH RISK unless explicitly non-prod idle
        if rec_type == "Stop Idle" and "prod" in resource_name.lower():
            return "High"

        # Rule 5: Dev / Staging rightsizing & S3 lifecycle transitions are LOW RISK
        if rec_type == "Storage Lifecycle":
            return "Low"

        if ("dev" in resource_name.lower() or "staging" in resource_name.lower()) and rec_type in ["Rightsize", "Scale Down"]:
            return "Low"

        if rec_type == "Stop Idle" and ("legacy" in resource_name.lower() or "dev" in resource_name.lower()):
            return "Low"

        # Default fallback: Low risk
        return "Low"

safety_engine = SafetyRuleEngine()
