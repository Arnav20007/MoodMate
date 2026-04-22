import sqlite3

conn = sqlite3.connect("moodmate.db")
cur = conn.cursor()

# ✅ Add premium columns (ignore if they already exist)
try:
    cur.execute("ALTER TABLE users ADD COLUMN premium_plan TEXT DEFAULT 'free'")
except sqlite3.OperationalError:
    print("⚠️ premium_plan column already exists")

try:
    cur.execute("ALTER TABLE users ADD COLUMN premium_expiry TEXT")
except sqlite3.OperationalError:
    print("⚠️ premium_expiry column already exists")

# ✅ Create subscriptions table
cur.execute("""
CREATE TABLE IF NOT EXISTS premium_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan TEXT NOT NULL,
    subscribed_date TEXT NOT NULL,
    expiry_date TEXT,
    status TEXT DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users (id)
)
""")

# ✅ Create features table
cur.execute("""
CREATE TABLE IF NOT EXISTS premium_features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    required_plan TEXT NOT NULL
)
""")

# ✅ Insert default features (ignore duplicates)
features = [
    ('Therapeutic Games', 'Access to all stress-relief games', 'pro'),
    ('Breathing Exercises', 'Guided breathing techniques', 'basic'),
    ('AI Coach', 'Personalized mental wellness plans', 'pro'),
    ('Sleep Companion', 'Sleep stories and relaxation sounds', 'pro'),
    ('Mood Reports', 'Advanced emotional analytics', 'basic'),
    ('Exclusive Content', 'Premium themes and avatars', 'basic'),
    ('Priority Support', 'Faster response times', 'pro'),
    ('Merch Discounts', 'Discounts on MoodMate merchandise', 'elite')
]

for f in features:
    cur.execute("INSERT OR IGNORE INTO premium_features (name, description, required_plan) VALUES (?, ?, ?)", f)

conn.commit()
conn.close()

print("✅ Premium DB setup complete!")
