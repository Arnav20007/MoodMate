import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Profile.css';
import './Premium.css'; // Import Premium CSS

// Import your components
import Breathing from './BreathingExercise';
import Games from './GamesModal';
import Journal from './JournalModal';
import Sleep from './SleepCompanionModal';
import Shop from './ShopModal';
import Report from './Report';
import AICoach from './AICoach';
import Meditation from './Meditation';
import PremiumPlans from './PremiumPlans'; // Import PremiumPlans component



// ============================================================
// ZEN GARDEN (Visual Gamification)
// ============================================================
function ZenGarden({ streak }) {
    const safeStreak = streak || 0;
    const stage = safeStreak >= 21 ? 'Mature Oak' : safeStreak >= 7 ? 'Growing Sapling' : 'Planted Seed';
    const visual = safeStreak >= 21 ? '🌳' : safeStreak >= 7 ? '🌿' : '🌱';
    
    return (
        <div style={{ background: 'linear-gradient(135deg, #022c22, #064e3b)', padding: '28px', borderRadius: '24px', marginBottom: '24px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(2, 44, 34, 0.15)' }}>
            <div style={{ position: 'absolute', right: '-30px', top: '-30px', fontSize: '180px', opacity: 0.05, transform: 'rotate(15deg)' }}>{visual}</div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em' }}>Wellness Tree</h3>
                        <p style={{ margin: '4px 0 0', color: '#a7f3d0', fontSize: '14px' }}>Nurtured by your daily consistency.</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{visual}</span> {stage}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <motion.div 
                        initial={{ scale: 0.95 }} animate={{ scale: 1.05 }} 
                        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                        style={{ fontSize: '90px', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.4))', padding: '10px' }}
                    >
                        {visual}
                    </motion.div>
                    
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', fontWeight: '700', color: '#a7f3d0' }}>
                            <span>Protection Aura</span>
                            <span>{Math.min(safeStreak * 5, 100)}%</span>
                        </div>
                        <div style={{ width: '100%', height: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: '5px', overflow: 'hidden' }}>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(safeStreak * 5, 100)}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                style={{ height: '100%', background: 'linear-gradient(90deg, #34d399, #10b981)', borderRadius: '5px', boxShadow: '0 0 15px rgba(16, 185, 129, 0.6)' }}
                            />
                        </div>
                        <p style={{ margin: '14px 0 0', fontSize: '13px', color: '#6ee7b7', lineHeight: 1.5, opacity: 0.9 }}>
                            Missing a day weakens your tree's aura. Hit a 21-day streak to reach elite "Oak" validation. Building habits takes time.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// MICRO HABITS — Professional habits tracking
// ============================================================
const MICRO_HABIT_OPTIONS = [
    { id: 'hydration', emoji: '💧', label: 'Hydration Goal' },
    { id: 'stretch', emoji: '🧘', label: 'Quick Stretch' },
    { id: 'focus', emoji: '🎯', label: 'Deep Work Session' },
    { id: 'journal', emoji: '📓', label: 'Journaled Thoughts' },
    { id: 'sunlight', emoji: '☀️', label: 'Morning Sunlight' },
    { id: 'reading', emoji: '📚', label: 'Read 10 Pages' },
    { id: 'digital_detox', emoji: '📱', label: 'Digital Detox' },
    { id: 'walk', emoji: '🚶', label: '10k Steps' },
];

function MicroHabits() {
    const [tapped, setTapped] = React.useState({});
    const [celebrationMsg, setCelebrationMsg] = React.useState('');

    const handleTap = (win) => {
        if (tapped[win.id]) return;
        setTapped(prev => ({ ...prev, [win.id]: true }));
        const msgs = [
            'Consistent engagement recorded. 💙',
            `${win.label} — micro-habit logged successfully.`,
            'Foundational habits contribute to sustainable well-being. 🌱',
            'Successfully added to your daily progress record.',
        ];
        setCelebrationMsg(msgs[Math.floor(Math.random() * msgs.length)]);
        setTimeout(() => setCelebrationMsg(''), 3000);
    };

    return (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '20px 24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '22px' }}>🌱</span>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#166534' }}>Daily Micro-habits</h3>
            </div>
            <p style={{ margin: '0 0 16px', color: '#15803d', fontSize: '13px' }}>Track your foundational daily wins to build long-term resilience.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {MICRO_HABIT_OPTIONS.map(win => (
                    <button
                        key={win.id}
                        onClick={() => handleTap(win)}
                        style={{
                            padding: '10px 16px', borderRadius: '50px', border: '2px solid',
                            borderColor: tapped[win.id] ? '#16a34a' : '#86efac',
                            background: tapped[win.id] ? '#16a34a' : 'white',
                            color: tapped[win.id] ? 'white' : '#15803d',
                            fontWeight: '600', fontSize: '13px', cursor: tapped[win.id] ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            transition: 'all 0.3s ease',
                            transform: tapped[win.id] ? 'scale(1.05)' : 'scale(1)',
                        }}
                    >
                        {win.emoji} {win.label} {tapped[win.id] && '✓'}
                    </button>
                ))}
            </div>
            {celebrationMsg && (
                <div style={{ marginTop: '14px', padding: '12px 16px', background: 'white', borderRadius: '12px', color: '#166534', fontSize: '14px', fontWeight: '500', border: '1px solid #bbf7d0', animation: 'fadeIn 0.3s ease' }}>
                    {celebrationMsg}
                </div>
            )}
        </div>
    );
}

