#!/usr/bin/env bash
# ==============================================================================
# GreenCloud AI - Quick Redeployment / Update Script
# Usage: ./scripts/deploy.sh
# ==============================================================================
set -e

echo "=== Pulling latest changes from GitHub ==="
git pull origin main

echo "=== Rebuilding and updating Docker services ==="
docker compose build --parallel
docker compose up -d --remove-orphans

echo "=== Verifying Health ==="
sleep 5
curl -f http://localhost/health && echo -e "\nDeployment successfully verified!" || echo -e "\nWarning: Healthcheck failed."
