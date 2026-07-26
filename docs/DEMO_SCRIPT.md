# Live Demo Script

**Target Duration:** 7–10 minutes
**Audience:** Judges, Interviewers, or University Administrators.

## Setup Before Demo
- Ensure Docker containers are running (`docker-compose up -d`).
- Have three browser tabs ready: Student, Faculty, and Dean logins.
- Ensure the database is seeded with sample data.

---

## 1. Introduction (1 min)
*"Welcome to the EduRisk Platform. Today, I'll demonstrate how our AI-powered system transforms raw university data into actionable insights to prevent student dropouts."*

## 2. Student Persona (2 mins)
1. **Action:** Log in as `student@university.edu`.
2. **Narration:** *"As a student, my dashboard provides a real-time overview of my academic standing. Note the 'Risk Score' component. Currently, I'm at 30% risk."*
3. **Action:** Show the Recommendations panel.
4. **Narration:** *"The system isn't just a dashboard; it advises the student on what to focus on based on their specific weaknesses."*

## 3. Faculty Persona & Real-Time Sync (3 mins)
1. **Action:** Switch to the Faculty tab (`faculty@university.edu`).
2. **Narration:** *"As a faculty advisor, I can see my entire cohort. The system automatically highlights students in the 'Critical Risk' tier (red)."*
3. **Action:** Click on an at-risk student.
4. **Narration:** *"When I open this student's profile, I see an Explainable AI (SHAP) breakdown. It tells me exactly WHY they are at risk—for instance, low attendance combined with missed assignments."*
5. **Action:** Click 'Log Intervention' and select 'Counseling Meeting'.
6. **Narration:** *"I can instantly log an intervention. This creates a traceable workflow to ensure the student gets help."*

## 4. Dean Persona (2 mins)
1. **Action:** Switch to the Dean tab (`dean@university.edu`).
2. **Narration:** *"At the executive level, the Dean needs macro-level insights. This dashboard aggregates data across all departments."*
3. **Action:** Click the 'Generate Report' button (PDF/Excel export).
4. **Narration:** *"With a single click, administrators can export accreditation-ready reports detailing retention metrics and intervention success rates."*

## 5. Conclusion (1 min)
*"In conclusion, EduRisk bridges the gap between predictive analytics and human intervention. By utilizing a React frontend, FastAPI backend, and Scikit-learn AI model, we've built a scalable, enterprise-ready platform. Thank you."*
