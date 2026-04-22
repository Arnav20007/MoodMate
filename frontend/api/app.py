from flask import Flask, request, jsonify, send_from_directory, session
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
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from werkzeug.security import generate_password_hash, check_password_hash
import bcrypt
import traceback
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from security import encrypt_data, decrypt_data
from services.email_service import email_service
import stripe
from functools import wraps, lru_cache
import time

print("Starting application initialization...", flush=True)
try:
    from auth import auth_bp 
    from services.ai_service import generate_ai_response
    from doctor_seed import SAMPLE_DOCTORS
except Exception as e:
    print(f"CRITICAL IMPORT ERROR: {e}")
    traceback.print_exc()

# ========== Load Config ==========
load_dotenv()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get('MOODMATE_DB_PATH') or os.path.join(BASE_DIR, 'moodmate.db')
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'a-super-secret-key-you-must-change')
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = os.getenv('SESSION_COOKIE_SECURE', 'false').lower() == 'true'

# --- Database Selection ---
DATABASE_URL = os.environ.get('DATABASE_URL')
IS_POSTGRES = DATABASE_URL and DATABASE_URL.startswith('postgres')

# ========== CORS Setup ==========
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://moodmate-frontend.onrender.com",
]
extra_origins = [origin.strip() for origin in (os.getenv("CORS_ALLOWED_ORIGINS") or "").split(",") if origin.strip()]
CORS(app, supports_credentials=True, origins=allowed_origins + extra_origins)

# ========== Rate Limiting ==========
limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=["500 per day", "100 per hour"],
    storage_uri="memory://",
)

app.register_blueprint(auth_bp, url_prefix="/")

# ========== Database Utilities ==========
def safe_print(*parts):
    text = " ".join(str(part) for part in parts)
    try:
        print(text, flush=True)
    except UnicodeEncodeError:
        print(text.encode("ascii", "replace").decode("ascii"), flush=True)

def dumps_json(value):
    return json.dumps(value, ensure_ascii=True)

def loads_json(value, default):
    try:
        return json.loads(value) if value else default
    except Exception:
        return default

