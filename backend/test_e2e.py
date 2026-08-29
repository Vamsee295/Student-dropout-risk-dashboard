import requests
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def login(email, password):
    res = requests.post(f"{BASE_URL}/auth/login", data={"username": email, "password": password})
    res.raise_for_status()
    return res.json()["access_token"]

def main():
    print("--- E2E Integration Test ---")
    
    print("1. Logging in as Faculty (faculty@test.com)")
    fac_token = login("faculty@test.com", "passwords")
    fac_headers = {"Authorization": f"Bearer {fac_token}"}
    
    print("2. Logging in as Student (student@gmail.com)")
    stu_token = login("student@gmail.com", "passwords")
    stu_headers = {"Authorization": f"Bearer {stu_token}"}
    
    # Get user profile for student
    res = requests.get(f"{BASE_URL}/auth/me", headers=stu_headers)
    student_id = res.json()["student_id"]
    print(f"Student ID: {student_id}")
    
    print("3. Fetching Initial Risk Score")
    res = requests.get(f"{BASE_URL}/risk/{student_id}", headers=fac_headers)
    risk_data = res.json()["data"]
    print(f"Initial Risk: {risk_data['risk_level']} ({risk_data['risk_score']}%)")
    
    print("4. Faculty marks student absent for a session")
    # Mark absent to increase risk
    res = requests.post(
        f"{BASE_URL}/attendance/", 
        json={
            "course_id": "CS101",
            "date": "2024-03-10",
            "session_type": "LECTURE",
            "records": [{"student_id": student_id, "status": "ABSENT"}]
        },
        headers=fac_headers
    )
    
    print("5. Triggering Risk Engine Update")
    # Since background jobs are disabled/not running in test, we just call the compute command directly
    import os
    os.system('python -c "from app.database.session import SessionLocal; from app.services.realtime_prediction import compute_all_risk_scores, init_prediction_service; from app.services.risk_model import RiskModel; from app.services.shap_explainer import SHAPExplainer; import pandas as pd; import numpy as np; db = SessionLocal(); risk_model = RiskModel(); X = pd.DataFrame({\'attendance_rate\': np.random.uniform(40,100,10), \'engagement_score\': np.random.uniform(40,100,10), \'academic_performance_index\': np.random.uniform(40,100,10), \'login_gap_days\': np.random.uniform(0,30,10), \'failure_ratio\': np.random.uniform(0,1,10), \'financial_risk_flag\': np.random.randint(0,2,10), \'commute_risk_score\': np.random.randint(1,5,10), \'semester_performance_trend\': np.random.uniform(-10,10,10)}); y = pd.Series(np.random.randint(0,2,10)); risk_model.train(X, y); shap_explainer = SHAPExplainer(risk_model); init_prediction_service(risk_model, shap_explainer, 1); print(compute_all_risk_scores(db)); db.close()"')
    
    print("6. Fetching Updated Risk Score")
    res = requests.get(f"{BASE_URL}/risk/{student_id}", headers=fac_headers)
    updated_risk_data = res.json()["data"]
    print(f"Updated Risk: {updated_risk_data['risk_level']} ({updated_risk_data['risk_score']}%)")
    
    if updated_risk_data['risk_score'] > risk_data['risk_score']:
        print("SUCCESS: Risk score increased due to absence.")
    else:
        print("FAILED: Risk score did not respond to absence.")
        
    print("--- Test Complete ---")

if __name__ == "__main__":
    main()
