import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './PatientLogin.css';

export default function PatientLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    const mockUser = {
      username: username,
      id: 1,
      is_premium: true,
      streak: 0,
      lastMood: 'calm',
      coins: 99999,
      chatSessions: 0,
      journalEntries: 0,
      goalsAchieved: 0,
    };
    
    // Pass user up to App.jsx
    onLoginSuccess(mockUser);
  };

  return (
    <div className="pl-container">
      <div className="pl-left">
        <motion.div 
          className="pl-brand"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>MoodMate</h1>
          <p>Your sanctuary for mental wellness.</p>
          <div className="pl-pill">Patient Portal</div>
        </motion.div>
      </div>
      <div className="pl-right">
        <motion.div 
          className="pl-form-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>👋</span>
            <h2 style={{ fontSize: '28px', color: '#1e293b', margin: '0 0 10px 0', fontWeight: '800' }}>Welcome back.</h2>
            <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>Who is checking in today?</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="pl-input-group">
              <label>Your Name</label>
              <input 
                type="text" 
                placeholder="e.g. Arnav" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
              />
            </div>
            
            <button className="pl-btn-submit" type="submit">
              Enter Sandbox →
            </button>
          </form>

          <div className="pl-footer">
            <p>This is a prototype environment. Entering any name grants full premium access for testing purposes.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
