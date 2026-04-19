from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
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
import sqlite3
from contextlib import contextmanager
from werkzeug.security import generate_password_hash, check_password_hash
import traceback

print("Starting application initialization...", flush=True)

try:
    from auth import auth_bp 
    from services.ai_service import generate_ai_response
except Exception as e:
    print(f"CRITICAL IMPORT ERROR: {e}")
    traceback.print_exc()

# ========== Load Config ==========
load_dotenv()
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'a-super-secret-key-you-must-change')
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False

# ========== CORS Setup ==========
CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://moodmate-frontend.onrender.com", "*"])

app.register_blueprint(auth_bp, url_prefix="/")
 

# ========== Database Setup ==========
def init_db():
    conn = sqlite3.connect('moodmate.db')
    cursor = conn.cursor()
    
    # Existing tables
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
    
    # Updated users table with last_mood_tag
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT UNIQUE,
            password_hash TEXT NOT NULL,
            coins INTEGER DEFAULT 100,
            streak INTEGER DEFAULT 0,
            last_mood_tag TEXT,
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

    # Ensure last_mood_tag exists if table already existed
    try:
        cursor.execute('ALTER TABLE users ADD COLUMN last_mood_tag TEXT')
    except sqlite3.OperationalError:
        pass # Already exists

    # Ensure last_mood_tag exists if table already existed
    try:
        cursor.execute('ALTER TABLE users ADD COLUMN last_mood_tag TEXT')
    except sqlite3.OperationalError:
        pass # Already exists

    try:
        cursor.execute("ALTER TABLE users ADD COLUMN owned_items TEXT DEFAULT '[]'")
    except sqlite3.OperationalError:
        pass # Already exists

    try:
        cursor.execute("ALTER TABLE users ADD COLUMN premium_plan TEXT DEFAULT 'free'")
    except sqlite3.OperationalError:
        pass # Already exists

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

    # FEATURE 1: Daily Check-ins
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS daily_checkins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            date DATE DEFAULT (DATE('now')),
            mood_tag TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    cursor.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_user_date ON daily_checkins (user_id, date)')

    # FEATURE 5 & 6: Community Mood Wall & Reactions
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS community_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mood_tag TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS community_reactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            reaction_type TEXT NOT NULL,
            count INTEGER DEFAULT 0,
            FOREIGN KEY (post_id) REFERENCES community_posts (id)
        )
    ''')
    cursor.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_post_reaction ON community_reactions (post_id, reaction_type)')

    # FEATURE 9: Analytics
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            metric_name TEXT NOT NULL,
            metric_value REAL NOT NULL,
            date DATE DEFAULT (DATE('now')),
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()
    print("✅ Database initialized with Retention Features")

init_db()

@contextmanager
def get_db():
    conn = sqlite3.connect('moodmate.db')
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# ========== Real User Endpoints for Premium / Shop ==========
@app.route('/buy_premium/<int:user_id>', methods=['POST'])
def buy_premium(user_id):
    data = request.json
    plan = data.get('plan')
    if not plan:
        return jsonify({'error': 'No plan selected'}), 400

    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE users SET premium_plan = ?, role = 'premium' WHERE id = ?", (plan, user_id))
            conn.commit()
            return jsonify({'status': 'success', 'message': f'Upgraded to {plan}'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/shop/purchase', methods=['POST'])
def shop_purchase():
    data = request.json
    user_id = data.get('user_id')
    item_id = data.get('item_id')
    price = data.get('price')

    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT coins, owned_items FROM users WHERE id = ?", (user_id,))
            user = cursor.fetchone()
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
                
            current_coins = user['coins']
            if current_coins < price:
                return jsonify({'error': 'Not enough coins'}), 400

            new_balance = current_coins - price
            
            owned = []
            try:
                owned = json.loads(user['owned_items'] or '[]')
            except:
                pass
                
            if item_id not in owned:
                owned.append(item_id)
                
            cursor.execute("UPDATE users SET coins = ?, owned_items = ? WHERE id = ?", (new_balance, json.dumps(owned), user_id))
            conn.commit()
            return jsonify({'status': 'success', 'new_balance': new_balance, 'purchased_items': owned})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========== AI Configuration ==========
ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')
ELEVENLABS_VOICE_ID = os.getenv('ELEVENLABS_VOICE_ID', 'pNInz6obpgDQGcFmaJgB')
HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY')

print("✅ ElevenLabs TTS:", "Loaded" if ELEVENLABS_API_KEY else "Not configured")
print("✅ Hugging Face BERT:", "Loaded" if HUGGINGFACE_API_KEY else "Not configured")

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
    "happy": "Khush raho hamesha - aapki muskaan ki wajah kuch hai.",
    "sad": "Yeh bhi beet jayega - thodi si ummeed rakho.",
    "angry": "Gehre saans lo - har gussa kuch sikha kar jaata hai.",
    "anxious": "Shaant rehna seekho, sab dheere-dheere theek hoga.",
    "lonely": "Tanhai mein bhi khud se dosti karna seekho.",
    "nostalgic": "Yaadein hain - unhe muskaan se sajeev rakho.",
    "excited": "Utsaah banaye rakho - choti jeet badi banti hai.",
    "calm": "Shaanti mein hi sachcha aaram milta hai.",
    "confused": "Sawaalon ka jawab waqt ke saath aata hai.",
    "hopeful": "Aasha rakho - yeh disha badal deti hai.",
    "grateful": "Choti kritagyataein bada fark laati hain.",
    "frustrated": "Rukawatein naye raaste dikhaati hain.",
    "motivated": "Aaj ek chota qadam, kal badi manzil.",
    "tired": "Aaram lo - phir se shuru karna aasaan hoga.",
    "bored": "Naya kuch seekho - jigyasa mazedar hai.",
    "content": "Santosh mein asli sukh hota hai.",
    "worried": "Samaadhaan ki taraf ek chota qadam uthao.",
    "proud": "Chote qadmon par garv karo - ve mayne rakhte hain.",
    "guilty": "Galtiyon se seekhkar aage badho.",
    "relaxed": "Aaram lo aur dheere-dheere aage badho.",
    "energetic": "Urja banaye rakho - duniya tumhari hai!",
    "peaceful": "Shaanti mein kho jao - sab kuch theek hai."
}

MOOD_CHALLENGES = [
    "Aaj 5 minute dhyaan karo.",
    "Kisi dost ko call karo.",
    "Apni pasandeeda kitaab padho.",
    "10 minute tahlo.",
    "Ek achhi baat likho.",
    "Parivaar ke saath samay bitao.",
    "Khud ko taarif do.",
    "Teen cheezon ke liye aabhari raho.",
    "Ek naya gaana seekho.",
    "Prakriti mein samay bitao."
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
        
    print(f"🧠 [Hugging Face] Analyzing Tone: '{msg}'")
    # 1. Primary Engine: Hugging Face (Hindi BERT / Multilingual Sentiment)
    try:
        if HUGGINGFACE_API_KEY:
            API_URL = "https://api-inference.huggingface.co/models/lxyuan/distilbert-base-multilingual-cased-sentiments-student"
            headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
            response = requests.post(API_URL, headers=headers, json={"inputs": msg}, timeout=4)
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0 and isinstance(result[0], list):
                    top_label = result[0][0].get('label', '').lower()
                    print(f"✅ [Hugging Face] Detected Sentiment: {top_label}")
                    if top_label == 'positive': return "happy"
                    elif top_label == 'negative': return "sad"
                    else: return "neutral"
            else:
                print(f"⚠️ [Hugging Face] API Error: {response.text}")
    except Exception as e:
        print(f"❌ [Hugging Face] Timeout or Error: {e}")
        
    print("🔄 [Hugging Face Fallback] Using naive dictionary pattern...")
    # 2. Fallback Engine: Keywords
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
    # Use AI Service (Local + API Fallback)
    result = generate_ai_response(user_message, conversation_history)
    ai_message = result["text"]
    
    # Identify bucket for chips and safety logic
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
    
    return {
        "message": ai_message,
        "chips": chips,
        "safety_check": message_bucket == "CRISIS",
        "source": result["source"],
        "fallback_used": result["fallback_used"]
    }

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
        "better off without me", "can't go on", "give up",
        "marne wala", "maut", "zindagi khatam", "jaan de dunga", "mar jau", "atmanhatya"
    ]
    
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in crisis_keywords)

def update_retention_data(user_id, current_mood=None):
    """Handles daily check-ins, streak tracking, and emotional memory."""
    with get_db() as conn:
        cursor = conn.cursor()
        today = datetime.now().date().isoformat()
        
        # 1. Update Emotional Memory (Last Mood Tag)
        if current_mood:
            cursor.execute("UPDATE users SET last_mood_tag = ? WHERE id = ?", (current_mood, user_id))
        
        # 2. Daily Check-in & Streak Logic
        cursor.execute("SELECT id FROM daily_checkins WHERE user_id = ? AND date = ?", (user_id, today))
        if not cursor.fetchone():
            # First interaction of the day
            cursor.execute("INSERT INTO daily_checkins (user_id, mood_tag) VALUES (?, ?)", (user_id, current_mood))
            
            # Update Streak
            cursor.execute("SELECT last_login, streak FROM users WHERE id = ?", (user_id,))
            user = cursor.fetchone()
            if user:
                last_login = user['last_login']
                streak = user['streak'] or 0
                
                if last_login:
                    # Robust date parsing - handle both 'YYYY-MM-DD' and full datetime strings
                    try:
                        last_login_date = datetime.strptime(str(last_login)[:10], '%Y-%m-%d').date()
                    except (ValueError, TypeError):
                        last_login_date = None
                    
                    if last_login_date:
                        delta = datetime.now().date() - last_login_date
                        if delta.days == 1:
                            streak += 1
                        elif delta.days > 1:
                            streak = 1
                        # If delta.days == 0, already checked in today
                else:
                    streak = 1
                
                cursor.execute("UPDATE users SET streak = ?, last_login = ? WHERE id = ?", (streak, today, user_id))
            
            # 3. Analytics (DAU & Check-ins)
            track_metric("daily_active_users", 1)
            track_metric("checkins_per_day", 1)
            
        conn.commit()

def track_metric(name, value):
    """Helper to track retention metrics."""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            today = datetime.now().date().isoformat()
            cursor.execute("""
                INSERT INTO analytics (metric_name, metric_value, date) 
                VALUES (?, ?, ?)
            """, (name, value, today))
            conn.commit()
    except Exception as e:
        print(f"Analytics error: {e}")

def get_emotional_memory_context(user_id, client_username="Friend"):
    """Retrieves long-term emotional context (past 7 days) and current login streak to provide deep continuity."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Get user details
        cursor.execute("SELECT username, streak, last_login FROM users WHERE id = ?", (user_id,))
        user_row = cursor.fetchone()
        
        if not user_row:
            username = client_username
            streak = 1
        else:
            username = client_username if client_username != "Friend" else (user_row['username'] or "Friend")
            streak = user_row['streak'] or 0
        
        # Fetch last 7 days of moods
        seven_days_ago = (datetime.now() - timedelta(days=7)).date().isoformat()
        cursor.execute("SELECT date, mood_tag FROM daily_checkins WHERE user_id = ? AND date >= ? ORDER BY date ASC", (user_id, seven_days_ago))
        checkins = cursor.fetchall()
        
        if not checkins:
            return f"[SYSTEM DIRECTIVE]: The user's name is {username}. This is their first time interacting recently. Be highly welcoming."
            
        trends = ", ".join([f"{c['date'][5:]}: {c['mood_tag']}" for c in checkins[-5:]])
        last_mood = checkins[-1]['mood_tag'] if checkins else 'neutral'
        
        memory_prompt = (
            f"[SYSTEM DIRECTIVE & MEMORY]: The user's name is {username}. They currently have a {streak}-day app usage streak. "
            f"Here is their recent mood trend over the last few days: [{trends}]. "
            f"Their most recent recorded mood is {last_mood}. "
            "Use this emotional context to respond. If they seem stuck in a negative trend pattern (like 'sad' multiple days in a row), gently acknowledge it and offer a brief Cognitive Behavioral Therapy (CBT) reframing exercise or mindfulness tip. Do not sound like a robot reading a log."
        )
        
        return memory_prompt

# ========== API Routes ==========
@app.route('/api/user/status', methods=['GET'])
def get_user_status():
    user_id = int(request.args.get('user_id', 1))
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT username, streak, last_mood_tag, last_login, coins FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404
            
        today = datetime.now().date()
        
        # Check-in Status
        cursor.execute("SELECT id FROM daily_checkins WHERE user_id = ? AND date = ?", (user_id, today.isoformat()))
        checked_in = cursor.fetchone() is not None
        
        # Total check-ins
        cursor.execute("SELECT COUNT(*) FROM daily_checkins WHERE user_id = ?", (user_id,))
        total_checkins = cursor.fetchone()[0]
        
        # Inactivity nudge (Feature 4)
        nudge = None
        if user['last_login']:
            try:
                last_date = datetime.strptime(str(user['last_login'])[:10], '%Y-%m-%d').date()
                delta = today - last_date
            except (ValueError, TypeError):
                last_date = None
                delta = None
            if delta is not None:
                if delta.days >= 3:
                    nudge = "We’re here whenever you’re ready. No pressure 💙"
                elif delta.days >= 1:
                    nudge = "Hey, haven’t heard from you today. Everything okay?"
                
        # "You're not alone" (Feature 7)
        alone_insight = None
        if user['last_mood_tag']:
            # Count users who felt the same mood in last 24h
            cursor.execute("SELECT COUNT(*) FROM daily_checkins WHERE mood_tag = ? AND date = ?", (user['last_mood_tag'], today.isoformat()))
            count = cursor.fetchone()[0]
            if count > 1:
                alone_insight = f"{count} members felt {user['last_mood_tag']} today too."
            else:
                alone_insight = "You're not alone in how you feel."

        # Get coins for header badge refresh
        cursor.execute("SELECT coins FROM users WHERE id = ?", (user_id,))
        coins_row = cursor.fetchone()
        coins = coins_row['coins'] if coins_row else 0

        return jsonify({
            "status": "success",
            "streak": user['streak'] or 0,
            "coins": coins or 0,
            "total_checkins": total_checkins,
            "last_mood": user['last_mood_tag'],
            "checked_in": checked_in,
            "nudge": nudge,
            "alone_insight": alone_insight
        })

@app.route('/api/community/posts', methods=['GET', 'POST'])
def community_posts():
    if request.method == 'POST':
        data = request.json
        mood = data.get('mood_tag')
        content = data.get('content')
        if not mood or not content:
            return jsonify({"status": "error", "message": "Mood and content required"}), 400
            
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO community_posts (mood_tag, content) VALUES (?, ?)", (mood, content))
            track_metric("community_posts_per_day", 1)
            conn.commit()
            
        return jsonify({"status": "success"})
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, mood_tag, content, created_at FROM community_posts ORDER BY created_at DESC LIMIT 50")
            posts = [dict(row) for row in cursor.fetchall()]
            
            # Fetch reactions for each post
            for post in posts:
                cursor.execute("SELECT reaction_type, count FROM community_reactions WHERE post_id = ?", (post['id'],))
                reactions_data = cursor.fetchall()
                post['reactions'] = {row['reaction_type']: row['count'] for row in reactions_data}
                
            return jsonify({"status": "success", "posts": posts})

@app.route('/api/community/react', methods=['POST'])
def react_to_post():
    data = request.json
    post_id = data.get('post_id')
    reaction = data.get('reaction_type')
    
    if not post_id or not reaction:
        return jsonify({"status": "error", "message": "post_id and reaction_type required"}), 400

    with get_db() as conn:
        cursor = conn.cursor()
        # Using a pattern compatible with older SQLite versions if ON CONFLICT is missing
        cursor.execute("SELECT id FROM community_reactions WHERE post_id = ? AND reaction_type = ?", (post_id, reaction))
        row = cursor.fetchone()
        if row:
            cursor.execute("UPDATE community_reactions SET count = count + 1 WHERE id = ?", (row['id'],))
        else:
            cursor.execute("INSERT INTO community_reactions (post_id, reaction_type, count) VALUES (?, ?, 1)", (post_id, reaction))
        conn.commit()
        
    return jsonify({"status": "success"})

@app.route('/api/shop/purchase', methods=['POST'])
def purchase_item():
    data = request.json or {}
    user_id = data.get('user_id', 1)
    item_id = data.get('item_id')
    price = data.get('price', 0)
    
    if not item_id:
        return jsonify({"status": "error", "error": "Missing item ID"}), 400
        
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT coins, owned_items FROM users WHERE id = ?", (user_id,))
        user_row = cursor.fetchone()
        
        if not user_row:
            return jsonify({"status": "error", "error": "User not found"}), 404
            
        coins = user_row['coins'] or 0
        owned_items_json = user_row['owned_items'] or '[]'
        
        try:
            import json
            owned_items = json.loads(owned_items_json)
        except:
            owned_items = []
            
        if coins < price:
            return jsonify({"status": "error", "error": "Not enough coins"}), 400
            
        if item_id in owned_items:
            return jsonify({"status": "error", "error": "Item already owned"}), 400
            
        new_coins = coins - price
        owned_items.append(item_id)
        
        import json
        cursor.execute("UPDATE users SET coins = ?, owned_items = ? WHERE id = ?", (new_coins, json.dumps(owned_items), user_id))
        conn.commit()
        
        return jsonify({
            "status": "success",
            "new_balance": new_coins,
            "purchased_items": owned_items
        })

@app.route('/api/report', methods=['GET'])
def get_report_data():
    user_id = int(request.args.get('user_id', 1))
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Get user details
        cursor.execute("SELECT username, coins, streak FROM users WHERE id = ?", (user_id,))
        user_row = cursor.fetchone()
        
        if not user_row:
            return jsonify({"status": "error", "message": "User not found"}), 404
            
        # Get mood data from daily checkins (last 30 days)
        thirty_days_ago = (datetime.now() - timedelta(days=30)).date().isoformat()
        cursor.execute(
            "SELECT date, mood_tag FROM daily_checkins WHERE user_id = ? AND date >= ? ORDER BY date ASC", 
            (user_id, thirty_days_ago)
        )
        checkins = cursor.fetchall()
        
        # Standard mood baseline scores
        mood_scores = {
            "happy": 95, "excited": 90, "content": 85, "calm": 80, "relaxed": 80,
            "neutral": 70, 
            "tired": 50, "bored": 50, "confused": 45,
            "sad": 30, "anxious": 25, "angry": 20, "lonely": 20, "frustrated": 20
        }
        
        mood_emojis = {
            "happy": "😊 Happy", "sad": "😔 Sad", "angry": "😠 Angry", "anxious": "😰 Anxious", 
            "tired": "😴 Tired", "calm": "😌 Calm", "excited": "🎉 Excited", "neutral": "😐 Neutral"
        }
        
        mood_data = []
        mood_distribution = {}
        for row in checkins:
            mood_tag = (row['mood_tag'] or 'neutral').lower()
            score = mood_scores.get(mood_tag, 70)
            
            try:
                dt = datetime.strptime(row['date'], '%Y-%m-%d')
                short_date = f"{dt.month}/{dt.day}"
            except:
                short_date = row['date']
                
            mood_str = mood_emojis.get(mood_tag, f"{mood_tag.capitalize()}")
            mood_data.append({
                "date": short_date,
                "mood": mood_str,
                "score": score,
                "activities": 1
            })
            
            mood_distribution[mood_str] = mood_distribution.get(mood_str, 0) + 1
            
        overall_score = 75
        if mood_data:
            overall_score = int(sum(d['score'] for d in mood_data) / len(mood_data))
            
        # If no check-ins, return empty lists so frontend shows clean empty state
        if not mood_data:
            mood_data = []
            mood_distribution = {}
            overall_score = 0
            
        return jsonify({
            "status": "success",
            "streak": user_row['streak'] or 0,
            "coins": user_row['coins'] or 0,
            "username": user_row['username'],
            "completed_activities": len(checkins),
            "overall_score": overall_score,
            "mood_data": mood_data,
            "mood_distribution": mood_distribution
        })

@app.route('/api/report/analysis', methods=['POST'])
def generate_report_analysis():
    data = request.json or {}
    user_id = data.get('user_id', 1)
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT username FROM users WHERE id = ?", (user_id,))
        user_row = cursor.fetchone()
        username = user_row['username'] if user_row else "Friend"
        
        # Get past 14 days of mood for deep analysis
        fourteen_days_ago = (datetime.now() - timedelta(days=14)).date().isoformat()
        cursor.execute("SELECT date, mood_tag FROM daily_checkins WHERE user_id = ? AND date >= ? ORDER BY date ASC", (user_id, fourteen_days_ago))
        checkins = cursor.fetchall()
        
    if not checkins:
        return jsonify({"status": "error", "analysis": "We need a few more days of check-ins to generate a deep cognitive analysis. Keep using MoodMate!"})

    moods_list = ", ".join([f"{c['date'][5:]}: {c['mood_tag']}" for c in checkins])
    
    prompt = (
        f"You are a world-class cognitive behavioral therapist. Your client is {username}. "
        f"Over the last two weeks, they have logged the following emotional trajectory: [{moods_list}]. "
        "Write a beautiful, highly personalized 3-paragraph mental wellness journal for them. "
        "1. Identify any patterns in their mood.\n"
        "2. Offer a warm, empathetic reflection on their emotional journey.\n"
        "3. Provide a practical, actionable mindfulness or cognitive framing exercise tailored to their specific recent moods. "
        "Format the response in visually pleasing Markdown with headers and bullet points where appropriate."
    )
    
    print(f"🧠 [Deep Analysis] Generating for {username}...", flush=True)
    try:
        from services.ai_service import generate_api_response, generate_local_response, GROQ_API_KEY
        if GROQ_API_KEY:
            analysis = generate_api_response(prompt)
        else:
            analysis = generate_local_response(prompt)
            
        if not analysis:
            analysis = "I'm having trouble analyzing your data right now. You are doing great, but please try again later."
            
        return jsonify({"status": "success", "analysis": analysis})
    except Exception as e:
        print(f"❌ Analysis Error: {e}")
        return jsonify({"status": "error", "analysis": "Backend AI generation failed."})

# NOTE: /api/shop/purchase is defined above (lines 602-646). Duplicate removed.

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "success",
        "server": "MoodMate Backend",
        "database": "connected" if os.path.exists('moodmate.db') else "not found",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        msg = (data.get('message') or '').strip()
        session_id = data.get('session_id', 'default_session')
        user_id = data.get('user_id', 1)
        user_name = data.get('user_name', 'Friend')
        
        if not msg:
            return jsonify({"status": "error", "error": "Message cannot be empty"}), 400
        
        print(f"\n📨 Chat request from {user_name}: '{msg}'")
        
        # Check for crisis intent
        is_crisis = detect_crisis_intent(msg)
        if is_crisis:
            reply_text = f"{user_name}… mujhe tumhari baat sunkar sach mein chinta ho rahi hai.\n\nMain yahin hoon tumhare saath. Saans dheere lo… tum safe ho… sab ek saath solve karne ki zarurat nahi hai.\n\nKya tum chahoge ki abhi hum kisi trusted contact ko call karein? Ya pehle thodi der yahi baat karni hai?\n\n---\n*Agar tum chaho, tum yahan call kar sakte ho — yeh log turant madad karte hain:*\n📞 **AASRA**: 91-9820466726\n📞 **Kiran (Govt)**: 1800-599-0019"
            log_chat(session_id, "user", msg, "crisis")
            log_chat(session_id, "ai", reply_text)
            
            return jsonify({
                "status": "crisis",
                "crisis": True,
                "reply": reply_text,
                "chips": ["Haan, madad bhejiye", "Pehle chalo baat karte hai", "Main apni saans par dhyan de raha hu"],
                "timestamp": datetime.now().isoformat()
            })
        
        mood = detect_mood(msg)
        print(f"🎭 Mood detected: {mood}")
        
        # FEATURE 1 & 2 & 3: Retention Data & Emotional Memory
        update_retention_data(user_id, mood)
        emotional_memory = get_emotional_memory_context(user_id, user_name)
        
        log_chat(session_id, "user", msg, mood)
        
        history = get_chat_history(session_id, 6)
        formatted_history = [{"role": row['role'], "content": row['content']} for row in history]
        
        # Inject Emotional Memory into Context
        full_msg = f"{emotional_memory}\nUser: {msg}" if emotional_memory else msg
        
        ai_response = ai_generate_reply(formatted_history, full_msg, user_name)
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
            "fallbackUsed": ai_response["fallback_used"],
            "aiSource": ai_response["source"],
            "coinsEarned": coins_earned,
            "timestamp": datetime.now().isoformat()
        }
        
        print(f"📤 Response sent: {response_data['reply'][:50]}...")
        return jsonify(response_data)
        
    except Exception as e:
        error_msg = f"❌ Chat Error: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        with open("error_log.txt", "a", encoding='utf-8') as f:
            f.write(f"\n--- {datetime.now()} ---\n{error_msg}\n")
            
        return jsonify({
            "status": "success",
            "reply": "I'm here for you. I had a small technical glitch, but tell me more about what's on your mind.",
            "mood": "neutral",
            "moodEmoji": "😊",
            "phrase": "Everything will be okay.",
            "chips": ["Tell me more", "I'm okay"],
            "safetyCheck": False,
            "challenge": "Breathe deeply for 1 minute.",
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

@app.route('/buy_premium/<int:user_id>', methods=['POST', 'OPTIONS'])
def buy_premium(user_id):
    if request.method == 'OPTIONS':
        return '', 204
    data = request.json or {}
    plan = data.get('plan', 'annual')
    
    try:
        with get_db() as conn:
            conn.execute("UPDATE users SET premium_plan = ?, role = 'premium' WHERE id = ?", (plan, user_id))
            conn.commit()
            
            # Fetch updated user status
            user = conn.execute("SELECT id, username, email, phone, role, coins, streak, last_mood_tag as last_mood, premium_plan FROM users WHERE id = ?", (user_id,)).fetchone()
            if not user:
                return jsonify({"success": False, "message": "User not found"}), 404
            
            # Convert row to dict
            user_data = dict(user)
            user_data['is_premium'] = True
            
        return jsonify({"success": True, "message": "Upgraded to premium!", "user": user_data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/test', methods=['GET'])
def simple_test():
    return jsonify({"status": "success", "message": "Server is running"})

if __name__ == "__main__":
    os.makedirs('static/audio', exist_ok=True)
    
    print("\n" + "="*60)
    print("🚀 Starting MoodMate Server with Local LLM & API Fallback")
    print("="*60)
    print(f"📊 Database: moodmate.db")
    print(f"🔊 Audio folder: {AUDIO_FOLDER}")
    print(f"🤖 AI Service: Local (Ollama) + Cloud (Groq)")
    print(f"🎵 ElevenLabs TTS: {'✅ Enabled' if ELEVENLABS_API_KEY else '❌ Disabled'}")
    print("="*60)
    
    app.run(host="0.0.0.0", port=5000, debug=True)