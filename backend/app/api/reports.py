from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.auth.roles import require_dean, require_faculty
from app.models.student import Student
from app.models.intervention import Intervention
import pandas as pd
import io
from fpdf import FPDF
from datetime import datetime

router = APIRouter(prefix="/reports", tags=["Reports"])

def get_intervention_dataframe(db: Session):
    interventions = db.query(Intervention).all()
    data = []
    for i in interventions:
        data.append({
            "ID": i.id,
            "Student ID": i.student_id,
            "Faculty ID": i.faculty_id,
            "Type": i.type,
            "Status": i.status,
            "Priority": i.priority,
            "Start Date": i.start_date.isoformat() if i.start_date else None,
            "Due Date": i.due_date.isoformat() if i.due_date else None,
            "Completed At": i.completed_at.isoformat() if i.completed_at else None,
            "Pre Risk": i.pre_intervention_risk,
            "Post Risk": i.post_intervention_risk,
        })
    return pd.DataFrame(data)

@router.get("/interventions/csv")
def export_interventions_csv(db: Session = Depends(get_db), current_user = Depends(require_dean)):
    df = get_intervention_dataframe(db)
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=interventions_report.csv"
    return response

@router.get("/interventions/excel")
def export_interventions_excel(db: Session = Depends(get_db), current_user = Depends(require_dean)):
    df = get_intervention_dataframe(db)
    stream = io.BytesIO()
    with pd.ExcelWriter(stream, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name="Interventions")
    response = StreamingResponse(iter([stream.getvalue()]), media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    response.headers["Content-Disposition"] = "attachment; filename=interventions_report.xlsx"
    return response

@router.get("/interventions/pdf")
def export_interventions_pdf(db: Session = Depends(get_db), current_user = Depends(require_dean)):
    df = get_intervention_dataframe(db)
    
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="Interventions Report", ln=1, align='C')
    pdf.cell(200, 10, txt=f"Generated on {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}", ln=1, align='C')
    pdf.ln(10)
    
    pdf.set_font("Arial", size=10)
    
    # Adding a basic table representation
    if not df.empty:
        # Simplistic approach to keep within bounds, only adding a few columns
        cols = ["ID", "Student ID", "Type", "Status", "Pre Risk", "Post Risk"]
        for col in cols:
            pdf.cell(30, 10, str(col), border=1)
        pdf.ln()
        
        for index, row in df.iterrows():
            for col in cols:
                pdf.cell(30, 10, str(row[col])[:15], border=1)
            pdf.ln()
    else:
        pdf.cell(200, 10, txt="No interventions found.", ln=1)

    # Use bytearray instead of a file
    pdf_bytes = pdf.output(dest='S').encode('latin-1')
    stream = io.BytesIO(pdf_bytes)
    
    response = StreamingResponse(iter([stream.getvalue()]), media_type="application/pdf")
    response.headers["Content-Disposition"] = "attachment; filename=interventions_report.pdf"
    return response
