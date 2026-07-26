# Presentation Outline

This is a 12-slide structure designed for Final Year Project presentations or Hackathons.

## Slide 1: Title Slide
- **Title**: EduRisk - AI-Powered Student Dropout Risk Prediction Platform
- **Subtitle**: Proactive Interventions through Machine Learning
- **Presenters**: [Your Name/Team]

## Slide 2: Problem Statement
- Universities struggle with student retention.
- Identifying at-risk students manually is too slow.
- Existing Learning Management Systems (LMS) lack predictive, actionable intelligence.

## Slide 3: Existing System vs. Proposed Solution
- **Existing**: Reactive, siloed data, generic advising.
- **Proposed (EduRisk)**: Proactive, integrated data, personalized AI-driven interventions.

## Slide 4: Project Objectives
1. Predict dropout risk using ML (Random Forest).
2. Provide Explainable AI (XAI) to help faculty understand *why*.
3. Deliver real-time dashboards using WebSockets.
4. Enable intervention tracking and analytics.

## Slide 5: System Architecture
- *Include the Mermaid diagram from `docs/ARCHITECTURE.md`*
- Highlight the flow from Frontend (React) -> Backend (FastAPI) -> DB (MySQL) + AI (Scikit-learn).

## Slide 6: Technology Stack
- **Frontend**: Next.js (React 19), Tailwind CSS, TypeScript
- **Backend**: FastAPI, Python 3.13, SQLAlchemy
- **Database**: MySQL 8.0
- **AI/ML**: Scikit-Learn (Random Forest), Pandas, SHAP
- **DevOps**: Docker, GitHub Actions, Nginx

## Slide 7: AI Prediction Workflow
- Explain Feature Engineering (combining attendance, CGPA, LMS activity).
- Mention why Random Forest was chosen (high accuracy, explainability).
- Mention SHAP for transparency.

## Slide 8: Student & Faculty Dashboards (Screenshots)
- Show a screenshot of the Student Dashboard (Risk Score & Recommendations).
- Show a screenshot of the Faculty Dashboard (At-Risk highlighting & Intervention logging).

## Slide 9: Dean Analytics Dashboard (Screenshot)
- Show university-wide metrics and report generation functionality.

## Slide 10: Security & DevOps
- Explain JWT-based Role-Based Access Control (RBAC).
- Mention Docker containerization and CI/CD pipelines ensuring production readiness.

## Slide 11: Future Scope
- Integration with major LMS platforms (Canvas, Blackboard).
- Upgrading to Deep Learning (LSTMs) for sequential time-series academic data.
- Mobile application for instant student push notifications.

## Slide 12: Conclusion & Q&A
- Summary statement: "EduRisk transforms retention from a reactive guessing game into a proactive science."
- Open the floor for questions.
