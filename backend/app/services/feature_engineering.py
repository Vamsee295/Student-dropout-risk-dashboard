"""
Feature Engineering Service — DB-driven.

All features are computed from real DB tables (StudentRawAttendance,
StudentRawMarks, StudentRawAssignments). Results are upserted into
StudentMetric. No synthetic data, no NaN propagation.
"""

from __future__ import annotations

import math
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import pandas as pd
from loguru import logger
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import (
    Student,
    StudentMetric,
    StudentRawAttendance,
    StudentRawMarks,
    StudentRawAssignments,
)


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _safe(value: Any, default: float = 0.0) -> float:
    """Return float, replacing NaN / None / inf with *default*."""
    try:
        v = float(value)
        if math.isnan(v) or math.isinf(v):
            return default
        return v
    except (TypeError, ValueError):
        return default


def _clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))


# ─────────────────────────────────────────────────────────────────────────────
# DB-driven feature computation
# ─────────────────────────────────────────────────────────────────────────────

def compute_and_save_features(student_id: str, db: Session) -> StudentMetric:
    """
    Compute all features for *student_id* from raw DB tables and upsert
    into StudentMetric.  Returns the updated StudentMetric row.

    Feature definitions
    -------------------
    attendance_rate     : present_rows / total_rows × 100 from raw_attendance
    academic_performance_index : weighted avg (marks_obtained/max_marks) × 100
                                 from raw_marks
    engagement_score    : assignment submission rate × (avg score pct)
                          from raw_assignments
    failure_ratio       : rows where marks < 40 % / total mark rows
    semester_performance_trend : avg marks_pct in latest 50 % rows minus
                                 oldest 50 % rows (sign = trend direction)
    login_gap_days      : proxy derived from engagement_score
    financial_risk_flag : False by default (no financial table yet)
    commute_risk_score  : 1 by default (no commute table yet)
    """
    logger.info(f"Computing features for student {student_id}")

    # ── Attendance rate ──────────────────────────────────────────────────────
    total_att = db.query(func.count(StudentRawAttendance.id)).filter(
        StudentRawAttendance.student_id == student_id
    ).scalar() or 0

    present_att = db.query(func.count(StudentRawAttendance.id)).filter(
        StudentRawAttendance.student_id == student_id,
        StudentRawAttendance.status.in_(["Present", "present", "P", "PRESENT"]),
    ).scalar() or 0

    if total_att > 0:
        attendance_rate = _clamp((present_att / total_att) * 100)
    else:
        # Fall back to existing metric or neutral default
        existing = db.query(StudentMetric).filter(
            StudentMetric.student_id == student_id
        ).first()
        attendance_rate = _safe(existing.attendance_rate, 75.0) if existing else 75.0

    # ── Marks / Academic performance ────────────────────────────────────────
    marks_rows = db.query(
        StudentRawMarks.marks_obtained, StudentRawMarks.max_marks
    ).filter(StudentRawMarks.student_id == student_id).all()

    if marks_rows:
        pcts = [
            _safe(r.marks_obtained / r.max_marks * 100, 0.0)
            for r in marks_rows
            if _safe(r.max_marks, 1.0) > 0
        ]
        academic_performance_index = _safe(sum(pcts) / len(pcts) if pcts else 0.0)

        # failure_ratio: marks < 40 %
        failed = sum(1 for p in pcts if p < 40.0)
        failure_ratio = _safe(failed / len(pcts)) if pcts else 0.0

        # semester_performance_trend: recent half avg - old half avg
        if len(pcts) >= 2:
            mid = len(pcts) // 2
            old_avg = sum(pcts[:mid]) / mid
            new_avg = sum(pcts[mid:]) / (len(pcts) - mid)
            semester_performance_trend = _safe(new_avg - old_avg)
        else:
            semester_performance_trend = 0.0
    else:
        existing = db.query(StudentMetric).filter(
            StudentMetric.student_id == student_id
        ).first()
        if existing:
            academic_performance_index = _safe(existing.academic_performance_index, 65.0)
            failure_ratio = _safe(existing.failure_ratio, 0.1)
            semester_performance_trend = _safe(existing.semester_performance_trend, 0.0)
        else:
            academic_performance_index = 65.0
            failure_ratio = 0.1
            semester_performance_trend = 0.0

    # ── Engagement score ─────────────────────────────────────────────────────
    assign_rows = db.query(
        StudentRawAssignments.submitted,
        StudentRawAssignments.score,
        StudentRawAssignments.max_score,
    ).filter(StudentRawAssignments.student_id == student_id).all()

    if assign_rows:
        total_assign = len(assign_rows)
        submitted_count = sum(1 for r in assign_rows if r.submitted)
        submission_rate = submitted_count / total_assign if total_assign > 0 else 0.0

        scored = [
            _safe(r.score / r.max_score * 100, 0.0)
            for r in assign_rows
            if r.submitted and _safe(r.max_score, 1.0) > 0 and r.score is not None
        ]
        avg_score_pct = sum(scored) / len(scored) if scored else 0.0

        engagement_score = _clamp(submission_rate * 50 + avg_score_pct * 0.5)
    else:
        existing = db.query(StudentMetric).filter(
            StudentMetric.student_id == student_id
        ).first()
        engagement_score = _safe(existing.engagement_score, 70.0) if existing else 70.0

    # ── Login gap (proxy from engagement) ────────────────────────────────────
    if engagement_score > 70:
        login_gap_days = 1
    elif engagement_score > 50:
        login_gap_days = 3
    elif engagement_score > 30:
        login_gap_days = 7
    else:
        login_gap_days = 14

    # ── Preserve prior financial / commute flags ──────────────────────────────
    existing = db.query(StudentMetric).filter(
        StudentMetric.student_id == student_id
    ).first()
    financial_risk_flag: bool = existing.financial_risk_flag if existing else False
    commute_risk_score: int = existing.commute_risk_score if existing else 1
    last_interaction = datetime.utcnow() - timedelta(days=login_gap_days)

    # ── Upsert StudentMetric ─────────────────────────────────────────────────
    if existing:
        existing.attendance_rate = attendance_rate
        existing.academic_performance_index = academic_performance_index
        existing.engagement_score = engagement_score
        existing.failure_ratio = failure_ratio
        existing.semester_performance_trend = semester_performance_trend
        existing.login_gap_days = login_gap_days
        existing.financial_risk_flag = financial_risk_flag
        existing.commute_risk_score = commute_risk_score
        existing.last_interaction = last_interaction
        existing.updated_at = datetime.utcnow()
        metric = existing
    else:
        metric = StudentMetric(
            student_id=student_id,
            attendance_rate=attendance_rate,
            academic_performance_index=academic_performance_index,
            engagement_score=engagement_score,
            failure_ratio=failure_ratio,
            semester_performance_trend=semester_performance_trend,
            login_gap_days=login_gap_days,
            financial_risk_flag=financial_risk_flag,
            commute_risk_score=commute_risk_score,
            last_interaction=last_interaction,
        )
        db.add(metric)

    db.flush()  # make row visible in the same transaction
    logger.info(
        f"  Features saved: attendance={attendance_rate:.1f}%, "
        f"api={academic_performance_index:.1f}, engagement={engagement_score:.1f}"
    )
    return metric


