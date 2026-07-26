import os
import joblib
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from app.ml.preprocessing import DataPreprocessor, split_data
from app.ml.feature_engineering import generate_features
from app.ml.evaluation import evaluate_model

# Adjust as needed depending on where the script is run from
MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")

def generate_synthetic_data(n_samples=1000):
    """
    Generates synthetic student data for training.
    Target variable: dropout_risk (1 for high risk, 0 for low risk)
    """
    np.random.seed(42)
    data = {
        "attendance_percentage": np.random.uniform(40, 100, n_samples),
        "cgpa": np.random.uniform(4.0, 10.0, n_samples),
        "previous_semester_cgpa": np.random.uniform(4.0, 10.0, n_samples),
        "lms_login_frequency": np.random.randint(0, 30, n_samples),
        "total_assignments": np.full(n_samples, 10),
        "assignments_completed": np.random.randint(0, 11, n_samples),
        "department": np.random.choice(["CSE", "ECE", "MECH", "IT"], n_samples)
    }
    df = pd.DataFrame(data)
    
    # Calculate a synthetic target variable based on some logical rules
    # If attendance < 65 or cgpa < 6.0 or assignment_completion < 50%, higher risk
    risk_prob = np.zeros(n_samples)
    risk_prob += np.where(df["attendance_percentage"] < 65, 0.4, 0)
    risk_prob += np.where(df["cgpa"] < 6.0, 0.3, 0)
    risk_prob += np.where(df["assignments_completed"] < 5, 0.3, 0)
    
    # Add some noise
    risk_prob += np.random.normal(0, 0.1, n_samples)
    
    df["dropout_risk"] = (risk_prob > 0.5).astype(int)
    return df

def train_models(df: pd.DataFrame = None, version_tag: str = None):
    if df is None:
        print("Generating synthetic data...")
        df = generate_synthetic_data()
    
    print("Applying feature engineering...")
    df = generate_features(df)
    
    # Define columns
    target_col = "dropout_risk"
    categorical_cols = ["department"]
    numerical_cols = [col for col in df.columns if col not in categorical_cols + [target_col]]
    
    print("Splitting data...")
    X_train, X_test, y_train, y_test = split_data(df, target_col=target_col)
    
    print("Preprocessing data...")
    preprocessor = DataPreprocessor(categorical_cols=categorical_cols, numerical_cols=numerical_cols)
    
    # We must fit preprocessor on training data, then transform both
    # However, DataPreprocessor in our implementation handles X directly.
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)
    
    if not version_tag:
        import time
        version_tag = f"v{int(time.time() * 1000)}"
        
    preprocessor.save(MODELS_DIR, version_tag)
    
    print("Training models...")
    models = {
        "LogisticRegression": LogisticRegression(random_state=42, max_iter=1000),
        "RandomForest": RandomForestClassifier(random_state=42, n_estimators=100)
    }
    
    best_model_name = None
    best_f1 = -1
    best_model = None
    best_metrics = None
    
    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train_processed, y_train)
        metrics = evaluate_model(model, X_test_processed, y_test, name, MODELS_DIR)
        
        print(f"{name} metrics: {metrics}")
        
        if metrics["f1_score"] > best_f1:
            best_f1 = metrics["f1_score"]
            best_model_name = name
            best_model = model
            best_metrics = metrics
            
    print(f"Best model is {best_model_name} with F1: {best_f1:.4f}")
    
    # Save the best model with version tag
    model_filename = f"model_{version_tag}.joblib"
    model_path = os.path.join(MODELS_DIR, model_filename)
    joblib.dump(best_model, model_path)
    
    # Also save the name of the best model and features
    metadata = {
        "version": version_tag,
        "best_model": best_model_name,
        "features": preprocessor.get_feature_names()
    }
    with open(os.path.join(MODELS_DIR, f"metadata_{version_tag}.json"), "w") as f:
        import json
        json.dump(metadata, f, indent=4)
        
    print(f"Training pipeline complete. Best model saved as {model_filename}")
    
    # Calculate feature means for drift detection
    feature_means = df[numerical_cols].mean().to_dict()
    
    # Extract feature importance if available
    feature_importance = {}
    if hasattr(best_model, "feature_importances_"):
        importance_vals = best_model.feature_importances_
        for idx, col in enumerate(preprocessor.get_feature_names()):
            if idx < len(importance_vals):
                feature_importance[col] = float(importance_vals[idx])
                
    # If no feature importance, try coef_
    elif hasattr(best_model, "coef_"):
        coef_vals = best_model.coef_[0]
        for idx, col in enumerate(preprocessor.get_feature_names()):
            if idx < len(coef_vals):
                feature_importance[col] = float(abs(coef_vals[idx]))
                
    return {
        "version": version_tag,
        "model_path": model_path,
        "metrics": {
            "accuracy": float(best_metrics["accuracy"]),
            "precision": float(best_metrics["precision"]),
            "recall": float(best_metrics["recall"]),
            "f1_score": float(best_metrics["f1_score"])
        },
        "feature_importance": feature_importance,
        "feature_means": feature_means,
        "training_samples": len(df)
    }

if __name__ == "__main__":
    train_models()
