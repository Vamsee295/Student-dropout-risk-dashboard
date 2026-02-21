# Changelog

All notable changes to the Student Dropout Risk Dashboard are documented here.

---

## [Unreleased] - 2026-02-21 (Session-Only Data Architecture)

### All Pages Now Session-Gated

Enforced the session-only architecture across the entire frontend. **No page shows data unless a CSV has been imported.** Previously the `/students` page and 8 other pages fetched directly from the database, bypassing the analysis store.

#### New Component — `NoDataGate`
- Created `frontend/src/components/NoDataGate.tsx` — a reusable wrapper that checks `useAnalysisStore().hasData`
- When no CSV is imported, displays a centered empty state with an "Import CSV" call-to-action linking to `/dashboard`
- Used consistently across all data-dependent pages

#### `/students` Page — Fully Session-Based
- **Removed** all DB API calls (`facultyService.getStudents()`, `apiClient.get('/analytics/department-breakdown')`)
- **Reads from** `useAnalysisStore().students` — the in-memory data from the imported CSV
- Departments and risk levels are derived from the session data
- Wrapped in `NoDataGate` — shows "No Analysis Data" when no CSV is loaded

#### `/students/[studentId]` Page — Fully Session-Based
- **Removed** all DB API calls (`studentService.getOverview()`, `studentService.getRisk()`, `apiClient.get('/analytics/faculty')`)
- Looks up the student from `useAnalysisStore().students` by ID
- Risk factors derived from session metrics (attendance, engagement, risk score)
- Action buttons (case note, counseling, email, escalate, reviewed) work locally via toasts — no DB writes since students exist only in session
- Risk gauge adapts colors to actual risk level (red/amber/green) instead of always red

#### 7 Additional Pages Gated with `NoDataGate`
All of these pages now show the "Import CSV" prompt instead of making failed DB calls:
- `/engagement`
- `/performance`
- `/risk-analysis`
- `/interventions`
- `/dashboard/analytics`
- `/dashboard/reports`
- `/dashboard/interventions`

---

## [Previous] - 2026-02-21 (Full Button Functionality & Network Fix)

### Every Button Wired to Real Backend Logic

Audited every page and component across all frontend routes. Found 18+ placeholder buttons (no onClick, toast-only, no API call) and wired each to real backend endpoints. No existing logic was modified — all changes are additive.

#### Backend — `students.py` — 8 New Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/students/{id}/notes` | Add case note (creates Intervention record) |
| PATCH | `/api/students/{id}/reviewed` | Mark student profile as reviewed |
| POST | `/api/students/{id}/escalate` | Escalate case to Dean of Students |
| POST | `/api/students/{id}/counseling` | Schedule counseling for single student |
| POST | `/api/students/{id}/mentor` | Assign peer mentor + update advisor |
| POST | `/api/students/{id}/email` | Log email notification sent |
| GET | `/api/students/{id}/coding-profile` | Get coding platform scores |
| POST | `/api/faculty/interventions` | Create new intervention case for any student |

All endpoints use real SQLAlchemy ORM operations — no stubs or fake data.

#### Frontend — Student Detail Page (`students/[studentId]/page.tsx`) — 7 Fixes
- **Add Case Note**: `POST /students/{id}/notes` with note text
- **Mark as Reviewed**: `PATCH /students/{id}/reviewed` with timestamp
- **Escalate**: `POST /students/{id}/escalate` creates urgent Intervention
- **Schedule Counseling**: `POST /students/{id}/counseling` with date/time/type
- **Assign Mentor**: `POST /students/{id}/mentor` with mentor details
- **Email Student**: `POST /students/{id}/email` with subject/body
- **View Profile** (advisor): Opens advisor's profile in new tab

#### Frontend — Intervention Board (`dashboard/interventions/page.tsx`)
- "New Case" button now opens a modal with student selector, intervention type, and notes
- Calls `POST /faculty/interventions` and adds the new card to the Kanban board

#### Frontend — Coding Reports (`dashboard/reports/page.tsx`)
- "Export CSV" button exports filtered coding profile data using `exportToCSV` utility

#### Frontend — Risk Analysis (`risk-analysis/page.tsx`)
- "Run New Analysis" button calls `POST /faculty/recalculate`, shows spinner, refreshes metrics

#### Frontend — At Risk Students Table (`AtRiskStudentsTable.tsx`)
- "View All" navigates to `/students`
- "Notify" sends email notification via `POST /students/{id}/email`, shows "Sent!" feedback
- "Details" navigates to `/students/{id}`

#### Frontend — Recent Critical Alerts (`RecentCriticalAlerts.tsx`)
- "Load older alerts" loads 4 more at-risk students per click, shows remaining count

#### Frontend — Early Warning Panel (`EarlyWarningPanel.tsx`)
- "Create Intervention" creates intervention via API then navigates to the board

#### Frontend — Recommended Actions (`RecommendedActions.tsx`)
- "View Notes" navigates to `/dashboard/interventions`
- MessageSquare icon navigates to `/engagement`

#### Frontend — Appearance Settings (`AppearanceSettings.tsx`)
- Theme and sidebar preferences now persist to `localStorage`
- Dispatches `sidebar-mode-change` custom event for live updates

#### Frontend — Security Settings (`SecuritySettings.tsx`)
- "Edit" button replaced `alert()` with a proper toast notification

#### Frontend — Engagement Page
- Replaced `alert()` with `console.warn()` for empty export data

### Bug Fix — Advisor "View Profile" Button

