import React, { useState } from 'react';
import './PremiumPlans.css'; // Your existing CSS file will work perfectly

// Base URL for API calls
const API_BASE_URL = 'http://127.0.0.1:5000';

const PremiumPlans = ({ user, onSubscribe, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState('annual'); // Default to the best value plan

  // ✅ The complete 6-plan structure
  const plans = [
    {
      id: 'weekly',
      name: 'Starter Pass',
      price: '₹99',
      period: '/week',
      description: 'A low-risk trial of all premium features.',
      features: [
        'Full access for 7 days',
        'Mindful Games',
        'AI Coach',
        'Sleep Stories & Reports'
      ],
      highlight: false,
    },
    {
      id: 'monthly',
      name: 'Monthly Plus',
      price: '₹299',
      period: '/month',
      description: 'Full access with monthly flexibility.',
      features: [
        'Everything in Starter',
        'Unlimited AI Chats',
        'Priority Support',
        'Cancel Anytime'
      ],
      highlight: false,
    },
    {
      id: 'quarterly', // The missing plan
      name: 'Quarterly Pro',
      price: '₹749',
      period: '/3 months',
      description: 'A balanced option for committed users.',
      features: [
        'Everything in Monthly Plus',
        'Save over 15%',
        'Extended feature trials',
      ],
      highlight: false,
      savings: 'Save 16%',
    },
    {
      id: 'annual',
      name: 'Annual Premium',
      price: '₹1,999',
      period: '/year',
      description: 'Our best value for dedicated users.',
      features: [
        'Everything in Quarterly Pro',
        'Exclusive Themes & Avatars',
        'Early Access to New Features',
        'One-on-One Onboarding Call'
      ],
      highlight: true, // This will make it stand out
      savings: 'Save 44%',
    },
    {
      id: 'student',
      name: 'Student Annual',
      price: '₹999',
      period: '/year',
      description: 'Accessible wellness for students.',
      features: [
        'All Annual Premium features',
        'Requires Student Verification',
        'Special Student Badge'
      ],
      highlight: false,
      savings: '50% Off'
    },
    {
      id: 'lifetime',
      name: 'Elite Lifetime',
      price: '₹4,999',
      period: 'one-time',
      description: 'The ultimate plan. Pay once, own forever.',
      features: [
        'Everything in Annual Premium',
        'Lifetime Access & Updates',
        'Exclusive Founder Badge',
        'Direct Line to Feedback Team'
      ],
      highlight: false,
    }
  ];

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      alert("Please select a plan first.");
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/buy_premium/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          plan: selectedPlan
        })
      });

      if (response.ok) {
        onSubscribe(selectedPlan);
        onClose();
      } else {
        const result = await response.json();
        alert(`Subscription failed: ${result.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="premium-modal-overlay" onClick={onClose}>
      <div className="premium-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>×</button>
        
        <div className="modal-header">
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

        <div className="faq-section">
          <h4>Frequently Asked Questions</h4>
          <div className="faq-item">
            <h5>Can I cancel anytime?</h5>
            <p>Yes, you can cancel your subscription anytime from your profile settings. You'll maintain access until the end of your billing period.</p>
          </div>
          <div className="faq-item">
            <h5>Do you offer refunds?</h5>
            <p>We offer a 7-day money-back guarantee for all new subscriptions. If you're not satisfied, just let us know.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPlans;