# 🎓 Student Dropout Risk Dashboard

A comprehensive, real-time analytics platform designed to identify, monitor, and intervene with students at risk of academic dropout. This project leverages machine learning to predict dropout probability based on attendance, engagement, and academic performance metrics.

## 🚀 Features

### For Administrators & Advisors
- **Real-Time Dashboard**: Monitor institutional health, average risk scores, and total at-risk student counts.
- **Predictive Analytics**: ML-powered risk scoring (Safe, Stable, Moderate, High) for every student.
- **Intervention Management**: Create, assign, and track intervention strategies (Academic Support, Counseling, Financial Aid).
- **Automated Alerts**: System flags students crossing risk thresholds for immediate attention.
- **Engagement Tracking**: Visualize student activity via LMS login heatmaps and effort vs. output charts.

### For Faculty
- **Student Directory**: Search, filter, and sort students by risk level, department, or attendance.
- **Performance Insights**: Detailed breakdown of student performance across assignments, quizzes, and projects.
- **Communication Tools**: Assign advisors and schedule counseling sessions directly from the dashboard.

### For Students
- **Personal Dashboard**: View own risk status, metrics, and SHAP-based explanations.
- **Performance Tracking**: GPA trends, course performance, and assignment progress.
- **Engagement Metrics**: Activity heatmaps and effort visualization.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (React 19)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **Components**: Radix UI (Accessible Primitives), Lucide React (Icons), Recharts 3.x (Data Visualization)
- **State Management**: Zustand 5.x (Auth store with localStorage persistence)
- **HTTP Client**: Axios 1.x with centralized API client (`src/lib/api.ts`) featuring request/response interceptors for JWT auth

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: MySQL 8.0 (Development & Production)
- **ORM**: SQLAlchemy 2.0+
- **Validation**: Pydantic 2.x with pydantic-settings
- **ML Libraries**: scikit-learn (GradientBoostingClassifier), SHAP, Pandas, NumPy
- **Authentication**: JWT (python-jose) + bcrypt password hashing (passlib)
- **Logging**: Loguru
- **Scheduling**: APScheduler

### Testing
- **Backend**: pytest with in-memory SQLite, 108 tests covering unit, route, and integration
- **Test Coverage**: Security, models, schemas, feature engineering, risk model, all API routes, frontend-backend contract

### DevOps
- **Docker / Docker Compose**: Containerized MySQL + backend
- **Database Migrations**: Alembic

## 📂 Project Structure

```
├── backend/
│   ├── app/                    # Main application logic
│   │   ├── routes/             # API endpoints (12 route modules)
│   │   ├── services/           # Business logic (risk_model, feature_engineering, shap_explainer, realtime_prediction)
│   │   ├── models.py           # SQLAlchemy ORM models (15+ tables)
│   │   ├── schemas.py          # Pydantic request/response schemas
│   │   ├── security.py         # JWT & password hashing (config-driven)
│   │   ├── database.py         # DB connection & session management
│   │   └── config.py           # Environment-based settings
│   ├── tests/                  # Comprehensive test suite (108 tests)
│   │   ├── conftest.py         # Test fixtures (SQLite, monkeypatched DB)
│   │   ├── test_security.py    # JWT & password hashing tests
│   │   ├── test_models.py      # ORM model & schema tests
│   │   ├── test_risk_model.py  # ML risk model logic tests
│   │   ├── test_feature_engineering.py  # Feature engineering tests
│   │   ├── test_routes.py      # API route integration tests
│   │   └── test_integration.py # Frontend-backend contract tests
│   ├── scripts/                # Utility scripts (data seeding, model training)
│   ├── data/raw/               # Raw CSV datasets
│   ├── ml_models/              # Pre-trained models (.joblib)
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   ├── components/         # Reusable UI components (100+)
│   │   ├── services/           # API service clients (auth, student, faculty)
│   │   ├── store/              # Zustand auth store
│   │   ├── lib/
│   │   │   └── api.ts          # Centralized Axios client with JWT interceptors
│   │   └── context/            # React contexts
│   └── package.json            # Frontend dependencies
│
├── SETUP_GUIDE.md              # Complete setup instructions
├── DOCKER_SETUP.md             # Docker deployment guide
├── CHANGELOG.md                # Bug fixes & improvements log
└── summary.md                  # Detailed project summary
```

## ⚡ Getting Started