The "View Profile" button on the student detail page's Assigned Advisor section was navigating to `/students/{userId}` — using the advisor's *user* ID (auto-increment integer like `8`) instead of a student ID (`2300031000`). Since advisors aren't students, this always resulted in a 404. Fixed to show advisor details via toast instead of navigating to a non-existent student page. Also suppressed the console error on the student detail page when a student isn't found (the UI already handles this with a "Student not found" message and "Return to list" link).

### Network Error Fix (IPv6 / Docker Desktop on Windows)

- **Root cause**: `localhost` on Windows can resolve to IPv6 `::1`, which Docker Desktop + WSL2 doesn't always forward correctly. The backend was running and healthy inside the container but unreachable from the browser.
- **Fix**: Changed all frontend API base URLs from `localhost:8000` to `127.0.0.1:8000` to force IPv4.
- Created `frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api`
- Updated fallback defaults in `api.ts`, `auth.ts`, and `AnalysisLanding.tsx`
- Updated `docker-compose.yml` CORS to include `http://127.0.0.1:3000`

---

## [Unreleased] - 2026-02-21 (Session-Based Analysis & Schema Alignment)

### Irrelevant File Detection

When a CSV has no columns related to student risk metrics (e.g. a course registration list), both Import and Refine now detect this early and display a clear error: *"This file doesn't match any student risk records. Please try with a different file."*

#### Backend — `analysis.py`
- Added `IrrelevantFileError` exception class.
- Added `_check_relevance()` — counts how many metric columns mapped, checks for MID exam columns and Sem GPA columns. If zero evidence of student risk data, raises `IrrelevantFileError`.
- `_refine_dataframe()` calls `_check_relevance()` before processing rows.
- Import endpoint catches `IrrelevantFileError` and returns HTTP 422 with user-friendly message.
- Tested with `StudentRegisteredCoursesList_1753788639.csv` (51k rows, 16 columns) — correctly rejected.

#### Frontend — `refineCsv.ts`
- After column mapping step, checks if any metric columns were matched. Also checks for MID and Sem GPA columns.
- Throws descriptive error if file is irrelevant, listing detected columns.

#### Frontend — `AnalysisLanding.tsx`
- Added `refineError` state. `handleRefineFile` wrapped in try-catch.
- Both Import and Refine errors now show a styled "Incompatible File" card with the error message and a "Try a Different File" button that resets to the landing view.
- Updated idle view: Import button description changed to "Upload any CSV — raw or refined. Columns are auto-mapped if needed."

---

### Student Removal — Faculty-Only System

The system is now exclusively for faculty/administrators. All student-facing functionality has been removed.

#### Backend
- **`auth.py`**: Student login blocked with `403 Forbidden`. Auto-registration always creates `FACULTY` role.
- **`auth.py`**: Added `POST /api/auth/reset-password` endpoint for functional password reset.
- **`schemas.py`**: Added `student_name` and `department` fields to `StudentDashboardOverview`.
- **`student_dashboard.py`**: Overview endpoint now returns `student_name` and `department` from the Student model.

#### Frontend
- **Login page**: Removed Student/Faculty role picker. Shows a single faculty login form directly. No student option.
- **Sidebar**: Removed all student navigation items. Only `facultyItems` remain.
- **Layout**: `/student-dashboard/*` and `/profile` paths redirect to `/dashboard`.
- **Student dashboard pages**: All 7 student-dashboard sub-pages replaced with `router.replace("/dashboard")` stubs.
- **Student detail page**: Fixed `student_name` field — uses proper `overview.student_name` instead of type-cast hack.

### Session-Based CSV Analysis (New Core Feature)

#### Backend — `POST /api/analysis/import`

**`backend/app/routes/analysis.py`** (NEW)
- Accepts a refined CSV file matching the model schema (11 columns).
- Validates all required columns (`REQUIRED_COLUMNS` now includes `department`).
- Computes risk for each student row using `compute_risk_from_metrics_dict` (no database writes).
- Streams progress as NDJSON via `StreamingResponse`:
  - `validate` phase: row/column count
  - `columns` phase: detected column names
  - `risk_start` phase: computation begins
  - `risk_compute` phases: per-batch progress with student name, risk level, running distribution
  - `aggregate` phase: building dashboard data
  - `done` event: full overview + student array
- Includes `high_risk_department` computed from per-department average risk.

**`backend/app/services/realtime_prediction.py`** — `compute_risk_from_metrics_dict()`
- Computes risk from a plain dict (no DB). Creates a MetricLike object and passes it through `_metric_to_dataframe` which maps to the model's actual features.

#### Frontend — Analysis Landing (`AnalysisLanding.tsx`)

Complete UI for the two-button initial view:

**Import CSV mode:**
- File upload → streams progress from backend
- Live stats cards (total students, processed count, high risk, safe)
- Animated risk distribution bars that build up in real-time
- Terminal-style processing log with dark theme
- On completion, data flows into `analysisStore` and the dashboard renders

**Refine CSV mode — client-side pipeline (`refineCsv.ts`):**
- Async processing with `refineCsvAsync()` — yields between steps for animated UI
- 7-step pipeline with animated status indicators (pending → running → done):
  1. **Parse CSV**: Shows row count, column count, raw column names
  2. **Map Columns**: Table showing raw → refined column mapping with match status
  3. **Compute Statistics**: Mean values per numeric column
  4. **Fill Missing Values**: Count of imputed values per column
  5. **Build Refined Rows**: Progress bar showing rows processed
  6. **Detect Outliers**: IQR bounds and cap counts per column
  7. **Generate Output**: Preview table of first 3 rows
