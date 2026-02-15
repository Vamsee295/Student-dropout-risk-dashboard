1. **Start everything with Docker**
   ```bash
   docker-compose up --build
   ```

   This will:
   - ✅ Create MySQL database
   - ✅ Initialize database tables
   - ✅ Load 450 students from CSV
   - ✅ Train ML model
   - ✅ Compute risk scores
   - ✅ Start backend API server
   - ✅ All teammates get the SAME data

2. **Access the application**
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Frontend: http://localhost:3000 (run separately with `npm run dev`)

3. **Default login credentials** (created automatically)
   - **Faculty**: 
     - Email: `faculty@klu.ac.in`
     - Password: `faculty123`
   - **Student**:
     - Email: `student@klu.ac.in`
     - Password: `student123`

### Development Workflow

**Backend changes**: 
- Code changes auto-reload (volume mounted)
- No need to rebuild container

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

## Database Access

**Connect to MySQL from host machine**:
```bash
mysql -h 127.0.0.1 -P 3306 -u root -pSanjith_2005 student_dropout_db
```

**Inside Docker container**:
```bash
docker exec -it student_dropout_mysql mysql -u root -pSanjith_2005 student_dropout_db
```

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
- Usually means database connection failed

## For Production Deployment

Uncomment the frontend service in `docker-compose.yml` to run the full stack in Docker.
