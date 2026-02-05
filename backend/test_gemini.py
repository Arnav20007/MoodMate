from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
MODEL_NAME = "gemini-2.0-flash"

print(f"Testing with API Key: {GEMINI_API_KEY[:10]}...")
try:
    client = genai.Client(api_key=GEMINI_API_KEY)
    print("Client initialized")
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents="Hello"
    )
    print("Response:", response.text)
except Exception as e:
    print("Error:", e)
