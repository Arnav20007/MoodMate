import importlib
import os
import sqlite3
import sys
import unittest
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


class MoodMateAuthBookingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db_path = str(BACKEND_DIR / "tests" / "test_moodmate.db")
        if os.path.exists(cls.db_path):
            os.remove(cls.db_path)
        os.environ["MOODMATE_DB_PATH"] = cls.db_path
        os.environ["FLASK_SECRET_KEY"] = "test-secret"

        cls.app_module = importlib.import_module("app")
        cls.app_module.app.config["TESTING"] = True

    @classmethod
    def tearDownClass(cls):
        try:
            if os.path.exists(cls.db_path):
                os.remove(cls.db_path)
        except PermissionError:
            pass

    def setUp(self):
        self.client = self.app_module.app.test_client()
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM community_reports")
            conn.execute("DELETE FROM community_reactions")
            conn.execute("DELETE FROM community_posts")
            conn.execute("DELETE FROM password_reset_otps")
            conn.execute("DELETE FROM therapy_bookings")
            conn.execute("DELETE FROM audit_logs")
            conn.execute("DELETE FROM users")
            conn.row_factory = sqlite3.Row
            self.app_module.seed_default_admin(conn)
            conn.commit()

    def signup_user(self, username="tester", email="tester@example.com", phone="9999999999", password="Secret123"):
        return self.client.post(
            "/signup",
            json={
                "username": username,
                "email": email,
                "phone": phone,
                "password": password,
            },
        )

    def login_user(self, login_id="tester@example.com", password="Secret123"):
        return self.client.post("/login", json={"loginId": login_id, "password": password})

    def login_doctor(self, email="priya@moodmate.in", password="therapy123"):
        return self.client.post("/doctor/login", json={"email": email, "password": password})

    def login_admin(self, email="admin@moodmate.in", password="Admin123!Demo"):
        return self.client.post("/login", json={"loginId": email, "password": password})

    def test_signup_and_login_create_audit_entries(self):
        signup_response = self.signup_user()
        self.assertEqual(signup_response.status_code, 201)

        login_response = self.login_user()
        self.assertEqual(login_response.status_code, 200)
        payload = login_response.get_json()
        self.assertTrue(payload["success"])
        self.assertEqual(payload["user"]["email"], "tester@example.com")

        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            actions = [row["action"] for row in conn.execute("SELECT action FROM audit_logs ORDER BY id").fetchall()]

        self.assertIn("signup_completed", actions)
        self.assertIn("login_completed", actions)

    def test_doctor_login_uses_seeded_records(self):
        response = self.login_doctor()
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertTrue(payload["success"])
        self.assertEqual(payload["doctor"]["email"], "priya@moodmate.in")
        self.assertEqual(payload["doctor"]["id"], 1)

    def test_bookings_require_session_and_doctor_scope(self):
        unauthorized = self.client.post(
            "/api/therapy/bookings",
            json={
                "doctor_id": 1,
                "name": "Unauth User",
                "phone": "9999999999",
                "reason": "Need support with work stress and anxiety.",
                "time": "Mon 2 PM",
            },
        )
        self.assertEqual(unauthorized.status_code, 401)

        self.signup_user()
        self.login_user()

        booking_response = self.client.post(
            "/api/therapy/bookings",
            json={
                "doctor_id": 1,
                "name": "Test User",
                "phone": "9999999999",
                "reason": "Need support with work stress and anxiety.",
                "time": "Mon 2 PM",
                "mode": "Video",
            },
        )
        self.assertEqual(booking_response.status_code, 201)
        booking_payload = booking_response.get_json()
        booking_id = booking_payload["booking"]["id"]

        my_bookings = self.client.get("/api/therapy/bookings")
        self.assertEqual(my_bookings.status_code, 200)
        self.assertEqual(len(my_bookings.get_json()["bookings"]), 1)

        self.client.post("/logout")
        self.login_doctor()

        doctor_bookings = self.client.get("/api/therapy/bookings?doctor_id=1")
        self.assertEqual(doctor_bookings.status_code, 200)
        self.assertEqual(len(doctor_bookings.get_json()["bookings"]), 1)

        update_response = self.client.patch(
            f"/api/therapy/bookings/{booking_id}",
            json={"status": "upcoming", "notes": "Client reports panic spikes during the work week."},
        )
        self.assertEqual(update_response.status_code, 200)
        updated_payload = update_response.get_json()
        self.assertEqual(updated_payload["booking"]["status"], "upcoming")
        self.assertIn("panic spikes", updated_payload["booking"]["notes"])

        self.client.post("/logout")
        other_doctor_client = self.app_module.app.test_client()
        other_doctor_client.post("/doctor/login", json={"email": "aaryan@moodmate.in", "password": "counsel456"})
        forbidden = other_doctor_client.patch(
            f"/api/therapy/bookings/{booking_id}",
            json={"status": "completed"},
        )
        self.assertEqual(forbidden.status_code, 403)

    def test_booking_conflicts_and_patient_reschedule_flow(self):
        self.signup_user()
        self.login_user()

        first_booking = self.client.post(
            "/api/therapy/bookings",
            json={
                "doctor_id": 1,
                "name": "Test User",
                "phone": "9999999999",
                "reason": "Need support with work stress and anxiety.",
                "time": "Mon 2 PM",
                "mode": "Video",
            },
        )
        self.assertEqual(first_booking.status_code, 201)
        booking_id = first_booking.get_json()["booking"]["id"]

        second_booking = self.client.post(
            "/api/therapy/bookings",
            json={
                "doctor_id": 1,
                "name": "Test User",
                "phone": "9999999999",
                "reason": "Trying to take an already booked slot.",
                "time": "Mon 2 PM",
                "mode": "Video",
            },
        )
        self.assertEqual(second_booking.status_code, 409)

        reschedule = self.client.patch(
            f"/api/therapy/bookings/{booking_id}",
            json={"time": "Wed 10 AM"},
        )
        self.assertEqual(reschedule.status_code, 200)
        self.assertEqual(reschedule.get_json()["booking"]["status"], "reschedule_requested")

        cancel = self.client.patch(
            f"/api/therapy/bookings/{booking_id}",
            json={"status": "cancelled"},
        )
        self.assertEqual(cancel.status_code, 200)
        self.assertEqual(cancel.get_json()["booking"]["status"], "cancelled")

    def test_admin_can_manage_doctors(self):
        login_response = self.login_admin()
        self.assertEqual(login_response.status_code, 200)
        self.assertEqual(login_response.get_json()["user"]["role"], "admin")

        create_response = self.client.post(
            "/api/admin/doctors",
            json={
                "name": "Dr. Meera Joshi",
                "email": "meera@moodmate.in",
                "specialization": "Trauma Therapy",
                "experienceYears": 7,
                "languages": ["English", "Hindi"],
                "modes": ["Video", "Chat"],
                "pricePerSession": 1499,
                "rating": 4.8,
                "reviewsCount": 12,
                "badge": "Managed profile",
                "bio": "Trauma-informed therapist profile for admin workflow tests.",
                "licenseInfo": "Sample trauma therapist license info",
                "qualifications": ["MA Psychology"],
                "approaches": ["Trauma-informed", "CBT"],
                "focusAreas": ["Trauma", "Anxiety"],
                "bestFor": "Adults needing structured trauma-aware support.",
                "firstSession": "First session covers history, pacing, and immediate goals.",
                "cancellationPolicy": "Cancel 12 hours ahead.",
                "reviewSummary": "Clients describe the therapist as steady and thoughtful.",
                "availability": ["Tue 1 PM", "Thu 5 PM"],
                "temporaryPassword": "DoctorCreate123!",
            },
        )
        self.assertEqual(create_response.status_code, 201)
        created = create_response.get_json()["doctor"]
        self.assertEqual(created["email"], "meera@moodmate.in")

        update_response = self.client.patch(
            f"/api/admin/doctors/{created['id']}",
            json={
                "name": "Dr. Meera Joshi",
                "email": "meera@moodmate.in",
                "specialization": "Trauma and Anxiety Therapy",
                "experienceYears": 8,
                "languages": ["English", "Hindi"],
                "modes": ["Video"],
                "pricePerSession": 1599,
                "rating": 4.9,
                "reviewsCount": 15,
                "badge": "Managed profile",
                "bio": "Updated managed profile.",
                "licenseInfo": "Updated license info",
                "qualifications": ["MA Psychology"],
                "approaches": ["Trauma-informed"],
                "focusAreas": ["Trauma"],
                "bestFor": "Adults.",
                "firstSession": "Updated first session",
                "cancellationPolicy": "Updated policy",
                "reviewSummary": "Updated summary",
                "availability": ["Fri 2 PM"],
                "profileStatus": "archived",
            },
        )
        self.assertEqual(update_response.status_code, 200)
        updated = update_response.get_json()["doctor"]
        self.assertEqual(updated["specialization"], "Trauma and Anxiety Therapy")
        self.assertEqual(updated["profileStatus"], "archived")

        reactivate_response = self.client.patch(
            f"/api/admin/doctors/{created['id']}",
            json={
                "name": "Dr. Meera Joshi",
                "email": "meera@moodmate.in",
                "specialization": "Trauma and Anxiety Therapy",
                "experienceYears": 8,
                "languages": ["English", "Hindi"],
                "modes": ["Video"],
                "pricePerSession": 1599,
                "rating": 4.9,
                "reviewsCount": 15,
                "badge": "Managed profile",
                "bio": "Updated managed profile.",
                "licenseInfo": "Updated license info",
                "qualifications": ["MA Psychology"],
                "approaches": ["Trauma-informed"],
                "focusAreas": ["Trauma"],
                "bestFor": "Adults.",
                "firstSession": "Updated first session",
                "cancellationPolicy": "Updated policy",
                "reviewSummary": "Updated summary",
                "availability": ["Fri 2 PM"],
                "profileStatus": "active",
            },
        )
        self.assertEqual(reactivate_response.status_code, 200)

        reset_response = self.client.post(
            f"/api/admin/doctors/{created['id']}/reset-password",
            json={"temporaryPassword": "ResetPass123!"},
        )
        self.assertEqual(reset_response.status_code, 200)

        self.client.post("/logout")
        doctor_login_response = self.client.post(
            "/doctor/login",
            json={"email": "meera@moodmate.in", "password": "ResetPass123!"},
        )
        self.assertEqual(doctor_login_response.status_code, 200)

    def test_admin_can_review_community_reports(self):
        self.signup_user()
        self.login_user()

        create_post = self.client.post(
            "/api/community/posts",
            json={"mood_tag": "anxious", "content": "This is a test post for moderation review."},
        )
        self.assertEqual(create_post.status_code, 200)

        posts_response = self.client.get("/api/community/posts")
        post_id = posts_response.get_json()["posts"][0]["id"]

        report_response = self.client.post(
            f"/api/community/posts/{post_id}/report",
            json={"reason": "Spam", "details": "Testing moderator workflow."},
        )
        self.assertEqual(report_response.status_code, 201)

        self.client.post("/logout")
        self.login_admin()

        queue_response = self.client.get("/api/admin/community/reports")
        self.assertEqual(queue_response.status_code, 200)
        reports = queue_response.get_json()["reports"]
        self.assertEqual(len(reports), 1)

        review_response = self.client.patch(
            f"/api/admin/community/reports/{reports[0]['id']}",
            json={"action": "hide_post", "resolutionNote": "Hidden during moderation test."},
        )
        self.assertEqual(review_response.status_code, 200)

        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            post = conn.execute("SELECT visibility_status FROM community_posts WHERE id = ?", (post_id,)).fetchone()
        self.assertEqual(post["visibility_status"], "hidden")


if __name__ == "__main__":
    unittest.main()
