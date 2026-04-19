import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './GlobalAudioPlayer.css';

const SOUNDSCAPES = [
    { id: 'rain', name: 'Midnight Rain', icon: '🌧️', url: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Rain_on_a_tin_roof.ogg' },
    { id: 'focus', name: 'Deep Focus Noise', icon: '🎧', url: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Brown_noise.ogg' },
    { id: 'forest', name: 'Forest Ambience', icon: '🌲', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Rainforest_ambience.ogg' },
    { id: 'waves', name: 'Ocean Waves', icon: '🌊', url: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Ocean_Waves_audio.ogg' }
];

export default function GlobalAudioPlayer() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeSound, setActiveSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        if (!audioRef.current) return;
        if (isPlaying && activeSound) {
            audioRef.current.play().catch(e => console.log('Audio autoplay prevented by browser', e));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, activeSound]);

    const activeUrl = activeSound ? SOUNDSCAPES.find(s => s.id === activeSound)?.url : '';

    const togglePlay = (soundId) => {
        if (activeSound === soundId) {
            setIsPlaying(!isPlaying);
        } else {
            setActiveSound(soundId);
            setIsPlaying(true);
        }
    };

    return (
        <div className="global-audio-wrapper">
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="global-audio-menu"
                    >
                        <div className="audio-menu-header">
                            <span className="audio-icon-xl">🌿</span>
                            <h4>Ambient Backgrounds</h4>
                            <p>Persistent soundscapes (Calm parity)</p>
                        </div>
                        <div className="audio-list">
                            {SOUNDSCAPES.map(sound => (
                                <button 
                                    key={sound.id}
                                    className={`audio-option-btn ${activeSound === sound.id ? 'active' : ''}`}
                                    onClick={() => togglePlay(sound.id)}
                                >
                                    <span className="audio-icon">{sound.icon}</span>
                                    <span className="audio-name">{sound.name}</span>
                                    <span className="audio-status">
                                        {activeSound === sound.id && isPlaying ? '⏸' : '▶'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button 
                className={`global-audio-trigger ${activeSound && isPlaying ? 'playing' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Ambient Soundscapes"
            >
                {activeSound && isPlaying ? '🎧 Playing' : '🎵 Ambient'}
            </button>

            {/* Hidden Audio Element */}
            {activeUrl && <audio ref={audioRef} src={activeUrl} loop />}
        </div>
    );
}
