#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Rollback Script for EduRisk Platform
# Rolls back the backend docker container to a specified previous image tag.
# Usage: ./rollback.sh <target_tag>
# Example: ./rollback.sh v1.2
# ─────────────────────────────────────────────────────────────────────────────

set -e

if [ -z "$1" ]; then
  echo "Error: Target tag required."
  echo "Usage: $0 <target_tag>"
  exit 1
fi

TARGET_TAG=$1
SERVICE="backend"
IMAGE_NAME="user/edurisk-backend" # Replace with your actual registry/image name

echo "Starting rollback procedure to $TARGET_TAG..."

# 1. Check if the image exists locally, if not pull it
if ! docker image inspect "$IMAGE_NAME:$TARGET_TAG" > /dev/null 2>&1; then
    echo "Image $IMAGE_NAME:$TARGET_TAG not found locally. Attempting to pull..."
    docker pull "$IMAGE_NAME:$TARGET_TAG"
fi

# 2. Update the running container in docker-compose
echo "Stopping current backend service..."
docker-compose stop $SERVICE
docker-compose rm -f $SERVICE

# 3. We use docker run or just tag the old image as latest and recreate
echo "Tagging $TARGET_TAG as latest..."
docker tag "$IMAGE_NAME:$TARGET_TAG" "student_dropout_backend:latest"

echo "Recreating backend service..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps $SERVICE

echo "Verifying health..."
sleep 5
HEALTH=$(curl -s http://localhost:80/health | grep '"status":"healthy"' || true)

if [ -n "$HEALTH" ]; then
    echo "Rollback successful. Service is healthy."
else
    echo "WARNING: Service might not be healthy. Please check logs:"
    echo "docker-compose logs --tail=50 $SERVICE"
fi
