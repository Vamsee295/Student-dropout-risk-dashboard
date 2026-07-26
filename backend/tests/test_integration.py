"""
Frontend-Backend Integration Tests.

Verifies that the API responses match the expected data shapes.
"""

import pytest

class TestAuthIntegration:
    def test_login_response_matches_frontend_schema(self, client, sample_user):
        response = client.post("/api/v1/auth/login", data={
            "username": "alice@test.edu",
            "password": "testpass123",
        })
        assert response.status_code == 200
        data_raw = response.json()
        data = data_raw.get('data', data_raw) if isinstance(data_raw, dict) else data_raw

        assert isinstance(data["access_token"], str)
        assert data["token_type"] == "bearer"
        assert isinstance(data["user_id"], int)
        assert data["role"] in ("STUDENT", "FACULTY", "DEAN", "ADMIN")

class TestFacultyIntegration:
    def test_overview_response_shape(self, client, sample_user):
        response = client.get(f"/api/v1/faculty/{sample_user.id}/overview")
        assert response.status_code == 200
        data_raw = response.json()
        data = data_raw.get('data', data_raw) if isinstance(data_raw, dict) else data_raw

        assert isinstance(data["total_students"], int)
        assert isinstance(data["high_risk_count"], int)
        assert isinstance(data["average_risk"], (int, float))
        
        rd = data["risk_distribution"]
        assert isinstance(rd, dict)
        valid_keys = {"High Risk", "Moderate Risk", "Stable", "Safe"}
        assert set(rd.keys()).issubset(valid_keys)

    def test_department_analytics_shape(self, client, sample_user):
        response = client.get("/api/v1/faculty/analytics/departments")
        assert response.status_code == 200
        data_raw = response.json()
        data = data_raw.get('data', data_raw) if isinstance(data_raw, dict) else data_raw

        assert isinstance(data, list)
        if data:
            dept = data[0]
            assert "department" in dept
            assert "student_count" in dept
            assert "avg_risk" in dept

    def test_student_list_shape(self, client, sample_user):
        response = client.get("/api/v1/faculty/students")
        assert response.status_code == 200
        data_raw = response.json()
        data = data_raw.get('data', data_raw) if isinstance(data_raw, dict) else data_raw

        assert isinstance(data, list)
        if data:
            item = data[0]
            assert "id" in item
            assert "name" in item

class TestStudentIntegration:
    def test_student_risk_shape(self, client, sample_student):
        response = client.get(f"/api/v1/risk/{sample_student.id}")
        assert response.status_code == 200
        data_raw = response.json()
        data = data_raw.get('data', data_raw) if isinstance(data_raw, dict) else data_raw

        assert "risk_score" in data
        assert "risk_level" in data
        assert "risk_trend" in data
        assert "risk_factors" in data

class TestDeanAnalyticsIntegration:
    def test_analytics_kpis_shape(self, client):
        response = client.get("/api/v1/analytics/dean/kpis")
        assert response.status_code == 200
        data_raw = response.json()
        data = data_raw.get('data', data_raw) if isinstance(data_raw, dict) else data_raw
        
        assert "total_students" in data
        assert "active_interventions" in data
        assert "average_attendance" in data

    def test_yearly_graduation_shape(self, client):
        response = client.get("/api/v1/analytics/dean/yearly-graduation")
        assert response.status_code == 200
        data_raw = response.json()
        data = data_raw.get('data', data_raw) if isinstance(data_raw, dict) else data_raw
        
        assert isinstance(data, list)
        if data:
            item = data[0]
            assert "year" in item
            assert "graduation_rate" in item
            assert "dropout_rate" in item

class TestInterventionsIntegration:
    def test_get_interventions_shape(self, client):
        response = client.get("/api/v1/interventions/")
        assert response.status_code == 200
        data_raw = response.json()
        data = data_raw.get('data', data_raw) if isinstance(data_raw, dict) else data_raw
        
        assert isinstance(data, list)
        if data:
            item = data[0]
            assert "id" in item
            assert "student_id" in item
            assert "type" in item
            assert "status" in item

class TestAttendanceIntegration:
    def test_attendance_weekly_shape(self, client):
        response = client.get("/api/v1/attendance/weekly")
        assert response.status_code == 200
        data_raw = response.json()
        data = data_raw.get('data', data_raw) if isinstance(data_raw, dict) else data_raw
        
        assert isinstance(data, list)
        if data:
            assert "week" in data[0]
            assert "rate" in data[0]
