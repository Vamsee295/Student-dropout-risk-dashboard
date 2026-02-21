# Docker Setup Guide

This guide covers running the Student Dropout Risk Dashboard using Docker for team collaboration and consistent environments.

## Quick Start

1. **Start everything with Docker**
   ```bash
   docker-compose up --build
   ```

   This will:
   - Create MySQL database
   - Initialize database tables
   - Load 450 students from CSV
   - Train ML model with SHAP explainability
   - Compute risk scores for all students
   - Start backend API server
   - All teammates get the SAME data

2. **Access the application**
   - Backend API: http://127.0.0.1:8000
   - API Docs: http://127.0.0.1:8000/docs
   - Health Check: http://127.0.0.1:8000/health

3. **Start frontend separately**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   - Frontend: http://localhost:3000

   > **Windows note**: The frontend forces the API base URL to `127.0.0.1` at runtime (replacing `localhost`) to avoid IPv6 issues with Docker Desktop + WSL2. If the backend is unreachable, the Engagement page shows a banner with a **Retry** button. If `curl localhost:8000` hangs but `Invoke-WebRequest http://127.0.0.1:8000/health` works, use 127.0.0.1 in `.env.local`.

4. **Default login credentials** (created automatically)
   - **Faculty**: 
     - Email: `faculty@klu.ac.in`
     - Password: `faculty123`
   
   > Student login has been removed. The system is faculty-only. Any new email auto-registers as faculty.

---

## Development Workflow

**Backend changes**: 
- Code is volume-mounted (`./backend:/app`), but Uvicorn runs without `--reload`
- After code changes, restart with `docker-compose up -d --build backend`

**Run backend tests** (no Docker or MySQL needed):
```bash
cd backend
python -m pytest tests/ -v
```
Tests use an in-memory SQLite database, so they run independently of Docker.

**Database reset**:
```bash
docker-compose down -v  # Remove volumes
docker-compose up --build  # Rebuild and reinitialize
```

**View logs**:
```bash
docker-compose logs -f backend
docker-compose logs -f mysql
```

**Stop services**:
```bash
docker-compose down
```

---

## Database Access

**Connect to MySQL from host machine**:
```bash
mysql -h 127.0.0.1 -P 3306 -u root -pSanjith_2005 student_dropout_db
```

**Inside Docker container**:
```bash
docker exec -it student_dropout_mysql mysql -u root -pSanjith_2005 student_dropout_db
```

---

## Troubleshooting

**Issue**: "Port 3306 already in use"
- **Solution 1**: Stop local MySQL service
  ```powershell
  # Run PowerShell as Administrator
  Stop-Service -Name MySQL80
  ```
  Or use Services GUI: `Win+R` → `services.msc` → Find "MySQL80" → Right-click → Stop

- **Solution 2**: Change Docker port mapping
  Edit `docker-compose.yml`:
  ```yaml
  mysql:
    ports:
      - "3307:3306"  # Use port 3307 instead
  ```
  Update `.env`:
  ```
  DATABASE_URL=mysql+pymysql://root:Sanjith_2005@localhost:3307/student_dropout_db
  ```

**Issue**: "Port 8000 already in use"
- Stop any running backend servers
- Check: `netstat -ano | findstr :8000` (Windows) or `lsof -i :8000` (Mac/Linux)

**Issue**: Backend container exits immediately
- Check logs: `docker-compose logs backend`
- Usually means database connection failed — wait for MySQL to finish initializing

---

## For Production Deployment

Uncomment the frontend service in `docker-compose.yml` to run the full stack in Docker.
