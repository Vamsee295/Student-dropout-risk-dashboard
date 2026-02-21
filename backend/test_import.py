import urllib.request

csv_path = "/app/data/refined_sample.csv"
with open(csv_path, "rb") as f:
    csv_data = f.read()

boundary = "testboundary123"
body = (
    b"--" + boundary.encode() + b"\r\n"
    b'Content-Disposition: form-data; name="file"; filename="test.csv"\r\n'
    b"Content-Type: text/csv\r\n\r\n"
    + csv_data
    + b"\r\n--" + boundary.encode() + b"--\r\n"
)

req = urllib.request.Request(
    "http://localhost:8000/api/analysis/import",
    data=body,
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    method="POST",
)
try:
    resp = urllib.request.urlopen(req)
    for line in resp.read().decode().strip().split("\n"):
        print(line)
except Exception as e:
    print(f"Error: {e}")
    if hasattr(e, "read"):
        print(e.read().decode())
