import React, { useState, useEffect } from 'react';
import './Meditation.css';

const SESSIONS = [
  {
    id: 1, emoji: '🌅', title: 'Morning Clarity', duration: '5 min', category: 'Focus',
    description: 'Start your day with intention. A gentle, guided awakening practice.',
    script: ['Find a comfortable seat. Close your eyes and take 3 deep breaths.',
             'Imagine warm sunlight filling your body from head to toe.',
             'Set one small intention for today. Hold it gently in your mind.',
             'Breathe in confidence. Breathe out doubt. You are ready for this day.'],
    color: '#F59E0B', preview: 'linear-gradient(135deg, #FCD34D, #F97316)',
  },
  {
    id: 2, emoji: '🌊', title: 'Anxiety Relief', duration: '10 min', category: 'Calm',
    description: 'Dissolve tension and anxiety with ocean wave visualizations.',
    script: ['Sit comfortably. Feel your feet flat on the ground.',
             'Imagine you are sitting on a calm beach. Waves roll in and out.',
             'Each inhale brings cool, calm water. Each exhale washes away all worry.',
             'Your anxiety is like foam on the shoreline — temporary and disappearing.',
             'You are safe. You are grounded. The ocean is vast and you are peaceful.'],
    color: '#3B82F6', preview: 'linear-gradient(135deg, #60A5FA, #06B6D4)',
  },
  {
    id: 3, emoji: '🌿', title: 'Forest Healing', duration: '12 min', category: 'Heal',
    description: 'Immerse yourself in the healing power of a Japanese forest bath.',
    script: ['Close your eyes and imagine stepping onto a soft forest path.',
             'Inhale the scent of pine and earth. Feel the cool, filtered light.',
             'With every step, you leave behind what weighs on you.',
             'The trees absorb your stress. The roots hold you steady.',
             'You belong to nature. Nature holds you. You are whole.'],
    color: '#10B981', preview: 'linear-gradient(135deg, #34D399, #059669)',
  },
  {
    id: 4, emoji: '✨', title: 'Self-Compassion', duration: '8 min', category: 'Heal',
    description: 'Speak kindness to yourself the way you would to a dear friend.',
    script: ['Place your hand on your heart. Feel it beating — alive and strong.',
             'Say quietly: "May I be happy. May I be healthy. May I be at peace."',
             'Think of a struggle you carry. Acknowledge it without judgment.',
             'You are not alone. Every human being knows difficulty.',
             'With each breath, let kindness grow in the center of your chest.'],
    color: '#EC4899', preview: 'linear-gradient(135deg, #F472B6, #8B5CF6)',
  },
  {
    id: 5, emoji: '🌙', title: 'Deep Sleep Prep', duration: '15 min', category: 'Sleep',
    description: 'Progressive muscle relaxation to guide you into effortless sleep.',
    script: ['Lie down. Close your eyes. There is nothing to do, nowhere to be.',
             'Tense your feet tightly for 5 seconds... then release completely.',
             'Move up to your calves... tense... and release.',
             'Your body is getting heavier and warmer with each breath.',
             'Your mind is a quiet lake at night. Still. Dark. Perfect. Sleep.'],
    color: '#6366F1', preview: 'linear-gradient(135deg, #818CF8, #312E81)',
  },
  {
    id: 6, emoji: '⚡', title: 'Power Focus', duration: '7 min', category: 'Focus',
    description: 'Achieve laser-sharp focus using mindful attention training.',
    script: ['Sit up straight. Place your hands on your thighs. Breathe normally.',
             'Choose one word that represents your goal. Repeat it silently.',
             'When your mind wanders, smile gently and return to your word.',
             'Each return strengthens the muscle of focus. You are training.',
             'Your attention is your most powerful tool. Aim it clearly.'],
    color: '#F43F5E', preview: 'linear-gradient(135deg, #FB7185, #E11D48)',
  },
  {
    id: 7, emoji: '🙏', title: 'Gratitude Body Scan', duration: '10 min', category: 'Heal',
    description: 'Move through each part of your body, thanking it for its service.',
    script: ['Begin at your feet. Thank them for carrying you through every day.',
             'Move to your hands. Thank them for creating and connecting.',
             'Settle at your heart. Feel gratitude for this life, this breath.',
             'Three things you are grateful for today — let them fill you completely.',
             'Breathe in love for this imperfect, beautiful life.'],
    color: '#14B8A6', preview: 'linear-gradient(135deg, #2DD4BF, #0891B2)',
  },
  {
    id: 8, emoji: '☁️', title: 'Thought Detachment', duration: '12 min', category: 'Focus',
    description: 'Learn to observe your thoughts without being controlled by them.',
    script: ['Imagine your mind is a clear blue sky.',
             'Thoughts are clouds — they arise, pass through, and disappear.',
             'You are not your thoughts. You are the vast sky that holds them.',
             'Let each thought float by without grabbing on.',
             'More clarity arrives as you stop fighting what passes through.'],
    color: '#64748B', preview: 'linear-gradient(135deg, #94A3B8, #475569)',
  },
];

const MULTI_DAY_COURSES = [
  {
    id: 'c1',
    title: '7 Days to Deep Sleep',
    instructor: 'Dr. Sanjay Reddy',
    days: 7,
    completedDays: 2,
    color: 'linear-gradient(135deg, #312E81, #1E1B4B)',
    accent: '#818CF8',
    description: 'A structured clinical protocol to rebuild your circadian rhythm and overcome insomnia.'
  },
  {
    id: 'c2',
    title: 'Overcoming Imposter Syndrome',
    instructor: 'Dr. Priya Sharma',
    days: 14,
    completedDays: 0,
    color: 'linear-gradient(135deg, #831843, #4C1D95)',
    accent: '#F472B6',
    description: '14 days of cognitive restructuring to build unshakeable workplace confidence.'
  }
];

