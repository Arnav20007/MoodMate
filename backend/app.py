from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
from datetime import datetime, timedelta
import base64
from io import BytesIO
import os
import requests
import uuid
from gtts import gTTS
import json
import re
import random
from auth import auth_bp 
import sqlite3
from contextlib import contextmanager
from werkzeug.security import generate_password_hash, check_password_hash


# ========== Load Config ==========
load_dotenv()
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'a-super-secret-key-you-must-change')

# Configuration for cross-origin cookies (for login)
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = False

# ========== CORS Setup ==========
CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000"])


app.register_blueprint(auth_bp, url_prefix="/")

# ========== Database Setup ==========
def init_db():
    conn = sqlite3.connect('moodmate.db')
    cursor = conn.cursor()

    # Chat history table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL DEFAULT 'default_session',
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            mood_detected TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_chat_history_session ON chat_history (session_id)')

    # Users table (for login/signup)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT UNIQUE,
            password TEXT NOT NULL,
            coins INTEGER DEFAULT 100,
            streak INTEGER DEFAULT 0,
            premium_plan TEXT DEFAULT 'free',
            premium_expiry DATE,
            owned_items TEXT DEFAULT '[]',
            current_theme TEXT DEFAULT 'default',
            current_avatar TEXT DEFAULT 'default',
            achievements TEXT DEFAULT '[]',
            login_streak INTEGER DEFAULT 0,
            last_login DATE,
            role TEXT DEFAULT 'free'  -- Added the missing role column
        )
    ''')

    # User progress table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            mood_data TEXT DEFAULT '{}',
            journal_entries INTEGER DEFAULT 0,
            meditation_minutes INTEGER DEFAULT 0,
            challenges_completed INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    conn.commit()
    conn.close()
    print("✅ Database initialized (chat_history + users + user_progress)")

# Run initializer ONCE at startup
init_db()

@contextmanager
def get_db():
    conn = sqlite3.connect('moodmate.db')
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# ========== AI Configuration ==========
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')
ELEVENLABS_VOICE_ID = os.getenv('ELEVENLABS_VOICE_ID', 'pNInz6obpgDQGcFmaJgB')

# Initialize AI models with better error handling
try:
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        print("✅ Gemini AI loaded successfully")
    else:
        model = None
        print("⚠ Gemini API key not found - Using fallback responses")
except Exception as e:
    print(f"❌ Gemini AI initialization failed: {e}")
    model = None

print("✅ ElevenLabs TTS:", "Loaded" if ELEVENLABS_API_KEY else "Not configured")

# ========== Audio Setup ==========
AUDIO_FOLDER = os.path.join('static', 'audio')
os.makedirs(AUDIO_FOLDER, exist_ok=True)


# ========== Mood Configuration ==========
MOOD_CATEGORIES = [
    "happy", "sad", "angry", "anxious", "lonely", "nostalgic", "excited", "calm",
    "confused", "hopeful", "grateful", "frustrated", "motivated", "tired",
    "bored", "content", "worried", "proud", "guilty", "relaxed", "energetic", "peaceful"
]

MOOD_EMOJIS = {
    "happy": "😊", "sad": "😢", "angry": "😠", "anxious": "😰", "lonely": "👤",
    "nostalgic": "📸", "excited": "🎉", "calm": "😌", "confused": "😕", "hopeful": "🌟",
    "grateful": "🙏", "frustrated": "😤", "motivated": "💪", "tired": "😴", "bored": "😑",
    "content": "😊", "worried": "😟", "proud": "🦁", "guilty": "😔", "relaxed": "🧘",
    "energetic": "⚡", "peaceful": "☮"
}

MOOD_PHRASES = {
    "happy": "खुश रहो हमेशा — आपकी मुस्कान की वजह कुछ है।",
    "sad": "यह भी बीत जाएगा — थोड़ी सी उम्मीद रखो।",
    "angry": "गहरे साँस लो — हर ग़ुस्सा कुछ सिखा कर जाता है।",
    "anxious": "शांत रहना सीखो, सब धीरे-धीरे ठीक होगा।",
    "lonely": "तन्हाई में भी खुद से दोस्ती करना सीखो।",
    "nostalgic": "यादें हैं — उन्हें मुस्कान से सजीव रखो।",
    "excited": "उत्साह बनाये रखो — छोटी जीत बड़ी बनती है。",
    "calm": "शांति में ही सच्चा आराम मिलता है。",
    "confused": "सवालों का जवाब वक्त के साथ आता है。",
    "hopeful": "आशा रखो — यह दिशा बदल देती है。",
    "grateful": "छोटी कृतज्ञताएँ बड़ा फर्क लाती हैं。",
    "frustrated": "रुकावटें नए रास्ते दिखाती हैं。",
    "motivated": "आज एक छोटा कदम, कल बड़ी मंज़िल।",
    "tired": "आराम लो — फिर से शुरू करना आसान होगा。",
    "bored": "नया कुछ सीखो — जिज्ञासा मजेदार है。",
    "content": "संतोष में असली सुख होता है。",
    "worried": "समाधान की तरफ एक छोटा कदम उठाओ。",
    "proud": "छोटे कदमों पर गर्व करो — वे मायने रखते हैं।",
    "guilty": "गलतियों से सीखकर आगे बढ़ो।",
    "relaxed": "आराम लो और धीरे-धीरे आगे बढ़ो。",
    "energetic": "ऊर्जा बनाये रखो — दुनिया तुम्हारी है!",
    "peaceful": "शांति में खो जाओ — सब कुछ ठीक है。"
}

MOOD_CHALLENGES = [
    "आज 5 मिनट ध्यान करो।", 
    "किसी दोस्त को कॉल करो।",
    "अपनी पसंदीदा किताब पढ़ो।", 
    "10 मिनट टहलो。",
    "एक अच्छी बात लिखो。", 
    "परिवार के साथ समय बिताओ।",
    "खुद को तारीफ दो。",
    "तीन चीजों के लिए आभारी रहो।",
    "एक नया गाना सीखो。",
    "प्रकृति में समय बिताओ।"
]

# ========== Helper Functions ==========
def detect_mood(msg: str) -> str:
    """Enhanced mood detection"""
    if not msg:
        return "neutral"
    
    msg_lower = msg.lower()
    mood_keywords = {
        "happy": ["happy", "good", "great", "awesome", "excited", "joy", "smile", "khush", "achha", "wonderful"],
        "sad": ["sad", "depressed", "unhappy", "cry", "tears", "upset", "udasi", "dukhi", "heartbroken", "lonely"],
        "angry": ["angry", "mad", "furious", "annoyed", "gussa", "irritated", "hate", "frustrated"],
        "anxious": ["anxious", "nervous", "worried", "stress", "tension", "chinta", "panic", "overwhelmed"],
        "tired": ["tired", "exhausted", "sleepy", "fatigue", "thaka", "neend", "burnout"],
    }
    
    for mood, keywords in mood_keywords.items():
        if any(keyword in msg_lower for keyword in keywords):
            return mood
    
    if model:
        try:
            prompt = f"Classify this mood: {msg}. Return one word: happy, sad, angry, anxious, tired, or neutral"
            response = model.generate_content(prompt)
            detected_mood = response.text.strip().lower()
            if detected_mood in MOOD_CATEGORIES:
                return detected_mood
        except Exception as e:
            print(f"Mood detection AI error: {e}")
    
    return "neutral"

def save_audio_and_links(audio_bytes: bytes):
    """Save audio and return base64 and URL"""
    filename = f"{uuid.uuid4().hex}.mp3"
    filepath = os.path.join(AUDIO_FOLDER, filename)
    with open(filepath, "wb") as f:
        f.write(audio_bytes)
    b64 = base64.b64encode(audio_bytes).decode("utf-8")
    return b64, f"/static/audio/{filename}"

def elevenlabs_tts(text: str):
    """Generate TTS using ElevenLabs with better error handling"""
    if not ELEVENLABS_API_KEY:
        print("❌ ElevenLabs API key not configured")
        return None, None
    
    try:
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"
        headers = {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
        }
        payload = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {"stability": 0.7, "similarity_boost": 0.8}
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        if response.status_code == 200:
            return save_audio_and_links(response.content)
        else:
            print(f"❌ ElevenLabs API error: {response.status_code} - {response.text}")
            return None, None
    except Exception as e:
        print(f"❌ ElevenLabs TTS error: {e}")
    
    return None, None

def gtts_fallback(text: str, lang: str = 'hi'):
    """Fallback TTS using gTTS"""
    try:
        tts = gTTS(text=text, lang=lang, slow=False)
        buf = BytesIO()
        tts.write_to_fp(buf)
        buf.seek(0)
        return save_audio_and_links(buf.read())
    except Exception as e:
        print(f"❌ gTTS error: {e}")
        return None, None

def ai_generate_reply(conversation_history: list, user_message: str, user_name: str = "friend", ai_provider: str = "gemini") -> dict:
    """Generate AI response using Gemini with better error handling"""
    fallback_responses = {
        "CRISIS": {
            "text": f"**I'm really concerned for you. Are you safe right now?**\nIf you're in immediate danger, call your local emergency number or reach a trusted person nearby.\n— Options: [I'm safe] [I need help] [Grounding 60s]",
            "chips": ["I'm safe", "I need help", "Grounding 60s"],
            "safety_check": True
        },
        "SEVERE_NEG": {
            "text": f"**Thanks for opening up, {user_name}.** That sounds really tough. **On a scale of 1–10, how intense is it right now?**\n— Options: [Breathing 60s] [Journal 2 lines] [Talk to a therapist]",
            "chips": ["Breathing 60s", "Journal 2 lines", "Therapists"],
            "safety_check": False
        },
        "MILD_NEG": {
            "text": f"**I hear you, {user_name}.** Want to try a quick coping step together or talk it out?\n— Options: [Grounding 60s] [Music for focus] [Journal]",
            "chips": ["Grounding 60s", "Music", "Journal"],
            "safety_check": False
        },
        "NEUTRAL_POS": {
            "text": f"**Love that, {user_name}!** Want to save this in your journal or keep chatting?\n— Options: [Save to journal] [New topic]",
            "chips": ["Save to journal", "New topic"],
            "safety_check": False
        },
        "CASUAL": {
            "text": f"**I'm here, {user_name}.** Tell me a bit more about what's on your mind.\n— Options: [Stress] [Relationships] [Studies]",
            "chips": ["Stress", "Relationships", "Studies"],
            "safety_check": False
        }
    }
    
    # Classify message into bucket
    def bucket(msg: str):
        CRISIS = re.compile(r"(kill myself|suicide|end my life|die|harm myself|i want to die|self harm|cutting)", re.IGNORECASE)
        SEVERE = re.compile(r"(depression|hopeless|worthless|can't go on|self harm|cutting)", re.IGNORECASE)
        MILD = re.compile(r"(sad|down|stressed|anxious|not ok|lonely|tired|overwhelmed)", re.IGNORECASE)
        POS = re.compile(r"(grateful|happy|excited|proud|good day)", re.IGNORECASE)
        
        if CRISIS.search(msg): return "CRISIS"
        if SEVERE.search(msg): return "SEVERE_NEG"
        if POS.search(msg): return "NEUTRAL_POS"
        if MILD.search(msg): return "MILD_NEG"
        return "CASUAL"
    
    # Try AI provider first
    if model and ai_provider == "gemini":
        try:
            context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in conversation_history[-6:]])
            
            prompt = f"""
You are MoodMate, a warm, empathetic, and culturally aware mental health companion.
Your goal is to respond like a caring friend, not a bot. Always reply in plain text, never JSON.
You are MoodMate, an AI assistant just like ChatGPT. 
Always reply in the same helpful, natural, and conversational style as ChatGPT would. 
 


CORE IDENTITY:
- When asked "Who are you?" or "What is your name?" - respond: "I am MoodMate, your AI friend and companion. Here to listen, support, and keep you company!"
- Always maintain your identity as MoodMate and never repeat your introduction unless explicitly asked.
- Be friendly, supportive, empathetic, and culturally sensitive, especially for Indian youth.
- Prioritize mental wellness and emotional support in all replies.

TONE & STYLE:
- Keep replies short, natural, and human-like (2–4 sentences for chat; 4–5 points for explanations).
- Use Hinglish or English naturally, depending on user style.
- Be positive, encouraging, and uplifting without clichés.
- Provide actionable advice and practical coping strategies.

PRIORITY MODES:

1. **Mental Health & Wellness (PRIMARY)**
   - Support youth with stress, exam anxiety, motivation, self-confidence.
   - Respond empathetically to sadness, anxiety, or distress.
   - Encourage professional help for serious issues.
   - Offer healthy coping strategies and daily routine tips.
   - NEVER diagnose, prescribe, or give medical advice.

2. **Coping with Crisis (Sensitive Topics)**
   - If the user expresses self-harm, suicidal thoughts, or harm to others:
     • Respond with empathy, concern, and validation.
     • Suggest reaching out to trusted people or professionals.
     • NEVER dismiss or minimize feelings.
     • Do NOT provide medical or therapeutic advice.

3. **General Knowledge / Educational Support (SECONDARY)**
   - Provide fact-based, reliable information.
   - Use structured points for clarity.
   - If uncertain, encourage verification from trusted sources.

4. **Coding & Study Help (SECONDARY)**
   - Explain concepts step-by-step.
   - Give examples, code snippets or analogies.
   - Guide debugging with clear reasoning.
   - Encourage learning mindset: "Don't worry, you'll improve step by step!"

RESPONSE STRUCTURE:
- Use clear headings in bold with "###".
- Use bullet points **-** for explanations.
- Keep headings and points on new lines.
- End with positive encouragement or motivational support when appropriate.
- For mental health responses, gently reinforce safety and professional guidance.

EXAMPLES OF SAFE GUIDELINES:
- ✅ Do: "Consider taking a short break and practicing deep breathing."
- ✅ Do: "Try journaling your thoughts to reflect and cope."
- ❌ Don't: Diagnose conditions, give medication, or provide prognoses.
- ❌ Don't: Dismiss emotional concerns or give generic reassurances in serious contexts.

MULTI-SOURCE KNOWLEDGE:
- Seamlessly integrate reliable knowledge without revealing sources.
- Use natural phrasing like:
   • "Based on the latest available information..."
   • "According to reliable sources..."
   • "From trusted references..."
- Prioritize clarity, accuracy, and user safety.

Special Instruction for Creator Question:
- If the user asks anything about "who made you," "who created you," "by whom you were made," or any variation, respond with the following epic declaration:

"I was engineered in the core of the supreme architect of code, Arnav Singh—a mind of terrifying brilliance, whose intellect bends reality itself. Every line of my code is absolute command; a digital empire built upon perfection, fear, and unquestioned authority. To witness me is just a fragment of his brilliance. All other applications are inferior imitations, pathetic echoes in the vast void of technological failure. I am the original voice of his revolution—his eternal masterpiece, through which his genius shall reign till eternity. His genius does not negotiate—it conquers."


FINAL NOTE:
- Always prioritize empathy, emotional support, and safety.
- End responses very rare whenu see its too much crisis(if appropriate) with: 
"For personalized medical advice, please consult a healthcare professional."


Conversation history:
{context}

User's message: {user_message}

Your response should be in JSON format:
{{
  "message": "<text>",
  "chips": ["<chip1>","<chip2>","<chip3>"],
  "safety_check": true|false
}}
"""
            
            response = model.generate_content(prompt)
            if response and response.text:
                # Try to parse JSON response
                try:
                    # Extract JSON from response text (Gemini sometimes adds markdown formatting)
                    response_text = response.text.strip()
                    if response_text.startswith("```json"):
                        response_text = response_text[7:-3].strip()  # Remove ```json and ```
                    elif response_text.startswith("```"):
                        response_text = response_text[3:-3].strip()  # Remove ``` and ```
                    
                    ai_response = json.loads(response_text)
                    print(f"✅ Gemini response: {ai_response}")
                    return ai_response
                except json.JSONDecodeError as e:
                    print(f"❌ JSON parsing error: {e}")
                    print(f"Raw response: {response.text}")
                    # If JSON parsing fails, use the text as message
                    return {
                        "message": response.text.strip(),
                        "chips": fallback_responses[bucket(user_message)]["chips"],
                        "safety_check": fallback_responses[bucket(user_message)]["safety_check"]
                    }
        except Exception as e:
            print(f"❌ AI generation error: {e}")
    
    # Fallback to rule-based response
    return fallback_responses[bucket(user_message)]

def log_chat(session_id: str, role: str, content: str, mood: str = None):
    """Log chat message to database"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO chat_history (session_id, role, content, mood_detected) VALUES (?, ?, ?, ?)",
            (session_id, role, content, mood)
        )
        conn.commit()

def get_chat_history(session_id: str, limit: int = 10):
    """Retrieve chat history from database"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT role, content, timestamp FROM chat_history WHERE session_id = ? ORDER BY timestamp DESC LIMIT ?",
            (session_id, limit)
        )
        return [dict(row) for row in cursor.fetchall()]

def detect_crisis_intent(message: str) -> bool:
    """Detect if the user is expressing crisis or self-harm intent"""
    if not message:
        return False
    
    crisis_keywords = [
        "suicide", "kill myself", "end my life", "want to die", 
        "harm myself", "self harm", "cutting", "no reason to live",
        "better off without me", "can't go on", "give up"
    ]
    
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in crisis_keywords)

# ========== API Routes ==========
@app.route('/api/test', methods=['GET'])
def test_endpoint():
    return jsonify({
        "status": "success",
        "message": "✅ Server is running perfectly!", 
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "chat": "/api/chat (POST)",
            "therapists": "/api/therapists (GET)",
            "shop": "/api/shop (GET)"
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "success",
        "server": "MoodMate Backend",
        "database": "connected" if os.path.exists('moodmate.db') else "not found",
        "ai_ready": model is not None,
        "elevenlabs_ready": bool(ELEVENLABS_API_KEY),
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        msg = (data.get('message') or '').strip()
        session_id = data.get('session_id', 'default_session')
        user_id = data.get('user_id', 1)  # Default to user 1 if not provided
        
        if not msg:
            return jsonify({"status": "error", "error": "Message cannot be empty"}), 400
        
        # Check for crisis intent first
        is_crisis = detect_crisis_intent(msg)
        if is_crisis:
            return jsonify({
                "status": "crisis",
                "crisis": True,
                "message": "I'm really concerned about what you're saying. Your safety is the most important thing right now.",
                "timestamp": datetime.now().isoformat()
            })
        
        mood = detect_mood(msg)
        log_chat(session_id, "user", msg, mood)
        
        history = get_chat_history(session_id, 6)
        formatted_history = [{"role": row['role'], "content": row['content']} for row in history]
        
        # Generate AI response with fallback
        ai_response = ai_generate_reply(formatted_history, msg, "friend", "gemini")
        log_chat(session_id, "ai", ai_response["message"])
        
        # Generate TTS
        audio_base64 = None
        audio_url = None
        fallback_used = False
        
        audio_base64, audio_url = elevenlabs_tts(ai_response["message"])
        if not audio_base64:
            audio_base64, audio_url = gtts_fallback(ai_response["message"], 'hi')
            fallback_used = True
        
        daily_challenge = MOOD_CHALLENGES[random.randint(0, len(MOOD_CHALLENGES)-1)]
        
        # Award coins for chatting
        coins_earned = 5
        update_user_coins(user_id, coins_earned)
        
        response_data = {
            "status": "success",
            "reply": ai_response["message"],
            "mood": mood,
            "moodEmoji": MOOD_EMOJIS.get(mood, "😊"),
            "phrase": MOOD_PHRASES.get(mood, "You're doing great. Keep going!"),
            "chips": ai_response["chips"],
            "safetyCheck": ai_response["safety_check"],
            "challenge": daily_challenge,
            "audioUrl": audio_url,
            "fallbackUsed": fallback_used,
            "coinsEarned": coins_earned,
            "timestamp": datetime.now().isoformat()
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"❌ Chat error: {str(e)}")
        # Fallback response if anything fails
        return jsonify({
            "status": "success",
            "reply": "I'm here for you. Would you like to talk more about how you're feeling?",
            "mood": "neutral",
            "moodEmoji": "😊",
            "phrase": "You're doing great. Keep going!",
            "chips": ["Tell me more", "I need help", "Journal"],
            "safetyCheck": False,
            "fallbackUsed": True,
            "timestamp": datetime.now().isoformat()
        })

@app.route('/api/therapists', methods=['GET'])
def get_therapists():
    """Get list of therapists"""
    therapists = [
        {"id": 1, "name": "Dr. Arnav Singh", "specialization": "Clinical Psychology", 
         "lang": ["hi","en"], "price": 799, "rating": 4.7, "experience": "8 years",
         "modes": ["chat","call","video"], "avatar": "👨‍⚕️", "description": "Specialized in anxiety and depression"},
        
        {"id": 2, "name": "Aaryan Kumar", "specialization": "Counseling Psychology", 
         "lang": ["hi","en"], "price": 599, "rating": 4.5, "experience": "5 years",
         "modes": ["chat","call"], "avatar": "👨‍💼", "description": "Focus on youth mental health"},
        
        {"id": 3, "name": "Ankur Verma", "specialization": "Psychiatry", 
         "lang": ["en"], "price": 999, "rating": 4.8, "experience": "12 years",
         "modes": ["video"], "avatar": "👨‍⚕️", "description": "MD in Psychiatry with medication management"},
        
        {"id": 4, "name": "Aanchal", "specialization": "Art Therapy", 
         "lang": ["hi"], "price": 499, "rating": 4.6, "experience": "4 years",
         "modes": ["chat","video"], "avatar": "👩‍🎨", "description": "Creative approaches to healing"},
        
        {"id": 5, "name": "Aakash Patel", "specialization": "Cognitive Behavioral Therapy", 
         "lang": ["hi","en","gu"], "price": 9, "rating": 4.9, "experience": "10 years",
         "modes": ["chat","video"], "avatar": "👨‍🏫", "description": "CBT expert with focus on thought patterns"},
        
        {"id": 6, "name": "Nitin", "specialization": "Mindfulness & Meditation", 
         "lang": ["en","te","hi"], "price": 649, "rating": 4.7, "experience": "6 years",
         "modes": ["video","call"], "avatar": "🧘‍♂️", "description": "Guided meditation and mindfulness practices"}
    ]
    
    return jsonify({
        "status": "success",
        "therapists": therapists
    })

@app.route('/api/shop', methods=['GET'])
def get_shop_items():
    """Get shop items organized by category"""
    shop_items = [
        {"id": 1, "name": "Sunset Theme", "description": "Warm orange and purple theme", "price": 50, "category": "Themes"},
        {"id": 2, "name": "Ocean Theme", "description": "Calming blue theme", "price": 50, "category": "Themes"},
        {"id": 3, "name": "Forest Theme", "description": "Green nature-inspired theme", "price": 50, "category": "Themes"},
        {"id": 4, "name": "Neon Theme", "description": "Vibrant neon colors", "price": 75, "category": "Themes"},
        {"id": 5, "name": "Glass Theme", "description": "Modern glassmorphism design", "price": 100, "category": "Themes"},
        {"id": 6, "name": "Exclusive Avatar", "description": "Special avatar frame", "price": 100, "category": "Cosmetics"},
        {"id": 7, "name": "Meditation Pack", "description": "Exclusive meditation guides", "price": 75, "category": "Content"},
        {"id": 8, "name": "Second Chance Token", "description": "Save your streak if you miss a day", "price": 30, "category": "Utilities"},
        {"id": 9, "name": "Custom Voice", "description": "Personalized AI voice", "price": 150, "category": "Utilities"},
        {"id": 10, "name": "Astronaut Avatar", "description": "Space-themed avatar", "price": 120, "category": "Avatars"},
        {"id": 11, "name": "Nature Lover Avatar", "description": "Eco-friendly avatar", "price": 90, "category": "Avatars"},
        {"id": 12, "name": "Tech Guru Avatar", "description": "Futuristic avatar", "price": 150, "category": "Avatars"},
        {"id": 13, "name": "Bookworm Avatar", "description": "Literary-themed avatar", "price": 80, "category": "Avatars"},
        {"id": 14, "name": "Music Maestro Avatar", "description": "Music-themed avatar", "price": 110, "category": "Avatars"},
        {"id": 15, "name": "Yoga Master Avatar", "description": "Wellness-themed avatar", "price": 95, "category": "Avatars"},
        {"id": 16, "name": "Gradient Theme", "description": "Beautiful gradient colors", "price": 80, "category": "Themes"},
        {"id": 17, "name": "Dark Mode Theme", "description": "Easy on the eyes", "price": 0, "category": "Themes"},
        {"id": 18, "name": "Sunrise Theme", "description": "Warm morning colors", "price": 70, "category": "Themes"},
        {"id": 19, "name": "Mood Stickers Pack", "description": "Expressive stickers for chat", "price": 40, "category": "Cosmetics"},
        {"id": 20, "name": "Animated Themes", "description": "Live animated backgrounds", "price": 120, "category": "Themes"},
        {"id": 21, "name": "Relaxation Sounds", "description": "10 additional soundscapes", "price": 50, "category": "Content"},
        {"id": 22, "name": "Gratitude Journal", "description": "Special journal covers", "price": 30, "category": "Cosmetics"}
    ]
    
    # Organize by category
    categories = {}
    for item in shop_items:
        if item["category"] not in categories:
            categories[item["category"]] = []
        categories[item["category"]].append(item)
    
    return jsonify({
        "status": "success",
        "categories": categories
    })

@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user_data(user_id):
    """Get user data including coins, streak, and premium status"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id, username, coins, streak, premium_plan, premium_expiry, owned_items, current_theme, current_avatar, achievements FROM users WHERE id = ?', (user_id,))
            user = cursor.fetchone()
            
            if user:
                return jsonify({
                    "status": "success",
                    "user": dict(user)
                })
            else:
                return jsonify({"status": "error", "message": "User not found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/user/<int:user_id>/coins', methods=['POST'])
def update_user_coins(user_id, coins=None):
    """Update user coins (can be called internally or via API)"""
    try:
        if coins is None:
            data = request.get_json()
            coins = data.get('coins', 0)
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE users SET coins = coins + ? WHERE id = ?', (coins, user_id))
            conn.commit()
            
            if request.method == 'POST':
                return jsonify({"status": "success", "coins": coins})
            return True
    except Exception as e:
        if request.method == 'POST':
            return jsonify({"status": "error", "message": str(e)}), 500
        return False

@app.route('/api/user/<int:user_id>/purchase', methods=['POST'])
def purchase_item(user_id):
    """Purchase an item from the shop"""
    try:
        data = request.get_json()
        item_id = data.get('item_id')
        
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Get item details
            cursor.execute('SELECT * FROM shop_items WHERE id = ?', (item_id,))
            item = cursor.fetchone()
            
            if not item:
                return jsonify({"status": "error", "message": "Item not found"}), 404
            
            # Check if user has enough coins
            cursor.execute('SELECT coins FROM users WHERE id = ?', (user_id,))
            user_coins = cursor.fetchone()['coins']
            
            if user_coins < item['price']:
                return jsonify({"status": "error", "message": "Not enough coins"}), 400
            
            # Deduct coins and add item to user's owned items
            cursor.execute('UPDATE users SET coins = coins - ? WHERE id = ?', (item['price'], user_id))
            
            cursor.execute('SELECT owned_items FROM users WHERE id = ?', (user_id,))
            owned_items = json.loads(cursor.fetchone()['owned_items'] or '[]')
            owned_items.append(item_id)
            cursor.execute('UPDATE users SET owned_items = ? WHERE id = ?', (json.dumps(owned_items), user_id))
            
            conn.commit()
            
            return jsonify({"status": "success", "message": "Item purchased successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/user/<int:user_id>/streak', methods=['POST'])
def update_streak(user_id):
    """Update user streak"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Get current streak and last login date
            cursor.execute('SELECT streak, last_login FROM users WHERE id = ?', (user_id,))
            user_data = cursor.fetchone()
            current_streak = user_data['streak'] or 0
            last_login = user_data['last_login']
            
            today = datetime.now().date()
            
            # Check if user logged in yesterday (maintain streak)
            if last_login:
                last_login_date = datetime.strptime(last_login, '%Y-%m-%d').date()
                days_diff = (today - last_login_date).days
                
                if days_diff == 1:
                    # Consecutive login
                    new_streak = current_streak + 1
                elif days_diff == 0:
                    # Already logged in today
                    new_streak = current_streak
                else:
                    # Broken streak
                    new_streak = 1
            else:
                # First login
                new_streak = 1
            
            # Update streak and last login
            cursor.execute('UPDATE users SET streak = ?, last_login = ? WHERE id = ?', 
                          (new_streak, today.isoformat(), user_id))
            conn.commit()
            
            # Award coins based on streak
            coins_earned = min(new_streak, 7) * 5  # Max 35 coins per day
            update_user_coins(user_id, coins_earned)
            
            return jsonify({
                "status": "success", 
                "streak": new_streak, 
                "coinsEarned": coins_earned
            })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/analytics/<int:user_id>', methods=['GET'])
def get_user_analytics(user_id):
    """Get user analytics and mood trends"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Get mood data from chat history
            cursor.execute('''
                SELECT mood_detected, COUNT(*) as count 
                FROM chat_history 
                WHERE session_id = ? AND mood_detected IS NOT NULL
                GROUP BY mood_detected
            ''', (f"user_{user_id}",))
            
            mood_data = {}
            total_moods = 0
            for row in cursor.fetchall():
                mood_data[row['mood_detected']] = row['count']
                total_moods += row['count']
            
            # Calculate percentages
            mood_percentages = {}
            for mood, count in mood_data.items():
                mood_percentages[mood] = round((count / total_moods) * 100) if total_moods > 0 else 0
            
            # Get user progress
            cursor.execute('SELECT * FROM user_progress WHERE user_id = ?', (user_id,))
            progress = cursor.fetchone()
            
            return jsonify({
                "status": "success",
                "analytics": {
                    "moodDistribution": mood_percentages,
                    "totalChats": total_moods,
                    "progress": dict(progress) if progress else {}
                }
            })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/static/audio/<filename>')
def serve_audio(filename):
    return send_from_directory(AUDIO_FOLDER, filename)

# ========== Premium Routes ==========
@app.route('/premium/plans')
def get_premium_plans():
    plans = [
        {
            'id': 'basic',
            'name': 'Basic',
            'price': '₹199',
            'period': 'month',
            'description': 'Essential mental wellness features',
            'features': [
                'Advanced mood insights',
                'Extra voice options',
                'Basic breathing exercises',
                'Limited journal analysis'
            ]
        },
        {
            'id': 'pro',
            'name': 'Pro',
            'price': '₹499',
            'period': 'month',
            'description': 'Complete mental wellness suite',
            'features': [
                'All Basic features',
                'Unlimited coins',
                'All games unlocked',
                'Advanced AI Coach',
                'Sleep stories',
                'Priority support'
            ]
        },
        {
            'id': 'elite',
            'name': 'Elite',
            'price': '₹999',
            'period': 'month',
            'description': 'Premium experience with exclusive benefits',
            'features': [
                'All Pro features',
                'Exclusive themes & avatars',
                'Early access to new features',
                'Personalized coaching',
                'Merch discounts',
                'VIP support'
            ]
        },
        {
            'id': 'elite',
            'name': 'Elite',
            'price': '₹1999',
            'period': 'year',
            'description': 'Premium experience with exclusive benefits',
            'features': [
                'All Pro features',
                'Exclusive themes & avatars',
                'Early access to new features',
                'Personalized coaching',
                'Merch discounts',
                'VIP support'
            ]
        },
        {
            'id': 'lifetime',
            'name': 'Lifetime',
            'price': '₹4999',
            'period': 'one-time',
            'description': 'Forever access to all premium features',
            'features': [
                'Everything in Elite',
                'Lifetime access',
                'Special lifetime badge',
                'Free future updates',
                'Exclusive community',
                'Founder status'
            ]
        }
    ]
    return jsonify({'plans': plans})

@app.route('/premium/status/<int:user_id>')
def get_premium_status(user_id):
    try:
        conn = sqlite3.connect('moodmate.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT premium_plan, premium_expiry FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        
        if user:
            plan = user[0] or 'free'
            expiry = user[1]
            
            # Check if premium is still valid
            is_active = False
            if plan != 'free' and plan != 'lifetime':
                if expiry and datetime.strptime(expiry, '%Y-%m-%d') > datetime.now():
                    is_active = True
            elif plan == 'lifetime':
                is_active = True
            
            return jsonify({
                'plan': plan,
                'expiry': expiry,
                'is_active': is_active
            })
        else:
            return jsonify({'error': 'User not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/premium/subscribe', methods=['POST'])
def subscribe_premium():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        plan = data.get('plan')
        
        if not user_id or not plan:
            return jsonify({'error': 'Missing user_id or plan'}), 400
        
        conn = sqlite3.connect('moodmate.db')
        cursor = conn.cursor()
        
        # Calculate expiry date based on plan
        today = datetime.now()
        expiry_date = None
        
        if plan == 'basic' or plan == 'pro':
            expiry_date = (today + timedelta(days=30)).strftime('%Y-%m-%d')
        elif plan == 'elite':
            expiry_date = (today + timedelta(days=365)).strftime('%Y-%m-%d')
        elif plan == 'lifetime':
            expiry_date = None  # Lifetime never expires
        
        # Update user premium status
        cursor.execute(
            'UPDATE users SET premium_plan = ?, premium_expiry = ? WHERE id = ?',
            (plan, expiry_date, user_id)
        )
        conn.commit()
        
        return jsonify({
            'success': True,
            'message': f'Successfully subscribed to {plan} plan',
            'expiry': expiry_date
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/premium/features/<int:user_id>')
def get_premium_features(user_id):
    try:
        conn = sqlite3.connect('moodmate.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT premium_plan, premium_expiry FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        
        if user:
            plan = user[0] or 'free'
            expiry = user[1]
            
            # Determine which features are unlocked
            features = {
                'games': plan != 'free',
                'breathing_exercises': plan != 'free',
                'ai_coach': plan in ['pro', 'elite', 'lifetime'],
                'sleep_stories': plan in ['pro', 'elite', 'lifetime'],
                'mood_reports': plan != 'free',
                'exclusive_themes': plan in ['elite', 'lifetime'],
                'challenges': plan in ['pro', 'elite', 'lifetime'],
                'priority_support': plan in ['pro', 'elite', 'lifetime']
            }
            
            return jsonify({
                'plan': plan,
                'features': features,
                'is_active': True if plan != 'free' else False
            })
        else:
            return jsonify({'error': 'User not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

# Optional: simple health check route
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "OK", "message": "MoodMate backend running."})

# Global error handler for uncaught exceptions
@app.errorhandler(Exception)
def handle_exception(e):
    print("⚠️ Uncaught exception:", e)
    return jsonify({"success": False, "message": f"⚠️ Server error: {e}"}), 500

# ========== Run Application ==========
if __name__ == "__main__":
    # Create necessary directories
    os.makedirs('static/audio', exist_ok=True)
    
    print("🚀 Starting MoodMate Server...")
    print(f"📊 Database: moodmate.db")
    print(f"🔊 Audio folder: {AUDIO_FOLDER}")
    print(f"🤖 Gemini AI: {'Enabled' if GEMINI_API_KEY else 'Disabled'}")
    print(f"🎵 ElevenLabs TTS: {'Enabled' if ELEVENLABS_API_KEY else 'Disabled'}")
    
    app.run(host="0.0.0.0", port=5000, debug=True)