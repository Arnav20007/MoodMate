import React, { useState } from 'react';
import './DoctorLogin.css';

// In a real app these would be verified against a backend
const DOCTOR_ACCOUNTS = [
  { id: 1, name: 'Dr. Priya Sharma',    initials: 'PS', spec: 'Clinical Psychology',        email: 'priya@moodmate.in',  password: 'therapy123', palette: 'linear-gradient(135deg,#4f46e5,#7c3aed)' },
  { id: 2, name: 'Aaryan Kumar',         initials: 'AK', spec: 'Counseling Psychology',      email: 'aaryan@moodmate.in', password: 'counsel456', palette: 'linear-gradient(135deg,#0ea5e9,#6366f1)' },
  { id: 3, name: 'Dr. Ankur Verma',      initials: 'AV', spec: 'Psychiatry',                 email: 'ankur@moodmate.in',  password: 'psych789',   palette: 'linear-gradient(135deg,#ec4899,#f43f5e)' },
  { id: 4, name: 'Aanchal Patel',        initials: 'AP', spec: 'Art Therapy',                email: 'aanchal@moodmate.in',password: 'art2024',   palette: 'linear-gradient(135deg,#10b981,#059669)' },
  { id: 5, name: 'Aakash Patel',         initials: 'AaP',spec: 'Cognitive Behavioral Therapy',email: 'aakash@moodmate.in', password: 'cbt2024',   palette: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
  { id: 6, name: 'Nitin Kumar',          initials: 'NK', spec: 'Mindfulness & Meditation',   email: 'nitin@moodmate.in',  password: 'mind2024',  palette: 'linear-gradient(135deg,#8b5cf6,#ec4899)' },
];

export default function DoctorLogin({ onLoginSuccess, onBackToApp }) {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError('');
    if (!selectedDoctor) { setError('Please select your doctor account.'); return; }
    if (!password)        { setError('Please enter your password.'); return; }

    setLoading(true);
    // Simulate a brief auth check
    setTimeout(() => {
      setLoading(false);
      if (selectedDoctor.password === password) {
        // Save session
        localStorage.setItem('moodmate_doctor_session', JSON.stringify({
          id: selectedDoctor.id,
          name: selectedDoctor.name,
          initials: selectedDoctor.initials,
          spec: selectedDoctor.spec,
          palette: selectedDoctor.palette,
        }));
        onLoginSuccess(selectedDoctor);
      } else {
        setError('Incorrect password. Please try again.');
        setPassword('');
      }
    }, 900);
  };

  return (
    <div className="dl-page">
      {/* ── Left branding panel ── */}
      <div className="dl-left">
        <div className="dl-brand">
          <div className="dl-brand-logo">
            <div className="dl-brand-icon">🧠</div>
            <div>
              <div className="dl-brand-name">MoodMate</div>
              <div className="dl-brand-tag">Healthcare Professional Portal</div>
            </div>
          </div>

          <div className="dl-headline">
            <h1>Your patients<br />are <span>waiting</span> for you.</h1>
            <p>
              Manage your sessions, review new booking requests, write session notes, and track your earnings — all in one place.
            </p>
          </div>
        </div>

        <div className="dl-features">
          <div className="dl-feature">
            <div className="dl-feature-icon">📅</div>
            <div className="dl-feature-text">
              <h4>Real-time Booking Management</h4>
              <p>Approve or decline session requests instantly</p>
            </div>
          </div>
          <div className="dl-feature">
            <div className="dl-feature-icon">📝</div>
            <div className="dl-feature-text">
              <h4>Private Session Notes</h4>
              <p>Secure, HIPAA-aligned patient record keeping</p>
            </div>
          </div>
          <div className="dl-feature">
            <div className="dl-feature-icon">💰</div>
            <div className="dl-feature-text">
              <h4>Earnings & Payouts</h4>
              <p>Track income and scheduled disbursements</p>
            </div>
          </div>
          <div className="dl-feature">
            <div className="dl-feature-icon">🟢</div>
            <div className="dl-feature-text">
              <h4>Availability Toggle</h4>
              <p>Go online or offline with one tap</p>
            </div>
          </div>
        </div>

        <div className="dl-footer-note">
          MoodMate Doctor Portal · Confidential · Not for patient access
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="dl-right">
        <div className="dl-form-card">
          <div className="dl-form-header">
            <div className="dl-portal-pill">🩺 Doctor Portal</div>
            <h2>Sign in to your account</h2>
            <p>Select your profile and enter your credentials</p>
          </div>

          <div className="dl-form">

            {/* Doctor selector */}
            <div className="dl-field">
              <label>Select Your Account</label>
              <div className="dl-doctor-select">
                {DOCTOR_ACCOUNTS.map(doc => (
                  <button
                    key={doc.id}
                    className={`dl-doc-pill ${selectedDoctor?.id === doc.id ? 'selected' : ''}`}
                    onClick={() => { setSelectedDoctor(doc); setError(''); }}
                    type="button"
                  >
                    <span className="name">{doc.name}</span>
                    <span className="spec">{doc.spec}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div className="dl-field">
              <label>Password</label>
              <div className="dl-input-wrap">
                <span className="dl-input-icon">🔒</span>
                <input
                  className="dl-input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>

            <div className="dl-row">
              <button className="dl-forgot" type="button" onClick={() => setError('Contact admin@moodmate.in to reset your password.')}>Forgot password?</button>
            </div>

            {error && <div className="dl-error">⚠️ {error}</div>}

            <button
              className="dl-submit"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? 'Verifying…' : 'Sign in to Doctor Portal →'}
            </button>

            <div className="dl-divider">or</div>

            <div className="dl-back">
              Not a doctor?{' '}
              <a onClick={onBackToApp}>Go back to MoodMate</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
