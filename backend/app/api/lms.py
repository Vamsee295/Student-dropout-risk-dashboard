from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.session import get_db
from app.auth.security import get_current_user
from app.models.user import User
from app.models.enums import Role
from app.models.academic import Course, Enrollment
from app.models.lms import (
    CourseMaterial, RecordedClass, VideoProgress, 
    CourseDiscussion, CourseDiscussionReply
)
from pydantic import BaseModel

router = APIRouter(prefix="/lms", tags=["LMS Core"])

# --- Schemas ---

class CreateMaterialBody(BaseModel):
    title: str
    description: Optional[str] = None
    file_url: str
    material_type: str = "document"
    unit: Optional[str] = None

class CreateRecordingBody(BaseModel):
    title: str
    description: Optional[str] = None
    video_url: str
    duration_minutes: int
    recording_date: Optional[str] = None

class VideoProgressBody(BaseModel):
    progress_percent: float
    completed: bool

class CreateDiscussionBody(BaseModel):
    title: str
    content: str

class ReplyDiscussionBody(BaseModel):
    content: str

class ThreadModerationBody(BaseModel):
    is_pinned: Optional[bool] = None
    is_locked: Optional[bool] = None


# --- Helpers ---

def _verify_course_access(course_id: str, current_user: User, db: Session):
    """Verify user can access this course."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if current_user.role == Role.STUDENT:
        enr = db.query(Enrollment).filter(
            Enrollment.course_id == course_id,
            Enrollment.student_id == current_user.student_id
        ).first()
        if not enr:
            raise HTTPException(status_code=403, detail="Not enrolled in this course")
    elif current_user.role not in [Role.FACULTY, Role.DEAN, Role.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return course

def _verify_faculty(current_user: User):
    if current_user.role not in [Role.FACULTY, Role.DEAN, Role.ADMIN]:
        raise HTTPException(status_code=403, detail="Faculty authorization required")

# --- Lecture Notes ---

@router.get("/courses/{course_id}/materials")
def get_materials(course_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _verify_course_access(course_id, current_user, db)
    materials = db.query(CourseMaterial).filter(CourseMaterial.course_id == course_id).order_by(CourseMaterial.created_at.asc()).all()
    
    return [
        {
            "id": m.id,
            "title": m.title,
            "description": m.description,
            "file_url": m.file_url,
            "material_type": m.material_type,
            "unit": m.unit,
            "created_at": m.created_at.isoformat()
        } for m in materials
    ]

@router.post("/courses/{course_id}/materials", status_code=status.HTTP_201_CREATED)
def create_material(course_id: str, body: CreateMaterialBody, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _verify_faculty(current_user)
    _verify_course_access(course_id, current_user, db)
    
    material = CourseMaterial(
        course_id=course_id,
        title=body.title,
        description=body.description,
        file_url=body.file_url,
        material_type=body.material_type,
        unit=body.unit,
        uploaded_by=current_user.id
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return {"message": "Material created successfully", "id": material.id}

@router.delete("/courses/{course_id}/materials/{material_id}")
def delete_material(course_id: str, material_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _verify_faculty(current_user)
    material = db.query(CourseMaterial).filter(CourseMaterial.id == material_id, CourseMaterial.course_id == course_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    db.delete(material)
    db.commit()
    return {"message": "Material deleted"}

# --- Recorded Classes ---

@router.get("/courses/{course_id}/recordings")
def get_recordings(course_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _verify_course_access(course_id, current_user, db)
    recordings = db.query(RecordedClass).filter(RecordedClass.course_id == course_id).order_by(RecordedClass.recording_date.asc()).all()
    
    result = []
    for r in recordings:
        progress_pct = 0.0
        completed = False
        if current_user.role == Role.STUDENT:
            prog = db.query(VideoProgress).filter(
                VideoProgress.recording_id == r.id, 
                VideoProgress.student_id == current_user.student_id
            ).first()
            if prog:
                progress_pct = prog.progress_percent
                completed = prog.completed
                
        result.append({
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "video_url": r.video_url,
            "duration_minutes": r.duration_minutes,
            "recording_date": r.recording_date.isoformat(),
            "progress_percent": progress_pct,
            "completed": completed
        })
    return result

@router.post("/courses/{course_id}/recordings", status_code=status.HTTP_201_CREATED)
def create_recording(course_id: str, body: CreateRecordingBody, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _verify_faculty(current_user)
    _verify_course_access(course_id, current_user, db)
    
    r_date = datetime.fromisoformat(body.recording_date.replace('Z', '+00:00')) if body.recording_date else datetime.now(timezone.utc)
    
    recording = RecordedClass(
        course_id=course_id,
        title=body.title,
        description=body.description,
        video_url=body.video_url,
        duration_minutes=body.duration_minutes,
        recording_date=r_date,
        created_by=current_user.id
    )
    db.add(recording)
    db.commit()
    db.refresh(recording)
    return {"message": "Recording added", "id": recording.id}

@router.post("/recordings/{recording_id}/progress")
def update_progress(recording_id: int, body: VideoProgressBody, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != Role.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can track progress")
        
    prog = db.query(VideoProgress).filter(
        VideoProgress.recording_id == recording_id, 
        VideoProgress.student_id == current_user.student_id
    ).first()
    
    if prog:
        prog.progress_percent = body.progress_percent
        prog.completed = body.completed
        prog.last_watched_at = datetime.now(timezone.utc)
    else:
        prog = VideoProgress(
            student_id=current_user.student_id,
            recording_id=recording_id,
            progress_percent=body.progress_percent,
            completed=body.completed
        )
        db.add(prog)
    db.commit()
    return {"message": "Progress updated"}

# --- Discussion ---

@router.get("/courses/{course_id}/discussions")
def get_discussions(course_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _verify_course_access(course_id, current_user, db)
    threads = db.query(CourseDiscussion).filter(CourseDiscussion.course_id == course_id).order_by(CourseDiscussion.is_pinned.desc(), CourseDiscussion.created_at.desc()).all()
    
    result = []
    for t in threads:
        reply_count = db.query(func.count(CourseDiscussionReply.id)).filter(CourseDiscussionReply.discussion_id == t.id).scalar()
        result.append({
            "id": t.id,
            "title": t.title,
            "content": t.content,
            "is_pinned": t.is_pinned,
            "is_locked": t.is_locked,
            "created_at": t.created_at.isoformat(),
            "author_name": t.user.name,
            "author_role": t.user.role.value,
            "reply_count": reply_count
        })
    return result

@router.post("/courses/{course_id}/discussions", status_code=status.HTTP_201_CREATED)
def create_discussion(course_id: str, body: CreateDiscussionBody, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _verify_course_access(course_id, current_user, db)
    
    thread = CourseDiscussion(
        course_id=course_id,
        user_id=current_user.id,
        title=body.title,
        content=body.content
    )
    db.add(thread)
    db.commit()
    db.refresh(thread)
    return {"message": "Discussion created", "id": thread.id}

@router.get("/discussions/{discussion_id}/replies")
def get_discussion_replies(discussion_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    thread = db.query(CourseDiscussion).filter(CourseDiscussion.id == discussion_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    _verify_course_access(thread.course_id, current_user, db)
    
    replies = db.query(CourseDiscussionReply).filter(CourseDiscussionReply.discussion_id == discussion_id).order_by(CourseDiscussionReply.created_at.asc()).all()
    return [
        {
            "id": r.id,
            "content": r.content,
            "is_faculty_answer": r.is_faculty_answer,
            "created_at": r.created_at.isoformat(),
            "author_name": r.user.name,
            "author_role": r.user.role.value
        } for r in replies
    ]

@router.post("/discussions/{discussion_id}/replies", status_code=status.HTTP_201_CREATED)
def create_reply(discussion_id: int, body: ReplyDiscussionBody, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    thread = db.query(CourseDiscussion).filter(CourseDiscussion.id == discussion_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Discussion not found")
    if thread.is_locked:
        raise HTTPException(status_code=403, detail="This discussion is locked")
        
    _verify_course_access(thread.course_id, current_user, db)
    
    is_faculty = current_user.role in [Role.FACULTY, Role.DEAN, Role.ADMIN]
    
    reply = CourseDiscussionReply(
        discussion_id=discussion_id,
        user_id=current_user.id,
        content=body.content,
        is_faculty_answer=is_faculty
    )
    db.add(reply)
    db.commit()
    return {"message": "Reply posted"}

@router.patch("/discussions/{discussion_id}")
def moderate_discussion(discussion_id: int, body: ThreadModerationBody, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _verify_faculty(current_user)
    
    thread = db.query(CourseDiscussion).filter(CourseDiscussion.id == discussion_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Discussion not found")
        
    _verify_course_access(thread.course_id, current_user, db)
    
    if body.is_pinned is not None:
        thread.is_pinned = body.is_pinned
    if body.is_locked is not None:
        thread.is_locked = body.is_locked
        
    db.commit()
    return {"message": "Discussion updated"}

# --- Marks & Rubric ---

@router.get("/student/{student_id}/courses/{course_id}/marks")
def get_student_course_marks(student_id: str, course_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.records import StudentAssessment
    from app.models.academic import Assessment
    from app.models.enums import SubmissionStatus
    
    if current_user.role == Role.STUDENT and current_user.student_id != student_id:
        raise HTTPException(status_code=403, detail="Can only view own marks")
    _verify_course_access(course_id, current_user, db)
    
    rows = (
        db.query(StudentAssessment, Assessment)
        .join(Assessment, StudentAssessment.assessment_id == Assessment.id)
        .filter(StudentAssessment.student_id == student_id, Assessment.course_id == course_id)
        .all()
    )
    
    result = []
    total_obtained = 0.0
    total_max = 0.0
    
    for sa, assess in rows:
        graded = sa.status == SubmissionStatus.GRADED
        if graded and sa.obtained_marks is not None:
            total_obtained += sa.obtained_marks
            total_max += assess.total_marks
            
        result.append({
            "id": assess.id,
            "title": assess.title,
            "type": assess.type.value,
            "status": sa.status.value if sa.status else "Pending",
            "total_marks": assess.total_marks,
            "obtained_marks": sa.obtained_marks,
            "graded_at": sa.graded_at.isoformat() if sa.graded_at else None,
            "rubric": {
                "writing": sa.writing_marks,
                "understanding": sa.understanding_marks,
                "learning": sa.learning_marks,
                "application": sa.application_marks,
                "knowledge": sa.knowledge_marks
            } if graded else None
        })
        
    overall_percentage = (total_obtained / total_max * 100) if total_max > 0 else 0.0
    
    return {
        "assessments": result,
        "summary": {
            "total_obtained": total_obtained,
            "total_max": total_max,
            "percentage": round(overall_percentage, 1)
        }
    }

