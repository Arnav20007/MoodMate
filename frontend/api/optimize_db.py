import sqlite3
import os

def optimize_db():
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'moodmate.db')
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("Enabling WAL mode for better concurrency...")
    cursor.execute("PRAGMA journal_mode=WAL;")
    
    print("Creating indexes for performance...")
    # Speed up common lookups
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_doctors_rating ON doctors(rating DESC);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_bookings_user ON therapy_bookings(user_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_bookings_doctor ON therapy_bookings(doctor_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_history(session_id);")
    
    conn.commit()
    conn.close()
    print("Database optimization complete.")

if __name__ == "__main__":
    optimize_db()
