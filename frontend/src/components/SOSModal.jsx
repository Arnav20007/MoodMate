import React, { useState } from 'react';
import './SOSModal.css';

const SOSModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const helplines = [
    { name: "Emergency Services", number: "112", desc: "For immediate physical danger or medical emergencies." },
    { name: "KIRAN Helpline", number: "1800-599-0019", desc: "Government of India's 24/7 mental health rehabilitation line." },
    { name: "AASRA", number: "+91-9820466726", desc: "24/7 suicide prevention and emotional support." },
    { name: "Vandrevala Foundation", number: "9999666555", desc: "Mental health support via call or WhatsApp." },
  ];

  return (
    <div className="sos-overlay" onClick={onClose}>
      <div className="sos-modal" onClick={e => e.stopPropagation()}>
        <div className="sos-header">
          <div className="sos-icon">🆘</div>
          <h2>Emergency Support</h2>
          <p>Please reach out if you are feeling unsafe or in immediate distress. You are not alone.</p>
        </div>

        <div className="sos-body">
          <div className="sos-grid">
            {helplines.map((help, idx) => (
              <div key={idx} className="sos-item">
                <div className="sos-item-info">
                  <h3>{help.name}</h3>
                  <p>{help.desc}</p>
                </div>
                <a href={`tel:${help.number}`} className="sos-call-btn">
                  <span>📞</span> {help.number}
                </a>
              </div>
            ))}
          </div>

          <div className="sos-action-plan">
            <h4>Quick Safety Steps:</h4>
            <ul>
              <li>Move to a safer space or closer to another person.</li>
              <li>Put distance between yourself and anything you could use to hurt yourself.</li>
              <li>Call a trusted friend or family member right away.</li>
              <li>Keep breathing slowly—we are here when the crisis passes.</li>
            </ul>
          </div>
        </div>

        <button className="sos-close-btn" onClick={onClose}>Close and Stay Safe</button>
      </div>
    </div>
  );
};

export default SOSModal;
