# EduRisk Platform Deployment & DevOps Guide

This document outlines the procedures for deploying, monitoring, backing up, and rolling back the EduRisk AI platform in a production environment.

## 1. Environment Configuration

You must create environment files tailored to each target stage. Templates have been provided:
- `.env.development`
- `.env.staging`
- `.env.production`

> [!WARNING]
> **Secret Management**: Never commit the actual production `.env` file to source control. In production, ensure `SECRET_KEY` is a cryptographically strong string, and update the database passwords.

## 2. Docker & Nginx Architecture

The stack relies on `docker-compose` to orchestrate three primary services:
1. **Frontend**: Next.js React Application (accessible via port 3000 or routed through Nginx).
2. **Backend**: FastAPI Application (serves the API and ML predictions).
3. **MySQL Database**: Persistent storage via Docker volumes.
4. **Nginx Reverse Proxy**: Single entry point handling routing, HTTP -> HTTPS redirection, gzip compression, and security headers.

## 3. Deployment Steps

### Local Production Test
To spin up a production-like environment on your local machine or a VPS:
```bash
# Load production variables
cp .env.production .env

# Build and start services in detached mode using both compose files
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### GitHub Actions (CI/CD)
The `.github/workflows/ci-cd.yml` workflow automates tests, linting, and image building upon pushes to the `main` branch. 
- You should configure GitHub Secrets (e.g., `DOCKER_USERNAME`, `DOCKER_PASSWORD`) to enable registry pushes if needed.

## 4. HTTPS and SSL (Nginx)

To enable HTTPS in production:
1. Obtain valid certificates (e.g., via Let's Encrypt / Certbot).
2. Uncomment the HTTPS server block in `nginx/default.conf.template`.
3. Mount the certificates into the Nginx container by modifying the `docker-compose.prod.yml` volumes section:
   ```yaml
   volumes:
     - /etc/letsencrypt/live/example.com/fullchain.pem:/etc/nginx/ssl/fullchain.pem:ro
     - /etc/letsencrypt/live/example.com/privkey.pem:/etc/nginx/ssl/privkey.pem:ro
   ```

## 5. Health Probes & Monitoring

Orchestrators (Kubernetes/Docker Swarm) or Load Balancers can monitor the application via:
- **`GET /health`**: Returns detailed status including DB connectivity, ML model loaded status, and uptime.
- **`GET /ready`**: Lightweight check ensuring the app is ready to accept traffic.
- **`GET /live`**: Verifies the container process is running.

## 6. Backups

A `scripts/backup_manager.py` utility is provided in the `backend/` directory to facilitate database snapshotting.
- **Execution**: Run via cron on the host machine.
  ```bash
  0 2 * * * docker exec student_dropout_mysql sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" student_dropout_db' > /var/backups/mysql/backup_$(date +\%F).sql
  ```

## 7. Rollback Strategy

If a deployment fails, use the provided rollback script. This requires your CI/CD pipeline to tag images with specific versions (e.g., `v1.2`).

```bash
# Execute the rollback script pointing to the stable tag
./scripts/rollback.sh v1.2
```
This script stops the current container, tags the target version as `latest`, and recreates the service seamlessly.
