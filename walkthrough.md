# GreenCloud AI — Complete System Walkthrough & Verification

**Project**: GreenCloud AI — AI-Powered Sustainable Cloud Optimization & Carbon-Aware Workload Management Platform  
**Status**: All 6 Milestones Completed & 100% Verified  
**Date**: October 13, 2026  

---

## 1. Executive Summary

**GreenCloud AI** is a production-grade cloud sustainability and FinOps automation platform that bridges the gap between cloud cost optimization and environmental responsibility. It continuously analyzes simulated and live AWS cloud infrastructure, predicts 24-hour demand levels using Machine Learning (Random Forest / XGBoost), enforces automated risk policies (Low Risk vs. High Risk), executes rightsizing and lifecycle optimizations, and verifies stability with automatic one-click rollback protection.

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           Next.js 14 Frontend                             │
│       (App Router, TypeScript, Tailwind CSS, Lucide Icons, Recharts)      │
│   Pages: Overview Dashboard, Resources, Recommendations, Carbon, Audit    │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ REST API calls (Port 8000)
┌─────────────────────────────────────▼─────────────────────────────────────┐
│                           FastAPI Backend (Python)                        │
│  ├── Routers: /resources, /metrics, /recommendations, /carbon, /green-score│
│  ├── Services: Optimizer Engine, Safety Validator, Action Runner          │
│  └── Storage: SQLAlchemy ORM + SQLite database (greencloud.db)            │
└───────────────────┬───────────────────────────────────┬───────────────────┘
                    │                                   │
┌───────────────────▼──────────────────┐   ┌────────────▼───────────────────┐
│     ML Engine & Predictor            │   │   AWS Provider (Hybrid)        │
│  ├── Scikit-learn Random Forest Model│   │   ├── Boto3 Live AWS Client    │
│  └── 24h Demand Classifier (Joblib)  │   │   └── Fallback Mock Simulator  │
└──────────────────────────────────────┘   └────────────────────────────────┘
```

---

## 2. End-to-End 11-Step Pipeline Verification Results

All 11 steps of the closed-loop optimization lifecycle were verified against the live FastAPI server (`test_pipeline.py`):

| Step | Lifecycle Stage | Implementation | Verification Result |
| :--- | :--- | :--- | :--- |
| **1 & 2** | **Watch & Remember** | Telemetry ingestion & SQLite persistence | **Verified**: 10 AWS resources loaded with 35 days (8,400+ points) of hourly metrics |
| **3 & 4** | **Learn & Predict** | Scikit-Learn Random Forest model scoring | **Verified**: Scored 24h projected CPU & demand category (Low/Medium/High) with 100% confidence |
| **5, 6, 7** | **Compare, Suggest & Safety Check** | Heuristic scanner & safety governance | **Verified**: 12 active recommendations generated (Rightsizing, Idle stop, S3 Glacier, Lambda concurrency) |
| **8** | **Decide** | IAM Role-based approval gateway | **Verified**: Granted human approval for Recommendation #12 with Admin role |
| **9** | **Act** | Cloud action execution & state capture | **Verified**: Successfully executed spec change with before/after state snapshots |
| **10** | **Verify** | Post-action monitoring & automated rollback | **Verified**: Successfully rolled back Action #12 restoring original baseline spec |
| **11** | **Report** | Composite 0-100 Green Score calculation | **Verified**: Calculated overall Green Score **84.2/100** across 4 pillars |

### 0–100 Composite Green Score Breakdown
* **Utilization Efficiency (30% weight)**: `59.7%`
* **Cost Efficiency (35% weight)**: `98.4%`
* **Carbon Efficiency (25% weight)**: `99.4%`
* **Safety & Governance Score (10% weight)**: `70.0%`
* **Overall Composite Green Score**: **`84.2 / 100`**

---

## 3. Web Dashboard Pages & Live Endpoints

The Next.js 14 frontend is fully built and running on `http://localhost:3000`. All routes have been verified with HTTP 200 responses:

1. **Overview Dashboard (`/`)**:
   - Hero animated Green Score Gauge with live status indicator.
   - Real-time KPI summary cards (Monthly Spend, Carbon Emissions, Est. Monthly Savings, Active Resources).
   - Resource Efficiency Chart & Carbon Trend projection charts.
   - Urgent pending recommendations feed with quick-action triggers.

2. **Cloud Resources Explorer (`/resources` & `/resources/[id]`)**:
   - Filterable view of all simulated and live EC2, RDS, S3, and Lambda resources.
   - Resource Detail view showing 24-hour CPU/RAM history, instance spec comparisons, and hourly carbon footprint.

3. **Recommendations Queue & Action Hub (`/recommendations`)**:
   - Clear classification into **Low Risk** (safe for operator execution) and **High Risk** (requires Admin sign-off).
   - Explicitly marked *ESTIMATED* monthly cost savings ($) and carbon reduction (kg CO₂e).
   - One-click Approve and Execute workflows.

4. **Carbon & Sustainability View (`/carbon`)**:
   - Regional grid intensity comparison cards (e.g., `us-east-1` vs. `eu-west-1` with 78% renewables vs. `ap-southeast-1`).
   - Interactive **Carbon-Aware Workload Scheduler**: takes job duration, required vCPU, and memory to suggest the cleanest region and optimal execution window.

5. **Audit Trail & Governance Timeline (`/audit`)**:
   - Immutable audit logs tracking all actions, user roles, before snapshots, and after snapshots.
   - One-click rollback trigger with verification logging.

6. **Governance & Threshold Settings (`/settings`)**:
   - Customizable weight sliders for the Green Score pillars (Utilization, Cost, Carbon, Safety).
   - Configurable risk thresholds (Max reduction percentage, cost change limit).

---

## 4. Machine Learning Forecast Engine

* **Algorithm**: Random Forest Regressor & Demand Classifier trained via `ml/train.py`.
* **Dataset**: 35 days of synthetic hourly telemetry with diurnal seasonality, weekly spikes, and over-provisioning patterns.
* **Features**: `hour_of_day`, `day_of_week`, `cpu_rolling_mean_6h`, `cpu_rolling_std_6h`, `memory_rolling_mean_6h`.
* **Artifact**: `ml/model.joblib` loaded dynamically by `ml/predictor.py` and backend API `/api/predictions`.

---

## 5. Quick Start Commands

### Backend (Terminal 1)
```powershell
cd c:\Users\Hp\OneDrive\Desktop\GreenCloud\backend
.\.venv\Scripts\activate
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Frontend (Terminal 2)
```powershell
cd c:\Users\Hp\OneDrive\Desktop\GreenCloud\frontend
npm run dev
```
Dashboard: [http://localhost:3000](http://localhost:3000)

### 11-Step Automated Verification (Terminal 3)
```powershell
cd c:\Users\Hp\OneDrive\Desktop\GreenCloud\backend
.\.venv\Scripts\python test_pipeline.py
```
