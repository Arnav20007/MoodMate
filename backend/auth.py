from flask import Blueprint, request, jsonify, session
import sqlite3
import bcrypt
import traceback
from contextlib import contextmanager
from datetime import datetime, timedelta
import random
import os

auth_bp = Blueprint("auth", __name__)
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "moodmate.db")

DOCTOR_ACCOUNTS = [
    {
        "id": 1,
        "name": "Dr. Priya Sharma",
        "initials": "PS",
        "spec": "Clinical Psychology",
        "email": "priya@moodmate.in",
        "password": "therapy123",
        "palette": "linear-gradient(135deg,#4f46e5,#7c3aed)",
    },
    {
        "id": 2,
        "name": "Aaryan Kumar",
        "initials": "AK",
        "spec": "Counseling Psychology",
        "email": "aaryan@moodmate.in",
        "password": "counsel456",
        "palette": "linear-gradient(135deg,#0ea5e9,#6366f1)",
    },
    {
        "id": 3,
        "name": "Dr. Ankur Verma",
        "initials": "AV",
        "spec": "Psychiatry",
        "email": "ankur@moodmate.in",
        "password": "psych789",
        "palette": "linear-gradient(135deg,#ec4899,#f43f5e)",
    },
    {
        "id": 4,
        "name": "Aanchal Patel",
        "initials": "AP",
        "spec": "Art Therapy",
        "email": "aanchal@moodmate.in",
        "password": "art2024",
        "palette": "linear-gradient(135deg,#10b981,#059669)",
    },
    {
        "id": 5,
        "name": "Aakash Patel",
        "initials": "AaP",
        "spec": "Cognitive Behavioral Therapy",
        "email": "aakash@moodmate.in",
        "password": "cbt2024",
        "palette": "linear-gradient(135deg,#f59e0b,#ef4444)",
    },
    {
        "id": 6,
        "name": "Nitin Kumar",
        "initials": "NK",
        "spec": "Mindfulness & Meditation",
        "email": "nitin@moodmate.in",
        "password": "mind2024",
        "palette": "linear-gradient(135deg,#8b5cf6,#ec4899)",
    },
]

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def generate_otp():
    return f"{random.randint(0, 999999):06d}"

# ---------------- SIGNUP ----------------
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json or {}

    username = str(data.get("username") or "").strip()
    email = str(data.get("email") or "").strip().lower()
    phone = str(data.get("phone") or "").strip()
    password = str(data.get("password") or "")
    promo_code = str(data.get("promoCode") or "").strip().upper()

    if not username or not email or not phone or not password:
        return jsonify({
            "success": False,
            "message": "❌ All fields are required."
        }), 400

    try:
        with get_db() as conn:
            # ✅ Explicit duplicate checks (NO guessing)
            if conn.execute("SELECT 1 FROM users WHERE username=?", (username,)).fetchone():
                return jsonify({
                    "success": False,
                    "message": "❌ Username already taken."
                }), 409

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

            # Check promo code
            premium_plan = 'annual' if promo_code == 'BETA2026' else 'free'

            conn.execute(
                """
                INSERT INTO users (username, email, phone, password_hash, premium_plan)
                VALUES (?, ?, ?, ?, ?)
                """,
                (username, email, phone, hashed_pw, premium_plan)
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
            "message": f"⚠️ Server error during signup: {str(e)}"
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


@auth_bp.route("/forgot", methods=["POST"])
def forgot_password():
    try:
        data = request.json or {}
        login_id = str(data.get("loginId") or "").strip().lower()

        if not login_id:
            return jsonify({
                "success": False,
                "message": "Enter your email or phone first."
            }), 400

        with get_db() as conn:
            user_row = conn.execute(
                "SELECT id FROM users WHERE email=? OR phone=?",
                (login_id, login_id)
            ).fetchone()

            if not user_row:
                return jsonify({
                    "success": False,
                    "message": "No account found for that email or phone."
                }), 404

            otp = generate_otp()
            expires_at = (datetime.utcnow() + timedelta(minutes=10)).isoformat()

            conn.execute("DELETE FROM password_reset_otps WHERE user_id = ?", (user_row["id"],))
            conn.execute(
                """
                INSERT INTO password_reset_otps (user_id, otp_code, expires_at)
                VALUES (?, ?, ?)
                """,
                (user_row["id"], otp, expires_at)
            )
            conn.commit()

        return jsonify({
            "success": True,
            "message": f"OTP generated for testing: {otp}. It expires in 10 minutes."
        }), 200
    except Exception:
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": "Server error during password reset request."
        }), 500


