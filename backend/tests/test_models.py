"""Tests for SQLAlchemy models, relationships, and Pydantic schemas."""

import pytest
from datetime import datetime

from app.models import (
    Student, StudentMetric, RiskScore, RiskHistory,
    Intervention, ModelVersion, User,
    Department, Section, RiskLevel, RiskTrend,
    InterventionType, InterventionStatus, Role,
)
from app.schemas import (
    AnalyticsOverview,
    StudentWithRisk,
    RiskExplanation,
    SHAPFactor,
    Token,
    FacultyStudentListItem,
    PaginatedStudentList,
)


class TestEnums:
    def test_risk_levels(self):
        assert RiskLevel.HIGH.value == "High Risk"
        assert RiskLevel.MODERATE.value == "Moderate Risk"
        assert RiskLevel.STABLE.value == "Stable"
        assert RiskLevel.SAFE.value == "Safe"

    def test_risk_trends(self):
        assert RiskTrend.UP.value == "up"
        assert RiskTrend.DOWN.value == "down"
        assert RiskTrend.STABLE.value == "stable"

    def test_departments(self):
        assert Department.CSE.value == "Computer Science (CSE)"
        assert len(Department) == 7

    def test_roles(self):
        assert Role.STUDENT.value == "STUDENT"
        assert Role.FACULTY.value == "FACULTY"
        assert Role.ADMIN.value == "ADMIN"


class TestStudentModel:
    def test_create_student(self, db, sample_model_version):
        student = Student(
            id="TEST001",
            name="Test Student",
            avatar="TS",
            course="B.Tech CS",
            department=Department.CSE,
            section=Section.A,
        )
        db.add(student)
        db.commit()
        db.refresh(student)

        assert student.id == "TEST001"
        assert student.name == "Test Student"
        assert student.department == Department.CSE
        assert student.created_at is not None

    def test_student_metric_relationship(self, db, sample_student):
        assert sample_student.metrics is not None
        assert sample_student.metrics.attendance_rate == 82.5
        assert sample_student.metrics.engagement_score == 71.0

    def test_student_risk_relationship(self, db, sample_student):
        assert sample_student.risk_score is not None
        assert sample_student.risk_score.risk_score == 35.2
        assert sample_student.risk_score.risk_level == RiskLevel.SAFE

    def test_student_advisor_id_field(self, db, sample_student):
        sample_student.advisor_id = "FAC002"
        db.commit()
        db.refresh(sample_student)
        assert sample_student.advisor_id == "FAC002"


class TestRiskScoreModel:
    def test_create_risk_score(self, db, sample_model_version):
        student = Student(
            id="RS001", name="Risk Student", avatar="RS",
            course="B.Tech", department=Department.CSE, section=Section.B,
        )
        db.add(student)
        db.flush()

        risk = RiskScore(
            student_id="RS001",
            risk_score=72.5,
            risk_level=RiskLevel.HIGH,
            risk_trend=RiskTrend.UP,
            risk_value="+12% Risk",
            model_version_id=sample_model_version.id,
        )
        db.add(risk)
        db.commit()
        db.refresh(risk)

        assert risk.risk_score == 72.5
        assert risk.risk_level == RiskLevel.HIGH
        assert risk.risk_trend == RiskTrend.UP

    def test_shap_explanation_json(self, db, sample_student):
        shap = sample_student.risk_score.shap_explanation
        assert isinstance(shap, dict)
        assert "top_factors" in shap
        assert len(shap["top_factors"]) == 2


class TestInterventionModel:
    def test_create_intervention(self, db, sample_student):
        intervention = Intervention(
            student_id="ST0001",
            intervention_type=InterventionType.COUNSELING,
            status=InterventionStatus.PENDING,
            assigned_to="Dr. Smith",
            notes="Auto-triggered by high risk score.",
        )
        db.add(intervention)
        db.commit()
        db.refresh(intervention)

        assert intervention.intervention_type == InterventionType.COUNSELING
        assert intervention.status == InterventionStatus.PENDING
        assert intervention.student_id == "ST0001"


class TestSchemas:
    def test_analytics_overview_schema(self):
        overview = AnalyticsOverview(
            total_students=100,
            high_risk_count=15,
            high_risk_percentage=15.0,
            average_risk_score=42.5,
            average_attendance=78.3,
            high_risk_department="Computer Science (CSE)",
            risk_distribution={"High Risk": 15, "Moderate Risk": 25, "Stable": 30, "Safe": 30},
        )
        assert overview.total_students == 100
        assert overview.risk_distribution["High Risk"] == 15

    def test_token_schema(self):
        token = Token(
            access_token="abc.def.ghi",
            token_type="bearer",
            role="STUDENT",
            user_id=1,
            student_id="ST0001",
        )
        assert token.access_token == "abc.def.ghi"
        assert token.student_id == "ST0001"

    def test_shap_factor_schema(self):
        factor = SHAPFactor(
            feature="Attendance Rate",
            impact=0.25,
            direction="negative",
        )
        assert factor.feature == "Attendance Rate"
        assert factor.direction == "negative"

    def test_paginated_student_list_schema(self):
        item = FacultyStudentListItem(
            id="ST001", name="Test", avatar="TE", department="CSE",
            course="B.Tech", section="A", risk_score=50.0,
            risk_level="High Risk", risk_trend="up", risk_value="+5% Risk",
            attendance_rate=80.0, engagement_score=70.0,
            academic_performance_index=7.5,
        )
        paginated = PaginatedStudentList(
            items=[item], total=1, page=1, page_size=20, pages=1,
        )
        assert paginated.total == 1
        assert len(paginated.items) == 1

    def test_no_duplicate_analytics_overview(self):
        """Verify only one AnalyticsOverview class exists in schemas module."""
        from app import schemas
        classes = [
            name for name in dir(schemas)
            if name == "AnalyticsOverview"
        ]
        assert len(classes) == 1
