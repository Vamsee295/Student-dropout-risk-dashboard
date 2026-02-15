# Student Dropout Risk Dashboard - Complete Setup Guide

## 🎯 Project Overview

Real-time ML-powered student dropout risk prediction dashboard with:
- **450 Real Students** from CSV dataset
- **XGBoost ML Model** with SHAP explainability
- **Real-time Predictions** triggered by data updates
- **Faculty Dashboard** with risk analytics
- **Docker Setup** for team collaboration

---

## 🚀 Quick Start (Dockerized - Recommended for Teams)

### Prerequisites
- Docker Desktop
- Git

### One-Command Setup
```bash
cd "c:\UG Sanjith\Student-dropout-risk-dashboard"
docker-compose up --build
```

**This automatically:**
1. Creates MySQL database
2. Loads 450 students from CSV
3. Trains XGBoost model
4. Computes risk scores
5. Starts backend API server

**Access Points:**
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

**Start Frontend Separately:**
```bash
cd frontend
npm run dev
```
Frontend: http://localhost:3000

---

## 🛠️ Manual Setup (Local Development)

### Step 1: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Database Setup

**Option A: Use Docker MySQL**
```bash
docker run -d --name student_dropout_mysql \
  -e MYSQL_ROOT_PASSWORD=Sanjith_2005 \
  -e MYSQL_DATABASE=student_dropout_db \
  -p 3306:3306 \
  mysql:8.0
```

**Option B: Use Local MySQL**
```sql
CREATE DATABASE student_dropout_db;
```

Update `.env` file if needed:
```
DATABASE_URL=mysql+pymysql://root:Sanjith_2005@localhost:3306/student_dropout_db
```

### Step 3: Initialize Database & Load Data

```bash
# Initialize tables
python scripts/init_db.py

# Load 450 students from CSV
python scripts/load_custom_dataset.py

# Create test users
python scripts/seed_users.py
```

### Step 4: Train ML Model & Compute Risks

```bash
# Train XGBoost model
python scripts/train_model.py

# Compute risk scores for all students
python scripts/compute_all_risks.py
```

### Step 5: Start Backend Server

```bash
# Start API server
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

### Step 6: Start Frontend

```bash
cd ../frontend
npm install
npm run dev
```

---

## 📊 Dataset Information

**Source:** `backend/data/raw/student_dataset_450.csv`

**Fields (17 total):**
- ID, Name, Father_Name, Mother_Name, Address, College
- CGPA, Sem1_GPA, Sem2_GPA, Attendance_%
- Department (CSE, ECE, EEE, CSIT, AIDS)
- Subject1, Subject2, Subject3
- MID1_Subject1, MID1_Subject2, MID1_Subject3

**ML Features Engineered:**
1. `attendance_rate` - Direct from Attendance_%
2. `engagement_score` - Calculated from MID exam scores
3. `academic_performance_index` - Weighted GPA
4. `login_gap_days` - Synthetic (based on engagement)
5. `failure_ratio` - Estimated from CGPA and attendance
6. `financial_risk_flag` - Synthetic (based on location)
7. `commute_risk_score` - Synthetic (1-4 scale)
8. `semester_performance_trend` - Sem2 vs Sem1 change

---

## 🔑 Default Login Credentials

**Faculty Account:**
- Email: `faculty@klu.ac.in`
- Password: `faculty123`

**Student Account:**
- Email: `student@klu.ac.in`
- Password: `student123`

---

## 🧪 Testing the System

### 1. Verify Database
```bash
mysql -h 127.0.0.1 -P 3306 -u root -pSanjith_2005 student_dropout_db

# Run queries
SELECT COUNT(*) FROM students;  # Should show 450
SELECT risk_level, COUNT(*) FROM risk_scores GROUP BY risk_level;
```

### 2. Test API Endpoints
```bash
# Health check
curl http://localhost:8000/health

# Faculty dashboard overview
curl http://localhost:8000/api/faculty/overview

# Get students list
curl http://localhost:8000/api/faculty/students

