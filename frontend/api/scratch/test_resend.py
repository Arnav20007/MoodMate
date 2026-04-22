import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")

try:
    r = resend.Emails.send({
      "from": "onboarding@resend.dev",
      "to": "arnavsinghas1221@gmail.com",
      "subject": "Mental Health Bridge: Resend Activated! 🌿",
      "html": "<p>Congrats! Your MoodMate backend is now connected to <strong>Resend</strong>.</p><p>We have also integrated this into your therapy booking flow.</p>"
    })
    print("SUCCESS: Test Email Sent! ID: " + str(r.get('id')))
except Exception as e:
    print("ERROR: Resend Test Failed: " + str(e))
