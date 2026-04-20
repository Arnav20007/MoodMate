import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Onboarding.css';

const SLIDES = [
  {
    id: 1,
    title: "Welcome to MoodMate",
    text: "MoodMate is your AI companion that understands your emotions.",
    icon: "✨",
    color: "#4F46E5"
  },
  {
    id: 2,
    title: "Talk freely, feel better",
    text: "Talk freely, track your mood, and feel better daily.",
    icon: "🤝",
    color: "#8B5CF6"
  },
  {
    id: 3,
    title: "Let's begin together",
    text: "Come back daily, have fun, feel better, and we’ll heal together.",
    icon: "🔥",
    color: "#f43f5e"
  }
];

function Onboarding({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <div className="onboarding-overlay">
      <motion.div 
        key={currentSlide}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="onboarding-card"
        style={{ '--accent': slide.color }}
      >
        <div className="onboarding-progress">
          {SLIDES.map((_, i) => (
            <div key={i} className={`progress-dot ${i <= currentSlide ? 'active' : ''}`} />
          ))}
        </div>
        
        <div className="onboarding-icon">{slide.icon}</div>
        <h2>{slide.title}</h2>
        <p>{slide.text}</p>
        
        <button className="onboarding-btn" onClick={nextSlide}>
          {currentSlide === SLIDES.length - 1 ? 'Start Healing →' : 'Next'}
        </button>
      </motion.div>
    </div>
  );
}

export default Onboarding;