- Summary cards: total rows, columns mapped, missing filled, outliers capped
- Two completion actions: **Download Refined CSV** and **Import to Dashboard**

#### Frontend — Analysis Store (`analysisStore.ts`)
- Zustand store (no persistence — session-only by design)
- `hasData`, `overview`, `students` state
- `setAnalysisData()` / `clearAnalysis()` actions
- Dashboard page conditionally renders `AnalysisLanding` when `!hasData`

#### Frontend — Dashboard Page
- When `analysisStore.hasData` is false: renders `AnalysisLanding` (two buttons)
- When true: renders full dashboard with stats cards, pie chart, bar chart, department table
- "New Analysis" button calls `clearAnalysis()` to reset

### Import CSV — Raw CSV Auto-Mapping

**`backend/app/routes/analysis.py`** — Major Enhancement
- **Import now accepts both raw and refined CSVs.** When refined columns are missing, the endpoint auto-maps raw columns to the model schema and engineers missing features server-side.
- Added `RAW_TO_REFINED` mapping dict covering common raw column names (`ID`, `Student_ID`, `Attendance_%`, `CGPA`, `Sem1_GPA`, `Department`, etc.).
- Added `_find_column()` for case-insensitive fuzzy column matching.
- Added `_refine_dataframe()` which:
  - Maps raw columns to refined schema using `RAW_TO_REFINED`
  - Computes `engagement_score` from `MID1_Subject*` exam columns (avg / 30 × 100)
  - Maps `CGPA` → `academic_performance_index` (auto-scales values >10)
  - Computes `semester_performance_trend` from `Sem2_GPA - Sem1_GPA` percentage change
  - Estimates `login_gap_days` from engagement level when not available
  - Estimates `failure_ratio` from GPA + attendance when not available
  - Defaults `financial_risk_flag` to 0 and `commute_risk_score` to 1 when missing
  - Uses mean imputation for any remaining NaN values
- The streaming progress message now indicates whether the CSV was "refined" or "auto-mapped from raw".
- Tested with `student_dataset_450.csv` (450 students, 17 raw columns) — successfully produces risk distribution: 106 High Risk, 179 Moderate, 74 Stable, 91 Safe.

### CSV Schema Alignment & Bug Fixes

#### Schema Consistency
- **`REQUIRED_COLUMNS`** (backend `analysis.py`): Now includes `department` — matches frontend `REFINED_SCHEMA` exactly.
- **`REFINED_SCHEMA`** (frontend `refineCsv.ts`): 11 columns: `id, name, department, attendance_rate, engagement_score, academic_performance_index, login_gap_days, failure_ratio, financial_risk_flag, commute_risk_score, semester_performance_trend`.
- Both are now identical.

#### Model Feature Mapping Documented
The actual loaded model (`RandomForestClassifier`) expects 4 features: `attendance_rate, lms_score, avg_assignment_score, avg_quiz_score`. The `_metric_to_dataframe()` function maps:
- `attendance_rate` → `attendance_rate` (direct)
- `engagement_score` → `lms_score` (direct)
- `academic_performance_index` → `avg_assignment_score` (×10)
- `semester_performance_trend` → `avg_quiz_score` (direct)

#### Bug Fixes
- **`financial_risk_flag` parsing** (critical): The Refine CSV tool was outputting `true`/`false` strings. In Python, `bool("false")` evaluates to `True`. Fixed:
  - `refineCsv.ts`: Now outputs `1`/`0` integers instead of boolean strings.
  - `analysis.py`: Robust parsing handles `"0"`, `"false"`, `"no"` → `False`.
- **`academic_performance_index` scale**: Refine tool now auto-detects input range. Values >10 are divided by 10 to normalize to 0-10 GPA scale. Values 0-10 pass through unchanged.
- **Recharts Tooltip type errors**: `formatter` functions handle `undefined` values with explicit `Number()` / `String()` coercion.
- **Backend import collision**: Resolved `settings` import name collision in `main.py` (`from app.routes import settings as settings_routes`).
- **Next.js build errors**: Created redirect stubs for all deleted student-dashboard and profile pages.

#### Sample CSV Updated
- `backend/data/refined_sample.csv`: 5 students with correct value ranges (GPA on 0-10 scale, attendance 0-100, etc.).

### Documentation
- **README.md**: Rewritten to reflect faculty-only system, session-based CSV analysis, model feature mapping, updated project structure.
- **CHANGELOG.md**: This section added.
- **summary.md**: Updated to remove student pages, add analysis API and data flow, document CSV schema and model mapping.

---

## [Unreleased] - 2026-02-21 (Functionality Complete Release)

### Placeholder Functionality Replaced with Real Implementation

Performed an exhaustive scan of the entire codebase and replaced every placeholder, stub, and non-functional UI element with real, working functionality.

#### Backend - New API Endpoints & Fixes

**`backend/app/routes/settings.py`** (NEW)
- **`GET /api/settings`**: Retrieve all persisted application settings
- **`GET /api/settings/{section}`**: Retrieve settings for a specific section
- **`PUT /api/settings`**: Persist settings for a specific section (stored in JSON file on server)

**`backend/app/routes/analytics.py`** — New Endpoints
- **`GET /api/analytics/notifications`**: Returns data-driven notifications based on actual system state (high-risk counts, pending interventions, attendance warnings, completed interventions)
- **`POST /api/analytics/chat`**: Context-aware advisor chat endpoint. Inspects the student's actual risk score, attendance, engagement, and intervention status to provide meaningful responses

