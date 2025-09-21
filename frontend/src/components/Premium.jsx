import React, { useState } from 'react';
import './Premium.css'; // Your existing CSS for the premium page

const API_BASE_URL = 'http://127.0.0.1:5000';

function Premium({ user, onUpdateUser }) {
    const [selectedPlan, setSelectedPlan] = useState('annual'); // Default to the best value plan

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

    const handleSubscribe = async () => {
        if (!selectedPlan) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/buy_premium`, {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok) {
                onUpdateUser({ is_premium: 1 });
                alert(`🎉 Welcome to MoodMate Premium! Your subscription is active.`);
            } else {
                alert("Subscription failed. Please try again.");
            }
        } catch (error) {
            alert("An error occurred during subscription.");
        }
    };

    return (
        <div className="premium-page-container">
            <div className="premium-header">
                <h2>Unlock Your Full Potential</h2>
                <p>Choose the plan that's right for your wellness journey.</p>
            </div>

            <div className="plans-container">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`plan-card ${plan.highlight ? 'highlight' : ''} ${selectedPlan === plan.id ? 'selected' : ''}`}
                        onClick={() => setSelectedPlan(plan.id)}
                    >
                        {plan.highlight && <div className="best-value-badge">BEST VALUE</div>}
                        {plan.id === 'lifetime' && <div className="lifetime-badge">🔥 LIFETIME</div>}
                        
                        <h3>{plan.name}</h3>
                        <div className="price">
                            <span className="price-amount">{plan.price}</span>
                            <span className="price-period">{plan.period}</span>
                        </div>
                        
                        {plan.savings && <div className="savings-badge">{plan.savings}</div>}
                        
                        <p className="plan-description">{plan.description}</p>
                        
                        <ul className="features-list">
                            {plan.features.map((feature, index) => (
                                <li key={index}>✓ {feature}</li>
                            ))}
                        </ul>

                        <div className="select-indicator">
                            {selectedPlan === plan.id ? '✓ Selected' : 'Select Plan'}
                        </div>
                    </div>
                ))}
            </div>

            <div className="plans-actions">
                <button
                    className="subscribe-btn"
                    disabled={!selectedPlan}
                    onClick={handleSubscribe}
                >
                    Upgrade to {selectedPlan ? plans.find(p => p.id === selectedPlan).name : 'Premium'}
                </button>
                <p className="security-note">
                    🔒 Secure payment. 7-day money-back guarantee.
                </p>
            </div>
        </div>
    );
}

export default Premium;