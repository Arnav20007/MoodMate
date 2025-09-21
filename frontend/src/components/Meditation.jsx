// src/components/Meditation.jsx
import React from "react";
import "./Meditation.css";

function Meditation() {
  const sessions = [
    { id: 1, title: "5-Min Relaxation", duration: "5 min" },
    { id: 2, title: "Deep Focus", duration: "10 min" },
    { id: 3, title: "Stress Relief", duration: "15 min" },
    { id: 4, title: "Sleep Prep", duration: "20 min" },
  ];

  return (
    <div className="meditation-container">
      <h2>🧘 Guided Meditations</h2>
      <p>Find calm and balance with guided sessions</p>
      <div className="meditation-grid">
        {sessions.map((s) => (
          <div key={s.id} className="meditation-card">
            <h3>{s.title}</h3>
            <p>{s.duration}</p>
            <button className="start-btn">Start</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Meditation;
