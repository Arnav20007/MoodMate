import React, { useState } from 'react';
import './Premium.css';
import { API_BASE_URL } from '../api';

function Premium({ user, onUpdateUser }) {
  const [selectedPlan, setSelectedPlan] = useState('annual');

  const plans = [
    { id: 'weekly', name: 'Starter Pass', price: 'Rs 99', period: '/week', description: 'A low-risk trial of all premium features.', features: ['Full access for 7 days', 'Mindful Games', 'AI Coach'], highlight: false },
    { id: 'monthly', name: 'Monthly Plus', price: 'Rs 299', period: '/month', description: 'Full access with monthly flexibility.', features: ['Everything in Starter', 'Cancel anytime', 'Priority support'], highlight: false },
    { id: 'quarterly', name: 'Quarterly Pro', price: 'Rs 749', period: '/3 months', description: 'A balanced option for committed users.', features: ['Everything in Monthly', 'Save over 15%', 'Extended feature trials'], highlight: false, savings: 'Save 16%' },
    { id: 'annual', name: 'Annual Premium', price: 'Rs 1,999', period: '/year', description: 'Our best value for dedicated users.', features: ['Everything in Quarterly', 'Exclusive themes and avatars', 'Early access'], highlight: true, savings: 'Save 44%' },
    { id: 'student', name: 'Student Annual', price: 'Rs 999', period: '/year', description: 'Accessible wellness for students.', features: ['All Annual Premium features', 'Requires student verification'], highlight: false, savings: '50% Off' },
    { id: 'lifetime', name: 'Elite Lifetime', price: 'Rs 4,999', period: 'one-time', description: 'Pay once, own forever.', features: ['Everything in Annual', 'Exclusive founder badge'], highlight: false },
  ];

  const handleSubscribe = async () => {
    if (!selectedPlan || !user?.id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/buy_premium/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        onUpdateUser?.({ is_premium: true, premium_plan: selectedPlan, role: 'premium' });
        alert('Premium activated successfully.');
      } else {
        alert(result.error || 'Subscription failed. Please try again.');
      }
    } catch {
      alert('An error occurred during subscription.');
    }
  };

  return (
    <div className="premium-page-container">
      <div className="premium-header">
        <h2>Unlock Your Full Potential</h2>
        <p>Choose the plan that fits your wellness journey.</p>
      </div>

      <div className="plans-container">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.highlight ? 'highlight' : ''} ${selectedPlan === plan.id ? 'selected' : ''}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.highlight && <div className="best-value-badge">BEST VALUE</div>}
            {plan.id === 'lifetime' && <div className="lifetime-badge">LIFETIME</div>}
            <h3>{plan.name}</h3>
            <div className="price">
              <span className="price-amount">{plan.price}</span>
              <span className="price-period">{plan.period}</span>
            </div>
            {plan.savings && <div className="savings-badge">{plan.savings}</div>}
            <p className="plan-description">{plan.description}</p>
            <ul className="features-list">
              {plan.features.map((feature) => (
                <li key={feature}>- {feature}</li>
              ))}
            </ul>
            <div className="select-indicator">
              {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
            </div>
          </div>
        ))}
      </div>

      <div className="plans-actions">
        <button className="subscribe-btn" disabled={!selectedPlan} onClick={handleSubscribe}>
          Upgrade to {selectedPlan ? plans.find((p) => p.id === selectedPlan)?.name : 'Premium'}
        </button>
        <p className="security-note">Secure checkout. 7-day money-back guarantee.</p>
      </div>
    </div>
  );
}

export default Premium;
