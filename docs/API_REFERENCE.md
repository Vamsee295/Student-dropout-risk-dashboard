# API Reference

All backend communication in EduRisk occurs over a REST API documented automatically by FastAPI.
To view the interactive Swagger UI, start the backend and navigate to `http://localhost:8000/docs`.

Below is a summary of the core modules.

## Authentication (`/api/v1/auth`)
- **POST `/login`**: Accepts `OAuth2PasswordRequestForm` (username, password). Returns a JWT access token and refresh token.
- **POST `/refresh`**: Accepts a valid refresh token. Returns a new access token.
- **POST `/logout`**: Revokes the current refresh token.

## Students (`/api/v1/students`)
- **GET `/me`**: Returns profile data for the authenticated student.
- **GET `/{student_id}`**: (Faculty/Dean only) Returns specific student profile.
- **GET `/{student_id}/history`**: Returns academic and attendance history.

## Risk Prediction (`/api/v1/risk`)
- **GET `/student/{student_id}`**: Retrieves the latest AI risk score, historical trend, and SHAP-based risk factors.
- **POST `/predict/{student_id}`**: Triggers an immediate recalculation of the student's risk using the Random Forest model.

## Interventions (`/api/v1/interventions`)
- **POST `/`**: (Faculty only) Logs a new intervention for a student.
- **GET `/student/{student_id}`**: Lists all interventions for a student.
- **PATCH `/{intervention_id}`**: Updates the status of an intervention (e.g., from `Pending` to `Completed`).

## Analytics (`/api/v1/analytics`)
- **GET `/dean/overview`**: (Dean only) Returns university-wide metrics (total students, critical risk counts, department breakdown).
- **GET `/faculty/overview`**: (Faculty only) Returns metrics specifically for the faculty's assigned students.

## WebSockets (`/api/v1/ws`)
- **WS `/{token}`**: Establishes a real-time bi-directional connection. The server pushes immediate JSON payloads for:
  - High-risk alerts.
  - New interventions assigned.
  - System announcements.

## System Health (`/health`, `/ready`, `/live`)
- **GET `/health`**: Returns detailed system health, including database connectivity, ML model availability, and uptime.