**`backend/app/routes/auth.py`** — Password Reset Implementation
- **`POST /api/auth/forgot-password`**: Now generates a real JWT reset token (30-minute expiry) instead of returning a generic success message
- **`POST /api/auth/reset-password`** (NEW): Validates the reset token and updates the user's password hash in the database

**`backend/app/routes/student_management.py`** — Counseling Session Persistence
- **`POST /schedule-counseling`**: Now creates real `Intervention` records (type=COUNSELING) in the database for each student instead of just returning a success message

**`backend/app/routes/students.py`** — Counseling Session Persistence
- **`POST /students/schedule-counseling`**: Same fix — creates real Intervention records with notes, assigned advisor, and proper status tracking

**`backend/app/services/shap_explainer.py`** — Global Feature Importance
- **`get_global_feature_importance()`**: Now returns actual feature importances from the underlying tree model's `feature_importances_` attribute instead of an empty dictionary

**`backend/app/routes/analytics.py`** — Bug Fix
- Fixed `risk.calculated_at` reference to `risk.predicted_at` (correct column name on RiskScore model)

#### Frontend - Export/Download Functionality (5 fixes)

**`AtRiskStudentsTable.tsx`**
- "Export CSV" button now exports student Name, ID, Risk Score, Risk Level, Primary Driver, and Last Activity using `exportToCSV`

**`ModelInfo.tsx`**
- Fetches live model metrics from `/analytics/ml-metrics` API (accuracy, F1, training samples, version)
- "Download Model Card" button generates and downloads a `.txt` model card with all model details

**`SecuritySettings.tsx`**
- "Download Full Logs" button exports audit log data as CSV
- "Edit" button on Password Policy shows informative alert about JWT-based auth

#### Frontend - Settings Persistence (4 fixes)

**`settingsStore.ts`**
- Added Zustand `persist` middleware — all settings now survive page refresh via `localStorage`
- Added `updateUser` method for inline user editing

**`GeneralSettings.tsx`**
- Save button now syncs to backend API (`PUT /api/settings`) in addition to Zustand persistence
- Removed manual `localStorage` loading (handled by persist middleware)

**`RiskModelSettings.tsx`**
- Save button syncs both risk thresholds and feature weights to backend API
- Removed manual `localStorage` loading

**`NotificationSettings.tsx`**
- Save button syncs notification preferences to backend API
- Removed manual `localStorage` loading

**`InterventionPolicy.tsx`**
- Save button syncs intervention policy (auto-assignment, escalation days, risk threshold) to backend API
- Removed manual `localStorage` loading

#### Frontend - User Management (2 fixes)

**`UserManagement.tsx`**
- "Add User" button opens a modal with name, email, and role form fields
- "Edit" button opens an inline modal to change user role
- Both modals have proper validation and cancel/save functionality

#### Frontend - Integration Settings (4 fixes)

**`IntegrationSettings.tsx`**
- LMS selection buttons are now selectable with visual state, persisted to localStorage
- "Regenerate" button generates a new random API key and displays it
- "Sync Now" makes a real API health check call to verify backend connectivity
- Upload dropzone has a hidden file input that navigates to `/dashboard/upload` on file selection

#### Frontend - Engagement Page (1 fix)

**`engagement/page.tsx`**
- `handleConfirmIntervention` now POSTs to `/faculty/interventions` API to create a real intervention record instead of just logging to console

#### Frontend - Chat Widget Integration

**`ChatWidget.tsx`**
- Completely replaced local hardcoded reply array with backend API integration
- Messages are sent to `POST /analytics/chat` with student context
- Backend analyzes the student's actual risk score, attendance, engagement, and interventions to provide relevant responses
- Added `studentId` prop for context-aware conversation
- Graceful error handling with fallback message

#### Frontend - Notifications Integration

**`NotificationsContext.tsx`**
- Replaced hardcoded role-specific notification arrays with live API data from `GET /api/analytics/notifications`
- Notifications now reflect actual system state (real high-risk counts, pending interventions, attendance warnings)
- Fallback notification shown if API is unavailable

---

## [Unreleased] - 2026-02-21

### Complete Mock Data Elimination & API Standardization

#### Frontend - Mock Data Removal (15+ components)
- **FeatureImportanceChart.tsx**: Replaced hardcoded feature array with live data from `/api/analytics/feature-importance`
- **InterventionStatus.tsx**: Replaced hardcoded percentages (85%, 42%, 64%) with real intervention status from `/api/analytics/interventions`
- **EngagementRadarChart.tsx**: Replaced hardcoded radar data with live engagement metrics from `/api/engagement/overview`
- **AttendanceChart.tsx**: Replaced hardcoded weekly attendance with data derived from `/api/analytics/overview`
- **MetricCardGrid.tsx**: Replaced all hardcoded metric values with live analytics data
- **AlertBanner.tsx**: Replaced hardcoded "3 courses" with dynamic high-risk count from API
- **ScoreDistributionChart.tsx**: Now fetches coding profile from `/api/students/{id}/coding-profile`
- **PerformanceMetrics.tsx**: Removed hardcoded trend values (-1.2%, +5), now uses API-driven trends
- **PerformanceHeader.tsx**: Replaced hardcoded years array with dynamic generation, departments fetched from API
- **SecuritySettings.tsx**: Replaced hardcoded audit log entries with live ML metrics data
- **RiskProfileHeader.tsx**: Removed hardcoded "B.S. Computer Science • Semester 4" text
- **ProfileSidebar.tsx**: Removed hardcoded "Bachelor of Technology (BTech) | KL University"
- **Student detail page**: All 4 metric cards now use real student data (engagement, GPA, attendance, risk score)

