import os
import resend
from dotenv import load_dotenv

load_dotenv()

class EmailService:
    def __init__(self):
        self.api_key = os.getenv("RESEND_API_KEY")
        if self.api_key:
            resend.api_key = self.api_key
        self.from_email = os.getenv("MAIL_FROM", "onboarding@resend.dev")

    def send_email(self, to_email, subject, html_content):
        if not self.api_key:
            print(f"⚠️ [SIMULATION] Email to {to_email}: {subject}")
            return {"success": True, "simulated": True}

        try:
            params = {
                "from": self.from_email,
                "to": to_email,
                "subject": subject,
                "html": html_content,
            }
            email = resend.Emails.send(params)
            return {"success": True, "id": email.get("id")}
        except Exception as e:
            print(f"❌ Resend Error: {e}")
            return {"success": False, "error": str(e)}

    def send_welcome_email(self, user_email, username):
        subject = "Welcome to MoodMate 🌿"
        html = f"""
        <div style="font-family: sans-serif; color: #4B4F40; max-width: 600px; margin: auto;">
            <h1 style="color: #4B4F40;">Hello, {username}!</h1>
            <p>Welcome to MoodMate, your sanctuary for mental wellness.</p>
            <p>We're honored to be part of your journey towards a calmer, more mindful life.</p>
            <hr style="border: 0; border-top: 1px solid #E0E0E0; margin: 20px 0;">
            <p style="font-size: 12px; color: #888;">If you didn't create an account, please ignore this email.</p>
        </div>
        """
        return self.send_email(user_email, subject, html)

    def send_booking_confirmation(self, user_email, doctor_name, slot):
        subject = "Therapy Session Confirmed - MoodMate"
        html = f"""
        <div style="font-family: sans-serif; color: #4B4F40; max-width: 600px; margin: auto;">
            <h2 style="color: #4B4F40;">Session Confirmed!</h2>
            <p>Your therapy session with <strong>{doctor_name}</strong> has been scheduled.</p>
            <div style="background: #F4F5F0; padding: 20px; border-radius: 12px; border: 1px solid #DEDFDB;">
                <p style="margin: 0;"><strong>Time:</strong> {slot}</p>
            </div>
            <p>You can access your session link in your profile dashboard.</p>
            <p>Stay mindful,</p>
            <p>The MoodMate Team</p>
        </div>
        """
        return self.send_email(user_email, subject, html)

# Global instance
email_service = EmailService()
