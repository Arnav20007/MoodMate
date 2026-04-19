import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AICoach.css';

const TABS = [
  { id: 'dashboard', label: 'Wellbeing Hub', icon: '🌱' },
  { id: 'journeys', label: 'Mental Journeys', icon: '🏔️' },
  { id: 'directives', label: 'Gentle Care Plan', icon: '✨' },
  { id: 'analytics', label: 'Your Journey', icon: '📈' }
];

const DIRECTIVES = [
  { id: 1, title: 'CBT Thought Record', description: 'Deconstruct a stressful thought by identifying cognitive distortions and finding balanced perspectives.', icon: '🧠', difficulty: 'Clinical' },
  { id: 2, title: 'Grounding (5-4-3-2-1)', description: 'Quickly reconnect with the present when feeling overwhelmed using your five senses.', icon: '🖐️', difficulty: 'Instant' },
  { id: 3, title: 'Values Alignment', description: 'Identify if your recent actions align with your core values to reduce internal friction.', icon: '⚖️', difficulty: 'Deep' },
  { id: 4, title: 'Behavioral Activation', description: 'Commit to one small, low-effort task that increases a sense of accomplishment.', icon: '✅', difficulty: 'Action' }
];

function AICoachModal({ user, onClose }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [systemLog, setSystemLog] = useState("");

  useEffect(() => {
    // Futuristic typing effect for the system feed
    const msgs = [
      "Gathering your latest wellness data...",
      "Tuning into your relaxation patterns...",
      "Softening the digital space for you...",
      "Your Wellness Companion is ready. Let's focus on feeling better."
    ];
    let i = 0;
    const interval = setInterval(() => {
      setSystemLog(msgs[i]);
      i = i < msgs.length - 1 ? i + 1 : i;
      if(i === msgs.length - 1) clearInterval(interval);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ai-overlay-beast" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="ai-beast-modal" 
        onClick={e => e.stopPropagation()}
      >
        
        {/* HEADER */}
        <div className="ai-beast-header">
          <div className="ai-header-content">
            <div className="ai-core-spinner">
              <div className="core-ring r1"></div>
              <div className="core-ring r2"></div>
              <div className="core-center"></div>
            </div>
            <div className="ai-title">
              <h2>Wellness Companion</h2>
              <p>Your gentle guide to mental clarity</p>
            </div>
          </div>
          <button className="ai-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* BODY */}
        <div className="ai-beast-body">
          {/* SIDEBAR */}
          <div className="ai-sidebar">
            {TABS.map(t => (
              <button 
                key={t.id} 
                className={`ai-nav-item ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>

          {/* MAIN CONTENT */}
          <div className="ai-content-area">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div 
                   key="dash"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   transition={{ duration: 0.3 }}
                >
                  <div className="ai-dashboard-grid">
                    
                    {/* Billion-Dollar Feature: AI Contextual Memory Vault */}
                    <div className="ai-glass-card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(0,0,0,0))', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '20px' }}>🧠</span> Contextual Memory Vault
                        </h3>
                        <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '4px 10px', borderRadius: '12px', fontWeight: '700', border: '1px solid rgba(16,185,129,0.3)' }}>Active Sync</span>
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px', lineHeight: 1.5 }}>
                        I remember our past conversations. I use this securely encrypted context to provide deeply personalized care patterns.
                      </p>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <span style={{ fontSize: '14px' }}>🏢</span>
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Known Trigger</div>
                            <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>Workplace imposter syndrome</div>
                          </div>
                        </div>
                        
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <span style={{ fontSize: '14px' }}>🌙</span>
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Behavioral Pattern</div>
                            <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>Usually sleeps poorly on Sundays</div>
                          </div>
                        </div>
                        
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <span style={{ fontSize: '14px' }}>🌿</span>
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Effective Coping</div>
                            <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>Responds well to Box Breathing</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bio-States */}
                    <div className="ai-glass-card">
                      <h3>✨ Today's Wellness State</h3>
                      
                      <div className="bio-stat">
                        <div className="bio-header"><span>Feeling a bit tense?</span> <span className="bio-value" style={{color: '#F59E0B'}}>Take a breath</span></div>
                        <div className="bio-bar-bg"><motion.div initial={{width:0}} animate={{width:'75%'}} className="bio-bar-fill" style={{background: '#F59E0B'}} /></div>
                      </div>
                      
                      <div className="bio-stat">
                        <div className="bio-header"><span>Mind Balance</span> <span className="bio-value" style={{color: '#10B981'}}>Good focus</span></div>
                        <div className="bio-bar-bg"><motion.div initial={{width:0}} animate={{width:'90%'}} className="bio-bar-fill" style={{background: '#10B981'}} /></div>
                      </div>
                      
                      <div className="bio-stat">
                        <div className="bio-header"><span>Energy Levels</span> <span className="bio-value">Feeling tired</span></div>
                        <div className="bio-bar-bg"><motion.div initial={{width:0}} animate={{width:'40%'}} className="bio-bar-fill" style={{background: '#38BDF8'}} /></div>
                      </div>
                    </div>

                    {/* Quick Analysis */}
                    <div className="ai-glass-card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(0,0,0,0))', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
                      <h3>🍃 Personal Reflection</h3>
                      <p style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: '15px' }}>
                        It looks like things have been a bit busy lately. Your mind might be carrying a lot right now, and that's okay. 
                        <br/><br/>
                        <b>Suggestion:</b> Perhaps take a short break away from the screen? Even a few minutes of quiet can help clear the fog.
                      </p>
                      <div className="ai-feed-box">
                        <span style={{opacity: 0.7}}>{'>'} </span>
                        <motion.span initial={{opacity:0}} animate={{opacity:1}}>{systemLog}</motion.span>
                        <motion.span animate={{opacity: [0, 1, 0]}} transition={{repeat: Infinity, duration: 0.8}}>_</motion.span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'journeys' && (
                <motion.div 
                   key="journeys"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   transition={{ duration: 0.3 }}
                >
                  <h2 style={{ color: 'white', marginTop: 0, marginBottom: '10px', fontSize: '24px' }}>Wellness Journeys</h2>
                  <p style={{ color: '#94a3b8', marginBottom: '25px' }}>Structured multi-day paths to long-term mental clarity.</p>
                  
                  <div className="ai-dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <div className="ai-glass-card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#8b5cf6', color: 'white', padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '800' }}>DAY 3/7</div>
                      <h4 style={{ color: 'white', fontSize: '18px', marginBottom: '8px' }}>🌊 Managing Anxiety</h4>
                      <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '15px' }}>Identify triggers and build a toolkit for overwhelming moments.</p>
                      <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginBottom: '15px' }}>
                        <div style={{ width: '42%', height: '100%', background: '#8b5cf6', borderRadius: '2px' }}></div>
                      </div>
                      <button style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid #8b5cf6', color: '#a78bfa', fontWeight: 'bold', cursor: 'pointer' }}>Resume Journey</button>
                    </div>

                    <div className="ai-glass-card" style={{ padding: '20px', borderStyle: 'dashed', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.1)', color: '#94a3b8', padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '800' }}>LOCKED</div>
                      <h4 style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px', marginBottom: '8px' }}>🌙 Restorative Sleep</h4>
                      <p style={{ color: 'rgba(148, 163, 184, 0.4)', fontSize: '13px', marginBottom: '15px' }}>Master your circadian rhythm and build an elite bedtime protocol.</p>
                      <button disabled style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'rgba(148, 163, 184, 0.05)', border: '1px solid rgba(148, 163, 184, 0.2)', color: 'rgba(148, 163, 184, 0.3)', fontWeight: 'bold', cursor: 'default' }}>🔒 Starts in 2 Days</button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'directives' && (
                <motion.div 
                   key="directives"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   transition={{ duration: 0.3 }}
                >
                  <h2 style={{ color: 'white', marginTop: 0, marginBottom: '25px', fontSize: '24px' }}>Ways to Unwind</h2>
                  <div className="directive-list">
                    {DIRECTIVES.map((d, i) => (
                      <motion.div 
                        key={d.id} 
                        className="directive-item"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="dir-icon">{d.icon}</div>
                        <div className="dir-content" style={{ flex: 1 }}>
                          <h4>{d.title}</h4>
                          <p>{d.description}</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '12px', fontSize: '12px', color: '#94a3b8', fontWeight: 'bold' }}>
                          {d.difficulty}
                        </div>
                        <button style={{ background: '#38bdf8', border: 'none', padding: '10px 20px', borderRadius: '12px', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer' }}>START</button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'analytics' && (
                <motion.div 
                   key="analytics"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   transition={{ duration: 0.3 }}
                   style={{ textAlign: 'center', paddingTop: '50px' }}
                >
                  <div className="ai-core-spinner" style={{ width: '100px', height: '100px', margin: '0 auto 30px' }}>
                    <div className="core-ring r1" style={{ borderTopColor: '#8b5cf6', borderBottomColor: '#8b5cf6' }}></div>
                    <div className="core-ring r2" style={{ borderLeftColor: '#ec4899', borderRightColor: '#ec4899' }}></div>
                    <div className="core-center" style={{ background: '#8b5cf6', boxShadow: '0 0 30px #8b5cf6' }}></div>
                  </div>
                  <h2 style={{ color: 'white', fontSize: '28px', marginBottom: '15px' }}>Connect Your Journey</h2>
                  <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto', fontSize: '16px', lineHeight: 1.6 }}>
                    To see deeper insights about your sleep and daily activity, you can connect your health app or wearable device. This helps us provide more personalized support for your wellbeing.
                  </p>
                  <button style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', border: 'none', padding: '15px 30px', borderRadius: '30px', color: 'white', fontWeight: 'bold', fontSize: '16px', marginTop: '30px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3)' }}>
                    Connect Device via Bluetooth
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default AICoachModal;