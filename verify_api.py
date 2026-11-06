import urllib.request
import json

url = "https://jmqljyniphlzmpwytujs.supabase.co/rest/v1/dishes?select=id,name,price,category,diet"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptcWxqeW5pcGhsem1wd3l0dWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxNzg3NDQsImV4cCI6MjEwODc1NDc0NH0.BEICvrknvgrtnK_McOkFO0w8_xQah2lhETatHwWv2QE",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptcWxqeW5pcGhsem1wd3l0dWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxNzg3NDQsImV4cCI6MjEwODc1NDc0NH0.BEICvrknvgrtnK_McOkFO0w8_xQah2lhETatHwWv2QE"
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print(f"SUCCESS! Status code: {resp.status}")
        print(f"Fetched {len(data)} dishes from live Supabase REST API:")
        for d in data:
            print(f" - {d['name']} ({d['category']}, {d['diet']}): ₹{d['price']}")
except Exception as e:
    print("API Error:", e)

