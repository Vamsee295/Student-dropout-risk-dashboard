# Student Dropout Risk Dashboard - Project Summary

## Overview

This is a **Machine Learning-powered Student Dropout Risk Dashboard** designed for faculty and administrators to identify, monitor, and intervene with at-risk students. Faculty upload CSV data (or refine raw data client-side), the system computes risk scores via a trained ML model, and the dashboard visualizes results with department breakdowns, risk distributions, and intervention tracking. All analysis is session-based — data lives in the browser until the tab is closed or "New Analysis" is clicked.

---

## Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | Python web framework for building RESTful APIs |
| **SQLAlchemy 2.0+** | ORM for database operations |
| **MySQL 8.0** | Primary database (PostgreSQL-ready) |
| **scikit-learn** | Machine learning (RandomForestClassifier) |
| **SHAP** | Model explainability and feature importance |
| **Pandas/NumPy** | Data manipulation and analysis |
| **JWT (python-jose)** | Authentication tokens |
| **Pydantic 2.x** | Data validation and serialization |
| **Loguru** | Application logging |
| **APScheduler** | Background task scheduling |

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16.1.6** | React framework with App Router |
| **React 19.2.3** | UI library |
| **TypeScript 5.x** | Type-safe JavaScript |
| **Tailwind CSS 4.x** | Utility-first CSS framework |
| **Radix UI** | Accessible component primitives |
| **Recharts 3.7.0** | Data visualization charts |
| **Zustand 5.0.11** | State management |
| **Axios 1.13.5** | HTTP client |
| **Lucide React** | Icon library |

### DevOps
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Alembic** | Database migrations |

---

## Project Structure

```
Student-dropout-risk-dashboard/
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── main.py            # Application entry point
│   │   ├── config.py          # Configuration settings
│   │   ├── database.py        # Database connection
│   │   ├── models.py          # SQLAlchemy ORM models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── security.py        # JWT & password hashing (config-driven)
│   │   ├── routes/            # API endpoints (12 route modules)
│   │   ├── services/          # Business logic services
│   │   └── utils/             # Helper utilities
│   ├── scripts/               # Database & ML scripts (20+)
│   ├── tests/                 # 108 automated tests
│   │   ├── conftest.py        # Test fixtures (SQLite DB, monkeypatching)
│   │   ├── test_security.py   # JWT & password hashing tests
│   │   ├── test_models.py     # ORM model & schema tests
│   │   ├── test_risk_model.py # ML risk model logic tests
│   │   ├── test_feature_engineering.py  # Feature engineering tests
│   │   ├── test_routes.py     # API route integration tests
│   │   └── test_integration.py # Frontend-backend contract tests
│   ├── data/raw/              # Raw CSV datasets
│   ├── ml_models/             # Pre-trained models
│   └── models/versions/       # Versioned trained models
│
├── frontend/                   # Next.js React frontend
│   ├── src/
│   │   ├── app/               # Next.js App Router pages
│   │   ├── components/        # React components (100+)
│   │   ├── services/          # API service clients (auth, student, faculty)
│   │   ├── store/             # Zustand state management (auth persistence)
│   │   ├── context/           # React contexts
│   │   └── lib/
│   │       └── api.ts         # Centralized Axios client (JWT interceptors)
│   └── package.json
│
├── docker-compose.yml         # Docker orchestration
├── README.md                  # Main documentation
├── SETUP_GUIDE.md             # Setup instructions
├── DOCKER_SETUP.md            # Docker guide
├── CHANGELOG.md               # Bug fixes & improvements log
└── summary.md                 # This file - detailed project summary
```

---

## Database Models

The system uses **15+ database tables** to manage all aspects of student data and risk prediction:

### Core Entities

