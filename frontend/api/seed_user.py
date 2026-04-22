import sqlite3
import bcrypt

conn = sqlite3.connect('moodmate.db')
cursor = conn.cursor()

cursor.execute('SELECT * FROM users WHERE email="test5@moodmate.in"')
if not cursor.fetchone():
    hashed_pw = bcrypt.hashpw(b'password123', bcrypt.gensalt())
    cursor.execute('INSERT INTO users (username, email, phone, password_hash) VALUES (?, ?, ?, ?)', ('TestUser5', 'test5@moodmate.in', '5555555555', hashed_pw))
    conn.commit()
    print('Test user created: test5@moodmate.in / password123')
else:
    print('Test user already exists')
conn.close()
