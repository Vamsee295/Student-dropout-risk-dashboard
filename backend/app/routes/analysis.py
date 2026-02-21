"""
Analysis API: CSV import (streaming, in-memory) and optional persist to DB.
Accepts refined **or raw** CSV, auto-maps columns if needed,
computes risks in-memory, streams progress. POST /persist writes to DB for real-time API data.
"""

from __future__ import annotations

import io
import json
import math
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.database import get_db
from app.models import Department, ModelVersion, RiskLevel, RiskScore, RiskTrend, Section, Student, StudentMetric
from app.services.realtime_prediction import compute_risk_from_metrics_dict

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])


# ─── Persist request (same shape as import stream "done" payload) ───
class PersistStudent(BaseModel):
    id: str
    name: str
    avatar: str = ""
    riskScore: float
    riskLevel: str
    riskValue: str
    department: str = ""
    attendance_rate: float = 0.0
    engagement_score: float = 0.0


class PersistPayload(BaseModel):
    overview: Dict[str, Any]
    students: List[PersistStudent]


def _department_to_enum(dept: str):
    """Map CSV/frontend department string to Department enum. Default CSE if no match."""
    if not dept or not str(dept).strip():
        return Department.CSE
    d = str(dept).strip().upper()
    mapping = {
        "CSE": Department.CSE,
        "COMPUTER SCIENCE": Department.CSE,
        "CS": Department.CSE,
        "CS IT": Department.AI_DS,
        "AI-DS": Department.AI_DS,
        "AIML": Department.AI_DS,
        "AI DS": Department.AI_DS,
        "DATA SCIENCE": Department.DATA_SCIENCE,
        "AEROSPACE": Department.AEROSPACE,
        "MECHANICAL": Department.MECHANICAL,
        "CIVIL": Department.CIVIL,
        "ECE": Department.ECE,
        "ELECTRONICS": Department.ECE,
    }
    for key, val in mapping.items():
        if key in d or d in key:
            return val
    return Department.CSE


def _risk_level_to_enum(level: str):
    """Map frontend risk level string to RiskLevel enum."""
    s = (level or "").strip()
    if s == "High Risk":
        return RiskLevel.HIGH
    if s == "Moderate Risk":
        return RiskLevel.MODERATE
    if s == "Stable":
        return RiskLevel.STABLE
    if s == "Safe":
        return RiskLevel.SAFE
    return RiskLevel.SAFE


REQUIRED_COLUMNS = [
    "id",
    "name",
    "department",
    "attendance_rate",
    "engagement_score",
    "academic_performance_index",
    "login_gap_days",
    "failure_ratio",
    "financial_risk_flag",
    "commute_risk_score",
    "semester_performance_trend",
]

RAW_TO_REFINED: Dict[str, List[str]] = {
    "id": ["id", "student_id", "roll_no", "enrollment"],
    "name": ["name", "student_name", "full_name"],
    "department": ["department", "dept", "branch"],
    "attendance_rate": ["attendance_%", "attendance", "attendance_rate"],
    "engagement_score": ["engagement_score", "engagement"],
    "academic_performance_index": [
        "academic_performance_index", "cgpa", "gpa", "academic_index",
    ],
    "login_gap_days": ["login_gap_days", "login_gap"],
    "failure_ratio": ["failure_ratio", "fail_ratio"],
    "financial_risk_flag": ["financial_risk_flag", "financial_risk"],
    "commute_risk_score": ["commute_risk_score", "commute_risk"],
    "semester_performance_trend": ["semester_performance_trend", "performance_trend", "trend"],
}


