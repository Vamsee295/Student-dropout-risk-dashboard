"""
Test configuration and shared fixtures.

Uses SQLite in-memory for fast, isolated tests with no MySQL dependency.
"""

import os

os.environ["DATABASE_URL"] = "sqlite:///./test.db"

import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.models import (
    Student, StudentMetric, RiskScore, RiskHistory,
    Intervention, ModelVersion, User,
    Department, Section, RiskLevel, RiskTrend,
    InterventionType, InterventionStatus, Role,
)

SQLITE_URL = "sqlite:///./test.db"

engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})

@event.listens_for(engine, "connect")
def _set_sqlite_pragma(dbapi_conn, _):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def _patch_app_db(monkeypatch):
    """Patch the app-level engine and SessionLocal so FastAPI routes use test DB."""
    import app.database as db_module
    monkeypatch.setattr(db_module, "engine", engine)
    monkeypatch.setattr(db_module, "SessionLocal", TestingSessionLocal)


@pytest.fixture(scope="function")
def db():
    """Provide a clean database session for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """Provide a FastAPI TestClient wired to the test DB."""
    from fastapi.testclient import TestClient
    from app.main import app

    def _override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def sample_model_version(db):
    """Insert a minimal ModelVersion row and return it."""
    mv = ModelVersion(
        version="test_v1",
        model_path="tests/fake_model.pkl",
        accuracy=0.90,
        precision=0.88,
        recall=0.85,
        f1_score=0.86,
        training_samples=1000,
        feature_importance={"attendance_rate": 0.3, "engagement_score": 0.2},
        is_active=True,
    )
    db.add(mv)
    db.commit()
    db.refresh(mv)
    return mv


@pytest.fixture
def sample_student(db, sample_model_version):
    """Insert a complete student with metrics and risk score."""
    student = Student(
        id="ST0001",
        name="Alice Johnson",
        avatar="AJ",
        course="B.Tech Computer Science",
        department=Department.CSE,
        section=Section.A,
        advisor_id="FAC001",
    )
    db.add(student)
    db.flush()

    metric = StudentMetric(
        student_id="ST0001",
        attendance_rate=82.5,
        engagement_score=71.0,
        academic_performance_index=7.8,
        login_gap_days=2,
        failure_ratio=0.05,
        financial_risk_flag=False,
        commute_risk_score=1,
        semester_performance_trend=0.5,
    )
    db.add(metric)

    risk = RiskScore(
        student_id="ST0001",
        risk_score=35.2,
        risk_level=RiskLevel.SAFE,
        risk_trend=RiskTrend.STABLE,
        risk_value="Stable",
        model_version_id=sample_model_version.id,
        shap_explanation={
            "top_factors": [
                {"feature": "Attendance Rate", "impact": 0.15, "direction": "negative"},
                {"feature": "Engagement Score", "impact": 0.10, "direction": "positive"},
            ]
        },
    )
    db.add(risk)
    db.commit()
    db.refresh(student)
    return student


@pytest.fixture
def sample_user(db, sample_student):
    """Insert a test user linked to the sample student."""
    from app.security import get_password_hash

    user = User(
        email="alice@test.edu",
        password_hash=get_password_hash("testpass123"),
        name="Alice Johnson",
        role=Role.STUDENT,
        student_id="ST0001",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def faculty_user(db):
    """Insert a faculty user."""
    from app.security import get_password_hash

    user = User(
        email="faculty@test.edu",
        password_hash=get_password_hash("testpass123"),
        name="Dr. Smith",
        role=Role.FACULTY,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
