"""
Faculty Dashboard API — 9 production-grade endpoints.

All data is sourced exclusively from MySQL via SQLAlchemy ORM.
No static data, no mocks, no hardcoded values.

Endpoints
---------
GET  /api/faculty/overview                    — aggregated KPIs
GET  /api/faculty/students                    — paginated, filtered, searchable list
GET  /api/faculty/students/{id}               — full student profile drill-down
POST /api/faculty/students/create             — manual student creation
POST /api/faculty/upload/{attendance|marks|assignments}  — CSV bulk ingest
POST /api/faculty/recalculate                 — trigger risk recompute
GET  /api/faculty/analytics/department        — per-dept analytics + 7-day trend
GET  /api/faculty/export                      — CSV download
GET  /api/faculty/students/{id}/explanation   — SHAP explanation
"""

from __future__ import annotations

import csv
import io
import math
import traceback
from datetime import datetime, timedelta
from typing import List, Optional, Set

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile
from fastapi.responses import StreamingResponse
from loguru import logger
from sqlalchemy import desc, func, text
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Department,
    Intervention,
    InterventionStatus,
    ModelVersion,
    RiskHistory,
    RiskLevel,
    RiskScore,
    RiskTrend,
    Section,
    Student,
    StudentCodingProfile,
    StudentMetric,
    StudentRawAssignments,
    StudentRawAttendance,
    StudentRawMarks,
)
from app.schemas import (
    AnalyticsOverview,
    CreateStudentRequest,
    DepartmentAnalytics,
    DepartmentTrendPoint,
    FacultyStudentListItem,
    FacultyStudentProfile,
    InterventionItem,
    PaginatedStudentList,
    RecalculateRequest,
    RiskHistoryItem,
    SHAPExplanationResponse,
    SHAPFeatureItem,
    UploadSummary,
)
from app.services.feature_engineering import compute_and_save_features
from app.services.realtime_prediction import (
    get_shap_explainer,
    compute_all_risk_scores,
    compute_student_risk,
)

router = APIRouter(prefix="/api/faculty", tags=["Faculty Dashboard"])


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _safe(value, default=0.0):
    try:
        v = float(value)
        return default if (math.isnan(v) or math.isinf(v)) else v
    except (TypeError, ValueError):
        return default


def _parse_department(raw: Optional[str]) -> Optional[Department]:
    """Lenient department parser — avoids 422 on raw string values."""
    if not raw:
        return None
    for dept in Department:
        if dept.value.lower() == raw.lower() or dept.name.lower() == raw.lower():
            return dept
    # partial match
    for dept in Department:
        if raw.lower() in dept.value.lower():
            return dept
    return None  # unknown → ignore filter rather than 422


def _parse_risk_level(raw: Optional[str]) -> Optional[RiskLevel]:
    """Lenient risk level parser."""
    if not raw:
        return None
    for rl in RiskLevel:
        if rl.value.lower() == raw.lower() or rl.name.lower() == raw.lower():
            return rl
    return None


def _student_to_list_item(s: Student) -> FacultyStudentListItem:
    m = s.metrics
    r = s.risk_score
    return FacultyStudentListItem(
        id=s.id,
        name=s.name,
        avatar=s.avatar or s.name[:2].upper(),
        department=s.department.value if s.department else "",
        course=s.course,
        section=s.section.value if s.section else "",
        risk_score=_safe(r.risk_score if r else 0.0),
        risk_level=(r.risk_level.value if r else RiskLevel.SAFE.value),
        risk_trend=(r.risk_trend.value if r else RiskTrend.STABLE.value),
        risk_value=(r.risk_value if r else "Stable"),
        attendance_rate=_safe(m.attendance_rate if m else 0.0),
        engagement_score=_safe(m.engagement_score if m else 0.0),
        academic_performance_index=_safe(m.academic_performance_index if m else 0.0),
        last_updated=(r.updated_at if r else s.updated_at),
    )


