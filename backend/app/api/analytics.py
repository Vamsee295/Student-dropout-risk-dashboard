from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.auth.security import get_current_user
from app.auth.roles import require_dean
from app.services.analytics_service import analytics_service
from app.core.responses import create_success_response

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dean/kpis")
def get_dean_kpi_dashboard(db: Session = Depends(get_db), current_user = Depends(require_dean)):
    kpis = analytics_service.get_dean_kpis(db)
    return create_success_response("Dean KPIs retrieved", kpis)

@router.get("/dean/multi-trend")
def get_multi_trend(db: Session = Depends(get_db)):
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return [
        {
            "month": m,
            "dropout": round(15.5 - (i * 0.4), 1),
            "retention": round(84.5 + (i * 0.4), 1),
            "attendance": round(78.0 + (i * 0.9), 1),
            "placement": round(72.0 + (i * 0.8), 1),
        }
        for i, m in enumerate(months)
    ]

@router.get("/dean/yearly-graduation")
def get_yearly_graduation(db: Session = Depends(get_db)):
    return [
        {"year": "2019", "rate": 81.2},
        {"year": "2020", "rate": 83.5},
        {"year": "2021", "rate": 82.0},
        {"year": "2022", "rate": 86.4},
        {"year": "2023", "rate": 88.9},
        {"year": "2024", "rate": 91.5},
    ]

@router.get("/dean/research-growth")
def get_research_growth(db: Session = Depends(get_db)):
    return [
        {"year": "2019", "papers": 42, "grants": 12},
        {"year": "2020", "papers": 58, "grants": 16},
        {"year": "2021", "papers": 75, "grants": 22},
        {"year": "2022", "papers": 98, "grants": 28},
        {"year": "2023", "papers": 124, "grants": 35},
        {"year": "2024", "papers": 156, "grants": 45},
    ]

@router.get("/dean/leaderboards")
def get_leaderboards(db: Session = Depends(get_db)):
    return {
        "departments": [
            {"rank": 1, "name": "Computer Science & Engineering", "score": 94.5},
            {"rank": 2, "name": "Data Science & AI", "score": 91.2},
            {"rank": 3, "name": "Electronics & Communication", "score": 87.8},
            {"rank": 4, "name": "Mechanical Engineering", "score": 83.4},
            {"rank": 5, "name": "Civil Engineering", "score": 79.1},
        ],
        "placement": [
            {"name": "Computer Science & Engineering", "pct": 96.8},
            {"name": "Data Science & AI", "pct": 94.2},
            {"name": "Electronics & Communication", "pct": 89.5},
            {"name": "Information Technology", "pct": 88.1},
            {"name": "Electrical Engineering", "pct": 82.6},
        ]
    }
