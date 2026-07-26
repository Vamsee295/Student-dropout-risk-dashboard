from locust import HttpUser, task, between

class StudentDashboardUser(HttpUser):
    wait_time = between(1, 5)
    
    def on_start(self):
        # In a real scenario, this would authenticate and store a token
        response = self.client.post("/api/v1/auth/login", data={
            "username": "student@university.edu",
            "password": "password123!"
        })
        if response.status_code == 200:
            self.token = response.json()["data"]["access_token"]
        else:
            self.token = ""

    @task(3)
    def view_dashboard(self):
        self.client.get("/api/v1/students/dashboard", headers={"Authorization": f"Bearer {self.token}"})
        
    @task(1)
    def view_system_status(self):
        # Usually faculty/dean, but just testing load
        self.client.get("/api/v1/system/status")

class FacultyUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        response = self.client.post("/api/v1/auth/login", data={
            "username": "faculty@university.edu",
            "password": "password123!"
        })
        if response.status_code == 200:
            self.token = response.json()["data"]["access_token"]
        else:
            self.token = ""

    @task(5)
    def view_students(self):
        self.client.get("/api/v1/students", headers={"Authorization": f"Bearer {self.token}"})

    @task(2)
    def predict_risk(self):
        payload = {
            "student_id": "TEST001",
            "attendance_percentage": 75.0,
            "cgpa": 7.5,
            "previous_semester_cgpa": 7.8,
            "lms_login_frequency": 3,
            "total_assignments": 10,
            "assignments_completed": 8,
            "department": "Computer Science (CSE)"
        }
        self.client.post("/api/v1/risk/predict", json=payload, headers={"Authorization": f"Bearer {self.token}"})
