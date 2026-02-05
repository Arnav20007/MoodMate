import React, { useState, useEffect } from "react";
import App from "./App";
import "./AppWrapper.css";

const API_BASE_URL = "http://127.0.0.1:5000";

function AppWrapper() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState("login");

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
    const storedUser = localStorage.getItem("moodmateUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
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
      newPassword: formData.password,
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
        <h1>🌙</h1>
      </div>
    );

  return <App user={{ username: "Demo User" }} onLogout={() => {}} />;

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>🌙 MoodMate</h1>
        <p>Come back daily. Feel better.</p>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        {authMode === "login" && (
          <form className="auth-form" onSubmit={handleLogin}>
            <input
              name="loginId"
              placeholder="Email or Phone"
              value={formData.loginId}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </button>
            <p className="toggle-text">
              <span className="toggle-link" onClick={() => setAuthMode("forgot")}>
                Forgot Password?
              </span>
            </p>
            <p className="toggle-text">
              New here?{" "}
              <span
                className="toggle-link"
                onClick={() => setAuthMode("signup")}
              >
                Sign Up
              </span>
            </p>
          </form>
        )}

        {authMode === "signup" && (
          <form className="auth-form" onSubmit={handleSignup}>
            <input name="username" placeholder="Username" onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
            <input name="phone" placeholder="Phone" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />
            <button>Create Account</button>
            <p className="toggle-text">
              <span className="toggle-link" onClick={() => setAuthMode("login")}>
                Back to Login
              </span>
            </p>
          </form>
        )}

        {authMode === "forgot" && (
          <form className="auth-form" onSubmit={handleReset}>
            <input name="loginId" placeholder="Email or Phone" onChange={handleChange} required />
            <button type="button" onClick={handleForgot}>Send OTP</button>
            <input name="otp" placeholder="OTP" onChange={handleChange} required />
            <input type="password" name="password" placeholder="New Password" onChange={handleChange} required />
            <button>Reset Password</button>
            <p className="toggle-text">
              <span className="toggle-link" onClick={() => setAuthMode("login")}>
                Back to Login
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default AppWrapper;