def fix_sql_for_db(query):
    if IS_POSTGRES:
        query = query.replace("AUTOINCREMENT", "")
        query = query.replace("INTEGER PRIMARY KEY", "SERIAL PRIMARY KEY")
        query = query.replace("DATETIME DEFAULT CURRENT_TIMESTAMP", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
        query = query.replace("CREATE INDEX IF NOT EXISTS", "CREATE INDEX")
    return query

@contextmanager
def get_db():
    if IS_POSTGRES:
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    else:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def seed_sample_doctors(conn):
    cursor = conn.cursor()
    for doctor in SAMPLE_DOCTORS:
        placeholder = "%s" if IS_POSTGRES else "?"
        query = f"""
            INSERT INTO doctors (
                id, name, initials, email, password_hash, specialization, experience_years,
                languages_json, modes_json, price_per_session, rating, reviews_count,
                badge, bio, license_info, qualifications_json, approaches_json,
                focus_areas_json, best_for, first_session, cancellation_policy,
                review_summary, availability_json, photo_url, is_verified,
                profile_source, profile_status
            )
            VALUES ({', '.join([placeholder]*27)})
        """
        if IS_POSTGRES:
            query += """
                ON CONFLICT(id) DO UPDATE SET
                    name = EXCLUDED.name, email = EXCLUDED.email, bio = EXCLUDED.bio,
                    is_verified = EXCLUDED.is_verified, profile_source = EXCLUDED.profile_source
            """
        else:
            query += """
                ON CONFLICT(id) DO UPDATE SET
                    name = excluded.name, email = excluded.email, bio = excluded.bio,
                    is_verified = excluded.is_verified, profile_source = excluded.profile_source
            """
        
        params = (
            doctor["id"], doctor["name"], doctor["initials"], doctor["email"],
            doctor["password_hash"], doctor["specialization"], doctor["experience_years"],
            dumps_json(doctor["languages"]), dumps_json(doctor["modes"]),
            doctor["price_per_session"], doctor["rating"], doctor["reviews_count"],
            doctor["badge"], doctor["bio"], doctor["license_info"],
            dumps_json(doctor["qualifications"]), dumps_json(doctor["approaches"]),
            dumps_json(doctor["focus_areas"]), doctor["best_for"], doctor["first_session"],
            doctor["cancellation_policy"], doctor["review_summary"],
            dumps_json(doctor["availability"]), doctor["photo_url"], 1,
            doctor["profile_source"], "active",
        )
        cursor.execute(query, params)

def seed_default_admin(conn):
    admin_email = os.getenv("MOODMATE_ADMIN_EMAIL", "admin@moodmate.in").strip().lower()
    admin_password = os.getenv("MOODMATE_ADMIN_PASSWORD", "Admin123!Demo")
    
    placeholder = "%s" if IS_POSTGRES else "?"
    cursor = conn.cursor()
    cursor.execute(f"SELECT id FROM users WHERE email = {placeholder}", (admin_email,))
    existing = cursor.fetchone()
    password_hash = bcrypt.hashpw(admin_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    
    if existing:
        user_id = existing[0]  # Both SQLite Row and plain psycopg2 tuple support index 0
        cursor.execute(
            f"UPDATE users SET username = {placeholder}, password_hash = {placeholder}, role = 'admin' WHERE id = {placeholder}",
            ("MoodMate Admin", password_hash, user_id),
        )
    else:
        cursor.execute(
            f"INSERT INTO users (username, email, phone, password_hash, premium_plan, role) VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder})",
            ("MoodMate Admin", admin_email, "9000000000", password_hash, "annual", "admin"),
        )

def init_db():
    if IS_POSTGRES:
        conn = psycopg2.connect(DATABASE_URL)
    else:
        conn = sqlite3.connect(DB_PATH)
    
    cursor = conn.cursor()
    
    cursor.execute(fix_sql_for_db('''
        CREATE TABLE IF NOT EXISTS chat_history (
            id SERIAL PRIMARY KEY,
            session_id TEXT NOT NULL DEFAULT 'default_session',
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            mood_detected TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    '''))
    
    cursor.execute(fix_sql_for_db('''
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
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
    '''))

    cursor.execute(fix_sql_for_db('''
        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            initials TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            specialization TEXT NOT NULL,
            experience_years INTEGER DEFAULT 0,
            languages_json TEXT DEFAULT '[]',
            modes_json TEXT DEFAULT '[]',
            price_per_session INTEGER DEFAULT 0,
            rating REAL DEFAULT 0,
            reviews_count INTEGER DEFAULT 0,
            badge TEXT DEFAULT '',
            bio TEXT DEFAULT '',
            license_info TEXT DEFAULT '',
            qualifications_json TEXT DEFAULT '[]',
            approaches_json TEXT DEFAULT '[]',
            focus_areas_json TEXT DEFAULT '[]',
            best_for TEXT DEFAULT '',
            first_session TEXT DEFAULT '',
            cancellation_policy TEXT DEFAULT '',
            review_summary TEXT DEFAULT '',
            availability_json TEXT DEFAULT '[]',
            photo_url TEXT DEFAULT '',
            is_verified INTEGER DEFAULT 0,
            profile_source TEXT DEFAULT 'sample',
            profile_status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    '''))

    cursor.execute(fix_sql_for_db('''
        CREATE TABLE IF NOT EXISTS therapeutic_notes (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            doctor_id INTEGER,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    '''))

    cursor.execute(fix_sql_for_db('''
        CREATE TABLE IF NOT EXISTS therapy_bookings (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            doctor_id INTEGER NOT NULL,
            doctor_name TEXT NOT NULL,
            patient_name TEXT NOT NULL,
            patient_age TEXT,
            patient_gender TEXT,
            patient_phone TEXT NOT NULL,
            concern TEXT NOT NULL,
            slot TEXT NOT NULL,
            session_mode TEXT,
            session_price INTEGER DEFAULT 0,
            status TEXT DEFAULT 'new',
            doctor_notes TEXT DEFAULT '',
            token_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    '''))

    cursor.execute(fix_sql_for_db('''
        CREATE TABLE IF NOT EXISTS daily_checkins (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            date DATE DEFAULT CURRENT_DATE,
            mood_tag TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    '''))

    cursor.execute(fix_sql_for_db('''
        CREATE TABLE IF NOT EXISTS community_posts (
            id SERIAL PRIMARY KEY,
            author_user_id INTEGER,
            mood_tag TEXT NOT NULL,
            content TEXT NOT NULL,
            visibility_status TEXT DEFAULT 'visible',
            moderation_note TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    '''))

    cursor.execute(fix_sql_for_db('''
        CREATE TABLE IF NOT EXISTS community_reactions (
            id SERIAL PRIMARY KEY,
            post_id INTEGER NOT NULL,
            reaction_type TEXT NOT NULL,
            count INTEGER DEFAULT 0
        )
    '''))

    cursor.execute(fix_sql_for_db('''
        CREATE TABLE IF NOT EXISTS community_reports (
            id SERIAL PRIMARY KEY,
            post_id INTEGER NOT NULL,
            reporter_user_id INTEGER NOT NULL,
            reason TEXT NOT NULL,
            details TEXT DEFAULT '',
            status TEXT DEFAULT 'open',
            resolution_note TEXT DEFAULT '',
            reviewed_by_user_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    '''))

    cursor.execute(fix_sql_for_db('''
        CREATE TABLE IF NOT EXISTS audit_logs (
            id SERIAL PRIMARY KEY,
            actor_type TEXT NOT NULL,
            actor_id INTEGER,
            action TEXT NOT NULL,
            entity_type TEXT,
            entity_id INTEGER,
            status TEXT DEFAULT 'success',
            details_json TEXT DEFAULT '{}',
            ip_address TEXT,
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    '''))

    cursor.execute(fix_sql_for_db('''
        CREATE TABLE IF NOT EXISTS analytics (
            id SERIAL PRIMARY KEY,
            metric_name TEXT NOT NULL,
            metric_value REAL NOT NULL,
            date DATE DEFAULT CURRENT_DATE,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    '''))

    # --- Performance Indexes ---
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_doctors_rating ON doctors(rating DESC);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_bookings_user ON therapy_bookings(user_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_history(session_id);")

    seed_sample_doctors(conn)
    seed_default_admin(conn)
    conn.commit()
    conn.close()
    safe_print(f"Database initialized on {'PostgreSQL' if IS_POSTGRES else 'SQLite'}")

init_db()

# ========== Auth & Decoration ==========
def get_logged_in_user_id():
    return session.get("user_id")

def get_logged_in_doctor_id():
    return session.get("doctor_id")

def get_logged_in_user_row():
    user_id = get_logged_in_user_id()
    if not user_id: return None
    with get_db() as conn:
        cursor = conn.cursor()
        placeholder = "%s" if IS_POSTGRES else "?"
        cursor.execute(f"SELECT * FROM users WHERE id = {placeholder}", (user_id,))
        return cursor.fetchone()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not get_logged_in_user_id(): return error_response("Sign in required.", 401)
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_logged_in_user_row()
        if not user or (user["role"] or "free") != "admin":
            return error_response("Admin access required.", 403)
        return f(*args, **kwargs)
    return decorated_function

# ========== Core Functions ==========
def log_audit_event(action, status="success", actor_type="system", actor_id=None, entity_type=None, entity_id=None, details=None):
    try: meta = {"ip_address": request.headers.get("X-Forwarded-For", request.remote_addr), "user_agent": request.headers.get("User-Agent", "")[:255]}
    except RuntimeError: meta = {"ip_address": None, "user_agent": ""}
    placeholder = "%s" if IS_POSTGRES else "?"
    query = f"INSERT INTO audit_logs (actor_type, actor_id, action, entity_type, entity_id, status, details_json, ip_address, user_agent) VALUES ({', '.join([placeholder]*9)})"
    try:
        with get_db() as conn:
            conn.cursor().execute(query, (actor_type, actor_id, action, entity_type, entity_id, status, dumps_json(details or {}), meta["ip_address"], meta["user_agent"]))
            conn.commit()
    except Exception as e: safe_print("Audit error:", e)

def detect_mood(msg):
    if not msg: return "neutral"
    msg_l = msg.lower()
    keywords = {
        "happy": ["happy", "good", "great", "awesome", "excited", "joy", "smile", "khush", "achha"],
        "sad": ["sad", "depressed", "unhappy", "cry", "tears", "udasi", "dukhi", "lonely"],
        "angry": ["angry", "mad", "furious", "gussa", "irritated", "hate"],
        "anxious": ["anxious", "nervous", "worried", "stress", "tension", "chinta", "panic"],
    }
    for m, k in keywords.items():
        if any(w in msg_l for w in k): return m
    return "neutral"

def serialize_booking(row):
    return {
        "id": row["id"],
        "user_id": row["user_id"],
        "doctor_id": row["doctor_id"],
        "doctor_name": row["doctor_name"],
        "name": row["patient_name"],
        "age": row["patient_age"] or "—",
        "gender": row["patient_gender"] or "—",
        "phone": row["patient_phone"] or "—",
        "reason": row["concern"],
        "time": row["slot"],
        "mode": row["session_mode"] or "Video",
        "coins": row["session_price"] or 0,
        "status": row["status"],
        "notes": decrypt_data(row["doctor_notes"]) if row.get("doctor_notes") else "",
        "created_at": str(row["created_at"]),
    }

def error_response(message, status_code=400):
    return jsonify({"success": False, "message": message}), status_code

# ========== Community Routes ==========
@app.route('/api/community/posts', methods=['GET'])
def list_community_posts():
    with get_db() as conn:
        cursor = conn.cursor()
        rows = cursor.execute("SELECT * FROM community_posts WHERE visibility_status = 'visible' ORDER BY created_at DESC").fetchall()
        posts = [dict(row) for row in rows]
        
        # Fetch reactions
        for post in posts:
            cursor.execute("SELECT reaction_type, count FROM community_reactions WHERE post_id = ?", (post['id'],))
            re_rows = cursor.fetchall()
            post['reactions'] = {r['reaction_type']: r['count'] for r in re_rows}
            
    return jsonify({"success": True, "posts": posts})

@app.route('/api/community/posts', methods=['POST'])
@login_required
def create_community_post():
    user_id = get_logged_in_user_id()
    data = request.json
    content = data.get('content', '')
    mood_tag = data.get('mood_tag', 'neutral')
    
    # 2. AI MODERATION LAYER
    # Simple keyword-based toxicity for demo, would use LLM in real prod
    toxic_keywords = ["hate", "kill", "idiot", "stupid"]
    is_toxic = any(k in content.lower() for k in toxic_keywords)
    
    visibility = "visible"
    mod_note = ""
    if is_toxic:
        visibility = "hidden"
        mod_note = "Auto-hidden by AI moderation for community safety."
        
    with get_db() as conn:
        cursor = conn.cursor()
        placeholder = "%s" if IS_POSTGRES else "?"
        cursor.execute(
            f"INSERT INTO community_posts (author_user_id, mood_tag, content, visibility_status, moderation_note) VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder})",
            (user_id, mood_tag, content, visibility, mod_note)
        )
        conn.commit()
        
    if is_toxic:
        return jsonify({"success": False, "message": "Your post is being reviewed for community guidelines."}), 202
        
    return jsonify({"success": True, "message": "Post shared!"})

# ========== Caching ==========
_DOCTOR_CACHE = {"data": None, "expiry": 0}
CACHE_TTL = 300 # 5 minutes

def get_cached_doctors():
    global _DOCTOR_CACHE
    if _DOCTOR_CACHE["data"] and time.time() < _DOCTOR_CACHE["expiry"]:
        return _DOCTOR_CACHE["data"]
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM doctors WHERE profile_status = 'active' ORDER BY rating DESC")
        rows = cursor.fetchall()
        doctors = [dict(r) for r in rows]
        _DOCTOR_CACHE = {"data": doctors, "expiry": time.time() + CACHE_TTL}
        return doctors

# ========== API Routes ==========
@app.route('/api/doctors', methods=['GET'])
def list_doctors():
    doctors = get_cached_doctors()
    return jsonify({"success": True, "doctors": doctors})

@app.route('/api/therapy/bookings', methods=['GET', 'POST'])
@login_required
def therapy_bookings():
    user_id = get_logged_in_user_id()
    if request.method == 'POST':
        data = request.json
        with get_db() as conn:
            cursor = conn.cursor()
            placeholder = "%s" if IS_POSTGRES else "?"
            cursor.execute(f"INSERT INTO therapy_bookings (user_id, doctor_id, doctor_name, patient_name, patient_phone, concern, slot, session_mode, session_price, status) VALUES ({', '.join([placeholder]*10)})",
                           (user_id, data['doctor_id'], data['doctor_name'], data['name'], data['phone'], data['reason'], data['time'], data.get('mode', 'Video'), 0, 'new'))
            
            # Fetch user email for confirmation
            cursor.execute(f"SELECT email FROM users WHERE id = {placeholder}", (user_id,))
            user_row = cursor.fetchone()
            conn.commit()

            if user_row and user_row['email']:
                email_service.send_booking_confirmation(
                    user_row['email'], 
                    data['doctor_name'], 
                    data['time']
                )

        return jsonify({"success": True, "message": "Booked! Confirmation email sent."})
    
    with get_db() as conn:
        cursor = conn.cursor()
        placeholder = "%s" if IS_POSTGRES else "?"
        rows = cursor.execute(f"SELECT * FROM therapy_bookings WHERE user_id = {placeholder} ORDER BY created_at DESC", (user_id,)).fetchall()
    return jsonify({"success": True, "bookings": [serialize_booking(r) for r in rows]})

def is_crisis_msg(msg):
    crisis_keywords = ["suicide", "kill myself", "end it all", "end my life", "suicidal", "want to die", "marna chahta"]
    return any(k in msg.lower() for k in crisis_keywords)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    msg = data.get('message', '')
    user_id = data.get('user_id', 1)
    session_id = data.get('session_id', 'default')
    
    # 1. HARD SAFETY OVERRIDE
    if is_crisis_msg(msg):
        log_audit_event("crisis_msg_detected", actor_type="user", actor_id=user_id, status="caution", details={"msg_hint": msg[:20]})
        reply_text = (
            "I'm very glad you're reaching out, but I'm an AI and not a crisis service. "
            "Please reach out to someone who can help right now. "
            "In India, you can call AASRA at +91-9820466726 or the KIRAN helpline at 1800-599-0019. "
            "You are not alone."
        )
        return jsonify({
            "status": "crisis",
            "reply": reply_text,
            "mood": "crisis",
            "emergency": True
        })

    mood = detect_mood(msg)
    reply_obj = generate_ai_response(msg, [])
    reply_text = reply_obj["text"]
    
    with get_db() as conn:
        cursor = conn.cursor()
        placeholder = "%s" if IS_POSTGRES else "?"
        cursor.execute(f"INSERT INTO chat_history (session_id, role, content, mood_detected) VALUES ({placeholder}, 'user', {placeholder}, {placeholder})", (session_id, encrypt_data(msg), mood))
        cursor.execute(f"INSERT INTO chat_history (session_id, role, content) VALUES ({placeholder}, 'ai', {placeholder})", (session_id, encrypt_data(reply_text)))
        cursor.execute(f"UPDATE users SET coins = coins + 5 WHERE id = {placeholder}", (user_id,))
        conn.commit()
        
    return jsonify({
        "status": "success",
        "reply": reply_text,
        "mood": mood,
        "coinsEarned": 5
    })

@app.route('/api/user/export-data', methods=['GET'])
@login_required
def export_user_data():
    user_id = get_logged_in_user_id()
    with get_db() as conn:
        cursor = conn.cursor()
        placeholder = "%s" if IS_POSTGRES else "?"
        user = cursor.execute(f"SELECT username, email, coins, streak FROM users WHERE id = {placeholder}", (user_id,)).fetchone()
        bookings = cursor.execute(f"SELECT * FROM therapy_bookings WHERE user_id = {placeholder}", (user_id,)).fetchall()
        
    return jsonify({
        "success": True,
        "data": {
            "profile": dict(user),
            "bookings": [serialize_booking(b) for b in bookings],
            "exported_at": datetime.now().isoformat()
        }
    })

@app.route('/api/user/delete-account', methods=['DELETE'])
@login_required
def delete_user_account():
    user_id = get_logged_in_user_id()
    with get_db() as conn:
        cursor = conn.cursor()
        placeholder = "%s" if IS_POSTGRES else "?"
        cursor.execute(f"DELETE FROM therapy_bookings WHERE user_id = {placeholder}", (user_id,))
        cursor.execute(f"DELETE FROM daily_checkins WHERE user_id = {placeholder}", (user_id,))
        cursor.execute(f"DELETE FROM users WHERE id = {placeholder}", (user_id,))
        conn.commit()
    session.clear()
    return jsonify({"success": True, "message": "Deleted."})

@app.route('/api/user/buy-premium', methods=['POST'])
@login_required
def buy_premium():
    user_id = get_logged_in_user_id()
    plan = request.json.get('plan', 'monthly')
    
    # Production Bridge: Real Stripe Session vs Local Upgrade
    if os.getenv("STRIPE_API_KEY") and not os.getenv("STRIPE_API_KEY").startswith("sk_test_sim"):
        try:
            price_id = os.getenv(f"STRIPE_PRICE_{plan.upper()}")
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{'price': price_id, 'quantity': 1}],
                mode='subscription',
                success_url=request.host_url + 'premium?success=true',
                cancel_url=request.host_url + 'premium?canceled=true',
                client_reference_id=str(user_id),
            )
            return jsonify({"success": True, "url": checkout_session.url})
        except Exception as e:
            return error_response(str(e), 500)
    
    # Simulation Mode
    with get_db() as conn:
        cursor = conn.cursor()
        placeholder = "%s" if IS_POSTGRES else "?"
        cursor.execute(f"UPDATE users SET premium_plan = {placeholder}, role = 'premium' WHERE id = {placeholder}", (plan, user_id))
        conn.commit()
    return jsonify({"success": True, "message": "Upgraded (Simulated)"})

@app.route('/api/admin/doctors/<int:doctor_id>/verify', methods=['PATCH'])
@admin_required
def admin_verify_doctor(doctor_id):
    data = request.json or {}
    status = data.get('status', 'active') # active, suspended, pending
    is_verified = 1 if status == 'active' else 0
    
    with get_db() as conn:
        cursor = conn.cursor()
        placeholder = "%s" if IS_POSTGRES else "?"
        cursor.execute(
            f"UPDATE doctors SET is_verified = {placeholder}, profile_status = {placeholder}, updated_at = CURRENT_TIMESTAMP WHERE id = {placeholder}",
            (is_verified, status, doctor_id)
        )
        conn.commit()
    
    log_audit_event("doctor_verification_updated", actor_type="admin", actor_id=get_logged_in_user_id(), entity_type="doctor", entity_id=doctor_id, details={"status": status})
    return jsonify({"success": True, "message": f"Doctor status updated to {status}"})

@app.route('/api/user/status', methods=['GET'])
@login_required
def get_user_status():
    user_id = get_logged_in_user_id()
    with get_db() as conn:
        cursor = conn.cursor()
        placeholder = "%s" if IS_POSTGRES else "?"
        user = cursor.execute(f"SELECT * FROM users WHERE id = {placeholder}", (user_id,)).fetchone()
    if not user: return jsonify({"streak": 0, "coins": 0})
    return jsonify({
        "streak": user["streak"] or 0,
        "coins": user["coins"] or 0,
        "premium_plan": user["premium_plan"] or "free",
        "last_mood": user["last_mood_tag"] or "neutral"
    })

if __name__ == "__main__":
    os.makedirs('static/audio', exist_ok=True)
    app.run(host="0.0.0.0", port=5000, debug=os.getenv("FLASK_DEBUG", "false").lower() == "true", threaded=True)
