# Student Dropout Risk Dashboard

A full-stack analytics platform that identifies students at risk of academic dropout using machine learning. Faculty upload CSV data, the system computes risk scores via a trained RandomForest model, and the dashboard visualizes results with department breakdowns, risk distributions, and intervention tracking.

## Features

### Session-Based CSV Analysis
- **Import CSV**: Upload **any** CSV — refined or raw. If the file already matches the 11-column refined schema, risk computation starts immediately. If raw columns are detected (e.g. `ID`, `CGPA`, `Attendance_%`, `MID1_Subject1`), the backend auto-maps them to the model schema and engineers missing features server-side before computing risks. Progress streams back to the browser in real-time.
- **Refine CSV**: Upload raw data and the browser-side pipeline maps columns, fills missing values (mean imputation), caps outliers (IQR), and produces a downloadable model-ready CSV.
- **Irrelevant File Detection**: If a CSV has no recognizable student-metric columns (e.g. a course registration list), both Import and Refine stop immediately with a clear message: *"This file doesn't match any student risk records. Please try with a different file."*
- **Session-Only**: Analysis data lives in the browser (Zustand store) — it lasts until the tab is closed or "New Analysis" is clicked. Nothing is written to the database.

### Faculty Dashboard
- **Risk Overview**: Total students, at-risk count, average attendance, average risk score.
- **Risk Distribution**: Pie chart showing High Risk / Moderate / Stable / Safe breakdown.
- **Department Breakdown**: Bar chart comparing average risk and attendance per department, plus a summary table.
- **New Analysis**: One click clears the session and returns to the Import/Refine view.

### Session-Gated Pages
All data pages are gated behind the analysis store — **no data is shown unless a CSV has been imported**. Navigating to any page without imported data displays a centered "No Analysis Data — Import CSV" prompt.

- **Student Directory** (`/students`): Reads from the in-memory session store. Search, filter by department or risk level. No database calls.
- **Student Detail** (`/students/[id]`): Looks up the student from session data. Shows risk gauge, metric cards, attendance chart, and risk factor analysis derived from session metrics. Action buttons (case note, counseling, email, escalate) work locally via toasts.
- **Analytics**: Department-level analytics with detailed charts.
- **Engagement**: LMS heatmaps, effort-vs-output charts, engagement metric cards. Export report downloads CSV.
- **Interventions**: Kanban board with drag-and-drop. Cards link to student profiles.
- **Risk Analysis**: ML model metrics, feature importance, at-risk student lists.
- **Performance**: GPA trends, course performance, early warning alerts.
- **Coding Reports**: Sortable table of student coding profiles. Export CSV downloads filtered data.
- **Settings**: General, risk model, notifications, intervention policy, integrations, security, appearance. Theme and sidebar preferences persist to localStorage.

### ML & Prediction
- **Model**: RandomForestClassifier (scikit-learn) loaded from `ml_models/dropout_risk_model.joblib`.
- **Features**: The model uses 4 features internally (`attendance_rate`, `lms_score`, `avg_assignment_score`, `avg_quiz_score`), mapped from the 8-column CSV schema via `_metric_to_dataframe`.
- **SHAP Explainability**: Per-student feature importance via TreeExplainer.
- **Real-Time Streaming**: Backend streams progress as NDJSON during import; frontend renders live progress bars, risk distribution, and processing log.

## Tech Stack

### Frontend
- **Next.js 16** (React 19, App Router), TypeScript 5.x
- **Tailwind CSS 4.x**, Radix UI, Lucide React icons
- **Recharts 3.x** for data visualization
- **Zustand 5.x** for state management (auth store with localStorage, analysis store session-only)
- **Axios 1.x** with centralized JWT interceptors (`src/lib/api.ts`)

