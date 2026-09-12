#!/usr/bin/env python
"""
Seed Demo Users Script
─────────────────────

Creates three demo users for testing:
- student@gmail.com (Student role)
- faculty@gmail.com (Faculty role) 
- dean@gmail.com (Dean role)

All with password: "Password"

This is for DEVELOPMENT/DEMO only. Before production deployment,
change these credentials to secure random passwords.

Usage:
  python scripts/seed_demo_users.py
"""

import sys
import os

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import SessionLocal
from app.models import User, Role, Student, Department, Section, StudentMetric, RiskScore, RiskLevel, RiskTrend, ModelVersion
from app.security import get_password_hash
from loguru import logger

def seed_demo_users():
    db = SessionLocal()
    try:
        logger.info("Creating demo users...")
        
        # Demo credentials
        DEMO_PASSWORD = "Password"
        
        demo_users = [
            {
                "email": "student@gmail.com",
                "name": "Student User",
                "role": Role.STUDENT,
                "student_id": "ST0001"
            },
            {
                "email": "faculty@gmail.com",
                "name": "Faculty User",
                "role": Role.FACULTY,
                "student_id": None
            },
            {
                "email": "dean@gmail.com",
                "name": "Dean User",
                "role": Role.DEAN,
                "student_id": None
            },
        ]
        
        # Also add the numbered versions (faculty1, student1, dean1) for backwards compatibility
        demo_users.extend([
            {
                "email": "student1@gmail.com",
                "name": "Student One",
                "role": Role.STUDENT,
                "student_id": "ST0002"
            },
            {
                "email": "faculty1@gmail.com",
                "name": "Faculty One",
                "role": Role.FACULTY,
                "student_id": None
            },
            {
                "email": "dean1@gmail.com",
                "name": "Dean One",
                "role": Role.DEAN,
                "student_id": None
            },
        ])
        
        for user_config in demo_users:
            # Check if user already exists
            existing = db.query(User).filter(User.email == user_config["email"]).first()
            if existing:
                logger.warning(f"User {user_config['email']} already exists. Skipping...")
                continue
            
            # For student users, create Student profile if needed
            if user_config["role"] == Role.STUDENT and user_config["student_id"]:
                student_profile = db.query(Student).filter(Student.id == user_config["student_id"]).first()
                if not student_profile:
                    student_profile = Student(
                        id=user_config["student_id"],
                        name=user_config["name"],
                        avatar=user_config["name"][:2].upper(),
                        course="B.Tech Computer Science",
                        department=Department.CSE,
                        section=Section.A,
                        advisor_id="FAC001"
                    )
                    db.add(student_profile)
                    db.flush()
                    logger.info(f"Created Student profile: {user_config['student_id']}")
                    
                    # Create default metrics
                    metrics = StudentMetric(
                        student_id=user_config["student_id"],
                        attendance_rate=85.0,
                        engagement_score=75.0,
                        academic_performance_index=7.5,
                        login_gap_days=0,
                        failure_ratio=0.0,
                        financial_risk_flag=False,
                        commute_risk_score=1,
                        semester_performance_trend=0.0
                    )
                    db.add(metrics)
                    
                    # Ensure model version exists
                    model_v = db.query(ModelVersion).filter(ModelVersion.is_active == True).first()
                    if not model_v:
                        model_v = ModelVersion(
                            version="v1.0-demo",
                            model_path="models/demo",
                            is_active=True,
                            accuracy=0.85,
                            precision=0.85,
                            recall=0.85,
                            f1_score=0.85,
                            training_samples=100,
                            feature_importance={}
                        )
                        db.add(model_v)
                        db.flush()
                    
                    # Create default risk score
                    risk = RiskScore(
                        student_id=user_config["student_id"],
                        risk_score=15.0,
                        risk_level=RiskLevel.SAFE,
                        risk_trend=RiskTrend.STABLE,
                        risk_value="15% (New)",
                        model_version_id=model_v.id,
                        shap_explanation={"top_factors": []}
                    )
                    db.add(risk)
            
            # Create user
            user = User(
                email=user_config["email"],
                password_hash=get_password_hash(DEMO_PASSWORD),
                name=user_config["name"],
                role=user_config["role"],
                student_id=user_config["student_id"],
                is_active=True
            )
            db.add(user)
            logger.info(f"Created user: {user_config['email']} ({user_config['role'].value})")
        
        db.commit()
        logger.success("Demo users seeded successfully!")
        logger.warning("⚠️  BEFORE DEPLOYMENT: Change these credentials to secure random passwords!")
        
    except Exception as e:
        logger.error(f"Seeding failed: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_users()
