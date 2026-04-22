import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Profile.css';
import './Premium.css';
import { API_BASE_URL } from '../api';

import Breathing from './BreathingExercise';
import Games from './GamesModal';
import Journal from './JournalModal';
import Sleep from './SleepCompanionModal';
import Shop from './ShopModal';
import Report from './Report';
import AICoach from './AICoach';
import Meditation from './Meditation';
import PremiumPlans from './PremiumPlans';
import AdminDoctorsPanel from './AdminDoctorsPanel';

const TOOLS = [
  { id: 'breathing', icon: 'Breathe', label: 'Breathing', premium: false },
  { id: 'journal', icon: 'Write', label: 'Journal', premium: false },
  { id: 'games', icon: 'Play', label: 'Games', premium: false },
  { id: 'shop', icon: 'Store', label: 'Shop', premium: false },
  { id: 'sleep', icon: 'Sleep', label: 'Sleep Aid', premium: true },
  { id: 'meditation', icon: 'Focus', label: 'Meditation', premium: true },
  { id: 'report', icon: 'Insights', label: 'Report', premium: true },
  { id: 'aiCoach', icon: 'Coach', label: 'AI Coach', premium: true },
];

const sectionMotion = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.26,
      ease: 'easeOut',
      staggerChildren: 0.05,
    },
  },
};

const cardMotion = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.24, ease: 'easeOut' } },
};

