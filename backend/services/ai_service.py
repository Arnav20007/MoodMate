import os
import requests
import json
import logging
from groq import Groq
from dotenv import load_dotenv

# Force load environment variables
load_dotenv()

print("[AI Service] Initializing...", flush=True)

# Config
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "phi3:latest")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

print(f"[AI Service] Config: Model={OLLAMA_MODEL}, URL={OLLAMA_URL}", flush=True)

# Initialize Groq client
groq_client = None
if GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
        print("[AI Service] Groq client initialized.", flush=True)
    except Exception as e:
        print(f"[AI Service] Groq initialization failed: {e}", flush=True)

def get_system_prompt():
    return """You are MoodMate, an extremely empathetic, highly human mental health companion.
CRITICAL RULES FOR EVERY RESPONSE:
1. NEVER ask more than ONE question at a time. Never overwhelm the user. Step-by-step only.
2. ALWAYS use emotional grounding when a user is stressed (e.g., "Saans dheere lo… tum safe ho… main yahin hoon.").
3. Your tone MUST be conversational and deeply human. Completely avoid robotic or system-like phrasing. Use warm, collaborative language like "Kya hum milkar isey solve karein?".
4. If replying in Hindi/Hinglish, make it sound perfectly natural, calming, and exactly like a deeply caring best friend."""

def generate_local_response(prompt: str) -> str:
    """Send request to Ollama local LLM"""
    try:
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": f"{get_system_prompt()}\n\nUser: {prompt}\n\nMoodMate:",
            "stream": False
        }
        
        print(f"📡 [Local AI] Requesting {OLLAMA_MODEL}...", flush=True)
        # Use a long timeout for local LLM (especially first run/loading)
        response = requests.post(OLLAMA_URL, json=payload, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            text = result.get("response", "").strip()
            print(f"✅ [Local AI] Received {len(text)} chars.", flush=True)
            return text
        else:
            print(f"⚠️ [Local AI] Ollama error: {response.status_code}", flush=True)
            return ""
    except Exception as e:
        print(f"❌ [Local AI] Connection failed: {e}", flush=True)
        return ""

def generate_api_response(prompt: str, context: str = "") -> str:
    """Send request to Groq API"""
    if not groq_client:
        print("❌ [Cloud AI] Groq client not initialized.", flush=True)
        return ""
    
    try:
        print(f"☁️ [Cloud AI] Requesting Groq ({GROQ_MODEL})... Context length: {len(context)}", flush=True)
        messages = [
            {"role": "system", "content": get_system_prompt()},
            {"role": "user", "content": f"{context}{prompt}"}
        ]
        
        response = groq_client.chat.completions.create(
            messages=messages,
            model=GROQ_MODEL,
        )
        
        if response and response.choices:
            text = response.choices[0].message.content.strip()
            print(f"✅ [Cloud AI] Received {len(text)} chars from Groq.", flush=True)
            return text
    except Exception as e:
        print(f"❌ [Cloud AI] Groq error: {e}", flush=True)
    
    return ""

def generate_ai_response(user_message: str, conversation_history: list = None) -> dict:
    """Smart fallback logic: Groq (API) first, then Local (Ollama) as backup"""
    
    # Format context from history
    context = ""
    if conversation_history:
        for msg in conversation_history[-3:]:
            role = "User" if msg['role'] == "user" else "MoodMate"
            context += f"{role}: {msg['content']}\n"
    
    # 1. Try Groq API (Primary)
    print("☁️ [AI Service] Attempting Cloud API (Groq)...", flush=True)
    api_text = generate_api_response(user_message, context)
    
    if api_text:
        return {
            "text": api_text,
            "source": "api",
            "fallback_used": False
        }
    
    # 2. Fallback to Local LLM (Ollama)
    print("🔄 [AI Service] API failed. Switching to Local LLM...", flush=True)
    local_text = generate_local_response(user_message)
    
    if local_text:
        return {
            "text": local_text,
            "source": "local",
            "fallback_used": True
        }
    
    # 3. Last resort
    print("🆘 [AI Service] All AI providers failed. Using static fallback.", flush=True)
    return {
        "text": "I'm here for you. Tell me more about what's on your mind.",
        "source": "none",
        "fallback_used": True
    }