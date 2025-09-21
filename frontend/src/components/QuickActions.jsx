import React from 'react';

function QuickActionsMenu({ onShowGames, onShowAICoach, onShowSleep, onShowReport }) {
    return (
        <div className="quick-actions-container">
            <div className="quick-actions-menu">
                <button className="quick-action-btn">
                    <span className="action-icon">🧘</span>
                    <span>Breathe</span>
                </button>
                <button onClick={onShowGames} className="quick-action-btn">
                    <span className="action-icon">🎮</span>
                    <span>Games</span>
                </button>
                <button onClick={onShowAICoach} className="quick-action-btn">
                    <span className="action-icon">🤖</span>
                    <span>AI Coach</span>
                </button>
                <button onClick={onShowSleep} className="quick-action-btn">
                    <span className="action-icon">🌙</span>
                    <span>Sleep</span>
                </button>
                <button onClick={onShowReport} className="quick-action-btn">
                    <span className="action-icon">📊</span>
                    <span>Report</span>
                </button>
            </div>
        </div>
    );
};

export default QuickActionsMenu;