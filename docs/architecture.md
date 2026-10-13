# GreenCloud AI Architecture Documentation

## System Architecture Overview

GreenCloud AI is designed as a hybrid AI-driven cloud governance and carbon-optimization platform. It bridges continuous monitoring, predictive ML modeling, risk-based safety automation, and closed-loop rollback verification.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             PRESENTATION LAYER                              │
│  Next.js 14 App Router, TypeScript, Tailwind CSS, Recharts, Lucide Icons   │
│  - Dashboard & KPIs    - Resource Visualizer    - Recommendation Hub       │
│  - Carbon Scheduler    - Governance Audit Log   - Policy Settings          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ REST API (JSON)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                             APPLICATION API LAYER                           │
│  FastAPI (Python 3.11+) Engine with Async Endpoints                        │
│  - /resources          - /metrics               - /recommendations         │
│  - /predictions        - /carbon                - /green-score             │
│  - /cost-analysis      - /audit-logs            - /scheduler               │
└──────────┬───────────────────────────┬──────────────────────────────┬───────┘
           │                           │                              │
┌──────────▼──────────┐   ┌────────────▼───────────┐     ┌────────────▼──────────┐
│   ML ENGINE         │   │ MOCK AWS CLIENT        │     │ OPTIMIZER & GOVERNANCE│
│ - Random Forest     │   │ - Synthetic Generator  │     │ - Mismatch Engine     │
│ - Demand Classifier │   │ - AWS CloudWatch/EC2   │     │ - Risk Classifier     │
│ - Scikit-Learn      │   │ - RDS & S3 Metrics     │     │ - Rollback Verifier   │
└──────────┬──────────┘   └────────────┬───────────┘     └────────────┬──────────┘
           │                           │                              │
┌──────────▼───────────────────────────▼──────────────────────────────▼──────────┐
│                             PERSISTENCE LAYER                               │
│  SQLite (SQLAlchemy ORM) / PostgreSQL compatible                            │
│  - Resources, Metrics, Predictions, Recommendations, Actions, Carbon Data    │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Core Modules & Data Flows

### 1. Metric Collection & AWS Client Simulation (`mock_provider.py`)
- Simulates realistic AWS CloudWatch metrics (CPU, Memory, Network, Request Count, Storage) for 30+ days.
- Designed behind an abstract base class (`BaseCloudProvider`) allowing seamless drop-in replacement with `boto3` for AWS deployment.

### 2. Machine Learning Demand Forecast (`ml/train.py` & `ml/predictor.py`)
- Features engineered: rolling 24-hour mean/max/min CPU/RAM, hour-of-day, day-of-week, network spikes.
- Target: 4-class workload demand (`Low`, `Medium`, `High`, `Very High`).
- Random Forest Classifier model evaluated using MAE, RMSE, and F1-score metrics.

### 3. Optimization & Recommendation Engine (`optimizer.py`)
- Evaluates provisioned instance specs against actual + ML-predicted 95th percentile metrics.
- Flag conditions:
  - CPU utilization average < 15% over 7 days -> **Rightsize** or **Stop Idle**.
  - Memory utilization < 25% -> **Downsize RAM-Optimized instance**.
  - Standard S3 bucket with zero access for 14+ days -> **S3 Lifecycle (IA/Glacier)**.
  - Auto Scaling Group over-provisioned during off-peak -> **Scale Down Schedule**.
- Calculates ESTIMATED cost savings ($/month) and ESTIMATED carbon reduction (kg CO2e/month).

### 4. Safety Guard & Automation Engine (`safety_rules.py` & `action_executor.py`)
- **Low-Risk Policy**: Non-production instances, dev/staging resource resizing, idle bucket lifecycle transitions. Auto-executable.
- **High-Risk Policy**: Production RDS/EC2 instances, >50% capacity reduction, database modifications. Requires admin UI approval.
- **Rollback Verification**: Re-evaluates post-action metrics. If CPU > 90% or simulated latency regresses by >30%, the action is immediately undone, logged, and marked as `Rolled Back`.

### 5. Composite Green Score Calculation (`green_score_calc.py`)
Weighted formula (0–100):
\[ \text{Green Score} = w_1 \cdot \text{Utilization Efficiency} + w_2 \cdot \text{Cost Efficiency} + w_3 \cdot \text{Carbon Efficiency} + w_4 \cdot \text{Safety Score} \]
Default weights: Utilization (30%), Cost (35%), Carbon (25%), Safety (10%).

---

## Infrastructure Deployment Model (Terraform Stubs)
The `/infra` directory includes production-ready Terraform manifests for AWS deployment:
- AWS VPC with public/private subnets across 3 Availability Zones.
- IAM Roles with least-privilege policies for CloudWatch metrics read and EC2/RDS modification.
- Lambda functions for continuous metrics sampling and rule evaluation.
- CloudWatch Alarms for CPU / Memory anomaly detection.
