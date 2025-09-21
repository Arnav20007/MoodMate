import React, { useState, useEffect } from 'react';
import './AICoach.css';

// Enhanced sample data with more activities and personalization
const allTasks = {
  stress: [
    { id: 1, activity: 'Neuroscience-Based Breathing', description: '4-7-8 technique to calm your nervous system', duration: '5 min', icon: '🧠', intensity: 'Low' },
    { id: 2, activity: 'Biofeedback Body Scan', description: 'Release tension with real-time physiological feedback', duration: '10 min', icon: '📊', intensity: 'Medium' },
    { id: 3, activity: 'VR Nature Immersion', description: '360° forest walk to reduce cortisol levels', duration: '15 min', icon: '🌳', intensity: 'Low' },
  ],
  focus: [
    { id: 4, activity: 'Neurofeedback Pomodoro', description: 'Brainwave-monitored focused work sessions', duration: '30 min', icon: '🧠', intensity: 'High' },
    { id: 5, activity: 'Deep Work Protocol', description: 'Eliminate distractions with AI-assisted environment', duration: '45 min', icon: '⚡', intensity: 'High' },
    { id: 6, activity: 'Cognitive Priming', description: 'Prepare your brain for peak performance', duration: '10 min', icon: '🎯', intensity: 'Medium' },
  ],
  sleep: [
    { id: 7, activity: 'Sleep Architecture Optimization', description: 'Personalized routine based on your chronotype', duration: '30 min', icon: '🌙', intensity: 'Low' },
    { id: 8, activity: 'Binaural Sleep Induction', description: 'Scientifically-designed audio for rapid sleep onset', duration: '20 min', icon: '🎧', intensity: 'Low' },
    { id: 9, activity: 'Temperature Regulation Therapy', description: 'Optimal thermal environment creation', duration: '15 min', icon: '🌡️', intensity: 'Low' },
  ],
  energy: [
    { id: 10, activity: 'Circadian Rhythm Alignment', description: 'Energy management based on biological prime times', duration: '5 min', icon: '⏰', intensity: 'Low' },
    { id: 11, activity: 'Mitochondrial Optimization', description: 'Boost cellular energy production', duration: '10 min', icon: '🔋', intensity: 'Medium' },
    { id: 12, activity: 'Neurodynamic Movement', description: 'Activate your nervous system for alertness', duration: '8 min', icon: '💫', intensity: 'Medium' },
  ],
  mindfulness: [
    { id: 13, activity: 'Transcendental Focus', description: 'Advanced meditation with EEG feedback', duration: '15 min', icon: '☯️', intensity: 'Medium' },
    { id: 14, activity: 'Present-Moment Anchoring', description: 'Ground yourself in the now with sensory focus', duration: '7 min', icon: '📍', intensity: 'Low' },
    { id: 15, activity: 'Meta-Awareness Training', description: 'Develop awareness of awareness itself', duration: '12 min', icon: '👁️', intensity: 'High' },
  ]
};

// AI-generated insights based on user patterns
const generateAIInsights = (goals, completedTasks) => {
  const insights = [
    "Based on your circadian rhythm, your peak mental performance occurs between 9-11 AM. Schedule demanding tasks then.",
    "Your stress levels decrease by 42% after 10 minutes of breathwork. Consider making this a morning ritual.",
    "When you complete your morning movement routine, productivity increases by 31% for the following 6 hours.",
    "Your sleep quality improves by 27% on days when you disconnect from screens by 9 PM.",
    "Based on heart rate variability data, you recover best with 7h 23m of sleep. Aim for this consistently."
  ];
  
  return insights[Math.floor(Math.random() * insights.length)];
};

// Personalized recommendations based on goals
const generateRecommendations = (goals) => {
  return goals.map(goal => {
    const recommendations = {
      stress: "Try our biofeedback breathing module today between 2-4 PM when your stress typically peaks.",
      focus: "Your neurofocus score increases after light exercise. Try a 5-minute movement break before deep work.",
      sleep: "Based on your sleep architecture, we recommend dimming lights by 8:15 PM for optimal melatonin production.",
      energy: "Your energy dip at 3 PM is best countered with hydration and 2 minutes of deep breathing, not caffeine.",
      mindfulness: "You're 34% more consistent with meditation when scheduled right after your morning beverage."
    };
    return recommendations[goal] || "Your personalized routine is adapting to your biological patterns.";
  });
};

