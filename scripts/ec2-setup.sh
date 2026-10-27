#!/usr/bin/env bash
# ==============================================================================
# GreenCloud AI - Automated EC2 Instance Bootstrap & Deployment Script
# Supports: Amazon Linux 2023, Amazon Linux 2, Ubuntu 22.04+, Debian 12+
# ==============================================================================
set -e

echo "================================================================="
echo "   🌱 GreenCloud AI - EC2 Production Provisioning & Deployer     "
echo "================================================================="

# 1. Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    OS="unknown"
fi

echo "[1/6] Detected Operating System: $OS"

# 2. Configure 2GB Swap Memory (prevents OOM on t2.micro / t3.micro instances)
echo "[2/6] Configuring 2GB Swap Space..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap allocated successfully."
else
    echo "Swap file already exists. Skipping."
fi

# 3. Install Docker and System Prerequisites
echo "[3/6] Installing Docker, Git, and dependencies..."
if [[ "$OS" == "amzn" || "$OS" == "fedora" || "$OS" == "rhel" ]]; then
    sudo dnf update -y || sudo yum update -y
    sudo dnf install -y git docker || sudo yum install -y git docker
    sudo systemctl enable --now docker
    # Install Docker Compose Plugin
    DOCKER_CONFIG=${DOCKER_CONFIG:-/usr/local/lib/docker}
    sudo mkdir -p $DOCKER_CONFIG/cli-plugins
    sudo curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o $DOCKER_CONFIG/cli-plugins/docker-compose
    sudo chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
    sudo ln -s $DOCKER_CONFIG/cli-plugins/docker-compose /usr/bin/docker-compose || true
    CURRENT_USER=${SUDO_USER:-$USER}
    sudo usermod -aG docker "$CURRENT_USER" || true
elif [[ "$OS" == "ubuntu" || "$OS" == "debian" ]]; then
    sudo apt-get update -y
    sudo apt-get install -y ca-certificates curl gnupg lsb-release git
    sudo mkdir -m 0755 -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/$OS/gpg | sudo gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$OS $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo systemctl enable --now docker
    CURRENT_USER=${SUDO_USER:-$USER}
    sudo usermod -aG docker "$CURRENT_USER" || true
fi

# 4. Clone or Pull Repository
APP_DIR="/opt/greencloud"
REPO_URL="https://github.com/atyushamohanty24/Green_Cloud.git"

echo "[4/6] Setting up repository in $APP_DIR..."
if [ ! -d "$APP_DIR" ]; then
    sudo git clone "$REPO_URL" "$APP_DIR"
    sudo chown -R "$CURRENT_USER":"$CURRENT_USER" "$APP_DIR"
else
    echo "Repository directory exists. Updating from origin..."
    cd "$APP_DIR"
    sudo git pull origin main
    sudo chown -R "$CURRENT_USER":"$CURRENT_USER" "$APP_DIR"
fi

cd "$APP_DIR"

# 5. Setup Environment Configuration
echo "[5/6] Checking environment file..."
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# 6. Build and Launch Containers
echo "[6/6] Building and starting GreenCloud AI services..."
docker compose down --remove-orphans || true
docker compose build --parallel
docker compose up -d

# Verify Deployment
echo "Verifying service health..."
sleep 10

PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || curl -s ifconfig.me || echo "YOUR-EC2-PUBLIC-IP")

echo "================================================================="
echo "   🎉 GreenCloud AI is DEPLOYED and ACTIVE on this EC2 instance!  "
echo "================================================================="
echo "   Web Dashboard URL:  http://$PUBLIC_IP"
echo "   Backend REST API:   http://$PUBLIC_IP/api"
echo "   API Swagger Docs:   http://$PUBLIC_IP/docs"
echo "   Healthcheck URL:    http://$PUBLIC_IP/health"
echo "================================================================="
