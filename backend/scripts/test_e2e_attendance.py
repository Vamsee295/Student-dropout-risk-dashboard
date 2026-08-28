import requests
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def login(email, password):
    r = requests.post(f"{BASE_URL}/auth/login", data={"username": email, "password": password})
    r.raise_for_status()
    return r.json()["access_token"]

def main():
    print("1. Logging in as Faculty (faculty@test.com)...")
    fac_token = login("faculty@test.com", "passwords")
    fac_headers = {"Authorization": f"Bearer {fac_token}"}
    
    print("2. Fetching sessions for CS101...")
    r = requests.get(f"{BASE_URL}/attendance/faculty/sessions?course_id=CS101", headers=fac_headers)
    r.raise_for_status()
    sessions = r.json()
    if not sessions:
        print("No sessions found for CS101!")
        return
    
    # Pick the first pending session, or just any session if all completed
    pending = [s for s in sessions if s['status'] == 'PENDING']
    session = pending[0] if pending else sessions[0]
    session_id = session['id']
    
    print(f"3. Posting attendance for Session {session_id} ({session['session_label']}). Marking STU123 as ABSENT...")
    r = requests.post(
        f"{BASE_URL}/attendance/faculty/sessions/{session_id}/post", 
        json={"absent_student_ids": ["STU123"]},
        headers=fac_headers
    )
    r.raise_for_status()
    print("   Post response:", r.json())
    
    # Optional delay to let WebSocket events flush (though API is sync)
    time.sleep(1)
    
    print("4. Logging in as Student STU123 (student@gmail.com)...")
    stu_token = login("student@gmail.com", "passwords")
    stu_headers = {"Authorization": f"Bearer {stu_token}"}
    
    print("5. Fetching student attendance summary...")
    r = requests.get(f"{BASE_URL}/attendance/student", headers=stu_headers)
    r.raise_for_status()
    summary = r.json()
    
    print(f"   Overall Percentage: {summary['overall_percentage']}%")
    for subj in summary['subjects']:
        if subj['course_id'] == 'CS101':
            print(f"   CS101 Attendance: {subj['percentage']}% ({subj['present']}/{subj['total']})")
    
    print("✅ E2E Verification Complete!")

if __name__ == "__main__":
    main()
