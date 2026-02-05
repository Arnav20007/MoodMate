# test_server.py
import requests
import json

base_url = "http://localhost:5000"

print("="*60)
print("🧪 Testing MoodMate Server Endpoints")
print("="*60)

# Test 1: Test endpoint (correct path)
print("\n1. Testing GET /test...")
try:
    response = requests.get(f"{base_url}/test")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"✅ Response: {response.text}")
    else:
        print(f"❌ Response: {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")

# Test 2: Health check (correct path)
print("\n2. Testing GET /api/health...")
try:
    response = requests.get(f"{base_url}/api/health")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Response: {json.dumps(data, indent=2)}")
    else:
        print(f"❌ Response: {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")

# Test 3: Test the actual endpoints
print("\n3. Testing available endpoints...")
endpoints = [
    ("/test", "GET"),
    ("/api/test", "GET"),
    ("/api/health", "GET"),
    ("/status", "GET"),
    ("/api/status", "GET"),
]

for endpoint, method in endpoints:
    try:
        if method == "GET":
            response = requests.get(f"{base_url}{endpoint}")
        print(f"{method} {endpoint}: {response.status_code}")
    except Exception as e:
        print(f"{method} {endpoint}: Error - {e}")

# Test 4: Chat endpoint
print("\n4. Testing POST /api/chat...")
test_messages = [
    "Hello MoodMate",
    "I am feeling sad today",
    "I am stressed about exams"
]

for msg in test_messages:
    print(f"\nSending: '{msg}'")
    try:
        response = requests.post(
            f"{base_url}/api/chat",
            json={
                "message": msg,
                "user_id": 1,
                "session_id": "test_session"
            },
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success!")
            print(f"   Mood: {data.get('mood', 'N/A')}")
            print(f"   Response preview: {data.get('reply', 'N/A')[:80]}...")
        else:
            print(f"❌ Error: {response.text[:200]}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

print("\n" + "="*60)
print("✅ Testing complete!")
print("="*60)