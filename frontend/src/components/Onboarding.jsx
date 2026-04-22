import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Onboarding.css';

const SLIDES = [
  {
    id: 1,
    title: 'A calmer place to check in',
    text: 'MoodMate helps you notice your emotional patterns, reflect without pressure, and build steadier daily habits.',
    eyebrow: 'Private by default',
    accent: 'Reflect',
    stats: ['Daily check-ins', 'Gentle guidance'],
  },
  {
    id: 2,
    title: 'Support that fits the moment',
    text: 'Talk with the AI companion, use grounding tools, or move into a focused support space when you need more than a chat.',
    eyebrow: 'Tools that help',
    accent: 'Support',
    stats: ['Chat and tools', 'Community and therapy'],
  },
  {
    id: 3,
    title: 'Built for progress, not pressure',
    text: 'Small actions count here. Come back regularly, track what helps, and let your care routine become something you can trust.',
    eyebrow: 'One steady step',
    accent: 'Grow',
    stats: ['Progress tracking', 'Premium depth when ready'],
  },
];

function Onboarding({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const skipOnboarding = () => onComplete();
  const slide = SLIDES[currentSlide];

  return (
    <div className="onboarding-overlay">
      <motion.div
        key={currentSlide}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -18, scale: 0.98 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="onboarding-card"
      >
        <button className="onboarding-skip" onClick={skipOnboarding}>
          Skip
        </button>

        <div className="onboarding-progress">
          {SLIDES.map((_, index) => (
            <div key={index} className={`progress-dot ${index <= currentSlide ? 'active' : ''}`} />
          ))}
        </div>

        <div className="onboarding-visual">
          <div className="onboarding-visual-orb onboarding-visual-orb-main" />
          <div className="onboarding-visual-orb onboarding-visual-orb-secondary" />
          <div className="onboarding-accent-chip">{slide.accent}</div>
        </div>

        <div className="onboarding-copy">
          <span className="onboarding-eyebrow">{slide.eyebrow}</span>
          <h2>{slide.title}</h2>
          <p>{slide.text}</p>
        </div>

        <div className="onboarding-stats">
          {slide.stats.map((item) => (
            <div key={item} className="onboarding-stat-pill">
              {item}
            </div>
          ))}
        </div>

        <div className="onboarding-actions">
          <button className="onboarding-btn" onClick={nextSlide}>
            {currentSlide === SLIDES.length - 1 ? 'Enter MoodMate' : 'Continue'}
          </button>
          <div className="onboarding-step-note">
            Step {currentSlide + 1} of {SLIDES.length}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Onboarding;
