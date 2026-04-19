import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Profile.css';
import './Premium.css';

import Breathing from './BreathingExercise';
import Games from './GamesModal';
import Journal from './JournalModal';
import Sleep from './SleepCompanionModal';
import Shop from './ShopModal';
import Report from './Report';
import AICoach from './AICoach';
import Meditation from './Meditation';
import PremiumPlans from './PremiumPlans';

function Profile({ user, onUpdateUser, onLogout }) {
  const [activeSection, setActiveSection] = useState('home');
  const [activeToolSection, setActiveToolSection] = useState(null);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [premiumFeature, setPremiumFeature] = useState('');

  const userXP = user.xp || 1250;
  const currentLevel = Math.floor(userXP / 1000) + 1;
  const xpIntoLevel = userXP % 1000;
  const levelProgress = (xpIntoLevel / 1000) * 100;

  const badges = [
    { id: 1, icon: '🔥', name: 'Hot Streak', earned: (user.streak || 0) >= 7 },
    { id: 2, icon: '🧘', name: 'Zen Master', earned: true },
    { id: 3, icon: '💎', name: 'Premium', earned: user.is_premium },
    { id: 4, icon: '🗣️', name: 'Open Book', earned: false },
  ];

  const TOOLS = [
    { id: 'breathing', icon: '🌬️', label: 'Breathe', premium: false },
    { id: 'journal',   icon: '📔', label: 'Journal',  premium: false },
    { id: 'games',     icon: '🎮', label: 'Games',    premium: false },
    { id: 'shop',      icon: '🛒', label: 'Shop',     premium: false },
    { id: 'sleep',     icon: '🌙', label: 'Sleep',    premium: true  },
    { id: 'meditation',icon: '🧘', label: 'Meditate', premium: true  },
    { id: 'report',    icon: '📊', label: 'Report',   premium: true  },
    { id: 'aiCoach',   icon: '🤖', label: 'Coach',    premium: true  },
  ];

  const handleTool = (tool) => {
    if (tool.premium && !user.is_premium) {
      setPremiumFeature(tool.id);
      setShowPremiumPopup(true);
      return;
    }
    setActiveToolSection(tool.id);
    setActiveSection('tool');
  };

  const renderTool = (id) => {
    const props = {
      user, onUpdateUser,
      onClose: () => { setActiveToolSection(null); setActiveSection('home'); },
    };
    switch (id) {
      case 'breathing':  return <Breathing {...props} />;
      case 'games':      return <Games {...props} />;
      case 'journal':    return <Journal {...props} />;
      case 'sleep':      return <Sleep {...props} />;
      case 'shop':       return <Shop {...props} />;
      case 'report':     return <Report {...props} />;
      case 'aiCoach':    return <AICoach {...props} />;
      case 'meditation': return <Meditation {...props} />;
      default:           return null;
    }
  };

  // ── If a tool is open, render it full-screen ──
  if (activeSection === 'tool' && activeToolSection) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => { setActiveToolSection(null); setActiveSection('home'); }}
            style={{ background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#6366f1' }}>
            ←
          </button>
          <span style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a' }}>
            {TOOLS.find(t => t.id === activeToolSection)?.label}
          </span>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {renderTool(activeToolSection)}
        </div>
      </div>
    );
  }

  if (activeSection === 'premium') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setActiveSection('home')}
            style={{ background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#6366f1' }}>
            ←
          </button>
          <span style={{ fontWeight: '700', fontSize: '16px' }}>Premium Plans</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <PremiumPlans user={user}
            onSubscribe={() => { localStorage.setItem('moodmateUser', JSON.stringify({ ...user, is_premium: true })); window.location.reload(); }}
            onClose={() => setActiveSection('home')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="profile-ig-container">
      {/* ── Premium Popup ── */}
      <AnimatePresence>
        {showPremiumPopup && (
          <motion.div className="premium-popup-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="premium-popup-container" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <div className="premium-popup-header">
                <div className="premium-popup-icon">💎</div>
                <h3>Premium Feature</h3>
                <button className="premium-popup-close" onClick={() => setShowPremiumPopup(false)}>×</button>
              </div>
              <div className="premium-popup-content">
                <h2>Unlock this feature</h2>
                <p>Upgrade to Premium to access all wellness tools without limits.</p>
              </div>
              <div className="premium-popup-actions">
                <button className="premium-popup-btn secondary" onClick={() => setShowPremiumPopup(false)}>Later</button>
                <button className="premium-popup-btn primary" onClick={() => { setShowPremiumPopup(false); setActiveSection('premium'); }}>Upgrade Now</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── IG-Style Profile Header ── */}
      <div className="profile-ig-header">
        {/* Avatar */}
        <div className="profile-ig-avatar-wrap">
          <div className="profile-ig-avatar">
            {(user.username || 'U').charAt(0).toUpperCase()}
          </div>
          {user.is_premium && <div className="profile-ig-premium-ring" />}
        </div>

        {/* Stats row */}
        <div className="profile-ig-stats">
          <div className="profile-ig-stat">
            <span className="pig-stat-num">{user.streak || 0}</span>
            <span className="pig-stat-lbl">🔥 Streak</span>
          </div>
          <div className="profile-ig-stat">
            <span className="pig-stat-num">{(user.coins || 0).toLocaleString('en-IN')}</span>
            <span className="pig-stat-lbl">🪙 Coins</span>
          </div>
          <div className="profile-ig-stat">
            <span className="pig-stat-num">Lv {currentLevel}</span>
            <span className="pig-stat-lbl">⭐ Level</span>
          </div>
        </div>
      </div>

      {/* Name + bio */}
      <div className="profile-ig-bio">
        <div className="profile-ig-name">{user.username || 'User'}</div>
        <div className="profile-ig-email">{user.email || ''}</div>
        {user.is_premium
          ? <span className="profile-ig-badge premium">🌟 Premium Member</span>
          : <span className="profile-ig-badge free" onClick={() => setActiveSection('premium')} style={{ cursor: 'pointer' }}>💎 Upgrade to Premium</span>
        }
      </div>

      {/* XP Bar */}
      <div className="profile-ig-xp">
        <div className="profile-ig-xp-label">
          <span>Level {currentLevel}</span>
          <span>{xpIntoLevel} / 1000 XP</span>
        </div>
        <div className="profile-ig-xp-track">
          <motion.div className="profile-ig-xp-fill"
            initial={{ width: 0 }} animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Badges row */}
      <div className="profile-ig-badges">
        {badges.map(b => (
          <div key={b.id} className={`profile-ig-badge-pill ${b.earned ? 'earned' : 'locked'}`}>
            <span>{b.earned ? b.icon : '🔒'}</span>
            <span>{b.name}</span>
          </div>
        ))}
      </div>

      {/* ── Section Tabs ── */}
      <div className="profile-ig-tabs">
        {[
          { id: 'home',     label: '⚡ Today' },
          { id: 'tools',    label: '🛠 Tools' },
          { id: 'settings', label: '⚙️ Settings' },
        ].map(t => (
          <button
            key={t.id}
            className={`profile-ig-tab ${activeSection === t.id ? 'active' : ''}`}
            onClick={() => setActiveSection(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Scrollable Content ── */}
      <div className="profile-ig-body">

        {/* TODAY VIEW */}
        {activeSection === 'home' && (
          <div className="profile-ig-section">
            {/* Wellness tree card */}
            <div className="profile-ig-card zen-card">
              <div className="zen-visual">
                <span style={{ fontSize: 52 }}>
                  {(user.streak || 0) >= 21 ? '🌳' : (user.streak || 0) >= 7 ? '🌿' : '🌱'}
                </span>
              </div>
              <div className="zen-info">
                <div className="zen-title">Wellness Tree</div>
                <div className="zen-sub">
                  {(user.streak || 0) >= 21 ? 'Mature Oak 🏆' : (user.streak || 0) >= 7 ? 'Growing Sapling' : 'Planted Seed'}
                </div>
                <div className="zen-bar-track">
                  <div className="zen-bar-fill" style={{ width: `${Math.min((user.streak || 0) * 5, 100)}%` }} />
                </div>
                <div className="zen-progress">{Math.min((user.streak || 0) * 5, 100)}% Protection Aura</div>
              </div>
            </div>

            {/* Daily protocols */}
            <div className="profile-ig-card-title">⚡ Daily Protocols</div>
            {[
              { icon: '📱', title: 'Minimalist Protocol', sub: 'Reduce social media by 2 hrs', progress: 60 },
              { icon: '✍️', title: 'Emotional Anchor', sub: 'Write 3 lines of gratitude', progress: 0 },
              { icon: '🏔️', title: '21-Day Streak Goal', sub: `Day ${user.streak || 0} / 21`, progress: Math.min(((user.streak || 0) / 21) * 100, 100) },
            ].map((q, i) => (
              <div key={i} className="profile-ig-card quest-card">
                <div className="quest-icon">{q.icon}</div>
                <div className="quest-info">
                  <div className="quest-title">{q.title}</div>
                  <div className="quest-sub">{q.sub}</div>
                  <div className="quest-bar-track">
                    <div className="quest-bar-fill" style={{ width: `${q.progress}%` }} />
                  </div>
                </div>
                <div className="quest-pct">{Math.round(q.progress)}%</div>
              </div>
            ))}

            {/* Mini stats grid */}
            <div className="profile-ig-card-title" style={{ marginTop: 20 }}>📊 Stats</div>
            <div className="profile-mini-grid">
              {[
                { icon: '⛅', label: 'Neural Forecast', val: 'Partly Cloudy', color: '#f0f9ff' },
                { icon: '💧', label: 'Hydration', val: '4 / 8 glasses', color: '#e0f2fe' },
                { icon: '😴', label: 'Sleep Debt', val: '1.2 hrs', color: '#f5f3ff' },
                { icon: '📱', label: 'Screen Time', val: '-14% vs yesterday', color: '#fdf4ff' },
              ].map((s, i) => (
                <div key={i} className="profile-mini-card" style={{ background: s.color }}>
                  <div className="pmc-icon">{s.icon}</div>
                  <div className="pmc-label">{s.label}</div>
                  <div className="pmc-val">{s.val}</div>
                </div>
              ))}
            </div>

            {/* Logout button */}
            <button className="profile-ig-logout" onClick={onLogout}>
              Sign Out
            </button>
          </div>
        )}

        {/* TOOLS VIEW - Instagram highlight grid style */}
        {activeSection === 'tools' && (
          <div className="profile-ig-section">
            <div className="profile-ig-card-title">🛠 Wellness Tools</div>
            <div className="profile-tools-grid">
              {TOOLS.map(tool => (
                <button key={tool.id} className="profile-tool-tile" onClick={() => handleTool(tool)}>
                  <div className="ptt-icon">{tool.icon}</div>
                  <div className="ptt-label">{tool.label}</div>
                  {tool.premium && !user.is_premium && (
                    <div className="ptt-lock">💎</div>
                  )}
                </button>
              ))}
            </div>

            <button className="profile-upgrade-btn" onClick={() => setActiveSection('premium')}>
              💎 View Premium Plans
            </button>
          </div>
        )}

        {/* SETTINGS VIEW */}
        {activeSection === 'settings' && (
          <div className="profile-ig-section">
            {/* Account info */}
            <div className="profile-ig-card-title">👤 Account</div>
            <div className="profile-settings-card">
              <div className="psc-row">
                <span className="psc-label">Username</span>
                <span className="psc-val">{user.username || '—'}</span>
              </div>
              <div className="psc-row">
                <span className="psc-label">Email</span>
                <span className="psc-val">{user.email || '—'}</span>
              </div>
              <div className="psc-row">
                <span className="psc-label">Plan</span>
                <span className="psc-val" style={{ color: user.is_premium ? '#f59e0b' : '#6366f1' }}>
                  {user.is_premium ? 'Premium 🌟' : 'Free'}
                </span>
              </div>
            </div>

            {/* Toggles */}
            <div className="profile-ig-card-title" style={{ marginTop: 20 }}>🔔 Preferences</div>
            <div className="profile-settings-card">
              {[
                { label: 'Push Notifications', sub: 'Daily reminders and nudges' },
                { label: 'Biometric Lock', sub: 'FaceID / Fingerprint to open' },
                { label: 'Daily Check-in Reminder', sub: 'Get reminded to log mood' },
              ].map((pref, i) => (
                <div key={i} className="psc-toggle-row">
                  <div>
                    <div className="psc-label">{pref.label}</div>
                    <div className="psc-sub">{pref.sub}</div>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider round" />
                  </label>
                </div>
              ))}
            </div>

            {/* Security */}
            <div className="profile-ig-card-title" style={{ marginTop: 20 }}>🛡️ Security</div>
            <div className="profile-settings-card">
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>🔒</span>
                <span style={{ fontSize: '13px', color: '#166534' }}>AES-256 encryption active on all data.</span>
              </div>
            </div>

            {/* Integrations */}
            <div className="profile-ig-card-title" style={{ marginTop: 20 }}>⌚ Integrations</div>
            <div className="profile-settings-card">
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="integration-btn">🍎 Apple Health</button>
                <button className="integration-btn">🤖 Google Fit</button>
              </div>
            </div>

            {/* Danger zone */}
            <div className="profile-ig-card-title" style={{ marginTop: 20, color: '#ef4444' }}>🛑 Account</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="profile-ig-logout" onClick={onLogout}>Sign Out</button>
              <button className="profile-danger-btn">Deactivate Account</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Profile;