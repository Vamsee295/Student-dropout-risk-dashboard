"""
Performance utility functions for the Performance Page.

Provides:
  - Performance Risk Score calculation
  - GPA / academic trend analysis (rolling averages, drop detection)
  - Early-warning flag generation
  - AI insight text generation (rule-based)
"""

from typing import List, Dict, Any, Optional


# ---------------------------------------------------------------------------
# Risk Scoring
# ---------------------------------------------------------------------------

def calculate_performance_risk_score(
    gpa_decline: float,        # 0-1 normalised (0 = no decline, 1 = max decline)
    failed_subjects_ratio: float,  # 0-1 (0 = none failed, 1 = all failed)
    attendance_rate: float,    # 0-100 percentage
    assignment_completion: float,  # 0-100 percentage
) -> Dict[str, Any]:
    """
    Calculate a composite Performance Risk Score.

    Formula:
        score = (0.4 × gpa_decline) +
                (0.3 × failed_subjects_ratio) +
                (0.2 × (1 - attendance_rate/100)) +
                (0.1 × (1 - assignment_completion/100))

    Returns a 0-100 score and a risk category label.
    """
    attendance_risk = max(0.0, 1.0 - (attendance_rate / 100.0))
    assignment_risk = max(0.0, 1.0 - (assignment_completion / 100.0))

    raw = (
        0.4 * min(1.0, gpa_decline) +
        0.3 * min(1.0, failed_subjects_ratio) +
        0.2 * attendance_risk +
        0.1 * assignment_risk
    )
    score = round(raw * 100, 1)   # 0-100

    if score >= 60:
        category = "High"
        color = "red"
    elif score >= 35:
        category = "Medium"
        color = "yellow"
    else:
        category = "Low"
        color = "green"

    return {
        "score": score,
        "category": category,
        "color": color,
        "breakdown": {
            "gpa_decline_contribution": round(0.4 * min(1.0, gpa_decline) * 100, 1),
            "failed_ratio_contribution": round(0.3 * min(1.0, failed_subjects_ratio) * 100, 1),
            "attendance_contribution": round(0.2 * attendance_risk * 100, 1),
            "assignment_contribution": round(0.1 * assignment_risk * 100, 1),
        },
    }


# ---------------------------------------------------------------------------
# GPA / Academic Trend Analysis
# ---------------------------------------------------------------------------

def compute_rolling_average(values: List[float], window: int = 3) -> List[Optional[float]]:
    """
    Compute a rolling (moving) average of `window` terms.
    Returns None for positions where there are not yet enough data points.
    """
    result: List[Optional[float]] = []
    for i, _ in enumerate(values):
        if i < window - 1:
            result.append(None)
        else:
            avg = sum(values[i - window + 1 : i + 1]) / window
            result.append(round(avg, 3))
    return result


def detect_sharp_drops(
    gpa_series: List[float],
    threshold: float = 0.5,
) -> List[Dict[str, Any]]:
    """
    Identify positions where the GPA dropped by more than `threshold` in a single term.
    Returns a list of dicts with term index, from_value, to_value, and drop magnitude.
    """
    drops = []
    for i in range(1, len(gpa_series)):
        drop = gpa_series[i - 1] - gpa_series[i]
        if drop >= threshold:
            drops.append({
                "term_index": i,
                "from_gpa": round(gpa_series[i - 1], 2),
                "to_gpa": round(gpa_series[i], 2),
                "drop": round(drop, 2),
            })
    return drops


def compute_gpa_trend_direction(gpa_series: List[float]) -> str:
    """
    Determine whether GPA is generally improving, declining, or stable
    by comparing the last two values and the overall linear slope.
    """
    if len(gpa_series) < 2:
        return "stable"

    recent_change = gpa_series[-1] - gpa_series[-2]
    if recent_change > 0.1:
        return "improving"
    elif recent_change < -0.1:
        return "declining"
    return "stable"


# ---------------------------------------------------------------------------
# Early-Warning Flag Generation
# ---------------------------------------------------------------------------

def generate_early_warnings(
    gpa_series: List[float],
    failed_subjects_per_term: List[int],
    cumulative_credits_earned: float,
    expected_credits: float,
    assignment_completion: float,
) -> List[Dict[str, str]]:
    """
    Produce a list of early-warning flags based on configurable thresholds.
    Each warning has a `type`, `severity`, and `message`.
    """
    warnings = []

    # --- GPA drop > 10% ---
    if len(gpa_series) >= 2:
        latest, previous = gpa_series[-1], gpa_series[-2]
        if previous > 0:
            pct_drop = (previous - latest) / previous * 100
            if pct_drop > 10:
                warnings.append({
                    "type": "gpa_drop",
                    "severity": "High",
                    "message": f"GPA dropped by {pct_drop:.1f}% this term (from {previous:.2f} to {latest:.2f}).",
                })

    # --- Consecutive decline (3+ terms) ---
    if len(gpa_series) >= 3:
        if all(gpa_series[i] > gpa_series[i + 1] for i in range(len(gpa_series) - 3, len(gpa_series) - 1)):
            warnings.append({
                "type": "consecutive_decline",
                "severity": "Medium",
                "message": "GPA has declined for 3 or more consecutive semesters.",
            })

    # --- Failed 2+ subjects in one term ---
    if failed_subjects_per_term and failed_subjects_per_term[-1] >= 2:
        warnings.append({
            "type": "failed_subjects",
            "severity": "High",
            "message": f"Student failed {failed_subjects_per_term[-1]} subjects this term.",
        })

    # --- Cumulative credits below threshold ---
    if expected_credits > 0 and (cumulative_credits_earned / expected_credits) < 0.80:
        gap = expected_credits - cumulative_credits_earned
        warnings.append({
            "type": "credit_gap",
            "severity": "Medium",
            "message": f"Credits earned ({cumulative_credits_earned:.0f}) are {gap:.0f} below the expected target ({expected_credits:.0f}).",
        })

    # --- Assignment completion < 60% ---
    if assignment_completion < 60:
        warnings.append({
            "type": "low_assignments",
            "severity": "Medium",
            "message": f"Assignment submission rate is only {assignment_completion:.1f}% (threshold: 60%).",
        })

    return warnings


# ---------------------------------------------------------------------------
# AI Insight Generator (rule-based)
# ---------------------------------------------------------------------------

def generate_ai_insight(
    student_name: str,
    gpa_series: List[float],
    failed_subjects_total: int,
    risk_category: str,
    warnings: List[Dict[str, str]],
) -> str:
    """
    Generate a plain-English AI insight summary for a student.
    """
    parts = []

    trend = compute_gpa_trend_direction(gpa_series)
    term_count = len(gpa_series)

    if trend == "declining" and term_count >= 2:
        parts.append(f"{student_name} has shown a consistent GPA decline over the last {term_count} semesters.")
    elif trend == "improving":
        parts.append(f"{student_name} is showing an improving academic trajectory over the last {term_count} semesters.")
    else:
        parts.append(f"{student_name}'s academic performance has been relatively stable.")

    if failed_subjects_total >= 2:
        parts.append(f"They have failed {failed_subjects_total} subjects in total.")

    if risk_category == "High":
        parts.append("Immediate academic intervention is strongly recommended.")
    elif risk_category == "Medium":
        parts.append("Proactive mentoring sessions are advised to prevent further decline.")

    if not warnings:
        parts.append("No critical early-warning flags are currently active.")

    return " ".join(parts)
