import os
from dotenv import load_dotenv

# Load environment variables from .env
_base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(os.path.join(_base_dir, ".env"))
load_dotenv(os.path.join(os.path.dirname(_base_dir), ".env"))

class Settings:
    PROJECT_NAME: str = "GreenCloud AI Engine"
    API_V1_STR: str = "/api"
    BASE_DIR: str = _base_dir
    DB_PATH: str = os.path.join(_base_dir, "greencloud.db").replace("\\", "/")
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")
    
    # AWS Authentication & Region
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_DEFAULT_REGION: str = os.getenv("AWS_DEFAULT_REGION", "ap-south-1")
    AWS_ROLE_ARN: str = os.getenv("AWS_ROLE_ARN", "")
    
    # AWS Provisioned Resources
    AWS_VPC_ID: str = os.getenv("AWS_VPC_ID", "")
    AWS_SUBNET_1_ID: str = os.getenv("AWS_SUBNET_1_ID", "")
    AWS_SUBNET_2_ID: str = os.getenv("AWS_SUBNET_2_ID", "")
    AWS_BACKEND_SG_ID: str = os.getenv("AWS_BACKEND_SG_ID", "")
    AWS_FRONTEND_SG_ID: str = os.getenv("AWS_FRONTEND_SG_ID", "")
    AWS_RDS_SG_ID: str = os.getenv("AWS_RDS_SG_ID", "")
    AWS_S3_LOGS_BUCKET: str = os.getenv("AWS_S3_LOGS_BUCKET", "")
    AWS_S3_TELEMETRY_BUCKET: str = os.getenv("AWS_S3_TELEMETRY_BUCKET", "")
    AWS_LAMBDA_FUNCTION_NAME: str = os.getenv("AWS_LAMBDA_FUNCTION_NAME", "")
    AWS_CLOUDWATCH_ALARM_NAME: str = os.getenv("AWS_CLOUDWATCH_ALARM_NAME", "")
    
    # Target EC2 Instances
    EC2_PROD_FRONTEND_ID: str = os.getenv("EC2_PROD_FRONTEND_ID", "")
    EC2_DEV_BACKEND_ID: str = os.getenv("EC2_DEV_BACKEND_ID", "")
    EC2_STAGING_WORKER_ID: str = os.getenv("EC2_STAGING_WORKER_ID", "")
    EC2_LEGACY_BATCH_ID: str = os.getenv("EC2_LEGACY_BATCH_ID", "")
    
    # Default Green Score Weights
    DEFAULT_WEIGHT_UTILIZATION: float = 0.30
    DEFAULT_WEIGHT_COST: float = 0.35
    DEFAULT_WEIGHT_CARBON: float = 0.25
    DEFAULT_WEIGHT_SAFETY: float = 0.10
    
    # Risk policy thresholds
    HIGH_RISK_COST_THRESHOLD_MONTHLY: float = 200.0  # Savings > $200/mo triggers high-risk review
    HIGH_RISK_CAPACITY_REDUCTION_PCT: float = 50.0   # Scale down > 50% triggers high-risk review

settings = Settings()

