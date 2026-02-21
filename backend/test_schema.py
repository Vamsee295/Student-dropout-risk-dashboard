import urllib.request, json

csv_path = "/app/data/refined_sample.csv"
with open(csv_path, "rb") as f:
    csv_data = f.read()

boundary = "b123"
body = b"--b123\r\n"
body += b'Content-Disposition: form-data; name="file"; filename="test.csv"\r\n'
body += b"Content-Type: text/csv\r\n\r\n"
body += csv_data
body += b"\r\n--b123--\r\n"

req = urllib.request.Request(
    "http://localhost:8000/api/analysis/import",
    data=body,
    headers={"Content-Type": "multipart/form-data; boundary=b123"},
    method="POST",
)
resp = urllib.request.urlopen(req)
lines = resp.read().decode().strip().split("\n")
for line in lines:
    obj = json.loads(line)
    if obj.get("type") == "done":
        ov = obj["overview"]
        print(f'Total: {ov["total_students"]} | High Risk: {ov["high_risk_count"]}')
        print(f'Avg Risk: {ov["average_risk_score"]} | Avg Attendance: {ov["average_attendance"]}')
        print(f'Distribution: {ov["risk_distribution"]}')
        print()
        for s in obj["students"]:
            print(f'  {s["name"]:20s} dept={s["department"]:5s} risk={s["riskScore"]:5.1f} level={s["riskLevel"]}')
