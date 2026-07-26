import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database.session import get_db
from app.models import User, Role
from app.auth.security import get_password_hash

@pytest.mark.asyncio
async def test_custom_user_login(db):
    app.dependency_overrides[get_db] = lambda: db

    try:
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

        # 2. Try to login via API
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post("/api/v1/auth/login", data={
                "username": custom_email,
                "password": custom_password
            })
        
        assert response.status_code == 200
        data_raw = response.json()
        data = data_raw.get('data', data_raw) if isinstance(data_raw, dict) else data_raw
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["role"] == "STUDENT"
    finally:
        app.dependency_overrides.clear()