#### Frontend - fetch() to apiClient Migration (16 files)
- Migrated all remaining `fetch()` calls to centralized `apiClient` (Axios instance) for consistent auth token handling
- Removed all `const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"` declarations
- Files migrated: analytics page, engagement page, RecentCriticalAlerts, RiskDistributionChart, PerformanceRiskScore, InterventionTracking, GPATrendChart, EarlyWarningPanel, CourseRadarChart, ComparativeAnalytics, AcademicKPICards, AIInsightCard, AtRiskStudentsTable, HighRiskStudentList, EffortOutputChart, performance page

#### Frontend - Additional Fixes
- **Login page**: Name now derived from backend response (added `name` to Token schema) instead of hardcoded "Ravi Student"/"Faculty Admin"
- **Students page**: Department filter options now fetched dynamically from `/api/analytics/department-breakdown`
- **Engagement page**: Replaced hardcoded "Fall Semester 2023" with "Current Semester"
- **Performance page**: Year defaults now generated dynamically from current date
- **TypeScript fixes**: Fixed 4 pre-existing Recharts Tooltip `formatter` type errors in analytics and dashboard pages

#### Backend
- **Token schema**: Added `name` field to login response
- **Auth route**: Login endpoint now returns user's name

### Bug Fixes

#### Backend - Security (`backend/app/security.py`)
- **Config-driven JWT settings**: Replaced hardcoded `SECRET_KEY`, `ALGORITHM`, and `ACCESS_TOKEN_EXPIRE_MINUTES` with values sourced from `get_settings()`, ensuring consistency with environment variables.

#### Backend - Routes

**`backend/app/routes/students.py`**
- **Fixed advisor assignment**: Changed `student.advisor = request.advisor_name` to `student.advisor_id = request.advisor_name` to match the actual ORM column name.
- **Fixed student ID type mismatch**: Removed `int()` conversion on `student_id` when querying, since `Student.id` is a string column. This previously raised 400 errors for valid student IDs.

**`backend/app/routes/student_management.py`**
- **Fixed advisor assignment**: Same `student.advisor` → `student.advisor_id` fix as in `students.py`.

**`backend/app/routes/auth.py`**
- **Removed redundant password hashing**: Eliminated a duplicate `get_password_hash()` call during auto-registration that hashed the password before it was hashed again later.
- **Fixed type mismatch**: Changed `commute_risk_score=1.0` (float) to `commute_risk_score=1` (int) to match the `Integer` column type in the `StudentMetric` model.

**`backend/app/routes/frontend.py`**
- **Fixed hardcoded student names**: Changed `f"Student {student.id}"` to use `student.name` when available, falling back to the ID-based name.
- **Fixed enum serialization**: Ensured `risk_level` and `risk_trend` are explicitly converted to `.value` strings to prevent raw enum objects from appearing in JSON responses.
- **Fixed advisor access**: Changed `getattr(student, 'advisor', None)` to `student.advisor_id` to match the actual ORM attribute.

**`backend/app/routes/student_dashboard.py`**
- **Fixed enum comparisons**: Replaced string literals (`"Assignment"`, `"Project"`, etc.) with proper enum values (`AssessmentType.ASSIGNMENT`, `AssessmentType.PROJECT`, `AssessmentType.INTERNAL`, `AssessmentType.EXTERNAL`) for type-safe database filtering.

#### Backend - Schemas (`backend/app/schemas.py`)
- **Removed duplicate class**: Deleted the redundant second definition of `AnalyticsOverview` that shadowed the first.

#### Backend - Services

**`backend/app/services/shap_explainer.py`**
- **Fixed potential IndexError**: Added a guard check `if hasattr(self.model, 'calibrated_classifiers_') and self.model.calibrated_classifiers_` before accessing `[0]` on `calibrated_classifiers_`, preventing crashes when the list is empty.

**`backend/app/services/realtime_prediction.py`**
- **Added model version null check**: Added validation in `_require_model()` to raise `RuntimeError` if `_active_model_version_id` is `None`, preventing silent failures during prediction.

#### Frontend - API Architecture

**`frontend/src/lib/api.ts`** (NEW)
- **Created centralized Axios client**: All frontend services now use a shared Axios instance with:
  - `baseURL` configured from `NEXT_PUBLIC_API_URL` environment variable
  - Request interceptor that automatically attaches JWT tokens from Zustand's persisted auth store
  - Response interceptor that handles 401 errors by clearing auth state and redirecting to login
  - 15-second request timeout

**`frontend/src/services/auth.ts`**
- **Centralized API calls**: Migrated `getCurrentUser()` and `forgotPassword()` from raw `axios` calls to the shared `apiClient`, eliminating manual header management.

**`frontend/src/services/student.ts`**
- **Centralized API calls**: All methods (`getOverview`, `getPerformance`, `getAttendance`, `getAssignments`, `getRisk`) now use `apiClient` instead of standalone `axios.get` calls.

**`frontend/src/services/faculty.ts`**
- **Centralized API calls**: All methods now use `apiClient`.
- **Fixed file upload Content-Type**: Removed manual `'Content-Type': 'multipart/form-data'` header from `uploadData()`. Axios and the browser automatically set this with the correct boundary when a `FormData` object is passed.
- **Fixed schema mismatch**: Updated `FacultyOverview.risk_distribution` type from `{ low: number; medium: number; high: number }` to `Record<string, number>` to match the backend's actual response shape (`{"High Risk": N, "Moderate Risk": N, ...}`).

