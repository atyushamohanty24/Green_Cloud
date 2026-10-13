# GreenCloud AI — Task Tracking Checklist

- [x] **Milestone 1: Planning & Architecture (Completed)**
  - [x] Create `implementation_plan.md`
  - [x] Create `task.md`
  - [x] Write `docs/architecture.md`
  - [x] Write `docs/data-model.md`

- [x] **Milestone 2: ML Pipeline & Synthetic Generator**
  - [x] Implement `ml/synthetic_generator.py` (30 days of hourly metrics for EC2, RDS, S3, Lambda with seasonality & over-provisioned targets)
  - [x] Implement `ml/train.py` (Random Forest / XGBoost training, MAE/RMSE/F1 evaluation)
  - [x] Implement `ml/predictor.py` (Inference engine wrapper)
  - [x] Generate model artifact `ml/model.joblib`

- [x] **Milestone 3: Backend API (FastAPI + SQLAlchemy)**
  - [x] Setup FastAPI project layout, config, DB models & schemas
  - [x] Seed database (`seed_db.py`) with resources, metrics, carbon data
  - [x] Build services: `mock_provider.py`, `optimizer.py`, `safety_rules.py`, `action_executor.py`, `green_score_calc.py`
  - [x] Implement required endpoints:
    - [x] `GET /api/resources`
    - [x] `GET /api/resources/{id}`
    - [x] `GET /api/metrics/{resourceId}`
    - [x] `GET /api/recommendations`
    - [x] `POST /api/recommendations/{id}/approve`
    - [x] `POST /api/recommendations/{id}/execute`
    - [x] `GET /api/predictions`
    - [x] `GET /api/carbon`
    - [x] `GET /api/green-score`
    - [x] `GET /api/cost-analysis`
    - [x] `GET /api/audit-logs`
    - [x] `POST /api/scheduler/recommend`
    - [x] `POST /api/simulation/rollback/{action_id}`

- [x] **Milestone 4: Next.js Frontend Development**
  - [x] Initialize Next.js project with App Router, TypeScript, Tailwind CSS, lucide-react, framer-motion, recharts
  - [x] Configure Dark/Light mode theme system & Tailwind tokens
  - [x] Build layout, Navbar, Sidebar with role selector (Admin / Operator / Viewer)
  - [x] Page 1: Overview Dashboard (Green Score Dial, KPI count-ups, recommendations feed, efficiency chart, carbon trend chart)
  - [x] Page 2: Resources List & Resource Detail view (utilization history, sizing comparison)
  - [x] Page 3: Recommendations Queue & Action Hub (Filter, approve, execute, risk badges)
  - [x] Page 4: Carbon & Sustainability view + interactive Carbon-Aware Scheduler
  - [x] Page 5: Audit Log & Governance timeline (Before/after metrics, policy status, rollback logs)
  - [x] Page 6: Settings (Green Score weight sliders, risk policy thresholds)

- [x] **Milestone 5: Infrastructure Stubs & Docker Compose**
  - [x] Create `infra/` directory with Terraform stubs (`main.tf`, `vpc.tf`, `iam.tf`, `cloudwatch.tf`)
  - [x] Create `docker-compose.yml` for unified local execution

- [x] **Milestone 6: Verification, Visual Proof & Polish**
  - [x] Test end-to-end flow from backend to frontend
  - [x] Run backend test pipeline verification & Next.js production build check
  - [x] Produce walkthrough artifact (`walkthrough.md`) with comprehensive system summary
