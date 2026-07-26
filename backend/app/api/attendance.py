from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.session import get_db
from app.auth.security import get_current_user
from app.models.user import User
from app.models.enums import Role, AttendanceStatus
from app.models.records import AttendanceRecord
from app.models.student import Student, StudentMetric

router = APIRouter()


@router.get("/weekly")
def get_weekly_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return attendance percentage per day for the last 7 days."""
    if current_user.role not in [Role.FACULTY, Role.DEAN]:
        raise HTTPException(status_code=403, detail="Not authorized")

    result = []
    today = datetime.utcnow().date()
    day_labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        total = db.query(func.count(AttendanceRecord.id)).filter(
            func.date(AttendanceRecord.date) == target_date
        ).scalar() or 0

        present = db.query(func.count(AttendanceRecord.id)).filter(
            func.date(AttendanceRecord.date) == target_date,
            AttendanceRecord.status == AttendanceStatus.PRESENT
        ).scalar() or 0

        pct = round((present / total * 100), 1) if total > 0 else 0
        result.append({
            "day": day_labels[target_date.weekday()],
            "date": target_date.isoformat(),
            "attendance": pct,
            "present": present,
            "total": total,
        })

    return result


@router.get("/below-threshold")
def get_below_threshold(
    threshold: float = 75.0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return students whose attendance_rate is below the threshold."""
    results = db.query(Student, StudentMetric).join(StudentMetric).filter(
        StudentMetric.attendance_rate < threshold
    ).limit(50).all()

    return [
        {
            "id": str(student.id),
            "name": student.name,
            "department": student.department.value,
            "attendance": round(metric.attendance_rate, 1),
        }
        for student, metric in results
    ]


@router.get("/grid")
def get_attendance_grid(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return a grid of recent students with their last 5 days of attendance."""
    today = datetime.utcnow().date()
    days = [(today - timedelta(days=i)) for i in range(4, -1, -1)]
    day_labels = ["mon", "tue", "wed", "thu", "fri"]

    students = db.query(Student).limit(30).all()
    grid = []
    for student in students:
        row = {"id": student.id, "name": student.name, "roll": student.id}
        for label, day in zip(day_labels, days):
            record = db.query(AttendanceRecord).filter(
                AttendanceRecord.student_id == student.id,
                func.date(AttendanceRecord.date) == day
            ).first()
            if record:
                row[label] = record.status.value[0]  # P, A, L, E
            else:
                row[label] = "P"
        grid.append(row)
    return grid
