#!/bin/sh
set -e

echo "=== Starting GreenCloud AI Backend Engine ==="

# Check if database needs seeding
if [ ! -f "/app/backend/greencloud.db" ]; then
    echo "Database greencloud.db not found. Initializing and seeding telemetry & ML baseline..."
    python seed_db.py
    echo "Database initialization complete."
else
    echo "Existing database detected at /app/backend/greencloud.db."
fi

echo "Starting Uvicorn ASGI production server on 0.0.0.0:8000..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
