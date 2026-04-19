import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './app.css';
import AICoach from './components/AICoach';
import Therapy from './components/Therapy';
import Community from './components/Community';
import Report from './components/Report';
import Profile from './components/Profile';
import Chat from './components/Chat';
import DoctorDashboard from './components/DoctorDashboard';
import DoctorLogin from './components/DoctorLogin';
import GlobalAudioPlayer from './components/GlobalAudioPlayer'; // Billion-Dollar Feature #3
import Onboarding from './components/Onboarding';

const NAV_TABS = [
  { id: 'chat',      icon: '💬', label: 'Chat'      },
  { id: 'ai-coach',  icon: '🤖', label: 'AI Coach'  },
  { id: 'therapy',   icon: '👨‍⚕️', label: 'Therapy'   },
  { id: 'community', icon: '🌍', label: 'Community' },
  { id: 'report',    icon: '📊', label: 'Report'    },
];

const MoodMate = ({ user: initialUser, onLogout, forceDocLogin, onCancelDocLogin }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [showOnboarding, setShowOnboarding] = useState(
    !localStorage.getItem('moodmate_onboarded')
  );

  // ── Doctor Portal Role Switch ──
  const [doctorMode, setDoctorMode] = useState(() => {
    const s = localStorage.getItem('moodmate_doctor_session');
    return s ? JSON.parse(s) : null;
  });
  const [showDoctorLogin, setShowDoctorLogin] = useState(forceDocLogin || false);
  const [showSOSModal, setShowSOSModal] = useState(false);

  useEffect(() => {
    if (forceDocLogin) setShowDoctorLogin(true);
  }, [forceDocLogin]);

  const handleDoctorLogin = (doc) => {
    setDoctorMode(doc);
    setShowDoctorLogin(false);
  };
  const handleDoctorLogout = () => {
    localStorage.removeItem('moodmate_doctor_session');
    setDoctorMode(null);
    setShowDoctorLogin(false);
    if (onCancelDocLogin && !initialUser) onCancelDocLogin();
  };
  const handleDocBackToApp = () => {
    setShowDoctorLogin(false);
    if (onCancelDocLogin) onCancelDocLogin();
  };

  // ── Patient User Session ──
  const [user, setUser] = useState(initialUser || {
    username: 'Demo User',
    id: 1,
    is_premium: true,
    streak: 0,
    coins: 0,
  });

  useEffect(() => {
    if (initialUser) setUser(initialUser);
  }, [initialUser]);

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const [notifications, setNotifications] = useState([
    { id: 0, text: `Your previous mood was recorded as ${user?.lastMood || 'centered'}. Would you like to check in now? 🧘`, time: 'Just now', unread: true },
    { id: 1, text: 'Transaction complete: 5 coins awarded for activity. 🪙', time: '2m ago', unread: true },
    { id: 2, text: 'Your community contribution has received a reaction ❤️', time: '1h ago', unread: false },
    { id: 3, text: 'Clinical Insight: Your Weekly Wellness Report is available 📊', time: '3h ago', unread: false },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Close notification dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('moodmate_onboarded', 'true');
    setShowOnboarding(false);
  };

  // Sync Global User State with Backend
  useEffect(() => {
    if (!user) return;
    const fetchUserStatus = async () => {
      try {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://moodmate-8-sucu.onrender.com';
        const response = await fetch(`${API_BASE_URL}/api/user/status?user_id=${user.id}`);
        const data = await response.json();
        if (data.status === 'success') {
          setUser(prev => ({
            ...prev,
            streak: data.streak ?? prev.streak ?? 0,
            lastMood: data.last_mood || 'neutral',
            coins: data.coins ?? prev.coins ?? 0,
          }));
        }
      } catch (err) {
        // silently fail — backend may not be running in demo mode
      }
    };
    fetchUserStatus();
  }, [user?.id]);

  // ── Rendering flow ──

  // 1. Doctor Login screen (full-page takeover)
  if (showDoctorLogin && !doctorMode) {
    return <DoctorLogin onLoginSuccess={handleDoctorLogin} onBackToApp={handleDocBackToApp} />;
  }

  // 2. Doctor Dashboard (full-page, no patient nav)
  if (doctorMode) {
    return (
      <div className="app-container" style={{ padding: 0 }}>
        <main className="app-main" style={{ padding: 0 }}>
          <DoctorDashboard doctor={doctorMode} onLogout={handleDoctorLogout} />
        </main>
      </div>
    );
  }

  // 3. Main Patient Dashboard/App
  return (
    <div className="app-container">
      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      </AnimatePresence>

      {/* ── Header ── */}
      <div style={{ background: '#f8fafc', color: '#64748b', fontSize: '12px', textAlign: 'center', padding: '6px', fontWeight: '600', borderBottom: '1px solid #e2e8f0', letterSpacing: '0.02em', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
        <span>✨ Daily Affirmation:</span> <span style={{ color: '#0f172a' }}>"You do not have to be productive to be valuable."</span>
      </div>
      <header className="app-header" style={{ paddingTop: '10px' }}>
        <div className="header-left">
          <h1>MoodMate</h1>
          <nav className="nav-tabs" role="navigation" aria-label="Main navigation">
            {NAV_TABS.map(tab => (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                className={activeTab === tab.id ? 'nav-tab active' : 'nav-tab'}
                onClick={() => setActiveTab(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <span role="img" aria-hidden="true">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="header-right">
          <button className="focus-mode-btn" style={{ background: 'transparent', border: '1px solid #e2e8f0', color: '#64748b', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => alert('Focus Mode Activated: Notifications are muted for 30m.')}>
            <span>🌙</span> Focus Mode
          </button>
          <button 
            className="sos-btn" 
            onClick={() => setShowSOSModal(true)}
            title="Emergency SOS"
          >
            🆘 SOS
          </button>
          {/* Streak + Coins Pill */}
          {(user.streak > 0 || user.coins > 0) && (
            <div className="stats-pill">
              <span className="stats-pill-item">🔥 {user.streak || 0}</span>
              <span className="stats-pill-divider" />
              <span className="stats-pill-item">🪙 {(user.coins || 0).toLocaleString('en-IN')}</span>
            </div>
          )}

          {/* Notification Bell */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              className="notif-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              title="Notifications"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke={showNotifications ? '#6366F1' : '#64748b'}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && <span className="notif-badge" />}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  className="notif-dropdown"
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="notif-header">
                    <span>Notifications</span>
                    <button className="notif-mark-read" onClick={markAllRead}>
                      Mark all read
                    </button>
                  </div>
                  <div className="notif-list">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        className={`notif-item ${n.unread ? 'unread' : ''}`}
                        onClick={() => {
                          setNotifications(prev =>
                            prev.map(item => item.id === n.id ? { ...item, unread: false } : item)
                          );
                        }}
                      >
                        <div className="notif-item-text">{n.text}</div>
                        <div className="notif-item-time">{n.time}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar → Profile */}
          <button
            className="avatar-btn"
            onClick={() => setActiveTab('profile')}
            title="Profile & Settings"
            aria-label="Go to Profile"
          >
            {(user.username || 'U').charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="app-main" style={{ position: 'relative' }}>


        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{ width: '100%', flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            {activeTab === 'chat'      && <Chat user={user} />}
            {activeTab === 'ai-coach' && <AICoach user={user} />}
            {activeTab === 'therapy'   && <Therapy user={user} />}
            {activeTab === 'community' && <Community user={user} />}
            {activeTab === 'report'    && <Report user={user} />}
            {activeTab === 'profile'   && <Profile user={user} onLogout={onLogout} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Quick-Breathe Pill — bottom right */}
      <motion.button
        className="floating-breathe-btn"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setActiveTab('ai-coach')}
        title="Quick Breathing Exercise"
        aria-label="Quick Breathing Exercise"
      >
        <span role="img" aria-label="breathe">🌬️</span>
      </motion.button>

      {/* Doctor Portal Link */}
      <button
        className="doctor-portal-link"
        onClick={() => setShowDoctorLogin(true)}
        title="Healthcare Professional Portal"
      >
        🩺 Healthcare Professional Sign In
      </button>

      {/* SOS/Emergency Modal - Reverted */}
      <AnimatePresence>
        {showSOSModal && (
          <motion.div 
            className="sos-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSOSModal(false)}
          >
            <motion.div 
              className="sos-modal-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="sos-modal-header">
                <h2>🚨 Emergency Resources</h2>
                <button className="sos-modal-close" onClick={() => setShowSOSModal(false)}>✕</button>
              </div>
              <div className="sos-modal-body">
                <p>If you or someone you know is in immediate danger, please contact emergency services or a crisis helpline right away. You are not alone.</p>
                
                <div className="sos-helpline-list">
                  <div className="sos-item highlight">
                    <span className="sos-label">National Emergency (India)</span>
                    <a href="tel:112" className="sos-number">📞 112</a>
                  </div>
                  <div className="sos-item">
                    <span className="sos-label">Vandrevala Foundation (Mental Health)</span>
                    <a href="tel:9999666555" className="sos-number">📞 +91 9999666555</a>
                  </div>
                  <div className="sos-item">
                    <span className="sos-label">iCall (TISS Helpline)</span>
                    <a href="tel:02225521111" className="sos-number">📞 022-25521111</a>
                  </div>
                  <div className="sos-item">
                    <span className="sos-label">Aasra (24/7 Suicide Prevention)</span>
                    <a href="tel:919820466726" className="sos-number">📞 +91-9820466726</a>
                  </div>
                </div>

                <div className="sos-footer-msg">
                  <p>These services are free, confidential, and available 24/7.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Global Audio Player (Calm Parity) */}
      <GlobalAudioPlayer />

    </div>
  );
};

export default MoodMate;