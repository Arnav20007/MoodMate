import React, { useState } from 'react';
import './PremiumPlans.css'; 
import { API_BASE_URL } from '../api';

const PremiumPlans = ({ user, onSubscribe, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');

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
      id: 'quarterly',
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
      highlight: true,
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
      const response = await fetch(`${API_BASE_URL}/api/user/buy-premium`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          plan: selectedPlan
        })
      });

      if (response.ok) {
        onSubscribe(selectedPlan);
        onClose();
        
        const t = document.createElement('div');
        t.innerHTML = `<span>✨ Welcome to Premium! All features unlocked.</span><button style="background:transparent;border:none;color:white;cursor:pointer;font-weight:bold;margin-left:12px;opacity:0.8;font-size:16px;">✕</button>`;
        t.style.cssText = 'display:flex;align-items:center;position:fixed;top:24px;left:50%;transform:translateX(-50%);background:#10b981;color:white;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:600;z-index:9999;font-family:Inter,sans-serif;box-shadow:0 10px 25px rgba(16,185,129,0.3)';
        t.querySelector('button').onclick = () => { if (document.body.contains(t)) t.remove(); };
        document.body.appendChild(t); 
        setTimeout(() => { if (document.body.contains(t)) t.remove(); }, 3000);
      } else {
        const result = await response.json();
        alert(`Subscription failed: ${result.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const applyPromoCode = () => {
    if (['BETA100', 'FREEPREMIUM', 'MOODMATEVIP'].includes(promoCode.toUpperCase().trim())) {
       setPromoMessage('✅ Promo Code Applied! 100% Off.');
       setTimeout(() => {
           onSubscribe('lifetime');
           onClose();
       }, 1000);
    } else {
       setPromoMessage('❌ Invalid Promo Code');
    }
  };

  return (
    <div className="premium-modal-overlay" onClick={onClose}>
      <div className="premium-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>×</button>
        
        {user?.is_premium ? (
          <div className="already-premium-state" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✨</div>
            <h2 style={{ fontSize: '28px', color: 'white', marginBottom: '12px' }}>You are a Premium Member</h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
              Your account is fully upgraded with lifetime access to all Elite features, AI conversations, and advanced analytics. Thank you for your support!
            </p>
            <button 
              onClick={onClose}
              style={{ background: '#10b981', color: 'white', border: 'none', padding: '14px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
            >
              Continue using MoodMate
            </button>
          </div>
        ) : (
          <>
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
              <div className="promo-code-section" style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      value={promoCode} 
                      onChange={(e) => setPromoCode(e.target.value)} 
                      placeholder="Have a Promo Code?" 
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
                    />
                    <button onClick={applyPromoCode} style={{ padding: '10px 16px', borderRadius: '8px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Apply</button>
                </div>
                {promoMessage && <span style={{ fontSize: '13px', color: promoMessage.includes('✅') ? '#10b981' : '#f43f5e' }}>{promoMessage}</span>}
              </div>
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
          </>
        )}
      </div>
    </div>
  );
};

export default PremiumPlans;