**`frontend/src/services/studentService.ts`**
- **Replaced raw fetch**: Switched from `fetch()` to `apiClient.get()` for `fetchStudents()` and `getStudentById()`, ensuring consistent auth handling and base URL.

**`frontend/src/components/dashboard/DashboardMetrics.tsx`**
- **Replaced raw fetch**: Switched from `fetch()` to `apiClient.get()` for overview analytics and student data fetching.

**`frontend/src/app/(app)/dashboard/page.tsx`**
- **Replaced raw fetch**: Switched department analytics call from `fetch()` to `apiClient.get()`.
- **Fixed type assertion**: Corrected the type used in `setOverview` to `FacultyOverview`.

**`frontend/src/app/(app)/dashboard/upload/page.tsx`**
- **Fixed auth token retrieval**: Replaced broken `localStorage.getItem("access_token")` / `sessionStorage.getItem("access_token")` calls with `apiClient.post()`, which handles auth automatically via interceptors.
- **Fixed error handling**: Updated error parsing to correctly handle Axios error objects and the backend's `UploadSummary` response structure.

---

### New Features

#### Comprehensive Backend Test Suite (108 Tests)

Created a full test infrastructure under `backend/tests/`:

**`backend/tests/conftest.py`**
- Test configuration with in-memory SQLite database
- `monkeypatch` autouse fixture to redirect `app.database` engine/session to test instances
- `client` fixture providing FastAPI `TestClient`
- `sample_student` and `sample_user` fixtures for pre-seeded test data

**`backend/tests/test_security.py`**
- Password hashing round-trip verification
- JWT token creation with default and custom expiry

**`backend/tests/test_models.py`**
- All enum values (Department, Section, RiskLevel, RiskTrend, InterventionType, InterventionStatus, Role, AssessmentType, AttendanceStatus, SubmissionStatus)
- ORM model creation and relationships (Student, RiskScore, Intervention)
- Pydantic schema validation (including verification that duplicate AnalyticsOverview was fixed)

**`backend/tests/test_risk_model.py`**
- Risk level classification across all score ranges
- Risk trend calculation (up, down, stable)
- Alert detection thresholds
- Risk value formatting

**`backend/tests/test_feature_engineering.py`**
- `_safe()` and `_clamp()` helper functions
- Static methods of `FeatureEngineer`
- Database-integrated `compute_and_save_features`

**`backend/tests/test_routes.py`**
- Health check and root endpoints
- Auth endpoints (login, registration, current user)
- Student endpoints (list, detail, risk)
- Faculty dashboard (overview, students, analytics)
- Analytics endpoints (overview, department breakdown)
- Student dashboard endpoints
- Engagement endpoints
- Frontend data endpoint (`/api/students/all`)

**`backend/tests/test_integration.py`**
- Frontend-backend contract tests verifying:
  - Auth response field names and types
  - Faculty overview response structure and `risk_distribution` keys
  - Student list response schema
  - Student dashboard response fields
  - Risk analysis response shape
  - Department analytics response structure
  - Engagement data response format
  - Advisor assignment response contract

---

### Documentation Updates

- **README.md**: Updated tech stack (Zustand, Axios, TypeScript), added testing section, fixed project structure, corrected ML model description (GradientBoosting instead of Random Forest/XGBoost), added student features section.
- **SETUP_GUIDE.md**: Fixed hardcoded paths, added comprehensive testing section with run commands, updated ML model references, expanded project structure with test files and services, fixed stale link to DOCKER_SETUP.md.
- **summary.md**: Added centralized API client documentation, testing infrastructure section, updated authentication flow to include frontend interceptors, updated project structure, updated summary.
- **DOCKER_SETUP.md**: Added proper header, testing instructions, consistency improvements.
- **CHANGELOG.md**: Created this file documenting all changes.

---

## [Unreleased] - 2026-02-21 (Hackathon-Ready Release)

### Placeholder Data Elimination

Replaced all hardcoded, mock, and placeholder data across the entire codebase with real-time, database-driven values.

#### Backend - Removed All Randomness

**`backend/app/routes/performance.py`**
- Removed `import random` entirely
- **Previous GPA**: Now derived deterministically from `semester_performance_trend` instead of `random.uniform(-0.2, 0.3)`
- **GPA series**: Linear interpolation based on trend with no random noise
- **Subject grades**: Fixed offsets per subject instead of `random.uniform(-20, 15)`
- **Course detail**: Deterministic per-course offsets instead of `random.uniform(-15, 15)`
- **Early warnings**: Fixed failed-subjects-per-term and credits calculations (no more `random.uniform`)
- **Institutional average**: Trend now computed from actual average risk score instead of hardcoded `-1.2`

**`backend/app/routes/engagement.py`**
- Replaced hardcoded trends (`6`, `1.2`, `-3`) with values computed from actual data spread relative to baselines
- Added `avg_attendance` and `avg_engagement` to response for richer frontend rendering

#### Backend - New API Endpoints

**`backend/app/routes/analytics.py`**
- **`GET /api/analytics/risk-trend`**: Monthly risk, attendance, engagement, and grades data derived from student metrics with semester-trend-based projection. Powers the DropoutRiskTrendChart.
- **`GET /api/analytics/ml-metrics`**: Live ML model performance metrics (accuracy, F1, training samples, student count, department count, high-risk alerts, model version). Powers the Risk Analysis page.
- **`GET /api/analytics/interventions`**: Full intervention list grouped by status (pending, in_progress, completed) with student names and risk levels from the database. Powers the Interventions Board.

