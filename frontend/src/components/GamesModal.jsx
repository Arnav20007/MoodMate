import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Games.css';

const gameLibrary = [
    {
        id: 'bubble',
        name: "Zen Pop",
        description: "Pop infinite bubbles to release micro-stress. Satisfying audio and haptics included.",
        icon: "🫧",
        category: "Relaxation",
        premium: false
    },
    {
        id: 'breath',
        name: "Neural Flow",
        description: "Synchronize your breathing with a morphing geometric portal.",
        icon: "🌀",
        category: "Focus",
        premium: true
    },
    {
        id: 'match',
        name: "Memory Oasis",
        description: "Flip cards featuring calming nature scenery to improve recall.",
        icon: "🎴",
        category: "Cognitive",
        premium: true
    },
    {
        id: 'rain',
        name: "Rain Maker",
        description: "Create your own lo-fi rain soundscape by tapping different clouds.",
        icon: "🌧️",
        category: "Sleep",
        premium: true
    }
];

// --- ZEN POP GAME ---
const ZenPopGame = () => {
    const [bubbles, setBubbles] = useState([]);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setBubbles(prev => {
                if(prev.length > 25) return prev;
                return [...prev, {
                    id: Date.now() + Math.random(),
                    x: Math.random() * 85 + 5,
                    y: Math.random() * 85 + 5,
                    size: Math.random() * 40 + 30,
                    color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'][Math.floor(Math.random() * 6)]
                }];
            });
        }, 600);
        return () => clearInterval(interval);
    }, []);

    const popBubble = (id) => {
        setBubbles(prev => prev.filter(b => b.id !== id));
        setScore(s => s + 1);
        try {
            const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-30.mp3');
            audio.volume = 0.4;
            audio.play().catch(err => console.warn('Audio blocked or failed to load', err));
        } catch(e) {}
    };

    return (
        <div style={{ width: '100%', height: '450px', position: 'relative', background: 'radial-gradient(circle at center, #1e293b, #0f172a)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ position: 'absolute', top: 20, left: 30, color: 'rgba(255,255,255,0.7)', fontSize: '28px', fontWeight: '800', zIndex: 10 }}>
                Score: <span style={{ color: '#60a5fa' }}>{score}</span>
            </div>
            <div style={{ position: 'absolute', bottom: 20, width: '100%', textAlign: 'center', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none', zIndex: 1 }}>Pop the bubbles to release tension...</div>
            <AnimatePresence>
            {bubbles.map(b => (
                <motion.div 
                   key={b.id}
                   initial={{ scale: 0, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1, y: [0, -20, 0] }}
                   exit={{ scale: 1.5, opacity: 0 }}
                   transition={{ duration: 0.4, y: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
                   onClick={() => popBubble(b.id)}
                   style={{
                       position: 'absolute', left: `${b.x}%`, top: `${b.y}%`, width: `${b.size}px`, height: `${b.size}px`,
                       background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), ${b.color})`,
                       borderRadius: '50%', cursor: 'pointer', boxShadow: `0 0 20px ${b.color}66`,
                       zIndex: 5
                   }}
                />
            ))}
            </AnimatePresence>
        </div>
    )
}

// --- NEURAL FLOW GAME ---
const NeuralFlowGame = () => {
    return (
        <div style={{ width: '100%', height: '450px', background: '#0f172a', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
            <motion.div
                animate={{ 
                    scale: [1, 3.5, 1],
                    borderRadius: ["50%", "30%", "50%"],
                    rotate: [0, 180, 0]
                }}
                transition={{ 
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    width: '180px', height: '180px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
                    filter: 'blur(30px)',
                    opacity: 0.8,
                    position: 'absolute'
                }}
            />
            <div style={{ zIndex: 10, textAlign: 'center', color: 'white' }}>
                 <motion.h2 
                     animate={{ opacity: [0.3, 1, 0.3], scale: [0.95, 1.05, 0.95] }} 
                     transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                     style={{ fontSize: '32px', fontWeight: '300', letterSpacing: '6px', margin: 0 }}
                 >
                     SYNC YOUR BREATH
                 </motion.h2>
                 <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '20px', fontSize: '14px' }}>Inhale as it expands. Exhale as it contracts.</p>
            </div>
        </div>
    );
};

// --- MEMORY OASIS GAME ---
const MemoryOasisGame = () => {
    const emojis = ['🌸', '🌿', '🦋', '🍄', '🐢', '🦆'];
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [solved, setSolved] = useState([]);
    const [moves, setMoves] = useState(0);

    useEffect(() => {
        const shuffled = [...emojis, ...emojis]
            .sort(() => Math.random() - 0.5)
            .map((e, i) => ({ id: i, emoji: e }));
        setCards(shuffled);
    }, []);

    const flipCard = (id) => {
        if(flipped.length === 2 || flipped.includes(id) || solved.includes(id)) return;
        
        try {
            const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-16.mp3');
            audio.volume = 0.3;
            audio.play().catch(err => console.warn('Audio failed', err));
        } catch(e) {}

        const newFlipped = [...flipped, id];
        setFlipped(newFlipped);
        
        if(newFlipped.length === 2) {
            setMoves(m => m + 1);
            const match = cards.find(c => c.id === newFlipped[0]).emoji === cards.find(c => c.id === newFlipped[1]).emoji;
            if(match) {
                setSolved([...solved, ...newFlipped]);
                setFlipped([]);
                try {
                    const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3');
                    audio.volume = 0.5;
                    audio.play().catch(err => console.warn('Audio failed', err));
                } catch(e) {}
            } else {
                setTimeout(() => setFlipped([]), 1000);
            }
        }
    };

    return (
        <div style={{ width: '100%', height: '450px', background: '#e0ece4', borderRadius: '20px', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                 <h3 style={{ color: '#2c3e50', margin: 0, fontSize: '20px' }}>Moves: {moves}</h3>
                 {solved.length === 12 && <h3 style={{ color: '#27ae60', margin: 0, background: 'white', padding: '5px 15px', borderRadius: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>Oasis Restored! 🌿</h3>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', width: '100%', flex: 1 }}>
                {cards.map(c => (
                    <motion.div 
                        key={c.id} 
                        onClick={() => flipCard(c.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{ rotateY: (flipped.includes(c.id) || solved.includes(c.id)) ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            background: flipped.includes(c.id) || solved.includes(c.id) ? 'white' : 'linear-gradient(135deg, #76b852, #8DC26F)',
                            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', boxShadow: '0 8px 15px rgba(0,0,0,0.1)'
                        }}
                    >
                        <span style={{ transform: (flipped.includes(c.id) || solved.includes(c.id)) ? 'rotateY(180deg)' : 'none', fontSize: '50px' }}>
                           {(flipped.includes(c.id) || solved.includes(c.id)) ? c.emoji : ''}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// --- RAIN MAKER GAME ---
const RainMakerGame = () => {
    const sounds = [
        { id: 'rain', icon: '🌧️', name: 'Light Rain' },
        { id: 'thunder', icon: '⚡', name: 'Distant Thunder' },
        { id: 'wind', icon: '🌬️', name: 'Soft Wind' },
        { id: 'birds', icon: '🐦', name: 'Forest Birds' },
        { id: 'fire', icon: '🔥', name: 'Cozy Fireplace' },
        { id: 'stream', icon: '🌊', name: 'River Stream' },
    ];
    
    const [active, setActive] = useState({});

    const toggleSound = (s) => {
        setActive(prev => ({...prev, [s.id]: !prev[s.id]}));
        try {
            // Simulated audio hit for prototype
            const a = new Audio('https://www.soundjay.com/buttons/sounds/button-20.mp3');
            a.volume = 0.2;
            a.play().catch(err => console.warn('Audio failed', err));
        } catch(e) {}
    }

    return (
        <div style={{ width: '100%', height: '450px', background: 'linear-gradient(180deg, #1e293b, #0f172a)', borderRadius: '20px', padding: '30px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ color: '#cbd5e1', textAlign: 'center', marginBottom: '25px', fontWeight: '500' }}>Tap to layer the sounds of nature</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', flex: 1 }}>
                {sounds.map(s => (
                    <motion.div
                        key={s.id}
                        onClick={() => toggleSound(s)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            background: active[s.id] ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                            border: `2px solid ${active[s.id] ? '#3b82f6' : 'rgba(255,255,255,0.05)'}`,
                            borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.3s', boxShadow: active[s.id] ? '0 0 20px rgba(59, 130, 246, 0.2)' : 'none'
                        }}
                    >
                        <span style={{ fontSize: '45px', marginBottom: '15px', filter: active[s.id] ? 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' : 'none' }}>{s.icon}</span>
                        <span style={{ color: active[s.id] ? '#93c5fd' : '#64748b', fontWeight: '600', fontSize: '14px' }}>{s.name}</span>
                        {active[s.id] && (
                            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: '6px', height: '6px', background: '#60a5fa', borderRadius: '50%', marginTop: '15px' }} />
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function GamesModal({ user, onClose, onUpgradeClick }) {
    const [activeGame, setActiveGame] = useState(null);

    const handlePlay = (game) => {
        if (game.premium && !user?.is_premium) {
            onUpgradeClick();
            return;
        }
        setActiveGame(game);
    };

    if (activeGame) {
        return (
            <div className="modal-overlay" onClick={() => setActiveGame(null)}>
                <div className="modal-content game-player-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', maxHeight: '95vh', overflowY: 'auto', padding: '35px', borderRadius: '24px', background: 'white', position: 'relative' }}>
                    <div className="modal-header" style={{ marginBottom: '25px', position: 'sticky', top: '-35px', background: 'white', padding: '15px 0', zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '28px', display: 'flex', alignItems: 'center', gap: '12px', color: '#1e293b', margin: 0 }}>
                            <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>{activeGame.icon}</span> 
                            {activeGame.name}
                        </h2>
                        <button onClick={() => setActiveGame(null)} className="close-btn" style={{ background: '#f1f5f9', color: '#64748b', width: '40px', height: '40px', borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>✕</button>
                    </div>
                    
                    <div style={{ position: 'relative', width: '100%' }}>
                        {activeGame.id === 'bubble' && <ZenPopGame />}
                        {activeGame.id === 'breath' && <NeuralFlowGame />}
                        {activeGame.id === 'match' && <MemoryOasisGame />}
                        {activeGame.id === 'rain' && <RainMakerGame />}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
            <div className="modal-content games-modal-container" onClick={(e) => e.stopPropagation()} style={{ background: '#f8fafc', maxWidth: '900px', maxHeight: '95vh', overflowY: 'auto', borderRadius: '24px', padding: '40px', position: 'relative' }}>
                <div className="modal-header" style={{ marginBottom: '30px', position: 'sticky', top: '-40px', background: '#f8fafc', padding: '15px 0', zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="games-header" style={{ margin: 0, textAlign: 'left' }}>
                        <h2 style={{ fontSize: '36px', background: 'linear-gradient(135deg, #4f46e5, #ec4899)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 10px 0' }}>Arcade Oasis</h2>
                        <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>Scientifically designed mini-games to reset your nervous system.</p>
                    </div>
                    <button onClick={onClose} className="close-btn" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>✕</button>
                </div>
                
                <div className="games-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' }}>
                    {gameLibrary.map((game) => {
                        const isLocked = game.premium && !user?.is_premium;
                        return (
                            <motion.div 
                                key={game.id} 
                                className="game-card" 
                                onClick={() => handlePlay(game)} 
                                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}
                                style={{ background: 'white', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.3s', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}
                            >
                                {isLocked && <div className="tagline" style={{ position: 'absolute', top: '20px', right: '20px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', fontWeight: '800', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)' }}>PREMIUM</div>}
                                
                                <div className="game-thumbnail" style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isLocked ? '#f1f5f9' : 'linear-gradient(135deg, #eef2ff, #fdf4ff)' }}>
                                    <span style={{ fontSize: '75px', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>{game.icon}</span>
                                </div>
                                <div className="game-details" style={{ padding: '30px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: 0 }}>{game.name}</h3>
                                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#8b5cf6', background: '#f5f3ff', padding: '4px 10px', borderRadius: '12px' }}>{game.category}</span>
                                    </div>
                                    <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, marginBottom: '25px', minHeight: '48px' }}>{game.description}</p>
                                    <motion.button 
                                        whileTap={{ scale: 0.95 }}
                                        className={`game-btn ${isLocked ? 'locked' : ''}`} 
                                        style={{ 
                                            width: '100%', padding: '15px', borderRadius: '14px', border: 'none', fontWeight: '700', fontSize: '16px', cursor: 'pointer',
                                            background: isLocked ? '#f1f5f9' : 'linear-gradient(135deg, #4f46e5, #6366f1)',
                                            color: isLocked ? '#94a3b8' : 'white',
                                            boxShadow: isLocked ? 'none' : '0 8px 20px rgba(79, 70, 229, 0.3)'
                                        }}
                                    >
                                        {isLocked ? '🔒 Unlock to Play' : '🎮 Launch Game'}
                                    </motion.button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default GamesModal;