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
import SOSModal from './components/SOSModal';
import { API_BASE_URL } from './api';

const Icons = {
  chat: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--primary)' : 'var(--text-muted)'}
      strokeWidth={active ? '2.2' : '1.8'} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  'ai-coach': (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--primary)' : 'var(--text-muted)'}
      strokeWidth={active ? '2.2' : '1.8'} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
      <path d="M12 8v4l3 3" />
    </svg>
  ),
  therapy: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--primary)' : 'var(--text-muted)'}
      strokeWidth={active ? '2.2' : '1.8'} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  community: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--primary)' : 'var(--text-muted)'}
      strokeWidth={active ? '2.2' : '1.8'} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  profile: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? 'var(--primary)' : 'var(--text-muted)'}
      strokeWidth={active ? '2.2' : '1.8'} strokeLinecap="round" strokeLinejoin="round">
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

const NAV_TABS = [
  { id: 'chat', label: 'Home' },
  { id: 'ai-coach', label: 'Coach' },
  { id: 'therapy', label: 'Therapy' },
  { id: 'community', label: 'Connect' },
  { id: 'profile', label: 'Me' },
];

const TAB_IDS = NAV_TABS.map((tab) => tab.id);

const MoodMate = ({ user: initialUser, onLogout, forceDocLogin, onCancelDocLogin }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(!localStorage.getItem('moodmate_onboarded'));
  const [doctorMode, setDoctorMode] = useState(() => {
    try {
      const stored = localStorage.getItem('moodmate_doctor_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem('moodmate_doctor_session');
      return null;
    }
  });
  const [showDoctorLogin, setShowDoctorLogin] = useState(forceDocLogin || false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [user, setUser] = useState(
    initialUser || {
      username: 'Demo User',
      id: 1,
      is_premium: true,
      streak: 0,
      coins: 0,
      purchasedItems: [],
    }
  );
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 0, text: 'How are you feeling today? Your check-in streak is on track.', time: 'Just now', unread: true },
    { id: 1, text: 'You earned 5 coins for your last conversation.', time: '2m ago', unread: true },
    { id: 2, text: 'Someone in Connect resonated with your post.', time: '1h ago', unread: false },
  ]);

  const notifRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const scrollTimeout = useRef(null);

  const unreadCount = notifications.filter((notification) => notification.unread).length;
  const markAllRead = () => setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));

  useEffect(() => {
    if (forceDocLogin) setShowDoctorLogin(true);
  }, [forceDocLogin]);

  useEffect(() => {
    if (initialUser) setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    const handler = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
    };
    if (showNotifications) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifications]);

  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 1200);

    const params = new URLSearchParams(window.location.search);
    const shortcutTab = params.get('tab');
    if (shortcutTab && TAB_IDS.includes(shortcutTab)) {
      setActiveTab(shortcutTab);
    }
    
    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const sync = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/status?user_id=${user.id}`);
        const data = await response.json();
        if (data.status === 'success') {
          setUser((prev) => {
            const next = {
              ...prev,
              streak: data.streak ?? prev.streak ?? 0,
              lastMood: data.last_mood || 'neutral',
              coins: data.coins ?? prev.coins ?? 0,
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
  }, [user?.id]);

  const handleDoctorLogin = (doctor) => {
    setDoctorMode(doctor);
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

  const mergeUserUpdates = (updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      localStorage.setItem('moodmateUser', JSON.stringify(next));
      return next;
    });
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('moodmate_onboarded', 'true');
    setShowOnboarding(false);
  };

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
        {showSplash && (
          <motion.div 
            className="app-splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <div className="splash-content">
              <div className="splash-logo">🌙</div>
              <h2>MoodMate</h2>
              <div className="splash-loader">
                <div className="loader-fill" />
              </div>
            </div>
          </motion.div>
        )}
        {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      </AnimatePresence>

      <header className="app-header mobile-minimal-header">
        <h1 className="app-logo">MoodMate</h1>

        <div className="header-actions">
          <button
            className="sos-icon-btn"
            onClick={() => setShowSOSModal(true)}
            title="Emergency SOS"
            aria-label="Emergency SOS"
          >
            SOS
          </button>

          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              className="notif-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
            >
              {Icons.bell()}
              {unreadCount > 0 && <span className="notif-badge" />}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  className="notif-dropdown"
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="notif-header">
                    <span>Notifications</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button className="notif-mark-read" onClick={markAllRead}>Mark all read</button>
                      <button
                        className="notif-mark-read"
                        onClick={() => setShowNotifications(false)}
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                  <div className="notif-list">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`notif-item ${notification.unread ? 'unread' : ''}`}
                        onClick={() =>
                          setNotifications((prev) =>
                            prev.map((item) =>
                              item.id === notification.id ? { ...item, unread: false } : item
                            )
                          )
                        }
                      >
                        <div className="notif-item-text">{notification.text}</div>
                        <div className="notif-item-time">{notification.time}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <nav className="nav-tabs desktop-only" role="navigation" aria-label="Main navigation">
            {NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                className={activeTab === tab.id ? 'nav-tab active' : 'nav-tab'}
                onClick={() => handleTabClick(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {Icons[tab.id]?.(activeTab === tab.id) || Icons.chat(activeTab === tab.id)}
                {tab.label}
              </button>
            ))}
          </nav>

          {(user.streak > 0 || user.coins > 0) && (
            <div className="stats-pill desktop-only">
              <span className="stats-pill-item">Streak {user.streak || 0}</span>
              <span className="stats-pill-divider" />
              <span className="stats-pill-item">Coins {(user.coins || 0).toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>
      </header>

      <main className="app-main swipe-container" ref={scrollContainerRef} onScroll={syncActiveTab}>
        {NAV_TABS.map((tab) => (
          <div key={tab.id} className="swipe-slide" id={`slide-${tab.id}`}>
            {tab.id === 'chat' && <Chat user={user} />}
            {tab.id === 'ai-coach' && <AICoach user={user} />}
            {tab.id === 'therapy' && <Therapy user={user} onUpdateUser={mergeUserUpdates} />}
            {tab.id === 'community' && <Community user={user} />}
            {tab.id === 'profile' && <Profile user={user} onUpdateUser={mergeUserUpdates} onLogout={onLogout} />}
          </div>
        ))}
      </main>

      <AnimatePresence>
        {activeTab === 'report' && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            style={{ position: 'fixed', top: 52, left: 0, right: 0, bottom: 64, background: 'var(--bg-app)', zIndex: 100, overflow: 'hidden' }}
          >
            <Report user={user} onUpdateUser={mergeUserUpdates} />
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="nav-tabs mobile-bottom-nav" role="navigation" aria-label="Main navigation">
        {NAV_TABS.map((tab) => (
          <button
            key={tab.id}
            id={`mob-nav-${tab.id}`}
            className={activeTab === tab.id ? 'nav-tab active' : 'nav-tab'}
            onClick={() => handleTabClick(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.id === 'profile'
              ? <span className="nav-avatar">{(user.username || 'U').charAt(0).toUpperCase()}</span>
              : Icons[tab.id]?.(activeTab === tab.id)}
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <SOSModal 
        isOpen={showSOSModal} 
        onClose={() => setShowSOSModal(false)} 
      />
    </div>
  );
};

export default MoodMate;
