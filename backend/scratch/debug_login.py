import sys
sys.path.append(r"X:\Project-Buildings\Student-dropout-risk-dashboard\backend")
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

response = client.post(
    "/api/v1/auth/login",
    data={"username": "faculty@test.com", "password": "passwords"}
)
print("Status:", response.status_code)
print("Body:", response.json())
