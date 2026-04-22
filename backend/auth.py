from contextlib import contextmanager
from datetime import datetime, timedelta
import json
import os
import random
import sqlite3
import traceback

import bcrypt
from flask import Blueprint, jsonify, request, session
from werkzeug.security import check_password_hash

auth_bp = Blueprint("auth", __name__)
DB_PATH = os.environ.get("MOODMATE_DB_PATH") or os.path.join(os.path.dirname(os.path.abspath(__file__)), "moodmate.db")


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


def log_audit_event(action, status="success", actor_type="system", actor_id=None, entity_type=None, entity_id=None, details=None):
    try:
        with get_db() as conn:
            conn.execute(
                """
                INSERT INTO audit_logs (
                    actor_type,
                    actor_id,
                    action,
                    entity_type,
                    entity_id,
                    status,
                    details_json,
                    ip_address,
                    user_agent
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    actor_type,
                    actor_id,
                    action,
                    entity_type,
                    entity_id,
                    status,
                    json.dumps(details or {}),
                    request.headers.get("X-Forwarded-For", request.remote_addr),
                    (request.headers.get("User-Agent") or "")[:255],
                ),
            )
            conn.commit()
    except Exception:
        traceback.print_exc()


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json or {}

    username = str(data.get("username") or "").strip()
    email = str(data.get("email") or "").strip().lower()
    phone = str(data.get("phone") or "").strip()
    password = str(data.get("password") or "")
    promo_code = str(data.get("promoCode") or "").strip().upper()

    if not username or not email or not phone or not password:
        return jsonify({"success": False, "message": "All fields are required."}), 400

    try:
        with get_db() as conn:
            if conn.execute("SELECT 1 FROM users WHERE username = ?", (username,)).fetchone():
                log_audit_event("signup_rejected", status="failed", actor_type="guest", details={"reason": "duplicate_username", "username": username})
                return jsonify({"success": False, "message": "Username already taken."}), 409

            if conn.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone():
                log_audit_event("signup_rejected", status="failed", actor_type="guest", details={"reason": "duplicate_email", "email": email})
                return jsonify({"success": False, "message": "Email already registered."}), 409

            if conn.execute("SELECT 1 FROM users WHERE phone = ?", (phone,)).fetchone():
                log_audit_event("signup_rejected", status="failed", actor_type="guest", details={"reason": "duplicate_phone"})
                return jsonify({"success": False, "message": "Phone number already registered."}), 409

            hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            premium_plan = "annual" if promo_code == "BETA2026" else "free"
            cursor = conn.execute(
                """
                INSERT INTO users (username, email, phone, password_hash, premium_plan)
                VALUES (?, ?, ?, ?, ?)
                """,
                (username, email, phone, hashed_pw, premium_plan),
            )
            conn.commit()
            user_id = cursor.lastrowid

        log_audit_event("signup_completed", actor_type="user", actor_id=user_id, entity_type="user", entity_id=user_id)
        return jsonify({"success": True, "message": "Signup successful. Please login."}), 201
    except Exception as exc:
        traceback.print_exc()
        return jsonify({"success": False, "message": f"Server error during signup: {exc}"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.json or {}
        login_id = str(data.get("loginId") or "").strip().lower()
        password = str(data.get("password") or "")

        if not login_id or not password:
            return jsonify({"success": False, "message": "Login ID and password are required."}), 400

        with get_db() as conn:
            user_row = conn.execute(
                "SELECT * FROM users WHERE email = ? OR phone = ?",
                (login_id, login_id),
            ).fetchone()

        if not user_row:
            log_audit_event("login_failed", status="failed", actor_type="guest", details={"login_id": login_id, "reason": "account_not_found"})
            return jsonify({"success": False, "message": "No account found. Please sign up."}), 404

        stored_hash = user_row["password_hash"]
        if isinstance(stored_hash, bytes):
            hash_bytes = stored_hash
        elif isinstance(stored_hash, str) and stored_hash.startswith("b'"):
            hash_bytes = stored_hash[2:-1].encode("utf-8")
        else:
            hash_bytes = str(stored_hash).encode("utf-8")

        try:
            password_ok = bcrypt.checkpw(password.encode("utf-8"), hash_bytes)
        except Exception:
            password_ok = False

        if not password_ok:
            log_audit_event("login_failed", status="failed", actor_type="user", actor_id=user_row["id"], entity_type="user", entity_id=user_row["id"], details={"reason": "invalid_password"})
            return jsonify({"success": False, "message": "Invalid password."}), 401

        session["user_id"] = user_row["id"]
        session.pop("doctor_id", None)

        user_data = dict(user_row)
        user_data.pop("password_hash", None)
        user_data["is_premium"] = user_data.get("premium_plan", "free") != "free"
        log_audit_event("login_completed", actor_type="user", actor_id=user_row["id"], entity_type="user", entity_id=user_row["id"])

        return jsonify({"success": True, "message": f"Welcome back, {user_data['username']}!", "user": user_data})
    except Exception:
        traceback.print_exc()
        return jsonify({"success": False, "message": "Server error during login."}), 500


@auth_bp.route("/logout", methods=["POST"])
def logout():
    user_id = session.pop("user_id", None)
    doctor_id = session.pop("doctor_id", None)
    if user_id:
        log_audit_event("logout_completed", actor_type="user", actor_id=user_id, entity_type="user", entity_id=user_id)
    if doctor_id:
        log_audit_event("doctor_logout_completed", actor_type="doctor", actor_id=doctor_id, entity_type="doctor", entity_id=doctor_id)
    return jsonify({"success": True, "message": "Logout successful"}), 200


@auth_bp.route("/forgot", methods=["POST"])
def forgot_password():
    try:
        data = request.json or {}
        login_id = str(data.get("loginId") or "").strip().lower()

        if not login_id:
            return jsonify({"success": False, "message": "Enter your email or phone first."}), 400

        with get_db() as conn:
            user_row = conn.execute(
                "SELECT id FROM users WHERE email = ? OR phone = ?",
                (login_id, login_id),
            ).fetchone()

            if not user_row:
                log_audit_event("password_reset_request_failed", status="failed", actor_type="guest", details={"login_id": login_id, "reason": "account_not_found"})
                return jsonify({"success": False, "message": "No account found for that email or phone."}), 404

            otp = generate_otp()
            expires_at = (datetime.utcnow() + timedelta(minutes=10)).isoformat()

            conn.execute("DELETE FROM password_reset_otps WHERE user_id = ?", (user_row["id"],))
            conn.execute(
                """
                INSERT INTO password_reset_otps (user_id, otp_code, expires_at)
                VALUES (?, ?, ?)
                """,
                (user_row["id"], otp, expires_at),
            )
            conn.commit()

        log_audit_event("password_reset_requested", actor_type="user", actor_id=user_row["id"], entity_type="user", entity_id=user_row["id"])
        return jsonify(
            {
                "success": True,
                "message": "A reset code has been generated for this demo environment. Delivery is not connected yet, so use the server logs or database only in local testing.",
            }
        ), 200
    except Exception:
        traceback.print_exc()
        return jsonify({"success": False, "message": "Server error during password reset request."}), 500


@auth_bp.route("/reset", methods=["POST"])
def reset_password():
    try:
        data = request.json or {}
        login_id = str(data.get("loginId") or "").strip().lower()
        otp = str(data.get("otp") or "").strip()
        new_password = str(data.get("new_password") or "")

        if not login_id or not otp or not new_password:
            return jsonify({"success": False, "message": "Email/phone, OTP, and new password are required."}), 400

        with get_db() as conn:
            user_row = conn.execute(
                "SELECT id FROM users WHERE email = ? OR phone = ?",
                (login_id, login_id),
            ).fetchone()

            if not user_row:
                log_audit_event("password_reset_failed", status="failed", actor_type="guest", details={"login_id": login_id, "reason": "account_not_found"})
                return jsonify({"success": False, "message": "No account found for that email or phone."}), 404

            otp_row = conn.execute(
                """
                SELECT id, otp_code, expires_at
                FROM password_reset_otps
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT 1
                """,
                (user_row["id"],),
            ).fetchone()

            if not otp_row:
                log_audit_event("password_reset_failed", status="failed", actor_type="user", actor_id=user_row["id"], entity_type="user", entity_id=user_row["id"], details={"reason": "otp_missing"})
                return jsonify({"success": False, "message": "No OTP request found. Please request a new OTP."}), 400

            if otp_row["otp_code"] != otp:
                log_audit_event("password_reset_failed", status="failed", actor_type="user", actor_id=user_row["id"], entity_type="user", entity_id=user_row["id"], details={"reason": "otp_invalid"})
                return jsonify({"success": False, "message": "Invalid OTP."}), 400

            expires_at = datetime.fromisoformat(otp_row["expires_at"])
            if expires_at < datetime.utcnow():
                conn.execute("DELETE FROM password_reset_otps WHERE id = ?", (otp_row["id"],))
                conn.commit()
                log_audit_event("password_reset_failed", status="failed", actor_type="user", actor_id=user_row["id"], entity_type="user", entity_id=user_row["id"], details={"reason": "otp_expired"})
                return jsonify({"success": False, "message": "This OTP has expired. Please request a new one."}), 400

            hashed_pw = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (hashed_pw, user_row["id"]))
            conn.execute("DELETE FROM password_reset_otps WHERE user_id = ?", (user_row["id"],))
            conn.commit()

        log_audit_event("password_reset_completed", actor_type="user", actor_id=user_row["id"], entity_type="user", entity_id=user_row["id"])
        return jsonify({"success": True, "message": "Password reset successful. Please login with your new password."}), 200
    except Exception:
        traceback.print_exc()
        return jsonify({"success": False, "message": "Server error during password reset."}), 500


@auth_bp.route("/doctor/login", methods=["POST"])
def doctor_login():
    try:
        data = request.json or {}
        email = str(data.get("email") or "").strip().lower()
        password = str(data.get("password") or "")

        if not email or not password:
            return jsonify({"success": False, "message": "Doctor email and password are required."}), 400

        with get_db() as conn:
            doctor = conn.execute(
                """
                SELECT *
                FROM doctors
                WHERE lower(email) = ? AND profile_status = 'active'
                """,
                (email,),
            ).fetchone()

        if not doctor:
            log_audit_event("doctor_login_failed", status="failed", actor_type="guest", details={"email": email, "reason": "account_not_found"})
            return jsonify({"success": False, "message": "Invalid doctor credentials."}), 401

        if not check_password_hash(doctor["password_hash"], password):
            log_audit_event("doctor_login_failed", status="failed", actor_type="doctor", actor_id=doctor["id"], entity_type="doctor", entity_id=doctor["id"], details={"reason": "invalid_password"})
            return jsonify({"success": False, "message": "Invalid doctor credentials."}), 401

        doctor_session = {
            "id": doctor["id"],
            "name": doctor["name"],
            "initials": doctor["initials"],
            "spec": doctor["specialization"],
            "email": doctor["email"],
            "rating": doctor["rating"],
            "reviews": doctor["reviews_count"],
            "experience": f"{doctor['experience_years']} years",
            "languages": json.loads(doctor["languages_json"] or "[]"),
            "pricePerSession": doctor["price_per_session"],
            "profileSource": doctor["profile_source"],
        }
        session["doctor_id"] = doctor["id"]
        session.pop("user_id", None)
        log_audit_event("doctor_login_completed", actor_type="doctor", actor_id=doctor["id"], entity_type="doctor", entity_id=doctor["id"])

        return jsonify({"success": True, "message": f"Welcome back, {doctor['name']}.", "doctor": doctor_session}), 200
    except Exception:
        traceback.print_exc()
        return jsonify({"success": False, "message": "Server error during doctor login."}), 500
