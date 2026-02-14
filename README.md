# 🎓 Student Dropout Risk Dashboard

A comprehensive, real-time analytics platform designed to identify, monitor, and intervene with students at risk of academic dropout. This project leverages machine learning to predict dropout probability based on attendance, engagement, and academic performance metrics.

## 🚀 Features

### for Administrators & Advisors
- **Real-Time Dashboard**: Monitor institutional health, average risk scores, and total at-risk student counts.
- **Predictive Analytics**: ML-powered risk scoring (Safe, Low, Moderate, High) for every student.
- **Intervention Management**: Create, assign, and track intervention strategies (Academic Support, Counseling, Financial Aid).
- **Automated Alerts**: System flags students crossing risk thresholds for immediate attention.
- **Engagement Tracking**: Visualize student activity via LMS login heatmaps and effort vs. output charts.

### for Faculty
- **Student Directory**: Search, filter, and sort students by risk level, department, or attendance.
- **Performance Insights**: Detailed breakdown of student performance across assignments, quizzes, and projects.
- **Communication Tools**: Assign advisors and schedule counseling sessions directly from the dashboard.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (React 19)
- **Styling**: Tailwind CSS
- **Components**: Lucide React (Icons), Recharts (Data Visualization)
- **State Management**: React Hooks

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: SQLite (Development) / PostgreSQL (Production ready)
- **ORM**: SQLAlchemy
- **ML Libraries**: Scikit-learn, XGBoost, Pandas, NumPy

## 📂 Project Structure

```
├── backend/
│   ├── app/                # Main application logic
│   │   ├── routes/         # API endpoints (students, interventions, analytics)
│   │   ├── models.py       # Database models
│   │   ├── schemas.py      # Pydantic schemas
│   │   └── database.py     # DB connection
│   ├── ml_models/          # Trained prediction models (.joblib)
│   ├── scripts/            # Utility scripts (data seeding, model training)
│   └── requirements.txt    # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js pages and routing
│   │   ├── components/     # Reusable UI components
│   │   └── lib/            # Utilities and helper functions
│   └── package.json        # Frontend dependencies
```

## ⚡ Getting Started

### 🚀 New to this project?

For **complete setup instructions** including database setup and troubleshooting:
- 📖 **[SETUP.md](./SETUP.md)** - Detailed setup guide for first-time setup
- ⚡ **[QUICK_START.md](./QUICK_START.md)** - Quick reference for running the app

### Quick Overview

1. **Prerequisites**: Node.js (v18+), Python (3.9+), MySQL (8.0+)
2. **Backend**: Create virtual environment → Install dependencies → Start server
3. **Frontend**: Install dependencies → Start dev server
4. **Database**: Create MySQL database → Initialize tables → Load sample data

**Backend runs on**: `http://localhost:8000` (API docs at `/docs`)  
**Frontend runs on**: `http://localhost:3000`

## 🤖 Machine Learning Pipeline

The project uses a Random Forest / XGBoost classifier trained on historical student data.
- **Features Used**: Attendance Rate, Assignment Scores, Login Frequency, Interaction History.
- **Training**: Run `python scripts/train_model.py` to retrain the model with new data.
- **Inference**: The API provides real-time risk scoring via the `/api/predict` endpoint.