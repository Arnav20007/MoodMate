import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BreathingExercise.css';

const TECHNIQUES = {
  box: {
    name: 'Box Breathing',
    emoji: '🟦',
    description: 'Used by Navy SEALs to stay calm under pressure.',
    color: '#3B82F6',
    benefit: 'Reduces stress & anxiety',
    phases: [
      { key: 'inhale', label: 'Breathe In', duration: 4000 },
      { key: 'hold', label: 'Hold', duration: 4000 },
      { key: 'exhale', label: 'Breathe Out', duration: 4000 },
      { key: 'hold2', label: 'Hold Empty', duration: 4000 },
    ]
  },
  calm478: {
    name: '4-7-8 Calm',
    emoji: '🌙',
    description: 'Dr. Andrew Weil\'s tranquilizer for the nervous system.',
    color: '#8B5CF6',
    benefit: 'Aids sleep & relieves anxiety',
    phases: [
      { key: 'inhale', label: 'Breathe In', duration: 4000 },
      { key: 'hold', label: 'Hold', duration: 7000 },
      { key: 'exhale', label: 'Breathe Out', duration: 8000 },
    ]
  },
  coherent: {
    name: 'Coherent Breathing',
    emoji: '💚',
    description: 'Maximizes Heart Rate Variability (HRV) for peak recovery.',
    color: '#10B981',
    benefit: 'Heart health & deep calm',
    phases: [
      { key: 'inhale', label: 'Slow Inhale', duration: 5000 },
      { key: 'exhale', label: 'Slow Exhale', duration: 5000 },
    ]
  },
  physiologicalSigh: {
    name: 'Physiological Sigh',
    emoji: '😮‍💨',
    description: 'Stanford research: fastest way to reduce stress in 1-2 breaths.',
    color: '#F59E0B',
    benefit: 'Instant stress relief',
    phases: [
      { key: 'inhale', label: 'Short Inhale', duration: 1500 },
      { key: 'inhale2', label: '+ Extra Sniff', duration: 500 },
      { key: 'exhale', label: 'Long Exhale', duration: 6000 },
    ]
  },
  wim478: {
    name: 'Wim Hof Lite',
    emoji: '🔥',
    description: 'Simplified Wim Hof to energize and sharpen focus.',
    color: '#EF4444',
    benefit: 'Energy & mental clarity',
    phases: [
      { key: 'inhale', label: 'Power Inhale', duration: 2000 },
      { key: 'exhale', label: 'Let Go', duration: 2000 },
    ]
  },
  triangle: {
    name: 'Triangle Breathing',
    emoji: '🔺',
    description: 'Simple 3-part breath — beginner-friendly & powerful.',
    color: '#06B6D4',
    benefit: 'Focus & mental clarity',
    phases: [
      { key: 'inhale', label: 'Breathe In', duration: 4000 },
      { key: 'hold', label: 'Hold', duration: 4000 },
      { key: 'exhale', label: 'Breathe Out', duration: 4000 },
    ]
  },
};

