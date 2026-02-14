import pytest
from httpx import AsyncClient
from app.main import app
from app.database import SessionLocal
from app.models import User, Student

@pytest.mark.asyncio
async def test_auto_signup_login():
    # 1. Use a completely new email
    new_email = "brand_new_user@example.com"
    new_password = "password123"
    
    # Ensure it doesn't exist
    db = SessionLocal()
    existing = db.query(User).filter(User.email == new_email).first()
    if existing:
        # Delete related student data first due to FKs
        if existing.student_id:
            db.query(Student).filter(Student.id == existing.student_id).delete()
        db.delete(existing)
        db.commit()
    db.close()

    # 2. Try to login via API (should trigger auto-signup)
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/auth/token", data={
            "username": new_email,
            "password": new_password
        })
    
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Body: {response.json()}")

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "STUDENT" # Should default to student
    
    # 3. Verify user and student profile created in DB
    db = SessionLocal()
    user = db.query(User).filter(User.email == new_email).first()
    assert user is not None
    assert user.student_id is not None
    
    student = db.query(Student).filter(Student.id == user.student_id).first()
    assert student is not None
    assert student.name == "Brand_New_User"
    
    db.close()
    print("\nAuto-signup verification successful!")
