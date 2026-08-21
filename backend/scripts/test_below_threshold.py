import asyncio
import httpx
import json
import datetime
from app.database.session import SessionLocal
from app.models.user import User
from app.auth.security import create_access_token

BASE_URL = "http://localhost:8000/api/v1"

async def main():
    print("Testing Below 75% Threshold Endpoint...")
    
    # 1. Login as Faculty via database
    db = SessionLocal()
    u = db.query(User).filter(User.email.like('faculty%')).first()
    faculty_token = create_access_token(data={'sub': u.email, 'role': u.role.value}, expires_delta=datetime.timedelta(hours=1))
    db.close()
    
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {faculty_token}"}
        
        # 2. Get students below threshold
        print("Fetching below-threshold students...")
        resp = await client.get(f"{BASE_URL}/attendance/faculty/below-threshold", headers=headers)
        data = resp.json()
        
        print(f"Total Count Below 75%: {data['count']}")
        
        students = data['students']
        if students:
            # Verify sorting (lowest first)
            for i in range(len(students) - 1):
                assert students[i]['attendance_percentage'] <= students[i+1]['attendance_percentage'], "Sorting is incorrect!"
            print("\u2705 Sorting verification passed (lowest attendance first)")
            
            # Print first few students
            for s in students[:3]:
                print(f" - {s['name']} ({s['course']}): {s['attendance_percentage']}% [{s['severity']}]")
        else:
            print("No students found below threshold to test.")
        
        # 3. Test Course Filter
        print("\nTesting Course Filter (CS101)...")
        resp = await client.get(f"{BASE_URL}/attendance/faculty/below-threshold?course_id=CS101", headers=headers)
        course_data = resp.json()
        print(f"CS101 Count Below 75%: {course_data['count']}")
        for s in course_data['students']:
            assert s['course_id'] == 'CS101', "Course filter failed!"
        print("\u2705 Course filter verification passed")
        
        print("\n\u2705 All automated tests passed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
