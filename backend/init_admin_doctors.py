import sqlite3
import hashlib

def simple_hash(password):
    return hashlib.sha256(password.encode()).hexdigest()

def init_admin_and_doctors():
    conn = sqlite3.connect("moodmate.db")
    cursor = conn.cursor()

    # Create roles table if not exists
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        role TEXT CHECK(role IN ('admin','doctor','user')) NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    """)

    # Insert Admin
    cursor.execute("""
    INSERT OR IGNORE INTO users (username, email, phone, password_hash)
    VALUES (?, ?, ?, ?)
    """, ("Admin", "arnavsinghas1221@gmail.com", "9999999999", simple_hash("Arn@2007")))

    cursor.execute("SELECT id FROM users WHERE email=?", ("arnavsinghas1221@gmail.com",))
    admin_id = cursor.fetchone()[0]
    cursor.execute("INSERT OR IGNORE INTO roles (user_id, role) VALUES (?, ?)", (admin_id, "admin"))

    # Insert 10 Doctors
    for i in range(1, 11):
        email = f"doctor{i}@moodmate.com"
        password = f"Doc{i}@123"
        cursor.execute("""
        INSERT OR IGNORE INTO users (username, email, phone, password_hash)
        VALUES (?, ?, ?, ?)
        """, (f"Doctor{i}", email, f"900000000{i}", simple_hash(password)))
        
        cursor.execute("SELECT id FROM users WHERE email=?", (email,))
        doctor_id = cursor.fetchone()[0]
        cursor.execute("INSERT OR IGNORE INTO roles (user_id, role) VALUES (?, ?)", (doctor_id, "doctor"))

    conn.commit()
    conn.close()
    print("✅ Admin and Doctor accounts initialized successfully!")

if __name__ == "__main__":
    init_admin_and_doctors()
