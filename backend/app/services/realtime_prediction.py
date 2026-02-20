"""
Real-Time Risk Prediction Service.

Uses a module-level singleton (loaded once at startup).
Clamps scores 0–100, appends risk history only on meaningful change.
"""

from __future__ import annotations

import math
from datetime import datetime
from typing import Any, Dict, List, Optional

import pandas as pd
from loguru import logger
from sqlalchemy.orm import Session

from app.models import (
    Intervention,
    InterventionStatus,
    InterventionType,
    ModelVersion,
    RiskHistory,
    RiskLevel,
    RiskScore,
    RiskTrend,
    Student,
    StudentMetric,
)
from app.services.risk_model import RiskModel
from app.services.shap_explainer import SHAPExplainer

# ─────────────────────────────────────────────────────────────────────────────
# Module-level singletons (loaded once at startup via init_prediction_service)
# ─────────────────────────────────────────────────────────────────────────────
_risk_model: Optional[RiskModel] = None
_shap_explainer: Optional[SHAPExplainer] = None
_active_model_version_id: Optional[int] = None

SCORE_CHANGE_THRESHOLD = 0.5  # don't append history if delta is tiny


def init_prediction_service(
    risk_model: RiskModel,
    shap_explainer: SHAPExplainer,
    model_version_id: int,
) -> None:
    """Called once at application startup. Registers singletons."""
    global _risk_model, _shap_explainer, _active_model_version_id
    _risk_model = risk_model
    _shap_explainer = shap_explainer
    _active_model_version_id = model_version_id
    logger.info(f"Prediction service initialized — model_version_id={model_version_id}")


def get_shap_explainer() -> Optional[SHAPExplainer]:
    """Public accessor for the SHAP explainer singleton."""
    return _shap_explainer



def _require_model() -> RiskModel:
    if _risk_model is None:
        raise RuntimeError(
            "Prediction service not initialized. "
            "Call init_prediction_service() at startup."
        )
    if _active_model_version_id is None:
        raise RuntimeError(
            "No active model version ID. "
            "Ensure init_prediction_service() was called with a valid model_version_id."
        )
    return _risk_model


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        v = float(value)
        return default if (math.isnan(v) or math.isinf(v)) else v
    except (TypeError, ValueError):
        return default


def _clamp(value: float) -> float:
    return max(0.0, min(100.0, value))


# ─────────────────────────────────────────────────────────────────────────────
# Core prediction
# ─────────────────────────────────────────────────────────────────────────────

def _get_model_feature_names():
    """Return the feature names the loaded model expects."""
    if _risk_model and _risk_model.calibrated_model and hasattr(_risk_model.calibrated_model, 'feature_names_in_'):
        return list(_risk_model.calibrated_model.feature_names_in_)
    return None


def _metric_to_dataframe(metric: StudentMetric) -> pd.DataFrame:
    """Convert a StudentMetric row to a single-row DataFrame for inference.

    Dynamically maps DB columns to whatever features the trained model expects.
    """
    model_features = _get_model_feature_names()

    if model_features:
        feature_map = {
            "attendance_rate": _safe_float(metric.attendance_rate, 75.0),
            "lms_score": _safe_float(metric.engagement_score, 70.0),
            "avg_assignment_score": _safe_float(metric.academic_performance_index, 65.0) * 10,
            "avg_quiz_score": _safe_float(metric.semester_performance_trend, 50.0),
            "engagement_score": _safe_float(metric.engagement_score, 70.0),
            "academic_performance_index": _safe_float(metric.academic_performance_index, 65.0),
            "login_gap_days": int(_safe_float(metric.login_gap_days, 3)),
            "failure_ratio": _safe_float(metric.failure_ratio, 0.1),
            "financial_risk_flag": int(bool(metric.financial_risk_flag)),
            "commute_risk_score": int(_safe_float(metric.commute_risk_score, 1)),
            "semester_performance_trend": _safe_float(metric.semester_performance_trend, 0.0),
        }
        row = {f: feature_map.get(f, 0.0) for f in model_features}
        return pd.DataFrame([row])

    return pd.DataFrame([{
        "attendance_rate": _safe_float(metric.attendance_rate, 75.0),
        "engagement_score": _safe_float(metric.engagement_score, 70.0),
        "academic_performance_index": _safe_float(metric.academic_performance_index, 65.0),
        "login_gap_days": int(_safe_float(metric.login_gap_days, 3)),
        "failure_ratio": _safe_float(metric.failure_ratio, 0.1),
        "financial_risk_flag": int(bool(metric.financial_risk_flag)),
        "commute_risk_score": int(_safe_float(metric.commute_risk_score, 1)),
        "semester_performance_trend": _safe_float(metric.semester_performance_trend, 0.0),
    }])


