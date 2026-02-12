"""
Database Initialization Script.

Creates all tables in PostgreSQL database.
Run this before loading data or training models.
"""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import init_db, engine
from app.models import Base
from loguru import logger


def main():
    """Initialize database by creating all tables."""
    logger.info("Initializing database...")
    
    try:
        # Create all tables
        init_db()
        
        # Verify tables were created
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        logger.info(f"Database initialized successfully")
        logger.info(f"Created tables: {tables}")
        
        expected_tables = [
            'students', 'student_metrics', 'risk_scores',
            'risk_history', 'interventions', 'model_versions'
        ]
        
        missing = set(expected_tables) - set(tables)
        if missing:
            logger.warning(f"Missing expected tables: {missing}")
        else:
            logger.info("✓ All expected tables created")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
