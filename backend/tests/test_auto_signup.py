import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import get_db
from app.models import User, Student

@pytest.mark.asyncio
async def test_auto_signup_login(db):
    app.dependency_overrides[get_db] = lambda: db

    try:
        # 1. Use a new email containing 'student' to trigger student auto-provisioning
        new_email = "brand_new_student_user@example.com"
        new_password = "password123"
        
        # Ensure it doesn't exist
        existing = db.query(User).filter(User.email == new_email).first()
        if existing:
            if existing.student_id:
                db.query(Student).filter(Student.id == existing.student_id).delete()
            db.delete(existing)
            db.commit()

        # 2. Try to login via API (should trigger auto-signup)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post("/api/auth/login", data={
                "username": new_email,
                "password": new_password
            })
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["role"] == "STUDENT"
        
        # 3. Verify user and student profile created in DB
        user = db.query(User).filter(User.email == new_email).first()
        assert user is not None
        assert user.student_id is not None
        
        student = db.query(Student).filter(Student.id == user.student_id).first()
        assert student is not None
        assert "Student" in student.name or "Brand" in student.name
    finally:
        app.dependency_overrides.clear()
