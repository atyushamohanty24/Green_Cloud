# GreenCloud AI Data Model Documentation

## Entity Relationship Summary

GreenCloud AI uses an ORM-backed relational schema (SQLite for local dev, PostgreSQL ready) tracking cloud resources, metrics, ML forecasts, optimization recommendations, execution governance actions, carbon grid data, and user roles.

---

## Data Schema & Entities

### 1. `users`
Simulates identity and permission levels for automated policy governance.
- `id` (INTEGER, Primary Key)
- `username` (VARCHAR, Unique, Not Null)
- `email` (VARCHAR, Unique, Not Null)
- `role` (VARCHAR: `admin`, `operator`, `viewer`) - Controls action execution privileges.

### 2. `cloud_resources`
Represents monitored AWS infrastructure.
- `id` (VARCHAR, Primary Key) - e.g. `i-0a82b3c14f91e`, `rds-db-prod-01`, `s3-analytics-data`
- `name` (VARCHAR, Not Null)
- `service_type` (VARCHAR) - `EC2`, `RDS`, `S3`, `Lambda`
- `region` (VARCHAR) - e.g. `us-east-1`, `eu-west-1`, `ap-southeast-1`
- `instance_type` (VARCHAR) - e.g. `t3.large`, `db.r5.xlarge`, `Standard`
- `status` (VARCHAR) - `running`, `stopped`, `resized`, `optimized`
- `hourly_cost` (FLOAT) - Baseline hourly cost in USD.
- `carbon_footprint_hourly` (FLOAT) - Estimated hourly carbon output in grams CO2e.
- `created_at` (DATETIME)

### 3. `metrics`
Stores time-series utilization metrics sampled hourly.
- `id` (INTEGER, Primary Key)
- `resource_id` (VARCHAR, Foreign Key -> `cloud_resources.id`)
- `timestamp` (DATETIME, Not Null)
- `cpu_utilization` (FLOAT) - Percentage (0–100)
- `memory_utilization` (FLOAT) - Percentage (0–100)
- `network_in_kb` (FLOAT)
- `network_out_kb` (FLOAT)
- `request_count` (FLOAT)
- `storage_used_gb` (FLOAT)

### 4. `predictions`
ML demand classification and forecasting output.
- `id` (INTEGER, Primary Key)
- `resource_id` (VARCHAR, Foreign Key -> `cloud_resources.id`)
- `timestamp` (DATETIME, Not Null)
- `predicted_demand` (VARCHAR) - `Low`, `Medium`, `High`, `Very High`
- `confidence_score` (FLOAT) - Probability (0.0 to 1.0)
- `predicted_cpu` (FLOAT) - Forecasted CPU % over next 24h window.

### 5. `recommendations`
Actionable rightsizing, lifecycle, and scaling recommendations.
- `id` (INTEGER, Primary Key)
- `resource_id` (VARCHAR, Foreign Key -> `cloud_resources.id`)
- `recommendation_type` (VARCHAR) - `Rightsize`, `Stop Idle`, `Storage Lifecycle`, `Scale Down`
- `title` (VARCHAR)
- `description` (TEXT)
- `current_spec` (VARCHAR)
- `target_spec` (VARCHAR)
- `estimated_savings_monthly` (FLOAT) - **ESTIMATED** USD monthly savings.
- `estimated_carbon_reduction_monthly` (FLOAT) - **ESTIMATED** kg CO2e monthly reduction.
- `risk_level` (VARCHAR) - `Low`, `High`
- `status` (VARCHAR) - `Pending`, `Approved`, `Rejected`, `Executed`, `Rolled Back`
- `created_at` (DATETIME)

### 6. `actions`
Audit table logging state modifications and verification snapshots.
- `id` (INTEGER, Primary Key)
- `recommendation_id` (INTEGER, Foreign Key -> `recommendations.id`)
- `resource_id` (VARCHAR, Foreign Key -> `cloud_resources.id`)
- `user_role` (VARCHAR) - IAM role performing action (`admin`, `system_auto`, etc.)
- `action_type` (VARCHAR)
- `before_snapshot` (JSON) - Metric & spec state before action.
- `after_snapshot` (JSON) - Metric & spec state after action.
- `status` (VARCHAR) - `Success`, `Failed`, `Rolled Back`
- `executed_at` (DATETIME)

### 7. `carbon_data`
Regional grid carbon intensity parameters for Carbon-Aware Scheduling.
- `id` (INTEGER, Primary Key)
- `region` (VARCHAR)
- `carbon_intensity_g_co2_kwh` (FLOAT) - Regional grid carbon intensity in gCO2/kWh.
- `grid_cleanliness_pct` (FLOAT) - Renewable energy grid percentage.
- `timestamp` (DATETIME)

### 8. `audit_logs`
Chronological event log for safety governance.
- `id` (INTEGER, Primary Key)
- `event_type` (VARCHAR) - `RECOMMENDATION_GENERATED`, `APPROVAL_GRANTED`, `ACTION_EXECUTED`, `ROLLBACK_TRIGGERED`
- `actor` (VARCHAR)
- `resource_id` (VARCHAR)
- `recommendation_id` (INTEGER, Optional)
- `details` (TEXT)
- `timestamp` (DATETIME)