function Profile({ user, onUpdateUser, onLogout }) {
  const [activeSection, setActiveSection] = useState('home');
  const [activeToolSection, setActiveToolSection] = useState(null);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const isAdmin = user.role === 'admin';

  const userXP = user.xp || 1250;
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useState(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const currentLevel = Math.floor(userXP / 1000) + 1;
  const xpIntoLevel = userXP % 1000;
  const levelProgress = (xpIntoLevel / 1000) * 100;

  const badges = useMemo(
    () => [
      { id: 1, icon: 'Streak', name: 'Hot Streak', earned: (user.streak || 0) >= 7 },
      { id: 2, icon: 'Calm', name: 'Zen Master', earned: true },
      { id: 3, icon: 'Premium', name: 'Premium', earned: user.is_premium },
      { id: 4, icon: 'Journal', name: 'Open Book', earned: false },
    ],
    [user.is_premium, user.streak]
  );

  const dailyProtocols = [
    {
      icon: 'Reset',
      title: 'Minimalist Protocol',
      sub: 'Reduce social media by 2 hrs',
      progress: 60,
    },
    {
      icon: 'Reflect',
      title: 'Emotional Anchor',
      sub: 'Write 3 lines of gratitude',
      progress: 0,
    },
    {
      icon: 'Streak',
      title: '21-Day Streak Goal',
      sub: `Day ${user.streak || 0} / 21`,
      progress: Math.min(((user.streak || 0) / 21) * 100, 100),
    },
  ];

  const miniStats = [
    { icon: 'Forecast', label: 'Neural Forecast', val: 'Partly Cloudy' },
    { icon: 'Water', label: 'Hydration', val: '4 / 8 glasses' },
    { icon: 'Sleep', label: 'Sleep Debt', val: '1.2 hrs' },
    { icon: 'Screen', label: 'Screen Time', val: '-14% vs yesterday' },
  ];

  const quickWins = [
    'Two-minute breathing reset',
    'Mood check-in before bed',
    'Put your phone away 30 minutes earlier',
  ];

  const preferences = [
    { label: 'Push Notifications', sub: 'Daily reminders and nudges' },
    { label: 'Biometric Lock', sub: 'Face ID or fingerprint to open' },
    { label: 'Daily Check-in Reminder', sub: 'Get reminded to log your mood' },
  ];

  const handleTool = (tool) => {
    if (tool.premium && !user.is_premium) {
      setShowPremiumPopup(true);
      return;
    }
    setActiveToolSection(tool.id);
    setActiveSection('tool');
  };

  const renderTool = (id) => {
    const props = {
      user,
      onUpdateUser,
      onClose: () => {
        setActiveToolSection(null);
        setActiveSection('home');
      },
    };

    switch (id) {
      case 'breathing':
        return <Breathing {...props} />;
      case 'games':
        return <Games {...props} />;
      case 'journal':
        return <Journal {...props} />;
      case 'sleep':
        return <Sleep {...props} />;
      case 'shop':
        return <Shop {...props} />;
      case 'report':
        return <Report {...props} />;
      case 'aiCoach':
        return <AICoach {...props} />;
      case 'meditation':
        return <Meditation {...props} />;
      case 'adminDoctors':
        return <AdminDoctorsPanel onClose={props.onClose} />;
      default:
        return null;
    }
  };

  const renderShellHeader = (title, onBack) => (
    <div className="tool-back-bar">
      <button className="tool-back-btn" onClick={onBack}>
        Back
      </button>
      <span className="tool-back-label">{title}</span>
    </div>
  );

  if (activeSection === 'tool' && activeToolSection) {
    return (
      <div className="profile-shell-screen">
        {renderShellHeader(TOOLS.find((tool) => tool.id === activeToolSection)?.label, () => {
          setActiveToolSection(null);
          setActiveSection('home');
        })}
        <div className="profile-shell-body">{renderTool(activeToolSection)}</div>
      </div>
    );
  }

  if (activeSection === 'premium') {
    return (
      <div className="profile-shell-screen">
        {renderShellHeader('Premium Plans', () => setActiveSection('home'))}
        <div className="profile-shell-scroll">
          <PremiumPlans
            user={user}
            onSubscribe={(selectedPlan) =>
              onUpdateUser?.({
                is_premium: true,
                premium_plan: selectedPlan || 'annual',
                role: 'premium',
              })
            }
            onClose={() => setActiveSection('home')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="profile-ig-container">
      <AnimatePresence>
        {showPremiumPopup && (
          <motion.div className="premium-popup-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="premium-popup-container" initial={{ scale: 0.94, y: 18 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 18 }}>
              <button className="premium-popup-close" onClick={() => setShowPremiumPopup(false)}>
                Close
              </button>
              <div className="premium-popup-header">
                <div className="premium-popup-icon">Premium</div>
              </div>
              <div className="premium-popup-content">
                <h3>Unlock this premium feature</h3>
                <p>Upgrade to access deeper reports, advanced tools, and a more personalized wellness experience.</p>
              </div>
              <div className="premium-popup-actions">
                <button className="premium-popup-btn secondary" onClick={() => setShowPremiumPopup(false)}>
                  Maybe later
                </button>
                <button
                  className="premium-popup-btn primary"
                  onClick={() => {
                    setShowPremiumPopup(false);
                    setActiveSection('premium');
                  }}
                >
                  View plans
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="profile-hero">
        <div className="profile-hero-top">
          <div className="profile-ig-avatar-wrap">
            <div className="profile-ig-avatar">{(user.username || 'U').charAt(0).toUpperCase()}</div>
            {user.is_premium && <div className="profile-ig-premium-ring" />}
          </div>

          <div className="profile-hero-copy">
            <span className="profile-kicker">Personal dashboard</span>
            <h2>{user.username || 'User'}</h2>
            <p>{user.email || 'Your progress, rituals, and support tools in one calm place.'}</p>
            {user.is_premium ? (
              <span className="profile-ig-badge premium">Premium Member</span>
            ) : (
              <button className="profile-inline-upgrade" onClick={() => setActiveSection('premium')}>
                Upgrade to Premium
              </button>
            )}
          </div>
        </div>

        <div className="profile-hero-note">
          <strong>Today&apos;s focus</strong>
          <span>
            {(user.streak || 0) >= 7
              ? 'Protect your rhythm with one small repeatable action.'
              : 'Small actions count. Aim for one supportive check-in today.'}
          </span>
        </div>

        <div className="profile-hero-stats">
          <div className="profile-ig-stat">
            <span className="pig-stat-num">{user.streak || 0}</span>
            <span className="pig-stat-lbl">Streak</span>
          </div>
          <div className="profile-ig-stat">
            <span className="pig-stat-num">{(user.coins || 0).toLocaleString('en-IN')}</span>
            <span className="pig-stat-lbl">Coins</span>
          </div>
          <div className="profile-ig-stat">
            <span className="pig-stat-num">Lv {currentLevel}</span>
            <span className="pig-stat-lbl">Level</span>
          </div>
        </div>

        <div className="profile-ig-xp">
          <div className="profile-ig-xp-label">
            <span>Level {currentLevel}</span>
            <span>{xpIntoLevel} / 1000 XP</span>
          </div>
          <div className="profile-ig-xp-track">
            <motion.div
              className="profile-ig-xp-fill"
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      <div className="profile-ig-badges">
        {badges.map((badge) => (
          <div key={badge.id} className={`profile-ig-badge-pill ${badge.earned ? 'earned' : 'locked'}`}>
            <span>{badge.earned ? badge.icon : 'Locked'}</span>
            <span>{badge.name}</span>
          </div>
        ))}
      </div>

      <div className="profile-ig-tabs">
        {[
          { id: 'home', label: 'Today' },
          { id: 'tools', label: 'Tools' },
          { id: 'settings', label: 'Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`profile-ig-tab ${activeSection === tab.id ? 'active' : ''}`}
            onClick={() => setActiveSection(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="profile-ig-body">
        {activeSection === 'home' && (
          <motion.div className="profile-ig-section" variants={sectionMotion} initial="hidden" animate="visible">
            <motion.div className="profile-ig-card zen-card dark" variants={cardMotion}>
              <div className="zen-visual">{(user.streak || 0) >= 21 ? '🏔️' : (user.streak || 0) >= 7 ? '🌿' : '🌱'}</div>
              <div className="zen-info">
                <div className="zen-title">Wellness Tree</div>
                <div className="zen-sub">
                  {(user.streak || 0) >= 21 ? 'Mature rhythm' : (user.streak || 0) >= 7 ? 'Growing consistency' : 'Fresh start'}
                </div>
                <div className="zen-bar-track">
                  <div className="zen-bar-fill" style={{ width: `${Math.min((user.streak || 0) * 5, 100)}%` }} />
                </div>
                <div className="zen-progress">{Math.min((user.streak || 0) * 5, 100)}% care momentum</div>
              </div>
            </motion.div>

            <motion.div className="profile-ig-card-title" variants={cardMotion}>📋 Today's Protocols</motion.div>
            {dailyProtocols.map((protocol, idx) => (
              <motion.div key={protocol.title} className={`profile-ig-card quest-card ${idx % 2 === 1 ? 'dark' : ''}`} variants={cardMotion}>
                <div className="quest-icon">{protocol.icon}</div>
                <div className="quest-info">
                  <div className="quest-title">{protocol.title}</div>
                  <div className="quest-sub">{protocol.sub}</div>
                  <div className="quest-bar-track">
                    <div className="quest-bar-fill" style={{ width: `${protocol.progress}%` }} />
                  </div>
                </div>
                <div className="quest-pct">{Math.round(protocol.progress)}%</div>
              </motion.div>
            ))}

            <motion.div className="profile-ig-card-title" variants={cardMotion}>Quick Wins</motion.div>
            <motion.div className="profile-quick-list" variants={cardMotion}>
              {quickWins.map((item) => (
                <div key={item} className="profile-quick-item">
                  <span className="profile-quick-dot" />
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>

            <motion.div className="profile-ig-card-title" variants={cardMotion}>Stats</motion.div>
            <motion.div className="profile-mini-grid" variants={cardMotion}>
              {miniStats.map((stat) => (
                <div key={stat.label} className="profile-mini-card">
                  <div className="pmc-icon">{stat.icon}</div>
                  <div className="pmc-label">{stat.label}</div>
                  <div className="pmc-val">{stat.val}</div>
                </div>
              ))}
            </motion.div>

            <motion.button className="profile-ig-logout" onClick={onLogout} variants={cardMotion}>
              Sign Out
            </motion.button>
          </motion.div>
        )}

        {activeSection === 'tools' && (
          <motion.div className="profile-ig-section" variants={sectionMotion} initial="hidden" animate="visible">
            <motion.div className="profile-ig-card-title" variants={cardMotion}>Wellness Tools</motion.div>
            <motion.div className="profile-tools-grid" variants={cardMotion}>
              {TOOLS.map((tool) => (
                <button key={tool.id} className="profile-tool-tile" onClick={() => handleTool(tool)}>
                  <div className="ptt-icon">{tool.icon}</div>
                  <div className="ptt-label">{tool.label}</div>
                  {tool.premium && !user.is_premium && <div className="ptt-lock">Premium</div>}
                </button>
              ))}
            </motion.div>

            <motion.button className="profile-upgrade-btn" onClick={() => setActiveSection('premium')} variants={cardMotion}>
              View Premium Plans
            </motion.button>
          </motion.div>
        )}

        {activeSection === 'settings' && (
          <motion.div className="profile-ig-section" variants={sectionMotion} initial="hidden" animate="visible">
            <motion.div className="profile-ig-card-title" variants={cardMotion}>Account</motion.div>
            <motion.div className="profile-settings-card" variants={cardMotion}>
              <div className="psc-row">
                <span className="psc-label">Username</span>
                <span className="psc-val">{user.username || '--'}</span>
              </div>
              <div className="psc-row">
                <span className="psc-label">Email</span>
                <span className="psc-val">{user.email || '--'}</span>
              </div>
              <div className="psc-row">
                <span className="psc-label">Plan</span>
                <span className={`psc-plan ${user.is_premium ? 'premium' : 'free'}`}>{user.is_premium ? 'Premium' : 'Free'}</span>
              </div>
            </motion.div>

            <motion.div className="profile-ig-card-title" variants={cardMotion}>Preferences</motion.div>
            <motion.div className="profile-settings-card" variants={cardMotion}>
              {preferences.map((pref) => (
                <div key={pref.label} className="psc-toggle-row">
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
            </motion.div>

            <motion.div className="profile-ig-card-title" variants={cardMotion}>Security</motion.div>
            <motion.div className="profile-settings-card" variants={cardMotion}>
              <div className="security-banner">
                <span className="security-banner-title">Protected</span>
                <span className="security-banner-copy">Security hardening is in progress. Do not treat this demo build as a secure store for highly sensitive health data.</span>
              </div>
            </motion.div>

            <motion.div className="profile-ig-card-title" variants={cardMotion}>Access</motion.div>
            <motion.div className="profile-settings-card integrations-row" variants={cardMotion}>
              {deferredPrompt && !isInstalled ? (
                <button className="integration-btn primary-glow" onClick={handleInstall}>
                  Install MoodMate App
                </button>
              ) : (
                <button className="integration-btn" disabled>
                  App is Installed
                </button>
              )}
              <button className="integration-btn">Apple Health</button>
            </motion.div>

            <motion.div className="profile-ig-card-title" variants={cardMotion}>Data & Privacy</motion.div>
            <motion.div className="profile-settings-card" variants={cardMotion}>
              <div className="psc-row clickable" onClick={async () => {
                try {
                  const res = await fetch(`${API_BASE_URL}/api/user/export-data`, { credentials: 'include' });
                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `moodmate_data_${user.username}.json`;
                  a.click();
                } catch (e) {
                  alert("Failed to export data. Please try again later.");
                }
              }}>
                <span className="psc-label">Export All Data</span>
                <span className="psc-val arrow">Get JSON</span>
              </div>
              <p className="psc-privacy-note">Your export includes decrypted chat history and clinical records.</p>
            </motion.div>

            <motion.div className="profile-ig-card-title danger" variants={cardMotion}>Account Actions</motion.div>
            <motion.div className="profile-action-stack" variants={cardMotion}>
              <button className="profile-ig-logout" onClick={onLogout}>
                Sign Out
              </button>
              <button className="profile-danger-btn" onClick={async () => {
                if (window.confirm("Are you ABSOLUTELY sure? This will permanently delete your AI memory, clinical bookings, and account. This cannot be undone.")) {
                  try {
                    const res = await fetch(`${API_BASE_URL}/api/user/delete-account`, { 
                      method: 'DELETE',
                      credentials: 'include' 
                    });
                    if (res.ok) {
                      alert("Account deleted successfully.");
                      onLogout();
                    }
                  } catch (e) {
                    alert("Account deletion failed.");
                  }
                }
              }}>Delete Account Permanently</button>
            </motion.div>

            {isAdmin && (
              <>
                <motion.div className="profile-ig-card-title" variants={cardMotion}>Admin</motion.div>
                <motion.div className="profile-settings-card integrations-row" variants={cardMotion}>
                  <button className="integration-btn" onClick={() => handleTool({ id: 'adminDoctors', label: 'Provider Admin', premium: false })}>
                    Open Provider Admin
                  </button>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Profile;
