from flask import Blueprint, request, jsonify, session
import sqlite3
import bcrypt
import traceback
from contextlib import contextmanager

# --- Create Blueprint ---
# This is the "auth" module of your application.
auth_bp = Blueprint("auth", __name__)

# --- Database Helper ---
@contextmanager
def get_db():
    conn = sqlite3.connect("moodmate.db")
    conn.row_factory = sqlite3.Row # This is crucial for accessing columns by name
    try:
        yield conn
    finally:
        conn.close()

# --- Signup Route ---
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    if not all([username, email, phone, password]):
        return jsonify({"success": False, "message": "❌ All fields are required."}), 400

    # Using bcrypt for secure, salted password hashing
    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    try:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO users (username, email, phone, password_hash) VALUES (?, ?, ?, ?)",
                (username, email, phone, hashed_pw)
            )
            conn.commit()
        return jsonify({"success": True, "message": "✅ Signup successful! Please login."}), 201
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "❌ Email or phone already registered."}), 409
    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "message": f"⚠️ Server error during signup: {e}"}), 500

# --- Login Route ---
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        loginId = data.get("loginId") # This can be email or phone
        password = data.get("password")

        if not loginId or not password:
            return jsonify({"success": False, "message": "❌ Login ID and password are required"}), 400

        with get_db() as conn:
            user_row = conn.execute("SELECT * FROM users WHERE email=? OR phone=?", (loginId, loginId)).fetchone()

        if not user_row:
            return jsonify({"success": False, "message": "❌ No account found. Please sign up."}), 404
        
        stored_pw_hash = user_row["password_hash"]

        if bcrypt.checkpw(password.encode("utf-8"), stored_pw_hash):
            # ✅ CRITICAL FIX: Set a secure session cookie for the user
            session['user_id'] = user_row['id']
            
            user_data = dict(user_row)
            user_data.pop('password_hash') # Never send the password hash to the frontend

            return jsonify({
                "success": True, 
                "message": f"✅ Welcome back, {user_data['username']}!",
                "user": user_data # Send the full user object to the frontend
            })
        else:
            return jsonify({"success": False, "message": "❌ Invalid password."}), 401

    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "message": f"⚠️ Server error during login: {str(e)}"}), 500

# --- Logout Route ---
@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None) # Clear the user's session
    return jsonify({"success": True, "message": "Logout successful"}), 200