"""Tests for the feature engineering service."""

import pytest
import pandas as pd
from datetime import datetime

from app.services.feature_engineering import (
    compute_and_save_features,
    FeatureEngineer,
    _safe,
    _clamp,
)
from app.models import (
    Student, StudentMetric, StudentRawAttendance, StudentRawMarks,
    StudentRawAssignments, Department, Section,
)


class TestHelpers:
    def test_safe_with_float(self):
        assert _safe(42.5) == 42.5

    def test_safe_with_none(self):
        assert _safe(None) == 0.0
        assert _safe(None, 5.0) == 5.0

    def test_safe_with_nan(self):
        assert _safe(float("nan")) == 0.0

    def test_safe_with_inf(self):
        assert _safe(float("inf")) == 0.0

    def test_safe_with_string(self):
        assert _safe("not a number") == 0.0

    def test_clamp_within_range(self):
        assert _clamp(50.0) == 50.0

    def test_clamp_below_range(self):
        assert _clamp(-10.0) == 0.0

    def test_clamp_above_range(self):
        assert _clamp(150.0) == 100.0


class TestFeatureEngineerStatic:
    def test_prepare_ml_features(self):
        features = {
            "attendance_rate": 85.0,
            "engagement_score": 70.0,
            "academic_performance_index": 7.5,
            "login_gap_days": 2,
            "failure_ratio": 0.05,
            "financial_risk_flag": True,
            "commute_risk_score": 1,
            "semester_performance_trend": 0.5,
        }
        df = FeatureEngineer.prepare_ml_features(features)

        assert isinstance(df, pd.DataFrame)
        assert len(df) == 1
        assert df["financial_risk_flag"].iloc[0] == 1
        assert df["attendance_rate"].iloc[0] == 85.0
        assert list(df.columns) == FeatureEngineer.FEATURE_COLUMNS

    def test_prepare_ml_features_false_flag(self):
        features = {
            "attendance_rate": 85.0,
            "engagement_score": 70.0,
            "academic_performance_index": 7.5,
            "login_gap_days": 2,
            "failure_ratio": 0.05,
            "financial_risk_flag": False,
            "commute_risk_score": 1,
            "semester_performance_trend": 0.5,
        }
        df = FeatureEngineer.prepare_ml_features(features)
        assert df["financial_risk_flag"].iloc[0] == 0

    def test_engineer_target(self):
        assert FeatureEngineer.engineer_target("Dropout") == 1
        assert FeatureEngineer.engineer_target("Graduate") == 0
        assert FeatureEngineer.engineer_target("Enrolled") == 0
        assert FeatureEngineer.engineer_target("Unknown") == 0


class TestComputeAndSaveFeatures:
    def test_compute_with_raw_attendance(self, db, sample_model_version):
        student = Student(
            id="FE001", name="Feature Student", avatar="FS",
            course="B.Tech CS", department=Department.CSE, section=Section.A,
        )
        db.add(student)
        db.flush()

        for i in range(10):
            db.add(StudentRawAttendance(
                student_id="FE001",
                date=datetime(2026, 1, i + 1),
                subject="Math",
                status="Present" if i < 8 else "Absent",
            ))
        db.flush()

        metric = compute_and_save_features("FE001", db)
        db.commit()

        assert metric is not None
        assert metric.attendance_rate == pytest.approx(80.0, abs=0.1)

    def test_compute_with_raw_marks(self, db, sample_model_version):
        student = Student(
            id="FE002", name="Marks Student", avatar="MS",
            course="B.Tech CS", department=Department.CSE, section=Section.B,
        )
        db.add(student)
        db.flush()

        db.add(StudentRawMarks(student_id="FE002", subject="Math", exam_type="Internal", marks_obtained=80, max_marks=100))
        db.add(StudentRawMarks(student_id="FE002", subject="Physics", exam_type="Internal", marks_obtained=60, max_marks=100))
        db.flush()

        metric = compute_and_save_features("FE002", db)
        db.commit()

        assert metric.academic_performance_index == pytest.approx(70.0, abs=0.1)
        assert metric.failure_ratio == 0.0

    def test_compute_with_raw_assignments(self, db, sample_model_version):
        student = Student(
            id="FE003", name="Assignment Student", avatar="AS",
            course="B.Tech CS", department=Department.CSE, section=Section.C,
        )
        db.add(student)
        db.flush()

        db.add(StudentRawAssignments(student_id="FE003", subject="CS", assignment_name="HW1", submitted=True, score=8, max_score=10))
        db.add(StudentRawAssignments(student_id="FE003", subject="CS", assignment_name="HW2", submitted=True, score=9, max_score=10))
        db.add(StudentRawAssignments(student_id="FE003", subject="CS", assignment_name="HW3", submitted=False, score=None, max_score=10))
        db.flush()

        metric = compute_and_save_features("FE003", db)
        db.commit()

        assert metric.engagement_score > 0
        assert metric.engagement_score <= 100

    def test_upsert_existing_metric(self, db, sample_model_version):
        student = Student(
            id="FE004", name="Upsert Student", avatar="US",
            course="B.Tech CS", department=Department.CSE, section=Section.A,
        )
        db.add(student)
        db.flush()

        existing = StudentMetric(
            student_id="FE004", attendance_rate=50.0, engagement_score=50.0,
            academic_performance_index=50.0, login_gap_days=5, failure_ratio=0.2,
            financial_risk_flag=False, commute_risk_score=2, semester_performance_trend=0.0,
        )
        db.add(existing)
        db.flush()

        for i in range(5):
            db.add(StudentRawAttendance(
                student_id="FE004", date=datetime(2026, 2, i + 1),
                subject="Eng", status="Present",
            ))
        db.flush()

        metric = compute_and_save_features("FE004", db)
        db.commit()

        assert metric.attendance_rate == 100.0
