# Software Requirements Specification (SRS)
**Project Name:** EduRisk - Student Dropout Risk Dashboard

## 1. Introduction
### 1.1 Purpose
This document specifies the software requirements for the EduRisk Platform, an AI-powered educational analytics dashboard that uses machine learning to identify students at risk of dropping out and provides actionable interventions.

### 1.2 Scope
The software is an end-to-end full-stack web application encompassing a React/Next.js frontend, FastAPI backend, MySQL database, and Scikit-learn Random Forest model. It targets three user groups: Students, Faculty, and Deans.

### 1.3 Definitions and Acronyms
- **RBAC**: Role-Based Access Control
- **XAI**: Explainable AI (via SHAP)
- **JWT**: JSON Web Token
- **LMS**: Learning Management System

## 2. Overall Description
### 2.1 Project Overview
EduRisk consolidates student data (academic, attendance, LMS engagement) to provide real-time dashboards and generate risk scores using Machine Learning.

### 2.2 User Types
1. **Student**: Can view personal analytics, attendance, and AI-recommended actions.
2. **Faculty**: Can manage assigned students, record attendance, review risk levels, and log interventions.
3. **Dean**: Has a bird's-eye view of university-wide metrics, department trends, and aggregated risk data.

### 2.3 Assumptions
- Users have modern web browsers.
- The university provides historic data for model training.

## 3. Functional Requirements
### 3.1 Authentication & RBAC
- **REQ-1**: The system must authenticate users using JWT.
- **REQ-2**: The system must redirect users to their respective dashboards based on role (Student, Faculty, Dean).

### 3.2 Student Dashboard
- **REQ-3**: Must display current attendance, CGPA, and personal risk score.
- **REQ-4**: Must provide AI-generated recommendations to improve performance.

### 3.3 Faculty Dashboard
- **REQ-5**: Must list students under the faculty's purview.
- **REQ-6**: Must flag "at-risk" students (Risk > 70%).
- **REQ-7**: Must allow faculty to log interventions (e.g., counseling, warnings) for specific students.

### 3.4 Dean Dashboard
- **REQ-8**: Must display university-wide KPIs (total students, critical risk counts).
- **REQ-9**: Must allow export of reports (PDF/Excel) for accreditation.

### 3.5 AI/ML Engine
- **REQ-10**: The model must calculate a risk score (0-100) based on student features.
- **REQ-11**: The system must provide SHAP explanations (why is the risk high?).

## 4. Non-Functional Requirements
### 4.1 Performance
- API endpoints must respond in < 200ms on average.
- ML predictions must be calculated in < 500ms per batch.

### 4.2 Security
- Passwords must be hashed using bcrypt.
- APIs must be protected against brute force (Rate Limiting).
- All traffic must be encrypted (HTTPS/WSS).

### 4.3 Scalability
- The stateless backend must scale horizontally via Docker Swarm / Kubernetes.

### 4.4 Maintainability
- Code must follow PEP8 (Backend) and ESLint (Frontend) standards.