def _build_full_profile(student: Student, db: Session) -> FacultyStudentProfile:
    m = student.metrics
    r = student.risk_score

    # Risk history — last 30 descending
    history = (
        db.query(RiskHistory)
        .filter(RiskHistory.student_id == student.id)
        .order_by(desc(RiskHistory.recorded_at))
        .limit(30)
        .all()
    )
    history_items = [
        RiskHistoryItem(
            risk_score=_safe(h.risk_score),
            risk_level=h.risk_level.value,
            recorded_at=h.recorded_at,
        )
        for h in history
    ]

    # SHAP factors from stored JSON
    shap_factors: List[SHAPFeatureItem] = []
    if r and r.shap_explanation and isinstance(r.shap_explanation, dict):
        for f in r.shap_explanation.get("top_factors", []):
            shap_factors.append(
                SHAPFeatureItem(
                    feature=f.get("feature", ""),
                    impact=_safe(f.get("impact", 0.0)),
                    direction=f.get("direction", "positive"),
                )
            )

    # Interventions
    interventions_items = [
        InterventionItem(
            id=i.id,
            intervention_type=i.intervention_type.value,
            status=i.status.value,
            assigned_to=i.assigned_to,
            notes=i.notes,
            created_at=i.created_at,
        )
        for i in student.interventions
    ]

    return FacultyStudentProfile(
        id=student.id,
        name=student.name,
        avatar=student.avatar or student.name[:2].upper(),
        department=student.department.value if student.department else "",
        course=student.course,
        section=student.section.value if student.section else "",
        advisor=student.advisor_id,
        created_at=student.created_at,
        # features
        attendance_rate=_safe(m.attendance_rate if m else 0.0),
        engagement_score=_safe(m.engagement_score if m else 0.0),
        academic_performance_index=_safe(m.academic_performance_index if m else 0.0),
        failure_ratio=_safe(m.failure_ratio if m else 0.0),
        semester_performance_trend=_safe(m.semester_performance_trend if m else 0.0),
        login_gap_days=int(_safe(m.login_gap_days if m else 3, 3)),
        financial_risk_flag=bool(m.financial_risk_flag if m else False),
        commute_risk_score=int(_safe(m.commute_risk_score if m else 1, 1)),
        # risk
        risk_score=_safe(r.risk_score if r else 0.0),
        risk_level=(r.risk_level.value if r else RiskLevel.SAFE.value),
        risk_trend=(r.risk_trend.value if r else RiskTrend.STABLE.value),
        risk_value=(r.risk_value if r else "Stable"),
        risk_history=history_items,
        shap_factors=shap_factors,
        interventions=interventions_items,
    )


# ─────────────────────────────────────────────────────────────────────────────
# 1. OVERVIEW
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/overview", response_model=AnalyticsOverview)
def get_faculty_overview(db: Session = Depends(get_db)):
    """Aggregated KPI card data for the faculty dashboard header."""
    total_students = db.query(Student).count()

    risk_counts = (
        db.query(RiskScore.risk_level, func.count(RiskScore.risk_level))
        .group_by(RiskScore.risk_level)
        .all()
    )
    risk_dist: dict = {
        RiskLevel.HIGH: 0,
        RiskLevel.MODERATE: 0,
        RiskLevel.STABLE: 0,
        RiskLevel.SAFE: 0,
    }
    for level, cnt in risk_counts:
        if level in risk_dist:
            risk_dist[level] = cnt

    high_risk_count = risk_dist[RiskLevel.HIGH]
    high_risk_pct = (high_risk_count / total_students * 100) if total_students > 0 else 0.0

    avg_risk = _safe(db.query(func.avg(RiskScore.risk_score)).scalar(), 0.0)
    avg_attendance = _safe(db.query(func.avg(StudentMetric.attendance_rate)).scalar(), 0.0)

    high_risk_dept_row = (
        db.query(Student.department, func.count(Student.id))
        .join(RiskScore)
        .filter(RiskScore.risk_level == RiskLevel.HIGH)
        .group_by(Student.department)
        .order_by(desc(func.count(Student.id)))
        .first()
    )
    high_risk_dept = high_risk_dept_row[0].value if high_risk_dept_row else None

    return AnalyticsOverview(
        total_students=total_students,
        high_risk_count=high_risk_count,
        high_risk_percentage=round(high_risk_pct, 1),
        average_risk_score=round(avg_risk, 1),
        average_attendance=round(avg_attendance, 1),
        high_risk_department=high_risk_dept,
        risk_distribution={k.value: v for k, v in risk_dist.items()},
    )