# ─────────────────────────────────────────────────────────────────────────────
# Legacy helper kept for backward compat (used by train scripts)
# ─────────────────────────────────────────────────────────────────────────────

class FeatureEngineer:
    """Static helpers for Kaggle-dataset based feature derivation (training)."""

    # Deterministic feature order used by the XGBoost model
    FEATURE_COLUMNS: List[str] = [
        "attendance_rate",
        "engagement_score",
        "academic_performance_index",
        "login_gap_days",
        "failure_ratio",
        "financial_risk_flag",
        "commute_risk_score",
        "semester_performance_trend",
    ]

    @staticmethod
    def engineer_features(raw_data: Dict[str, Any]) -> Dict[str, Any]:
        features: Dict[str, Any] = {}

        enrolled = _safe(raw_data.get("Curricular_units_1st_sem_enrolled", 0)) + \
                   _safe(raw_data.get("Curricular_units_2nd_sem_enrolled", 0))
        approved = _safe(raw_data.get("Curricular_units_1st_sem_approved", 0)) + \
                   _safe(raw_data.get("Curricular_units_2nd_sem_approved", 0))
        features["attendance_rate"] = _clamp((approved / enrolled * 100) if enrolled > 0 else 50.0)

        eval_1 = _safe(raw_data.get("Curricular_units_1st_sem_evaluations", 0))
        eval_2 = _safe(raw_data.get("Curricular_units_2nd_sem_evaluations", 0))
        g1 = _safe(raw_data.get("Curricular_units_1st_sem_grade", 0))
        g2 = _safe(raw_data.get("Curricular_units_2nd_sem_grade", 0))
        features["engagement_score"] = _clamp(min(100, (eval_1 + eval_2) * 5) * 0.4 + min(100, (g1 + g2) / 40 * 100) * 0.6)
        features["academic_performance_index"] = _safe(g1 * 0.3 + g2 * 0.7)

        if features["engagement_score"] > 70:
            features["login_gap_days"] = 1
        elif features["engagement_score"] > 50:
            features["login_gap_days"] = 3
        elif features["engagement_score"] > 30:
            features["login_gap_days"] = 7
        else:
            features["login_gap_days"] = 14

        failed = _safe(raw_data.get("Curricular_units_1st_sem_without_evaluations", 0)) + \
                 _safe(raw_data.get("Curricular_units_2nd_sem_without_evaluations", 0))
        features["failure_ratio"] = _safe(failed / enrolled) if enrolled > 0 else 0.0

        features["financial_risk_flag"] = bool(
            raw_data.get("Tuition_fees_up_to_date", 1) == 0 or raw_data.get("Debtor", 0) == 1
        )

        if raw_data.get("International", 0) == 1:
            features["commute_risk_score"] = 4
        elif raw_data.get("Displaced", 0) == 1:
            features["commute_risk_score"] = 3
        else:
            features["commute_risk_score"] = 2 if _safe(raw_data.get("Admission_grade", 100)) < 100 else 1

        features["semester_performance_trend"] = _safe((g2 - g1) / g1) if g1 > 0 else 0.0

        return features

    @staticmethod
    def prepare_ml_features(features: Dict[str, Any]) -> pd.DataFrame:
        row = {col: [features.get(col, 0)] for col in FeatureEngineer.FEATURE_COLUMNS}
        row["financial_risk_flag"] = [int(row["financial_risk_flag"][0])]
        return pd.DataFrame(row)

    @staticmethod
    def extract_raw_features_from_dataset(row: pd.Series) -> Dict[str, Any]:
        return {
            "Curricular_units_1st_sem_enrolled": row.get("Curricular units 1st sem (enrolled)", 0),
            "Curricular_units_1st_sem_approved": row.get("Curricular units 1st sem (approved)", 0),
            "Curricular_units_1st_sem_grade": row.get("Curricular units 1st sem (grade)", 0),
            "Curricular_units_1st_sem_evaluations": row.get("Curricular units 1st sem (evaluations)", 0),
            "Curricular_units_1st_sem_without_evaluations": row.get("Curricular units 1st sem (without evaluations)", 0),
            "Curricular_units_2nd_sem_enrolled": row.get("Curricular units 2nd sem (enrolled)", 0),
            "Curricular_units_2nd_sem_approved": row.get("Curricular units 2nd sem (approved)", 0),
            "Curricular_units_2nd_sem_grade": row.get("Curricular units 2nd sem (grade)", 0),
            "Curricular_units_2nd_sem_evaluations": row.get("Curricular units 2nd sem (evaluations)", 0),
            "Curricular_units_2nd_sem_without_evaluations": row.get("Curricular units 2nd sem (without evaluations)", 0),
            "Tuition_fees_up_to_date": row.get("Tuition fees up to date", 1),
            "Scholarship_holder": row.get("Scholarship holder", 0),
            "Debtor": row.get("Debtor", 0),
            "Displaced": row.get("Displaced", 0),
            "International": row.get("International", 0),
            "Age_at_enrollment": row.get("Age at enrollment", 20),
            "Admission_grade": row.get("Admission grade", 100),
        }

    @staticmethod
    def engineer_target(target_value: str) -> int:
        return {"Dropout": 1, "Graduate": 0, "Enrolled": 0}.get(target_value, 0)

    @staticmethod
    def compute_last_interaction(engagement_score: float) -> datetime:
        if engagement_score > 70:
            days_ago = 1
        elif engagement_score > 50:
            days_ago = 3
        elif engagement_score > 30:
            days_ago = 7
        else:
            days_ago = 14
        return datetime.utcnow() - timedelta(days=days_ago)
