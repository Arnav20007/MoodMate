import React, { useState, useEffect, useRef } from 'react';
import './BreathingExercise.css'; // We will create this new CSS file

// Audio cues (replace with your own high-quality sounds if you have them)
const inhaleSound = new Audio('https://www.soundjay.com/buttons/sounds/button-16.mp3');
const exhaleSound = new Audio('https://www.soundjay.com/buttons/sounds/button-20.mp3');

const exercises = {
  calm: { name: 'Calm Breathing', timings: { inhale: 4000, hold: 7000, exhale: 8000 } },
  box: { name: 'Box Breathing', timings: { inhale: 4000, hold: 4000, exhale: 4000, hold_out: 4000 } }
};

function BreathingExercise({ onClose }) {
  const [isIntro, setIsIntro] = useState(true);
  const [phase, setPhase] = useState('ready'); // ready, inhale, hold, exhale, hold_out
  const [timer, setTimer] = useState(60);
  const [selectedExercise, setSelectedExercise] = useState(exercises.calm);
  const [selectedDuration, setSelectedDuration] = useState(60);

  const timerRef = useRef(null);
  const phaseTimerRef = useRef(null);

  useEffect(() => {
    if (!isIntro) {
      // Start the countdown timer for the session
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            stopExercise();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      runCycle(); // Start the first breathing cycle
    }
    return () => { // Cleanup function
      clearInterval(timerRef.current);
      clearTimeout(phaseTimerRef.current);
    };
  }, [isIntro]);

  const runCycle = () => {
    const { inhale, hold, exhale, hold_out } = selectedExercise.timings;

    setPhase('inhale');
    inhaleSound.play();
    phaseTimerRef.current = setTimeout(() => {
      setPhase('hold');
      phaseTimerRef.current = setTimeout(() => {
        setPhase('exhale');
        exhaleSound.play();
        if (hold_out) { // For Box Breathing
          phaseTimerRef.current = setTimeout(() => {
            setPhase('hold_out');
            phaseTimerRef.current = setTimeout(runCycle, hold_out);
          }, exhale);
        } else {
          phaseTimerRef.current = setTimeout(runCycle, exhale);
        }
      }, hold);
    }, inhale);
  };

  const stopExercise = () => {
    clearTimeout(phaseTimerRef.current);
    clearInterval(timerRef.current);
    setPhase('finished');
    setTimeout(onClose, 3000); // Close modal after a delay
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In...';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out...';
      case 'hold_out': return 'Hold';
      case 'finished': return 'Well done.';
      default: return 'Ready?';
    }
  };

  if (isIntro) {
    return (
      <div className="breathing-overlay">
        <div className="breathing-setup">
          <h2>Breathing Exercise</h2>
          <div className="setup-option">
            <label>Technique</label>
            <select onChange={(e) => setSelectedExercise(exercises[e.target.value])}>
              <option value="calm">Calm (4-7-8)</option>
              <option value="box">Box Breathing (4-4-4-4)</option>
            </select>
          </div>
          <div className="setup-option">
            <label>Duration</label>
            <select onChange={(e) => setSelectedDuration(parseInt(e.target.value))}>
              <option value={60}>1 Minute</option>
              <option value={180}>3 Minutes</option>
              <option value={300}>5 Minutes</option>
            </select>
          </div>
          <button className="start-breathing-btn" onClick={() => { setTimer(selectedDuration); setIsIntro(false); }}>Start</button>
          <button className="close-breathing-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="breathing-overlay">
      <div className={`breathing-visualizer ${phase}`}>
        <div className="breathing-circle"></div>
        <p className="breathing-text">{getPhaseText()}</p>
      </div>
      <div className="breathing-timer">{formatTime(timer)}</div>
      <button className="close-breathing-btn" onClick={stopExercise}>End Session</button>
    </div>
  );
}

export default BreathingExercise;