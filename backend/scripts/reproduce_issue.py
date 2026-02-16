import requests

API_URL = "http://localhost:8000/api/auth"

def test_login(email, password):
    print(f"\n--- Testing Login: {email} ---")
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
            return data
        else:
            print(f"Login FAILED: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"Request failed: {e}")
        return None

if __name__ == "__main__":
    test_login("kvamsee692@gmail.com", "anypassword")
