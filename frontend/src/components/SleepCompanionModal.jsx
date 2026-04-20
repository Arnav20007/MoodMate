import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './SleepCompanion.css';

const SOUNDSCAPES = [
    { id: 'rain', icon: '🌧️', title: 'Midnight Delta', freq: '432 Hz - Deep Sleep', hz: 432 },
    { id: 'space', icon: '🌌', title: 'Deep Space', freq: '174 Hz - Pain Relief', hz: 174 },
    { id: 'ocean', icon: '🌊', title: 'Night Ocean', freq: '528 Hz - DNA Repair', hz: 528 },
    { id: 'fire', icon: '🔥', title: 'Distant Fire', freq: '114 Hz - Binaural Base', hz: 114 },
    { id: 'wind', icon: '🍃', title: 'Forest Wind', freq: '285 Hz - Healing', hz: 285 },
    { id: 'bowl', icon: '🥣', title: 'Tibetan Bowls', freq: '396 Hz - Release Fear', hz: 396 }
];

const STORIES = [
    { id: 1, title: 'Journey to the Orion Nebula', desc: 'A deeply relaxing vocal journey gliding through the stars, designed to shut down racing thoughts.', duration: '24 min', narrator: 'Aurora', icon: '🪐' },
    { id: 2, title: 'The Midnight Library', desc: 'Wander through endless aisles of unwritten books while the rain gently taps against the glass roof.', duration: '18 min', narrator: 'Silas', icon: '📚' },
    { id: 3, title: 'Cabin in the Snow', desc: 'A visualization of isolation and warmth deep in a quiet, snowy tundra.', duration: '32 min', narrator: 'Elara', icon: '❄️' }
];

