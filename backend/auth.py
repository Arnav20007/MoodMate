from flask import Blueprint, request, jsonify, session
import sqlite3
import bcrypt
import traceback
from contextlib import contextmanager

auth_bp = Blueprint("auth", __name__)

@contextmanager
def get_db():
    conn = sqlite3.connect("moodmate.db")
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# ---------------- SIGNUP ----------------
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json or {}

    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    phone = data.get("phone", "").strip()
    password = data.get("password", "")

    if not username or not email or not phone or not password:
        return jsonify({
            "success": False,
            "message": "❌ All fields are required."
        }), 400

    try:
        with get_db() as conn:
            # ✅ Explicit duplicate checks (NO guessing)
            if conn.execute("SELECT 1 FROM users WHERE email=?", (email,)).fetchone():
                return jsonify({
                    "success": False,
                    "message": "❌ Email already registered."
                }), 409

            if conn.execute("SELECT 1 FROM users WHERE phone=?", (phone,)).fetchone():
                return jsonify({
                    "success": False,
                    "message": "❌ Phone number already registered."
                }), 409

            hashed_pw = bcrypt.hashpw(
                password.encode("utf-8"),
                bcrypt.gensalt()
            ).decode("utf-8")  # store as string in SQLite

            conn.execute(
                """
                INSERT INTO users (username, email, phone, password_hash)
                VALUES (?, ?, ?, ?)
                """,
                (username, email, phone, hashed_pw)
            )
            conn.commit()

        return jsonify({
            "success": True,
            "message": "✅ Signup successful! Please login."
        }), 201

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": "⚠️ Server error during signup."
        }), 500


# ---------------- LOGIN ----------------
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.json or {}
        loginId = data.get("loginId", "").strip().lower()
        password = data.get("password", "")

        if not loginId or not password:
            return jsonify({
                "success": False,
                "message": "❌ Login ID and password are required."
            }), 400

        with get_db() as conn:
            user_row = conn.execute(
                "SELECT * FROM users WHERE email=? OR phone=?",
                (loginId, loginId)
            ).fetchone()

        if not user_row:
            return jsonify({
                "success": False,
                "message": "❌ No account found. Please sign up."
            }), 404

        stored_hash = user_row["password_hash"]
        # Handle 3 possible storage formats:
        # 1. Already bytes (ideal)
        # 2. Plain bcrypt string '$2b$...'
        # 3. Python bytes repr "b'$2b$...'" (old bug format)
        if isinstance(stored_hash, bytes):
            hash_bytes = stored_hash
        elif isinstance(stored_hash, str) and stored_hash.startswith("b'"):
            # strip the Python bytes repr artifacts
            hash_bytes = stored_hash[2:-1].encode("utf-8")
        else:
            hash_bytes = stored_hash.encode("utf-8")

        try:
            pw_ok = bcrypt.checkpw(password.encode("utf-8"), hash_bytes)
        except Exception:
            pw_ok = False

        if not pw_ok:
            return jsonify({
                "success": False,
                "message": "❌ Invalid password."
            }), 401

        session["user_id"] = user_row["id"]

        user_data = dict(user_row)
        user_data.pop("password_hash", None)
        # Map premium_plan string → is_premium boolean for frontend compatibility
        user_data["is_premium"] = user_data.get("premium_plan", "free") != "free"

        return jsonify({
            "success": True,
            "message": f"✅ Welcome back, {user_data['username']}!",
            "user": user_data
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": "⚠️ Server error during login."
        }), 500


# ---------------- LOGOUT ----------------
@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    return jsonify({
        "success": True,
        "message": "Logout successful"
    }), 200
