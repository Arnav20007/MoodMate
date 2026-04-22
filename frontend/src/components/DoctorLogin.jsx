import React, { useEffect, useState } from 'react';
import './DoctorLogin.css';
import { API_BASE_URL } from '../api';

export default function DoctorLogin({ onLoginSuccess, onBackToApp }) {
  const [doctorAccounts, setDoctorAccounts] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/doctors`, { credentials: 'include' });
        const data = await response.json();
        if (response.ok && data.success && Array.isArray(data.doctors)) {
          setDoctorAccounts(data.doctors);
        }
      } catch {
        setError('Doctor profiles could not be loaded right now.');
      }
    };
    loadDoctors();
  }, []);

  const handleLogin = async () => {
    setError('');
    if (!selectedDoctor) {
      setError('Please select your doctor account.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/doctor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: selectedDoctor.email,
          password,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success && data.doctor) {
        localStorage.setItem('moodmate_doctor_session', JSON.stringify(data.doctor));
        onLoginSuccess(data.doctor);
        return;
      }
      setError(data.message || 'Incorrect password. Please try again.');
      setPassword('');
    } catch {
      setError('Doctor portal is unavailable right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dl-page">
      <div className="dl-left">
        <div className="dl-brand">
          <div className="dl-brand-logo">
            <div className="dl-brand-icon">Portal</div>
            <div>
              <div className="dl-brand-name">MoodMate</div>
              <div className="dl-brand-tag">Provider workspace preview</div>
            </div>
          </div>

          <div className="dl-headline">
            <h1>Review requests, manage notes, and keep clinician workflows grounded in trust.</h1>
            <p>
              This portal now signs doctors in against backend provider records instead of frontend-only demo
              credentials. Provider profiles in this build are still sample data until real onboarding is wired in.
            </p>
          </div>
        </div>

        <div className="dl-features">
          <div className="dl-feature">
            <div className="dl-feature-icon">Auth</div>
            <div className="dl-feature-text">
              <h4>Backend-authenticated access</h4>
              <p>Doctor sessions are validated against hashed credentials stored in the database.</p>
            </div>
          </div>
          <div className="dl-feature">
            <div className="dl-feature-icon">Notes</div>
            <div className="dl-feature-text">
              <h4>Scoped session notes</h4>
              <p>Doctors can only update bookings that belong to their own profile.</p>
            </div>
          </div>
          <div className="dl-feature">
            <div className="dl-feature-icon">Audit</div>
            <div className="dl-feature-text">
              <h4>Audit trail started</h4>
              <p>Critical login and booking actions now leave an audit record for review.</p>
            </div>
          </div>
          <div className="dl-feature">
            <div className="dl-feature-icon">Sample</div>
            <div className="dl-feature-text">
              <h4>Clearly labeled preview data</h4>
              <p>This build uses sample clinicians so the product story stays honest during demos.</p>
            </div>
          </div>
        </div>

        <div className="dl-footer-note">MoodMate Provider Workspace · Sample environment · Not for live patient use</div>
      </div>

      <div className="dl-right">
        <div className="dl-form-card">
          <div className="dl-form-header">
            <div className="dl-portal-pill">Provider portal</div>
            <h2>Sign in to your account</h2>
            <p>Select a provider profile and enter the assigned password for this sample environment.</p>
          </div>

          <div className="dl-form">
            <div className="dl-field">
              <label>Select Your Account</label>
              <div className="dl-doctor-select">
                {doctorAccounts.map((doctor) => (
                  <button
                    key={doctor.id}
                    className={`dl-doc-pill ${selectedDoctor?.id === doctor.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setError('');
                    }}
                    type="button"
                  >
                    <span className="name">{doctor.name}</span>
                    <span className="spec">{doctor.specialization}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="dl-field">
              <label>Password</label>
              <div className="dl-input-wrap">
                <span className="dl-input-icon">Lock</span>
                <input
                  className="dl-input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError('');
                  }}
                  onKeyDown={(event) => event.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>

            <div className="dl-row">
              <button
                className="dl-forgot"
                type="button"
                onClick={() => setError('Password reset for doctors is not self-serve yet in this build. Add a secure reset flow before launch.')}
              >
                Forgot password?
              </button>
            </div>

            {error && <div className="dl-error">Warning: {error}</div>}

            <button className="dl-submit" onClick={handleLogin} disabled={loading}>
              {loading ? 'Verifying...' : 'Sign in to provider portal'}
            </button>

            <div className="dl-divider">or</div>

            <div className="dl-back">
              Not a doctor?{' '}
              <button
                type="button"
                onClick={onBackToApp}
                style={{ background: 'transparent', border: 'none', padding: 0, color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}
              >
                Go back to MoodMate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