const CATEGORIES = ['All', 'Focus', 'Calm', 'Heal', 'Sleep'];

function Meditation() {
  const [filter, setFilter] = useState('All');
  const [activeSession, setActiveSession] = useState(null);
  const [scriptLine, setScriptLine] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [done, setDone] = useState(false);

  const filtered = filter === 'All' ? SESSIONS : SESSIONS.filter(s => s.category === filter);

  const startSession = (session) => {
    const mins = parseInt(session.duration);
    setActiveSession(session);
    setScriptLine(0);
    setSecondsLeft(mins * 60);
    setIsPlaying(true);
    setDone(false);
  };

  useEffect(() => {
    if (!isPlaying || !activeSession) return;
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsPlaying(false);
          setDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Advance script line every 15 seconds
    const lineInterval = setInterval(() => {
      setScriptLine(prev => {
        const maxLines = activeSession.script.length - 1;
        return prev < maxLines ? prev + 1 : prev;
      });
    }, 15000);

    return () => { clearInterval(timer); clearInterval(lineInterval); };
  }, [isPlaying, activeSession]);

  const formatTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (done && activeSession) {
    return (
      <div className="med-fullscreen" style={{ background: activeSession.preview }}>
        <div className="med-done-card">
          <div className="med-done-emoji">🙏</div>
          <h2>Session Complete</h2>
          <h3>{activeSession.title}</h3>
          <p>You just gave your mind {activeSession.duration} of pure peace. This is real self-care.</p>
          <button className="med-btn-primary" onClick={() => setActiveSession(null)}>Browse More</button>
        </div>
      </div>
    );
  }

  if (activeSession && isPlaying) {
    const progress = ((parseInt(activeSession.duration) * 60 - secondsLeft) / (parseInt(activeSession.duration) * 60)) * 100;
    return (
      <div className="med-fullscreen" style={{ background: activeSession.preview }}>
        <button className="med-back-btn" onClick={() => { setIsPlaying(false); setActiveSession(null); }}>← Back</button>
        <div className="med-session-box">
          <div className="med-session-emoji">{activeSession.emoji}</div>
          <h2 className="med-session-title">{activeSession.title}</h2>
          <div className="med-script-line">
            <p className="med-script-text">"{activeSession.script[scriptLine]}"</p>
          </div>
          <div className="med-timer-ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="rgba(0,0,0,0.2)" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke="white" strokeWidth="8"
                strokeDasharray={`${339 * progress / 100} 339`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="med-timer-text">{formatTime(secondsLeft)}</div>
          </div>
          <div className="med-script-dots">
            {activeSession.script.map((_, i) => (
              <div key={i} className={`med-dot ${i === scriptLine ? 'active' : i < scriptLine ? 'done' : ''}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="meditation-container">
      <div className="med-header">
        <h2>🧘 Guided Meditations & Journeys</h2>
        <p>Structured clinical protocols and science-backed sessions for a calmer, sharper mind</p>
      </div>

      <div className="courses-section" style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#0f172a' }}>Masterclasses</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {MULTI_DAY_COURSES.map(course => {
            const progress = (course.completedDays / course.days) * 100;
            return (
              <div key={course.id} style={{ background: course.color, padding: '24px', borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', backdropFilter: 'blur(10px)' }}>
                      {course.days}-Day Course
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '600', opacity: 0.8 }}>{course.instructor}</span>
                  </div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '800', lineHeight: 1.3 }}>{course.title}</h4>
                  <p style={{ margin: '0 0 20px 0', fontSize: '13.5px', opacity: 0.8, lineHeight: 1.5 }}>{course.description}</p>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', fontWeight: '700' }}>
                      <span>Day {course.completedDays + 1} Unlocked</span>
                      <span>{Math.round(progress)}% Complete</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px' }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: course.accent, borderRadius: '3px', boxShadow: `0 0 10px ${course.accent}` }} />
                    </div>
                  </div>
                  
                  <button style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'white', border: 'none', color: '#0f172a', fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    {course.completedDays === 0 ? 'Start Course' : `Continue — Day ${course.completedDays + 1}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini Feature 10: EMDR Bilateral Stimulation Toggle */}
      <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '16px 20px', borderRadius: '16px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '24px', background: 'white', border: '1px solid #e2e8f0', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>🎧</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>EMDR Bilateral Tracking</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Pan guided audio between left/right ear to accelerate processing.</div>
          </div>
        </div>
        <button style={{ padding: '8px 16px', borderRadius: '20px', background: 'white', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.innerHTML = '✓ Activated'; alert('EMDR Bilateral Audio Panning is now globally active for all sessions.'); }}>
          Enable Pan
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Standalone Sessions</h3>
      </div>
      <div className="med-filter-row">
        {CATEGORIES.map(cat => (
          <button key={cat} className={`med-filter-btn ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>
            {cat}
          </button>
        ))}
      </div>

      <div className="med-grid">
        {filtered.map(session => (
          <div key={session.id} className="med-card" style={{ '--preview': session.preview }}>
            <div className="med-card-top" style={{ background: session.preview }}>
              <span className="med-card-emoji">{session.emoji}</span>
              <span className="med-card-cat">{session.category}</span>
            </div>
            <div className="med-card-body">
              <h3>{session.title}</h3>
              <p>{session.description}</p>
              <div className="med-card-footer">
                <span className="med-duration">⏱ {session.duration}</span>
                <button className="med-play-btn" style={{ background: session.preview }} onClick={() => startSession(session)}>
                  ▶ Begin
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Meditation;
