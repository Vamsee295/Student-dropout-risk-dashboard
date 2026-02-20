import requests

BASE = "http://localhost:8001/api/faculty"

endpoints = [
    "http://localhost:8001/health",
    f"{BASE}/overview",
    f"{BASE}/students?page=1&page_size=3",
    f"{BASE}/analytics/department",
    f"{BASE}/students/NONEXISTENT_999",
    f"{BASE}/export",
    f"{BASE}/recalculate",
]

for url in endpoints:
    try:
        if "recalculate" in url:
            r = requests.post(url, json={}, timeout=10)
        else:
            r = requests.get(url, timeout=10)
        short = url.replace("http://localhost:8001", "")
        body_preview = r.text[:100].replace("\n", " ")
        print(f"{r.status_code}  {short}")
        if r.status_code not in (200, 201, 404):
            print(f"     ERROR BODY: {body_preview}")
    except Exception as e:
        print(f"ERR  {url}  {e}")
