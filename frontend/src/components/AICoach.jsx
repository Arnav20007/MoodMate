import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AICoach.css';

const MOOD_TIPS = {
  morning: [
    { icon: '💧', text: 'Drink a glass of water before your first task. Hydration measurably sharpens focus within 20 minutes.' },
    { icon: '🌬️', text: 'Try box breathing: inhale 4s → hold 4s → exhale 4s → hold 4s. Two rounds calm your nervous system in 60 seconds.' },
    { icon: '📵', text: 'Your first 30 minutes after waking shape your entire day emotionally. Try keeping the phone down for just that window.' },
    { icon: '🌅', text: 'Natural light in the morning helps regulate your sleep-wake cycle. Even 5 minutes near a window helps.' },
  ],
  afternoon: [
    { icon: '🚶', text: 'A 10-minute walk — even indoors — can lift your mood for up to 2 hours. Your mind needs movement.' },
    { icon: '🍎', text: 'Afternoon energy dip? A light snack with protein (like nuts) is more effective than coffee for sustained energy.' },
    { icon: '👁️', text: 'The 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds. Reduces eye strain and mental fatigue.' },
    { icon: '🧘', text: 'Feeling overwhelmed? Name 5 things you can see right now. This simple grounding technique resets an anxious mind.' },
  ],
  evening: [
    { icon: '📓', text: 'Writing 3 specific things you\'re grateful for (not generic ones) has measurable effects on next-day mood.' },
    { icon: '📱', text: 'Blue light from screens suppresses melatonin. Consider a 30-minute no-screen wind-down before bed.' },
    { icon: '🌙', text: 'A consistent bedtime — even on weekends — is the single most impactful sleep habit you can build.' },
    { icon: '💭', text: 'If you\'re carrying unresolved thoughts, write them down before sleep. It helps your brain release the "hold" on processing them.' },
  ],
};

const CBT_EXERCISES = [
  {
    id: 1, icon: '🧠', title: 'Thought Record',
    diff: 'Evidence-based',
    desc: 'Write down a negative thought, then list evidence for and against it. CBT\'s most powerful tool for restructuring distorted thinking.',
    steps: ['Identify the distressing thought', 'Rate your distress 0-10', 'List evidence FOR the thought', 'List evidence AGAINST it', 'Write a more balanced thought', 'Re-rate your distress'],
  },
  {
    id: 2, icon: '🖐️', title: '5-4-3-2-1 Grounding',
    diff: 'Instant relief',
    desc: 'Reconnect with the present moment using your five senses. Works in 60 seconds for anxiety and panic.',
    steps: ['Name 5 things you can SEE', 'Name 4 things you can TOUCH', 'Name 3 things you can HEAR', 'Name 2 things you can SMELL', 'Name 1 thing you can TASTE'],
  },
  {
    id: 3, icon: '⚖️', title: 'Values Check-in',
    diff: 'Reflective',
    desc: 'When feeling directionless, ask: are my current actions aligned with what I actually value? Reduces internal friction significantly.',
    steps: ['List your top 3 values', 'Review your last 3 days', 'Note where you lived aligned', 'Note where you drifted', 'Pick one micro-correction for tomorrow'],
  },
  {
    id: 4, icon: '✅', title: 'Behavioral Activation',
    diff: 'Action-based',
    desc: 'Depression shrinks your action radius. Pick one small task — not to feel motivated, but to act first. Motivation follows action.',
    steps: ['List 5 low-effort activities', 'Pick the smallest one', 'Do it for just 5 minutes', 'Notice your mood shift', 'Decide if you want to continue'],
  },
];

const JOURNEYS = [
  { id: 1, title: '🌊 Managing Anxiety', desc: '7-day journey through triggers, tools, and sustainable calm.', day: 3, total: 7, color: '#8b5cf6' },
  { id: 2, title: '🌙 Better Sleep', desc: 'Build a science-backed sleep protocol over 5 days.', day: 0, total: 5, color: '#3b82f6', locked: true },
  { id: 3, title: '🧘 Daily Mindfulness', desc: '14-day progressive mindfulness from 2 minutes to 20.', day: 0, total: 14, color: '#10b981', locked: true },
];

