import os
import psycopg2
from dotenv import load_dotenv
import traceback

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
print(f"Connecting to: {DATABASE_URL[:30]}...")

try:
    conn = psycopg2.connect(DATABASE_URL)
    print("SUCCESS: Connected to Supabase PostgreSQL!")
    
    cursor = conn.cursor()
    
    def fix_sql_for_db(query):
        query = query.replace("AUTOINCREMENT", "")
        query = query.replace("INTEGER PRIMARY KEY", "SERIAL PRIMARY KEY")
        query = query.replace("DATETIME DEFAULT CURRENT_TIMESTAMP", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
        query = query.replace("CREATE INDEX IF NOT EXISTS", "CREATE INDEX")
        return query

    print("CREATING TABLES...")
    
    # 1. Chat History
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
    
    # 2. Users Table
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

    # 3. Doctors Table
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

    # 4. Therapy Bookings
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    '''))

    # 5. Checkins
    cursor.execute(fix_sql_for_db('''
        CREATE TABLE IF NOT EXISTS daily_checkins (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            date DATE DEFAULT CURRENT_DATE,
            mood_tag TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    '''))

    # 6. Audit Logs
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

    conn.commit()
    print("MIGRATION COMPLETE: Your Supabase database is now live.")
    
except Exception as e:
    print(f"ERROR: Connection Failed: {str(e)}")
    traceback.print_exc()
finally:
    if 'conn' in locals():
        conn.close()
