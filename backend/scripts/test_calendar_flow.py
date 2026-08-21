import requests
import time
import sys

BASE_URL = "http://localhost:8000/api/v1"

# We assume standard demo users
DEMO_FACULTY = {"email": "faculty@demo.com", "password": "password"}
DEMO_STUDENT = {"email": "student@demo.com", "password": "password"}

def login(credentials):
    res = requests.post(
        f"{BASE_URL}/auth/login",
        data={"username": credentials["email"], "password": credentials["password"]}
    )
    if res.status_code != 200:
        print(f"Failed to login {credentials['email']}: {res.text}")
        sys.exit(1)
    return res.json()["access_token"]

def main():
    print("Testing Calendar API Flow...")
    
    # 1. Login
    faculty_token = login(DEMO_FACULTY)
    student_token = login(DEMO_STUDENT)
    
    fac_headers = {"Authorization": f"Bearer {faculty_token}"}
    stu_headers = {"Authorization": f"Bearer {student_token}"}

    # 2. Student tries to create an event (Should Fail - 403)
    res = requests.post(
        f"{BASE_URL}/calendar",
        headers=stu_headers,
        json={
            "title": "Hacker Meeting",
            "event_type": "meeting",
            "date": "2024-12-31"
        }
    )
    assert res.status_code == 403, "Student should not be able to create events"
    print("✅ Student create event blocked (Security check passed)")

    # 3. Faculty creates an event
    new_event = {
        "title": "Demo Class Session",
        "description": "API Test",
        "event_type": "class",
        "date": "2024-11-20",
        "start_time": "10:00:00",
        "end_time": "11:00:00"
    }
    res = requests.post(f"{BASE_URL}/calendar", headers=fac_headers, json=new_event)
    assert res.status_code == 200, f"Failed to create event: {res.text}"
    event_id = res.json()["id"]
    print(f"✅ Faculty created event {event_id}")

    # 4. Faculty gets events
    res = requests.get(f"{BASE_URL}/calendar", headers=fac_headers)
    events = res.json()
    assert any(e["id"] == event_id for e in events), "Created event not in faculty's list"
    print("✅ Faculty can see created event")

    # 5. Student gets events
    res = requests.get(f"{BASE_URL}/calendar", headers=stu_headers)
    stu_events = res.json()
    # Since course_id is None, student might not see it, or might see it depending on our filtering logic.
    # We filtered student events by enrolled courses + holidays/career_events. 
    # Since this is a "class" event with no course_id, it shouldn't show up.
    assert not any(e["id"] == event_id for e in stu_events), "Student should not see untied class event"
    print("✅ Student does not see untied class event")

    # 6. Faculty updates event to be a 'holiday'
    res = requests.put(
        f"{BASE_URL}/calendar/{event_id}",
        headers=fac_headers,
        json={"event_type": "holiday"}
    )
    assert res.status_code == 200
    print("✅ Faculty updated event")

    # 7. Student checks again
    res = requests.get(f"{BASE_URL}/calendar", headers=stu_headers)
    stu_events = res.json()
    assert any(e["id"] == event_id for e in stu_events), "Student should see holiday event"
    print("✅ Student can see global holiday event")

    # 8. Faculty deletes event
    res = requests.delete(f"{BASE_URL}/calendar/{event_id}", headers=fac_headers)
    assert res.status_code == 200
    print("✅ Faculty deleted event")

    print("🎉 All Calendar CRUD and Role checks passed!")

if __name__ == "__main__":
    main()
