"""
Frontend-Backend Integration Tests.

Verifies that the API responses match the data shapes the frontend expects.
Each test documents the frontend component/service that consumes the endpoint.
"""

import pytest
from app.models import (
    Student, StudentMetric, RiskScore, RiskHistory, Intervention,
    Department, Section, RiskLevel, RiskTrend,
    InterventionType, InterventionStatus, ModelVersion,
)


class TestAuthIntegration:
    """
    Frontend: src/services/auth.ts → authService.login()
    Store:    src/store/useAuthStore.ts
    """

    def test_login_response_matches_frontend_schema(self, client, sample_user):
        response = client.post("/api/auth/login", data={
            "username": "alice@test.edu",
            "password": "testpass123",
        })
        assert response.status_code == 200
        data = response.json()

        assert isinstance(data["access_token"], str)
        assert data["token_type"] == "bearer"
        assert isinstance(data["user_id"], int)
        assert data["role"] in ("STUDENT", "FACULTY", "ADMIN")
        # student_id may be None for faculty
        assert "student_id" in data


class TestFacultyOverviewIntegration:
    """
    Frontend: src/services/faculty.ts → facultyService.getOverview()
    Page:     src/app/(app)/dashboard/page.tsx
    Expected shape: FacultyOverview interface with risk_distribution as Record<string, number>
    """

    def test_overview_response_shape(self, client, sample_student):
        response = client.get("/api/faculty/overview")
        assert response.status_code == 200
        data = response.json()

        assert isinstance(data["total_students"], int)
        assert isinstance(data["high_risk_count"], int)
        assert isinstance(data["high_risk_percentage"], (int, float))
        assert isinstance(data["average_risk_score"], (int, float))
        assert isinstance(data["average_attendance"], (int, float))

        # risk_distribution keys must match RiskLevel.value strings
        rd = data["risk_distribution"]
        assert isinstance(rd, dict)
        valid_keys = {"High Risk", "Moderate Risk", "Stable", "Safe"}
        assert set(rd.keys()).issubset(valid_keys)


class TestFacultyStudentListIntegration:
    """
    Frontend: src/services/faculty.ts → facultyService.getStudents()
    Expected: PaginatedStudentList with items[], total, page, page_size, pages
    """

    def test_paginated_response_shape(self, client, sample_student):
        response = client.get("/api/faculty/students")
        assert response.status_code == 200
        data = response.json()

        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "pages" in data

        if data["items"]:
            item = data["items"][0]
            required_fields = [
                "id", "name", "avatar", "department", "course", "section",
                "risk_score", "risk_level", "risk_trend", "risk_value",
                "attendance_rate", "engagement_score", "academic_performance_index",
            ]
            for field in required_fields:
                assert field in item, f"Missing field: {field}"


class TestStudentDashboardIntegration:
    """
    Frontend: src/services/student.ts → studentService.getOverview()
    Expected: StudentOverview interface
    """

    def test_student_overview_shape(self, client, sample_student):
        response = client.get("/api/student/ST0001/overview")
        assert response.status_code == 200
        data = response.json()

        assert isinstance(data["attendance_rate"], (int, float))
        assert isinstance(data["avg_marks"], (int, float))
        assert isinstance(data["engagement_score"], (int, float))
        assert isinstance(data["dropout_probability"], (int, float))
        assert "risk_level" in data
        assert "risk_trend" in data
        assert "risk_value" in data
        assert isinstance(data["upcoming_deadlines"], list)
        assert isinstance(data["recent_attendance"], list)


class TestStudentRiskIntegration:
    """
    Frontend: src/services/student.ts → studentService.getRisk()
    Expected: RiskDetails interface
    """

    def test_student_risk_shape(self, client, sample_student):
        response = client.get("/api/student/ST0001/risk")
        assert response.status_code == 200
        data = response.json()

        assert "risk_score" in data
        assert "risk_level" in data
        assert "risk_trend" in data
        assert "risk_value" in data


class TestFrontendStudentsAllIntegration:
    """
    Frontend: src/services/studentService.ts → fetchStudents()
    Frontend: src/components/dashboard/DashboardMetrics.tsx
    Expected: Array of student objects with riskStatus, riskTrend, attendance, engagementScore
    """

    def test_students_all_shape(self, client, sample_student):
        response = client.get("/api/students/all")
        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)
        assert len(data) >= 1

        student = data[0]
        required_fields = [
            "id", "name", "avatar", "course", "department",
            "riskStatus", "riskTrend", "riskValue",
            "attendance", "engagementScore", "lastInteraction",
        ]
        for field in required_fields:
            assert field in student, f"Missing field: {field}"

        # riskStatus must be a string, not an enum object
        assert isinstance(student["riskStatus"], str)
        assert isinstance(student["riskTrend"], str)
        assert isinstance(student["attendance"], (int, float))