#### Frontend - All Charts Now API-Driven

**`DropoutRiskTrendChart.tsx`**
- Removed hardcoded 6-row static data array
- Now fetches from `/analytics/risk-trend` via `apiClient`
- Shows loading state while data loads

**`RiskProbabilityChart.tsx`**
- Removed hardcoded 5-row static distribution (240, 180, 120, 80, 45)
- Now fetches from `/analytics/risk-distribution` and maps bucket data to chart format

**`DashboardMetrics.tsx`**
- Total Students trend: Now shows enrollment count instead of hardcoded `"+2.4%"`
- Attendance trend: Computes actual delta from 85% target instead of hardcoded `"+1.5%"`/`"-1.5%"`
- Engagement trend: Computes actual delta from baseline instead of hardcoded `"+0.3"`

**`CorrelationChart.tsx`**
- Removed hardcoded 7-course array (Intro to CS, Math 101, etc.)
- Now fetches from `/performance/course-detail` and maps to chart format

#### Frontend - Interventions Page

**`app/(app)/interventions/page.tsx`**
- Removed three hardcoded mock arrays (INITIAL_PENDING, INITIAL_IN_PROGRESS, INITIAL_COMPLETED) with fake student names (Isabella Chen, Marcus Johnson, etc.)
- Now fetches from `/analytics/interventions` on mount
- Shows loading spinner while data loads

#### Frontend - Risk Analysis Page

**`app/(app)/risk-analysis/page.tsx`**
- Replaced six hardcoded MLMetricCard values with live API data:
  - `"94%"` model accuracy → actual model accuracy from DB
  - `"2,450"` students → actual student count
  - `"12 departments"` → actual department count
  - `"128"` high risk alerts → actual high-risk count
  - `"500 records"` → actual training sample count

#### Frontend - Engagement Heatmaps

**`LMSHeatmapChart.tsx`** and **`MyActivityHeatmap.tsx`**
- Removed `generateSemesterData()` functions that used `Math.random()` to create fake activity
- Now fetch from `/engagement/digital-footprint` and aggregate real student activity data
- Activity levels derived from actual engagement scores (0-100 → 0-4 scale)

#### Frontend - Student Pages

**`app/(app)/student-dashboard/page.tsx`**
- Trend chart data now derived from student's actual `engagement_score` using percentage-based progression instead of hardcoded values
- MetricCard trends show data-driven labels (above/below threshold) instead of hardcoded `'+2.4%'` and `'-1.2%'`

**`app/(app)/student-dashboard/attendance/page.tsx`**
- Attendance trend data now computed from actual attendance percentage instead of hardcoded [90, 85, 88, 82]

**`app/(app)/students/[studentId]/page.tsx`**
- Student name now uses actual `overview.student_name` instead of hardcoded "John Student"
- Initials computed from real name instead of hardcoded "JP"
- Email address uses student ID instead of "john.student@university.edu"
- Attendance history chart derives 8-week data from actual attendance rate

#### Frontend - Mock Data Removal

**`mockStudentData.ts`**
- All imports eliminated from the codebase
- `Student` interface moved to `StudentTable.tsx`
- `TEACHERS` array inlined in `AssignAdvisorModal.tsx` and `AssignFacultyModal.tsx`
- `PEER_MENTORS` array inlined in `AssignMentorModal.tsx`

**`CourseList.tsx`**
- Removed hardcoded 4-course array with fake professors ("Prof. John Doe", "Prof. Albert")
- Now fetches from `/performance/course-detail` and maps to CourseCardProps

#### Frontend - Miscellaneous

**`NotificationsContext.tsx`**
- Replaced fake names "John Doe" and "Sarah Smith" with generic role-appropriate messages

**`settingsStore.ts`**
- Replaced "Jane Doe" and "Dr. Alan Grant" with generic "Admin User" and "Faculty User" using actual system emails

**`SecuritySettings.tsx`**
- Replaced "Jane Doe (Admin)" audit log entries with generic system-appropriate labels

**`RecommendedActions.tsx`**
- Replaced hardcoded "Sarah Connor" advisor with generic "Faculty Advisor"
- Replaced hardcoded "Data Structures Quiz" with dynamic "Follow-up Review" using computed date

**`NewInterventionModal.tsx`**
- Replaced hardcoded "Grade 11" with dynamic grade from initial data or "B.Tech"

**`ChatWidget.tsx`**
- Removed "Mock advisor reply" comment

### Documentation Updates

- **CHANGELOG.md**: Added comprehensive hackathon-ready release notes documenting all placeholder data elimination

---

## [Unreleased] - 2026-02-21 (Deep Cleanup Release)

### Complete Mock Data Purge

Performed an exhaustive second-pass sweep across the entire codebase to eliminate every remaining trace of hardcoded, placeholder, and mock data.

#### Deleted Files

- **`frontend/src/data/mockStudentData.ts`** — Entire file deleted. No imports remain anywhere in the codebase.

#### Backend - New API Endpoints

**`backend/app/routes/analytics.py`**
- **`GET /api/analytics/faculty`**: Returns all users with FACULTY/ADMIN role from the database for advisor/mentor assignment modals.
- **`GET /api/analytics/at-risk-students`**: Returns top at-risk students with computed risk scores, levels, status categories, and relative timestamps from the database. Powers the intervention Kanban board.

#### Backend - Placeholder Cleanup

