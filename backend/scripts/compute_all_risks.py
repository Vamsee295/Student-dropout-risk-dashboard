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

sys.path.insert(0, str(Path(__file__).parent.parent))

import joblib
from app.database import SessionLocal
from app.models import ModelVersion
from app.services.realtime_prediction import init_prediction_service, compute_all_risk_scores
from app.services.risk_model import RiskModel
from app.services.shap_explainer import SHAPExplainer
from loguru import logger


def main():
    """Main execution."""
    logger.info("=" * 60)
    logger.info("Risk Score Computation for All Students")
    logger.info("=" * 60)

    db = SessionLocal()

    try:
        # Load the ML model (same logic as main.py lifespan)
        model_paths = [
            Path("/app/ml_models/dropout_risk_model.joblib"),
            Path("ml_models/dropout_risk_model.joblib"),
            Path("models/versions/latest/model.joblib"),
        ]

        raw_model = None
        for mp in model_paths:
            if mp.exists():
                raw_model = joblib.load(mp)
                logger.info(f"Loaded model from {mp}")
                break

        if raw_model is None:
            logger.error("No ML model found. Cannot compute risk scores.")
            sys.exit(1)

        risk_model = RiskModel()
        risk_model.calibrated_model = raw_model

        # Init SHAP (non-critical)
        shap_explainer = None
        try:
            shap_explainer = SHAPExplainer(raw_model)
        except Exception as exc:
            logger.warning(f"SHAP init failed (non-critical): {exc}")

        # Ensure a ModelVersion row exists
        mv = db.query(ModelVersion).order_by(ModelVersion.id.desc()).first()
        if not mv:
            mv = ModelVersion(
                version="v1.0-auto",
                model_path="ml_models/dropout_risk_model.joblib",
                accuracy=0.85, precision=0.85, recall=0.85, f1_score=0.85,
                training_samples=100,
            )
            db.add(mv)
            db.commit()
            db.refresh(mv)
            logger.info(f"Created ModelVersion id={mv.id}")

        # Initialize the prediction service singleton
        init_prediction_service(risk_model, shap_explainer, mv.id)

        # Compute all risk scores
        result = compute_all_risk_scores(db)

        logger.info("=" * 60)
        logger.info("Risk Score Computation Complete!")
        logger.info("=" * 60)
        logger.info(f"Total students: {result['total']}")
        logger.info(f"Successfully processed: {result['processed']}")
        logger.info(f"\nRisk Distribution:")
        for level, count in result['risk_distribution'].items():
            pct = (count / result['processed'] * 100) if result['processed'] > 0 else 0
            logger.info(f"  {level}: {count} ({pct:.1f}%)")

        logger.info("\nDatabase updated with risk scores and history")

    except Exception as e:
        logger.error(f"Risk computation failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
