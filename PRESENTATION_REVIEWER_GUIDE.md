# Student Dropout Risk Dashboard — Reviewer Presentation

Use this when **presenting to a hackathon reviewer**. Aim for **6–10 minutes**; expand only if they ask.

---

## 1. Opening (30 sec)

- **Name:** Student Dropout Risk Dashboard  
- **One line:** Faculty upload any student CSV → we auto-clean and map it → a Random Forest model gives a 0–100 risk score and **SHAP explains why** → dashboard, engagement, and interventions in one place. No code, no Excel wrestling.  
- **Tagline:** Predict who’s at risk, see why, and act—all from one platform.

---

## 2. Problem (45 sec)

- Institutions lack a **proactive** way to spot at-risk students before they drop out.  
- Data is **messy**: different column names, missing values, raw MID/CGPA columns; faculty waste time in Excel instead of acting.  
- Data is **siloed**: no single view of who is at risk, how severe, and **why** (attendance vs grades vs engagement). Without “why,” faculty can’t target interventions.  
- **User:** Faculty and advisors only; student login has been removed.

---

## 3. Solution (1–2 min)

- **Upload any CSV** — Refined (11-column schema) or **raw**. We auto-map columns (e.g. CGPA, Attendance_%, MID1_Subject*) and engineer missing features (e.g. engagement from MID scores). If the file has no student metrics (e.g. course registration list), we **reject** it with a clear message: “This file doesn’t match any student risk records. Please try with a different file.”  
- **Refine CSV (optional):** User can also run a **client-side** pipeline: column mapping, mean imputation, IQR outlier capping, then download a model-ready CSV or import from there.  
- **ML + explainability** — Pre-trained Random Forest (calibrated) → 0–100 risk score + level (Safe / Stable / Moderate / High). **SHAP** (TreeExplainer) gives top factors per student so faculty see *why* someone is at risk.  
- **Live UX** — Import **streams** progress as NDJSON; frontend shows a live progress bar and risk distribution. Result is stored in the browser (Zustand) for instant dashboard, and we **persist to the DB** so Engagement, Performance, Analytics, Reports, and Interventions all use **real API data**—no placeholder or mock data.  
- **Actions** — Case notes, schedule counseling, assign mentor, log email, escalate; interventions tracked on a Kanban board. All wired to backend APIs.

---

## 4. Demo Flow (2–3 min — what to show)

1. **Login** → Dashboard shows “Import CSV” / “Refine CSV” when no data is loaded.  
2. **Import CSV** → Pick file (e.g. raw `student_dataset_450.csv`) → progress bar + live risk distribution → done.  
3. **Dashboard** → KPIs (total students, at-risk count, avg attendance, avg risk), risk pie chart, department bar chart and table. “New Analysis” clears the session and returns to the import screen.  
4. **Students** → List from last import; search and filter by department/risk; open one **Student Detail** → risk gauge (0–100), metric cards, “Risk Factor Analysis” (SHAP-derived), action buttons (Add Note, Mark Reviewed, Escalate, Schedule Counseling, Email).  
5. **Engagement** → Metric cards, LMS heatmap, effort–output chart, high-risk list; data from DB (persisted after import). Or **Interventions** → Kanban board, “New Case” to create an intervention via API.  

**If no CSV imported:** Every data page shows “No Analysis Data — Import CSV” so we never show empty or fake data.

**Optional:** Show **Refine CSV** once: upload raw file → step-by-step pipeline → download refined CSV.

---

## 5. Tech (45 sec)

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind, Recharts, Zustand (session + auth), Axios with JWT interceptors. We force API base URL to `127.0.0.1` at runtime to avoid IPv6 issues with Docker on Windows.  
- **Backend:** FastAPI (Python 3.10), MySQL 8.0, SQLAlchemy 2.0+, JWT (python-jose), bcrypt. **ML:** scikit-learn (Random Forest), SHAP (TreeExplainer), Pandas/NumPy.  
- **Run:** `docker-compose up -d` (MySQL + backend); `cd frontend && npm run dev`. Backend: `http://127.0.0.1:8000` (docs at `/docs`), Frontend: `http://localhost:3000`. We have **108 backend tests** (pytest, in-memory SQLite).

---

## 6. ML in 4 bullets

- **Model:** Pre-trained Random Forest, wrapped with CalibratedClassifierCV → calibrated probability scaled to 0–100 risk score.  
- **Features:** 4 inputs — attendance_rate, lms_score (from engagement), avg_assignment_score (academic index × 10), avg_quiz_score (semester trend); built from the 11-column schema or raw mapping.  
- **Output:** Risk score (0–100) + level: Safe (0–40), Stable (41–55), Moderate (56–70), High (71–100).  
- **Explainability:** SHAP (TreeExplainer) → top contributing features per student, shown in Student Detail as “Risk Factor Analysis.”

---

## 7. Quick Q&A (if they ask)

| Question | Answer |
|----------|--------|
| Why Random Forest? | Captures non-linear patterns (e.g. good attendance but failing grades); trees handle that better than a simple linear model. |
| How do you explain risk? | SHAP attributes the prediction to each feature; we show the top factors per student in the UI. |
| Raw vs refined CSV? | Refined = 11 columns, import as-is. Raw = we map (e.g. CGPA→academic_index, MID→engagement) and reject if no student metrics (relevance check). |
| Session + persist? | Session (Zustand) = instant dashboard from browser. Persist = same data written to DB so Engagement, Performance, etc. use real APIs. |
| Who uses it? | Faculty only; student login removed. |
| What if the file is irrelevant? | We check for student-metric columns; if none, we return 422 and show “This file doesn’t match any student risk records. Try a different file.” |
| What if the backend is down? | Engagement page shows an amber banner with “Retry” and instructions; other pages show the NoDataGate “Import CSV” prompt or empty states. |
| How do interventions work? | Case notes, counseling, mentor, email, escalate all hit backend APIs and create/update Intervention records; the Kanban board lists them by status. |

---

## 8. Before you present

- [ ] Backend up: `curl http://127.0.0.1:8000/health`  
- [ ] Frontend up; can log in  
- [ ] One CSV ready (e.g. `backend/data/raw/student_dataset_450.csv`)  
- [ ] Order: Problem → Solution → Demo (Import → Dashboard → Students → Detail → Engagement or Interventions) → Tech + ML → Q&A  
- [ ] Optional: Know how to show Refine CSV (upload raw → pipeline → download) if they ask about client-side cleaning  

**Full technical detail** (APIs, schema, flows) is in the repo (README, document.md, summary.md) if the reviewer wants depth.
