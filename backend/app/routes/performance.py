"""
Performance analytics API routes — v2.
Provides KPIs, GPA trends, course deep-dive, risk scoring,
early-warning alerts, and AI insight summaries.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any, Optional
import math

from app.database import get_db
from app.models import (
    Student, StudentMetric, Department, RiskScore, RiskLevel,
    StudentRawMarks, StudentRawAttendance, StudentRawAssignments, Intervention
)
from app.utils.performance_utils import (
    calculate_performance_risk_score,
    compute_rolling_average,
    detect_sharp_drops,
    compute_gpa_trend_direction,
    generate_early_warnings,
    generate_ai_insight,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

DEPT_MAPPING = {
    "CSE":          Department.CSE,
    "CS IT":        Department.AI_DS,
    "AEROSPACE":    Department.AEROSPACE,
    "AI-DS":        Department.AI_DS,
    "AIML":         Department.AI_DS,
    "DATA SCIENCE": Department.DATA_SCIENCE,
    "ECE":          Department.ECE,
    "MECHANICAL":   Department.MECHANICAL,
    "CIVIL":        Department.CIVIL,
}


def _filter_students(db: Session, department: Optional[str] = None) -> List[Student]:
    query = db.query(Student).join(StudentMetric)
    if department and department != "All Departments" and department in DEPT_MAPPING:
        query = query.filter(Student.department == DEPT_MAPPING[department])
    return query.all()


def _gpa_from_index(api: float) -> float:
    """Convert 0-100 academic_performance_index to a 4.0 GPA scale."""
    return round(min(4.0, api / 25.0), 2)


def _pat_level(score: int) -> str:
    if score >= 400: return "Level 3"
    if score >= 250: return "Level 2"
    if score >= 100: return "Level 1"
    return "Level 0"


# ---------------------------------------------------------------------------
# 1. KPI Overview
# ---------------------------------------------------------------------------

@router.get("/kpis")
def get_performance_kpis(department: str = None, db: Session = Depends(get_db)):
    """
    At-a-glance academic KPIs for the performance page overview.
    Returns GPA stats, pass rate, failed subjects, assignment rate, credits.
    """
    students = _filter_students(db, department)
    if not students:
        return _empty_kpis()

    total = len(students)
    gpas = [_gpa_from_index(s.metrics.academic_performance_index) for s in students]
    avg_gpa = round(sum(gpas) / total, 2)

    # Course pass rate — derive from failure_ratio
    avg_failure_ratio = sum(s.metrics.failure_ratio for s in students) / total
    pass_rate = round((1 - avg_failure_ratio) * 100, 1)

    # Failed subjects — use failure_ratio * 8 courses as proxy
    avg_failed_subjects = round(avg_failure_ratio * 8, 1)

    # Assignment completion — derive from engagement_score
    avg_engagement = sum(s.metrics.engagement_score for s in students) / total
    assignment_rate = round(min(100, avg_engagement * 0.9 + 10), 1)

    # Credits: assume 8 credits per course, 8 courses, 4 semesters = 256 total
    # Earned based on pass rate
    credits_required = 160
    credits_earned = round(credits_required * (pass_rate / 100), 0)

    avg_trend = sum(s.metrics.semester_performance_trend for s in students) / total
    prev_gpa = round(max(0, avg_gpa - (avg_trend / 100 * 0.3)), 2)
    gpa_trend = "improving" if avg_trend > 2 else ("declining" if avg_trend < -2 else "stable")

    # Risk distribution
    high_risk = sum(1 for s in students if s.risk_score and s.risk_score.risk_level == RiskLevel.HIGH)
    moderate_risk = sum(1 for s in students if s.risk_score and s.risk_score.risk_level == RiskLevel.MODERATE)

    return {
        "total_students": total,
        "avg_gpa": avg_gpa,
        "prev_gpa": prev_gpa,
        "gpa_trend": gpa_trend,
        "course_pass_rate": pass_rate,
        "avg_failed_subjects": avg_failed_subjects,
        "assignment_submission_rate": assignment_rate,
        "credits_earned": int(credits_earned),
        "credits_required": credits_required,
        "high_risk_count": high_risk,
        "moderate_risk_count": moderate_risk,
    }


def _empty_kpis():
    return {
        "total_students": 0,
        "avg_gpa": 0,
        "prev_gpa": 0,
        "gpa_trend": "stable",
        "course_pass_rate": 0,
        "avg_failed_subjects": 0,
        "assignment_submission_rate": 0,
        "credits_earned": 0,
        "credits_required": 160,
        "high_risk_count": 0,
        "moderate_risk_count": 0,
    }


# ---------------------------------------------------------------------------
# 2. GPA / Performance Trend Over Time
# ---------------------------------------------------------------------------

@router.get("/trends")
def get_performance_trends(department: str = None, db: Session = Depends(get_db)):
    """
    Returns term-wise GPA data, 3-term rolling average, and drop annotations.
    Data is derived from academic_performance_index and semester_performance_trend.
    """
    students = _filter_students(db, department)
    if not students:
        return {"terms": [], "gpa_series": [], "rolling_avg": [], "drops": []}

    avg_api = sum(s.metrics.academic_performance_index for s in students) / len(students)
    avg_trend = sum(s.metrics.semester_performance_trend for s in students) / len(students)
    base_gpa = _gpa_from_index(avg_api)

    labels = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6"]
    step = avg_trend / 100 * 0.3
    gpa_series = []
    for i in range(6):
        val = round(min(4.0, max(0.0, base_gpa - step * (5 - i))), 2)
        gpa_series.append(val)

    rolling = compute_rolling_average(gpa_series, window=3)
    drops = detect_sharp_drops(gpa_series, threshold=0.5)
    trend_direction = compute_gpa_trend_direction(gpa_series)

    subjects = ["Mathematics", "Physics", "DS & Algorithms", "DBMS", "Networks", "OS", "English"]
    offsets = [-8, -4, 5, 3, -2, 7, -6]
    subject_grades = []
    for idx, subj in enumerate(subjects):
        grade = round(min(100, max(20, avg_api + offsets[idx])), 1)
        subj_pass = grade >= 50
        subject_grades.append({
            "subject": subj,
            "grade": grade,
            "passed": subj_pass,
            "peer_avg": round(avg_api, 1),
        })

    return {
        "terms": labels,
        "gpa_series": gpa_series,
        "rolling_avg": rolling,
        "drops": drops,
        "trend_direction": trend_direction,
        "subject_grades": subject_grades,
    }


# ---------------------------------------------------------------------------
# 3. Performance Risk Scoring (aggregate)
# ---------------------------------------------------------------------------

@router.get("/risk-scores")
def get_performance_risk_scores(department: str = None, db: Session = Depends(get_db)):
    """
    Returns the aggregate Performance Risk Score for the filtered cohort
    plus a distribution breakdown (Low / Medium / High counts).
    """
    students = _filter_students(db, department)
    if not students:
        return {"aggregate_risk": None, "distribution": {}}

    total = len(students)
    low_count = med_count = high_count = 0
    scores = []

    for s in students:
        m = s.metrics
        api = m.academic_performance_index
        gpa_decline = max(0.0, (100 - api) / 100)
        failed_ratio = m.failure_ratio
        attendance = m.attendance_rate
        assignment = min(100, m.engagement_score * 0.9 + 10)

        result = calculate_performance_risk_score(gpa_decline, failed_ratio, attendance, assignment)
        scores.append(result["score"])
        if result["category"] == "Low":   low_count += 1
        elif result["category"] == "Medium": med_count += 1
        else: high_count += 1

    avg_score = round(sum(scores) / total, 1)

    if avg_score >= 60:   agg_category = "High"
    elif avg_score >= 35: agg_category = "Medium"
    else:                 agg_category = "Low"

    return {
        "aggregate_risk_score": avg_score,
        "aggregate_category": agg_category,
        "distribution": {
            "Low":    {"count": low_count,  "pct": round(low_count / total * 100, 1)},
            "Medium": {"count": med_count,  "pct": round(med_count / total * 100, 1)},
            "High":   {"count": high_count, "pct": round(high_count / total * 100, 1)},
        },
        "total_students": total,
    }


# ---------------------------------------------------------------------------
# 4. Course Deep Dive (aggregate)
# ---------------------------------------------------------------------------

@router.get("/course-detail")
def get_course_detail(department: str = None, db: Session = Depends(get_db)):
    """
    Returns per-course aggregate metrics for radar charts, box plots, and tables.
    """
    students = _filter_students(db, department)
    if not students:
        return {"courses": []}

    total = len(students)
    avg_api = sum(s.metrics.academic_performance_index for s in students) / total
    avg_attend = sum(s.metrics.attendance_rate for s in students) / total
    avg_engage = sum(s.metrics.engagement_score for s in students) / total

    courses = [
        {"id": "CS101", "name": "Mathematics",          "credits": 4, "is_core": True},
        {"id": "CS102", "name": "DS & Algorithms",      "credits": 4, "is_core": True},
        {"id": "CS103", "name": "DBMS",                 "credits": 3, "is_core": True},
        {"id": "CS104", "name": "Computer Networks",    "credits": 3, "is_core": False},
        {"id": "CS105", "name": "Operating Systems",    "credits": 3, "is_core": True},
        {"id": "CS106", "name": "English Communication","credits": 2, "is_core": False},
        {"id": "CS107", "name": "Physics / Applied Science", "credits": 3, "is_core": False},
    ]

    offsets_course = [0, -5, 3, -8, 6, -3, 4]
    result = []
    for idx, c in enumerate(courses):
        offset = offsets_course[idx % len(offsets_course)]
        internal = round(min(100, max(0, avg_api + offset * 0.8)), 1)
        midterm   = round(min(100, max(0, avg_api + offset * 0.6)), 1)
        final_    = round(min(100, max(0, avg_api + offset)), 1)
        attend    = round(min(100, max(0, avg_attend + offset * 0.5)), 1)
        assign    = round(min(100, max(0, avg_engage * 0.9 + offset * 0.3)), 1)
        peer_avg  = round(avg_api, 1)
        grade_pct = round((internal * 0.3 + midterm * 0.3 + final_ * 0.4), 1)
        passed    = grade_pct >= 50

        result.append({
            "course_id":    c["id"],
            "course_name":  c["name"],
            "credits":      c["credits"],
            "is_core":      c["is_core"],
            "attendance_pct":  attend,
            "internal_marks":  internal,
            "assignment_score": assign,
            "midterm_score":   midterm,
            "final_score":     final_,
            "peer_avg":        peer_avg,
            "overall_grade":   grade_pct,
            "passed":          passed,
            # Radar data
            "radar": {
                "attendance":  attend,
                "internal":    internal,
                "assignment":  assign,
                "midterm":     midterm,
                "final":       final_,
                "peer_comp":   round(grade_pct - peer_avg + 50, 1),
            },
            # Box plot stub (percentiles)
            "box_plot": {
                "min":    round(max(0, grade_pct - 25), 1),
                "q1":     round(max(0, grade_pct - 12), 1),
                "median": grade_pct,
                "q3":     round(min(100, grade_pct + 12), 1),
                "max":    round(min(100, grade_pct + 25), 1),
                "student_value": grade_pct,
            },
        })

    return {"courses": result}


# ---------------------------------------------------------------------------
# 5. Comparative Analytics
# ---------------------------------------------------------------------------

@router.get("/comparative")
def get_comparative_analytics(department: str = None, db: Session = Depends(get_db)):
    """
    Student cohort vs class average and vs the historical at-risk group.
    """
    students = _filter_students(db, department)
    if not students:
        return {}

    total = len(students)
    avg_gpa = _gpa_from_index(sum(s.metrics.academic_performance_index for s in students) / total)

    # High-risk sub-group
    at_risk = [s for s in students if s.risk_score and s.risk_score.risk_level in (RiskLevel.HIGH, RiskLevel.MODERATE)]
    at_risk_gpa = _gpa_from_index(sum(s.metrics.academic_performance_index for s in at_risk) / len(at_risk)) if at_risk else avg_gpa

    # Rank percentile derived from GPA
    percentile = round(100 - ((avg_gpa / 4.0) * 100) + 20, 1)
    percentile = max(1, min(99, percentile))

    return {
        "class_avg_gpa":     avg_gpa,
        "at_risk_avg_gpa":   at_risk_gpa,
        "gpa_delta_vs_class": round(avg_gpa - avg_gpa, 2),   # cohort vs itself
        "rank_percentile":   percentile,
        "at_risk_count":     len(at_risk),
        "total_students":    total,
        "pattern_similarity_score": round(len(at_risk) / max(1, total) * 100, 1),
    }


# ---------------------------------------------------------------------------
# 6. Early Warning Alerts
# ---------------------------------------------------------------------------

@router.get("/early-warnings")
def get_early_warnings(department: str = None, db: Session = Depends(get_db)):
    """
    Generates early-warning flags for the cohort.
    Returns high-priority alerts and a notification log.
    """
    students = _filter_students(db, department)
    if not students:
        return {"alerts": [], "summary": {}}

    total = len(students)
    all_alerts = []
    high_count = med_count = 0

    for s in students:
        m = s.metrics
        api = m.academic_performance_index
        # Compute a 5-term GPA series based on trend toward current
        base = _gpa_from_index(api)
        trend_step = m.semester_performance_trend / 100 * 0.25
        gpa_series = [round(min(4.0, max(0, base - trend_step * (4 - i))), 2) for i in range(5)]
        failed_per_term = [max(0, round(m.failure_ratio * 8))] * 5
        credits_earned = round(160 * (1 - m.failure_ratio) * 0.92, 0)
        assign_rate = round(min(100, m.engagement_score * 0.9 + 10), 1)

        warnings = generate_early_warnings(
            gpa_series=gpa_series,
            failed_subjects_per_term=failed_per_term,
            cumulative_credits_earned=credits_earned,
            expected_credits=160,
            assignment_completion=assign_rate,
        )
        for w in warnings:
            all_alerts.append({
                "student_id":   s.id,
                "student_name": s.name,
                "type":         w["type"],
                "severity":     w["severity"],
                "message":      w["message"],
            })
            if w["severity"] == "High": high_count += 1
            else: med_count += 1

    # Sort by severity
    all_alerts.sort(key=lambda x: 0 if x["severity"] == "High" else 1)

    return {
        "alerts": all_alerts[:50],   # cap for response size
        "summary": {
            "total_alerts":    len(all_alerts),
            "high_severity":   high_count,
            "medium_severity": med_count,
            "students_flagged": len({a["student_id"] for a in all_alerts}),
        },
    }


# ---------------------------------------------------------------------------
# 7. AI Insight Summary
# ---------------------------------------------------------------------------

@router.get("/ai-insight")
def get_ai_insight(department: str = None, db: Session = Depends(get_db)):
    """
    Returns an AI-generated (rule-based) insight summary for the cohort.
    """
    students = _filter_students(db, department)
    if not students:
        return {"insight": "No data available for the selected filters."}

    total = len(students)
    avg_api = sum(s.metrics.academic_performance_index for s in students) / total
    avg_failure = sum(s.metrics.failure_ratio for s in students) / total
    avg_trend = sum(s.metrics.semester_performance_trend for s in students) / total

    base_gpa = _gpa_from_index(avg_api)
    trend_step = avg_trend / 100 * 0.25
    gpa_series = [round(min(4.0, max(0, base_gpa - trend_step * (4 - i))), 2) for i in range(5)]

    failed_total = round(avg_failure * 8 * 2)   # approx over 2 semesters
    assign_rate = round(min(100, sum(s.metrics.engagement_score for s in students) / total * 0.9 + 10), 1)
    gpa_decline = max(0, (gpa_series[0] - gpa_series[-1]) / max(0.01, gpa_series[0]))

    risk_result = calculate_performance_risk_score(
        gpa_decline=gpa_decline,
        failed_subjects_ratio=avg_failure,
        attendance_rate=sum(s.metrics.attendance_rate for s in students) / total,
        assignment_completion=assign_rate,
    )

    warnings = generate_early_warnings(
        gpa_series=gpa_series,
        failed_subjects_per_term=[round(avg_failure * 8)] * 5,
        cumulative_credits_earned=160 * (1 - avg_failure) * 0.9,
        expected_credits=160,
        assignment_completion=assign_rate,
    )

    insight = generate_ai_insight(
        student_name=f"The selected cohort ({total} students)",
        gpa_series=gpa_series,
        failed_subjects_total=failed_total,
        risk_category=risk_result["category"],
        warnings=warnings,
    )

    return {
        "insight": insight,
        "risk_score": risk_result["score"],
        "risk_category": risk_result["category"],
    }


# ---------------------------------------------------------------------------
# 8. Intervention Tracking
# ---------------------------------------------------------------------------

@router.get("/interventions")
def get_interventions(department: str = None, db: Session = Depends(get_db)):
    """
    Returns intervention records for at-risk students in the cohort.
    """
    students = _filter_students(db, department)
    student_ids = [s.id for s in students]

    interventions = db.query(Intervention).filter(
        Intervention.student_id.in_(student_ids)
    ).order_by(Intervention.created_at.desc()).limit(100).all()

    result = []
    for iv in interventions:
        student = next((s for s in students if s.id == iv.student_id), None)
        result.append({
            "id":               iv.id,
            "student_id":       iv.student_id,
            "student_name":     student.name if student else "Unknown",
            "type":             iv.intervention_type.value if iv.intervention_type else "",
            "status":           iv.status.value if iv.status else "",
            "assigned_to":      iv.assigned_to,
            "notes":            iv.notes,
            "created_at":       iv.created_at.isoformat() if iv.created_at else None,
            "completed_at":     iv.completed_at.isoformat() if iv.completed_at else None,
        })

    return {
        "interventions": result,
        "total": len(result),
        "pending": sum(1 for i in result if i["status"] == "pending"),
        "in_progress": sum(1 for i in result if i["status"] == "in_progress"),
        "completed": sum(1 for i in result if i["status"] == "completed"),
    }


# ---------------------------------------------------------------------------
# 9. Segmentation / Department Breakdown (legacy preserved + extended)
# ---------------------------------------------------------------------------

@router.get("/aggregate")
def get_performance_aggregate(department: str = None, db: Session = Depends(get_db)):
    """
    Aggregated performance metrics (kept for backwards compatibility).
    """
    query = db.query(Student).join(StudentMetric)
    if department and department != "All Departments" and department in DEPT_MAPPING:
        query = query.filter(Student.department == DEPT_MAPPING[department])
    students = query.all()

    if not students:
        return {"total_students": 0, "neo_pat_score": 0, "coding_stats": {}, "mcq_stats": {}, "projects_stats": {}, "solved_questions": {}}

    total = len(students)
    avg_performance = sum(s.metrics.academic_performance_index for s in students) / total
    avg_attendance  = sum(s.metrics.attendance_rate for s in students) / total
    avg_engagement  = sum(s.metrics.engagement_score for s in students) / total

    neo_pat_score = int((avg_performance / 100) * 500)
    coding_attended = int(avg_performance * 0.4)
    coding_solved   = int(coding_attended * (avg_performance / 100))
    mcq_attended    = int(avg_engagement * 0.8)
    mcq_solved      = int(mcq_attended * 0.45)
    projects_major  = int(total * 0.02)
    projects_minor  = int(total * 0.05)

    easy_total, medium_total, hard_total = 83, 91, 45
    easy_solved   = int(easy_total   * (avg_performance / 100))
    medium_solved = int(medium_total * (avg_performance / 100) * 0.8)
    hard_solved   = int(hard_total   * (avg_performance / 100) * 0.4)

    return {
        "total_students": total,
        "department": department or "All Departments",
        "avg_performance_index": round(avg_performance, 2),
        "avg_attendance": round(avg_attendance, 2),
        "avg_engagement": round(avg_engagement, 2),
        "neo_pat_score": neo_pat_score,
        "neo_pat_level": _pat_level(neo_pat_score),
        "coding_stats": {
            "questions_attended": coding_attended,
            "solved_correctly":   coding_solved,
            "your_score":         coding_solved * 10,
            "accuracy": round((coding_solved / coding_attended * 100) if coding_attended > 0 else 0, 2),
        },
        "mcq_stats": {
            "questions_attended": mcq_attended,
            "solved_correctly":   mcq_solved,
            "your_score":         mcq_solved,
            "accuracy": round((mcq_solved / mcq_attended * 100) if mcq_attended > 0 else 0, 2),
        },
        "projects_stats": {
            "major_attended": projects_major,
            "minor_attended": projects_minor,
            "your_score":     0,
        },
        "solved_questions": {
            "easy":   {"solved": easy_solved,   "total": easy_total},
            "medium": {"solved": medium_solved, "total": medium_total},
            "hard":   {"solved": hard_solved,   "total": hard_total},
            "total_solved":     easy_solved + medium_solved + hard_solved,
            "total_questions":  easy_total + medium_total + hard_total,
        },
    }


@router.get("/institutional-avg")
def get_institutional_average(db: Session = Depends(get_db)):
    avg_risk = db.query(func.avg(RiskScore.risk_score)).scalar() or 0
    total = db.query(func.count(RiskScore.id)).scalar() or 1
    high_count = db.query(func.count(RiskScore.id)).filter(RiskScore.risk_level == RiskLevel.HIGH).scalar() or 0
    high_pct = round(high_count / total * 100, 1)
    trend = round(float(avg_risk) - 50, 1)
    return {"avg_risk_percentage": round(float(avg_risk), 2), "trend": trend, "target": 10.0, "high_risk_pct": high_pct}


@router.get("/department-breakdown")
def get_department_performance(db: Session = Depends(get_db)):
    results = []
    for dept in Department:
        students_in_dept = db.query(Student).join(StudentMetric).filter(Student.department == dept).all()
        if not students_in_dept:
            continue
        total = len(students_in_dept)
        results.append({
            "department":     dept.value,
            "total_students": total,
            "avg_performance": round(sum(s.metrics.academic_performance_index for s in students_in_dept) / total, 2),
            "avg_attendance":  round(sum(s.metrics.attendance_rate for s in students_in_dept) / total, 2),
        })
    return results
