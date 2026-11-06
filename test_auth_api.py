import urllib.request
import json

SUPABASE_URL = "https://jmqljyniphlzmpwytujs.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptcWxqeW5pcGhsem1wd3l0dWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxNzg3NDQsImV4cCI6MjEwODc1NDc0NH0.BEICvrknvgrtnK_McOkFO0w8_xQah2lhETatHwWv2QE"

headers = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type": "application/json"
}

# Test 1: Try invalid login
login_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
invalid_payload = json.dumps({"email": "unregistered_test@example.com", "password": "wrongpassword"}).encode()
req = urllib.request.Request(login_url, data=invalid_payload, headers=headers)
try:
    urllib.request.urlopen(req)
    print("Test 1 FAIL: Unregistered user should not log in!")
except urllib.error.HTTPError as e:
    err_body = e.read().decode()
    print("Test 1 PASS: Unregistered login properly blocked by Supabase with HTTP", e.code)
    print("Response message:", err_body)

