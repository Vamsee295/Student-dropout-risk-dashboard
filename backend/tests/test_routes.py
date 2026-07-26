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
        data_raw = response.json()
        data = data_raw.get('data', data_raw) if isinstance(data_raw, dict) else data_raw
        assert "status" in data

    def test_root_endpoint(self, client):
        response = client.get("/")
        assert response.status_code == 200
        data_raw = response.json()
        data = data_raw.get('data', data_raw) if isinstance(data_raw, dict) else data_raw
        assert "message" in data

class TestAuthRoutes:
    def test_login_with_valid_credentials(self, client, sample_user):
        response = client.post("/api/v1/auth/login", data={
            "username": "alice@test.edu",
            "password": "testpass123",
        })
        assert response.status_code == 200
        data_raw = response.json()
        data = data_raw.get('data', data_raw) if isinstance(data_raw, dict) else data_raw
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["role"] == "DEAN"

    def test_login_with_wrong_password(self, client, sample_user):
        response = client.post("/api/v1/auth/login", data={
            "username": "alice@test.edu",
            "password": "wrong_password",
        })
        assert response.status_code == 401

    def test_get_me_with_token(self, client, sample_user):
        login_resp = client.post("/api/v1/auth/login", data={
            "username": "alice@test.edu",
            "password": "testpass123",
        })
        token = login_resp.json()["data"]["access_token"]
        me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_resp.status_code == 200
        assert me_resp.json()["data"]["email"] == "alice@test.edu"

    def test_get_me_without_token(self, client):
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401

    def test_password_reset_request(self, client, sample_user):
        response = client.post("/api/v1/auth/password-reset-request", json={"email": "alice@test.edu"})
        assert response.status_code == 200

class TestStudentsRoutes:
    def test_get_all_students(self, client, sample_student):
        response = client.get("/api/v1/students/")
        assert response.status_code == 200
        data_raw = response.json()
        data = data_raw.get('data', data_raw) if isinstance(data_raw, dict) else data_raw
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_get_student_by_id(self, client, sample_student):
        response = client.get(f"/api/v1/students/{sample_student.id}")
        assert response.status_code == 200
        data_raw = response.json()
        data = data_raw.get('data', data_raw) if isinstance(data_raw, dict) else data_raw
        assert data["id"] == sample_student.id

    def test_get_nonexistent_student(self, client, db):
        response = client.get("/api/v1/students/NONEXIST")
        assert response.status_code == 404

class TestRiskRoutes:
    def test_get_student_risk(self, client, sample_student):
        response = client.get(f"/api/v1/risk/{sample_student.id}")
        assert response.status_code == 200
        data_raw = response.json()
        data = data_raw.get('data', data_raw) if isinstance(data_raw, dict) else data_raw
        assert "risk_score" in data

    def test_model_status(self, client):
        response = client.get("/api/v1/risk/model/status")
        assert response.status_code == 200

class TestFacultyDashboardRoutes:
    def test_faculty_overview(self, client, sample_user):
        response = client.get(f"/api/v1/faculty/{sample_user.id}/overview")
        assert response.status_code == 200
        data_raw = response.json()
        data = data_raw.get('data', data_raw) if isinstance(data_raw, dict) else data_raw
        assert "total_students" in data
        assert "high_risk_count" in data

    def test_faculty_student_list(self, client, sample_student):
        response = client.get("/api/v1/faculty/students")
        assert response.status_code == 200
        data_raw = response.json()
        data = data_raw.get('data', data_raw) if isinstance(data_raw, dict) else data_raw
        assert isinstance(data, list)

    def test_department_analytics(self, client, sample_student):
        response = client.get("/api/v1/faculty/analytics/departments")
        assert response.status_code == 200
        data_raw = response.json()
        data = data_raw.get('data', data_raw) if isinstance(data_raw, dict) else data_raw
        assert isinstance(data, list)

class TestAnalyticsRoutes:
    def test_analytics_kpis(self, client, sample_student):
        response = client.get("/api/v1/analytics/dean/kpis")
        assert response.status_code == 200
        data_raw = response.json()
        data = data_raw.get('data', data_raw) if isinstance(data_raw, dict) else data_raw
        assert "total_students" in data

    def test_yearly_graduation(self, client, sample_student):
        response = client.get("/api/v1/analytics/dean/yearly-graduation")
        assert response.status_code == 200
        data_raw = response.json()
        data = data_raw.get('data', data_raw) if isinstance(data_raw, dict) else data_raw
        assert isinstance(data, list)

class TestReportsRoutes:
    def test_csv_export(self, client, sample_student):
        response = client.get("/api/v1/reports/interventions/csv")
        assert response.status_code == 200
        assert "text/csv" in response.headers.get("content-type", "")

class TestAttendanceRoutes:
    def test_attendance_weekly(self, client, sample_student):
        response = client.get("/api/v1/attendance/weekly")
        assert response.status_code == 200

    def test_attendance_grid(self, client, sample_student):
        response = client.get("/api/v1/attendance/grid")
        assert response.status_code == 200
