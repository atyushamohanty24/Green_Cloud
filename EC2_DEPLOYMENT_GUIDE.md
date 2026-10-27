# GreenCloud AI - EC2 Production Deployment Guide

This guide details how to deploy the **GreenCloud AI** platform to an **Amazon Web Services (AWS) EC2** instance with high availability, security hardening, automated database seeding, and production reverse proxying.

---

## 🏛️ EC2 Deployment Architecture

```
                    Internet Users & CloudOps Admins
                                   │
                                   ▼ (Port 80 / 443 HTTPS)
                   ┌───────────────────────────────┐
                   │    AWS EC2 Instance (Ubuntu / │
                   │    Amazon Linux 2023)         │
                   │                               │
                   │  ┌─────────────────────────┐  │
                   │  │ Nginx Reverse Proxy     │  │
                   │  └────┬───────────────┬────┘  │
                   │       │               │       │
                   │ (Port 3000)      (Port 8000)  │
                   │       ▼               ▼       │
                   │ ┌──────────┐    ┌──────────┐  │
                   │ │ Next.js  │    │ FastAPI  │  │
                   │ │ Frontend │    │ Backend  │  │
                   │ └──────────┘    └────┬─────┘  │
                   │                      │        │
                   │           ┌──────────┴──────┐ │
                   │           │ SQLite / RDS DB │ │
                   │           └─────────────────┘ │
                   └───────────────────────────────┘
                                   │
           (AWS Boto3 Client & CloudWatch Telemetry Monitor)
                                   ▼
         AWS Cloud Telemetry & Actions (CloudWatch, EC2, S3, RDS)
```

- **Reverse Proxy**: Nginx routes `/` to Next.js (port 3000), `/api` to FastAPI (port 8000), and `/docs` to interactive Swagger.
- **Automated Seeding**: Automatically generates 35 days of synthetic telemetry, resource baselines, and optimization recommendations upon first launch.
- **Swap Memory Protection**: Automatic 2GB swap space configuration ensures reliable builds on `t2.micro` and `t3.micro` free-tier instances.

---

## 🚀 Deployment Options

Choose the deployment method that fits your workflow:
- [Option 1: 1-Command Automated Bootstrap on EC2 (Recommended)](#option-1-1-command-automated-bootstrap-on-ec2)
- [Option 2: Manual Docker Compose Deployment](#option-2-manual-docker-compose-deployment)
- [Option 3: Native Systemd Deployment (Low-RAM / Free Tier)](#option-3-native-systemd-deployment-t2micro--t3micro)

---

### Option 1: 1-Command Automated Bootstrap on EC2

When launching an EC2 instance in AWS (Amazon Linux 2023 or Ubuntu 22.04/24.04):

#### 1. SSH into your EC2 Instance
```bash
ssh -i your-key.pem ec2-user@<YOUR-EC2-PUBLIC-IP>
# For Ubuntu instances:
# ssh -i your-key.pem ubuntu@<YOUR-EC2-PUBLIC-IP>
```

#### 2. Execute the Automated Bootstrap Script
```bash
curl -fsSL https://raw.githubusercontent.com/atyushamohanty24/Green_Cloud/main/scripts/ec2-setup.sh | bash
```

This single command will:
1. Configure 2GB Swap space (protects against Out-Of-Memory errors during builds).
2. Install Docker, Docker Compose plugin, and Git.
3. Clone the GreenCloud AI repository to `/opt/greencloud`.
4. Create `.env` from template.
5. Build and launch Backend, Frontend, and Nginx containers.
6. Auto-seed SQLite database with 35 days of metric telemetry and ML models.
7. Verify healthcheck and print the live web dashboard URL.

---

### Option 2: Manual Docker Compose Deployment

#### 1. Clone the Repository
```bash
git clone https://github.com/atyushamohanty24/Green_Cloud.git
cd Green_Cloud
```

#### 2. Configure Environment
```bash
cp .env.example .env
```
*(Optional)* Add your target AWS resource IDs (VPC, EC2 IDs, S3 buckets) to `.env` if targeting a live AWS account.

#### 3. Build & Run Containers
```bash
docker compose up -d --build
```

#### 4. View Service Logs
```bash
docker compose logs -f
```

---

### Option 3: Native Systemd Deployment (t2.micro / t3.micro)

For low-memory instances (e.g. 1GB RAM) without Docker:

#### 1. Setup Python Backend
```bash
cd /opt/greencloud/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python seed_db.py
```

#### 2. Setup Next.js Frontend
```bash
cd /opt/greencloud/frontend
npm install
npm run build
```

#### 3. Install Systemd Services
```bash
sudo cp deploy/systemd/greencloud-backend.service /etc/systemd/system/
sudo cp deploy/systemd/greencloud-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now greencloud-backend greencloud-frontend
```

#### 4. Configure Nginx
```bash
sudo cp deploy/nginx/greencloud.conf /etc/nginx/conf.d/
sudo systemctl restart nginx
```

---

## 🔒 Security Group Rules

Ensure your EC2 Security Group in AWS Console permits the following inbound traffic:

| Type | Port | Protocol | Source | Purpose |
|------|------|----------|--------|---------|
| HTTP | 80 | TCP | `0.0.0.0/0` | Web Dashboard & API Proxy |
| HTTPS | 443 | TCP | `0.0.0.0/0` | Encrypted SSL Traffic |
| SSH | 22 | TCP | `Your-IP/32` | Administrative Remote Shell |
| Custom TCP | 3000 | TCP | `0.0.0.0/0` | Direct Frontend Access (Optional) |
| Custom TCP | 8000 | TCP | `0.0.0.0/0` | Direct FastAPI Access (Optional) |

---

## 🔄 Updating Your EC2 Deployment

Whenever you push new changes to GitHub, update your live EC2 deployment with a single command:

```bash
cd /opt/greencloud
./scripts/deploy.sh
```

This pulls the latest commits, rebuilds the Docker containers in parallel, updates services with zero downtime, and verifies health.

---

## 🌐 Custom Domain & Free SSL (Let's Encrypt)

To configure HTTPS with your own custom domain:

1. Point your domain A-record to your EC2 Public IP address in Route 53 or your DNS provider.
2. Install Certbot on the EC2 host:
   ```bash
   sudo dnf install -y certbot python3-certbot-nginx
   # Or on Ubuntu: sudo apt install -y certbot python3-certbot-nginx
   ```
3. Issue and bind certificate:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```
4. Certbot automatically configures auto-renewal via cron/systemd timer.
