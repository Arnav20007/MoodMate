import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './app.css';
import AICoach from './components/AICoach';
import Therapy from './components/Therapy';
import Community from './components/Community';
import Profile from './components/Profile';
import Chat from './components/Chat';
import Report from './components/Report';
import DoctorDashboard from './components/DoctorDashboard';
import DoctorLogin from './components/DoctorLogin';
import Onboarding from './components/Onboarding';
import { API_BASE_URL } from './api';

// ─── SVG Icons (clean, consistent stroke icons like Headspace/Calm) ───
const Icons = {
  chat: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--primary)' : 'var(--text-muted)'}
      strokeWidth={active ? "2.2" : "1.8"} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  'ai-coach': (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--primary)' : 'var(--text-muted)'}
      strokeWidth={active ? "2.2" : "1.8"} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
      <path d="M12 8v4l3 3" />
    </svg>
  ),
  therapy: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--primary)' : 'var(--text-muted)'}
      strokeWidth={active ? "2.2" : "1.8"} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  community: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--primary)' : 'var(--text-muted)'}
      strokeWidth={active ? "2.2" : "1.8"} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  profile: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--primary)' : 'var(--text-muted)'}
      strokeWidth={active ? "2.2" : "1.8"} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  bell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
};

// ─── 5 core tabs (AI Coach restored to footer per user request) ───
const NAV_TABS = [
  { id: 'chat',      label: 'Home'    },
  { id: 'ai-coach',  label: 'Coach'   },
  { id: 'therapy',   label: 'Therapy' },
  { id: 'community', label: 'Connect' },
  { id: 'profile',   label: 'Me'      },
];
const TAB_IDS = NAV_TABS.map(t => t.id);

