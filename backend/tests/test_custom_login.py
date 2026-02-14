import pytest
from httpx import AsyncClient
from app.main import app
from app.database import SessionLocal
from app.models import User, Role
from app.security import get_password_hash

@pytest.mark.asyncio
async def test_custom_user_login():
    # 1. Create a custom user in the DB
    db = SessionLocal()
    custom_email = "custom_test_user@example.com"
    custom_password = "securepassword123"
    
    # Clean up existing if needed
    existing = db.query(User).filter(User.email == custom_email).first()
    if existing:
        db.delete(existing)
        db.commit()

    user = User(
        email=custom_email,
        password_hash=get_password_hash(custom_password),
        name="Custom Test User",
        role=Role.STUDENT
    )
    db.add(user)
    db.commit()
    db.close()

    # 2. Try to login via API
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/auth/token", data={
            "username": custom_email,
            "password": custom_password
        })
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == "STUDENT"
    print("\nCustom user login successful!")
