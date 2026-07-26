from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.students import router as students_router
from app.api.student_dashboard import router as student_dashboard_router
from app.api.dean_dashboard import router as dean_dashboard_router
from app.api.risk import router as risk_router
from app.api.ws import router as ws_router
from app.api.notifications import router as notifications_router
from app.api.interventions import router as interventions_router
from app.api.analytics import router as analytics_router
from app.api.reports import router as reports_router
from app.api.mlops import router as mlops_router
from app.api.system import router as system_router
from app.api.faculty import router as faculty_router
from app.api.attendance import router as attendance_router
from app.api.grades import router as grades_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(students_router)
api_router.include_router(student_dashboard_router)
api_router.include_router(dean_dashboard_router)
api_router.include_router(risk_router)
api_router.include_router(ws_router)
api_router.include_router(notifications_router)
api_router.include_router(interventions_router)
api_router.include_router(analytics_router)
api_router.include_router(reports_router)
api_router.include_router(mlops_router, prefix="/model", tags=["MLOps"])
api_router.include_router(system_router)

api_router.include_router(faculty_router, prefix="/faculty", tags=["Faculty"])
api_router.include_router(attendance_router, prefix="/attendance", tags=["Attendance"])
api_router.include_router(grades_router, prefix="/grades", tags=["Grades"])