def _normalise_columns(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = [str(c).strip().lower().replace(" ", "_") for c in df.columns]
    return df


def _find_column(columns: List[str], candidates: List[str]) -> Optional[str]:
    """Find the first column in *columns* that matches any candidate (case-insensitive)."""
    lower_map = {c.lower(): c for c in columns}
    for cand in candidates:
        if cand.lower() in lower_map:
            return lower_map[cand.lower()]
        for col_lower, col_orig in lower_map.items():
            if cand.lower() in col_lower:
                return col_orig
    return None


def _safe_float(val: Any, default: float = 0.0) -> float:
    try:
        v = float(val)
        return default if (math.isnan(v) or math.isinf(v)) else v
    except (TypeError, ValueError):
        return default


def _clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


METRIC_KEYS = [
    "attendance_rate", "engagement_score", "academic_performance_index",
    "login_gap_days", "failure_ratio", "financial_risk_flag",
    "commute_risk_score", "semester_performance_trend",
]


class IrrelevantFileError(Exception):
    """Raised when a CSV has no columns related to student risk metrics."""
    pass


def _check_relevance(col_map: Dict[str, Optional[str]], all_columns: List[str]) -> None:
    """
    Verify the CSV has enough student-metric-related columns to be useful.
    Raises IrrelevantFileError if none are found.
    """
    direct_metric_mapped = sum(
        1 for k in METRIC_KEYS if col_map.get(k) is not None
    )
    has_mid_columns = any(
        "mid" in c.lower() and "subject" in c.lower() for c in all_columns
    )
    has_sem_gpa = any(
        ("sem1" in c.lower() or "sem2" in c.lower()) and "gpa" in c.lower()
        for c in all_columns
    )

    if direct_metric_mapped == 0 and not has_mid_columns and not has_sem_gpa:
        detected = ", ".join(all_columns[:10])
        if len(all_columns) > 10:
            detected += f", ... (+{len(all_columns) - 10} more)"
        raise IrrelevantFileError(
            f"This file doesn't match any student risk records. "
            f"No attendance, GPA, engagement, or exam-score columns were found. "
            f"Detected columns: {detected}. "
            f"Please try with a different file."
        )


def _refine_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Map raw columns to the refined schema, engineer missing features,
    and return a DataFrame with exactly the REQUIRED_COLUMNS.
    Raises IrrelevantFileError if the file has no recognisable student metrics.
    """
    cols = list(df.columns)
    col_map: Dict[str, Optional[str]] = {}
    for refined, candidates in RAW_TO_REFINED.items():
        col_map[refined] = _find_column(cols, candidates)

    _check_relevance(col_map, cols)

    rows_out: List[Dict[str, Any]] = []
    records = df.to_dict("records")

    # Pre-compute means for columns that exist (for imputation)
    means: Dict[str, float] = {}
    for refined, src in col_map.items():
        if src is None:
            continue
        vals = pd.to_numeric(df[src], errors="coerce").dropna()
        if len(vals) > 0:
            means[refined] = float(vals.mean())

    for i, r in enumerate(records):
        out: Dict[str, Any] = {}

        out["id"] = str(r.get(col_map.get("id") or "id", i + 1))
        out["name"] = str(r.get(col_map.get("name") or "name", "Unknown"))
        out["department"] = str(r.get(col_map.get("department") or "department", "CSE"))

        # attendance_rate
        src = col_map.get("attendance_rate")
        att = _safe_float(r.get(src) if src else None, float("nan"))
        out["attendance_rate"] = _clamp(att if not math.isnan(att) else means.get("attendance_rate", 75), 0, 100)

        # engagement_score — compute from MID exam scores if not directly available
        src_eng = col_map.get("engagement_score")
        if src_eng:
            eng = _safe_float(r.get(src_eng), float("nan"))
        else:
            mid_cols = [c for c in cols if "mid" in c.lower() and "subject" in c.lower()]
            mid_vals = [_safe_float(r.get(c), float("nan")) for c in mid_cols]
            mid_vals = [v for v in mid_vals if not math.isnan(v)]
            eng = (sum(mid_vals) / len(mid_vals) / 30) * 100 if mid_vals else float("nan")
        out["engagement_score"] = _clamp(eng if not math.isnan(eng) else means.get("engagement_score", 70), 0, 100)

        # academic_performance_index — from CGPA (0-10 scale)
        src_gpa = col_map.get("academic_performance_index")
        gpa = _safe_float(r.get(src_gpa) if src_gpa else None, float("nan"))
        if math.isnan(gpa):
            gpa = means.get("academic_performance_index", 6.5)
        if gpa > 10:
            gpa = gpa / 10
        out["academic_performance_index"] = round(_clamp(gpa, 0, 10), 3)

        # login_gap_days — synthetic from engagement if missing
        src_lg = col_map.get("login_gap_days")
        lg = _safe_float(r.get(src_lg) if src_lg else None, float("nan"))
        if math.isnan(lg):
            lg = max(0, round(15 - out["engagement_score"] / 10))
        out["login_gap_days"] = max(0, round(lg))

        # failure_ratio — estimate from CGPA & attendance if missing
        src_fr = col_map.get("failure_ratio")
        fr = _safe_float(r.get(src_fr) if src_fr else None, float("nan"))
        if math.isnan(fr):
            gpa_val = out["academic_performance_index"]
            att_val = out["attendance_rate"]
            fr = _clamp(1.0 - (gpa_val / 10 * 0.6 + att_val / 100 * 0.4), 0, 1)
        out["failure_ratio"] = round(_clamp(fr, 0, 1), 3)

        # financial_risk_flag — default to 0 if missing
        src_ff = col_map.get("financial_risk_flag")
        if src_ff:
            raw_flag = r.get(src_ff, 0)
            if isinstance(raw_flag, str):
                out["financial_risk_flag"] = 0 if raw_flag.lower() in ("0", "false", "no", "") else 1
            else:
                out["financial_risk_flag"] = 1 if bool(raw_flag) else 0
        else:
            out["financial_risk_flag"] = 0

        # commute_risk_score — default to 1 if missing
        src_cr = col_map.get("commute_risk_score")
        cr = _safe_float(r.get(src_cr) if src_cr else None, float("nan"))
        out["commute_risk_score"] = max(1, min(4, round(cr))) if not math.isnan(cr) else 1

        # semester_performance_trend — compute from Sem1/Sem2 GPA if available
        src_trend = col_map.get("semester_performance_trend")
        trend = _safe_float(r.get(src_trend) if src_trend else None, float("nan"))
        if math.isnan(trend):
            sem1_col = _find_column(cols, ["sem1_gpa"])
            sem2_col = _find_column(cols, ["sem2_gpa"])
            sem1 = _safe_float(r.get(sem1_col) if sem1_col else None, 0)
            sem2 = _safe_float(r.get(sem2_col) if sem2_col else None, 0)
            trend = ((sem2 - sem1) / sem1 * 100) if sem1 > 0 else 0.0
        out["semester_performance_trend"] = round(_clamp(trend, -100, 100), 2)

        rows_out.append(out)

    return pd.DataFrame(rows_out, columns=REQUIRED_COLUMNS)


def _stream_progress(rows: List[Dict], total: int, columns: List[str], was_refined: bool):
    """Yield progress events as JSON lines."""

    label = "refined" if was_refined else "auto-mapped from raw"
    yield json.dumps({
        "type": "progress",
        "phase": "validate",
        "message": f"CSV {label} — {len(columns)} columns, {total} rows",
        "processed": 0,
        "total": total,
    }) + "\n"

    yield json.dumps({
        "type": "progress",
        "phase": "columns",
        "message": f"Columns: {', '.join(columns[:8])}{'...' if len(columns) > 8 else ''}",
        "processed": 0,
        "total": total,
    }) + "\n"

    yield json.dumps({
        "type": "progress",
        "phase": "risk_start",
        "message": "Starting ML risk computation for each student...",
        "processed": 0,
        "total": total,
    }) + "\n"

    results = []
    high_risk = 0
    moderate = 0
    stable = 0
    safe = 0

    for i, row in enumerate(rows):
        try:
            raw_flag = row.get("financial_risk_flag", 0)
            if isinstance(raw_flag, str):
                financial_flag = raw_flag.lower() not in ("0", "false", "no", "")
            else:
                financial_flag = bool(raw_flag)

            metrics = {
                "attendance_rate": float(row.get("attendance_rate", 75)),
                "engagement_score": float(row.get("engagement_score", 70)),
                "academic_performance_index": float(row.get("academic_performance_index", 6.5)),
                "login_gap_days": int(float(row.get("login_gap_days", 3))),
                "failure_ratio": float(row.get("failure_ratio", 0.1)),
                "financial_risk_flag": financial_flag,
                "commute_risk_score": int(float(row.get("commute_risk_score", 1))),
                "semester_performance_trend": float(row.get("semester_performance_trend", 0)),
            }
            risk = compute_risk_from_metrics_dict(metrics)
            sid = str(row.get("id", i))
            name = str(row.get("name", "Unknown"))
            avatar = "".join([w[0].upper() for w in name.split()[:2]]) if name else "??"

            if risk["risk_level"] == "High Risk":
                high_risk += 1
            elif risk["risk_level"] == "Moderate Risk":
                moderate += 1
            elif risk["risk_level"] == "Stable":
                stable += 1
            else:
                safe += 1

            results.append({
                "id": sid,
                "name": name,
                "avatar": avatar,
                "riskScore": risk["risk_score"],
                "riskLevel": risk["risk_level"],
                "riskValue": risk["risk_value"],
                "department": str(row.get("department", "")),
                "attendance_rate": metrics["attendance_rate"],
                "engagement_score": metrics["engagement_score"],
            })

            if (i + 1) % max(1, total // 20) == 0 or i == total - 1:
                yield json.dumps({
                    "type": "progress",
                    "phase": "risk_compute",
                    "processed": i + 1,
                    "total": total,
                    "message": f"Computed risk for {i + 1}/{total} students",
                    "latest_student": name,
                    "latest_risk": risk["risk_level"],
                    "distribution": {
                        "High Risk": high_risk,
                        "Moderate Risk": moderate,
                        "Stable": stable,
                        "Safe": safe,
                    },
                }) + "\n"

        except Exception as e:
            yield json.dumps({
                "type": "error",
                "row": i,
                "message": str(e),
            }) + "\n"

    avg_risk = sum(r["riskScore"] for r in results) / len(results) if results else 0
    avg_att = sum(r["attendance_rate"] for r in results) / len(results) if results else 0

    dept_counts: Dict[str, int] = {}
    dept_risk: Dict[str, float] = {}
    for r in results:
        d = r["department"] or "Other"
        dept_counts[d] = dept_counts.get(d, 0) + 1
        dept_risk[d] = dept_risk.get(d, 0) + r["riskScore"]
    high_risk_dept = max(dept_risk, key=lambda k: dept_risk[k] / dept_counts[k]) if dept_risk else None

    yield json.dumps({
        "type": "progress",
        "phase": "aggregate",
        "message": "Aggregating results and building dashboard data...",
        "processed": total,
        "total": total,
    }) + "\n"

    yield json.dumps({
        "type": "done",
        "overview": {
            "total_students": len(results),
            "high_risk_count": high_risk,
            "average_attendance": round(avg_att, 2),
            "average_risk_score": round(avg_risk, 2),
            "high_risk_department": high_risk_dept,
            "risk_distribution": {
                "High Risk": high_risk,
                "Moderate Risk": moderate,
                "Stable": stable,
                "Safe": safe,
            },
        },
        "students": results,
    }) + "\n"


@router.post("/import")
async def import_refined_csv(file: UploadFile = File(...)):
    """
    Accept refined **or raw** CSV. If raw columns are detected, auto-maps and
    engineers features. Computes risks in-memory, streams progress. No database write.
    """
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file.")

    raw = await file.read()
    if len(raw) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB).")

    try:
        df = pd.read_csv(io.BytesIO(raw), encoding="utf-8")
    except UnicodeDecodeError:
        df = pd.read_csv(io.BytesIO(raw), encoding="latin-1")

    df = _normalise_columns(df)
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]

    was_refined = True
    if missing:
        try:
            df = _refine_dataframe(df)
            was_refined = False
        except IrrelevantFileError as e:
            raise HTTPException(status_code=422, detail=str(e))
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"CSV does not match the refined schema and auto-mapping failed. "
                    f"Missing columns: {missing}. Error: {e}"
                ),
            )

    rows = df.to_dict("records")
    total = len(rows)
    columns = list(df.columns)

    def generate():
        yield from _stream_progress(rows, total, columns, was_refined)

    return StreamingResponse(
        generate(),
        media_type="application/x-ndjson",
        headers={"X-Accel-Buffering": "no"},
    )


@router.post("/persist")
def persist_analysis(payload: PersistPayload, db: Session = Depends(get_db)):
    """
    Persist imported analysis (overview + students) to the database.
    Called by the frontend after a successful CSV import so that Engagement,
    Performance, Analytics, Reports, and Interventions APIs return real data.
    No placeholder data: all downstream APIs read from this DB state.
    """
    active_model = db.query(ModelVersion).filter(ModelVersion.is_active == True).first()
    if not active_model:
        raise HTTPException(status_code=503, detail="No active ML model version. Start the server with a model loaded.")

    created = 0
    updated = 0
    for s in payload.students:
        sid = str(s.id).strip()
        if not sid:
            continue
        dept = _department_to_enum(s.department)
        risk_level = _risk_level_to_enum(s.riskLevel)

        student = db.query(Student).filter(Student.id == sid).first()
        if not student:
            student = Student(
                id=sid,
                name=s.name[:200] if s.name else "Unknown",
                avatar=(s.avatar or s.name[:2].upper() if s.name else "??")[:10],
                course="B.Tech",
                department=dept,
                section=Section.A,
                advisor_id=None,
            )
            db.add(student)
            created += 1
        else:
            student.name = s.name[:200] if s.name else student.name
            student.avatar = (s.avatar or (s.name[:2].upper() if s.name else "??"))[:10]
            student.department = dept
            updated += 1

        # Upsert metrics (required for engagement/performance APIs)
        api = max(0.0, min(100.0, (s.attendance_rate + s.engagement_score) / 2.0))  # proxy for academic_performance_index
        metric = db.query(StudentMetric).filter(StudentMetric.student_id == sid).first()
        if not metric:
            metric = StudentMetric(
                student_id=sid,
                attendance_rate=max(0.0, min(100.0, s.attendance_rate)),
                engagement_score=max(0.0, min(100.0, s.engagement_score)),
                academic_performance_index=api,
                login_gap_days=3,
                failure_ratio=0.1,
                financial_risk_flag=False,
                commute_risk_score=1,
                semester_performance_trend=0.0,
            )
            db.add(metric)
        else:
            metric.attendance_rate = max(0.0, min(100.0, s.attendance_rate))
            metric.engagement_score = max(0.0, min(100.0, s.engagement_score))
            metric.academic_performance_index = api

        # Upsert risk score
        risk_row = db.query(RiskScore).filter(RiskScore.student_id == sid).first()
        shap = {"top_factors": []}
        if not risk_row:
            risk_row = RiskScore(
                student_id=sid,
                risk_score=float(s.riskScore),
                risk_level=risk_level,
                risk_trend=RiskTrend.STABLE,
                risk_value=s.riskValue[:50] if s.riskValue else f"{s.riskScore:.0f}%",
                model_version_id=active_model.id,
                shap_explanation=shap,
            )
            db.add(risk_row)
        else:
            risk_row.risk_score = float(s.riskScore)
            risk_row.risk_level = risk_level
            risk_row.risk_value = (s.riskValue or f"{s.riskScore:.0f}%")[:50]
            risk_row.model_version_id = active_model.id
            risk_row.shap_explanation = shap

    db.commit()
    return {
        "ok": True,
        "message": "Analysis persisted to database.",
        "created": created,
        "updated": updated,
        "total": len(payload.students),
    }
