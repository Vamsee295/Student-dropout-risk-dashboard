from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.student import Student
from app.models.intervention import Intervention

class AnalyticsService:
    def get_dean_kpis(self, db: Session):
        total_students = db.query(Student).count()
        
        # In a real scenario, risk would be queried from the latest predictions
        # For simulation, we just pull dummy averages or count interventions
        total_interventions = db.query(Intervention).count()
        completed_interventions = db.query(Intervention).filter(Intervention.status == "Completed").count()
        
        intervention_success_rate = 0
        if total_interventions > 0:
            intervention_success_rate = round((completed_interventions / total_interventions) * 100, 1)

        return {
            "totalStudents": total_students,
            "averageAttendance": 78.5, # Placeholder, would join attendance table
            "averageCgpa": 7.4,       # Placeholder, would join grades table
            "highRiskStudents": 42,   # Placeholder
            "predictionAccuracy": 93.0,
            "interventionSuccessRate": intervention_success_rate
        }

analytics_service = AnalyticsService()
