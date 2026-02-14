import sys
import os
import traceback

# Add current directory to path
sys.path.append(os.getcwd())

try:
    from app.database import init_db
    print("Attempting to initialize database...")
    init_db()
    print("Database initialized successfully!")
except Exception:
    with open("debug_error.log", "w") as f:
        f.write("Database initialization FAILED:\n")
        traceback.print_exc(file=f)
