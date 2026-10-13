# Green_Cloud

> **AI-Powered Sustainable Cloud Optimization & Carbon-Aware Workload Management Platform**

GreenCloud AI is an enterprise-grade platform combining **FinOps** (Cloud Cost Optimization) and **GreenOps** (Carbon Footprint Reduction). It continuously analyzes cloud telemetry, uses Machine Learning to predict workload demand 24 hours in advance, enforces automated safety policies, executes rightsizing and archival actions on AWS via Boto3, and provides automated regression rollbacks.

---

## 🌟 Key Highlights

- **Predictive Demand Forecasting**: Supervised Random Forest and XGBoost regression/classification trained on multi-week cyclical telemetry.
- **Composite Green Score (0–100)**: Unified index evaluating Resource Utilization (30%), Cost Efficiency (35%), Carbon Grid Cleanliness (25%), and SLA Safety (10%).
- **Carbon-Aware Workload Placement**: Shifts heavy batch jobs to global AWS regions with the highest renewable energy grid percentage (e.g., `eu-west-1` Ireland).
- **Automated Regression Verifier & Rollback**: Captures before-and-after snapshots of cloud assets, automatically rolling back changes if performance regressions are detected.
- **Live AWS Cloud Integration**: Connected to real AWS resources (VPC, Subnets, EC2 instances, S3 Glacier lifecycle rules, Lambda functions, and CloudWatch Alarms) via AWS CLI and Boto3.

---

## 🏗️ Architecture Overview

```
[AWS Cloud Resources / Telemetry]
   │ (EC2, S3, RDS, Lambda, CloudWatch)
   ▼
[FastAPI Backend Engine] ──────────► [Database: SQLite / PostgreSQL]
   │                                           │
   ▼                                           ▼
[ML Demand Predictor]                  [Optimization Engine]
(Random Forest & XGBoost)                     │ (Scans rightsizing, idle stop,
   │ (24h future forecast)                    │  storage tiering rules)
   └────────────────────────┬──────────────────┘
                            ▼
                  [Safety Rules Engine]
                  (Evaluates Low vs High Risk)
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
      [Low-Risk Action]         [High-Risk Action]
      (Automated Execution)     (Requires Admin IAM Sign-Off)
               │                         │
               └────────────┬────────────┘
                            ▼
               [AWS Cloud Provider (Boto3)]
               (Modifies EC2, Stops Idle, Configures S3)
                            │
                            ▼
               [Automated Regression Verifier]
               (Checks metrics -> Auto-rolls back if degraded)
                            │
                            ▼
               [Next.js 14 Frontend Web Dashboard]
               (Real-time charts, Green Score, Audit log)
```

---

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Python 3.10+, FastAPI, Uvicorn, SQLAlchemy, Pydantic, Boto3, Python-Dotenv
- **Machine Learning**: Scikit-Learn (Random Forest), XGBoost, Pandas, NumPy, Joblib
- **Cloud Infrastructure**: Amazon Web Services (AWS) — VPC, EC2, S3 Glacier, Lambda, CloudWatch, IAM
- **Infrastructure as Code**: Terraform Stubs (`infra/`)

---

## 📁 Repository Structure

```
GreenCloud/
├── backend/                       # Python FastAPI Backend
│   ├── app/
│   │   ├── api/                   # REST API Routers (/resources, /recommendations, /carbon, etc.)
│   │   ├── models/                # SQLAlchemy Models
│   │   ├── schemas/               # Pydantic Schemas
│   │   ├── services/              # Optimizer, Safety Rules, Action Executor, Mock/Live Provider
│   │   ├── config.py              # Application Configuration & Settings
│   │   ├── database.py            # Database Session & Engine
│   │   └── main.py                # FastAPI Entrypoint
│   ├── seed_db.py                 # Telemetry & Resource Seeding Script
│   ├── test_pipeline.py           # 11-Step Automated End-to-End Pipeline Verification Test
│   └── requirements.txt           # Python Dependencies
├── frontend/                      # Next.js 14 Web Dashboard
│   ├── app/                       # Dashboard Pages (Overview, Resources, Recommendations, Carbon, Audit)
│   ├── components/                # Reusable UI Components
│   └── package.json               # Node.js Dependencies
├── ml/                            # Machine Learning Engine
│   ├── synthetic_generator.py     # 35-Day Hourly Telemetry Generator
│   ├── train.py                   # Random Forest Model Training Script
│   ├── predictor.py               # 24h Workload Inference Wrapper
│   └── model.joblib               # Pre-trained ML Model Artifact
├── infra/                         # Terraform Infrastructure Definitions
│   ├── main.tf                    # AWS Provider Setup
│   ├── vpc.tf                     # Custom VPC & Subnets
│   ├── iam.tf                     # Least-Privilege IAM Policy & Execution Role
│   └── cloudwatch.tf              # CloudWatch Metric Alarms
├── HOW_TO_TEST_AND_EXPLAIN_PROJECT.txt # Comprehensive Testing & Viva Presentation Guide
├── .env.example                   # Sanitized Environment Configuration Template
└── README.md                      # Project Documentation
```

---

## ⚡ Quick Start & Testing

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- AWS CLI configured (optional for simulation mode, required for live AWS)

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
cp .env.example backend/.env
```

### 3. Backend Setup & Seeding
```bash
cd backend
python -m venv .venv
# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
python seed_db.py
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 4. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Web Dashboard will be live at: [http://localhost:3000](http://localhost:3000)

### 5. Run Automated 11-Step Verification Test
In a third terminal:
```bash
cd backend
.\.venv\Scripts\activate
python test_pipeline.py
```

---

## 🛡️ Security Note

All sensitive credentials (`.env`, `backend/.env`, `frontend/.env.local`, SQLite databases, and virtual environments) are ignored by git in accordance with enterprise security practices. Use `.env.example` to configure your environment.

---

## 📜 License

This project is licensed under the MIT License.
