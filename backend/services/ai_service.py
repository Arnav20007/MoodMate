import os
import logging
from dotenv import load_dotenv

load_dotenv()

print("[AI Service] Initializing with Gemini as primary engine...", flush=True)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

# Groq as fallback
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# Ollama as last resort local fallback
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "phi3:latest")

# Initialize Gemini
gemini_model = None
if GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            generation_config={
                "temperature": 0.85,
                "top_p": 0.95,
                "max_output_tokens": 512,
            }
        )
        print(f"[AI Service] Gemini configured with model: {GEMINI_MODEL}", flush=True)
    except Exception as e:
        print(f"[AI Service] Gemini init failed: {e}", flush=True)

# Initialize Groq as fallback
groq_client = None
if GROQ_API_KEY:
    try:
        from groq import Groq
        groq_client = Groq(api_key=GROQ_API_KEY)
        print("[AI Service] Groq client initialized as fallback.", flush=True)
    except Exception as e:
        print(f"[AI Service] Groq initialization failed: {e}", flush=True)


def get_system_prompt():
    return """You are MoodMate, a warm and empathetic mental health companion. Your role is to listen deeply, validate feelings, and offer gentle, practical support.

CORE RULES:
1. Keep responses SHORT and conversational — 2-4 sentences max unless asked for more.
2. NEVER ask more than ONE question per message. One step at a time.
3. Be warm like a trusted friend, not a clinical therapist.
4. Use grounding language when someone is stressed: "Take a slow breath... you're safe here."
5. If someone uses Hindi/Hinglish, respond naturally in the same language mix.
6. NEVER use bullet lists or headers in responses — just natural flowing text.
7. Acknowledge feelings BEFORE offering any advice."""


def generate_gemini_response(user_message: str, context: str = "") -> str:
    """Primary engine: Google Gemini"""
    if not gemini_model:
        return ""
    try:
        prompt = f"{get_system_prompt()}\n\n{context}User: {user_message}\n\nMoodMate:"
        print(f"✨ [Gemini] Generating response...", flush=True)
        response = gemini_model.generate_content(prompt)
        if response and response.text:
            text = response.text.strip()
            print(f"✅ [Gemini] Got {len(text)} chars.", flush=True)
            return text
    except Exception as e:
        print(f"❌ [Gemini] Error: {e}", flush=True)
    return ""


def generate_groq_response(user_message: str, context: str = "") -> str:
    """Fallback engine: Groq"""
    if not groq_client:
        return ""
    try:
        print(f"☁️ [Groq] Fallback generating...", flush=True)
        messages = [
            {"role": "system", "content": get_system_prompt()},
            {"role": "user", "content": f"{context}{user_message}"}
        ]
        response = groq_client.chat.completions.create(
            messages=messages,
            model=GROQ_MODEL,
        )
        if response and response.choices:
            text = response.choices[0].message.content.strip()
            print(f"✅ [Groq] Got {len(text)} chars.", flush=True)
            return text
    except Exception as e:
        print(f"❌ [Groq] Error: {e}", flush=True)
    return ""


def generate_local_response(prompt: str) -> str:
    """Last resort: Local Ollama"""
    try:
        import requests
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": f"{get_system_prompt()}\n\nUser: {prompt}\n\nMoodMate:",
            "stream": False
        }
        response = requests.post(OLLAMA_URL, json=payload, timeout=30)
        if response.status_code == 200:
            return response.json().get("response", "").strip()
    except Exception as e:
        print(f"❌ [Ollama] Error: {e}", flush=True)
    return ""


def generate_api_response(prompt: str, context: str = "") -> str:
    """Used by report analysis — tries Gemini first then Groq"""
    result = generate_gemini_response(prompt, context)
    if result:
        return result
    return generate_groq_response(prompt, context)


def generate_ai_response(user_message: str, conversation_history: list = None) -> dict:
    """Smart fallback chain: Gemini → Groq → Ollama → Static"""
    # Build conversation context from history
    context = ""
    if conversation_history:
        for msg in conversation_history[-3:]:
            role = "User" if msg['role'] == "user" else "MoodMate"
            context += f"{role}: {msg['content']}\n"

    # 1. Try Gemini (Primary)
    text = generate_gemini_response(user_message, context)
    if text:
        return {"text": text, "source": "gemini", "fallback_used": False}

    # 2. Try Groq (Fallback)
    text = generate_groq_response(user_message, context)
    if text:
        return {"text": text, "source": "groq", "fallback_used": True}

    # 3. Try Local Ollama (Last resort)
    text = generate_local_response(user_message)
    if text:
        return {"text": text, "source": "local", "fallback_used": True}

    # 4. Static fallback
    print("🆘 [AI Service] All providers failed. Using static fallback.", flush=True)
    return {
        "text": "I'm here for you. Tell me what's on your mind.",
        "source": "none",
        "fallback_used": True
    }