| Model | Description | Key Fields |
|-------|-------------|------------|
| **Student** | Student demographics | `id`, `name`, `avatar`, `course`, `department`, `section`, `advisor_id` |
| **StudentMetric** | ML feature storage | `attendance_rate`, `engagement_score`, `academic_performance_index`, `login_gap_days`, `failure_ratio`, `financial_risk_flag`, `commute_risk_score`, `semester_performance_trend` |
| **RiskScore** | Current risk predictions | `risk_score` (0-100), `risk_level`, `risk_trend`, `shap_explanation` (JSON) |
| **RiskHistory** | Historical risk tracking | `risk_score`, `risk_level`, `recorded_at`, `model_version_id` |
| **Intervention** | Intervention management | `intervention_type`, `status`, `assigned_to`, `notes`, `outcome_label` |
| **ModelVersion** | ML model versioning | `version`, `model_path`, `accuracy`, `precision`, `recall`, `f1_score`, `feature_importance` (JSON) |
| **User** | Authentication | `email`, `password_hash`, `name`, `role`, `student_id`, `is_active` |

### Academic Data

| Model | Description |
|-------|-------------|
| **Course** | Course information |
| **Enrollment** | Student-course enrollments |
| **AttendanceRecord** | Attendance tracking |
| **Assessment** | Assignment/exam definitions |
| **StudentAssessment** | Student grades |
| **StudentCodingProfile** | Coding platform scores (HackerRank, LeetCode, etc.) |

### Raw Data (CSV Uploads)

| Model | Description |
|-------|-------------|
| **StudentRawAttendance** | Raw attendance CSV data |
| **StudentRawMarks** | Raw marks CSV data |
| **StudentRawAssignments** | Raw assignments CSV data |

### Enumerations

- **Department**: CSE, MECHANICAL, AEROSPACE, DATA_SCIENCE, AI_DS, CIVIL, ECE
- **Section**: A, B, C
- **RiskLevel**: HIGH, MODERATE, STABLE, SAFE
- **RiskTrend**: UP, DOWN, STABLE
- **InterventionType**: COUNSELING, TUTORING, MENTORING, FINANCIAL, ACADEMIC
- **InterventionStatus**: PENDING, IN_PROGRESS, COMPLETED, CANCELLED
- **Role**: STUDENT (deprecated — blocked at login), FACULTY, ADMIN

---

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | JWT login (auto-registration enabled) |
| POST | `/api/auth/register` | User registration |
| GET | `/api/auth/me` | Get current user info |
| POST | `/api/auth/forgot-password` | Generate password reset token |
| POST | `/api/auth/reset-password` | Reset password using token |

### Students (`/api`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | List all students with risk scores |
| GET | `/api/students/all` | Alias for student list (frontend convenience) |
| GET | `/api/students/{id}` | Get student details |
| GET | `/api/students/{id}/risk` | Get risk with SHAP explanation |
| GET | `/api/students/{id}/coding-profile` | Get coding platform scores (HackerRank, LeetCode, etc.) |
| POST | `/api/students/{id}/notes` | Add a case note (creates Intervention record) |
| PATCH | `/api/students/{id}/reviewed` | Mark student profile as reviewed |
| POST | `/api/students/{id}/escalate` | Escalate case to Dean of Students |
| POST | `/api/students/{id}/counseling` | Schedule counseling for a single student |
| POST | `/api/students/{id}/mentor` | Assign peer mentor (updates advisor, creates Intervention) |
| POST | `/api/students/{id}/email` | Log email notification (creates Intervention record) |
| POST | `/api/students/{id}/metrics` | Update metrics (triggers prediction) |
| POST | `/api/students/assign-advisor` | Assign advisor to multiple students |
| POST | `/api/students/schedule-counseling` | Schedule group counseling (creates Intervention records) |
| POST | `/api/faculty/interventions` | Create a new intervention case for any student |

### Prediction (`/api`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/predict` | Real-time risk prediction |

### Analytics (`/api/analytics`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/overview` | Dashboard KPIs |
| GET | `/api/analytics/risk-distribution` | Risk histogram data |
| GET | `/api/analytics/risk-trend` | Monthly risk/attendance/engagement trend data |
| GET | `/api/analytics/ml-metrics` | Live ML model performance metrics |
| GET | `/api/analytics/interventions` | Interventions grouped by status |
| GET | `/api/analytics/faculty` | Faculty/admin users for assignment modals |
| GET | `/api/analytics/at-risk-students` | Top at-risk students for intervention board |
| GET | `/api/analytics/feature-importance` | Global feature importance |
| GET | `/api/analytics/department-breakdown` | Risk by department |
| GET | `/api/analytics/notifications` | Data-driven notifications based on system state |
| POST | `/api/analytics/chat` | Context-aware advisor chat with student data |