class TestStudentProfileIntegration:
    """
    Frontend: src/services/faculty.ts → facultyService.getStudentDetails()
    Expected: FacultyStudentProfile with shap_factors, risk_history, interventions
    """

    def test_student_profile_shape(self, client, sample_student):
        response = client.get("/api/faculty/students/ST0001")
        assert response.status_code == 200
        data = response.json()

        assert data["id"] == "ST0001"
        assert isinstance(data["risk_score"], (int, float))
        assert isinstance(data["risk_level"], str)
        assert isinstance(data["shap_factors"], list)
        assert isinstance(data["risk_history"], list)
        assert isinstance(data["interventions"], list)


class TestDepartmentAnalyticsIntegration:
    """
    Frontend: src/app/(app)/dashboard/page.tsx (fetches department analytics)
    Expected: Array of DepartmentAnalytics objects
    """

    def test_department_analytics_shape(self, client, sample_student):
        response = client.get("/api/faculty/analytics/department")
        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)
        if data:
            dept = data[0]
            required_fields = [
                "department", "total_students", "avg_risk_score",
                "avg_attendance", "high_risk_count",
            ]
            for field in required_fields:
                assert field in dept, f"Missing field: {field}"


class TestEngagementIntegration:
    """
    Frontend: engagement page components
    """

    def test_engagement_overview_shape(self, client, sample_student):
        response = client.get("/api/engagement/overview")
        assert response.status_code == 200
        data = response.json()

        required_fields = [
            "avg_login_rate", "avg_time_spent",
            "assignment_completion", "total_students",
        ]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"

    def test_effort_vs_output_shape(self, client, sample_student):
        response = client.get("/api/engagement/effort-vs-output")
        assert response.status_code == 200
        data = response.json()
        assert "weeks" in data
        assert isinstance(data["weeks"], list)


class TestAdvisorAssignmentIntegration:
    """
    Frontend: students page → AssignAdvisorModal
    Verifies the advisor field is correctly stored as advisor_id.
    """

    def test_advisor_assignment_persists(self, client, db, sample_student):
        response = client.post("/api/students/assign-advisor", json={
            "student_ids": ["ST0001"],
            "advisor_name": "Dr. New Advisor",
        })
        assert response.status_code == 200
        assert response.json()["success"] is True

        db.refresh(sample_student)
        assert sample_student.advisor_id == "Dr. New Advisor"


class TestMultipleStudentScenario:
    """End-to-end test with multiple students to verify list/filter endpoints."""

    def _create_students(self, db, model_version):
        students_data = [
            ("S1", "Safe Student", RiskLevel.SAFE, 25.0, Department.CSE, 90.0),
            ("S2", "Moderate Student", RiskLevel.MODERATE, 60.0, Department.MECHANICAL, 65.0),
            ("S3", "High Risk Student", RiskLevel.HIGH, 82.0, Department.CSE, 45.0),
        ]
        for sid, name, rl, rs, dept, att in students_data:
            s = Student(
                id=sid, name=name, avatar=name[:2].upper(),
                course="B.Tech", department=dept, section=Section.A,
            )
            db.add(s)
            db.flush()
            db.add(StudentMetric(
                student_id=sid, attendance_rate=att, engagement_score=70.0,
                academic_performance_index=7.0, login_gap_days=2, failure_ratio=0.1,
                financial_risk_flag=False, commute_risk_score=1, semester_performance_trend=0.0,
            ))
            db.add(RiskScore(
                student_id=sid, risk_score=rs, risk_level=rl,
                risk_trend=RiskTrend.STABLE, risk_value=f"{rs:.0f}%",
                model_version_id=model_version.id,
            ))
        db.commit()

    def test_overview_counts(self, client, db, sample_model_version):
        self._create_students(db, sample_model_version)
        response = client.get("/api/faculty/overview")
        data = response.json()

        assert data["total_students"] == 3
        assert data["high_risk_count"] == 1
        assert data["risk_distribution"]["Safe"] == 1
        assert data["risk_distribution"]["Moderate Risk"] == 1
        assert data["risk_distribution"]["High Risk"] == 1

    def test_filter_by_risk_level(self, client, db, sample_model_version):
        self._create_students(db, sample_model_version)
        response = client.get("/api/faculty/students?risk_level=High Risk")
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["id"] == "S3"

    def test_search_by_name(self, client, db, sample_model_version):
        self._create_students(db, sample_model_version)
        response = client.get("/api/faculty/students?search=Moderate")
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["name"] == "Moderate Student"
