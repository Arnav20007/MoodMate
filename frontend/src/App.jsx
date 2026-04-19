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
import Onboarding from './components/Onboarding';

// Bottom nav tabs — Profile lives here like Instagram
const NAV_TABS = [
  { id: 'chat',      icon: '💬', label: 'Chat'      },
  { id: 'ai-coach',  icon: '🤖', label: 'Coach'     },
  { id: 'therapy',   icon: '🛋️', label: 'Therapy'   },
  { id: 'community', icon: '🌍', label: 'Community' },
  { id: 'profile',   icon: '👤', label: 'Profile'   },
];

const TAB_IDS = NAV_TABS.map(t => t.id);

const MoodMate = ({ user: initialUser, onLogout, forceDocLogin, onCancelDocLogin }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [swipeDir, setSwipeDir] = useState(1); // 1 = going right/forward, -1 = going left/back
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
    username: 'Demo User', id: 1, is_premium: true, streak: 0, coins: 0,
  });

  useEffect(() => {
    if (initialUser) setUser(initialUser);
  }, [initialUser]);

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const [notifications, setNotifications] = useState([
    { id: 0, text: `Your previous mood was recorded as ${initialUser?.lastMood || 'centered'}. Would you like to check in now? 🧘`, time: 'Just now', unread: true },
    { id: 1, text: 'Transaction complete: 5 coins awarded for activity. 🪙', time: '2m ago', unread: true },
    { id: 2, text: 'Your community contribution has received a reaction ❤️', time: '1h ago', unread: false },
    { id: 3, text: 'Clinical Insight: Your Weekly Wellness Report is available 📊', time: '3h ago', unread: false },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

  // Close notification dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside);
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
      } catch (err) { /* silently fail */ }
    };
    fetchUserStatus();
  }, [user?.id]);

  // ── Swipe Navigation ──
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    // Only register horizontal swipes (not scrolling)
    if (Math.abs(dx) < 50 || dy > Math.abs(dx)) return;

    const currentIndex = TAB_IDS.indexOf(activeTab);
    if (dx < 0 && currentIndex < TAB_IDS.length - 1) {
      // Swipe left → next tab
      setSwipeDir(1);
      setActiveTab(TAB_IDS[currentIndex + 1]);
    } else if (dx > 0 && currentIndex > 0) {
      // Swipe right → previous tab
      setSwipeDir(-1);
      setActiveTab(TAB_IDS[currentIndex - 1]);
    }
    touchStartX.current = null;
  };

  const handleTabClick = (tabId) => {
    const currentIndex = TAB_IDS.indexOf(activeTab);
    const newIndex = TAB_IDS.indexOf(tabId);
    setSwipeDir(newIndex >= currentIndex ? 1 : -1);
    setActiveTab(tabId);
  };

  // ── Rendering flow ──
  if (showDoctorLogin && !doctorMode) {
    return <DoctorLogin onLoginSuccess={handleDoctorLogin} onBackToApp={handleDocBackToApp} />;
  }

  if (doctorMode) {
    return (
      <div className="app-container" style={{ padding: 0 }}>
        <main className="app-main" style={{ padding: 0 }}>
          <DoctorDashboard doctor={doctorMode} onLogout={handleDoctorLogout} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      </AnimatePresence>

      {/* ── Minimal Header (Instagram/WhatsApp style) ── */}
      <header className="app-header mobile-minimal-header">
        {/* Left: Logo */}
        <h1 className="app-logo">MoodMate</h1>

        {/* Right: Only bell + SOS icon + avatar — clean like IG */}
        <div className="header-actions">
          {/* SOS — icon only on mobile */}
          <button
            className="sos-icon-btn"
            onClick={() => setShowSOSModal(true)}
            title="Emergency SOS"
            aria-label="Emergency SOS"
          >
            🆘
          </button>

          {/* Notification Bell */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              className="notif-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
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
                    <button className="notif-mark-read" onClick={markAllRead}>Mark all read</button>
                  </div>
                  <div className="notif-list">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        className={`notif-item ${n.unread ? 'unread' : ''}`}
                        onClick={() => setNotifications(prev =>
                          prev.map(item => item.id === n.id ? { ...item, unread: false } : item)
                        )}
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

          {/* Desktop nav tabs (hidden on mobile — shown in bottom nav) */}
          <nav className="nav-tabs desktop-only" role="navigation" aria-label="Main navigation">
            {NAV_TABS.map(tab => (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                className={activeTab === tab.id ? 'nav-tab active' : 'nav-tab'}
                onClick={() => handleTabClick(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <span role="img" aria-hidden="true">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Statistics pill — desktop only */}
          {(user.streak > 0 || user.coins > 0) && (
            <div className="stats-pill desktop-only">
              <span className="stats-pill-item">🔥 {user.streak || 0}</span>
              <span className="stats-pill-divider" />
              <span className="stats-pill-item">🪙 {(user.coins || 0).toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>
      </header>

      {/* ── Main Content with Swipe Support ── */}
      <main
        className="app-main"
        style={{ position: 'relative', overflow: 'hidden' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait" custom={swipeDir}>
          <motion.div
            key={activeTab}
            custom={swipeDir}
            initial={{ opacity: 0, x: swipeDir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: swipeDir * -40 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ width: '100%', flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            {activeTab === 'chat'      && <Chat user={user} />}
            {activeTab === 'ai-coach'  && <AICoach user={user} />}
            {activeTab === 'therapy'   && <Therapy user={user} />}
            {activeTab === 'community' && <Community user={user} />}
            {activeTab === 'report'    && <Report user={user} />}
            {activeTab === 'profile'   && <Profile user={user} onLogout={onLogout} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Bottom Navigation (mobile) — Profile tab included like Instagram ── */}
      <nav className="nav-tabs mobile-bottom-nav" role="navigation" aria-label="Main navigation">
        {NAV_TABS.map(tab => (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            className={activeTab === tab.id ? 'nav-tab active' : 'nav-tab'}
            onClick={() => handleTabClick(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.id === 'profile'
              ? <span className="nav-avatar">{(user.username || 'U').charAt(0).toUpperCase()}</span>
              : <span role="img" aria-hidden="true">{tab.icon}</span>
            }
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>





      {/* SOS Modal */}
      <AnimatePresence>
        {showSOSModal && (
          <motion.div
            className="sos-modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowSOSModal(false)}
          >
            <motion.div
              className="sos-modal-content"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
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
    </div>
  );
};

export default MoodMate;