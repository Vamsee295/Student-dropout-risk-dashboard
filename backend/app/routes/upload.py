"""
Upload routes for faculty to import CSV/Excel data.
Supports attendance, marks, and assignments ingestion.

After any successful upload the endpoint automatically re-runs feature
engineering for affected students so risk scores update without delay.
"""

from __future__ import annotations

import io
from datetime import datetime
from typing import List

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from loguru import logger
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Student,
    StudentRawAttendance,
    StudentRawAssignments,
    StudentRawMarks,
)
from app.services.feature_engineering import compute_and_save_features

router = APIRouter(prefix="/api/faculty/upload", tags=["Upload"])


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

ALLOWED_MIME = {
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/octet-stream",  # some browsers send this for .xlsx
}

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


def _read_file(file: UploadFile) -> pd.DataFrame:
    """Read a CSV or Excel upload into a DataFrame."""
    raw = file.file.read()
    if len(raw) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 20 MB).")

    filename = (file.filename or "").lower()

    try:
        if filename.endswith(".xlsx") or filename.endswith(".xls"):
            return pd.read_excel(io.BytesIO(raw))
        else:
            # Try UTF-8 first, fall back to latin-1
            try:
                return pd.read_csv(io.BytesIO(raw), encoding="utf-8")
            except UnicodeDecodeError:
                return pd.read_csv(io.BytesIO(raw), encoding="latin-1")
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Could not parse file: {exc}. Please upload a valid CSV or Excel file.",
        )


def _normalise_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Lowercase and strip column names."""
    df.columns = [str(c).strip().lower().replace(" ", "_") for c in df.columns]
    return df


def _validate_students(student_ids: List[str], db: Session) -> dict:
    """Return a set of known student IDs."""
    existing = db.query(Student.id).filter(Student.id.in_(student_ids)).all()
    return {row.id for row in existing}


def _recompute_features(student_ids: List[str], db: Session) -> None:
    """Re-run feature engineering for affected students."""
    for sid in student_ids:
        try:
            compute_and_save_features(sid, db)
        except Exception as exc:
            logger.warning(f"Feature re-compute skipped for {sid}: {exc}")
    db.commit()


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/attendance")
async def upload_attendance(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload attendance data.

    Required columns (case-insensitive):
        student_id | date | status
    Optional columns:
        subject / course_id
    """
    df = _normalise_columns(_read_file(file))

    required = {"student_id", "date", "status"}
    missing = required - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Missing required columns: {', '.join(missing)}. "
                f"Found: {', '.join(df.columns)}. "
                "Required: student_id, date, status"
            ),
        )

    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["date"])

    student_ids = df["student_id"].astype(str).unique().tolist()
    valid_ids = _validate_students(student_ids, db)

    inserted = 0
    skipped = 0
    for _, row in df.iterrows():
        sid = str(row["student_id"])
        if sid not in valid_ids:
            skipped += 1
            continue

        subject = str(row.get("subject") or row.get("course_id") or "General")
        status_val = str(row["status"]).strip().capitalize()
        if status_val not in ("Present", "Absent", "Late", "Excused", "P", "A"):
            status_val = "Present" if status_val.upper().startswith("P") else "Absent"

        db.add(StudentRawAttendance(
            student_id=sid,
            date=row["date"],
            subject=subject[:200],
            status=status_val[:20],
        ))
        inserted += 1

    db.commit()

    # Recompute features for affected students
    affected_ids = [s for s in student_ids if s in valid_ids]
    _recompute_features(affected_ids, db)

    logger.info(f"Attendance upload: {inserted} rows inserted, {skipped} skipped (unknown student).")
    return {
        "message": f"Attendance uploaded successfully. {inserted} records imported.",
        "inserted": inserted,
        "skipped_unknown_students": skipped,
    }


@router.post("/marks")
async def upload_marks(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload marks/grades data.

    Required columns (case-insensitive):
        student_id | marks_obtained | max_marks
    Optional columns:
        subject / course_id | exam_type
    """
    df = _normalise_columns(_read_file(file))

    required = {"student_id", "marks_obtained", "max_marks"}
    missing = required - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Missing required columns: {', '.join(missing)}. "
                f"Found: {', '.join(df.columns)}. "
                "Required: student_id, marks_obtained, max_marks"
            ),
        )

    student_ids = df["student_id"].astype(str).unique().tolist()
    valid_ids = _validate_students(student_ids, db)

    inserted = 0
    skipped = 0
    for _, row in df.iterrows():
        sid = str(row["student_id"])
        if sid not in valid_ids:
            skipped += 1
            continue

        try:
            obtained = float(row["marks_obtained"])
            maximum = float(row["max_marks"])
        except (ValueError, TypeError):
            continue

        if maximum <= 0:
            continue

        subject = str(row.get("subject") or row.get("course_id") or "General")
        exam_type = str(row.get("exam_type") or "Internal")

        db.add(StudentRawMarks(
            student_id=sid,
            subject=subject[:200],
            exam_type=exam_type[:100],
            marks_obtained=obtained,
            max_marks=maximum,
        ))
        inserted += 1

    db.commit()

    affected_ids = [s for s in student_ids if s in valid_ids]
    _recompute_features(affected_ids, db)

    logger.info(f"Marks upload: {inserted} rows inserted, {skipped} skipped.")
    return {
        "message": f"Marks uploaded successfully. {inserted} records imported.",
        "inserted": inserted,
        "skipped_unknown_students": skipped,
    }


@router.post("/assignments")
async def upload_assignments(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload assignment submission data.

    Required columns (case-insensitive):
        student_id | submitted
    Optional columns:
        subject / course_id | assignment_name / assignment_id | score | max_score
    """
    df = _normalise_columns(_read_file(file))

    required = {"student_id", "submitted"}
    missing = required - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Missing required columns: {', '.join(missing)}. "
                f"Found: {', '.join(df.columns)}. "
                "Required: student_id, submitted"
            ),
        )

    student_ids = df["student_id"].astype(str).unique().tolist()
    valid_ids = _validate_students(student_ids, db)

    inserted = 0
    skipped = 0
    for _, row in df.iterrows():
        sid = str(row["student_id"])
        if sid not in valid_ids:
            skipped += 1
            continue

        # Parse submitted column — accept True/False/1/0/Yes/No
        sub_raw = str(row["submitted"]).strip().lower()
        submitted = sub_raw in ("true", "1", "yes", "submitted", "y")

        subject = str(row.get("subject") or row.get("course_id") or "General")
        assignment_name = str(
            row.get("assignment_name") or row.get("assignment_id") or "Assignment"
        )

        score: float | None = None
        try:
            score = float(row.get("score")) if row.get("score") is not None else None
        except (ValueError, TypeError):
            score = None

        max_score = 10.0
        try:
            max_score = float(row.get("max_score") or 10.0)
        except (ValueError, TypeError):
            pass

        db.add(StudentRawAssignments(
            student_id=sid,
            subject=subject[:200],
            assignment_name=assignment_name[:300],
            submitted=submitted,
            score=score,
            max_score=max_score if max_score > 0 else 10.0,
        ))
        inserted += 1

    db.commit()

    affected_ids = [s for s in student_ids if s in valid_ids]
    _recompute_features(affected_ids, db)

    logger.info(f"Assignments upload: {inserted} rows inserted, {skipped} skipped.")
    return {
        "message": f"Assignments uploaded successfully. {inserted} records imported.",
        "inserted": inserted,
        "skipped_unknown_students": skipped,
    }
