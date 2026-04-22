import sqlite3
import os

db_path = 'backend/moodmate.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print(f"Tables in {db_path}: {[t[0] for t in tables]}")
    
    if 'doctors' in [t[0] for t in tables]:
        cursor.execute("PRAGMA table_info(doctors);")
        print(f"Doctors columns: {[c[1] for c in cursor.fetchall()]}")
    conn.close()
else:
    print(f"File {db_path} not found.")
