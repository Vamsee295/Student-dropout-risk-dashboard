"""Tests for API route handlers."""

import pytest
from app.models import (
    Student, StudentMetric, RiskScore, Intervention,
    Department, Section, RiskLevel, RiskTrend,
    InterventionType, InterventionStatus,
)


class TestHealthEndpoint:
    def test_health_check(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "database" in data

    def test_root_endpoint(self, client):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "docs" in data


class TestAuthRoutes:
    def test_login_with_valid_credentials(self, client, sample_user):
        response = client.post("/api/auth/login", data={
            "username": "alice@test.edu",
            "password": "testpass123",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["role"] == "STUDENT"
        assert data["student_id"] == "ST0001"

    def test_login_with_wrong_password(self, client, sample_user):
        response = client.post("/api/auth/login", data={
            "username": "alice@test.edu",
            "password": "wrong_password",
        })
        assert response.status_code == 401

    def test_register_new_user(self, client, db):
        response = client.post("/api/auth/register", json={
            "email": "newuser@test.edu",
            "password": "securepass",
            "name": "New User",
            "role": "FACULTY",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "newuser@test.edu"
        assert data["role"] == "FACULTY"

    def test_register_duplicate_email(self, client, sample_user):
        response = client.post("/api/auth/register", json={
            "email": "alice@test.edu",
            "password": "anotherpass",
            "name": "Duplicate",
            "role": "STUDENT",
        })
        assert response.status_code == 400

    def test_get_me_with_token(self, client, sample_user):
        login_resp = client.post("/api/auth/login", data={
            "username": "alice@test.edu",
            "password": "testpass123",
        })
        token = login_resp.json()["access_token"]

        me_resp = client.get("/api/auth/me", headers={
            "Authorization": f"Bearer {token}",
        })
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == "alice@test.edu"

    def test_get_me_without_token(self, client):
        response = client.get("/api/auth/me")
        assert response.status_code == 401

    def test_forgot_password(self, client, sample_user):
        response = client.post("/api/auth/forgot-password?email=alice@test.edu")
        assert response.status_code == 200
        assert "message" in response.json()


class TestStudentsRoutes:
    def test_get_all_students(self, client, sample_student):
        response = client.get("/api/students")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["id"] == "ST0001"

    def test_get_student_by_id(self, client, sample_student):
        response = client.get("/api/students/ST0001")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "ST0001"
        assert data["name"] == "Alice Johnson"
        assert "riskStatus" in data

    def test_get_nonexistent_student(self, client, db, sample_model_version):
        response = client.get("/api/students/NONEXIST")
        assert response.status_code == 404

    def test_get_student_risk(self, client, sample_student):
        response = client.get("/api/students/ST0001/risk")
        assert response.status_code == 200
        data = response.json()
        assert "risk_score" in data
        assert "risk_level" in data
        assert "top_factors" in data

    def test_assign_advisor(self, client, sample_student):
        response = client.post("/api/students/assign-advisor", json={
            "student_ids": ["ST0001"],
            "advisor_name": "Dr. New Advisor",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["updated_count"] == 1

    def test_schedule_counseling(self, client, sample_student):
        response = client.post("/api/students/schedule-counseling", json={
            "student_ids": ["ST0001"],
            "topic": "Academic Performance",
            "date": "2026-03-01",
            "time": "10:00",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


class TestFacultyDashboardRoutes:
    def test_faculty_overview(self, client, sample_student):
        response = client.get("/api/faculty/overview")
        assert response.status_code == 200
        data = response.json()
        assert "total_students" in data
        assert "high_risk_count" in data
        assert "risk_distribution" in data
        assert data["total_students"] >= 1

    def test_faculty_student_list(self, client, sample_student):
        response = client.get("/api/faculty/students")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "pages" in data
        assert len(data["items"]) >= 1

    def test_faculty_student_list_pagination(self, client, sample_student):
        response = client.get("/api/faculty/students?page=1&page_size=5")
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert data["page_size"] == 5

    def test_faculty_student_profile(self, client, sample_student):
        response = client.get("/api/faculty/students/ST0001")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "ST0001"
        assert "risk_score" in data
        assert "risk_level" in data
        assert "shap_factors" in data

    def test_faculty_student_explanation(self, client, sample_student):
        response = client.get("/api/faculty/students/ST0001/explanation")
        assert response.status_code == 200
        data = response.json()
        assert data["student_id"] == "ST0001"
        assert "top_features" in data

    def test_department_analytics(self, client, sample_student):
        response = client.get("/api/faculty/analytics/department")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_csv_export(self, client, sample_student):
        response = client.get("/api/faculty/export")
        assert response.status_code == 200
        assert "text/csv" in response.headers["content-type"]


class TestAnalyticsRoutes:
    def test_analytics_overview(self, client, sample_student):
        response = client.get("/api/analytics/overview")
        assert response.status_code == 200
        data = response.json()
        assert "total_students" in data
        assert "risk_distribution" in data


class TestStudentDashboardRoutes:
    def test_student_overview(self, client, sample_student):
        response = client.get("/api/student/ST0001/overview")
        assert response.status_code == 200
        data = response.json()
        assert "attendance_rate" in data
        assert "risk_level" in data
        assert "dropout_probability" in data

    def test_student_risk(self, client, sample_student):
        response = client.get("/api/student/ST0001/risk")
        assert response.status_code == 200
        data = response.json()
        assert "risk_score" in data
        assert "risk_level" in data

    def test_student_not_found(self, client, db, sample_model_version):
        response = client.get("/api/student/NONEXIST/overview")
        assert response.status_code == 404


class TestEngagementRoutes:
    def test_engagement_overview(self, client, sample_student):
        response = client.get("/api/engagement/overview")
        assert response.status_code == 200
        data = response.json()
        assert "avg_login_rate" in data
        assert "total_students" in data

    def test_digital_footprint(self, client, sample_student):
        response = client.get("/api/engagement/digital-footprint")
        assert response.status_code == 200
        data = response.json()
        assert "heatmap_data" in data

    def test_effort_vs_output(self, client, sample_student):
        response = client.get("/api/engagement/effort-vs-output")
        assert response.status_code == 200
        data = response.json()
        assert "weeks" in data


class TestFrontendRoute:
    def test_get_all_students_frontend(self, client, sample_student):
        response = client.get("/api/students/all")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        first = data[0]
        assert first["name"] == "Alice Johnson"
        assert "riskStatus" in first
        assert "riskTrend" in first
        assert "attendance" in first
        assert "engagementScore" in first
