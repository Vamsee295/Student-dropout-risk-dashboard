from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.auth.security import get_current_user
from app.auth.roles import require_faculty
from app.services.intervention_service import intervention_service
from app.schemas.intervention import InterventionCreate, InterventionUpdateStatus, InterventionResponse
from app.core.responses import create_success_response

router = APIRouter(prefix="/interventions", tags=["Interventions"])

@router.post("/")
def assign_intervention(request: InterventionCreate, db: Session = Depends(get_db), current_user = Depends(require_faculty)):
    interv = intervention_service.create_intervention(db, request, current_user.id)
    return create_success_response("Intervention assigned successfully", {"id": interv.id, "status": interv.status})

@router.get("/")
def get_my_interventions(db: Session = Depends(get_db), current_user = Depends(require_faculty)):
    intervs = intervention_service.get_faculty_interventions(db, current_user.id)
    return create_success_response("Interventions retrieved", [
        {
            "id": i.id,
            "studentId": i.student_id,
            "studentName": i.student.name if i.student else "Unknown",
            "type": i.type,
            "priority": i.priority,
            "status": i.status,
            "notes": i.notes,
            "date": i.created_at.isoformat() if i.created_at else None,
            "dueDate": i.due_date.isoformat() if i.due_date else None,
            "expectedOutcome": i.outcome_notes,
        } for i in intervs
    ])

@router.put("/{intervention_id}/status")
def update_intervention_status(intervention_id: int, request: InterventionUpdateStatus, db: Session = Depends(get_db), current_user = Depends(require_faculty)):
    interv = intervention_service.update_status(db, intervention_id, current_user.id, request)
    return create_success_response("Intervention updated", {
        "id": interv.id, 
        "status": interv.status, 
        "post_intervention_risk": interv.post_intervention_risk
    })
