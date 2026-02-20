#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Student Dropout Risk Analytics — Docker Entrypoint
# Full startup pipeline with per-stage logging visible in docker-compose logs -f
# ─────────────────────────────────────────────────────────────────────────────

set -e

log() { echo "[ENTRYPOINT] $(date '+%H:%M:%S') — $1"; }

log "==================================================="
log " Student Dropout Risk Analytics — STARTING"
log "==================================================="

# ── 1. Wait for MySQL ─────────────────────────────────────────────────────────
log "Waiting for MySQL..."
until python - <<'EOF'
import pymysql, os, re, sys
url = os.getenv("DATABASE_URL", "")
m = re.match(r"mysql\+pymysql://([^:]+):([^@]+)@([^:/]+):?(\d*)/(.+)", url)
if not m: sys.exit(1)
user, pwd, host, port, db = m.groups()
try:
    c = pymysql.connect(host=host, port=int(port or 3306), user=user, password=pwd, database=db, connect_timeout=3)
    c.close(); sys.exit(0)
except Exception as e:
    print(f"  Not ready: {e}", flush=True); sys.exit(1)
EOF
do
    log "  MySQL not ready yet — retrying in 3s..."
    sleep 3
done
log "✓ MySQL is ready"

# ── 2. Init DB schema ─────────────────────────────────────────────────────────
log "Creating/verifying database schema..."
python scripts/init_db.py
log "✓ Schema ready"

# ── 3. Load students (idempotent) ─────────────────────────────────────────────
log "Loading student dataset..."
python scripts/load_custom_dataset.py && log "✓ Dataset loaded" || log "⚠ Dataset already loaded — skipping"

# ── 4. Train or verify ML model ───────────────────────────────────────────────
if [ -f "/app/ml_models/dropout_risk_model.joblib" ]; then
    log "✓ Pre-built model found at ml_models/dropout_risk_model.joblib — skipping training"
else
    log "Training ML model (first run ~2 min)..."
    python scripts/train_model.py
    log "✓ Model trained"
fi

# ── 5. Compute risk scores ────────────────────────────────────────────────────
log "Computing risk scores for all students..."
python scripts/compute_all_risks.py && log "✓ Risk scores ready" || log "⚠ Some risk scores failed — check logs"

# ── 6. Seed users ─────────────────────────────────────────────────────────────
log "Seeding user accounts..."
python scripts/seed_users.py && log "✓ Users ready" || log "⚠ Users already exist — skipping"

# ── 7. Start API server ───────────────────────────────────────────────────────
log "==================================================="
log "✓ Startup complete — API server starting on :8000"
log "   Docs available at: http://localhost:8000/docs"
log "==================================================="
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1 --log-level info --access-log
