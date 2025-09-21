import React from 'react';

function SleepCompanionModal({ user, onClose, onUpgradeClick }) {
    if (!user.is_premium) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="premium-upsell-box" onClick={(e) => e.stopPropagation()}>
                    <button className="close-btn" onClick={onClose}>×</button>
                    <div className="lock-icon">🌙</div>
                    <h3>Unlock Sleep Stories</h3>
                    <p>Drift off to sleep with our collection of calming bedtime stories. Available only for Premium members.</p>
                    <button onClick={onUpgradeClick} className="upgrade-btn">✨ Upgrade Now</button>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>🌙 Sleep Companion</h2>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>
                <p>Calming sleep stories are coming soon!</p>
            </div>
        </div>
    );
}

export default SleepCompanionModal;