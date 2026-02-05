from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from google import genai  # CHANGED: Use NEW SDK
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
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = False

# ========== CORS Setup ==========
CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

app.register_blueprint(auth_bp, url_prefix="/")
 

# ========== Database Setup ==========
def init_db():
    conn = sqlite3.connect('moodmate.db')
    cursor = conn.cursor()
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
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT UNIQUE,
            password_hash TEXT NOT NULL,
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
            role TEXT DEFAULT 'free'
        )
    ''')
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
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', "AIzaSyD3uVixap41UJswdbJRRgR9YkvNftbScpQ")  # YOUR NEW KEY
ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')
ELEVENLABS_VOICE_ID = os.getenv('ELEVENLABS_VOICE_ID', 'pNInz6obpgDQGcFmaJgB')

# Initialize Gemini client with NEW SDK
gemini_client = None
MODEL_NAME = os.getenv('GEMINI_MODEL', "gemini-2.0-flash")

try:
    if GEMINI_API_KEY:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)  # NEW: genai.Client()
        print("✅ Gemini AI client initialized successfully")
        print(f"📝 Using API Key: {GEMINI_API_KEY[:15]}...")
        print(f"🤖 Model: {MODEL_NAME}")
        
        # Test immediately
        test_response = gemini_client.models.generate_content(
            model=MODEL_NAME,
            contents="Reply with exactly: GEMINI READY"
        )
        print(f"✅ Test successful: {test_response.text}")
    else:
        print("⚠ Gemini API key not found")
except Exception as e:
    print(f"❌ Gemini initialization failed: {e}")
    gemini_client = None

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
    "अपनी पसंदीदा किताब पढ़ो。", 
    "10 मिनट टहलो。",
    "एक अच्छी बात लिखो。", 
    "परिवार के साथ समय बिताओ。",
    "खुद को तारीफ दो。",
    "तीन चीजों के लिए आभारी रहो。",
    "एक नया गाना सीखो。",
    "प्रकृति में समय बिताओ。"
]

# ========== Helper Functions ==========
def add_coins_internal(user_id, coins):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE users SET coins = coins + ? WHERE id = ?",
                (coins, user_id)
            )
            conn.commit()
    except Exception as e:
        print("❌ Coin update error:", e)

def detect_mood(msg: str) -> str:
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
    
    return "neutral"

def save_audio_and_links(audio_bytes: bytes):
    filename = f"{uuid.uuid4().hex}.mp3"
    filepath = os.path.join(AUDIO_FOLDER, filename)
    with open(filepath, "wb") as f:
        f.write(audio_bytes)
    b64 = base64.b64encode(audio_bytes).decode("utf-8")
    return b64, f"/static/audio/{filename}"

def elevenlabs_tts(text: str):
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
    try:
        tts = gTTS(text=text, lang=lang, slow=False)
        buf = BytesIO()
        tts.write_to_fp(buf)
        buf.seek(0)
        return save_audio_and_links(buf.read())
    except Exception as e:
        print(f"❌ gTTS error: {e}")
        return None, None

def ai_generate_reply(conversation_history: list, user_message: str, user_name: str = "friend") -> dict:
    # Simple fallback responses
    fallback_responses = {
        "CRISIS": {
            "message": f"**I'm really concerned for you. Are you safe right now?**\nIf you're in immediate danger, call your local emergency number or reach a trusted person nearby.\n— Options: [I'm safe] [I need help] [Grounding 60s]",
            "chips": ["I'm safe", "I need help", "Grounding 60s"],
            "safety_check": True
        },
        "SEVERE_NEG": {
            "message": f"**Thanks for opening up, {user_name}.** That sounds really tough. **On a scale of 1–10, how intense is it right now?**\n— Options: [Breathing 60s] [Journal 2 lines] [Talk to a therapist]",
            "chips": ["Breathing 60s", "Journal 2 lines", "Therapists"],
            "safety_check": False
        },
        "MILD_NEG": {
            "message": f"**I hear you, {user_name}.** Want to try a quick coping step together or talk it out?\n— Options: [Grounding 60s] [Music for focus] [Journal]",
            "chips": ["Grounding 60s", "Music", "Journal"],
            "safety_check": False
        },
        "NEUTRAL_POS": {
            "message": f"**Love that, {user_name}!** Want to save this in your journal or keep chatting?\n— Options: [Save to journal] [New topic]",
            "chips": ["Save to journal", "New topic"],
            "safety_check": False
        },
        "CASUAL": {
            "message": f"**I'm here, {user_name}.** Tell me a bit more about what's on your mind.\n— Options: [Stress] [Relationships] [Studies]",
            "chips": ["Stress", "Relationships", "Studies"],
            "safety_check": False
        }
    }
    
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
    
    message_bucket = bucket(user_message)
    
    # Use Gemini if available
    if gemini_client:
        try:
            context = ""
            if conversation_history:
                for msg in conversation_history[-3:]:
                    role = "User" if msg['role'] == "user" else "MoodMate"
                    context += f"{role}: {msg['content']}\n"
            
            # Simple prompt that works
            prompt = f"""You are MoodMate, a warm, empathetic mental health companion.
Respond naturally and conversationally.

{context}User: {user_message}

MoodMate:"""
            
            print(f"📤 Sending to Gemini: {user_message[:50]}...")
            
            # Use NEW SDK call
            response = gemini_client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt
            )
            
            if response and response.text:
                ai_message = response.text.strip()
                print(f"✅ Gemini response: {ai_message[:100]}...")
                
                # Generate appropriate chips
                chips = []
                if "sad" in user_message.lower() or "depress" in user_message.lower():
                    chips = ["Talk about it", "Positive activity", "Call a friend"]
                elif "stress" in user_message.lower() or "anxious" in user_message.lower():
                    chips = ["Breathing exercise", "Grounding technique", "Take a break"]
                elif "angry" in user_message.lower() or "frustrated" in user_message.lower():
                    chips = ["Count to 10", "Walk it off", "Express feelings"]
                else:
                    chips = ["Tell me more", "How can I help?", "Change topic"]
                
                safety_check = message_bucket == "CRISIS"
                
                return {
                    "message": ai_message,
                    "chips": chips,
                    "safety_check": safety_check
                }
            else:
                print("❌ Gemini returned empty response")
                
        except Exception as e:
            print(f"❌ Gemini API error: {type(e).__name__}: {str(e)[:100]}")
    
    # Fallback if Gemini fails
    print("⚠️ Using fallback response")
    return fallback_responses[message_bucket]

def log_chat(session_id: str, role: str, content: str, mood: str = None):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO chat_history (session_id, role, content, mood_detected) VALUES (?, ?, ?, ?)",
            (session_id, role, content, mood)
        )
        conn.commit()

def get_chat_history(session_id: str, limit: int = 10):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT role, content, timestamp FROM chat_history WHERE session_id = ? ORDER BY timestamp ASC LIMIT ?",
            (session_id, limit)
        )
        return [dict(row) for row in cursor.fetchall()]

def detect_crisis_intent(message: str) -> bool:
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
    # Test Gemini directly
    if gemini_client:
        try:
            response = gemini_client.models.generate_content(
                model=MODEL_NAME,
                contents="Reply with exactly: WORKING"
            )
            return jsonify({
                "status": "success",
                "message": response.text,
                "gemini": "working",
                "timestamp": datetime.now().isoformat()
            })
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": f"Gemini error: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }), 500
    else:
        return jsonify({
            "status": "error",
            "message": "Gemini client not initialized",
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "success",
        "server": "MoodMate Backend",
        "database": "connected" if os.path.exists('moodmate.db') else "not found",
        "gemini_ready": gemini_client is not None,
        "gemini_model": MODEL_NAME if gemini_client else None,
        "elevenlabs_ready": bool(ELEVENLABS_API_KEY),
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        msg = (data.get('message') or '').strip()
        session_id = data.get('session_id', 'default_session')
        user_id = data.get('user_id', 1)
        
        if not msg:
            return jsonify({"status": "error", "error": "Message cannot be empty"}), 400
        
        print(f"\n📨 Chat request: '{msg}'")
        
        # Check for crisis intent
        is_crisis = detect_crisis_intent(msg)
        if is_crisis:
            return jsonify({
                "status": "crisis",
                "crisis": True,
                "message": "I'm really concerned about what you're saying. Your safety is the most important thing right now.",
                "timestamp": datetime.now().isoformat()
            })
        
        mood = detect_mood(msg)
        print(f"🎭 Mood detected: {mood}")
        
        log_chat(session_id, "user", msg, mood)
        
        history = get_chat_history(session_id, 6)
        formatted_history = [{"role": row['role'], "content": row['content']} for row in history]
        
        ai_response = ai_generate_reply(formatted_history, msg, "friend")
        log_chat(session_id, "ai", ai_response["message"])
        
        # Generate TTS
        audio_base64 = None
        audio_url = None
        fallback_used = False
        
        audio_base64, audio_url = elevenlabs_tts(ai_response["message"])
        if not audio_base64:
            audio_base64, audio_url = gtts_fallback(ai_response["message"], 'hi')
            fallback_used = True
        
        daily_challenge = random.choice(MOOD_CHALLENGES)
        
        coins_earned = 5
        add_coins_internal(user_id, coins_earned)
        
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
            "timestamp": datetime.now().isoformat(),
            "gemini_used": gemini_client is not None
        }
        
        print(f"📤 Response sent: {response_data['reply'][:50]}...")
        return jsonify(response_data)
        
    except Exception as e:
        print(f"❌ Chat error: {str(e)}")
        return jsonify({
            "status": "success",
            "reply": "I'm here for you. What would you like to talk about?",
            "mood": "neutral",
            "moodEmoji": "😊",
            "phrase": "You're doing great. Keep going!",
            "chips": ["Tell me more", "I need help", "Journal"],
            "safetyCheck": False,
            "challenge": MOOD_CHALLENGES[0],
            "fallbackUsed": True,
            "coinsEarned": 0,
            "timestamp": datetime.now().isoformat()
        })

# [Keep all your other routes exactly as they are - therapists, shop, user, premium, etc.]

@app.route('/api/therapists', methods=['GET'])
def get_therapists():
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
    return jsonify({"status": "success", "therapists": therapists})

# [Keep all other routes exactly as you have them]

@app.route('/test', methods=['GET'])
def simple_test():
    return jsonify({"status": "success", "message": "Server is running"})

if __name__ == "__main__":
    os.makedirs('static/audio', exist_ok=True)
    
    print("\n" + "="*60)
    print("🚀 Starting MoodMate Server with NEW Gemini SDK")
    print("="*60)
    print(f"📊 Database: moodmate.db")
    print(f"🔊 Audio folder: {AUDIO_FOLDER}")
    print(f"🤖 Gemini AI: {'✅ Enabled' if gemini_client else '❌ Disabled'}")
    print(f"🤖 Model: {MODEL_NAME}")
    print(f"🎵 ElevenLabs TTS: {'✅ Enabled' if ELEVENLABS_API_KEY else '❌ Disabled'}")
    print("="*60)
    
    app.run(host="0.0.0.0", port=5000, debug=True)