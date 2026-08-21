import asyncio
import httpx
import websockets
import json

BASE_URL = "http://localhost:8000/api/v1"
WS_URL = "ws://localhost:8000/api/v1/ws"

async def main():
    async with httpx.AsyncClient() as client:
        # 1. Login as Student
        resp = await client.post(
            f"{BASE_URL}/auth/login",
            data={"username": "student@gmail.com", "password": "password123"}
        )
        student_token = resp.json()["access_token"]
        
        # 2. Login as Faculty
        resp = await client.post(
            f"{BASE_URL}/auth/login",
            data={"username": "faculty@gmail.com", "password": "password123"}
        )
        faculty_token = resp.json()["access_token"]
        
        # 3. Create/Get Conversation
        headers = {"Authorization": f"Bearer {student_token}"}
        resp = await client.post(
            f"{BASE_URL}/messages/conversations",
            json={"faculty_id": 3},
            headers=headers
        )
        conv_id = resp.json()["id"]
        print(f"Conversation ID: {conv_id}")

        # 4. Connect WebSockets
        student_ws_url = f"{WS_URL}/messages/{conv_id}?token={student_token}"
        faculty_ws_url = f"{WS_URL}/messages/{conv_id}?token={faculty_token}"
        
        print("Connecting WebSockets...")
        async with websockets.connect(student_ws_url) as student_ws, \
                   websockets.connect(faculty_ws_url) as faculty_ws:
            
            print("Both WebSockets connected.")
            
            # 5. Student sends message via REST
            print("Student sending message via REST...")
            resp = await client.post(
                f"{BASE_URL}/messages/conversations/{conv_id}/messages",
                json={"content": "Hello via REST!"},
                headers={"Authorization": f"Bearer {student_token}"}
            )
            sent_msg = resp.json()
            print(f"REST Response Message ID: {sent_msg['id']}")
            
            # 6. Wait for WS events
            print("Waiting for WS events...")
            student_event = await asyncio.wait_for(student_ws.recv(), timeout=2.0)
            faculty_event = await asyncio.wait_for(faculty_ws.recv(), timeout=2.0)
            
            s_evt = json.loads(student_event)
            f_evt = json.loads(faculty_event)
            
            assert s_evt["type"] == "new_message"
            assert f_evt["type"] == "new_message"
            assert s_evt["data"]["id"] == sent_msg["id"]
            assert f_evt["data"]["id"] == sent_msg["id"]
            
            print("\u2705 WebSocket delivery SUCCESSFUL!")
            print(f"Student WS received message: {s_evt['data']['content']}")
            print(f"Faculty WS received message: {f_evt['data']['content']}")

if __name__ == "__main__":
    asyncio.run(main())
