import requests
import socket
import time

# --- CONFIGURATION ---
HOST = '127.0.0.1'
PORT = 5000
HEALTH_URL = f"http://{HOST}:{PORT}/api/health"
CHAT_URL = f"http://{HOST}:{PORT}/api/chat"
TIMEOUT = 15 # Increased timeout for the AI

# --- TEST FUNCTIONS ---

def check_port_open(host, port):
    """Checks if the server port is open and listening."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(2) # 2-second timeout for connection
        try:
            s.connect((host, port))
            return True
        except (socket.timeout, ConnectionRefusedError):
            return False

def test_health_endpoint():
    """Tests the basic health check endpoint."""
    try:
        response = requests.get(HEALTH_URL, timeout=5)
        if response.status_code == 200:
            print(f"✅ Health Check Passed: {response.json().get('message', 'OK')}")
            return True
        else:
            print(f"❌ Health Check FAILED: Status {response.status_code} - {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health Check FAILED: Could not connect to the health endpoint. Error: {e}")
        return False

def test_chat_endpoint():
    """Tests the main chat endpoint."""
    payload = {"message": "Hello MoodMate, this is a diagnostic test."}
    print("\nStep 3: Sending POST request to /api/chat...")
    
    try:
        start_time = time.time()
        response = requests.post(CHAT_URL, json=payload, timeout=TIMEOUT, cookies=session_cookies)
        end_time = time.time()
        
        duration = end_time - start_time
        print(f"   - Response received in {duration:.2f} seconds.")

        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print(f"✅ Chat Test Passed! AI Replied: '{data.get('reply')}'")
            else:
                print(f"❌ Chat Test FAILED: The server returned an error: {data.get('message', 'Unknown error')}")
        else:
            print(f"❌ Chat Test FAILED: Status {response.status_code} - {response.text}")
            
    except requests.exceptions.ReadTimeout:
        print(f"❌ Chat Test FAILED: Read Timed Out after {TIMEOUT} seconds.")
        print("   - LIKELY CAUSE: The request to the Google Gemini AI is failing or too slow.")
        print("   - WHAT TO DO: Double-check your GEMINI_API_KEY in the .env file and your server's internet connection.")
    except requests.exceptions.RequestException as e:
        print(f"⚠️ Chat Test FAILED with a network error: {e}")

# --- MAIN EXECUTION ---
if __name__ == "__main__":
    print("--- MoodMate Backend Diagnostic ---")

    # This part is a placeholder. For a real test, you would log in first
    # to get a session cookie. For now, we assume you are testing an open endpoint
    # or have manually set the session in a tool like Postman/Insomnia.
    session_cookies = {} 

    print("\nStep 1: Checking if server port is open...")
    if check_port_open(HOST, PORT):
        print(f"✅ Success: A service is running on {HOST}:{PORT}.")
        
        print("\nStep 2: Checking the /api/health endpoint...")
        if test_health_endpoint():
            test_chat_endpoint()
        else:
            print("\n   - DIAGNOSIS: Your Flask application is running but has a problem. Check the Flask terminal for errors.")
    else:
        print(f"❌ FAILED: Connection refused on {HOST}:{PORT}.")
        print("\n   - DIAGNOSIS: Your Flask server (`app.py`) is NOT RUNNING. Please start it in another terminal.")