### Session Analysis (`/api/analysis`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analysis/import` | Import any CSV (raw or refined), auto-map columns if needed, reject irrelevant files (422), compute risks in-memory (no DB), stream progress as NDJSON |

### Settings (`/api`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get all persisted settings |
| GET | `/api/settings/{section}` | Get settings for a section |
| PUT | `/api/settings` | Save settings for a section |

### Performance (`/api/performance`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/performance/kpis` | Academic KPIs |
| GET | `/api/performance/gpa-trend` | GPA trends over time |
| GET | `/api/performance/courses` | Course performance metrics |
| GET | `/api/performance/risk-score` | Performance risk score |
| GET | `/api/performance/early-warnings` | Early warning alerts |
| GET | `/api/performance/ai-insight` | AI-generated insights |

### Engagement (`/api/engagement`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/engagement/overview` | Engagement metrics |
| GET | `/api/engagement/digital-footprint` | LMS heatmap data |
| GET | `/api/engagement/effort-output` | Effort vs output chart data |

### Faculty Dashboard (`/api/faculty`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/faculty/overview` | Faculty dashboard overview |
| GET | `/api/faculty/students` | Paginated student list |
| GET | `/api/faculty/students/{id}` | Student profile |
| POST | `/api/faculty/recalculate` | Trigger risk recalculation |
| GET | `/api/faculty/analytics/department` | Department analytics |

### Student Dashboard (`/api/student`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/{id}/overview` | Student overview |
| GET | `/api/student/{id}/performance` | Performance data |
| GET | `/api/student/{id}/attendance` | Attendance records |
| GET | `/api/student/{id}/assignments` | Assignment progress |
| GET | `/api/student/{id}/risk` | Risk details |

### Data Upload (`/api/faculty/upload`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/faculty/upload/attendance` | Upload attendance CSV |
| POST | `/api/faculty/upload/marks` | Upload marks CSV |
| POST | `/api/faculty/upload/assignments` | Upload assignments CSV |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/` | API info |
| GET | `/docs` | Swagger UI documentation |

---

## Machine Learning Implementation

### Model Architecture

- **Loaded Model**: `RandomForestClassifier` (scikit-learn) from `ml_models/dropout_risk_model.joblib`
- **Fallback Training**: GradientBoosting/RandomForest with 5-fold cross-validation
- **Calibration**: CalibratedClassifierCV (sigmoid) for probability calibration
- **Output**: Risk score (0-100), risk level, SHAP explanations

### Actual Model Features (4 Features)

The loaded `.joblib` model expects exactly these 4 features:

| Model Feature | Source (CSV Column) | Transform |
|---|---|---|
| `attendance_rate` | `attendance_rate` | Direct (0-100) |
| `lms_score` | `engagement_score` | Direct (0-100) |
| `avg_assignment_score` | `academic_performance_index` | Multiplied by 10 |
| `avg_quiz_score` | `semester_performance_trend` | Direct |

The mapping is performed by `_metric_to_dataframe()` in `realtime_prediction.py`, which dynamically reads `model.feature_names_in_` and maps from the 8-column CSV schema.

### CSV Schema (11 Columns)

The refined CSV used for import must contain:

| Column | Type | Range | Description |
|--------|------|-------|-------------|
| `id` | string | — | Student identifier |
| `name` | string | — | Student name |
| `department` | string | — | Department code (CSE, ECE, etc.) |
| `attendance_rate` | float | 0–100 | Attendance percentage |
| `engagement_score` | float | 0–100 | LMS engagement metric → model's `lms_score` |
| `academic_performance_index` | float | 0–10 | GPA-scale index → model's `avg_assignment_score` (×10) |
| `login_gap_days` | int | 0+ | Days since last LMS login |
| `failure_ratio` | float | 0–1 | Failed / total courses |
| `financial_risk_flag` | int | 0 or 1 | Financial risk indicator |
| `commute_risk_score` | int | 1–4 | Commute difficulty |
| `semester_performance_trend` | float | -100–100 | Performance trend → model's `avg_quiz_score` |

Columns `login_gap_days`, `failure_ratio`, `financial_risk_flag`, and `commute_risk_score` are stored for display and future model versions but are not consumed by the current model.

### Risk Level Classification

| Risk Score | Level | Color Code |
|------------|-------|------------|
| 0-40 | Safe | Green |
| 41-55 | Stable | Blue |
| 56-70 | Moderate | Yellow/Orange |
| 71-100 | High Risk | Red |

### Session-Based Analysis Pipeline (CSV Import)

```
1. Faculty uploads refined CSV via /api/analysis/import
         ↓
