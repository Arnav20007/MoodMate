import React, { useState } from 'react';
import './Profile.css';

// REPLACE THESE IMPORTS WITH YOUR ACTUAL COMPONENTS:
// import Breathing from './Breathing';
// import Games from './Games';
// import Journal from './Journal';
// import Sleep from './Sleep';
// import Shop from './Shop';
// import Report from './Report';
// import AICoach from './AICoach';
// import Meditation from './Meditation';
 
import Breathing from './BreathingExercise';
import Games from './GamesModal';
import Journal from './JournalModal';
import Sleep from './SleepCompanionModal';
import Shop from './ShopModal';
import Report from './Report';
import AICoach from './AICoach';
import Meditation from './Meditation';

function Profile({ 
  user, 
  onUpdateUser, 
  onShowSettings,
  onLogout
}) {
    const [activeSection, setActiveSection] = useState('overview');
    const [selectedPlan, setSelectedPlan] = useState(null);

    // ✅ The complete 6-plan structure
    const plans = [
        { 
            id: 'weekly', 
            name: 'Starter Pass', 
            price: '₹99', 
            period: '/week', 
            description: 'A low-risk trial of all premium features.', 
            features: ['Full access for 7 days', 'Mindful Games', 'AI Coach'], 
            highlight: false 
        },
        { 
            id: 'monthly', 
            name: 'Monthly Plus', 
            price: '₹299', 
            period: '/month', 
            description: 'Full access with monthly flexibility.', 
            features: ['Everything in Starter', 'Cancel Anytime', 'Priority Support'], 
            highlight: false 
        },
        { 
            id: 'quarterly',
            name: 'Quarterly Pro',
            price: '₹749',
            period: '/3 months',
            description: 'A balanced option for committed users.',
            features: ['Everything in Monthly', 'Save over 15%', 'Extended feature trials'],
            highlight: false,
            savings: 'Save 16%'
        },
        { 
            id: 'annual', 
            name: 'Annual Premium', 
            price: '₹1,999', 
            period: '/year', 
            description: 'Our best value for dedicated users.', 
            features: ['Everything in Quarterly', 'Exclusive Themes & Avatars', 'Early Access'], 
            highlight: true, 
            savings: 'Save 44%' 
        },
        { 
            id: 'student', 
            name: 'Student Annual', 
            price: '₹999', 
            period: '/year', 
            description: 'Accessible wellness for students.', 
            features: ['All Annual Premium features', 'Requires Student Verification'], 
            highlight: false, 
            savings: '50% Off' 
        },
        { 
            id: 'lifetime', 
            name: 'Elite Lifetime', 
            price: '₹4,999', 
            period: 'one-time', 
            description: 'Pay once, own forever.', 
            features: ['Everything in Annual', 'Exclusive Founder Badge'], 
            highlight: false 
        },
    ];

    const handleSubscribe = async (planId) => {
        try {
            // In a real app, you would call your API here
            console.log(`Subscribing to plan: ${planId}`);
            onUpdateUser({ ...user, plan: planId, is_premium: 1 });
            alert(`🎉 Welcome to ${plans.find(p => p.id === planId).name}!`);
        } catch (error) {
            alert("Subscription failed. Please try again.");
        }
    };

    return (
        <div className="profile-container-laptop">
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
                                    <p>{new Date().toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">💬</div>
                                <div className="stat-content">
                                    <h3>Chat Sessions</h3>
                                    <p>47 completed</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📝</div>
                                <div className="stat-content">
                                    <h3>Journal Entries</h3>
                                    <p>12 entries</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🎯</div>
                                <div className="stat-content">
                                    <h3>Goals Achieved</h3>
                                    <p>8 of 12</p>
                                </div>
                            </div>
                        </div>

                        <div className="quick-actions">
                            <h2>Quick Actions</h2>
                            <div className="actions-grid">
                                <button className="action-btn" onClick={() => setActiveSection('report')}>
                                    <span className="action-icon">📊</span>
                                    <span>Reports</span>
                                </button>
                                <button className="action-btn" onClick={() => setActiveSection('aiCoach')}>
                                    <span className="action-icon">🤖</span>
                                    <span>AI Coach</span>
                                </button>
                                <button className="action-btn" onClick={() => setActiveSection('games')}>
                                    <span className="action-icon">🎮</span>
                                    <span>Games</span>
                                </button>
                                <button className="action-btn" onClick={() => setActiveSection('breathing')}>
                                    <span className="action-icon">🌬️</span>
                                    <span>Breathe</span>
                                </button>
                                <button className="action-btn" onClick={() => setActiveSection('shop')}>
                                    <span className="action-icon">🛒</span>
                                    <span>Shop</span>
                                </button>
                                <button className="action-btn" onClick={() => setActiveSection('meditation')}>
                                    <span className="action-icon">🧘</span>
                                    <span>Meditation</span>
                                </button>
                                <button className="action-btn" onClick={() => setActiveSection('sleep')}>
                                    <span className="action-icon">🌙</span>
                                    <span>Sleep</span>
                                </button>
                                <button className="action-btn" onClick={() => setActiveSection('journal')}>
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
                            <div className="tool-card" onClick={() => setActiveSection('breathing')}>
                                <div className="tool-icon">🌬️</div>
                                <div className="tool-content">
                                    <h3>Breathing Exercises</h3>
                                    <p>Calm your mind with guided techniques</p>
                                </div>
                                <div className="tool-badge free">Free</div>
                            </div>
                            
                            <div className="tool-card" onClick={() => setActiveSection('games')}>
                                <div className="tool-icon">🎮</div>
                                <div className="tool-content">
                                    <h3>Mindful Games</h3>
                                    <p>Relaxing games for stress relief</p>
                                </div>
                                <div className="tool-badge free">Free</div>
                            </div>
                            
                            <div className="tool-card" onClick={() => setActiveSection('aiCoach')}>
                                <div className="tool-icon">🤖</div>
                                <div className="tool-content">
                                    <h3>AI Coach</h3>
                                    <p>Personalized wellness guidance</p>
                                </div>
                                <div className="tool-badge premium">{user.is_premium ? 'Active' : 'Premium'}</div>
                            </div>
                            
                            <div className="tool-card" onClick={() => setActiveSection('sleep')}>
                                <div className="tool-icon">🌙</div>
                                <div className="tool-content">
                                    <h3>Sleep Companion</h3>
                                    <p>Tools for better sleep hygiene</p>
                                </div>
                                <div className="tool-badge premium">{user.is_premium ? 'Active' : 'Premium'}</div>
                            </div>
                            
                            <div className="tool-card" onClick={() => setActiveSection('report')}>
                                <div className="tool-icon">📊</div>
                                <div className="tool-content">
                                    <h3>Mood Reports</h3>
                                    <p>Track emotional patterns</p>
                                </div>
                                <div className="tool-badge">{user.is_premium ? 'Advanced' : 'Basic'}</div>
                            </div>
                            
                            <div className="tool-card" onClick={() => setActiveSection('shop')}>
                                <div className="tool-icon">🛒</div>
                                <div className="tool-content">
                                    <h3>Shop</h3>
                                    <p>Purchase themes, avatars, and more</p>
                                </div>
                                <div className="tool-badge free">Free</div>
                            </div>
                            
                            <div className="tool-card" onClick={() => setActiveSection('meditation')}>
                                <div className="tool-icon">🧘</div>
                                <div className="tool-content">
                                    <h3>Meditation</h3>
                                    <p>Guided meditation sessions</p>
                                </div>
                                <div className="tool-badge free">Free</div>
                            </div>
                            
                            <div className="tool-card" onClick={() => setActiveSection('journal')}>
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
                        {user.is_premium ? (
                            <div className="premium-active">
                                <div className="premium-header">
                                    <div className="premium-icon">🌟</div>
                                    <h2>Premium Membership Active</h2>
                                </div>
                                <p className="premium-description">You're enjoying all exclusive features</p>
                                
                                <div className="premium-benefits">
                                    <div className="benefit">
                                        <span className="benefit-icon">✅</span>
                                        <div>
                                            <h4>Unlimited AI Coach</h4>
                                            <p>24/7 access to personalized guidance</p>
                                        </div>
                                    </div>
                                    <div className="benefit">
                                        <span className="benefit-icon">✅</span>
                                        <div>
                                            <h4>Advanced Analytics</h4>
                                            <p>Detailed mood insights and patterns</p>
                                        </div>
                                    </div>
                                    <div className="benefit">
                                        <span className="benefit-icon">✅</span>
                                        <div>
                                            <h4>Premium Content</h4>
                                            <p>Exclusive meditation and sleep content</p>
                                        </div>
                                    </div>
                                    <div className="benefit">
                                        <span className="benefit-icon">✅</span>
                                        <div>
                                            <h4>Ad-Free Experience</h4>
                                            <p>No interruptions in your journey</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="premium-upgrade">
                                <div className="upgrade-header">
                                    <div className="upgrade-icon">💎</div>
                                    <h2>Upgrade to Premium</h2>
                                </div>
                                <p className="upgrade-description">Unlock the full potential of your wellness journey</p>
                                
                                <div className="pricing-cards">
                                    {plans.map((plan) => (
                                        <div key={plan.id} className={`pricing-card ${plan.highlight ? 'recommended' : ''}`}>
                                            {plan.highlight && <div className="recommended-badge">BEST VALUE</div>}
                                            <h3>{plan.name}</h3>
                                            <div className="price">{plan.price}<span>{plan.period}</span></div>
                                            {plan.savings && <div className="savings">{plan.savings}</div>}
                                            <p>{plan.description}</p>
                                            <ul>
                                                {plan.features.map((feature, idx) => (
                                                    <li key={idx}>✓ {feature}</li>
                                                ))}
                                            </ul>
                                            <button 
                                                className={`upgrade-btn ${plan.highlight ? 'primary' : ''}`}
                                                onClick={() => handleSubscribe(plan.id)}
                                            >
                                                Choose Plan
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="feature-comparison">
                                    <h3>What's Included in Premium</h3>
                                    <div className="features-grid">
                                        <div className="feature-item">
                                            <span>🤖</span>
                                            <span>Unlimited AI Coach Access</span>
                                        </div>
                                        <div className="feature-item">
                                            <span>📊</span>
                                            <span>Advanced Analytics & Reports</span>
                                        </div>
                                        <div className="feature-item">
                                            <span>🎵</span>
                                            <span>Premium Meditation Content</span>
                                        </div>
                                        <div className="feature-item">
                                            <span>🌙</span>
                                            <span>Sleep Stories & Companion</span>
                                        </div>
                                        <div className="feature-item">
                                            <span>🚫</span>
                                            <span>Ad-Free Experience</span>
                                        </div>
                                        <div className="feature-item">
                                            <span>💬</span>
                                            <span>Priority Support</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tool Components */}
                {activeSection === 'breathing' && <Breathing />}
                {activeSection === 'games' && <Games />}
                {activeSection === 'journal' && <Journal />}
                {activeSection === 'sleep' && <Sleep />}
                {activeSection === 'shop' && <Shop />}
                {activeSection === 'report' && <Report />}
                {activeSection === 'aiCoach' && <AICoach />}
                {activeSection === 'meditation' && <Meditation />}
            </div>
        </div>
    );
}

export default Profile;