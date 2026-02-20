"""
Standalone batch risk computation script.
Loads the latest trained model, initializes the prediction service,
and computes risk scores for all students.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import SessionLocal
from app.services.risk_model import RiskModel
from app.services.shap_explainer import SHAPExplainer
from app.services.realtime_prediction import init_prediction_service, compute_all_risk_scores
from app.config import get_settings
from loguru import logger

def main():
    settings = get_settings()
    models_dir = Path(settings.models_dir)

    # Find latest model
    pkl_files = sorted(models_dir.glob("*.pkl"), key=lambda f: f.stat().st_mtime, reverse=True)
    if not pkl_files:
        logger.error(f"No model files found in {models_dir}")
        sys.exit(1)

    latest_model_path = pkl_files[0]
    logger.info(f"Loading model: {latest_model_path}")

    # Load model
    risk_model = RiskModel()
    risk_model.load(str(latest_model_path))

    # Init SHAP explainer
    shap_explainer = SHAPExplainer(risk_model.calibrated_model)

    # Initialize prediction service singleton
    init_prediction_service(risk_model, shap_explainer, model_version_id=1)

    db = SessionLocal()
    try:
        logger.info("=" * 60)
        logger.info("Computing risk scores for all students...")
        result = compute_all_risk_scores(db)
        logger.info("=" * 60)
        logger.info(f"Total students: {result['total']}")
        logger.info(f"Processed:      {result['processed']}")
        logger.info("Risk Distribution:")
        for level, count in result['risk_distribution'].items():
            pct = (count / result['processed'] * 100) if result['processed'] > 0 else 0
            logger.info(f"  {level}: {count} ({pct:.1f}%)")
        logger.info("✓ Done! Dashboard will now reflect updated risk scores.")
    except Exception as e:
        logger.error(f"Batch risk computation failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