### Backend
- **FastAPI** (Python 3.10)
- **MySQL 8.0** via SQLAlchemy 2.0+ ORM
- **scikit-learn** (RandomForestClassifier), SHAP, Pandas, NumPy
- **JWT** (python-jose) + bcrypt (passlib) for auth
- **Loguru** for logging

### DevOps
- **Docker / Docker Compose** — containerized MySQL + backend
- **108 backend tests** — pytest with in-memory SQLite

## CSV Schema

Import CSV accepts both **refined** and **raw** CSVs. Raw CSVs are auto-mapped server-side (see *Raw column auto-mapping* below). A refined CSV contains these 11 columns:

| Column | Type | Range | Description |
|--------|------|-------|-------------|
| `id` | string | — | Student identifier |
| `name` | string | — | Student name |
| `department` | string | — | Department code (e.g. CSE, ECE) |
| `attendance_rate` | float | 0–100 | Attendance percentage |
| `engagement_score` | float | 0–100 | LMS engagement metric |
| `academic_performance_index` | float | 0–10 | GPA-scale academic index (model multiplies by 10) |
| `login_gap_days` | int | 0+ | Days since last LMS login |
| `failure_ratio` | float | 0–1 | Failed courses / total courses |
| `financial_risk_flag` | int | 0 or 1 | Financial risk indicator |
| `commute_risk_score` | int | 1–4 | Commute difficulty |
| `semester_performance_trend` | float | -100–100 | Performance trend percentage |

**Model feature mapping** (CSV column → model feature):

| CSV Column | Model Feature | Transform |
|---|---|---|
| `attendance_rate` | `attendance_rate` | Direct |
| `engagement_score` | `lms_score` | Direct |
| `academic_performance_index` | `avg_assignment_score` | ×10 |
| `semester_performance_trend` | `avg_quiz_score` | Direct |

The remaining columns (`login_gap_days`, `failure_ratio`, `financial_risk_flag`, `commute_risk_score`) are used for display and future model versions but not consumed by the current model.

**Raw column auto-mapping**: When Import detects missing refined columns, it attempts to map common raw column names to the schema:

| Raw Column(s) | Mapped To | Engineering |
|---|---|---|
| `ID`, `Student_ID`, `Roll_No` | `id` | Direct |
| `Name`, `Student_Name` | `name` | Direct |
| `Department`, `Dept`, `Branch` | `department` | Direct |
| `Attendance_%`, `Attendance` | `attendance_rate` | Direct (0-100) |
| `Engagement_Score`, or `MID1_Subject*` columns | `engagement_score` | Avg MID scores / 30 × 100 |
| `CGPA`, `GPA` | `academic_performance_index` | Auto-scale if >10 |
| — | `login_gap_days` | Estimated from engagement |
| — | `failure_ratio` | Estimated from GPA + attendance |
| — | `financial_risk_flag` | Default 0 |
| — | `commute_risk_score` | Default 1 |
| `Sem1_GPA` + `Sem2_GPA` | `semester_performance_trend` | (Sem2 − Sem1) / Sem1 × 100 |