const MoodMate = ({ user: initialUser, onLogout, forceDocLogin, onCancelDocLogin }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [showOnboarding, setShowOnboarding] = useState(
    !localStorage.getItem('moodmate_onboarded')
  );

  // ── Doctor Portal ──
  const [doctorMode, setDoctorMode] = useState(() => {
    try {
      const s = localStorage.getItem('moodmate_doctor_session');
      return s ? JSON.parse(s) : null;
    } catch {
      localStorage.removeItem('moodmate_doctor_session');
      return null;
    }
  });
  const [showDoctorLogin, setShowDoctorLogin] = useState(forceDocLogin || false);
  const [showSOSModal, setShowSOSModal] = useState(false);

  useEffect(() => { if (forceDocLogin) setShowDoctorLogin(true); }, [forceDocLogin]);

  const handleDoctorLogin  = (doc) => { setDoctorMode(doc); setShowDoctorLogin(false); };
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

  // ── Patient User ──
  const [user, setUser] = useState(initialUser || {
    username: 'Demo User', id: 1, is_premium: true, streak: 0, coins: 0, purchasedItems: [],
  });
  useEffect(() => { if (initialUser) setUser(initialUser); }, [initialUser]);

  const mergeUserUpdates = (updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      localStorage.setItem('moodmateUser', JSON.stringify(next));
      return next;
    });
  };

  // ── Notifications ──
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const [notifications, setNotifications] = useState([
    { id: 0, text: 'How are you feeling today? Your check-in streak is on track 🌱', time: 'Just now', unread: true },
    { id: 1, text: 'You earned 5 coins for your last conversation 🪙', time: '2m ago', unread: true },
    { id: 2, text: 'Someone in the community resonated with your post ❤️', time: '1h ago', unread: false },
  ]);
  const unreadCount  = notifications.filter(n => n.unread).length;
  const markAllRead  = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    if (showNotifications) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifications]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('moodmate_onboarded', 'true');
    setShowOnboarding(false);
  };

  // ── Sync user status ──
  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    const sync = async () => {
      try {
        const res  = await fetch(`${API_BASE_URL}/api/user/status?user_id=${userId}`);
        const data = await res.json();
        if (data.status === 'success') {
          setUser(prev => {
            const next = {
              ...prev,
              streak: data.streak ?? prev.streak ?? 0,
              lastMood: data.last_mood || 'neutral',
              coins:  data.coins   ?? prev.coins  ?? 0,
              is_premium: data.is_premium ?? prev.is_premium ?? false,
              premium_plan: data.premium_plan ?? prev.premium_plan ?? 'free',
              purchasedItems: data.purchased_items ?? prev.purchasedItems ?? [],
            };
            localStorage.setItem('moodmateUser', JSON.stringify(next));
            return next;
          });
        }
      } catch {}
    };
    sync();
  }, [userId]);

  // ── Native Scroll-Snap Tab switching ──
  const scrollContainerRef = useRef(null);
  const scrollTimeout       = useRef(null);

  const syncActiveTab = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      if (!scrollContainerRef.current) return;
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      if (TAB_IDS[index] && activeTab !== TAB_IDS[index]) setActiveTab(TAB_IDS[index]);
    }, 80);
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    const index = TAB_IDS.indexOf(tabId);
    if (scrollContainerRef.current && index !== -1) {
      scrollContainerRef.current.scrollTo({
        left: index * scrollContainerRef.current.clientWidth,
        behavior: 'smooth',
      });
    }
  };

  // ── Rendering flow ──
  if (showDoctorLogin && !doctorMode) {
    return <DoctorLogin onLoginSuccess={handleDoctorLogin} onBackToApp={handleDocBackToApp} />;
  }
  if (doctorMode) {
    return (
      <div className="app-container">
        <main className="app-main">
          <div className="swipe-slide">
            <DoctorDashboard doctor={doctorMode} onLogout={handleDoctorLogout} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      </AnimatePresence>

      {/* ── Header ── */}
      <header className="app-header mobile-minimal-header">
        <h1 className="app-logo">MoodMate</h1>

        <div className="header-actions">
          {/* SOS */}
          <button className="sos-icon-btn" onClick={() => setShowSOSModal(true)}
            title="Emergency SOS" aria-label="Emergency SOS">
            🆘
          </button>

          {/* Notifications */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button className="notif-btn" onClick={() => setShowNotifications(!showNotifications)}
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`}>
              {Icons.bell()}
              {unreadCount > 0 && <span className="notif-badge" />}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div className="notif-dropdown"
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  onClick={e => e.stopPropagation()}>
                  <div className="notif-header">
                    <span>Notifications</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button className="notif-mark-read" onClick={markAllRead}>Mark all read</button>
                      <button className="notif-mark-read" onClick={() => setShowNotifications(false)}
                        style={{ color: 'var(--text-muted)' }}>✕</button>
                    </div>
                  </div>
                  <div className="notif-list">
                    {notifications.map(n => (
                      <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}
                        onClick={() => setNotifications(prev =>
                          prev.map(item => item.id === n.id ? { ...item, unread: false } : item))}>
                        <div className="notif-item-text">{n.text}</div>
                        <div className="notif-item-time">{n.time}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop nav tabs */}
          <nav className="nav-tabs desktop-only" role="navigation" aria-label="Main navigation">
            {NAV_TABS.map(tab => (
              <button key={tab.id} id={`nav-tab-${tab.id}`}
                className={activeTab === tab.id ? 'nav-tab active' : 'nav-tab'}
                onClick={() => handleTabClick(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}>
                {Icons[tab.id]?.(activeTab === tab.id) || Icons.chat(activeTab === tab.id)}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Stats pill (desktop) */}
          {(user.streak > 0 || user.coins > 0) && (
            <div className="stats-pill desktop-only">
              <span className="stats-pill-item">🔥 {user.streak || 0}</span>
              <span className="stats-pill-divider" />
              <span className="stats-pill-item">🪙 {(user.coins || 0).toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>
      </header>

      {/* ── Native Scroll-Snap Content ── */}
      <main className="app-main swipe-container"
        ref={scrollContainerRef}
        onScroll={syncActiveTab}>
      {NAV_TABS.map(tab => (
          <div key={tab.id} className="swipe-slide" id={`slide-${tab.id}`}>
            {tab.id === 'chat'      && <Chat user={user} />}
            {tab.id === 'ai-coach' && <AICoach user={user} />}
            {tab.id === 'therapy'  && <Therapy user={user} onUpdateUser={mergeUserUpdates} />}
            {tab.id === 'community'&& <Community user={user} />}
            {tab.id === 'profile'  && <Profile user={user} onUpdateUser={mergeUserUpdates} onLogout={onLogout} />}
          </div>
        ))}
      </main>

      {/* Report overlay when accessed from Profile */}
      <AnimatePresence>
        {activeTab === 'report' && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            style={{ position: 'fixed', top: 52, left: 0, right: 0, bottom: 64, background: 'var(--bg-app)', zIndex: 100, overflow: 'hidden' }}>
            <Report user={user} onUpdateUser={mergeUserUpdates} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Navigation (mobile) ── */}
      <nav className="nav-tabs mobile-bottom-nav" role="navigation" aria-label="Main navigation">
        {NAV_TABS.map(tab => (
          <button key={tab.id} id={`mob-nav-${tab.id}`}
            className={activeTab === tab.id ? 'nav-tab active' : 'nav-tab'}
            onClick={() => handleTabClick(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}>
            {tab.id === 'profile'
              ? <span className="nav-avatar">{(user.username || 'U').charAt(0).toUpperCase()}</span>
              : Icons[tab.id]?.(activeTab === tab.id)
            }
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ── SOS Modal ── */}
      <AnimatePresence>
        {showSOSModal && (
          <motion.div className="sos-modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowSOSModal(false)}>
            <motion.div className="sos-modal-content"
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              onClick={e => e.stopPropagation()}>
              <div className="sos-modal-header">
                <h2>🆘 Emergency Support</h2>
                <button className="sos-modal-close" onClick={() => setShowSOSModal(false)}>✕</button>
              </div>
              <div className="sos-modal-body">
                <p>You are not alone. Reach out to these free, confidential helplines available 24/7.</p>
                <div className="sos-helpline-list">
                  <div className="sos-item highlight">
                    <span className="sos-label">National Emergency</span>
                    <a href="tel:112" className="sos-number">📞 112</a>
                  </div>
                  <div className="sos-item">
                    <span className="sos-label">Vandrevala Foundation</span>
                    <a href="tel:9999666555" className="sos-number">9999-666-555</a>
                  </div>
                  <div className="sos-item">
                    <span className="sos-label">iCall (TISS)</span>
                    <a href="tel:02225521111" className="sos-number">022-2552-1111</a>
                  </div>
                  <div className="sos-item">
                    <span className="sos-label">Aasra (24/7)</span>
                    <a href="tel:919820466726" className="sos-number">+91-9820466726</a>
                  </div>
                </div>
                <div className="sos-footer-msg">
                  <p>Free · Confidential · Available 24/7</p>
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
