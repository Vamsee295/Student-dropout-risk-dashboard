# Model Documentation

This document describes the Artificial Intelligence subsystem powering the EduRisk platform.

## 1. Objective
To predict the likelihood of a student dropping out or failing significantly, allowing the university to intervene proactively.

## 2. Model Selection
We evaluated multiple classifiers (Logistic Regression, SVM, Gradient Boosting) and selected a **Random Forest Classifier**.
**Why Random Forest?**
- **Robustness**: Handles non-linear relationships and outliers well.
- **Explainability**: Easy to extract feature importance and integrate with SHAP (SHapley Additive exPlanations).
- **Performance**: High accuracy with minimal tuning required on our synthetic academic dataset.

## 3. Feature Engineering
The model expects a 20-dimensional feature vector per student. Key features include:
- `cgpa` (Float: 0.0 - 4.0)
- `attendance_rate` (Float: 0.0 - 100.0)
- `credits_completed` (Integer)
- `lms_login_frequency` (Integer: Logins per week)
- `late_assignments` (Integer)
- `financial_aid_status` (Categorical/Boolean)

## 4. Evaluation Metrics
Based on the synthetic dataset generated in Phase 4:
- **Accuracy**: ~89%
- **Precision (At-Risk class)**: ~85%
- **Recall (At-Risk class)**: ~91% 

*Note: Recall is prioritized over precision. It is better to flag a "false positive" at-risk student and offer them help than to miss a "false negative" who subsequently drops out.*

## 5. Explainable AI (XAI)
A risk score alone is not actionable. EduRisk integrates the `shap` library to calculate the marginal contribution of each feature to the final prediction. 
The API returns these as `risk_factors` (e.g., "Attendance rate is critically low (-15% impact on score)").

## 6. MLOps Lifecycle
The system includes built-in endpoints for model retraining (`/api/v1/model/retrain`). When triggered, the system:
1. Pulls the latest historic data from the MySQL database.
2. Re-trains the Random Forest model.
3. Evaluates the new model against a holdout test set.
4. If accuracy improves, the model is serialized via `joblib` and hot-swapped into the running FastAPI application with zero downtime.
