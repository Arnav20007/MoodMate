from cryptography.fernet import Fernet
import os
from dotenv import load_dotenv

load_dotenv()

# We use a static key from env or generate a temporary one for safety
# In production, MOODMATE_ENCRYPTION_KEY must be a valid Fernet key string
ENCRYPTION_KEY = os.environ.get('MOODMATE_ENCRYPTION_KEY')
if not ENCRYPTION_KEY:
    # Fallback only for dev — in prod this would mean data is lost on restart!
    ENCRYPTION_KEY = Fernet.generate_key().decode()

cipher_suite = Fernet(ENCRYPTION_KEY.encode())

def encrypt_data(data: str) -> str:
    """Encrypts a string into a base64 encoded token."""
    if not data: return ""
    return cipher_suite.encrypt(data.encode()).decode()

def decrypt_data(token: str) -> str:
    """Decrypts a base64 encoded token back to string."""
    if not token: return ""
    try:
        return cipher_suite.decrypt(token.encode()).decode()
    except Exception:
        # Fallback if data is unencrypted (legacy data)
        return token