function Profile({ 
  user, 
  onUpdateUser,
  onShowSettings = () => {},
  onLogout
}) {
    const [activeSection, setActiveSection] = useState('overview');
    const [showPremiumPopup, setShowPremiumPopup] = useState(false);
    const [premiumFeature, setPremiumFeature] = useState('');

    // Dynamic XP Calculation
    const userXP = user.xp || 1250;
    const currentLevel = Math.floor(userXP / 1000) + 1;
    const xpIntoLevel = userXP % 1000;
    const levelProgress = (xpIntoLevel / 1000) * 100;

    const badges = [
        { id: 1, icon: '🔥', name: 'Hot Streak', desc: '7 days consistent', earned: user.streak >= 7 },
        { id: 2, icon: '🧘', name: 'Zen Master', desc: '10 meditation sessions', earned: true },
        { id: 3, icon: '🗣️', name: 'Open Book', desc: '50 community posts', earned: false },
        { id: 4, icon: '💎', name: 'Early Adopter', desc: 'Premium member', earned: user.is_premium },
    ];

    // Enhanced handler for tool navigation with premium check
    const handleToolNavigation = (tool, isPremium = false) => {
        if (isPremium && !user.is_premium) {
            setPremiumFeature(tool);
            setShowPremiumPopup(true);
            return;
        }
        setActiveSection(tool);
    };

    // Close premium popup
    const handleClosePremiumPopup = () => {
        setShowPremiumPopup(false);
        setPremiumFeature('');
    };

    // Handle upgrade from popup
    const handleUpgradeFromPopup = () => {
        setShowPremiumPopup(false);
        setActiveSection('premium');
    };

    // Function to render tool components with proper props
    const renderToolComponent = (tool) => {
        const commonProps = {
            user: user,
            onUpdateUser: onUpdateUser,
            onClose: () => setActiveSection('overview')
        };

        switch(tool) {
            case 'breathing':
                return <Breathing {...commonProps} />;
            case 'games':
                return <Games {...commonProps} />;
            case 'journal':
                return <Journal {...commonProps} />;
            case 'sleep':
                return <Sleep {...commonProps} />;
            case 'shop':
                return <Shop {...commonProps} />;
            case 'report':
                return <Report {...commonProps} />;
            case 'aiCoach':
                return <AICoach {...commonProps} />;
            case 'meditation':
                return <Meditation {...commonProps} />;
            default:
                return null;
        }
    };

    // Get feature name for premium popup
    const getFeatureName = (feature) => {
        const featureNames = {
            'aiCoach': 'AI Coach',
            'sleep': 'Sleep Companion',
            'report': 'Advanced Reports',
            'meditation': 'Premium Meditation'
        };
        return featureNames[feature] || 'Premium Feature';
    };

    return (
        <div className="profile-container-laptop">
            {/* Premium Feature Popup */}
            {showPremiumPopup && (
                <div className="premium-popup-overlay">
                    <div className="premium-popup-container">
                        <div className="premium-popup-header">
                            <div className="premium-popup-icon">💎</div>
                            <h3>Premium Feature</h3>
                            <button className="premium-popup-close" onClick={handleClosePremiumPopup}>×</button>
                        </div>
                        <div className="premium-popup-content">
                            <div className="premium-popup-image">
                                <div className="premium-feature-icon">
                                    {premiumFeature === 'aiCoach' && '🤖'}
                                    {premiumFeature === 'sleep' && '🌙'}
                                    {premiumFeature === 'report' && '📊'}
                                    {premiumFeature === 'meditation' && '🧘'}
                                </div>
                            </div>
                            <h2>Unlock {getFeatureName(premiumFeature)}</h2>
                            <p>Access exclusive {getFeatureName(premiumFeature).toLowerCase()} features and enhance your wellness journey with Premium membership.</p>
                            
                            <div className="premium-popup-features">
                                <div className="premium-feature-item">
                                    <span className="feature-check">✓</span>
                                    <span>Full access to {getFeatureName(premiumFeature)}</span>
                                </div>
                                <div className="premium-feature-item">
                                    <span className="feature-check">✓</span>
                                    <span>Advanced analytics and insights</span>
                                </div>
                                <div className="premium-feature-item">
                                    <span className="feature-check">✓</span>
                                    <span>Priority support</span>
                                </div>
                            </div>
                        </div>
                        <div className="premium-popup-actions">
                            <button className="premium-popup-btn secondary" onClick={handleClosePremiumPopup}>
                                Maybe Later
                            </button>
                            <button className="premium-popup-btn primary" onClick={handleUpgradeFromPopup}>
                                Upgrade Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar Navigation */}
            <div className="profile-sidebar">
                <div className="user-info-sidebar">
                    <div className="user-avatar-large">
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="user-details-sidebar">
                        <h2>{user.username}</h2>
                        <p className="user-email">{user.email}</p>
                    </div>
                    <div className="user-stats-sidebar">
                        <div className="stat-sidebar">
                            <span className="stat-icon">🔥</span>
                            <span className="stat-number">{user.streak || 0}</span>
                            <span className="stat-label">Streak</span>
                        </div>
                        <div className="stat-sidebar">
                            <span className="stat-icon">🪙</span>
                            <span className="stat-number">{user.coins || 0}</span>
                            <span className="stat-label">Coins</span>
                        </div>
                        <div className="stat-sidebar">
                            <span className="stat-icon">⭐</span>
                            <span className="stat-number">{currentLevel}</span>
                            <span className="stat-label">Level</span>
                        </div>
                    </div>

                    <div className="xp-progress-sidebar">
                        <div className="xp-text">
                            <span>Level {currentLevel}</span>
                            <span>{xpIntoLevel}/1000 XP</span>
                        </div>
                        <div className="xp-bar-container">
                            <motion.div 
                                className="xp-bar-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${levelProgress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    <div className={`premium-status-sidebar ${user.is_premium ? 'premium' : 'basic'}`}>
                        {user.is_premium ? '🌟 Premium Member' : '💎 Unlock Premium'}
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <button 
                        className={activeSection === 'overview' ? 'sidebar-nav-btn active' : 'sidebar-nav-btn'} 
                        onClick={() => setActiveSection('overview')}
                    >
                        <span className="nav-icon">📊</span>
                        <span className="nav-text">Overview</span>
                    </button>
                    <button 
                        className={activeSection === 'tools' ? 'sidebar-nav-btn active' : 'sidebar-nav-btn'} 
                        onClick={() => setActiveSection('tools')}
                    >
                        <span className="nav-icon">🛠️</span>
                        <span className="nav-text">Wellness Hub</span>
                    </button>
                    <button 
                         className={activeSection === 'inventory' ? 'sidebar-nav-btn active' : 'sidebar-nav-btn'} 
                         onClick={() => setActiveSection('inventory')}
                    >
                        <span className="nav-icon">🎒</span>
                        <span className="nav-text">Inventory</span>
                    </button>
                    <button 
                        className={activeSection === 'premium' ? 'sidebar-nav-btn active' : 'sidebar-nav-btn'} 
                        onClick={() => setActiveSection('premium')}
                    >
                        <span className="nav-icon">💎</span>
                        <span className="nav-text">Premium</span>
                    </button>
                </nav>

                <div className="sidebar-bottom-nav">
                    <button className="sidebar-bottom-btn" onClick={() => setActiveSection('settings')}>
                        <span className="bottom-nav-icon">⚙️</span>
                        <span className="bottom-nav-text">Settings</span>
                    </button>
                    <button className="sidebar-bottom-btn" onClick={onLogout}>
                        <span className="bottom-nav-icon">🚪</span>
                        <span className="bottom-nav-text">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area with Scroll */}
            <div className="profile-main-content">
                {activeSection === 'overview' && (
                    <div className="content-section">
                        <h1>Dashboard Overview</h1>

                        <ZenGarden streak={user.streak} />

                        {/* MINI FEATURES BATCH 1: Profile Dashboard Utilities */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                            {/* Mini Feature 4: Neural Weather */}
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Neural Forecast</div>
                                <div style={{ fontSize: '24px', marginBottom: '4px' }}>⛅</div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>Partly Cloudy</div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Expect high focus by 2 PM.</div>
                            </div>

                            {/* Mini Feature 5: Hydration Tracker */}
                            <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '16px', border: '1px solid #bae6fd' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#0369a1', textTransform: 'uppercase' }}>Hydration</div>
                                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#0284c7' }}>4/8</div>
                                </div>
                                <div style={{ display: 'flex', gap: '4px', cursor: 'pointer' }} onClick={(e) => { e.currentTarget.children[4].style.opacity = '1'; alert('Water logged! 💧'); }}>
                                    <span style={{ fontSize: '18px', opacity: 1 }}>💧</span>
                                    <span style={{ fontSize: '18px', opacity: 1 }}>💧</span>
                                    <span style={{ fontSize: '18px', opacity: 1 }}>💧</span>
                                    <span style={{ fontSize: '18px', opacity: 1 }}>💧</span>
                                    <span style={{ fontSize: '18px', opacity: 0.3, transition: '0.2s' }}>💧</span>
                                    <span style={{ fontSize: '18px', opacity: 0.3 }}>💧</span>
                                </div>
                            </div>

                            {/* Mini Feature 6: Consistency Heatmap (GitHub Style) */}
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>Consistency</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                                    {Array(14).fill(0).map((_, i) => (
                                        <div key={i} style={{ width: '100%', aspectRatio: '1', borderRadius: '4px', background: Math.random() > 0.4 ? '#10b981' : '#e2e8f0', opacity: Math.random() > 0.4 ? (0.4 + Math.random()*0.6) : 1 }}></div>
                                    ))}
                                </div>
                            </div>

                            {/* Mini Feature 7: Digital Detox Screen Time */}
                            <div style={{ background: '#fdf4ff', padding: '16px', borderRadius: '16px', border: '1px solid #f5d0fe' }}>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: '#a21caf', textTransform: 'uppercase', marginBottom: '8px' }}>Digital Detox</div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <span style={{ fontSize: '24px', fontWeight: '800', color: '#701a75' }}>-14%</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#86198f', marginTop: '4px' }}>Screen time compared to yesterday.</div>
                            </div>

                            {/* Mini Feature 8: Sleep Debt Micro-Calc */}
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Sleep Debt</div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <span style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>1.2</span>
                                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>hrs</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Target tonight: <b style={{color: '#6366f1'}}>10:15 PM</b></div>
                            </div>
                        </div>
                        
                        {/* THE RETENTION ENGINE - MOOD CHALLENGES */}
                        <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '25px', borderRadius: '24px', marginBottom: '30px', color: 'white', border: '1px solid #334155' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>⚡ Daily Wellness Protocols</h2>
                                    <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>Maintain adherence to key functional goals for sustained mental resilience.</p>
                                </div>
                                <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', padding: '8px 16px', borderRadius: '12px', fontWeight: '800' }}>
                                    {user.streak || 0} Day Streak ⚡
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {/* Quest 1 */}
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ fontSize: '24px', width: '50px', height: '50px', background: '#334155', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📱</div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: 'white' }}>Minimalist Protocol</h4>
                                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>Reduce social media usage by 2 hours today.</p>
                                        <div style={{ width: '100%', height: '6px', background: '#334155', borderRadius: '3px', marginTop: '10px' }}><div style={{ width: '60%', height: '100%', background: '#10b981', borderRadius: '3px' }}></div></div>
                                    </div>
                                    <button style={{ padding: '8px 16px', borderRadius: '10px', background: '#e2e8f0', color: '#475569', fontWeight: 'bold', border: 'none' }}>1 / 2 Hrs</button>
                                </div>

                                {/* Quest 2 */}
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ fontSize: '24px', width: '50px', height: '50px', background: '#334155', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✍️</div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: 'white' }}>Emotional Anchor</h4>
                                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>Write 3 lines of gratitude in your journal.</p>
                                        <div style={{ width: '100%', height: '6px', background: '#334155', borderRadius: '3px', marginTop: '10px' }}></div>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            const rewards = ['🎁 Rare Badge Unlocked!', '🪙 Mystery Drop: +50 Coins!', '✨ Epic Drop: +100 XP!', '🔮 Secret Token Found!'];
                                            e.target.innerText = rewards[Math.floor(Math.random()*rewards.length)];
                                            e.target.style.background = 'linear-gradient(90deg, #f43f5e, #8b5cf6)';
                                            e.target.innerText = 'Task Confirmed';
                                            e.target.style.background = '#10b981';
                                            e.target.style.transform = 'scale(1.05)';
                                            e.target.disabled = true;
                                        }}
                                        style={{ padding: '10px 20px', borderRadius: '10px', background: '#6366f1', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}
                                    >
                                        Confirm Completion
                                    </button>
                                </div>

                                {/* Epic Quest */}
                                <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ fontSize: '24px', width: '50px', height: '50px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏔️</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: 'white' }}>21-Day Focused Protocol</h4>
                                            <span style={{ fontSize: '12px', background: '#6366f1', color: 'white', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>Core Objective</span>
                                        </div>
                                        <p style={{ margin: 0, color: '#e2e8f0', fontSize: '13px' }}>Uninterrupted adherence to established wellness modules for 21 days.</p>
                                        <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '3px', marginTop: '10px' }}><div style={{ width: '33%', height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '3px', boxShadow: '0 0 8px rgba(99,102,241,0.6)' }}></div></div>
                                    </div>
                                    <button style={{ padding: '8px 16px', borderRadius: '10px', background: 'transparent', border: '2px solid #6366f1', color: '#6366f1', fontWeight: 'bold' }}>Day 7 / 21</button>
                                </div>
                            </div>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">📅</div>
                                <div className="stat-content">
                                    <h3>Member Since</h3>
                                    <p>{new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">💬</div>
                                <div className="stat-content">
                                    <h3>Chat Sessions</h3>
                                    <p>{user.chatSessions || 0} completed</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📝</div>
                                <div className="stat-content">
                                    <h3>Journal Entries</h3>
                                    <p>{user.journalEntries || 0} entries</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🎯</div>
                                <div className="stat-content">
                                    <h3>Goals Achieved</h3>
                                    <p>{user.goalsAchieved || 0} of {user.totalGoals || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="quick-actions">
                            <h2>Elite Achievements</h2>
                            <div className="badges-row">
                                {badges.map(badge => (
                                    <div key={badge.id} className={`badge-pill ${badge.earned ? 'earned' : 'locked'}`}>
                                        <span className="badge-icon">{badge.earned ? badge.icon : '🔒'}</span>
                                        <div className="badge-info">
                                            <span className="badge-name">{badge.name}</span>
                                            <span className="badge-desc">{badge.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="quick-actions" style={{ marginTop: '30px' }}>
                            <h2>Active Engagement Tools</h2>
                            <div className="actions-grid">
                                <button className="action-btn" onClick={() => handleToolNavigation('report', true)}>
                                    <span className="action-icon">📊</span>
                                    <span>Reports</span>
                                </button>
                                <button className="action-btn" onClick={() => handleToolNavigation('aiCoach', true)}>
                                    <span className="action-icon">🤖</span>
                                    <span>AI Coach</span>
                                </button>
                                <button className="action-btn" onClick={() => handleToolNavigation('games')}>
                                    <span className="action-icon">🎮</span>
                                    <span>Arcade</span>
                                </button>
                                <button className="action-btn" onClick={() => handleToolNavigation('shop')}>
                                    <span className="action-icon">🛒</span>
                                    <span>Shop</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'tools' && (
                    <div className="content-section">
                        <h1>Wellness Tools</h1>
                        <p className="section-description">Access tools to support your mental wellness journey</p>
                        
                        <div className="tools-grid">
                            <div className="tool-card" onClick={() => handleToolNavigation('breathing')}>
                                <div className="tool-icon">🌬️</div>
                                <div className="tool-content">
                                    <h3>Breathing Exercises</h3>
                                    <p>Calm your mind with guided techniques</p>
                                </div>
                                <div className="tool-badge free">Free</div>
                            </div>
                            
                            <div className="tool-card" onClick={() => handleToolNavigation('games')}>
                                <div className="tool-icon">🎮</div>
                                <div className="tool-content">
                                    <h3>Mindful Games</h3>
                                    <p>Relaxing games for stress relief</p>
                                </div>
                                <div className="tool-badge free">Free</div>
                            </div>
                            
                            <div className="tool-card" onClick={() => handleToolNavigation('aiCoach', true)}>
                                <div className="tool-icon">🤖</div>
                                <div className="tool-content">
                                    <h3>AI Coach</h3>
                                    <p>Personalized wellness guidance</p>
                                </div>
                                <div className="tool-badge premium">{user.is_premium ? 'Active' : 'Premium'}</div>
                            </div>
                            
                            <div className="tool-card" onClick={() => handleToolNavigation('sleep', true)}>
                                <div className="tool-icon">🌙</div>
                                <div className="tool-content">
                                    <h3>Sleep Companion</h3>
                                    <p>Tools for better sleep hygiene</p>
                                </div>
                                <div className="tool-badge premium">{user.is_premium ? 'Active' : 'Premium'}</div>
                            </div>
                            
                            <div className="tool-card" onClick={() => handleToolNavigation('report', true)}>
                                <div className="tool-icon">📊</div>
                                <div className="tool-content">
                                    <h3>Mood Reports</h3>
                                    <p>Track emotional patterns</p>
                                </div>
                                <div className="tool-badge">{user.is_premium ? 'Advanced' : 'Basic'}</div>
                            </div>
                            
                            <div className="tool-card" onClick={() => handleToolNavigation('shop')}>
                                <div className="tool-icon">🛒</div>
                                <div className="tool-content">
                                    <h3>Shop</h3>
                                    <p>Purchase themes, avatars, and more</p>
                                </div>
                                <div className="tool-badge free">Free</div>
                            </div>
                            
                            <div className="tool-card" onClick={() => handleToolNavigation('meditation', true)}>
                                <div className="tool-icon">🧘</div>
                                <div className="tool-content">
                                    <h3>Meditation</h3>
                                    <p>Guided meditation sessions</p>
                                </div>
                                <div className="tool-badge premium">{user.is_premium ? 'Active' : 'Premium'}</div>
                            </div>
                            
                            <div className="tool-card" onClick={() => handleToolNavigation('journal')}>
                                <div className="tool-icon">📔</div>
                                <div className="tool-content">
                                    <h3>Journal</h3>
                                    <p>Record your thoughts and feelings</p>
                                </div>
                                <div className="tool-badge free">Free</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'premium' && (
                    <div className="content-section">
                        <PremiumPlans 
                            user={user}
                            onUpdateUser={onUpdateUser}
                            onClose={() => setActiveSection('overview')}
                        />
                    </div>
                )}

                {activeSection === 'inventory' && (
                    <div className="content-section">
                        <h1>Your Collection</h1>
                        <p>Items purchased from the shop that you can equip or use.</p>
                        
                        <div className="inventory-grid">
                            {!user.purchasedItems || user.purchasedItems.length === 0 ? (
                                <div className="empty-inventory">
                                    <p>Your inventory is empty. Visit the shop to collect themes and items!</p>
                                    <button className="action-btn" onClick={() => setActiveSection('shop')}>Go to Shop</button>
                                </div>
                            ) : (
                                user.purchasedItems.map(itemId => (
                                    <div key={itemId} className="inventory-item">
                                        <span className="item-icon">📦</span>
                                        <h4>Item #{itemId}</h4>
                                        <button className="equip-btn">Equip Now</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeSection === 'settings' && (
                    <div className="content-section">
                        <h1>Account Settings</h1>
                        <p style={{ color: '#64748b', marginBottom: '30px' }}>Manage your preferences and account security.</p>
                        
                        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                👤 Personal Information
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>Username</label>
                                    <input type="text" value={user.username || ''} readOnly style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>Email</label>
                                    <input type="email" value={user.email || ''} readOnly style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569' }} />
                                </div>
                            </div>

                            <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                🛡️ Security & Privacy
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: '600', fontSize: '14px' }}>Biometric App Lock</span>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>Require FaceID or Fingerprint to open MoodMate</span>
                                    </div>
                                    <label className="switch">
                                      <input type="checkbox" defaultChecked />
                                      <span className="slider round"></span>
                                    </label>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: '600', fontSize: '14px' }}>End-to-End Encryption</span>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>Encrypt all journal entries and chat sessions</span>
                                    </div>
                                    <label className="switch">
                                      <input type="checkbox" defaultChecked readOnly />
                                      <span className="slider round" style={{ opacity: 0.6 }}></span>
                                    </label>
                                </div>
                                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '20px' }}>🔒</span>
                                    <span style={{ fontSize: '13px', color: '#166534', fontWeight: '500' }}>Your data is encrypted using military-grade AES-256 protocols.</span>
                                </div>
                            </div>

                            <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                ⌚ Wearables & Integrations
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                                <button style={{ padding: '12px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600', color: '#334155' }}>
                                    <span style={{ fontSize: '18px' }}>🍎</span> Connect Apple Health
                                </button>
                                <button style={{ padding: '12px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600', color: '#334155' }}>
                                    <span style={{ fontSize: '18px' }}>🤖</span> Connect Google Fit
                                </button>
                            </div>

                            <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                🔔 App Preferences
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '500', fontSize: '14px' }}>Push Notifications</span>
                                    <label className="switch">
                                      <input type="checkbox" defaultChecked />
                                      <span className="slider round"></span>
                                    </label>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '500', fontSize: '14px' }}>Daily Check-in Reminder</span>
                                    <label className="switch">
                                      <input type="checkbox" defaultChecked />
                                      <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                            
                            <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginTop: '20px', marginBottom: '20px', color: '#64748b' }}>🛑 Account Management</h3>
                            <button style={{ padding: '10px 20px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Deactivate Account</button>
                        </div>
                    </div>
                )}

                {/* Render Tool Components */}
                {['breathing', 'games', 'journal', 'sleep', 'shop', 'report', 'aiCoach', 'meditation'].includes(activeSection) && 
                    renderToolComponent(activeSection)
                }
            </div>
        </div>
    );
}

export default Profile;