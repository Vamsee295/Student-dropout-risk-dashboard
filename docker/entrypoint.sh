#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Student Dropout Risk Analytics — Docker Entrypoint
# Runs the full startup pipeline then hands off to uvicorn.
# Every stage is logged so you can watch progress in `docker-compose logs -f`.
# ─────────────────────────────────────────────────────────────────────────────

set -e   # exit immediately on error

LOG_PREFIX="[ENTRYPOINT]"
log() { echo "${LOG_PREFIX} $(date '+%H:%M:%S') — $1"; }

log "==================================================="
log "Student Dropout Risk Analytics — Starting up"
log "==================================================="

# ── 1. Wait for MySQL to be genuinely ready ──────────────────────────────────
log "Waiting for MySQL to accept connections..."
until python - <<'PYEOF'
import pymysql, os, sys
url = os.getenv("DATABASE_URL", "")
# parse: mysql+pymysql://user:pass@host:port/dbname
import re
m = re.match(r"mysql\+pymysql://([^:]+):([^@]+)@([^:/]+):?(\d*)/(.+)", url)
if not m:
    sys.exit(1)
user, pwd, host, port, db = m.groups()
port = int(port) if port else 3306
try:
    conn = pymysql.connect(host=host, port=port, user=user, password=pwd, database=db, connect_timeout=3)
    conn.close()
    sys.exit(0)
except Exception as e:
    print(f"MySQL not ready: {e}", flush=True)
    sys.exit(1)
PYEOF
do
    log "  MySQL not ready — retrying in 3s..."
    sleep 3
done
log "✓ MySQL is ready"

# ── 2. Initialise database tables ────────────────────────────────────────────
log "Initialising database schema..."
python scripts/init_db.py && log "✓ Database schema ready" || { log "✗ DB init failed"; exit 1; }

# ── 3. Load student data (idempotent — skips if already loaded) ──────────────
log "Loading student dataset..."
python scripts/load_custom_dataset.py && log "✓ Student data loaded" || log "⚠ Dataset load skipped (may already exist)"

# ── 4. Train / load ML model ─────────────────────────────────────────────────
# If pre-built model exists, skip training (saves ~2 min on cold start)
if [ -f "/app/ml_models/dropout_risk_model.joblib" ]; then
    log "✓ Pre-built model found — skipping training"
else
    log "Training ML model (first run — this takes ~2 minutes)..."
    python scripts/train_model.py && log "✓ ML model trained" || { log "✗ Training failed"; exit 1; }
fi

# ── 5. Compute risk scores for all students ───────────────────────────────────
log "Computing initial risk scores for all students..."
python scripts/compute_all_risks.py && log "✓ Risk scores computed" || log "⚠ Risk computation partial (check logs)"

# ── 6. Seed faculty/admin users ───────────────────────────────────────────────
log "Seeding user accounts..."
python scripts/seed_users.py && log "✓ Users seeded" || log "⚠ User seed skipped (may already exist)"

# ── 7. Start uvicorn ─────────────────────────────────────────────────────────
log "==================================================="
log "✓ Pipeline complete — starting API server on :8000"
log "==================================================="

exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 1 \
    --log-level info \
    --access-log