@auth_bp.route("/reset", methods=["POST"])
def reset_password():
    try:
        data = request.json or {}
        login_id = str(data.get("loginId") or "").strip().lower()
        otp = str(data.get("otp") or "").strip()
        new_password = str(data.get("new_password") or "")

        if not login_id or not otp or not new_password:
            return jsonify({
                "success": False,
                "message": "Email/phone, OTP, and new password are required."
            }), 400

        with get_db() as conn:
            user_row = conn.execute(
                "SELECT id FROM users WHERE email=? OR phone=?",
                (login_id, login_id)
            ).fetchone()

            if not user_row:
                return jsonify({
                    "success": False,
                    "message": "No account found for that email or phone."
                }), 404

            otp_row = conn.execute(
                """
                SELECT id, otp_code, expires_at
                FROM password_reset_otps
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT 1
                """,
                (user_row["id"],)
            ).fetchone()

            if not otp_row:
                return jsonify({
                    "success": False,
                    "message": "No OTP request found. Please request a new OTP."
                }), 400

            if otp_row["otp_code"] != otp:
                return jsonify({
                    "success": False,
                    "message": "Invalid OTP."
                }), 400

            expires_at = datetime.fromisoformat(otp_row["expires_at"])
            if expires_at < datetime.utcnow():
                conn.execute("DELETE FROM password_reset_otps WHERE id = ?", (otp_row["id"],))
                conn.commit()
                return jsonify({
                    "success": False,
                    "message": "This OTP has expired. Please request a new one."
                }), 400

            hashed_pw = bcrypt.hashpw(
                new_password.encode("utf-8"),
                bcrypt.gensalt()
            ).decode("utf-8")

            conn.execute(
                "UPDATE users SET password_hash = ? WHERE id = ?",
                (hashed_pw, user_row["id"])
            )
            conn.execute("DELETE FROM password_reset_otps WHERE user_id = ?", (user_row["id"],))
            conn.commit()

        return jsonify({
            "success": True,
            "message": "Password reset successful. Please login with your new password."
        }), 200
    except Exception:
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": "Server error during password reset."
        }), 500


@auth_bp.route("/doctor/login", methods=["POST"])
def doctor_login():
    try:
        data = request.json or {}
        email = str(data.get("email") or "").strip().lower()
        password = str(data.get("password") or "")

        if not email or not password:
            return jsonify({
                "success": False,
                "message": "Doctor email and password are required."
            }), 400

        doctor = next(
            (doc for doc in DOCTOR_ACCOUNTS if doc["email"].lower() == email),
            None
        )

        if not doctor or doctor["password"] != password:
            return jsonify({
                "success": False,
                "message": "Invalid doctor credentials."
            }), 401

        doctor_session = {
            "id": doctor["id"],
            "name": doctor["name"],
            "initials": doctor["initials"],
            "spec": doctor["spec"],
            "email": doctor["email"],
            "palette": doctor["palette"],
        }
        session["doctor_id"] = doctor["id"]

        return jsonify({
            "success": True,
            "message": f"Welcome back, {doctor['name']}.",
            "doctor": doctor_session
        }), 200
    except Exception:
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": "Server error during doctor login."
        }), 500
