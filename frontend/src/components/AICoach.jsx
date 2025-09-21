import React, { useState, useEffect } from 'react';
import './AICoach.css';

// Enhanced sample data with elite-focused activities
const allTasks = {
  focus: [
    { id: 1, activity: 'Deep Work Protocol', description: '90-minute distraction-free focused sessions with neurofeedback', duration: '90 min', icon: '🚀', intensity: 'High', energyImpact: '+42%', category: 'performance' },
    { id: 2, activity: 'Cognitive Priming', description: 'Prepare neural pathways for peak problem-solving', duration: '15 min', icon: '🧠', intensity: 'Medium', energyImpact: '+27%', category: 'performance' },
  ],
  decision: [
    { id: 3, activity: 'Strategic Clarity Session', description: 'Enhance decision-making under uncertainty', duration: '20 min', icon: '🎯', intensity: 'Medium', energyImpact: '+35%', category: 'leadership' },
    { id: 4, activity: 'First-Principles Thinking', description: 'Break down complex problems to fundamental truths', duration: '25 min', icon: '🔍', intensity: 'High', energyImpact: '+38%', category: 'innovation' },
  ],
  recovery: [
    { id: 5, activity: 'Biohacking Recovery', description: 'Optimize cellular regeneration with guided protocols', duration: '30 min', icon: '⚡', intensity: 'Low', energyImpact: '+51%', category: 'health' },
    { id: 6, activity: 'Neural Reset', description: 'Pattern interruption for creative breakthrough', duration: '18 min', icon: '🔄', intensity: 'Low', energyImpact: '+33%', category: 'creativity' },
  ],
  energy: [
    { id: 7, activity: 'Circadian Optimization', description: 'Align with biological prime time for maximum output', duration: '5 min', icon: '⏰', intensity: 'Low', energyImpact: '+47%', category: 'performance' },
    { id: 8, activity: 'Mitochondrial Boost', description: 'Enhance cellular energy production', duration: '12 min', icon: '🔋', intensity: 'Medium', energyImpact: '+44%', category: 'health' },
  ]
};

// Elite-focused insights
const generateAIInsights = (goals, completedTasks) => {
  const insights = [
    "Your cognitive performance peaks between 10:00-12:30. Schedule critical decisions during this window.",
    "After 7+ hours of sleep, your strategic thinking improves by 63%. Protect sleep quality above all.",
    "20-minute movement breaks every 90 minutes increase productivity by 41% without extending work hours.",
    "Your neural recovery accelerates with 5-minute breathing sessions between meetings. Current utilization: 22%.",
    "Based on 3,742 data points, your optimal work-rest ratio is 90:22 minutes for sustained high performance."
  ];
  
  return insights[Math.floor(Math.random() * insights.length)];
};

// Elite recommendations
const generateRecommendations = (goals) => {
  return goals.map(goal => {
    const recommendations = {
      focus: "Your focus endurance increases by 27% when preceded by 7 minutes of box breathing. Schedule before important deep work.",
      decision: "Decision fatigue reduces by 44% when you make critical choices before 1 PM. Reschedule your 4 PM meeting.",
      recovery: "Your HRV data suggests optimal recovery between 10-11 PM. Consider shifting evening activities.",
      energy: "Cognitive performance increases by 31% with 5-minute movement breaks every 90 minutes. Current average: 127 minutes between breaks."
    };
    return recommendations[goal] || "Biometric patterns suggest optimal performance with 7h 23m of sleep. Current average: 6h 41m.";
  });
};

// Performance metrics for elite users
const performanceMetrics = {
  cognitiveLoad: 76,
  decisionQuality: 88,
  recoveryRate: 63,
  energyReserves: 72,
  focusDuration: 84
};

