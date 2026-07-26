from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix, roc_curve
import json
import os

def evaluate_model(model, X_test, y_test, model_name: str, save_dir: str):
    """
    Evaluates the model and returns metrics. Also saves the report as JSON.
    """
    y_pred = model.predict(X_test)
    
    # Handle proba for ROC-AUC
    if hasattr(model, "predict_proba"):
        y_prob = model.predict_proba(X_test)[:, 1]
        roc_auc = roc_auc_score(y_test, y_prob)
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        roc_curve_data = {"fpr": fpr.tolist(), "tpr": tpr.tolist()}
    else:
        roc_auc = None
        roc_curve_data = None

    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "f1_score": float(f1_score(y_test, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc) if roc_auc is not None else None
    }
    
    cm = confusion_matrix(y_test, y_pred)
    metrics["confusion_matrix"] = cm.tolist()
    
    if roc_curve_data:
        metrics["roc_curve"] = roc_curve_data

    # Save to disk
    os.makedirs(save_dir, exist_ok=True)
    report_path = os.path.join(save_dir, f"{model_name}_evaluation.json")
    with open(report_path, "w") as f:
        json.dump(metrics, f, indent=4)
        
    return metrics
