import React from 'react';

function GamesModal({ user, onClose, onUpgradeClick }) {
    if (!user.is_premium) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="premium-upsell-box" onClick={(e) => e.stopPropagation()}>
                    <button className="close-btn" onClick={onClose}>×</button>
                    <div className="lock-icon">🎮</div>
                    <h3>Unlock Mindful Games</h3>
                    <p>Relax and de-stress with our collection of calming mini-games. Available exclusively for Premium members.</p>
                    <button onClick={onUpgradeClick} className="upgrade-btn">✨ Upgrade Now</button>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>🎮 Relaxing Games</h2>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>
                <p>These games are designed to help you relax and focus. Enjoy!</p>
                {/* Game content would go here */}
            </div>
        </div>
    );
}

export default GamesModal;