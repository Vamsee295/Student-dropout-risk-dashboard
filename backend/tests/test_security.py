"""Tests for the security module (JWT, password hashing)."""

from app.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from app.config import get_settings
from jose import jwt
from datetime import timedelta


class TestPasswordHashing:
    def test_hash_and_verify(self):
        password = "mysecurepassword"
        hashed = get_password_hash(password)

        assert hashed != password
        assert verify_password(password, hashed)

    def test_wrong_password_rejected(self):
        hashed = get_password_hash("correct_password")
        assert not verify_password("wrong_password", hashed)

    def test_different_hashes_for_same_password(self):
        h1 = get_password_hash("same_password")
        h2 = get_password_hash("same_password")
        assert h1 != h2  # salt should differ


class TestJWTTokens:
    def test_create_token_contains_subject(self):
        token = create_access_token(data={"sub": "user@test.com", "role": "STUDENT"})
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        assert payload["sub"] == "user@test.com"
        assert payload["role"] == "STUDENT"
        assert "exp" in payload

    def test_custom_expiry(self):
        token = create_access_token(
            data={"sub": "user@test.com"},
            expires_delta=timedelta(minutes=5),
        )
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert "exp" in payload

    def test_settings_are_used(self):
        settings = get_settings()
        assert SECRET_KEY == settings.secret_key
        assert ALGORITHM == settings.algorithm
        assert ACCESS_TOKEN_EXPIRE_MINUTES == settings.access_token_expire_minutes
