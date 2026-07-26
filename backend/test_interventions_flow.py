import asyncio
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database.session import SessionLocal, engine
from app.models.student import Student
from app.models.user import User
from app.models.enums import Role, Department, Section
from app.models.intervention import Intervention
from app.models.audit import AuditLog
from app.services.intervention_service import InterventionService
from app.schemas.intervention import InterventionCreate, InterventionUpdateStatus
from datetime import datetime, timezone

async def test_flow():
    db = SessionLocal()
    
    # 1. Setup mock data
    db.execute(select(Student).where(Student.id == "STU123")).scalars().first() and db.execute(Student.__table__.delete().where(Student.id == "STU123"))
    db.execute(select(User).where(User.email == "faculty@test.com")).scalars().first() and db.execute(User.__table__.delete().where(User.email == "faculty@test.com"))
    db.commit()
    
    student = Student(
        id="STU123", name="John Doe", course="B.Tech", 
        department=Department.CSE, section=Section.A, created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc)
    )
    faculty = User(
        email="faculty@test.com", password_hash="hash", name="Jane Faculty",
        role=Role.FACULTY, is_active=True
    )
    db.add(student)
    db.add(faculty)
    db.commit()
    db.refresh(student)
    db.refresh(faculty)
    
    from app.services.intervention_service import intervention_service as service
    
    # 2. Create Intervention
    create_schema = InterventionCreate(
        student_id=student.id,
        type="Academic Counseling",
        priority="High",
        notes="Student missed 3 tests."
    )
    
    intervention = service.create_intervention(db, create_schema, str(faculty.id))
    print(f"Created intervention: {intervention.id} with status {intervention.status}")
    
    # 3. Update Intervention Status
    update_schema = InterventionUpdateStatus(
        status="In Progress",
        outcome_notes="Scheduled a meeting for tomorrow."
    )
    updated = service.update_status(db, intervention.id, str(faculty.id), update_schema)
    print(f"Updated intervention status to: {updated.status}")
    
    # 4. Record Outcome
    outcome_schema = InterventionUpdateStatus(
        status="Completed",
        outcome_notes="Student attended and agreed to a study plan."
    )
    completed = service.update_status(db, intervention.id, str(faculty.id), outcome_schema)
    print(f"Completed intervention. Pre-risk: {completed.pre_intervention_risk}, Post-risk: {completed.post_intervention_risk}")
    
    # 5. Check Audit Logs
    logs = db.execute(select(AuditLog).where(AuditLog.entity_type == "Intervention")).scalars().all()
    print(f"Found {len(logs)} audit logs.")
    for log in logs:
        print(f"  - Action: {log.action}, User: {log.user_id}, Details: {log.details}")
        
    db.close()

if __name__ == "__main__":
    asyncio.run(test_flow())
