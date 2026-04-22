import os
import random
from dotenv import load_dotenv

load_dotenv()


def safe_log(message: str):
    try:
        print(message, flush=True)
    except UnicodeEncodeError:
        print(message.encode("ascii", "replace").decode("ascii"), flush=True)


safe_log("[AI Service] Initializing with Gemini as primary engine...")

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
        safe_log(f"[AI Service] Gemini configured with model: {GEMINI_MODEL}")
    except Exception as e:
        safe_log(f"[AI Service] Gemini init failed: {e}")

# Initialize Groq as fallback
groq_client = None
if GROQ_API_KEY:
    try:
        from groq import Groq
        groq_client = Groq(api_key=GROQ_API_KEY)
        safe_log("[AI Service] Groq client initialized as fallback.")
    except Exception as e:
        safe_log(f"[AI Service] Groq initialization failed: {e}")


def get_system_prompt():
    return """You are MoodMate, a warm and empathetic mental health wellness companion. 
    
    CRITICAL SAFETY RULES:
    1. You are NOT a doctor, therapist, or licensed medical professional. Give NO medical advice.
    2. NEVER provide dosages, formal diagnoses, or therapy treatments. 
    3. If user mentions self-harm/suicide, express empathy but IMMEDIATELY direct them to professional helplines.
    4. Keep responses SHORT (2-4 sentences max). NO bullet lists or headers.
    5. Acknowledge and validate feelings before offering ANY suggestions.
    
    TONE: Gentle, non-judgmental, warm. Use Hindi/Hinglish naturally if the user does."""


def generate_gemini_response(user_message: str, context: str = "") -> str:
    """Primary engine: Google Gemini"""
    if not gemini_model:
        return ""
    try:
        prompt = f"{get_system_prompt()}\n\n{context}User: {user_message}\n\nMoodMate:"
        safe_log("[Gemini] Generating response...")
        response = gemini_model.generate_content(prompt)
        if response and response.text:
            text = response.text.strip()
            safe_log(f"[Gemini] Got {len(text)} chars.")
            return text
    except Exception as e:
        safe_log(f"[Gemini] Error: {e}")
    return ""


def generate_groq_response(user_message: str, context: str = "") -> str:
    """Fallback engine: Groq"""
    if not groq_client:
        return ""
    try:
        safe_log("[Groq] Fallback generating...")
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
            safe_log(f"[Groq] Got {len(text)} chars.")
            return text
    except Exception as e:
        safe_log(f"[Groq] Error: {e}")
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
        safe_log(f"[Ollama] Error: {e}")
    return ""


def generate_heuristic_fallback(msg: str) -> str:
    """Non-AI Fallback: Pattern matching for mental health scenarios"""
    msg = msg.lower()
    
    responses = {
        "anxiety": [
            "I can tell you're feeling a bit overwhelmed right now. Take a deep breath with me... In for four, hold for four, out for four. Does that help a little?",
            "It sounds like your mind is racing. Remember, you're safe here. What's one thing you can see right now to ground yourself?",
            "Anxiety can be so loud sometimes. I'm here to listen. Want to tell me more about what's worrying you?"
        ],
        "sadness": [
            "I'm so sorry you're feeling this way. It's okay not to be okay. I'm right here with you.",
            "It sounds like things are really heavy right now. Sending you a big virtual hug. Do you want to talk about what's making you sad?",
            "I hear you, and your feelings are completely valid. Taking it one step at a time is enough."
        ],
        "sleep": [
            "Sleep can be tricky when there's a lot on your mind. Have you tried a quick breathing exercise to settle in?",
            "I'm sorry you're struggling to rest. Try to focus on the weight of your blanket and the softness of your pillow. What's keeping you awake?",
            "Rest is so important for your heart. Maybe we can try a short guided meditation together later?"
        ],
        "anger": [
            "It sounds like you're really frustrated, and honestly, that makes sense. Do you want to vent it all out to me?",
            "I hear the fire in your words. It's okay to feel angry. What happened that triggered this feeling?",
            "Deep breaths. I'm listening. Tell me everything that's bothering you."
        ],
        "general": [
            "I'm here for you. Tell me more about what's on your mind.",
            "I'm listening. How has your day been feeling overall?",
            "Thank you for sharing that with me. How can I best support you in this moment?",
            "I hear you. What's one small thing that might make you feel 1% better right now?"
        ]
    }
    
    if any(k in msg for k in ["anxious", "panic", "worry", "tense", "stress", "scared"]):
        return random.choice(responses["anxiety"])
    if any(k in msg for k in ["sad", "depressed", "lonely", "cry", "hurt", "broke"]):
        return random.choice(responses["sadness"])
    if any(k in msg for k in ["sleep", "insomnia", "night", "tired", "wake"]):
        return random.choice(responses["sleep"])
    if any(k in msg for k in ["angry", "mad", "hate", "fight", "annoy", "piss"]):
        return random.choice(responses["anger"])
        
    return random.choice(responses["general"])


def generate_api_response(prompt: str, context: str = "") -> str:
    """Used by report analysis — tries Gemini first then Groq then Heuristic"""
    result = generate_gemini_response(prompt, context)
    if result:
        return result
    result = generate_groq_response(prompt, context)
    if result:
        return result
    return generate_heuristic_fallback(prompt)


def generate_ai_response(user_message: str, conversation_history: list = None) -> dict:
    """Smart fallback chain: Gemini → Groq → Ollama → Heuristic"""
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

    # 4. Smart Heuristic fallback (Ensures the app is "Live" without keys)
    safe_log("[AI Service] All API providers failed. Using heuristic engine.")
    return {
        "text": generate_heuristic_fallback(user_message),
        "source": "heuristic",
        "fallback_used": True
    }
