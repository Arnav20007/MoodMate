# MoodMate

MoodMate is a mental wellness product prototype that combines an AI companion, therapist discovery, guided self-help tools, community support, and a provider workspace.

## Product Positioning

MoodMate sits between pure self-help apps and full therapy marketplaces.

- For users: a calmer place to check in, reflect, and move from AI support toward human care.
- For providers: a lightweight workspace to review requests and keep session follow-up in one place.
- For investors or demo audiences: a clear story around the full mental health journey, from first check-in to therapist booking.

## What This Build Is

This repository is currently a strong MVP and demo environment.

- Therapist profiles are backend-backed and clearly labeled when they are sample data.
- Doctor login now uses database records with hashed passwords.
- Booking reads and updates are scoped to the signed-in user or assigned doctor.
- Critical actions such as login and booking changes are recorded in an audit log table.

## What This Build Is Not Yet

This app is not ready for public healthcare deployment.

- It is not a crisis service.
- It is not HIPAA compliant.
- It does not yet support secure provider onboarding, payment workflows, or production-grade moderation.
- Demo/sample content still exists in several non-critical surfaces and should be replaced before launch.

## Core Experience

- AI companion chat with crisis boundary messaging
- Daily mood tracking and reports
- Therapist discovery with full profile view
- Therapy booking requests
- Provider portal for reviewing requests and writing notes
- Community and self-help tools

## Stack

- Frontend: React + Framer Motion
- Backend: Flask + SQLite
- Deployment: Render

## Local Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Environment Notes

Optional environment variables:

- `FLASK_SECRET_KEY`
- `SESSION_COOKIE_SECURE`
- `CORS_ALLOWED_ORIGINS`
- `MOODMATE_DB_PATH`
- `FLASK_DEBUG`
- AI provider keys used by the backend service layer

## Sample Doctor Accounts

The seeded provider records are sample accounts for local/demo use only.

- `priya@moodmate.in`
- `aaryan@moodmate.in`
- `ankur@moodmate.in`
- `aanchal@moodmate.in`
- `aakash@moodmate.in`
- `nitin@moodmate.in`

Passwords are stored hashed in the database seed. Add a secure provider onboarding and password reset flow before any real launch.

## Demo Admin Account

For the new provider management workflow, the app seeds one demo admin user:

- `admin@moodmate.in`
- `Admin123!Demo`

Use this account only for local/demo testing. Replace it with a real admin bootstrap process before production.

## Tests

Basic backend coverage lives under `backend/tests`.

Run:

```bash
python -m unittest discover -s backend/tests -v
```

## Immediate Production Roadmap

1. Replace all sample therapist/community content with verified live data.
2. Add secure provider onboarding and admin workflows.
3. Add role-aware authorization across every protected route.
4. Move from SQLite to a production database and add migrations.
5. Add secure messaging, calendar sync, and payments.
6. Add real moderation and abuse-reporting systems.
7. Complete privacy, legal, and crisis-handling readiness work before launch.