function BreathingExercise({ onClose }) {
  const [screen, setScreen] = useState('select'); // select | session | done
  const [selectedKey, setSelectedKey] = useState('box');
  const [duration, setDuration] = useState(120);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseSeconds, setPhaseSeconds] = useState(0);
  const [totalPhaseSec, setTotalPhaseSec] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  const sessionTimer = useRef(null);
  const phaseTimer = useRef(null);
  const technique = TECHNIQUES[selectedKey];

  // Run breathing cycle
  const runPhase = (idx, cycleN) => {
    const phases = TECHNIQUES[selectedKey].phases;
    const phase = phases[idx];
    const phaseDurSec = phase.duration / 1000;
    setPhaseIndex(idx);
    setPhaseSeconds(0);
    setTotalPhaseSec(phaseDurSec);

    let elapsed = 0;
    const tick = setInterval(() => {
      elapsed++;
      setPhaseSeconds(elapsed);
    }, 1000);

    phaseTimer.current = setTimeout(() => {
      clearInterval(tick);
      const nextIdx = (idx + 1) % phases.length;
      const nextCycle = nextIdx === 0 ? cycleN + 1 : cycleN;
      if (nextIdx === 0) setCycleCount(nextCycle);
      runPhase(nextIdx, nextCycle);
    }, phase.duration);
  };

  const startSession = () => {
    setSecondsLeft(duration);
    setScreen('session');
    setPhaseIndex(0);
    setCycleCount(0);

    sessionTimer.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(sessionTimer.current);
          clearTimeout(phaseTimer.current);
          setScreen('done');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    runPhase(0, 0);
  };

  useEffect(() => {
    return () => {
      clearInterval(sessionTimer.current);
      clearTimeout(phaseTimer.current);
    };
  }, []);

  const formatTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const currentPhase = technique.phases[phaseIndex];
  const phaseProgress = totalPhaseSec > 0 ? (phaseSeconds / totalPhaseSec) * 100 : 0;
  const sessionProgress = ((duration - secondsLeft) / duration) * 100;

  if (screen === 'done') {
    return (
      <div className="be-overlay">
        <div className="be-done-card">
          <div className="be-done-emoji">🎉</div>
          <h2>Session Complete!</h2>
          <p>You completed <strong>{cycleCount} cycles</strong> of {technique.name}.</p>
          <p className="be-done-benefit">Your nervous system is calmer. Great job! 💚</p>
          <button className="be-start-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  if (screen === 'session') {
    const isInhale = currentPhase?.key === 'inhale' || currentPhase?.key === 'inhale2';
    const isHold = currentPhase?.key.startsWith('hold');
    
    return (
      <div className="be-overlay" style={{ background: `radial-gradient(circle at center, ${technique.color}15 0%, #060b18 100%)` }}>
        <div className="be-session-container">
          <div className="be-session-top">
            <span className="be-technique-label">{technique.emoji} {technique.name}</span>
            <button className="be-end-btn" onClick={() => { clearInterval(sessionTimer.current); clearTimeout(phaseTimer.current); setScreen('done'); }}>End Session</button>
          </div>

          <div className="be-circle-zone" style={{ height: '400px' }}>
            {/* Ambient Pulse Ring */}
            <motion.div 
               animate={{ scale: isInhale ? 1.4 : isHold ? 1.4 : 0.8 }}
               transition={{ duration: currentPhase?.duration / 1000, ease: "easeInOut" }}
               className="be-ring-outer" 
               style={{ borderColor: `${technique.color}22`, background: `${technique.color}08`, borderWidth: '1px' }} 
            />
            
            {/* Bio-Scaling Core */}
            <motion.div 
              className="be-circle-inner" 
              animate={{ 
                scale: isInhale ? 1.25 : isHold ? 1.25 : 0.85,
                backgroundColor: isHold ? `${technique.color}cc` : technique.color,
                boxShadow: isHold ? `0 0 60px ${technique.color}66` : `0 0 30px ${technique.color}44`
              }}
              transition={{ 
                duration: currentPhase?.duration / 1000, 
                ease: isHold ? "linear" : "easeInOut" 
              }}
              style={{ padding: '40px', textAlign: 'center' }}
            >
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentPhase?.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="be-phase-label"
                  style={{ fontSize: '20px', fontWeight: '800' }}
                >
                  {currentPhase?.label}
                </motion.div>
              </AnimatePresence>
              <div className="be-countdown" style={{ fontSize: '36px', opacity: 0.9 }}>{totalPhaseSec - phaseSeconds}s</div>
            </motion.div>

            {/* Circular Progress Path */}
            <svg className="be-arc-svg" viewBox="0 0 200 200" style={{ width: '320px', height: '320px' }}>
              <circle cx="100" cy="100" r="95" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <motion.circle
                cx="100" cy="100" r="95" fill="none"
                stroke={technique.color} strokeWidth="3"
                strokeDasharray="597"
                initial={{ strokeDashoffset: 597 }}
                animate={{ strokeDashoffset: 597 * (1 - phaseProgress / 100) }}
                transition={{ duration: 0.5 }}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
              />
            </svg>
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <div className="be-stat-row" style={{ justifyContent: 'center', gap: '40px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '15px' }}>
                <span style={{opacity: 0.6, fontSize: '12px', display: 'block'}}>TIME REMAINING</span>
                <span style={{fontSize: '18px'}}>⏱ {formatTime(secondsLeft)}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '15px' }}>
                <span style={{opacity: 0.6, fontSize: '12px', display: 'block'}}>CURRENT CYCLE</span>
                <span style={{fontSize: '18px'}}>🔄 {cycleCount + 1}</span>
              </div>
            </div>

            <div className="be-session-bar" style={{ marginTop: '30px', background: 'rgba(255,255,255,0.03)', height: '4px' }}>
              <motion.div 
                className="be-session-fill" 
                animate={{ width: `${sessionProgress}%` }}
                style={{ background: `linear-gradient(90deg, ${technique.color}, #ffffff)` }} 
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Select screen
  return (
    <div className="be-overlay">
      <div className="be-select-container">
        <div className="be-select-header">
          <h2>🌬️ Breathwork Studio</h2>
          <p>Each technique targets a different mental state. Choose yours.</p>
          <button className="be-close-x" onClick={onClose}>✕</button>
        </div>

        <div className="be-technique-grid">
          {Object.entries(TECHNIQUES).map(([key, tech]) => (
            <div
              key={key}
              className={`be-technique-card ${selectedKey === key ? 'selected' : ''}`}
              onClick={() => setSelectedKey(key)}
              style={{ '--accent': tech.color }}
            >
              <div className="be-tech-icon" style={{ background: tech.color }}>{tech.emoji}</div>
              <div className="be-tech-info">
                <h4>{tech.name}</h4>
                <p className="be-tech-desc">{tech.description}</p>
                <span className="be-tech-benefit">✓ {tech.benefit}</span>
              </div>
              {selectedKey === key && <div className="be-check">✓</div>}
            </div>
          ))}
        </div>

        <div className="be-bottom-bar">
          <div className="be-duration-picker">
            <span>Duration:</span>
            {[60, 120, 300, 600].map(d => (
              <button key={d} className={`be-dur-btn ${duration === d ? 'active' : ''}`} onClick={() => setDuration(d)}>
                {d < 60 ? `${d}s` : `${d / 60}m`}
              </button>
            ))}
          </div>
          <button className="be-start-btn" onClick={startSession}>
            Begin Session →
          </button>
        </div>
      </div>
    </div>
  );
}

export default BreathingExercise;