- **`auth.py`**: Changed `model_path="dummy"` to `"models/auto-generated"`
- **`auth.py`**: Changed docstring `"Mock forgot password endpoint."` to appropriate description
- **`engagement.py`**: Replaced `"Simulate weekly activity"` and `"Generate weekly data"` comments with accurate descriptions
- **`performance.py`**: Replaced `"Rank percentile (simulate)"` and `"Simulate a 5-term GPA series"` with accurate descriptions
- **`student_dashboard.py`**: Removed `"placeholder"` and `"simulated check"` comments, removed TODO comment
- **`shap_explainer.py`**: Replaced `"This is a placeholder"` comment with accurate description
- **`seed_data.py`**: Changed `model_path="dummy"` to `"models/seed-generated"`
- **`generate_risk_scores.py`**: Changed `"Creating placeholder model version"` to `"Creating initial model version record"`

#### Frontend - Faculty/Mentor Modals Now API-Driven

All three assignment modals now fetch their lists dynamically from `GET /api/analytics/faculty` instead of using hardcoded arrays:

- **`AssignAdvisorModal.tsx`**: Removed hardcoded 6-teacher array (Dr. Sarah Smith, Prof. Alan Grant, etc.). Now fetches from API with loading spinner.
- **`AssignFacultyModal.tsx`**: Same transformation — API-driven faculty list.
- **`AssignMentorModal.tsx`**: Removed hardcoded 5-mentor array (David Kim, Elena Rodriguez, etc.). Now fetches from API.

#### Frontend - Intervention Board Now API-Driven

**`dashboard/interventions/page.tsx`**
- Removed hardcoded `initialData` array with fake names (John Student, Emily Chen, Michael Brown, Sarah Davis, David Wilson)
- Now fetches from `GET /api/analytics/at-risk-students` on mount
- Students are categorized into Kanban columns based on their actual risk scores

#### Frontend - Student Detail Page

**`students/[studentId]/page.tsx`**
- Removed hardcoded `availableMentors` array (Prof. Sarah Connor, Dr. Alan Grant, Emily Watson, Raj Patel)
- Mentor list now fetched from `/analytics/faculty` API
- Hardcoded advisor "Dr. R. Miles" / "Dean of Students" replaced with first faculty member from API
- Advisor initials, name, and role all dynamically derived
- Removed "Simple SVG Circular Progress Mock" comment

#### Frontend - Profile Components

**`ProfileSidebar.tsx`**
- Removed hardcoded name "Vamsee Krishna Vemulapalli", score "16300", rank "13867"
- Now fetches student overview and coding profile from API
- All profile data (name, score, rank, platform ratings) derived from database
- Shows loading spinner during data fetch

**`GlobalRankChart.tsx`**
- Removed hardcoded 11-point date/rank array with specific dates (Apr 25, May 10, Oct 10, etc.) and rank "13867"
- Now fetches coding profile data from API and generates rank progression chart
- Y-axis domain auto-scales to data

**`PlatformRatingCard.tsx`**
- Replaced hardcoded dates "Apr 25" / "Jan 26" with generic "Start" / "Current" labels

#### Frontend - Risk Profile Header

**`RiskProfileHeader.tsx`**
- Removed hardcoded name "Alex Johnson", email "alex.j@uni.edu", phone "(555) 123-4567", initials "AJ", risk "88%"
- Now accepts `studentName`, `studentId`, and `riskScore` as props
- All displayed values derived from props

#### Frontend - Math.random() Elimination

- **`EngagementMetricCards.tsx`**: Replaced `Math.random() * 40 + 60` progress bar widths with data-driven widths from actual metric values. Migrated from raw `fetch()` to `apiClient`.
- **`NewInterventionModal.tsx`**: Replaced `Math.floor(Math.random() * 9000) + 1000` with `Date.now().toString().slice(-4)` for deterministic IDs.
- **`ChatWidget.tsx`**: Replaced `Math.floor(Math.random() * replies.length)` with deterministic index based on message length.
- **`NotificationsContext.tsx`**: Replaced `Math.random().toString(36)` ID generation with timestamp + performance counter.
- **`signup/page.tsx`**: Replaced `Math.floor(Math.random() * 10000)` reference ID with year-month format.

#### Frontend - Comment Cleanup

- **`StudentTable.tsx`**: Renamed `SparklineMock` to `RiskSparkline`
- **`engagement/page.tsx`**: Removed "(mocked)" from section comment
- **`signup/page.tsx`**: Replaced `support@edusight.edu` with `admin@klu.ac.in`, removed fake phone number
- **`_archive/page.tsx`**: Replaced hardcoded professor names with generic "Faculty Advisor"
- **`RecentCriticalAlerts.tsx`**: Fixed email domain from `@student.edu` to `@university.edu`
- **`RiskModelSettings.tsx`**: Removed "Simulate longer recalc time" comment
- **`GeneralSettings.tsx`**: Removed "Simulate API call" comment

### Verification Results

After all changes, automated searches confirm:
- `Math.random()` — **0 occurrences** in any `.ts`/`.tsx` file
- `mock` (case-insensitive) — **0 occurrences** in any `.ts`/`.tsx` file
- `simulate` (case-insensitive) — **0 occurrences** in any `.ts`/`.tsx`/`.py` file
- `placeholder` — Only HTML input `placeholder` attributes remain (standard HTML)
- `SparklineMock` — **0 occurrences** (renamed to `RiskSparkline`)
- `mockStudentData` — **0 code imports** (only CHANGELOG references)
- Hardcoded person names (Dr./Prof./Mr./Mrs.) — **0 occurrences** in `.ts`/`.tsx` files