function AICoach({ user }) {
  const [userGoals, setUserGoals] = useState(['focus', 'decision']);
  const [dailyPlan, setDailyPlan] = useState([]);
  const [aiInsight, setAiInsight] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [coachMessage, setCoachMessage] = useState("");
  const [activeTimeTab, setActiveTimeTab] = useState('Morning');
  const [performanceData, setPerformanceData] = useState(performanceMetrics);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Generate initial plan and insights
  useEffect(() => {
    const generatePlan = () => {
      let plan = [];
      
      // Add tasks based on selected goals
      userGoals.forEach(goal => {
        if (allTasks[goal]) {
          const selectedTasks = [...allTasks[goal]];
          plan = [...plan, ...selectedTasks];
        }
      });
      
      // Schedule tasks throughout the day
      const timeSlots = ['Morning', 'Mid-day', 'Afternoon', 'Evening'];
      const scheduledPlan = plan.map((task, index) => {
        const timeIndex = Math.min(index, timeSlots.length - 1);
        return { 
          ...task, 
          completed: false, 
          scheduledTime: timeSlots[timeIndex],
          optimalTime: `${Math.floor(Math.random() * 12) + 7}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`
        };
      });
      
      setDailyPlan(scheduledPlan);
    };
    
    generatePlan();
    setAiInsight(generateAIInsights(userGoals, []));
    setRecommendations(generateRecommendations(userGoals));
    
    // Set a personalized coach message
    const messages = [
      "Neural patterns indicate 92% compatibility with today's protocol. Execution at this level yields 3.2x ROI on time investment.",
      "Biometric data suggests peak performance conditions today. Capitalize with focused deep work sessions.",
      "Recovery metrics have improved 27% week-over-week. Strategic thinking capacity increased accordingly.",
      "Cognitive load distribution is optimal today. Consider tackling the most challenging problems first."
    ];
    setCoachMessage(messages[Math.floor(Math.random() * messages.length)]);
  }, [userGoals]);

  const handleToggleComplete = (taskId) => {
    setDailyPlan(currentPlan =>
      currentPlan.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    
    // Simulate performance improvement
    setPerformanceData(prev => ({
      cognitiveLoad: Math.min(100, prev.cognitiveLoad + 2),
      decisionQuality: Math.min(100, prev.decisionQuality + 3),
      recoveryRate: Math.min(100, prev.recoveryRate + 1),
      energyReserves: Math.min(100, prev.energyReserves + 2),
      focusDuration: Math.min(100, prev.focusDuration + 4)
    }));
  };

  const completedTasks = dailyPlan.filter(task => task.completed).length;
  const progressPercentage = dailyPlan.length > 0 ? (completedTasks / dailyPlan.length) * 100 : 0;
  
  const filteredTasks = dailyPlan.filter(task => task.scheduledTime === activeTimeTab);

  return (
    <div className="ai-coach-page">
      <div className="coach-header">
        <div className="coach-title">
          <div className="coach-avatar">🚀</div>
          <div>
            <h1>Elite Performance Coach</h1>
            <p>Neuro-optimized for exceptional results</p>
          </div>
        </div>
        
        <div className="header-controls">
          <button className="analytics-toggle" onClick={() => setShowAnalytics(!showAnalytics)}>
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
        </div>
      </div>

      <div className="ai-coach-container">
        {/* Performance Dashboard */}
        {showAnalytics && (
          <div className="performance-dashboard">
            <h3>Performance Analytics</h3>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-title">Cognitive Load</span>
                  <span className="metric-value">{performanceData.cognitiveLoad}%</span>
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill" 
                    style={{width: `${performanceData.cognitiveLoad}%`}}
                  ></div>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-title">Decision Quality</span>
                  <span className="metric-value">{performanceData.decisionQuality}%</span>
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill" 
                    style={{width: `${performanceData.decisionQuality}%`}}
                  ></div>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-title">Recovery Rate</span>
                  <span className="metric-value">{performanceData.recoveryRate}%</span>
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill" 
                    style={{width: `${performanceData.recoveryRate}%`}}
                  ></div>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-title">Energy Reserves</span>
                  <span className="metric-value">{performanceData.energyReserves}%</span>
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill" 
                    style={{width: `${performanceData.energyReserves}%`}}
                  ></div>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-title">Focus Duration</span>
                  <span className="metric-value">{performanceData.focusDuration}%</span>
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill" 
                    style={{width: `${performanceData.focusDuration}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Coach Introduction */}
        <div className="coach-intro">
          <div className="coach-message">
            <div className="message-bubble">
              <p>{coachMessage}</p>
              <div className="message-meta">
                <span className="confidence-indicator">92% confidence</span>
                <span className="data-points">Based on 3,742 data points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="progress-overview">
          <h3>Today's Performance Protocol</h3>
          <div className="progress-visual">
            <div className="circular-progress">
              <div className="progress-circle">
                <svg viewBox="0 0 100 100">
                  <circle className="progress-background" cx="50" cy="50" r="45" />
                  <circle 
                    className="progress-fill" 
                    cx="50" cy="50" r="45" 
                    strokeDasharray={283} 
                    strokeDashoffset={283 - (progressPercentage / 100 * 283)} 
                  />
                </svg>
                <div className="progress-text">
                  <span className="percentage">{Math.round(progressPercentage)}%</span>
                  <span className="label">Execution</span>
                </div>
              </div>
            </div>
            <div className="progress-stats">
              <div className="stat">
                <span className="value">{completedTasks}</span>
                <span className="label">Completed</span>
              </div>
              <div className="stat">
                <span className="value">{dailyPlan.length}</span>
                <span className="label">Total Protocols</span>
              </div>
              <div className="stat">
                <span className="value">{dailyPlan.filter(t => !t.completed).length}</span>
                <span className="label">Remaining</span>
              </div>
              <div className="stat">
                <span className="value">+{completedTasks * 3}%</span>
                <span className="label">Performance</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="ai-insights-section">
          <h3>🧠 Strategic Insights</h3>
          <div className="insight-card">
            <p>{aiInsight}</p>
            <div className="insight-source">
              <span className="source-label">Neural Analysis Engine v3.2</span>
              <span className="accuracy">94% accuracy</span>
            </div>
          </div>
          <div className="recommendations">
            {recommendations.map((rec, index) => (
              <div key={index} className="recommendation">
                <span className="rec-icon">🎯</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Plan */}
        <div className="daily-plan-section">
          <h3>Optimal Performance Schedule</h3>
          <div className="time-tabs">
            {['Morning', 'Mid-day', 'Afternoon', 'Evening'].map(time => (
              <button 
                key={time}
                className={`time-tab ${activeTimeTab === time ? 'active' : ''}`}
                onClick={() => setActiveTimeTab(time)}
              >
                {time}
              </button>
            ))}
          </div>
          
          <div className="coach-plan">
            {filteredTasks.map((item) => (
              <div key={item.id} className={`coach-item ${item.completed ? 'completed' : ''}`}>
                <div className="task-timing">
                  <span className="scheduled-time">{item.scheduledTime}</span>
                  <span className="optimal-time">Optimal: {item.optimalTime}</span>
                </div>
                <div className="coach-icon">{item.icon}</div>
                <div className="coach-details">
                  <h3>{item.activity}</h3>
                  <p>{item.description}</p>
                  <div className="task-meta">
                    <span className="duration">{item.duration}</span>
                    <span className="intensity">{item.intensity}</span>
                    <span className="energy-impact">{item.energyImpact} efficiency</span>
                    <span className="category">{item.category}</span>
                  </div>
                </div>
                <button
                  className={`coach-action-btn ${item.completed ? 'done' : ''}`}
                  onClick={() => handleToggleComplete(item.id)}
                >
                  {item.completed ? 'Executed' : 'Execute'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Features */}
        <div className="advanced-features">
          <h3>Elite Optimization Tools</h3>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h4>Neuro Analytics</h4>
              <p>Real-time cognitive performance tracking</p>
              <button className="feature-btn">Access</button>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔮</div>
              <h4>Strategic Forecasting</h4>
              <p>Predict performance bottlenecks</p>
              <button className="feature-btn">Analyze</button>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h4>Adaptive Learning</h4>
              <p>AI that evolves with your patterns</p>
              <button className="feature-btn">Optimize</button>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h4>Biohacking Protocols</h4>
              <p>Cutting-edge performance enhancement</p>
              <button className="feature-btn">Explore</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AICoach;