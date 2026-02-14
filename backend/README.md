# Student Dropout Risk Analytics System - Backend

Production-ready ML-powered backend for student dropout risk prediction.

## 🎯 Features

- **Real-time Risk Prediction**: XGBoost model with calibrated 0-100 risk scores
- **SHAP Explainability**: Per-student feature importance for every prediction
- **Auto-Recomputation**: Metrics update triggers full ML pipeline automatically
- **Model Versioning**: Track and compare model versions with promotion logic
- **Department Analytics**: Risk aggregation by department
- **Intervention Tracking**: Feedback loop for model retraining
- **Production-Ready**: Docker, logging, health checks, error handling

## 📋 Prerequisites

- Python 3.10+
- PostgreSQL 14+
- (Optional) Docker & Docker Compose

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# From project root
docker-compose up --build

# Backend will be available at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### Option 2: Local Development

#### 1. Install PostgreSQL

Ensure PostgreSQL is running and create a database:

```sql
CREATE DATABASE student_dropout_db;
```

#### 2. Set Up Python Environment

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Unix/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 3. Configure Environment

```bash
# Copy example env file
copy .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/student_dropout_db
```

#### 4. Initialize Database

```bash
python scripts/init_db.py
```

#### 5. Load Kaggle Dataset

Download the "Predict Students Dropout and Academic Success" dataset from Kaggle:
https://www.kaggle.com/datasets/thedevastator/higher-education-predictors-of-student-retention

Place the CSV in `backend/data/raw/dataset.csv`

Then run:

```bash
python scripts/load_dataset.py
```

#### 6. Train Initial Model

```bash
python scripts/train_model.py
```

This will:
- Load training data from PostgreSQL
- Train XGBoost model with 5-fold CV
- Calibrate probabilities
- Save model with versioning
- Log metrics to database

#### 7. Start API Server

```bash
# Standard
uvicorn app.main:app --reload --port 8000

# Windows (Directly with venv Python)
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

API will be available at http://localhost:8000

Interactive docs at http://localhost:8000/docs

## 📊 Dataset Information

**Source**: Kaggle "Predict Students Dropout and Academic Success"

**Engineered Features**:
1. `attendance_rate` - Based on approved/enrolled courses (0-100)
2. `engagement_score` - Composite of evaluations and grades (0-100)
3. `academic_performance_index` - Weighted GPA across semesters
4. `login_gap_days` - Simulated days since last login
5. `failure_ratio` - Failed courses / total courses
6. `financial_risk_flag` - Based on tuition status
7. `commute_risk_score` - Distance-based score (1-4)
8. `semester_performance_trend` - Grade change between semesters

**Target**: Binary classification (Dropout=1, Graduate/Enrolled=0)

## 🔌 API Endpoints

### Students
- `GET /api/students` - List students with filters
- `GET /api/students/{id}` - Get student detail
- `GET /api/students/{id}/risk` - Get risk with SHAP explanation
- `GET /api/students/{id}/risk-history` - Get risk trend
- `POST /api/students/{id}/metrics` - **🔥 Update metrics (triggers real-time loop)**
- `PUT /api/students/{id}` - Update student info
- `POST /api/students` - Create student
- `DELETE /api/students/{id}` - Delete student

### Prediction
- `POST /api/predict` - Real-time risk prediction

### Analytics
- `GET /api/analytics/overview` - Dashboard KPIs
- `GET /api/analytics/risk-distribution` - Risk histogram
- `GET /api/analytics/feature-importance` - Global feature importance
- `GET /api/analytics/department-breakdown` - Risk by department

### Interventions
- `GET /api/interventions` - List interventions
- `GET /api/interventions/{id}` - Get intervention
- `POST /api/interventions` - Create intervention
- `PUT /api/interventions/{id}` - Update (feedback loop support)
- `DELETE /api/interventions/{id}` - Delete intervention

### System
- `GET /health` - Health check
- `GET /` - API info

## 🔄 Real-Time Loop

**Critical Endpoint**: `POST /api/students/{id}/metrics`

When student metrics are updated, this automatically triggers:

1. ✅ Metrics saved to database
2. ✅ Features extracted
3. ✅ ML model inference
4. ✅ Risk score computed (0-100)
5. ✅ SHAP explanation generated
6. ✅ Risk history saved
7. ✅ Alert detection (>15% increase)
8. ✅ Frontend can refresh data

**No manual prediction calls needed** - the system is truly real-time.

## 🤖 Model Retraining

### Manual Retraining

```bash
python scripts/train_model.py
```

### Model Promotion Logic

New models only replace the active model if:

```
F1_score(new) > F1_score(current)
```

Otherwise, the new model is saved but not activated.

### Feature Drift Detection

The system tracks feature means and flags drift >20% deviation.

## 🧠 SHAP Explainability

Every risk prediction returns:

```json
{
  "risk_score": 84.5,
  "risk_level": "High",
  "top_factors": [
    {
      "feature": "Attendance Rate",
      "impact": 0.31,
      "direction": "negative"
    },
    {
      "feature": "Engagement Score",
      "impact": 0.22,
      "direction": "negative"
    }
  ]
}
```

## 🏗️ Architecture

```
Kaggle CSV → ETL → PostgreSQL → ML (XGBoost) → REST API → Frontend
                                    ↓
                                  SHAP
```

**Database Tables**:
- `students` - Demographics
- `student_metrics` - Engineered features
- `risk_scores` - Current predictions
- `risk_history` - Trend tracking
- `interventions` - Intervention tracking
- `model_versions` - Model metadata

## 📝 Logs

Logs are stored in `backend/logs/app.log` with rotation.

## 🔒 Environment Variables

See `.env.example` for all configuration options.

## 🧪 Testing

```bash
# Run tests
pytest tests/ -v

# With coverage
pytest --cov=app tests/
```

## 📦 Deployment

### Production with Docker

```bash
docker-compose up -d
```

### Cloud Deployment

1. Set up PostgreSQL instance (AWS RDS, Azure Database, etc.)
2. Deploy backend container (AWS ECS, Azure Container Apps, etc.)
3. Update `DATABASE_URL` environment variable
4. Run migration scripts on startup

## 🔧 Troubleshooting

**Issue**: Database connection failed
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify credentials

**Issue**: Model not loading
- Run `python scripts/train_model.py` first
- Check `models/versions/` directory exists

**Issue**: Import errors
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt`

## 📄 License

MIT

## 👥 Authors

Built as a production-ready ML analytics system for student retention.
