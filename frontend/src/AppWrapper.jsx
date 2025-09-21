import React, { useState, useEffect } from "react";
import App from "./App";      // Your main app component
import "./app.css";         // Your main stylesheet

const API_BASE_URL = 'http://127.0.0.1:5000';

function AppWrapper() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', or 'forgot'
    
    const [formData, setFormData] = useState({
        username: "", email: "", phone: "", password: "",
        confirmPassword: "", loginId: "", otp: ""
    });
    
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem("moodmateUser");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem("moodmateUser");
            }
        }
        setIsLoading(false);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAuthAction = async (endpoint, payload) => {
        setIsLoading(true);
        setError("");
        setMessage("");
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (data.success) {
                return data;
            } else {
                setError(data.message || 'An unknown error occurred.');
                return null;
            }
        } catch (err) {
            setError('Failed to connect to the server. Please check if it is running.');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
        const data = await handleAuthAction('/signup', {
            username: formData.username, email: formData.email, phone: formData.phone, password: formData.password
        });
        if (data) {
            setMessage(data.message);
            switchMode('login');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const data = await handleAuthAction('/login', {
            loginId: formData.loginId, password: formData.password
        });
        if (data && data.user) {
            setUser(data.user);
            localStorage.setItem("moodmateUser", JSON.stringify(data.user));
        }
    };

    const handleForgot = async () => {
        if (!formData.loginId) {
            setError("Please enter your email or phone number first.");
            return;
        }
        const data = await handleAuthAction('/forgot', { loginId: formData.loginId });
        if (data) {
            setMessage(data.message);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        const data = await handleAuthAction('/reset', {
            loginId: formData.loginId,
            otp: formData.otp,
            newPassword: formData.password
        });
        if (data) {
            setMessage(data.message);
            switchMode('login');
        }
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem("moodmateUser");
    };

    const switchMode = (mode) => {
        setAuthMode(mode);
        setError("");
        setMessage("");
        setFormData({ username: "", email: "", phone: "", password: "", confirmPassword: "", loginId: "", otp: "" });
    };

    if (isLoading) {
        return <div className="loading-screen"><h1>🌙</h1></div>;
    }

    if (user) {
        return <App user={user} onLogout={handleLogout} />;
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h1>🌙 MoodMate</h1>
                <p>Your mental health companion</p>
                
                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}

                {authMode === 'login' && (
                  <form onSubmit={handleLogin} className="auth-form">
                    <input type="text" name="loginId" placeholder="Email or Phone Number" value={formData.loginId} onChange={handleChange} required disabled={isLoading} />
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required disabled={isLoading} />
                    <button type="submit" disabled={isLoading}>{isLoading ? 'Logging in...' : 'Login'}</button>
                    <p className="toggle-text">
                        <span onClick={() => switchMode('forgot')} className="toggle-link">Forgot Password?</span>
                    </p>
                    <p className="toggle-text">New here? <span onClick={() => switchMode('signup')} className="toggle-link">Sign Up</span></p>
                  </form>
                )}

                {authMode === 'signup' && (
                  <form onSubmit={handleSignup} className="auth-form">
                    <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required disabled={isLoading} />
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required disabled={isLoading} />
                    <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required disabled={isLoading} />
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required disabled={isLoading} />
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required disabled={isLoading} />
                    <button type="submit" disabled={isLoading}>{isLoading ? 'Creating Account...' : 'Sign Up'}</button>
                    <p className="toggle-text">Already have an account? <span onClick={() => switchMode('login')} className="toggle-link">Login</span></p>
                  </form>
                )}

                {authMode === 'forgot' && (
                  <form onSubmit={handleReset} className="auth-form">
                     <p className="form-instruction">Enter your email/phone to receive an OTP. Then, enter the OTP and your new password.</p>
                     <input type="text" name="loginId" placeholder="Email or Phone Number" value={formData.loginId} onChange={handleChange} required disabled={isLoading} />
                     <button type="button" className="secondary-btn" onClick={handleForgot} disabled={isLoading || !formData.loginId}>Send OTP</button>
                     
                     <input type="text" name="otp" placeholder="Enter OTP" value={formData.otp} onChange={handleChange} required disabled={isLoading} />
                     <input type="password" name="password" placeholder="New Password" value={formData.password} onChange={handleChange} required disabled={isLoading} />

                     <button type="submit" disabled={isLoading || !formData.otp || !formData.password}>Reset Password</button>
                     <p className="toggle-text"><span onClick={() => switchMode('login')} className="toggle-link">Back to Login</span></p>
                  </form>
                )}
            </div>
        </div>
    );
}

export default AppWrapper;