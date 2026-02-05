import React, { useState } from 'react';
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

function Profile({ 
  user, 
  onUpdateUser, 
  onShowSettings,
  onLogout
}) {
    const [activeSection, setActiveSection] = useState('overview');
    const [showPremiumPopup, setShowPremiumPopup] = useState(false);
    const [premiumFeature, setPremiumFeature] = useState('');

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
                            <span className="stat-label">Day Streak</span>
                        </div>
                        <div className="stat-sidebar">
                            <span className="stat-icon">🪙</span>
                            <span className="stat-number">{user.coins || 0}</span>
                            <span className="stat-label">Coins</span>
                        </div>
                        <div className={`premium-status-sidebar ${user.is_premium ? 'premium' : 'basic'}`}>
                            {user.is_premium ? '🌟 Premium' : '💎 Basic'}
                        </div>
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
                        <span className="nav-text">Tools</span>
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
                    <button className="sidebar-bottom-btn" onClick={onShowSettings}>
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
                                    <p>{user.chatSessions || 47} completed</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📝</div>
                                <div className="stat-content">
                                    <h3>Journal Entries</h3>
                                    <p>{user.journalEntries || 12} entries</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🎯</div>
                                <div className="stat-content">
                                    <h3>Goals Achieved</h3>
                                    <p>{user.goalsAchieved || 8} of {user.totalGoals || 12}</p>
                                </div>
                            </div>
                        </div>

                        <div className="quick-actions">
                            <h2>Quick Actions</h2>
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
                                    <span>Games</span>
                                </button>
                                <button className="action-btn" onClick={() => handleToolNavigation('breathing')}>
                                    <span className="action-icon">🌬️</span>
                                    <span>Breathe</span>
                                </button>
                                <button className="action-btn" onClick={() => handleToolNavigation('shop')}>
                                    <span className="action-icon">🛒</span>
                                    <span>Shop</span>
                                </button>
                                <button className="action-btn" onClick={() => handleToolNavigation('meditation', true)}>
                                    <span className="action-icon">🧘</span>
                                    <span>Meditation</span>
                                </button>
                                <button className="action-btn" onClick={() => handleToolNavigation('sleep', true)}>
                                    <span className="action-icon">🌙</span>
                                    <span>Sleep</span>
                                </button>
                                <button className="action-btn" onClick={() => handleToolNavigation('journal')}>
                                    <span className="action-icon">📔</span>
                                    <span>Journal</span>
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

                {/* Render Tool Components */}
                {['breathing', 'games', 'journal', 'sleep', 'shop', 'report', 'aiCoach', 'meditation'].includes(activeSection) && 
                    renderToolComponent(activeSection)
                }
            </div>
        </div>
    );
}

export default Profile;