function SleepCompanionModal({ user, onClose, onUpgradeClick }) {
    const [activeSound, setActiveSound] = useState(null);
    const [activeStory, setActiveStory] = useState(null);
    const [breathPhase, setBreathPhase] = useState('Breathe In');
    const [audioCtx, setAudioCtx] = useState(null);
    const [oscillator, setOscillator] = useState(null);

    // Stop all audio cleanly when modal closes
    useEffect(() => {
        return () => {
            if (oscillator) oscillator.stop();
            window.speechSynthesis.cancel();
        };
    }, [oscillator]);

    useEffect(() => {
        // Simple 4-7-8 breathing sequencer
        const phases = [
            { text: 'Breathe In...', dur: 4000 },
            { text: 'Hold...', dur: 7000 },
            { text: 'Exhale Slowly...', dur: 8000 }
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
        window.speechSynthesis.cancel(); // Stop story if playing
        setActiveStory(null);

        if (activeSound === soundObj.id) {
            setActiveSound(null);
            if (oscillator) {
                oscillator.stop();
                setOscillator(null);
            }
        } else {
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
                gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 3); // Slow soothing fade-in
                
                osc.connect(gainNode);
                gainNode.connect(ctx.destination);
                osc.start();
                setOscillator(osc);
            } catch (e) { console.error("Audio block", e); }
        }
    };

    const toggleStory = (story) => {
        if (oscillator) { oscillator.stop(); setOscillator(null); }
        setActiveSound(null);

        window.speechSynthesis.cancel();
        
        if (activeStory === story.id) {
            setActiveStory(null);
            return;
        }
        
        setActiveStory(story.id);
        const textToSpeech = new SpeechSynthesisUtterance(`Welcome to your somatic sleep story: ${story.title}. Take a deep breath. ${story.desc}. Close your eyes, and let go.`);
        
        // Optimize for a soothing sleep voice
        const voices = window.speechSynthesis.getVoices();
        const calmVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google UK English Female'));
        if (calmVoice) textToSpeech.voice = calmVoice;
        
        textToSpeech.rate = 0.7; // extremely slow
        textToSpeech.pitch = 0.7; // deep and grounding
        
        textToSpeech.onend = () => setActiveStory(null);
        window.speechSynthesis.speak(textToSpeech);
    };

    if (!user.is_premium) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="premium-upsell-box" onClick={(e) => e.stopPropagation()}>
                    <button className="close-btn" onClick={onClose}>×</button>
                    <div className="lock-icon" style={{ fontSize: '50px', marginBottom: '15px' }}>🌙</div>
                    <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>Unlock Deep Sleep</h3>
                    <p style={{ color: '#64748b', marginBottom: '25px', lineHeight: 1.5 }}>
                        Drift off to sleep with our premium collection of calming bedtime stories, 
                        binaural beats, and the legendary 4-7-8 deep relaxation orb. Available only for Premium members.
                    </p>
                    <button onClick={onUpgradeClick} className="upgrade-btn" style={{ padding: '15px 30px', fontSize: '18px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', width: '100%' }}>✨ Upgrade to Premium</button>
                </div>
            </div>
        );
    }

    return (
        <div className="sleep-overlay" onClick={onClose}>
            <motion.div 
                className="sleep-modal" 
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                <div className="sleep-header">
                    <div>
                        <h2>🌙 Deep Sleep Companion</h2>
                        <p>Shut down your nervous system with neuro-acoustic landscapes and visual breathing algorithms.</p>
                    </div>
                    <button onClick={onClose} className="sleep-close">✕</button>
                </div>

                {/* Visual Breathing Orb */}
                <div className="sleep-orb-container">
                    <motion.div 
                        className="sleep-orb"
                        animate={{ 
                            scale: breathPhase.includes('In') ? 1.6 : breathPhase.includes('Hold') ? 1.6 : 0.8,
                            opacity: breathPhase.includes('In') ? 0.8 : breathPhase.includes('Hold') ? 0.5 : 0.3
                        }}
                        transition={{ 
                            duration: breathPhase.includes('In') ? 4 : breathPhase.includes('Hold') ? 7 : 8,
                            ease: "easeInOut" 
                        }}
                    />
                    <motion.div 
                        key={breathPhase}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        className="orb-text"
                    >
                        {breathPhase}
                    </motion.div>
                </div>

                {/* Soundscapes Grid */}
                <div className="sleep-section">
                    <h3>🎧 Ambient Frequencies</h3>
                    <div className="soundscapes-grid">
                        {SOUNDSCAPES.map((sound, i) => (
                            <motion.div 
                                key={sound.id}
                                className={`soundscape-card ${activeSound === sound.id ? 'playing' : ''}`}
                                onClick={() => toggleSound(sound)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="sound-icon">{sound.icon}</span>
                                <span className="sound-title">{sound.title}</span>
                                <span className="sound-freq">{sound.freq}</span>
                                {activeSound === sound.id && (
                                    <motion.div 
                                        animate={{ height: ["5px", "15px", "5px"] }} 
                                        transition={{ repeat: Infinity, duration: 1 }}
                                        style={{ width: "20px", background: "linear-gradient(130deg, #818cf8, #c4b5fd)", borderRadius: "10px", marginTop: "10px" }}
                                    />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Sleep Stories */}
                <div className="sleep-section">
                    <h3>📖 Somatic Sleep Stories</h3>
                    <div className="stories-list">
                        {STORIES.map((story, i) => (
                            <motion.div 
                                key={story.id} 
                                className="story-card"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.15 }}
                                onClick={() => toggleStory(story)}
                                style={{ border: activeStory === story.id ? '1px solid #818cf8' : '', background: activeStory === story.id ? 'rgba(99, 102, 241, 0.15)' : '' }}
                            >
                                <div className="story-thumb">{story.icon}</div>
                                <div className="story-details">
                                    <h4>{story.title}</h4>
                                    <p>{story.description || story.desc}</p>
                                    <div className="story-meta">
                                        <span>⏱️ {story.duration}</span>
                                        <span>🎙️ {story.narrator}</span>
                                    </div>
                                </div>
                                <button className="play-btn" style={{ background: activeStory === story.id ? '#f43f5e' : '#6366f1' }}>
                                    {activeStory === story.id ? '⏸' : '▶'}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
                
            </motion.div>
        </div>
    );
}

export default SleepCompanionModal;