### Complete Setup Guides

- 📖 **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed step-by-step setup for first-time users
- 🐳 **[DOCKER_SETUP.md](./DOCKER_SETUP.md)** - Docker-based setup for teams

### Quick Overview

1. **Prerequisites**: Node.js (v18+), Python (3.9+), MySQL (8.0+)
2. **Backend**: Create virtual environment → Install dependencies → Configure `.env` → Start server
3. **Frontend**: Install dependencies → Start dev server
4. **Database**: Create MySQL database → Initialize tables → Load CSV data → Train model → Compute risks

**Backend runs on**: `http://localhost:8000` (API docs at `/docs`)  
**Frontend runs on**: `http://localhost:3000`

## 🤖 Machine Learning Pipeline

The project uses a **GradientBoostingClassifier** (scikit-learn) with **CalibratedClassifierCV** for probability calibration, trained on historical student data.

- **Features Used (8 engineered)**: Attendance Rate, Engagement Score, Academic Performance Index, Login Gap Days, Failure Ratio, Financial Risk Flag, Commute Risk Score, Semester Performance Trend.
- **Explainability**: SHAP (TreeExplainer) generates per-student feature importance.
- **Training**: Run `python scripts/train_model.py` to retrain with new data (5-fold stratified CV).
- **Inference**: Real-time risk scoring via `/api/predict` and batch via `/api/faculty/recalculate`.
- **Versioning**: Models tracked in the database with accuracy, precision, recall, and F1-score.

## 🧪 Testing

The project includes a comprehensive backend test suite with **108 tests**:

```bash
cd backend
python -m pytest tests/ -v
```

| Test Module | Coverage |
|-------------|----------|
| `test_security.py` | JWT creation, password hashing/verification |
| `test_models.py` | ORM models, enums, relationships, Pydantic schemas |
| `test_risk_model.py` | Risk level classification, trend calculation, alert detection |
| `test_feature_engineering.py` | Feature engineering helpers and DB integration |
| `test_routes.py` | All API route endpoints (auth, students, faculty, analytics) |
| `test_integration.py` | Frontend-backend contract validation (response shapes, field types) |

Tests use an **in-memory SQLite** database via monkeypatched fixtures, requiring no external database.

## 🏆 Hackathon-Ready

This project is fully production-ready with:
- **Zero placeholder data** — every chart, metric, modal, and dashboard displays real-time data from the database
- **Zero placeholder functionality** — every button, form, setting, and export actually works
- **Zero `Math.random()`** in frontend — all rendered data is deterministic and API-driven
- **Zero `random` usage** in backend routes — all API responses are deterministic and reproducible
- **Zero mock comments** — no `simulate`, `mock`, or `placeholder` references in any source code
- **Zero raw `fetch()` calls** — all API calls use centralized `apiClient` with JWT interceptors (30+ components)
- **Persistent settings** — all settings (general, risk model, notifications, intervention policy) persist via Zustand + backend API
- **Working password reset** — forgot-password generates real JWT tokens, reset-password updates credentials
- **Working counseling sessions** — schedule-counseling creates actual Intervention records in the database
- **Working chat assistant** — context-aware advisor chat analyzes actual student risk, attendance, and engagement data
- **Working notifications** — real-time notifications driven by actual system state (high-risk counts, pending interventions)
- **Working exports** — CSV export for at-risk students, audit logs, engagement reports; model card download
- **Working user management** — add/edit/delete users with role management
- **Working integration settings** — LMS selection, API key regeneration, CSV upload, sync status
- **Dynamic faculty/mentor lists** — all assignment modals fetch from `/api/analytics/faculty`
- **Dynamic intervention boards** — Kanban boards populated from `/api/analytics/at-risk-students`
- **Dynamic department filters** — all dropdown lists fetched from `/api/analytics/department-breakdown`
- **Dynamic feature importance** — ML model feature weights from `/api/analytics/feature-importance`
- **SHAP global importance** — computed from actual model `feature_importances_`
- **108 automated tests** with full coverage of security, models, routes, and frontend-backend contracts
- **Centralized API architecture** — JWT auth handled globally via Axios interceptors
- **Complete ML pipeline** — model training, versioning, SHAP explainability, and real-time prediction

## 📝 Recent Changes

See **[CHANGELOG.md](./CHANGELOG.md)** for a detailed log of all bug fixes, improvements, and new features.