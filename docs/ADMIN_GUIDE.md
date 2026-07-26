# Administrator Guide

This guide is intended for DevOps engineers and System Administrators maintaining the EduRisk platform.

## 1. Deployment
The platform is fully containerized.
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```
Ensure that Nginx is successfully routing traffic to port `3000` (Frontend) and `8000` (Backend).

## 2. Environment Variables
Secure your `.env.production` file. Key variables:
- `SECRET_KEY`: Must be a long, cryptographically secure random string.
- `DATABASE_URL`: Ensure credentials match your MySQL setup.
- `CORS_ORIGINS`: Restrict this to your actual production domain.

## 3. Database Migration
Alembic is used for schema migrations. If you update SQLAlchemy models, generate a migration:
```bash
docker exec -it student_dropout_backend bash
alembic revision --autogenerate -m "Add new column"
alembic upgrade head
```

## 4. Model Retraining (MLOps)
The Random Forest model should be retrained periodically as new student data flows in.
- **Manual Trigger**: Send a POST request to `/api/v1/model/retrain` (Requires Admin JWT).
- **Automated**: Set up a CRON job to trigger this endpoint at the end of each semester.

## 5. Backup & Recovery
Automated backups are configured in the crontab using the `scripts/backup_manager.py` utility.
- **To manually backup**:
  ```bash
  docker exec student_dropout_mysql sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" student_dropout_db' > backup.sql
  ```
- **To recover**:
  ```bash
  cat backup.sql | docker exec -i student_dropout_mysql sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" student_dropout_db'
  ```

## 6. Monitoring & Log Analysis
The system uses `loguru` for structured JSON logging.
- View real-time logs: `docker-compose logs -f backend`
- Access the health probes: `GET /health` to ensure the database and model are loaded.