def compute_student_risk(
    student_id: str,
    db: Session,
    save_to_db: bool = True,
) -> Dict[str, Any]:
    """
    Compute risk score for a single student using the loaded singleton model.

    Returns a dict with:
        student_id, risk_score (0-100), risk_level, risk_trend, risk_value,
        shap_explanation, model_version_id
    """
    model = _require_model()

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise ValueError(f"Student {student_id} not found")
    if not student.metrics:
        raise ValueError(f"Student {student_id} has no feature metrics")

    X = _metric_to_dataframe(student.metrics)

    # Inference
    prediction = model.predict_risk_score(X)
    risk_score = _clamp(_safe_float(prediction["risk_score"], 50.0))
    risk_level: RiskLevel = prediction["risk_level"]

    # Trend vs previous score
    prev_score: Optional[float] = None
    if student.risk_score:
        prev_score = _safe_float(student.risk_score.risk_score, None)

    risk_trend, risk_value = RiskModel.calculate_risk_trend(risk_score, prev_score)

    # SHAP explanation
    shap_factors: List[Any] = []
    if _shap_explainer:
        try:
            shap_factors = _shap_explainer.explain(X, top_n=5)
        except Exception as exc:
            logger.warning(f"SHAP explanation failed for {student_id}: {exc}")

    shap_explanation = {
        "top_factors": [
            {
                "feature": f.feature,
                "impact": round(_safe_float(f.impact), 4),
                "direction": f.direction,
            }
            for f in shap_factors
        ]
    }

    result: Dict[str, Any] = {
        "student_id": student_id,
        "risk_score": round(risk_score, 2),
        "risk_level": risk_level,
        "risk_trend": risk_trend,
        "risk_value": risk_value,
        "shap_explanation": shap_explanation,
        "model_version_id": _active_model_version_id,
        "advisor_id": student.advisor_id,
    }

    if save_to_db:
        _save_risk_result(result, prev_score, db)

    logger.info(f"Risk computed: {student_id} → {risk_score:.1f} ({risk_level.value})")
    return result


def _save_risk_result(
    result: Dict[str, Any],
    prev_score: Optional[float],
    db: Session,
) -> None:
    """Upsert RiskScore and conditionally append RiskHistory."""
    student_id = result["student_id"]

    # Upsert current risk score
    existing = db.query(RiskScore).filter(RiskScore.student_id == student_id).first()
    if existing:
        existing.risk_score = result["risk_score"]
        existing.risk_level = result["risk_level"]
        existing.risk_trend = result["risk_trend"]
        existing.risk_value = result["risk_value"]
        existing.shap_explanation = result["shap_explanation"]
        existing.model_version_id = result["model_version_id"]
        existing.predicted_at = datetime.utcnow()
        existing.updated_at = datetime.utcnow()
    else:
        db.add(RiskScore(
            student_id=student_id,
            risk_score=result["risk_score"],
            risk_level=result["risk_level"],
            risk_trend=result["risk_trend"],
            risk_value=result["risk_value"],
            shap_explanation=result["shap_explanation"],
            model_version_id=result["model_version_id"],
        ))

    # Append risk history only when score changed meaningfully
    score_changed = (
        prev_score is None
        or abs(result["risk_score"] - prev_score) >= SCORE_CHANGE_THRESHOLD
    )
    if score_changed:
        db.add(RiskHistory(
            student_id=student_id,
            risk_score=result["risk_score"],
            risk_level=result["risk_level"],
            model_version_id=result["model_version_id"],
        ))

    db.flush()

    # Auto-create intervention for high-risk students
    _trigger_intervention(student_id, result["risk_level"], result["risk_score"], result.get("advisor_id"), db)


def _trigger_intervention(
    student_id: str,
    risk_level: RiskLevel,
    risk_score: float,
    advisor_id: Optional[str],
    db: Session,
) -> None:
    """Auto-create a PENDING counseling intervention if student is HIGH risk."""
    if risk_level != RiskLevel.HIGH:
        return

    existing = db.query(Intervention).filter(
        Intervention.student_id == student_id,
        Intervention.status.in_([InterventionStatus.PENDING, InterventionStatus.IN_PROGRESS]),
    ).first()
    if existing:
        return

    db.add(Intervention(
        student_id=student_id,
        intervention_type=InterventionType.COUNSELING,
        status=InterventionStatus.PENDING,
        assigned_to=advisor_id or "Unassigned",
        notes=(
            f"Auto-alert: risk score reached {risk_score:.1f}% (High Risk). "
            "Immediate counseling recommended."
        ),
    ))
    logger.info(f"Auto-intervention created for high-risk student {student_id}")


# ─────────────────────────────────────────────────────────────────────────────
# Batch computation
# ─────────────────────────────────────────────────────────────────────────────

def compute_all_risk_scores(db: Session) -> Dict[str, Any]:
    """
    Compute risk for every student that has feature metrics.
    Skips students whose score hasn't changed meaningfully.
    """
    _require_model()  # fail early if not initialized
    students = db.query(Student).join(StudentMetric).all()
    total = len(students)
    if total == 0:
        logger.warning("No students with metrics found")
        return {"total": 0, "processed": 0, "risk_distribution": {}}

    processed = 0
    distribution = {
        RiskLevel.HIGH: 0,
        RiskLevel.MODERATE: 0,
        RiskLevel.STABLE: 0,
        RiskLevel.SAFE: 0,
    }

    for student in students:
        try:
            r = compute_student_risk(student.id, db, save_to_db=True)
            distribution[r["risk_level"]] += 1
            processed += 1
        except Exception as exc:
            logger.error(f"Failed risk computation for {student.id}: {exc}")

        if processed % 50 == 0:
            logger.info(f"Batch progress: {processed}/{total}")

    db.commit()
    logger.info(f"Batch complete: {processed}/{total} students processed")
    return {
        "total": total,
        "processed": processed,
        "risk_distribution": {k.value: v for k, v in distribution.items()},
    }


# ─────────────────────────────────────────────────────────────────────────────
# Legacy class wrapper (used by existing scripts / tests)
# ─────────────────────────────────────────────────────────────────────────────

class RealtimePredictionService:
    """Thin wrapper kept for backward compatibility with existing scripts."""

    def __init__(self, db: Session):
        self.db = db

    def compute_student_risk(self, student_id: str, save_to_db: bool = True) -> Dict[str, Any]:
        return compute_student_risk(student_id, self.db, save_to_db)

    def compute_all_risk_scores(self) -> Dict[str, Any]:
        return compute_all_risk_scores(self.db)
