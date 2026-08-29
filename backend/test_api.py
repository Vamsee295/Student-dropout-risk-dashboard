import urllib.request, urllib.error
try:
    print(urllib.request.urlopen('http://localhost:8000/api/v1/student/courses').read())
except urllib.error.HTTPError as e:
    print(f'{e.code}: {e.read()}')
