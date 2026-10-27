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
- **Reverse Proxy & Containers**: Docker, Docker Compose, Nginx (gzip, SSL-ready, auto-proxying)

---

## 📁 Repository Structure

```
GreenCloud/
├── backend/                       # Python FastAPI Backend
│   ├── app/                       # REST API Routers, Models, Schemas, Services
│   ├── Dockerfile                 # Backend Containerization
│   ├── entrypoint.sh              # Auto-seeding & Uvicorn ASGI Runner
│   ├── seed_db.py                 # Telemetry & Resource Seeding Script
│   ├── test_pipeline.py           # 11-Step Automated Verification Test
│   └── requirements.txt           # Python Dependencies
├── frontend/                      # Next.js 14 Web Dashboard
│   ├── app/                       # Dashboard Pages (Overview, Resources, Recommendations, Carbon, Audit)
│   ├── components/                # Reusable UI Components
│   ├── next.config.mjs            # Standalone output & internal API rewrites
│   ├── Dockerfile                 # Multi-Stage Optimized Docker Build
│   └── package.json               # Node.js Dependencies
├── nginx/                         # Nginx Production Reverse Proxy
│   └── nginx.conf                 # Unified port 80 routing (/ -> Frontend, /api -> Backend)
├── ml/                            # Machine Learning Engine
│   ├── synthetic_generator.py     # 35-Day Hourly Telemetry Generator
│   ├── train.py                   # Random Forest Model Training Script
│   ├── predictor.py               # 24h Workload Inference Wrapper
│   └── model.joblib               # Pre-trained ML Model Artifact
├── scripts/                       # Deployment & Bootstrap Automation
│   ├── ec2-setup.sh               # 1-Command Automated EC2 Provisioner & Runner
│   └── deploy.sh                  # Quick Zero-Downtime Redeployer
├── deploy/                        # Native Systemd Services & Configs
│   ├── systemd/                   # Backend & Frontend systemd unit files
│   └── nginx/                     # System Nginx virtual host config
├── docker-compose.yml             # Orchestrates Backend, Frontend, and Nginx
├── EC2_DEPLOYMENT_GUIDE.md        # Comprehensive AWS EC2 Step-by-Step Guide
├── HOW_TO_TEST_AND_EXPLAIN_PROJECT.txt # Comprehensive Testing & Viva Presentation Guide
├── .env.example                   # Sanitized Environment Configuration Template
└── README.md                      # Project Documentation
```

---

## ☁️ AWS EC2 Deployment (Quick Start)

Deploy the entire GreenCloud AI platform to an AWS EC2 instance in minutes:

### 1-Command Bootstrap on Any EC2 Instance (Amazon Linux 2023 or Ubuntu)
SSH into your EC2 instance and run:
```bash
curl -fsSL https://raw.githubusercontent.com/atyushamohanty24/Green_Cloud/main/scripts/ec2-setup.sh | bash
```

### Or Deploy Manually via Docker Compose
```bash
git clone https://github.com/atyushamohanty24/Green_Cloud.git
cd Green_Cloud
cp .env.example .env
docker compose up -d --build
```

📖 **Detailed instructions, architecture diagrams, and security group configs are available in [EC2_DEPLOYMENT_GUIDE.md](EC2_DEPLOYMENT_GUIDE.md).**

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
