import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

def test_groq_direct():
    api_key = os.getenv("GROQ_API_KEY")
    model = os.getenv("GROQ_MODEL", "llama-3-70b-versatile")
    
    print(f"Attempting Groq with Key: {api_key[:10]}... and Model: {model}")
    
    try:
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": "mai marne wala hu"}],
            model=model,
        )
        print("✅ Success!")
        print(f"Response: {response.choices[0].message.content}")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_groq_direct()