A sample refined CSV is provided at `backend/data/refined_sample.csv`. The raw dataset at `backend/data/raw/student_dataset_450.csv` can also be imported directly.

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI app with lifespan (model loading)
│   │   ├── routes/
│   │   │   ├── auth.py            # Login (faculty-only), register, password reset
│   │   │   ├── analysis.py        # POST /api/analysis/import — session CSV import with streaming
│   │   │   ├── analytics.py       # Dashboard analytics, notifications, chat
│   │   │   ├── students.py        # Student CRUD, case notes, reviewed, escalate, counseling, mentor, email, coding-profile, interventions
│   │   │   ├── faculty_dashboard.py
│   │   │   ├── settings.py        # Persist/retrieve app settings
│   │   │   ├── upload.py          # CSV upload (attendance, marks, assignments)
│   │   │   ├── performance.py, engagement.py, prediction.py
│   │   │   ├── student_dashboard.py, student_management.py, frontend.py
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── risk_model.py           # RiskModel class (train, predict, SHAP)
│   │   │   ├── realtime_prediction.py  # compute_risk_from_metrics_dict (session analysis)
│   │   │   ├── shap_explainer.py       # SHAP TreeExplainer
│   │   │   └── feature_engineering.py  # Feature extraction from raw data
│   │   ├── models.py              # SQLAlchemy ORM (15+ tables)
│   │   ├── schemas.py             # Pydantic request/response schemas
│   │   ├── security.py            # JWT + password hashing
│   │   └── config.py              # Environment settings
│   ├── data/
│   │   ├── refined_sample.csv     # Sample refined CSV for testing
│   │   └── raw/                   # Raw CSV datasets
│   ├── ml_models/                 # Pre-trained model (.joblib)
│   ├── tests/                     # 108 tests (pytest + SQLite)
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (app)/             # Authenticated pages (sidebar layout)
│   │   │   │   ├── dashboard/     # Main dashboard (conditional: landing or charts)
│   │   │   │   ├── students/      # Student directory + detail pages
│   │   │   │   ├── engagement/, interventions/, performance/, risk-analysis/
│   │   │   │   └── profile/, student-dashboard/  # Redirect stubs → /dashboard
│   │   │   ├── (auth)/            # Login, signup, forgot-password
│   │   │   └── settings/          # Settings with dedicated sidebar layout
│   │   ├── components/
│   │   │   ├── analysis/
│   │   │   │   └── AnalysisLanding.tsx  # Import/Refine CSV with animated pipeline UI
│   │   │   ├── dashboard/, settings/, ...
│   │   │   ├── Sidebar.tsx         # Faculty-only navigation
│   │   │   └── ChatWidget.tsx      # Context-aware advisor chat
│   │   ├── store/
│   │   │   ├── useAuthStore.ts     # Auth (persisted to localStorage)
│   │   │   ├── analysisStore.ts    # Session-only analysis data (no persistence)
│   │   │   └── settingsStore.ts    # Settings (persisted to localStorage)
│   │   ├── utils/
│   │   │   └── refineCsv.ts        # Client-side CSV refinement (async, step-by-step progress)
│   │   ├── services/               # API clients (auth, student, faculty)
│   │   ├── lib/api.ts              # Centralized Axios with JWT interceptors
│   │   └── context/                # NotificationsContext
│   └── package.json
│
├── docker-compose.yml
├── CHANGELOG.md, SETUP_GUIDE.md, DOCKER_SETUP.md, summary.md
└── README.md
```

## Getting Started

### Prerequisites
- Node.js v18+, Python 3.9+, Docker Desktop

### Quick Start (Docker)
```bash
# Start MySQL + backend
docker-compose up -d --build

# Wait ~60s for model loading, then verify
curl http://127.0.0.1:8000/health

# Start frontend
cd frontend && npm install && npm run dev
```

**Backend**: `http://127.0.0.1:8000` (API docs at `/docs`)
**Frontend**: `http://localhost:3000`

> **Windows note**: The frontend `.env.local` defaults to `http://127.0.0.1:8000/api` to avoid IPv6 resolution issues with `localhost` on Docker Desktop + WSL2. If you change the backend port, update `frontend/.env.local` accordingly.

### Login
Faculty-only login. Test credentials: `faculty1@gmail.com` / `password`

Any new email auto-registers as faculty during testing phase.

### Workflow
1. Login as faculty
2. Click **Import CSV** to upload any CSV (raw or refined) → the backend auto-maps columns if needed → dashboard populates immediately with risk analysis
3. Or click **Refine CSV** to process raw data client-side first → download the refined output or import directly to dashboard

## Testing

108 backend tests covering security, models, routes, and frontend-backend contracts:

```bash
cd backend
python -m pytest tests/ -v
```

## Recent Changes

See **[CHANGELOG.md](./CHANGELOG.md)** for the full log.
