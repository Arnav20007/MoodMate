import React, { useState, useEffect } from "react";
import App from "./App";
import "./AppWrapper.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://moodmate-8-sucu.onrender.com";

function AppWrapper() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [forceDocLogin, setForceDocLogin] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    loginId: "",
    otp: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("moodmateUser");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("moodmateUser");
      }
    }
    setIsLoading(false);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAuthAction = async (endpoint, payload) => {
    setIsLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Something went wrong");
        return null;
      }
      return data;
    } catch {
      setError("Server not reachable");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const data = await handleAuthAction("/login", {
      loginId: formData.loginId,
      password: formData.password,
    });
    if (data?.user) {
      setUser(data.user);
      localStorage.setItem("moodmateUser", JSON.stringify(data.user));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const data = await handleAuthAction("/signup", {
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });
    if (data) {
      setMessage(data.message);
      setAuthMode("login");
    }
  };

  const handleForgot = async () => {
    if (!formData.loginId) {
      setError("Enter email or phone first");
      return;
    }
    const data = await handleAuthAction("/forgot", {
      loginId: formData.loginId,
    });
    if (data) setMessage(data.message);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    const data = await handleAuthAction("/reset", {
      loginId: formData.loginId,
      otp: formData.otp,
      new_password: formData.password,
    });
    if (data) {
      setMessage(data.message);
      setAuthMode("login");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("moodmateUser");
  };

  if (isLoading)
    return (
      <div className="loading-screen">
        <span>🌙</span>
      </div>
    );

  const hasDoctorSession = !!localStorage.getItem('moodmate_doctor_session');

  if (user || hasDoctorSession || forceDocLogin) {
    return (
      <App 
        user={user} 
        onLogout={handleLogout} 
        forceDocLogin={forceDocLogin} 
        onCancelDocLogin={() => setForceDocLogin(false)} 
      />
    );
  }

  return (
    <div className="aw-page">
      {/* ── Left Branding Panel ── */}
      <div className="aw-left">
        <div className="aw-brand">
          <div className="aw-brand-logo">
            <div className="aw-brand-icon">🌙</div>
            <div>
              <div className="aw-brand-name">MoodMate</div>
              <div className="aw-brand-tag">Patient Portal</div>
            </div>
          </div>
          
          <div className="aw-headline">
            <h1>Come back daily.<br/><span>Feel better.</span></h1>
            <p>Your safe, guided space for mental wellness. Track your mood, chat with our AI coach, connect with therapists, and heal — day by day.</p>
          </div>

          <div className="aw-features">
            <div className="aw-feature">
              <div className="aw-feature-icon">🤖</div>
              <div className="aw-feature-text">
                <h4>24/7 AI Companion</h4>
                <p>Chat anytime. Understand your triggers and receive guided strategies instantly.</p>
              </div>
            </div>
            <div className="aw-feature">
              <div className="aw-feature-icon">📊</div>
              <div className="aw-feature-text">
                <h4>Daily Mood Tracking</h4>
                <p>Build self-awareness smoothly by maintaining your daily emotional rhythm.</p>
              </div>
            </div>
          </div>
          
          <div className="aw-footer" style={{ marginTop: 'auto', paddingTop: '2rem', fontSize: '0.85rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
            <span>📧 Contact: hello@moodmate.in</span>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</span>
          </div>
        </div>
      </div>

      {/* ── Right Login Form Panel ── */}
      <div className="aw-right">
        <div className="aw-form-card">
          <div className="aw-form-header">
            {authMode === "login" && (
              <>
                <h2>Welcome back</h2>
                <p>Sign in to continue your mental wellness journey</p>
              </>
            )}
            {authMode === "signup" && (
              <>
                <h2>Create Account</h2>
                <p>Take the first step towards a better you</p>
              </>
            )}
            {authMode === "forgot" && (
              <>
                <h2>Reset Password</h2>
                <p>We'll send you an OTP to access your account</p>
              </>
            )}
          </div>

          {error && <div className="aw-error">{error}</div>}
          {message && <div className="aw-success">{message}</div>}

          {authMode === "login" && (
            <form className="aw-form" onSubmit={handleLogin}>
              <div className="aw-field">
                <label>Email or Phone</label>
                <input
                  className="aw-input"
                  name="loginId"
                  placeholder="Enter email or phone"
                  value={formData.loginId}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="aw-field">
                <label>Password</label>
                <input
                  className="aw-input"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="aw-row">
                <span className="aw-forgot" onClick={() => setAuthMode("forgot")}>
                  Forgot Password?
                </span>
              </div>
              <button className="aw-submit" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </button>
              
              <div className="aw-toggle">
                New here? <span onClick={() => setAuthMode("signup")}>Create an account</span>
              </div>
            </form>
          )}

          {authMode === "signup" && (
            <form className="aw-form" onSubmit={handleSignup}>
              
              <div className="aw-field">
                <label>Username</label>
                <input className="aw-input" name="username" placeholder="e.g. John Doe" onChange={handleChange} required />
              </div>
              <div className="aw-field">
                <label>Email</label>
                <input className="aw-input" type="email" name="email" placeholder="john@example.com" onChange={handleChange} required />
              </div>
              <div className="aw-field">
                <label>Phone</label>
                <input className="aw-input" name="phone" placeholder="+91 00000 00000" onChange={handleChange} required />
              </div>
              <div className="aw-field">
                <label>Password</label>
                <input className="aw-input" type="password" name="password" placeholder="••••••••" onChange={handleChange} required />
              </div>
              <div className="aw-field">
                <label>Confirm Password</label>
                <input className="aw-input" type="password" name="confirmPassword" placeholder="••••••••" onChange={handleChange} required />
              </div>

              <button className="aw-submit">Create Account</button>
              
              <div className="aw-toggle">
                Already have an account? <span onClick={() => setAuthMode("login")}>Sign in instead</span>
              </div>
            </form>
          )}

          {authMode === "forgot" && (
            <form className="aw-form" onSubmit={handleReset}>
              <div className="aw-field">
                <label>Email or Phone</label>
                <input className="aw-input" name="loginId" placeholder="Enter email or phone" onChange={handleChange} required />
              </div>
              <button type="button" className="aw-submit" style={{ background: '#475569' }} onClick={handleForgot}>Send OTP</button>
              
              <div className="aw-field" style={{ marginTop: '8px' }}>
                <label>OTP</label>
                <input className="aw-input" name="otp" placeholder="Enter OTP" onChange={handleChange} required />
              </div>
              <div className="aw-field">
                <label>New Password</label>
                <input className="aw-input" type="password" name="password" placeholder="••••••••" onChange={handleChange} required />
              </div>

              <button className="aw-submit">Reset Password</button>
              
              <div className="aw-toggle">
                Remember your password? <span onClick={() => setAuthMode("login")}>Back to login</span>
              </div>
            </form>
          )}


        </div>
      </div>
    </div>
  );
}

export default AppWrapper;