function ExerciseCard({ ex, expanded, onToggle }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  return (
    <motion.div
      className="cbt-card"
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '12px' }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', cursor: 'pointer' }}
        onClick={onToggle}
      >
        <div style={{ fontSize: '28px', width: '44px', height: '44px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {ex.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{ex.title}</h4>
            <span style={{ fontSize: '10px', background: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: '10px', fontWeight: '700', flexShrink: 0 }}>{ex.diff}</span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.4 }}>{ex.desc}</p>
        </div>
        <span style={{ color: '#94a3b8', fontSize: '18px', flexShrink: 0 }}>{expanded ? '▲' : '▼'}</span>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 20px' }}>
              {done ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>✅</div>
                  <p style={{ color: '#10b981', fontWeight: '700', margin: 0 }}>Exercise complete! Well done.</p>
                  <button onClick={() => { setDone(false); setStep(0); }} style={{ marginTop: '12px', padding: '8px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>Do it again</button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                    {ex.steps.map((_, i) => (
                      <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= step ? '#6366f1' : '#e2e8f0', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                  <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px', letterSpacing: '0.05em' }}>STEP {step + 1} OF {ex.steps.length}</div>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1e293b', lineHeight: 1.5 }}>{ex.steps[step]}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    {step > 0 && (
                      <button onClick={() => setStep(s => s - 1)} style={{ padding: '8px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>← Back</button>
                    )}
                    <button
                      onClick={() => step < ex.steps.length - 1 ? setStep(s => s + 1) : setDone(true)}
                      style={{ padding: '8px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
                    >
                      {step < ex.steps.length - 1 ? 'Next →' : '✓ Complete'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AICoach({ user }) {
  const [tasks, setTasks] = useState(() => [
    { id: 1, label: 'Morning check-in', done: false, emoji: '🌅', coins: 5 },
    { id: 2, label: 'Drink 8 glasses of water', done: false, emoji: '💧', coins: 5 },
    { id: 3, label: 'Breathing exercise (5 min)', done: false, emoji: '🌬️', coins: 10 },
    { id: 4, label: 'Write 3 gratitudes in journal', done: false, emoji: '📓', coins: 10 },
    { id: 5, label: '10-minute mindful walk', done: false, emoji: '🚶', coins: 15 },
  ]);
  const [activeTab, setActiveTab] = useState('today');
  const [expandedEx, setExpandedEx] = useState(null);
  const [coinsEarned, setCoinsEarned] = useState(0);

  const hour = new Date().getHours();
  const timeKey = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const tips = MOOD_TIPS[timeKey];

  const completedCount = tasks.filter(t => t.done).length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const dashOffset = 283 - (progressPct / 100) * 283;

  const handleToggle = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        if (!t.done) setCoinsEarned(c => c + t.coins);
        return { ...t, done: !t.done };
      }
      return t;
    }));
  };

  const TABS = [
    { id: 'today', label: "Today's Plan", icon: '📋' },
    { id: 'exercises', label: 'CBT Tools', icon: '🧠' },
    { id: 'journeys', label: 'Journeys', icon: '🏔️' },
  ];

  return (
    <div className="ai-tab-wrapper">
      {/* Header */}
      <div className="ai-dashboard-header">
        <div className="coach-identity">
          <motion.div
            className="coach-avatar-lg"
            animate={{ boxShadow: ['0 0 0 0px rgba(99,102,241,0.3)', '0 0 0 10px rgba(99,102,241,0)', '0 0 0 0px rgba(99,102,241,0)'] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeOut' }}
          >
            <span>🧘</span>
          </motion.div>
          <div>
            <h1>Your Wellness Coach</h1>
            <p>Science-backed practices for a calmer, clearer mind</p>
          </div>
        </div>

        {coinsEarned > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            🪙 +{coinsEarned} coins earned today!
          </motion.div>
        )}
      </div>

      {/* Warm greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="coach-msg-card"
      >
        <p>
          "{greeting}, {user?.username || 'friend'}. You showed up — that already counts for something. 
          Here are practices that tend to help on {timeKey}s like this. No pressure. Take what feels right."
        </p>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: '#f1f5f9', padding: '4px', borderRadius: '14px' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '9px 14px', borderRadius: '10px', border: 'none',
              background: activeTab === tab.id ? 'white' : 'transparent',
              color: activeTab === tab.id ? '#6366f1' : '#64748b',
              fontWeight: activeTab === tab.id ? '700' : '500',
              fontSize: '13.5px', cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── TAB: TODAY'S PLAN ── */}
        {activeTab === 'today' && (
          <motion.div key="today" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
            <div className="ai-grid">
              {/* Progress circle */}
              <div className="ai-card">
                <h3>✅ Daily Checklist</h3>
                <div className="progress-visual">
                  <div className="progress-circle">
                    <svg viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                      <circle className="progress-background" cx="50" cy="50" r="45" />
                      <circle
                        className="progress-fill"
                        cx="50" cy="50" r="45"
                        strokeDasharray="283"
                        strokeDashoffset={dashOffset}
                        style={{ stroke: 'url(#pg)' }}
                      />
                    </svg>
                    <div className="progress-text">
                      <span className="percentage">{progressPct}%</span>
                      <span className="label">Done</span>
                    </div>
                  </div>
                  <div className="progress-stats">
                    <div className="stat-box">
                      <span className="value">{completedCount}</span>
                      <span className="label">Completed</span>
                    </div>
                    <div className="stat-box">
                      <span className="value">{tasks.length - completedCount}</span>
                      <span className="label">Remaining</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips card */}
              <div className="ai-card">
                <h3>💡 {timeKey.charAt(0).toUpperCase() + timeKey.slice(1)} Tips</h3>
                <div className="rec-list">
                  {tips.map((tip, i) => (
                    <div key={i} className="rec-item">{tip.icon} {tip.text}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Task list */}
            <div className="ai-card" style={{ padding: '24px 28px' }}>
              <h3 style={{ marginBottom: '16px' }}>🎯 Today's Wellness Tasks</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tasks.map(task => (
                  <motion.div
                    key={task.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleToggle(task.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '14px 18px', borderRadius: '14px', cursor: 'pointer',
                      background: task.done ? '#f0fdf4' : 'white',
                      border: `1.5px solid ${task.done ? '#86efac' : '#e2e8f0'}`,
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${task.done ? '#22c55e' : '#cbd5e1'}`,
                      background: task.done ? '#22c55e' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'all 0.2s',
                    }}>
                      {task.done && <span style={{ color: 'white', fontSize: '13px', fontWeight: '900' }}>✓</span>}
                    </div>
                    <span style={{ fontSize: '22px' }}>{task.emoji}</span>
                    <span style={{ flex: 1, fontSize: '14.5px', fontWeight: '600', color: task.done ? '#16a34a' : '#1e293b', textDecoration: task.done ? 'line-through' : 'none', transition: 'all 0.2s' }}>
                      {task.label}
                    </span>
                    <span style={{ fontSize: '12px', background: task.done ? '#dcfce7' : '#f8fafc', color: task.done ? '#16a34a' : '#64748b', padding: '3px 10px', borderRadius: '10px', fontWeight: '700', border: `1px solid ${task.done ? '#bbf7d0' : '#e2e8f0'}`, flexShrink: 0 }}>
                      🪙 +{task.coins}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB: CBT EXERCISES ── */}
        {activeTab === 'exercises' && (
          <motion.div key="exercises" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
            <div style={{ marginBottom: '12px' }}>
              <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Evidence-Based Tools</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Tap any exercise to start a guided, step-by-step walkthrough.</p>
            </div>
            {CBT_EXERCISES.map(ex => (
              <ExerciseCard
                key={ex.id}
                ex={ex}
                expanded={expandedEx === ex.id}
                onToggle={() => setExpandedEx(expandedEx === ex.id ? null : ex.id)}
              />
            ))}
          </motion.div>
        )}

        {/* ── TAB: JOURNEYS ── */}
        {activeTab === 'journeys' && (
          <motion.div key="journeys" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Wellness Journeys</h2>
            <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '14px' }}>Structured multi-day paths to long-term mental clarity.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {JOURNEYS.map(j => (
                <div key={j.id} style={{
                  background: 'white', borderRadius: '18px', padding: '20px 24px',
                  border: `1.5px solid ${j.locked ? '#e2e8f0' : j.color + '40'}`,
                  opacity: j.locked ? 0.6 : 1,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>{j.title}</h4>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>{j.desc}</p>
                    </div>
                    {j.locked
                      ? <span style={{ background: '#f1f5f9', color: '#94a3b8', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>🔒 Locked</span>
                      : <span style={{ background: j.color + '20', color: j.color, padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>DAY {j.day}/{j.total}</span>
                    }
                  </div>
                  {!j.locked && (
                    <>
                      <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', marginBottom: '14px' }}>
                        <div style={{ width: `${(j.day / j.total) * 100}%`, height: '100%', background: j.color, borderRadius: '3px', transition: 'width 0.8s ease' }} />
                      </div>
                      <button style={{ padding: '10px 22px', borderRadius: '12px', border: 'none', background: j.color, color: 'white', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                        Resume Journey →
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AICoach;