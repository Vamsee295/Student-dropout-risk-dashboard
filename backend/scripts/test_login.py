import requests

API_URL = "http://localhost:8000/api/auth"

def test_login(email, password, role_name):
    print(f"\n--- Testing Login: {role_name} ({email}) ---")
    try:
        response = requests.post(
            f"{API_URL}/login",
            data={"username": email, "password": password}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("Login SUCCESS!")
            print(f"Token: {data['access_token'][:20]}...")
            print(f"Role: {data['role']}")
            
            if data['role'] != role_name:
                print(f"WARNING: Expected role {role_name}, got {data['role']}")
            
            return data['access_token']
        else:
            print(f"Login FAILED: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"Request failed: {e}")
        return None

def test_student_data(token, student_id):
    print(f"\n--- Testing Student Data Access ({student_id}) ---")
    try:
        response = requests.get(
            f"http://localhost:8000/api/students/{student_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            print("Access SUCCESS!")
            print(f"Student Data: {response.json().get('name')}")
        else:
            print(f"Access FAILED: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    # Test Faculty Login
    faculty_token = test_login("faculty1@gmail.com", "password", "FACULTY")
    
    # Test Student Login
    student_token = test_login("student1@gmail.com", "password", "STUDENT")
    
    if student_token:
        # Assuming student1 IS LINKED to a student profile.
        # But wait, seed_users.py tried to link to first student or dummy.
        # Let's check /me to see student_id
        me_response = requests.get(f"{API_URL}/me", headers={"Authorization": f"Bearer {student_token}"})
        if me_response.status_code == 200:
            user_data = me_response.json()
            print(f"\nUser Profile: {user_data}")
            if user_data.get('student_id'):
                test_student_data(student_token, user_data['student_id'])
            else:
                print("No student_id linked to student user.")
