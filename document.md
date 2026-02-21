# Project Completion & Review Preparation Document

## 1. Project Overview
This document breaks down the end-to-end architecture, technical decisions, machine learning methodologies, and data processing pipelines of the **Student Dropout Risk Dashboard**. Use this guide to understand **what** we built, **why** we chose specific tools, and **how** it works under the hood so that anyone on the team can explain it confidently to a reviewer.

---

## 2. Technology Stack & Rationale

We adopted a modern, full-stack architecture separated into a frontend client and a backend API.

### Frontend
- **Next.js 16 (App Router) & React 19:** 
  - *Why:* Next.js gives us a robust routing system, fast page loads through server-side rendering (SSR), and seamless API integration. React 19 ensures the UI is highly reactive. 
- **Zustand 5.x:**
  - *Why:* We needed a lightweight state management tool compared to Redux. Zustand stores the session-based CSV data locally in the browser immediately so the dashboard can render instantly without waiting for a database round-trip.
- **Tailwind CSS 4.x & Recharts:**
  - *Why:* Tailwind allows us to rapidly build a beautiful, responsive UI without leaving the HTML. Recharts was selected to draw dynamic visual analytics (Risk distributions, GPA trends).

### Backend
- **FastAPI (Python 3.10):**
  - *Why:* FastAPI is incredibly fast and native to asynchronous programming. More importantly, since our machine learning stack (scikit-learn, pandas) is Python-based, using a Python web framework allows seamless integration between APIs and the ML model without needing microservices.
- **SQLAlchemy 2.0+ & MySQL 8.0:**
  - *Why:* We needed a robust relational database to handle structured student data, metrics, and risk histories securely. SQLAlchemy acts as our Object-Relational Mapper (ORM), protecting against SQL injection and simplifying queries.
- **JWT (python-jose):**
  - *Why:* Used for secure, stateless authentication for faculty members.

---

## 3. Machine Learning: Prediction Algorithm

To accurately predict the likelihood of a student dropping out, we implemented an ML pipeline using **scikit-learn**.

### The Algorithm: Gradient Boosting / Random Forest
We load a pre-trained **tree-based ensemble model** (`RandomForestClassifier` / `GradientBoostingClassifier`). 
- **Why Tree-based?** Decision trees effectively capture non-linear relationships in student behavior (e.g., a student might have good attendance but failing grades, which strictly linear models might fail to interpret correctly).

### Model Features (Input Data)
The model specifically consumes **4 engineered features**:
1. `attendance_rate` (0 - 100%)
2. `lms_score` (Derived from LMS Engagement)
3. `avg_assignment_score` (Academic Index multiplied by 10)
4. `avg_quiz_score` (Semester Performance Trend)

### How predictions are calculated (Code Snippet)
When a student's metrics are sent to the model, it generates a dropout probability. We calibrate this probability using `CalibratedClassifierCV` to get a direct 0-100 risk score.

```python
# From backend/app/services/risk_model.py
def predict_risk_score(self, X: pd.DataFrame) -> Dict[str, Any]:
    # Get probabilities from our Calibrated Model
    _, probabilities = self.predict(X)
    
    # Extract the probability for class 1 (Dropout)
    dropout_prob = probabilities[0][1]
    
    # Scale to 0-100 to get the Risk Score
    risk_score = float(dropout_prob * 100)
    
    # Determine the Risk Level Category
    risk_level = self._get_risk_level(risk_score)
    # returns RiskLevel.SAFE (0-40), STABLE (41-55), MODERATE (56-70), or HIGH (71-100)
    
    return {
        'risk_score': round(risk_score, 2),
        'risk_level': risk_level
    }
```

### SHAP Explainability (Why did the model predict this?)
The reviewer will ask: *"How do you know why a student is high risk?"*
We use **SHAP (SHapley Additive exPlanations)** via `TreeExplainer`. SHAP mathematically breaks down a prediction to show exactly how much each feature contributed to the final score. If a student gets an 80% risk score, SHAP tells us whether it was driven more by low attendance or poor grades.

---

## 4. Data Refinement & Upload Process

Handling messy, real-world CSV data gracefully is a standout feature of our project.

### The Pipeline
1. **Raw vs. Refined:** We allow users to upload either a strictly formatted 'Refined CSV' (with 11 specific columns) or a 'Raw CSV' (like `student_dataset_450.csv`).
2. **Client-side Refinement:**
   If the user uploads a Raw CSV, our frontend algorithm (`refineCsv.ts`) intercepts it.

#### How we clean the data (Code Snippet & Explanation)
- **Column Mapping:** We dynamically map raw headers like `"Att%"` or `Attendance_Rate` to our schema.
- **Imputation (Filling blanks):** We compute the mean (average) of the column and fill empty fields so the model doesn't crash on `NaN` data.
- **Outlier Capping (IQR Method):** We mathematically cap insane values to prevent model skew.

If a raw dataset has MID exam marks instead of a direct "Engagement Score", we auto-calculate it:
```typescript
// From frontend/src/utils/refineCsv.ts
function calcEngagement(r: Record<string, string>): number {
  const mid1 = parseNum(r["MID1_Subject1"]);
  const mid2 = parseNum(r["MID1_Subject2"]);
  const mid3 = parseNum(r["MID1_Subject3"]);
  
  const vals = [mid1, mid2, mid3].filter((n) => !isNaN(n));
  if (vals.length === 0) return NaN;
  
  // Averages the exams and scales to 100
  return (vals.reduce((a, b) => a + b, 0) / vals.length / 30) * 100; 
}
```

### Real-Time Streaming during Import
When importing, calculating predictions for 500+ students could take seconds. Instead of a hanging loading spinner, FastAPI streams **NDJSON (Newline Delimited JSON)** chunks back to the frontend. This shows a live, animated progress bar as each row is processed.

---

## 5. Summary to provide the Reviewer

When explaining the system, follow this narrative:
1. **The Problem:** Institutions lack a proactive way to stop students from dropping out before it's too late. Data is often messy and siloed.
2. **The Solution:** We built a tool that takes any standard student CSV, cleans it automatically, and pushes it through a calibrated Machine Learning model.
3. **The Results:** Faculty instantly get a dashboard showing exact risk percentages and *why* they are at risk (SHAP explainability) without writing any code or manipulating excel files manually. 
4. **The Tech:** It's lightning-fast thanks to Next.js on the frontend and FastAPI on the backend, with session-state hydration ensuring minimal database lag during analysis.

--- 
**End of Document**
