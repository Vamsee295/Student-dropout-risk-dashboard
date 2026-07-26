from app.events.dispatcher import dispatcher
from app.ml.predict import predict_risk
from app.services.notification_service import notification_service
from app.websocket.manager import manager
from app.database.session import SessionLocal
import logging
import asyncio

logger = logging.getLogger(__name__)

async def handle_attendance_updated(payload: dict):
    """
    Triggered when attendance is updated.
    Payload expected: {"student_id": "123", "new_attendance_percentage": 65.5, ...}
    """
    student_id = payload.get("student_id")
    logger.info(f"Handling attendance update for student {student_id}")
    
    # 1. We would normally fetch the full student record from DB here to pass to ML
    # For now, we simulate the DB fetch with the payload itself merged with some defaults
    student_data = {
        "student_id": student_id,
        "attendance_percentage": payload.get("new_attendance_percentage", 75.0),
        "cgpa": 7.5,
        "previous_semester_cgpa": 7.5,
        "lms_login_frequency": 10,
        "total_assignments": 10,
        "assignments_completed": 8,
        "department": "CSE"
    }

    # 2. Run Prediction
    try:
        prediction = predict_risk(student_data)
        logger.info(f"Risk prediction completed for {student_id}: {prediction['riskLevel']}")
        
        # Dispatch risk completed event to handle caching/notifications
        # Since we are in a background task, we can call it directly or dispatch
        await handle_risk_prediction_completed(prediction)
    except Exception as e:
        logger.error(f"Failed to run prediction after attendance update: {str(e)}")
        # Here we could queue for retry

async def handle_risk_prediction_completed(prediction: dict):
    student_id = prediction["studentId"]
    risk_level = prediction["riskLevel"]
    
    # 1. Invalidate Cache
    from app.core.cache import cache
    cache.invalidate_prefix(f"dashboard_student_{student_id}")
    cache.invalidate_prefix("dashboard_dean") # invalidate aggregate stats
    
    # 2. Broadcast via WebSockets
    await manager.broadcast(f"student_{student_id}", {
        "event": "RiskPredictionCompleted",
        "data": prediction
    })
    
    # 3. Generate Notification if risk is High
    if risk_level == "High":
        db = SessionLocal()
        try:
            await notification_service.create_and_broadcast(
                db=db,
                user_id=student_id,
                title="High Dropout Risk Alert",
                message="Your recent academic activity indicates a high risk. Please review recommendations.",
                type="RISK_ALERT"
            )
        finally:
            db.close()

# Register handlers
dispatcher.subscribe("AttendanceUpdated", handle_attendance_updated)
dispatcher.subscribe("RiskPredictionCompleted", handle_risk_prediction_completed)