# Trigger recalculation
curl -X POST http://localhost:8000/api/faculty/recalculate
```

### 3. Test Frontend Dashboard
1. Open http://localhost:3000
2. Login with faculty credentials
3. Navigate to Faculty Dashboard
4. Verify:
   - Total students = 450
   - Risk distribution shows real data
   - Student names from CSV are displayed
   - Each student has ML-computed risk score

---

## 🔄 Data Update Workflow

### Upload New Student Data
1. Prepare CSV with same format as `student_dataset_450.csv`
2. Update the file at `backend/data/raw/student_dataset_450.csv`
3. Run data pipeline:
```bash
python scripts/load_custom_dataset.py
python scripts/train_model.py
python scripts/compute_all_risks.py
```

### Trigger Real-Time Recalculation
Via API:
```bash
curl -X POST http://localhost:8000/api/faculty/recalculate
```

Via Frontend:
- Go to Faculty Dashboard
- Click "Recalculate Risks" button
- Dashboard auto-refreshes with new predictions

---

## 📁 Project Structure

```
Student-dropout-risk-dashboard/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   └── faculty_dashboard.py  # Faculty API endpoints
│   │   ├── services/
│   │   │   ├── risk_model.py         # XGBoost ML model
│   │   │   └── realtime_prediction.py # Real-time risk service
│   │   ├── models.py                 # Database models
│   │   └── main.py                   # FastAPI app
│   ├── data/raw/
│   │   └── student_dataset_450.csv   # Source data
│   ├── scripts/
│   │   ├── load_custom_dataset.py    # CSV → Database
│   │   ├── train_model.py            # ML training
│   │   └── compute_all_risks.py      # Risk computation
│   ├── models/                       # Trained ML models
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   └── components/
│   └── package.json
├── docker-compose.yml                # Docker setup
└── DOCKER_SETUP.md                   # Team collaboration guide
```

---

## 🐛 Troubleshooting

**Issue: "No active model found"**
```bash
# Train the model first
python scripts/train_model.py
```

**Issue: "No students found"**
```bash
# Load the CSV dataset
python scripts/load_custom_dataset.py
```

**Issue: Backend server won't start**
```bash
# Check if database is running
mysql -h 127.0.0.1 -P 3306 -u root -pSanjith_2005

# Check if port 8000 is available
netstat -ano | findstr :8000
```

**Issue: Frontend shows no data**
- Verify backend is running at http://localhost:8000
- Check `.env.local` in frontend has correct API URL
- Verify students and risk scores are in database

---

## 👥 Team Collaboration

**For New Teammates:**
1. Clone repository
2. Run `docker-compose up --build`
3. Wait for initialization (5-10 minutes first time)
4. Access backend at http://localhost:8000
5. Start frontend with `npm run dev`

**All teammates will have:**
- Same 450 students in database
- Same trained ML model
- Same risk scores
- Consistent development environment

**Detailed Guide:** See [`DOCKER_SETUP.md`](file:///c:/UG%20Sanjith/Student-dropout-risk-dashboard/DOCKER_SETUP.md)

---

## 📊 ML Model Details

- **Algorithm:** XGBoost Classifier
- **Training:** 5-fold cross-validation
- **Calibration:** Sigmoid calibration for probability outputs
- **Features:** 8 engineered features
- **Output:** Risk score (0-100) + SHAP explanations
- **Versioning:** Automatic model versioning in database

**Risk Levels:**
- 0-40: Safe
- 41-55: Stable
- 56-70: Moderate Risk
- 71-100: High Risk

---

## 📝 API Documentation

**Interactive Docs:** http://localhost:8000/docs

**Key Endpoints:**
- `GET /api/faculty/overview` - Dashboard KPIs
- `GET /api/faculty/students` - Student list with risks
- `GET /api/faculty/analytics/department` - Department analytics
- `POST /api/faculty/recalculate` - Trigger ML predictions
- `GET /health` - System health check

---

## ✅ Verification Checklist

- [ ] Docker containers running
- [ ] MySQL database contains 450 students
- [ ] ML model trained and active
- [ ] Risk scores computed for all students
- [ ] Backend API responding at :8000
- [ ] Frontend running at :3000
- [ ] Faculty dashboard shows real data
- [ ] No static/fake data visible
- [ ] Risk recalculation works

---

## 🚀 Next Steps

1. **Deployment:** Configure for production (AWS/Azure)
2. **Authentication:** JWT tokens for security
3. **Notifications:** Email alerts for high-risk students
4. **Mobile App:** Student mobile interface
5. **Automated Retraining:** Schedule weekly model updates
