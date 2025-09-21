// Report.jsx
import React, { useState, useEffect, useRef } from 'react';
import './Report.css';

const Report = ({ user }) => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [streak, setStreak] = useState(12);
  const [coins, setCoins] = useState(500);
  const [completedActivities, setCompletedActivities] = useState(63);
  const [overallMoodScore, setOverallMoodScore] = useState(83);
  
  const reportRef = useRef(null);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Generate sample mood data
  const generateMoodData = () => {
    const moods = ['😊 Happy', '😔 Sad', '😠 Stressed', '😴 Tired', '😌 Calm'];
    const data = [];
    
    for (let i = 30; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString(),
        mood: moods[Math.floor(Math.random() * moods.length)],
        score: Math.floor(Math.random() * 40) + 60, // 60-100 range
        activities: Math.floor(Math.random() * 5) + 1
      });
    }
    
    return data;
  };

  // Generate sample activity data
  const generateActivityData = () => {
    const activities = [
      { type: 'Meditation', duration: '5 min', coins: 10 },
      { type: 'Breathing Exercise', duration: '3 min', coins: 5 },
      { type: 'Journaling', duration: '7 min', coins: 15 },
      { type: 'Mood Check-in', duration: '2 min', coins: 5 },
      { type: 'Sleep Tracking', duration: '1 min', coins: 5 },
      { type: 'Gratitude Practice', duration: '4 min', coins: 10 }
    ];
    
    const data = [];
    
    for (let i = 30; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const activityCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < activityCount; j++) {
        const activity = activities[Math.floor(Math.random() * activities.length)];
        data.push({
          date: date.toLocaleDateString(),
          type: activity.type,
          duration: activity.duration,
          coins: activity.coins,
          mood: ['😊', '😔', '😠', '😴', '😌'][Math.floor(Math.random() * 5)]
        });
      }
    }
    
    return data;
  };

  // Generate sample achievements
  const generateAchievements = () => {
    return [
      { id: 1, name: '7-Day Streak', earned: true, icon: '🔥', description: 'Logged activities for 7 consecutive days' },
      { id: 2, name: 'Meditation Master', earned: true, icon: '🧘', description: 'Completed 10 meditation sessions' },
      { id: 3, name: 'Mood Tracker', earned: true, icon: '📊', description: 'Logged mood for 14 days' },
      { id: 4, name: 'Early Bird', earned: false, icon: '🌅', description: 'Complete 5 morning routines' },
      { id: 5, name: 'Wellness Warrior', earned: false, icon: '🛡️', description: '30-day streak' },
      { id: 6, name: 'Sleep Champion', earned: false, icon: '🌙', description: 'Track sleep for 14 nights' }
    ];
  };

  const moodData = generateMoodData();
  const activities = generateActivityData();
  const achievements = generateAchievements();

  // Calculate mood distribution
  const moodDistribution = moodData.reduce((acc, day) => {
    const mood = day.mood;
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {});

  // Generate AI insights
  const aiInsights = [
    "Your mood improves by 25% after meditation sessions",
    "You're most productive on Tuesday and Wednesday mornings",
    "Sleep duration strongly correlates with your next day mood",
    "You've shown a 15% increase in overall wellness compared to last month"
  ];

  // Generate predictions
  const predictions = [
    "Based on your patterns, next week looks positive with an estimated mood score of 78",
    "You're on track to hit a 30-day streak in 5 more days",
    "Continuing at this rate, you'll earn 200 more coins this month"
  ];

  // Handle PDF download
  const handleDownloadPDF = () => {
    setIsGeneratingPDF(true);
    
    // Simulate PDF generation
    setTimeout(() => {
      setIsGeneratingPDF(false);
      alert('PDF report downloaded successfully!');
    }, 1500);
  };

  // Handle sharing with coach
  const handleShareWithCoach = () => {
    setIsSharing(true);
    
    // Simulate sharing process
    setTimeout(() => {
      setIsSharing(false);
      setCopiedToClipboard(true);
      alert('Report link copied to clipboard! Share it with your coach.');
      
      // Reset copied status after 3 seconds
      setTimeout(() => setCopiedToClipboard(false), 3000);
    }, 1000);
  };

  // Handle unlocking premium
  const handleUnlockPremium = () => {
    setIsUnlocking(true);
    
    // Simulate unlocking process
    setTimeout(() => {
      setIsUnlocking(false);
      setShowPremiumModal(true);
    }, 1500);
  };

  // Handle challenge actions
  const handleChallengeAction = (action) => {
    switch(action) {
      case 'meditation':
        alert('Starting Meditation Challenge...');
        break;
      case 'sleep':
        alert('Opening Sleep Analysis...');
        break;
      case 'goals':
        alert('Opening Goal Setting...');
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="report-loading">
        <div className="loading-spinner"></div>
        <p>Generating your premium wellness report...</p>
      </div>
    );
  }

  return (
    <div className="report-full-page" ref={reportRef}>
      {/* Header Section */}
      <div className="report-header">
        <div className="header-content">
          <h1>Hey {user.username || "Arnav...singh_"}! Here's your mental wellness snapshot 🧠💫</h1>
          <p>Your personalized wellness report for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="time-range-selector">
          <button 
            className={timeRange === 'weekly' ? 'active' : ''}
            onClick={() => setTimeRange('weekly')}
          >
            Weekly
          </button>
          <button 
            className={timeRange === 'monthly' ? 'active' : ''}
            onClick={() => setTimeRange('monthly')}
          >
            Monthly
          </button>
          <button 
            className={timeRange === 'quarterly' ? 'active' : ''}
            onClick={() => setTimeRange('quarterly')}
          >
            Quarterly
          </button>
        </div>
      </div>

      {/* Summary Section */}
      <div className="summary-section">
        <div className="mood-score">
          <h2>Overall Mood Score</h2>
          <div className="score-circle">
            <span className="score">{overallMoodScore}</span>
            <span className="out-of">/100</span>
          </div>
          <div className="score-label">
            {overallMoodScore >= 80 ? 'Excellent' : 
             overallMoodScore >= 60 ? 'Good' : 
             overallMoodScore >= 40 ? 'Fair' : 'Needs Improvement'}
          </div>
        </div>

        <div className="highlights">
          <h2>Top Highlights</h2>
          <div className="highlight-cards">
            <div className="highlight-card">
              <span className="icon">🔥</span>
              <span className="value">{streak} days</span>
              <span className="label">Current Streak</span>
            </div>
            <div className="highlight-card">
              <span className="icon">✅</span>
              <span className="value">{completedActivities} completed</span>
              <span className="label">Activities</span>
            </div>
            <div className="highlight-card">
              <span className="icon">🪙</span>
              <span className="value">{coins} earned</span>
              <span className="label">Coins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="report-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'trends' ? 'active' : ''}
          onClick={() => setActiveTab('trends')}
        >
          Trends
        </button>
        <button 
          className={activeTab === 'activities' ? 'active' : ''}
          onClick={() => setActiveTab('activities')}
        >
          Activities
        </button>
        <button 
          className={activeTab === 'achievements' ? 'active' : ''}
          onClick={() => setActiveTab('achievements')}
        >
          Achievements
        </button>
        <button 
          className={activeTab === 'insights' ? 'active' : ''}
          onClick={() => setActiveTab('insights')}
        >
          AI Insights
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content-full">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="chart-container">
              <h3>Mood Trend</h3>
              <div className="mood-trend-chart">
                {moodData.slice(-7).map((day, i) => (
                  <div key={i} className="chart-bar">
                    <div 
                      className="bar" 
                      style={{ height: `${day.score}%` }}
                      data-score={day.score}
                    ></div>
                    <span className="day-label">{day.date.split('/')[1]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mood-distribution">
              <h3>Mood Distribution</h3>
              <div className="distribution-chart">
                {Object.entries(moodDistribution).map(([mood, count], i) => {
                  const percentage = (count / moodData.length) * 100;
                  return (
                    <div key={i} className="distribution-item">
                      <div className="mood-label">{mood}</div>
                      <div className="distribution-bar">
                        <div 
                          className="fill" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="percentage">{percentage.toFixed(1)}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="trends-tab">
            <h3>Mood Trends Over Time</h3>
            <div className="calendar-heatmap">
              <div className="heatmap-header">Last 30 Days</div>
              <div className="heatmap-grid">
                {moodData.map((day, i) => (
                  <div 
                    key={i} 
                    className="heatmap-cell"
                    style={{ 
                      backgroundColor: `hsl(${day.score * 1.2}, 70%, 60%)`,
                      border: day.score > 80 ? '2px solid gold' : 'none'
                    }}
                    title={`${day.date}: Score ${day.score}`}
                  ></div>
                ))}
              </div>
              <div className="heatmap-legend">
                <span>Low</span>
                <div className="gradient-bar"></div>
                <span>High</span>
              </div>
            </div>
            
            <div className="trend-analysis">
              <h3>Weekly Analysis</h3>
              <div className="trend-cards">
                <div className="trend-card positive">
                  <span className="trend-icon">📈</span>
                  <div className="trend-content">
                    <h4>Positive Trend</h4>
                    <p>Your mood has improved by 15% compared to last week</p>
                  </div>
                </div>
                <div className="trend-card neutral">
                  <span className="trend-icon">⏰</span>
                  <div className="trend-content">
                    <h4>Consistent Routine</h4>
                    <p>You've maintained a consistent activity schedule</p>
                  </div>
                </div>
                <div className="trend-card improvement">
                  <span className="trend-icon">💤</span>
                  <div className="trend-content">
                    <h4>Sleep Quality</h4>
                    <p>Your sleep score has increased by 20% this month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="activities-tab">
            <h3>Activity History</h3>
            <div className="activities-table">
              <div className="table-header">
                <span>Date</span>
                <span>Activity</span>
                <span>Duration</span>
                <span>Mood</span>
                <span>Coins</span>
              </div>
              {activities.slice(0, 20).map((activity, i) => (
                <div key={i} className="table-row">
                  <span>{activity.date}</span>
                  <span>{activity.type}</span>
                  <span>{activity.duration}</span>
                  <span>{activity.mood}</span>
                  <span>+{activity.coins}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-tab">
            <h3>Your Achievements</h3>
            <div className="achievements-grid">
              {achievements.map(achievement => (
                <div 
                  key={achievement.id} 
                  className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
                >
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-info">
                    <h4>{achievement.name}</h4>
                    <p>{achievement.description}</p>
                  </div>
                  <div className="achievement-status">
                    {achievement.earned ? '✅ Earned' : '🔒 Locked'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="insights-tab">
            <h3>AI-Powered Insights</h3>
            <div className="insights-container">
              {aiInsights.map((insight, i) => (
                <div key={i} className="insight-card">
                  <div className="insight-icon">💡</div>
                  <p>{insight}</p>
                </div>
              ))}
            </div>

            <h3>Predictions & Recommendations</h3>
            <div className="predictions-container">
              {predictions.map((prediction, i) => (
                <div key={i} className="prediction-card">
                  <div className="prediction-icon">🔮</div>
                  <p>{prediction}</p>
                </div>
              ))}
            </div>

            <div className="action-buttons">
              <button className="action-btn" onClick={() => handleChallengeAction('meditation')}>
                Try Meditation Challenge
              </button>
              <button className="action-btn" onClick={() => handleChallengeAction('sleep')}>
                View Sleep Analysis
              </button>
              <button className="action-btn" onClick={() => handleChallengeAction('goals')}>
                Set New Goals
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Download/Share Section */}
      <div className="report-actions">
        <button 
          className={`download-btn ${isGeneratingPDF ? 'loading' : ''}`}
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
        >
          {isGeneratingPDF ? (
            <>
              <span className="spinner"></span>
              Generating PDF...
            </>
          ) : (
            <>
              📄 Download PDF Report
            </>
          )}
        </button>
        <button 
          className={`share-btn ${isSharing ? 'loading' : ''}`}
          onClick={handleShareWithCoach}
          disabled={isSharing}
        >
          {isSharing ? (
            <>
              <span className="spinner"></span>
              Preparing share...
            </>
          ) : copiedToClipboard ? (
            '✓ Copied to Clipboard!'
          ) : (
            '↗ Share with Coach'
          )}
        </button>
        {!user.is_premium && (
          <button 
            className={`premium-btn ${isUnlocking ? 'loading' : ''}`}
            onClick={handleUnlockPremium}
            disabled={isUnlocking}
          >
            {isUnlocking ? (
              <>
                <span className="spinner"></span>
                Unlocking...
              </>
            ) : (
              '🔓 Unlock Advanced Analytics'
            )}
          </button>
        )}
      </div>

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="modal-overlay">
          <div className="premium-modal">
            <button className="modal-close" onClick={() => setShowPremiumModal(false)}>×</button>
            <div className="modal-content">
              <div className="modal-icon">✨</div>
              <h2>Unlock Premium Features</h2>
              <p>Upgrade to access advanced analytics, personalized insights, and more detailed reports.</p>
              <div className="premium-features">
                <div className="feature">
                  <span className="feature-icon">📊</span>
                  <span>Advanced Analytics</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🔍</span>
                  <span>Detailed Insights</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">📈</span>
                  <span>Trend Predictions</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">💎</span>
                  <span>Exclusive Content</span>
                </div>
              </div>
              <button className="upgrade-btn">Upgrade Now - $9.99/month</button>
              <p className="modal-note">7-day free trial included</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;