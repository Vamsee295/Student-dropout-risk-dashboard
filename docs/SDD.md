# Software Design Document (SDD)

## 1. Introduction
This document outlines the architectural decisions and system design for the EduRisk Platform.

## 2. System Architecture
EduRisk utilizes a modern microservice-inspired monolithic architecture:
- **Presentation Layer**: Next.js (React) serving static assets and rendering dynamic client-side dashboards.
- **Application Layer**: FastAPI handling REST requests, WebSockets, rate limiting, and dependency injection.
- **Machine Learning Layer**: Scikit-Learn executing pre-trained `Joblib` models for real-time inference.
- **Data Access Layer**: SQLAlchemy ORM interacting with a relational MySQL database.

## 3. API Design Principles
The backend APIs follow RESTful principles:
- **Versioning**: All endpoints are prefixed with `/api/v1`.
- **Statelessness**: JWTs handle session states; the server retains no session memory.
- **Standardized Responses**: Responses use structured JSON with consistent error envelopes.

## 4. Authentication Flow
1. Client POSTs credentials to `/api/v1/auth/login`.
2. Backend verifies hash via PassLib.
3. Backend issues short-lived `access_token` and long-lived `refresh_token`.
4. Client stores tokens securely and attaches `Authorization: Bearer <token>` to subsequent requests.

## 5. Notification & WebSocket Flow
1. A triggering event occurs (e.g., risk score exceeds 80%).
2. The FastAPI `NotificationService` creates a database record.
3. The `ConnectionManager` pushes a JSON payload via active WebSockets to the relevant user.
4. The React client intercepts the payload and renders a toast notification instantly.

## 6. Prediction Pipeline
1. **Data Collection**: Academic, attendance, and behavioral data is fetched from the DB.
2. **Feature Extraction**: The `FeatureEngineer` class aligns data with the model's expected 20-feature input array.
3. **Inference**: The Random Forest `predict_proba()` method generates the risk score.
4. **Explanation**: The SHAP Explainer identifies the top 3 contributing factors.
5. **Persistence**: Results are saved to the `RiskPrediction` table.
