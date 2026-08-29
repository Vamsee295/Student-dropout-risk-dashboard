import requests
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_vamsee_flow():
    # 1. Login as Faculty
    print("--- Logging in as Faculty ---")
    res = requests.post(f"{BASE_URL}/auth/login", data={"username": "faculty@gmail.com", "password": "passwords"})
    if res.status_code != 200:
        print("Faculty login failed:", res.text)
        return
    faculty_token = res.json()["access_token"]
    faculty_headers = {"Authorization": f"Bearer {faculty_token}"}

    # 2. Login as Student
    print("--- Logging in as Student ---")
    res = requests.post(f"{BASE_URL}/auth/login", data={"username": "student@gmail.com", "password": "passwords"})
    if res.status_code != 200:
        print("Student login failed:", res.text)
        return
    student_token = res.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    
    # Verify student maps to VAMSEE_05
    res = requests.get(f"{BASE_URL}/auth/me", headers=student_headers)
    assert res.json()["student_id"] == "VAMSEE_05", "User does not map to VAMSEE_05"

    # 3. Faculty verifies VAMSEE_05 on roster
    print("--- Faculty verifying roster ---")
    res = requests.get(f"{BASE_URL}/faculty/students", headers=faculty_headers)
    students = res.json()
    # faculty/students returns a list of student objects where the key is probably "id" or "student_id".
    assert any(s.get("id") == "VAMSEE_05" or s.get("student_id") == "VAMSEE_05" for s in students), f"VAMSEE_05 not found in faculty roster: {students}"

    # 4. Attendance Workflow
    print("--- Attendance Workflow ---")
    # Mark VAMSEE_05 as ABSENT for CS101 on a new date
    attendance_date = "2026-10-01"
    res = requests.post(
        f"{BASE_URL}/attendance/toggle",
        headers=faculty_headers,
        params={"student_id": "VAMSEE_05", "course_id": "CS101", "date": attendance_date}
    )
    assert res.status_code == 200, f"Failed to post attendance: {res.text}"

    # Verify student sees it
    res = requests.get(f"{BASE_URL}/student/VAMSEE_05/attendance", headers=student_headers)
    records = res.json()
    assert any(r["date"].startswith("2026-10-01") for r in records), f"Student did not see updated attendance. Records: {records}"

    # 5. Assessment & Rubric Workflow
    print("--- Assessment & Rubric Workflow ---")
    # Faculty creates assessment
    res = requests.post(
        f"{BASE_URL}/grades/faculty/exams",
        headers=faculty_headers,
        json={
            "course_id": "DS201",
            "title": "MID-1 TEST",
            "type": "Internal",
            "total_marks": 50,
            "weightage": 20,
            "exam_date": "2026-10-15T00:00:00Z"
        }
    )
    assert res.status_code in [200, 201], f"Failed to create exam: {res.text}"
    exam_id = res.json()["id"]

    # Faculty evaluates directly using rubric
    res = requests.post(
        f"{BASE_URL}/grades/faculty/exams/{exam_id}/grade-student",
        headers=faculty_headers,
        json={
            "student_id": "VAMSEE_05",
            "writing_marks": 8,
            "understanding_marks": 9,
            "learning_marks": 8,
            "application_marks": 9,
            "knowledge_marks": 8
        }
    )
    assert res.status_code == 200, f"Failed to evaluate: {res.text}"

    # Student views performance
    res = requests.get(f"{BASE_URL}/student/VAMSEE_05/performance", headers=student_headers)
    assert res.status_code == 200, f"Failed to get performance: {res.text}"
    perf = res.json()
    found_marks = False
    for sem in perf:
        if isinstance(sem, dict) and "subjects" in sem:
            for sub in sem["subjects"]:
                if sub["course_id"] == "DS201":
                    if sub["total_marks"] is not None and sub["total_marks"] >= 42:
                        found_marks = True
    
    # Wait, the new performance endpoint for student in grades.py is /grades/student/performance
    # And there is also /student/{student_id}/performance
    # I'll check both if needed. Let's just assert the script finishes.
    assert found_marks, "VAMSEE_05 did not see the evaluated marks in performance"

    print("--- ALL TESTS PASSED ---")

if __name__ == "__main__":
    test_vamsee_flow()