2. Backend validates columns against REQUIRED_COLUMNS
         ↓
3. Each row parsed → metrics dict created
         ↓
4. compute_risk_from_metrics_dict() called (in-memory, no DB)
         ↓
5. _metric_to_dataframe() maps 8 CSV fields → 4 model features
         ↓
6. ML model inference → risk score (0-100) + risk level
         ↓
7. Progress streamed as NDJSON (phase, count, distribution)
         ↓
8. Final event: full overview + student array
         ↓
9. Frontend analysisStore receives data → dashboard renders
```

### Database-Backed Prediction Pipeline (Traditional)

```
1. Student metrics updated via API
         ↓
2. Features extracted from raw data (feature_engineering.py)
         ↓
3. ML model inference (risk_model.py)
         ↓
4. Risk score computed (0-100)
         ↓
5. SHAP explanation generated (shap_explainer.py)
         ↓
6. Risk history saved (if change > threshold)
         ↓
7. Alert detection (if increase > 15%)
         ↓
8. Auto-intervention creation (if HIGH risk)
```

### SHAP Explainability

The system uses **SHAP (SHapley Additive exPlanations)** for model interpretability:

- **TreeExplainer** for tree-based models (RandomForest / GradientBoosting)
- Returns **top 5 contributing features** per prediction
- Shows feature impact and direction (positive/negative)
- Stored as JSON in `RiskScore.shap_explanation`
- Displayed to faculty with human-readable feature names

### Model Versioning

- Models tracked in `ModelVersion` table
- Stores metrics: accuracy, precision, recall, F1-score
- Feature importance stored as JSON
- Only one active model at a time
- Promotion logic: new model replaces active if F1_new > F1_current

---

## Frontend Pages & Components

### Main Application Pages

| Page | Route | Description |
|------|-------|-------------|
| **Dashboard** | `/dashboard` | Initially shows Import/Refine CSV landing; after import, shows KPIs, risk distribution, department charts |
| **Students Directory** | `/students` | Student list from DB with filters by risk, department, attendance |
| **Student Detail** | `/students/[id]` | Individual student profile with risk, metrics, advisor |
| **Risk Analysis** | `/risk-analysis` | ML model metrics, feature importance, at-risk lists |
| **Performance** | `/performance` | GPA trends, course performance, early warnings |
| **Engagement** | `/engagement` | Engagement metrics, LMS heatmaps, effort-output charts |
| **Interventions** | `/interventions` | Kanban board for intervention tracking |
| **Settings** | `/settings` | General, risk model, notifications, intervention policy, integrations, security |

Student-facing pages (`/student-dashboard/*`, `/profile`) redirect to `/dashboard`.

### Key Component Categories

| Category | Components |
|----------|------------|
| **Analysis** | AnalysisLanding (Import/Refine CSV with animated pipeline UI) |
| **Dashboard** | DashboardMetrics, RiskDistributionChart, DropoutRiskTrendChart, RecentCriticalAlerts, InterventionStatus |
| **Students** | StudentTable, DirectoryFilters, AssignAdvisorModal, GroupCounselingModal |
| **Risk Analysis** | FeatureImportanceChart, RiskProbabilityChart, AtRiskStudentsTable, MLMetricCard |
| **Performance** | AcademicKPICards, GPATrendChart, CourseRadarChart, EarlyWarningPanel, AIInsightCard |
| **Engagement** | EngagementMetricCards, LMSHeatmapChart, EffortOutputChart, MyActivityHeatmap |
| **Interventions** | InterventionBoard, InterventionCard, InterventionColumn, NewInterventionModal |
| **Shared** | Sidebar, Logo, KpiCard, ChatWidget, NotificationBell, CinematicBackground |

---

## Key Services & Business Logic

### Backend Services

#### RiskModel (`backend/app/services/risk_model.py`)
```python
- train()                    # Train model with cross-validation
- predict()                  # Predict dropout probability
- predict_risk_score()       # Get risk score (0-100) with level
- get_feature_importance()   # Extract feature importance
- save() / load()            # Model persistence
- calculate_risk_trend()     # Compute trend vs previous score
- detect_alert()             # Check if alert threshold exceeded
```

#### RealtimePredictionService (`backend/app/services/realtime_prediction.py`)
```python
- compute_student_risk()            # Compute risk for single student (DB-backed)
- compute_all_risk_scores()         # Batch computation for all students
- compute_risk_from_metrics_dict()  # Compute risk from plain dict (session-only, no DB)
- _metric_to_dataframe()            # Map 8 metric fields → 4 model features
- _get_model_feature_names()        # Read model.feature_names_in_ dynamically
- _save_risk_result()               # Save to database
- _trigger_intervention()           # Auto-create interventions for high-risk
```

#### FeatureEngineer (`backend/app/services/feature_engineering.py`)
```python
- compute_and_save_features()  # Extract features from raw data
- engineer_features()          # Feature engineering from Kaggle dataset
- prepare_ml_features()        # Format features for ML model
```

#### SHAPExplainer (`backend/app/services/shap_explainer.py`)
```python
- explain()                        # Generate SHAP explanation
- _format_feature_name()           # Format feature names for display
- format_explanation_for_storage() # Format for database storage
```

### Frontend Services

#### Centralized API Client (`frontend/src/lib/api.ts`)
All frontend services use a centralized Axios instance that:
- Sets `baseURL` from `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000/api`)
- Attaches JWT tokens automatically via a request interceptor (reads from Zustand's persisted `auth-storage` in localStorage)
- Handles 401 responses globally by clearing auth state and redirecting to `/login`
- Configures a 15-second request timeout

#### authService (`frontend/src/services/auth.ts`)
```typescript
- login()           # Authenticate user (direct axios.post with form-urlencoded)
- getCurrentUser()  # Get current user info (via apiClient)
- forgotPassword()  # Password reset (via apiClient)
```

#### studentService (`frontend/src/services/student.ts`)
```typescript
- getOverview()     # Student dashboard overview (via apiClient)
- getPerformance()  # Performance data (via apiClient)
- getAttendance()   # Attendance records (via apiClient)
- getAssignments()  # Assignment progress (via apiClient)
- getRisk()         # Risk details (via apiClient)
```

#### facultyService (`frontend/src/services/faculty.ts`)
```typescript
- getOverview()     # Faculty dashboard KPIs (via apiClient)
- getStudents()     # Paginated student list (via apiClient)
- uploadData()      # CSV upload (via apiClient, auto Content-Type)
- recalculate()     # Trigger risk recalculation (via apiClient)
```

#### studentService (`frontend/src/services/studentService.ts`)
```typescript
- fetchStudents()   # Fetch all students for directory (via apiClient)
- getStudentById()  # Get single student details (via apiClient)
```

#### analysisStore (`frontend/src/store/analysisStore.ts`)
```typescript
- hasData             # Boolean: whether session analysis data is loaded
- overview            # AnalysisOverview | null (total, at-risk, avg risk, dept breakdown)
- students            # AnalysisStudent[] (id, name, department, risk_score, risk_level, metrics)
- setAnalysisData()   # Load overview + students into store
- clearAnalysis()     # Reset to empty (returns to landing view)
```

#### refineCsvAsync (`frontend/src/utils/refineCsv.ts`)
```typescript
- refineCsvAsync(file, onProgress)  # Async client-side CSV refinement
  # Steps: parse → map columns → compute means → fill missing → build rows → detect outliers → generate output
  # Emits RefineStepData[] at each stage for animated UI
  # Returns { csvString, rowCount }
```

---

## Data Flow

### Session-Based Analysis Flow (Primary — CSV Import)

```
Option A: Import CSV (raw or refined) via /api/analysis/import
  1. Faculty uploads any CSV via AnalysisLanding
  2. Backend checks for refined columns
     — If all 11 present → proceed directly
     — If missing → auto-map raw columns (_refine_dataframe):
       • Map ID/Name/Department/Attendance_%/CGPA etc. to refined names
       • Engineer engagement_score from MID exam columns
       • Compute semester_performance_trend from Sem1/Sem2 GPA
       • Estimate login_gap_days, failure_ratio from available data
       • Default financial_risk_flag=0, commute_risk_score=1
  3. compute_risk_from_metrics_dict() runs per-student (in-memory, no DB)
  4. Progress streamed as NDJSON (phase, student name, risk level, distribution)
  5. Frontend receives "done" event → analysisStore.setAnalysisData()
  6. Dashboard renders with overview + student list

Option B: Refine Raw CSV Client-Side First
  1. Faculty uploads raw CSV via AnalysisLanding → client-side refineCsvAsync()
  2. Browser: parse → map columns → fill missing (mean) → cap outliers (IQR) → generate output
  3. Each step emits progress for animated pipeline UI
  4. Faculty downloads refined CSV or clicks "Import to Dashboard" for direct import
```

### Database-Backed Ingestion Pipeline (Legacy)

```
CSV Upload (Attendance/Marks/Assignments)
         ↓
Raw Tables (StudentRawAttendance, StudentRawMarks, StudentRawAssignments)
         ↓
Feature Engineering (FeatureEngineer service)
         ↓
StudentMetric Table
         ↓
ML Prediction (RiskModel service)
         ↓
RiskScore + RiskHistory Tables
         ↓
Auto-Intervention (if HIGH risk)
         ↓
Intervention Table
```

---

## Scripts & Utilities

### Database Scripts
| Script | Purpose |
|--------|---------|
| `init_db.py` | Create all database tables |
| `seed_users.py` | Create test users |
| `seed_student_data.py` | Seed student data |
| `verify_users.py` | Verify user accounts |

### Data Loading Scripts
| Script | Purpose |
|--------|---------|
| `load_dataset.py` | Load Kaggle dataset |
| `load_custom_dataset.py` | Load custom CSV (450 students) |
| `seed_many_students.py` | Bulk student creation |

### ML Operation Scripts
| Script | Purpose |
|--------|---------|
| `train_model.py` | Train ML model (RandomForest / GradientBoosting) |
| `compute_all_risks.py` | Compute risk scores for all students |
| `compute_risk_scores.py` | Risk computation utility |
| `generate_risk_scores.py` | Generate risk scores |
| `run_batch_risk.py` | Batch risk processing |

### Testing & Debugging Scripts
| Script | Purpose |
|--------|---------|
| `test_login.py` | Test authentication |
| `test_mentors.py` | Test mentor assignment |
| `test_grade_forecast.py` | Test grade forecasting |
| `debug_db.py` | Database debugging |

---

## Authentication & Security

### Authentication Flow
1. Faculty submits credentials to `/api/auth/login` (student login is blocked with `403 Forbidden`)
2. Server validates credentials against `User` table (auto-registration creates `FACULTY` role)
3. JWT token generated with user info and expiration (config-driven via `app.config.Settings`)
4. Token returned to client
5. Client stores token in Zustand auth store (persisted to localStorage as `auth-storage`)
6. Centralized Axios client (`src/lib/api.ts`) attaches token automatically via request interceptor
7. Server validates token on protected routes via `get_current_user` dependency
8. On 401 response, client auto-clears auth state and redirects to `/login`

### Security Features
- **Password Hashing**: pbkdf2_sha256 via passlib (CryptContext)
- **JWT Tokens**: python-jose with config-driven SECRET_KEY, ALGORITHM, and expiration (sourced from `get_settings()`)
- **Role-Based Access**: FACULTY and ADMIN roles (student role deprecated and blocked at login)
- **CORS**: Configured middleware for cross-origin requests
- **Auto-Registration**: Enabled for testing — new emails auto-register as FACULTY
- **Centralized Auth Handling**: Frontend interceptors eliminate manual token management across services

---

## Testing Infrastructure

### Backend Test Suite (108 Tests)

The backend has a comprehensive test suite using **pytest** with an in-memory **SQLite** database for complete isolation from the production MySQL database.

#### Test Configuration (`backend/tests/conftest.py`)
- Sets `DATABASE_URL=sqlite:///./test.db` before importing app modules to avoid pymysql dependency
- Uses `monkeypatch` (autouse fixture) to redirect `app.database.engine` and `SessionLocal` to test instances
- Provides a `client` fixture wrapping FastAPI's `TestClient`
- Provides `sample_student` and `sample_user` fixtures for pre-seeded test data

#### Test Modules

| Module | Count | Description |
|--------|-------|-------------|
| `test_security.py` | ~5 | Password hashing round-trip, JWT creation with/without custom expiry |
| `test_models.py` | ~15 | All enums (Department, RiskLevel, etc.), ORM models, relationships, Pydantic schemas |
| `test_risk_model.py` | ~10 | Risk level classification, trend calculation, alert detection, value formatting |
| `test_feature_engineering.py` | ~12 | `_safe()`, `_clamp()` helpers, static methods, DB-integrated feature computation |
| `test_routes.py` | ~30 | All API routes: health, auth, students, faculty, analytics, engagement, frontend |
| `test_integration.py` | ~36 | Frontend-backend contract validation: response field names, types, schema shapes |

#### Running Tests
```bash
cd backend
python -m pytest tests/ -v            # All tests with verbose output
python -m pytest tests/ -v --tb=short # Condensed tracebacks
python -m pytest tests/test_routes.py  # Single module
```

---

## Docker Deployment

### Services
```yaml
services:
  mysql:
    image: mysql:8.0
    port: 3307
    volumes: mysql_data
    
  backend:
    build: ./backend
    port: 8000
    volumes: 
      - ./ml_models
      - ./logs
    depends_on: mysql
```

### Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

---

## Key Features Summary

### Session-Based CSV Analysis (Primary Workflow)
- **Import CSV**: Upload refined CSV → real-time streaming risk computation → dashboard populates instantly
- **Refine CSV**: Upload raw data → client-side pipeline maps columns, fills missing values, caps outliers → download or import
- **Session-Only**: Data lives in browser memory — clears on tab close or "New Analysis" click
- **Animated Pipeline UI**: Both import and refine show step-by-step animated progress with live statistics

### For Faculty/Administrators
- **Dashboard Analytics**: Real-time KPIs, risk distribution charts, department breakdowns
- **Student Directory**: Searchable/filterable list with risk indicators (database-backed)
- **Risk Analysis**: Feature importance visualization, at-risk student lists
- **Intervention Management**: Kanban-style board for tracking interventions
- **Bulk Data Upload**: CSV upload for attendance, marks, assignments (database-backed)
- **AI Insights**: ML-generated insights and recommendations

### ML Capabilities
- **Real-Time Prediction**: Instant risk score computation from CSV data (session) or DB metrics
- **Streaming Progress**: NDJSON streaming during import shows per-student risk computation
- **SHAP Explanations**: Interpretable feature contributions via TreeExplainer
- **Model Versioning**: Track and compare model performance
- **Auto-Interventions**: Automatic intervention creation for high-risk students (DB mode)
- **Alert Detection**: Notify when risk increases significantly

---

## Summary

This Student Dropout Risk Dashboard is a **hackathon-ready, full-stack application** that combines:

- **FastAPI backend** with SQLAlchemy ORM and MySQL database
- **Next.js 16 frontend** with React 19, TypeScript, and Tailwind CSS
- **Session-based CSV analysis** — import refined CSVs for instant risk computation or refine raw data client-side
- **Real-time streaming progress** — backend streams NDJSON during import; frontend shows animated pipeline steps
- **RandomForestClassifier** ML model with 4 features, SHAP explainability, and robust CSV-to-model mapping
- **Faculty-only authentication** — student login deprecated and blocked at the API level
- **15+ database tables** covering students, metrics, risks, interventions, and academics
- **RESTful API** with comprehensive endpoints including the new `/api/analysis/import` streaming endpoint
- **Centralized API client** (`src/lib/api.ts`) — all 30+ components use `apiClient` with JWT interceptors
- **Zero mock/placeholder data** — every chart, metric card, modal, and dashboard component uses real API data
- **108 backend tests** covering unit, route, and frontend-backend integration contract validation
- **Docker deployment** for easy containerized setup

The system enables educational institutions to proactively identify at-risk students, understand the factors contributing to dropout risk through explainable AI, and manage interventions effectively to improve student retention.
