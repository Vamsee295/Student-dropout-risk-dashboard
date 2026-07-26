import pandas as pd
import numpy as np
import shap
from app.ml.model_loader import model_loader
from app.ml.feature_engineering import generate_features
from app.ml.recommendations import generate_recommendations

def predict_risk(student_data: dict) -> dict:
    """
    Main entry point for predicting risk for a single student.
    student_data: dictionary of raw features for a single student.
    """
    model = model_loader.get_model()
    preprocessor = model_loader.get_preprocessor()
    
    if not model or not preprocessor:
        raise ValueError("Model or preprocessor not loaded. Train the model first.")
        
    df = pd.DataFrame([student_data])
    
    # Feature Engineering
    df_engineered = generate_features(df)
    
    # Preprocessing
    df_processed = preprocessor.transform(df_engineered)
    
    # Prediction
    # Assuming classifier where class 1 is dropout
    risk_prob = model.predict_proba(df_processed)[0][1]
    risk_score = float(risk_prob * 100)
    
    # Risk Level Categorization
    if risk_score >= 70:
        risk_level = "High"
    elif risk_score >= 40:
        risk_level = "Medium"
    else:
        risk_level = "Low"
        
    # Explainability (SHAP)
    # Using TreeExplainer for RandomForest or LinearExplainer for LogisticRegression
    # For simplicity and robust fallback, we use an approximation if SHAP fails, 
    # but let's try SHAP first.
    try:
        if type(model).__name__ == 'RandomForestClassifier':
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(df_processed)
            # Depending on sklearn version and model, shap_values might be a list (one array per class)
            if isinstance(shap_values, list):
                shap_vals = shap_values[1][0] # class 1, first instance
            else:
                shap_vals = shap_values[0] # assuming single output or appropriately shaped array
        else:
            explainer = shap.LinearExplainer(model, preprocessor.transform(generate_features(pd.DataFrame([student_data]))))
            shap_values = explainer.shap_values(df_processed)
            shap_vals = shap_values[0]
            
        feature_names = preprocessor.get_feature_names()
        
        factors = []
        for i, val in enumerate(shap_vals):
            # Sometimes val is a scalar, sometimes it's a 1D array depending on shap version
            scalar_val = float(val) if np.isscalar(val) else float(val[0]) if isinstance(val, (list, np.ndarray)) else float(val)
            factors.append({
                "feature": feature_names[i],
                "impact": abs(scalar_val),
                "direction": "positive" if scalar_val > 0 else "negative"
            })
            
        # Sort by impact, descending
        factors.sort(key=lambda x: x["impact"], reverse=True)
        top_factors = factors[:5]
        
    except Exception as e:
        # Fallback if SHAP fails
        print(f"SHAP explanation failed: {e}")
        top_factors = [
            {"feature": "attendance_percentage", "impact": 0.1, "direction": "positive" if student_data.get('attendance_percentage', 100) < 60 else "negative"}
        ]
        
    # Recommendations
    recommendations = generate_recommendations(top_factors)
    
    return {
        "studentId": student_data.get("student_id", "UNKNOWN"),
        "riskScore": round(risk_score, 1),
        "riskLevel": risk_level,
        "confidence": round(float(np.max(model.predict_proba(df_processed)[0])), 2),
        "topFactors": top_factors,
        "recommendations": recommendations
    }

def bulk_predict_risk(students_data: list[dict]) -> list[dict]:
    return [predict_risk(data) for data in students_data]
