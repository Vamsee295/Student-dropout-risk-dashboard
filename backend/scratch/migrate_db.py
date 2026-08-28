import sys
sys.path.append(r"X:\Project-Buildings\Student-dropout-risk-dashboard\backend")
from app.database.session import engine

with engine.connect() as conn:
    try:
        conn.execute(engine.dialect.statement_compiler(engine.dialect, None).statement(
            "ALTER TABLE attendance_records ADD COLUMN session_id INTEGER REFERENCES attendance_sessions(id) ON DELETE SET NULL"
        ))
    except Exception:
        # Might fail if we need text() wrapper
        from sqlalchemy import text
        try:
            conn.execute(text("ALTER TABLE attendance_records ADD COLUMN session_id INTEGER REFERENCES attendance_sessions(id) ON DELETE SET NULL"))
            conn.commit()
            print("Successfully added session_id column")
        except Exception as e:
            print("Already added or error:", e)