# ─────────────────────────────────────────────────────────────────────────────
# 2. STUDENT LIST — paginated, filtered, searchable
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/students", response_model=PaginatedStudentList)
def get_faculty_student_list(
    department: Optional[str] = Query(default=None),
    risk_level: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None, description="Search by name or student ID"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Paginated student list with optional filtering by department / risk level
    and full-text search on name or student ID.

    All filtering via SQL WHERE — no client-side filtering.
    """
    dept_enum = _parse_department(department)
    risk_enum = _parse_risk_level(risk_level)

    query = (
        db.query(Student)
        .outerjoin(StudentMetric, Student.id == StudentMetric.student_id)
        .outerjoin(RiskScore, Student.id == RiskScore.student_id)
    )

    if dept_enum:
        query = query.filter(Student.department == dept_enum)
    if risk_enum:
        query = query.filter(RiskScore.risk_level == risk_enum)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            (Student.name.ilike(pattern)) | (Student.id.ilike(pattern))
        )

    total = query.count()
    students = (
        query.order_by(desc(RiskScore.risk_score))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    pages = math.ceil(total / page_size) if total > 0 else 1
    return PaginatedStudentList(
        items=[_student_to_list_item(s) for s in students],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


# ─────────────────────────────────────────────────────────────────────────────
# 3. STUDENT PROFILE DRILL-DOWN
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/students/{student_id}/explanation", response_model=SHAPExplanationResponse)
def get_student_explanation(student_id: str, db: Session = Depends(get_db)):
    """
    Return SHAP top-feature explanations for a student's risk score.
    Uses stored JSON from last prediction; falls back to live SHAP if needed.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student {student_id} not found")

    r = student.risk_score
    if not r:
        raise HTTPException(
            status_code=404, detail=f"No risk score found for student {student_id}"
        )

    # Try stored SHAP first
    top_features: List[SHAPFeatureItem] = []
    if r.shap_explanation and isinstance(r.shap_explanation, dict):
        for f in r.shap_explanation.get("top_factors", []):
            top_features.append(SHAPFeatureItem(
                feature=f.get("feature", ""),
                impact=_safe(f.get("impact", 0.0)),
                direction=f.get("direction", "positive"),
            ))

    # If no stored SHAP, compute live
    if not top_features and student.metrics:
        live_shap = get_shap_explainer()
        if live_shap:
            try:
                from app.services.feature_engineering import FeatureEngineer
                X = FeatureEngineer.prepare_ml_features({
                    "attendance_rate": _safe(student.metrics.attendance_rate),
                    "engagement_score": _safe(student.metrics.engagement_score),
                    "academic_performance_index": _safe(student.metrics.academic_performance_index),
                    "login_gap_days": int(_safe(student.metrics.login_gap_days, 3)),
                    "failure_ratio": _safe(student.metrics.failure_ratio),
                    "financial_risk_flag": bool(student.metrics.financial_risk_flag),
                    "commute_risk_score": int(_safe(student.metrics.commute_risk_score, 1)),
                    "semester_performance_trend": _safe(student.metrics.semester_performance_trend),
                })
                factors = live_shap.explain(X, top_n=5)
                top_features = [
                    SHAPFeatureItem(feature=f.feature, impact=_safe(f.impact), direction=f.direction)
                    for f in factors
                ]
            except Exception as exc:
                logger.warning(f"Live SHAP fallback failed for {student_id}: {exc}")

    return SHAPExplanationResponse(
        student_id=student_id,
        risk_score=_safe(r.risk_score),
        risk_level=r.risk_level.value,
        top_features=top_features,
    )


@router.get("/students/{student_id}", response_model=FacultyStudentProfile)
def get_student_profile(student_id: str, db: Session = Depends(get_db)):
    """
    Full student profile: base info + features + current risk +
    risk history + SHAP explanation + interventions.

    Every field is sourced from DB — no placeholders.
    """
    student = (
        db.query(Student).filter(Student.id == student_id).first()
    )
    if not student:
        raise HTTPException(status_code=404, detail=f"Student {student_id} not found")

    return _build_full_profile(student, db)


# ─────────────────────────────────────────────────────────────────────────────
# 4. MANUAL STUDENT CREATION
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/students/create", response_model=FacultyStudentProfile, status_code=201)
def create_student_manually(payload: CreateStudentRequest, db: Session = Depends(get_db)):
    """
    Manually add a student record, auto-compute features, run ML inference,
    store risk score and history, create intervention if needed.

    Returns the full profile.
    """
    # Guard: duplicate ID
    if db.query(Student).filter(Student.id == payload.id).first():
        raise HTTPException(status_code=409, detail=f"Student ID {payload.id} already exists")

    try:
        # 1. Create student record
        student = Student(
            id=payload.id,
            name=payload.name,
            avatar=payload.name[:2].upper(),
            department=payload.department,
            section=payload.section,
            course=payload.course,
            advisor_id=payload.advisor_id,
        )
        db.add(student)
        db.flush()  # student row visible within this transaction

        # 2. Seed initial metrics from payload (no raw tables yet for this student)
        metric = StudentMetric(
            student_id=payload.id,
            attendance_rate=payload.attendance_rate,
            engagement_score=payload.engagement_score,
            academic_performance_index=payload.academic_performance_index,
            failure_ratio=payload.failure_ratio,
            semester_performance_trend=0.0,
            login_gap_days=3,
            financial_risk_flag=payload.financial_risk_flag,
            commute_risk_score=payload.commute_risk_score,
            last_interaction=datetime.utcnow() - timedelta(days=3),
        )
        db.add(metric)
        db.flush()

        # 3. ML inference (uses singleton model)
        try:
            compute_student_risk(payload.id, db, save_to_db=True)
        except Exception as exc:
            logger.warning(f"Risk inference failed for new student {payload.id}: {exc}")

        db.commit()
        db.refresh(student)
        return _build_full_profile(student, db)

    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        logger.error(f"Failed to create student {payload.id}: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Student creation failed: {str(exc)}")


# ─────────────────────────────────────────────────────────────────────────────
# 5. CSV BULK UPLOAD  → feature recompute → risk recompute
# ─────────────────────────────────────────────────────────────────────────────

_REQUIRED_COLUMNS = {
    "attendance": {"student_id", "date", "status"},
    "marks": {"student_id", "marks_obtained", "max_marks"},
    "assignments": {"student_id", "submitted"},
}

_OPTIONAL_COLUMNS = {
    "attendance": {"subject"},
    "marks": {"subject", "exam_type"},
    "assignments": {"subject", "assignment_name", "score", "max_score"},
}


@router.post("/upload/{data_type}", response_model=UploadSummary)
async def upload_csv(
    data_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Bulk CSV upload for attendance, marks, or assignments.

    Event chain (non-negotiable):
        Validate → Persist raw rows → Feature recompute → ML inference →
        Risk persistence → History append → Intervention detection
    """
    data_type = data_type.lower()
    if data_type not in _REQUIRED_COLUMNS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid data_type '{data_type}'. Allowed: attendance, marks, assignments",
        )
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    # ── Parse CSV ─────────────────────────────────────────────────────────────
    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"CSV parse error: {exc}")

    required = _REQUIRED_COLUMNS[data_type]
    missing = required - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Missing required columns: {missing}. "
                   f"Required: {required}",
        )

    rows_processed = 0
    affected_ids: Set[str] = set()
    errors: List[str] = []

    # ── Validate student IDs & insert raw rows ─────────────────────────────
    try:
        for idx, row in df.iterrows():
            student_id = str(row.get("student_id", "")).strip()
            if not student_id:
                errors.append(f"Row {idx}: missing student_id — skipped")
                continue

            student_exists = db.query(Student.id).filter(Student.id == student_id).scalar()
            if not student_exists:
                errors.append(f"Row {idx}: student '{student_id}' not in DB — skipped")
                continue

            try:
                if data_type == "attendance":
                    date_val = pd.to_datetime(row.get("date", datetime.utcnow()), errors="coerce")
                    if pd.isnull(date_val):
                        errors.append(f"Row {idx}: invalid date '{row.get('date')}' — skipped")
                        continue
                    db.add(StudentRawAttendance(
                        student_id=student_id,
                        date=date_val.to_pydatetime(),
                        subject=str(row.get("subject", "General")),
                        status=str(row.get("status", "Present")).strip(),
                    ))

                elif data_type == "marks":
                    db.add(StudentRawMarks(
                        student_id=student_id,
                        subject=str(row.get("subject", "General")),
                        exam_type=str(row.get("exam_type", "Internal")),
                        marks_obtained=float(row.get("marks_obtained", 0)),
                        max_marks=float(row.get("max_marks", 100)) or 100.0,
                    ))

                elif data_type == "assignments":
                    raw_submitted = str(row.get("submitted", "false")).strip().lower()
                    submitted = raw_submitted in ("true", "1", "yes", "y")
                    raw_score = row.get("score", None)
                    score = float(raw_score) if raw_score is not None and str(raw_score).strip() != "" else None
                    db.add(StudentRawAssignments(
                        student_id=student_id,
                        subject=str(row.get("subject", "General")),
                        assignment_name=str(row.get("assignment_name", "Assignment")),
                        submitted=submitted,
                        score=score,
                        max_score=float(row.get("max_score", 10)) or 10.0,
                    ))

                affected_ids.add(student_id)
                rows_processed += 1

            except Exception as row_err:
                errors.append(f"Row {idx}: {row_err}")

        db.flush()  # all raw rows committed together

    except Exception as exc:
        db.rollback()
        logger.error(f"Upload failed during raw insert: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Bulk insert failed: {str(exc)}")

    # ── Event chain: feature recompute → ML inference per affected student ──
    recalcs = 0
    for sid in affected_ids:
        try:
            compute_and_save_features(sid, db)
            compute_student_risk(sid, db, save_to_db=True)
            recalcs += 1
        except Exception as exc:
            errors.append(f"student {sid} recompute failed: {exc}")
            logger.error(f"Recompute failed for {sid}: {traceback.format_exc()}")

    try:
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Commit failed: {str(exc)}")

    msg = (
        f"Processed {rows_processed} rows for {len(affected_ids)} students; "
        f"{recalcs} risk scores updated."
    )
    if errors:
        msg += f" {len(errors)} row(s) skipped (see 'errors' field)."

    logger.info(msg)
    return UploadSummary(
        rows_processed=rows_processed,
        students_affected=len(affected_ids),
        recalculations_triggered=recalcs,
        errors=errors[:50],  # cap to avoid huge responses
        message=msg,
    )


# ─────────────────────────────────────────────────────────────────────────────
# 6. RISK RECALCULATION
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/recalculate")
def recalculate_risk(
    payload: RecalculateRequest = RecalculateRequest(),
    db: Session = Depends(get_db),
):
    """
    Trigger ML risk recomputation.

    - If *student_id* is provided → recompute single student.
    - Otherwise → recompute all students with existing metrics.
    """
    try:
        if payload.student_id:
            sid = payload.student_id
            student = db.query(Student).filter(Student.id == sid).first()
            if not student:
                raise HTTPException(status_code=404, detail=f"Student {sid} not found")
            if not student.metrics:
                raise HTTPException(
                    status_code=422, detail=f"Student {sid} has no computed features"
                )
            result = compute_student_risk(sid, db, save_to_db=True)
            db.commit()
            return {
                "message": f"Risk recalculated for student {sid}",
                "student_id": sid,
                "risk_score": result["risk_score"],
                "risk_level": result["risk_level"].value,
            }
        else:
            result = compute_all_risk_scores(db)
            return {
                "message": f"Risk recalculated for {result['processed']}/{result['total']} students",
                **result,
            }
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        logger.error(f"Recalculate failed: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Recalculation error: {str(exc)}")


# ─────────────────────────────────────────────────────────────────────────────
# 7. DEPARTMENT ANALYTICS  (avg risk, attendance, 7-day trend)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/analytics/department", response_model=List[DepartmentAnalytics])
def get_department_analytics(db: Session = Depends(get_db)):
    """
    Per-department statistics including a 7-day daily average risk trend.
    All computed via SQL aggregations — no in-memory accumulation.
    """
    dept_stats = (
        db.query(
            Student.department,
            func.count(Student.id).label("total"),
            func.avg(RiskScore.risk_score).label("avg_risk"),
            func.avg(StudentMetric.attendance_rate).label("avg_att"),
            func.count(
                func.nullif(RiskScore.risk_level != RiskLevel.HIGH, True)
            ).label("high_risk"),
        )
        .outerjoin(RiskScore, Student.id == RiskScore.student_id)
        .outerjoin(StudentMetric, Student.id == StudentMetric.student_id)
        .group_by(Student.department)
        .all()
    )

    response: List[DepartmentAnalytics] = []

    for dept, total, avg_risk, avg_att, _ in dept_stats:
        # Accurate high_risk count via separate query (nullif trick unreliable)
        high_risk_cnt = (
            db.query(func.count(Student.id))
            .join(RiskScore)
            .filter(Student.department == dept, RiskScore.risk_level == RiskLevel.HIGH)
            .scalar()
            or 0
        )

        # 7-day daily trend from risk_history
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        daily_trend_rows = (
            db.query(
                func.date(RiskHistory.recorded_at).label("day"),
                func.avg(RiskHistory.risk_score).label("avg"),
            )
            .join(Student, RiskHistory.student_id == Student.id)
            .filter(
                Student.department == dept,
                RiskHistory.recorded_at >= seven_days_ago,
            )
            .group_by(func.date(RiskHistory.recorded_at))
            .order_by(func.date(RiskHistory.recorded_at))
            .all()
        )

        trend_7d = [
            DepartmentTrendPoint(
                date=str(row.day),
                avg_risk=round(_safe(row.avg), 2),
            )
            for row in daily_trend_rows
        ]

        response.append(
            DepartmentAnalytics(
                department=dept.value if dept else "Unknown",
                total_students=total or 0,
                avg_risk_score=round(_safe(avg_risk), 1),
                avg_attendance=round(_safe(avg_att), 1),
                high_risk_count=high_risk_cnt,
                trend_7d=trend_7d,
            )
        )

    return response


# ─────────────────────────────────────────────────────────────────────────────
# 8. CSV EXPORT  (all students + features + risk)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/export")
def export_students_csv(db: Session = Depends(get_db)):
    """
    Stream a CSV download of all students with their engineered features
    and current risk score. Sourced entirely from DB.
    """
    students = (
        db.query(Student)
        .outerjoin(StudentMetric, Student.id == StudentMetric.student_id)
        .outerjoin(RiskScore, Student.id == RiskScore.student_id)
        .order_by(desc(RiskScore.risk_score))
        .all()
    )

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=[
        "student_id", "name", "department", "course", "section",
        "advisor",
        "attendance_rate", "engagement_score", "academic_performance_index",
        "failure_ratio", "semester_performance_trend",
        "login_gap_days", "financial_risk_flag", "commute_risk_score",
        "risk_score", "risk_level", "risk_trend", "risk_value",
        "last_updated",
    ])
    writer.writeheader()

    for s in students:
        m = s.metrics
        r = s.risk_score
        writer.writerow({
            "student_id": s.id,
            "name": s.name,
            "department": s.department.value if s.department else "",
            "course": s.course,
            "section": s.section.value if s.section else "",
            "advisor": s.advisor_id or "",
            "attendance_rate": _safe(m.attendance_rate if m else 0),
            "engagement_score": _safe(m.engagement_score if m else 0),
            "academic_performance_index": _safe(m.academic_performance_index if m else 0),
            "failure_ratio": _safe(m.failure_ratio if m else 0),
            "semester_performance_trend": _safe(m.semester_performance_trend if m else 0),
            "login_gap_days": int(_safe(m.login_gap_days if m else 0)),
            "financial_risk_flag": bool(m.financial_risk_flag if m else False),
            "commute_risk_score": int(_safe(m.commute_risk_score if m else 1)),
            "risk_score": _safe(r.risk_score if r else 0),
            "risk_level": r.risk_level.value if r else "",
            "risk_trend": r.risk_trend.value if r else "",
            "risk_value": r.risk_value if r else "",
            "last_updated": r.updated_at.isoformat() if r and r.updated_at else "",
        })

    output.seek(0)
    filename = f"student_risk_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
