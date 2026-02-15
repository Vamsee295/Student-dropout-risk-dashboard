"""
Script to compute risk scores for all students.

Run this after:
1. Database initialization (init_db.py)
2. Data loading (load_custom_dataset.py)
3. Model training (train_model.py)

This will populate the risk_scores and risk_history tables.
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import SessionLocal
from app.services.realtime_prediction import compute_all_risk_scores
from loguru import logger


def main():
    """Main execution."""
    logger.info("=" * 60)
    logger.info("Risk Score Computation for All Students")
    logger.info("=" * 60)
    
    db = SessionLocal()
    
    try:
        # Compute all risk scores
        result = compute_all_risk_scores(db)
        
        logger.info("=" * 60)
        logger.info("✓ Risk Score Computation Complete!")
        logger.info("=" * 60)
        logger.info(f"Total students: {result['total']}")
        logger.info(f"Successfully processed: {result['processed']}")
        logger.info(f"\nRisk Distribution:")
        for level, count in result['risk_distribution'].items():
            pct = (count / result['processed'] * 100) if result['processed'] > 0 else 0
            logger.info(f"  {level}: {count} ({pct:.1f}%)")
        
        logger.info("\n✓ Database updated with risk scores and history")
        logger.info("You can now start the API server and view results on the dashboard!")
        
    except Exception as e:
        logger.error(f"Risk computation failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