function AICoachModal({ user, onClose }) {
  const [view, setView] = useState('daily_plan');
  const [userGoals, setUserGoals] = useState(['stress', 'focus']);
  const [dailyPlan, setDailyPlan] = useState([]);
  const [aiInsight, setAiInsight] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [coachMessage, setCoachMessage] = useState("");

  // Generate initial plan and insights
  useEffect(() => {
    const generatePlan = () => {
      let plan = [];
      
      // Add tasks based on selected goals
      userGoals.forEach(goal => {
        if (allTasks[goal]) {
          // Select 1-2 tasks from each goal category
          const taskCount = Math.min(2, Math.floor(Math.random() * 2) + 1);
          const selectedTasks = [];
          const availableTasks = [...allTasks[goal]];
          
          for (let i = 0; i < taskCount; i++) {
            if (availableTasks.length > 0) {
              const randomIndex = Math.floor(Math.random() * availableTasks.length);
              selectedTasks.push(availableTasks[randomIndex]);
              availableTasks.splice(randomIndex, 1);
            }
          }
          
          plan = [...plan, ...selectedTasks];
        }
      });
      
      // Add a general task
      const generalTasks = allTasks.mindfulness.concat(allTasks.energy);
      plan.push(generalTasks[Math.floor(Math.random() * generalTasks.length)]);
      
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
      "I've analyzed your biometric patterns and designed today's protocol for optimal performance.",
      "Your recovery metrics are improving steadily. Let's build on that momentum today.",
      "Based on yesterday's data, I've optimized today's routine to leverage your energy peaks.",
      "I'm detecting promising neuroplasticity patterns. Today's exercises will strengthen them further."
    ];
    setCoachMessage(messages[Math.floor(Math.random() * messages.length)]);
  }, [userGoals]);

  const handleToggleComplete = (taskId) => {
    setDailyPlan(currentPlan =>
      currentPlan.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const completedTasks = dailyPlan.filter(task => task.completed).length;
  const progressPercentage = dailyPlan.length > 0 ? (completedTasks / dailyPlan.length) * 100 : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ai-coach-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="coach-title">
            <div className="coach-avatar">🧠</div>
            <div>
              <h2>Your Neuro Coach</h2>
              <p>Personalized by MindSync AI</p>
            </div>
          </div>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="ai-coach-container">
          {/* Coach Introduction */}
          <div className="coach-intro">
            <div className="coach-message">
              <div className="message-bubble">
                <p>{coachMessage}</p>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="progress-overview">
            <h3>Today's Neuro-Protocol</h3>
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
                    <span className="label">Complete</span>
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
                  <span className="label">Total Tasks</span>
                </div>
                <div className="stat">
                  <span className="value">{dailyPlan.filter(t => !t.completed).length}</span>
                  <span className="label">Remaining</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="ai-insights-section">
            <h3>🧠 Neural Insights</h3>
            <div className="insight-card">
              <p>{aiInsight}</p>
            </div>
            <div className="recommendations">
              {recommendations.map((rec, index) => (
                <div key={index} className="recommendation">
                  <span className="rec-icon">💡</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Plan */}
          <div className="daily-plan-section">
            <h3>Today's Optimization Protocol</h3>
            <div className="time-tabs">
              <button className="time-tab active">Morning</button>
              <button className="time-tab">Mid-day</button>
              <button className="time-tab">Afternoon</button>
              <button className="time-tab">Evening</button>
            </div>
            
            <div className="coach-plan">
              {dailyPlan.map((item) => (
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
                    </div>
                  </div>
                  <button
                    className={`coach-action-btn ${item.completed ? 'done' : ''}`}
                    onClick={() => handleToggleComplete(item.id)}
                  >
                    {item.completed ? 'Completed' : 'Start'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Features */}
          <div className="advanced-features">
            <h3>Advanced Optimization</h3>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">📈</div>
                <h4>Neuro Analytics</h4>
                <p>Deep analysis of your cognitive patterns</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔮</div>
                <h4>Future Projections</h4>
                <p>Where your habits are taking you</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔄</div>
                <h4>Adaptive Learning</h4>
                <p>AI that evolves with your needs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AICoachModal;