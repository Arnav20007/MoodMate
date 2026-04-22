import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './SleepCompanion.css';

const SOUNDSCAPES = [
  { id: 'rain', icon: 'Rain', title: 'Midnight Delta', freq: '432 Hz - Deep Sleep', hz: 432 },
  { id: 'space', icon: 'Space', title: 'Deep Space', freq: '174 Hz - Low Tension', hz: 174 },
  { id: 'ocean', icon: 'Ocean', title: 'Night Ocean', freq: '528 Hz - Soft Reset', hz: 528 },
  { id: 'fire', icon: 'Fire', title: 'Distant Fire', freq: '114 Hz - Binaural Base', hz: 114 },
  { id: 'wind', icon: 'Wind', title: 'Forest Wind', freq: '285 Hz - Recovery', hz: 285 },
  { id: 'bowl', icon: 'Bowl', title: 'Tibetan Bowls', freq: '396 Hz - Letting Go', hz: 396 },
];

const STORIES = [
  {
    id: 1,
    title: 'Journey to the Orion Nebula',
    desc: 'A quiet voice-led drift through the stars to slow racing thoughts.',
    duration: '24 min',
    narrator: 'Aurora',
    icon: 'Stars',
  },
  {
    id: 2,
    title: 'The Midnight Library',
    desc: 'Rain taps on the windows while you wander deeper into a calm imagined world.',
    duration: '18 min',
    narrator: 'Silas',
    icon: 'Library',
  },
  {
    id: 3,
    title: 'Cabin in the Snow',
    desc: 'A warm and quiet snowbound retreat designed to help your body finally unclench.',
    duration: '32 min',
    narrator: 'Elara',
    icon: 'Snow',
  },
];

function SleepCompanionModal({ user, onClose, onUpgradeClick }) {
  const [activeSound, setActiveSound] = useState(null);
  const [activeStory, setActiveStory] = useState(null);
  const [breathPhase, setBreathPhase] = useState('Breathe In');
  const [audioCtx, setAudioCtx] = useState(null);
  const [oscillator, setOscillator] = useState(null);

  useEffect(() => {
    return () => {
      if (oscillator) oscillator.stop();
      window.speechSynthesis.cancel();
    };
  }, [oscillator]);

  useEffect(() => {
    const phases = [
      { text: 'Breathe In', dur: 4000 },
      { text: 'Hold', dur: 7000 },
      { text: 'Exhale Slowly', dur: 8000 },
    ];

    let currentIdx = 0;
    let timeout;

    const cycleBreath = () => {
      setBreathPhase(phases[currentIdx].text);
      timeout = setTimeout(() => {
        currentIdx = (currentIdx + 1) % phases.length;
        cycleBreath();
      }, phases[currentIdx].dur);
    };

    cycleBreath();
    return () => clearTimeout(timeout);
  }, []);

  const toggleSound = (soundObj) => {
    window.speechSynthesis.cancel();
    setActiveStory(null);

    if (activeSound === soundObj.id) {
      setActiveSound(null);
      if (oscillator) {
        oscillator.stop();
        setOscillator(null);
      }
      return;
    }

    setActiveSound(soundObj.id);
    if (oscillator) oscillator.stop();

    try {
      const ctx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (!audioCtx) setAudioCtx(ctx);

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(soundObj.hz, ctx.currentTime);
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 3);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      setOscillator(osc);
    } catch (error) {
      console.error('Audio block', error);
    }
  };

  const toggleStory = (story) => {
    if (oscillator) {
      oscillator.stop();
      setOscillator(null);
    }
    setActiveSound(null);
    window.speechSynthesis.cancel();

    if (activeStory === story.id) {
      setActiveStory(null);
      return;
    }

    setActiveStory(story.id);
    const narration = new SpeechSynthesisUtterance(
      `Welcome to your sleep story: ${story.title}. ${story.desc}. Close your eyes, breathe slowly, and let your body grow heavier.`
    );

    const voices = window.speechSynthesis.getVoices();
    const calmVoice = voices.find(
      (voice) =>
        voice.name.includes('Female') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Google UK English Female')
    );
    if (calmVoice) narration.voice = calmVoice;

    narration.rate = 0.7;
    narration.pitch = 0.7;
    narration.onend = () => setActiveStory(null);
    window.speechSynthesis.speak(narration);
  };

  if (!user.is_premium) {
    return (
      <div className="modal-overlay sleep-overlay" onClick={onClose}>
        <div className="premium-upsell-box sleep-upsell-box" onClick={(event) => event.stopPropagation()}>
          <button className="sleep-close" onClick={onClose}>
            Close
          </button>
          <div className="sleep-upsell-icon">Night</div>
          <h3>Unlock Deep Sleep</h3>
          <p>
            Premium gives you calming sleep stories, layered soundscapes, and the guided breathing orb built for slower nights.
          </p>
          <button onClick={onUpgradeClick} className="upgrade-btn sleep-upgrade-btn">
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sleep-overlay" onClick={onClose}>
      <motion.div
        className="sleep-modal"
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="sleep-header">
          <div>
            <span className="sleep-kicker">Night routine</span>
            <h2>Deep Sleep Companion</h2>
            <p>Wind the nervous system down with soft sound, guided breath, and quiet bedtime stories.</p>
          </div>
          <button onClick={onClose} className="sleep-close">
            Close
          </button>
        </div>

        <div className="sleep-orb-container">
          <motion.div
            className="sleep-orb"
            animate={{
              scale: breathPhase.includes('In') ? 1.6 : breathPhase.includes('Hold') ? 1.6 : 0.8,
              opacity: breathPhase.includes('In') ? 0.82 : breathPhase.includes('Hold') ? 0.54 : 0.34,
            }}
            transition={{
              duration: breathPhase.includes('In') ? 4 : breathPhase.includes('Hold') ? 7 : 8,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            key={breathPhase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="orb-text"
          >
            {breathPhase}
          </motion.div>
        </div>

        <div className="sleep-section">
          <div className="sleep-section-head">
            <h3>Ambient Frequencies</h3>
            <span>Tap one to play a low, steady tone.</span>
          </div>
          <div className="soundscapes-grid">
            {SOUNDSCAPES.map((sound, index) => (
              <motion.button
                key={sound.id}
                className={`soundscape-card ${activeSound === sound.id ? 'playing' : ''}`}
                onClick={() => toggleSound(sound)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="sound-icon">{sound.icon}</span>
                <span className="sound-title">{sound.title}</span>
                <span className="sound-freq">{sound.freq}</span>
                {activeSound === sound.id && <span className="sound-active-pill">Playing</span>}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="sleep-section">
          <div className="sleep-section-head">
            <h3>Somatic Sleep Stories</h3>
            <span>Choose a gentle voice-led story to wind down.</span>
          </div>
          <div className="stories-list">
            {STORIES.map((story, index) => (
              <motion.div
                key={story.id}
                className={`story-card ${activeStory === story.id ? 'active' : ''}`}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                onClick={() => toggleStory(story)}
              >
                <div className="story-thumb">{story.icon}</div>
                <div className="story-details">
                  <h4>{story.title}</h4>
                  <p>{story.desc}</p>
                  <div className="story-meta">
                    <span>{story.duration}</span>
                    <span>{story.narrator}</span>
                  </div>
                </div>
                <button className="play-btn">{activeStory === story.id ? 'Pause' : 'Play'}</button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default SleepCompanionModal;
