import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://moodmate-8-sucu.onrender.com';

// Rotating empathy messages shown while AI is thinking
const THINKING_PHRASES = [
    "I am listening...",
    "I am here with you...",
    "I understand...",
    "Just a moment...",
    "Thinking...",
    "Reflecting on your input...",
    "You are safe here...",
];

// Mood quick-start buttons shown before first message
const MOOD_STARTERS = [
    { emoji: "\u{1F610}", label: "Neutral / Observation", message: "I am feeling generally centered but would like to explore some thoughts." },
    { emoji: "\u{1F636}", label: "Feeling Overwhelmed", message: "I feel as though everything is happening simultaneously, and I am unsure where to focus my attention." },
    { emoji: "\u{1F614}", label: "Experiencing Low Mood", message: "I've noticed my energy and mood have been lower than usual lately." },
    { emoji: "\u{1F630}", label: "Managing Anxiety", message: "I am currently experiencing physical symptoms of anxiety and would like assistance in grounding." },
    { emoji: "\u{1F634}", label: "Feeling Exhausted", message: "I am feeling quite exhausted, both mentally and physically." },
    { emoji: "\u{1F624}", label: "Feeling Frustrated", message: "I have been feeling quite frustrated lately, and things do not seem to be going well." },
    { emoji: "\u{1F642}", label: "Just Checking In", message: "I am here and would like to talk. Nothing specific, just checking in." },
];

function Chat({ user }) {
    const STORAGE_KEY = `moodmate_chat_${user?.id || 'guest'}`;
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [retentionData, setRetentionData] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);
    const [thinkingPhrase, setThinkingPhrase] = useState(THINKING_PHRASES[0]);
    const chatEndRef = useRef(null);
    const thinkingIntervalRef = useRef(null);
    const sessionIdRef = useRef('web_chat_' + Date.now());

    // Fetch user status (Streaks, Check-ins, Insights)
    const fetchStatus = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/status?user_id=${user?.id || 1}`);
            const data = await response.json();
            if (data.status === 'success') {
                setRetentionData(data);
                if (data.nudge) {
                    setMessages(prev => [{
                        id: 'nudge-' + Date.now(),
                        text: data.nudge,
                        sender: 'bot'
                    }, ...prev]);
                }
            }
        } catch (err) {
            console.error("Failed to fetch status", err);
        }
    };

    // Persist messages to localStorage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-80))); }
            catch (e) { console.warn('Chat save failed', e); }
        }
    }, [messages]);

    useEffect(() => {
        fetchStatus();
    }, [user]);

    // Rotating thinking phrase while AI processes
    useEffect(() => {
        if (isTyping) {
            let i = 0;
            thinkingIntervalRef.current = setInterval(() => {
                i = (i + 1) % THINKING_PHRASES.length;
                setThinkingPhrase(THINKING_PHRASES[i]);
            }, 1500);
        } else {
            clearInterval(thinkingIntervalRef.current);
            setThinkingPhrase(THINKING_PHRASES[0]);
        }
        return () => clearInterval(thinkingIntervalRef.current);
    }, [isTyping]);

    // Warm, low-pressure welcome message (no 'mission' language)
    useEffect(() => {
        if (user && user.username) {
            setMessages(prev => {
                if (prev.length > 0) return prev;
                const welcomeText = `Welcome back. Please take your time.\n\nHow are you feeling today?`;
                return [{ id: Date.now(), text: welcomeText, sender: 'bot' }];
            });
        }
    }, [user]);

    // Apply dark mode class to body
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    // Load dark mode preference
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
    }, []);

    // Auto scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Speech Recognition Setup
    const recognitionRef = useRef(null);
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition && !recognitionRef.current) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognitionRef.current = recognition;
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            const t = document.createElement('div');
            t.innerHTML = `<span>🎤 Microphone not supported in this browser. Use Chrome or Edge.</span><button style="background:transparent;border:none;color:white;cursor:pointer;font-weight:bold;margin-left:12px;opacity:0.8;font-size:16px;">✕</button>`;
            t.style.cssText = 'display:flex;align-items:center;position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#1e293b;color:white;padding:12px 22px;border-radius:14px;font-size:13.5px;font-weight:600;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,0.2);font-family:Inter,sans-serif;white-space:nowrap;animation:fadeSlideUp 0.3s ease';
            t.querySelector('button').onclick = () => { if (document.body.contains(t)) t.remove(); };
            document.body.appendChild(t);
            setTimeout(() => { if (document.body.contains(t)) t.remove(); }, 3500);
            return;
        }
        const recognition = recognitionRef.current;
        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                setInput(transcript);
            };
            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };
            recognition.onend = () => { setIsListening(false); };
            setInput('');
            try {
                recognition.start();
                setIsListening(true);
            } catch (err) {
                console.error("Failed to start speech recognition:", err);
                setIsListening(false);
            }
        }
    };

    const playChime = () => {
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.2;
            audio.play().catch(e => console.log('Audio blocked', e));
        } catch(e) { console.error('Audio failed', e); }
    };

    const playAudio = (url) => {
        if (!url) return;
        const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
        const audio = new Audio(fullUrl);
        audio.play().catch(e => console.error("Audio playback failed:", e));
    };

    const sendMessageCore = async (text) => {
        if (!text.trim()) return;
        const userMessage = { id: Date.now(), text, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    user_id: user?.id || 1,
                    user_name: user?.username || "Friend",
                    session_id: sessionIdRef.current
                })
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            const botMessage = {
                id: Date.now() + 1,
                text: data.reply || "I'm here with you.",
                sender: 'bot',
                audioUrl: data.audioUrl
            };
            setMessages(prev => [...prev, botMessage]);
            playChime();
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Connection issue. Could not reach the backend. Please check if it's running.",
                sender: 'bot'
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const sendMessage = () => sendMessageCore(input);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleMoodStarter = (starter) => {
        sendMessageCore(starter.message);
    };

    const clearChat = () => setShowClearModal(true);

    const confirmClearChat = () => {
        const newMsg = { id: Date.now(), text: `Fresh start. I'm here with you. 🌱`, sender: 'bot' };
        setMessages([newMsg]);
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
        setShowClearModal(false);
    };

    const userMessageCount = messages.filter(m => m.sender === 'user').length;

    return (
        <div className={`chat-container ${darkMode ? 'dark-mode' : ''}`}>

            <div className="chat-header" style={{ padding: '8px 16px', background: 'transparent', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ position: 'relative', marginRight: '0.75rem', flexShrink: 0 }}>
                  <div className="chat-header-avatar" style={{ position: 'relative', zIndex: 1, width: '32px', height: '32px', fontSize: '14px' }}>M</div>
                </div>
                <div className="chat-header-info">
                    <h2 style={{ fontSize: '14px', margin: 0, fontWeight: '700' }}>MoodMate AI</h2>
                </div>
                <div className="chat-header-actions">
                    <button className="header-icon-btn" onClick={clearChat} title="Clear conversation">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                    <button className="header-icon-btn dark-mode-toggle" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle dark mode">
                        {darkMode ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Custom clear-chat modal */}
            {showClearModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '30px', maxWidth: '340px', width: '90%', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🗑️</div>
                        <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>Clear this conversation?</h3>
                        <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px' }}>This session will be permanently removed from your history.</p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button onClick={() => setShowClearModal(false)} style={{ padding: '10px 22px', borderRadius: '12px', border: '2px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                            <button onClick={confirmClearChat} style={{ padding: '10px 22px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Yes, Clear Session</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="chat-box">
                <div style={{
                    background: 'transparent',
                    color: '#64748b', padding: '8px 16px', fontSize: '11px',
                    textAlign: 'center', marginBottom: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}>
                    <span style={{ fontSize: '12px' }}>🔒</span>
                    <span>AI companion, not a therapist. <strong style={{ color: '#6366f1' }}>Crisis? iCall: 9152987821</strong></span>
                </div>
                <div className="chat-messages-container">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`chat-message ${msg.sender}`}>
                            <div className="message-content">
                                {msg.text}
                                {msg.sender === 'bot' && msg.audioUrl && (
                                    <button onClick={() => playAudio(msg.audioUrl)} className="audio-btn" title="Play message aloud">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Mood starter quick-tap buttons — shown only before first user message */}
                    {userMessageCount === 0 && !isTyping && (
                        <div style={{ padding: '20px 20px 8px' }}>
                            {/* Conversation starter cards */}
                            <p style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
                                💬 Not sure where to start?
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                                {[
                                    { icon: '🌧️', prompt: 'I am not feeling productive today...', sub: 'Share your current emotional state' },
                                    { icon: '😶', prompt: 'I would like to reflect on some thoughts', sub: 'Begin a guided reflection' },
                                    { icon: '😰', prompt: 'I have been feeling quite anxious lately', sub: "Let's work through grounding techniques" },
                                ].map((card, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessageCore(card.prompt)}
                                        style={{
                                            textAlign: 'left', padding: '12px 16px', borderRadius: '14px',
                                            border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                        }}
                                        onMouseOver={e => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.background = '#f8faff'; }}
                                        onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; }}
                                    >
                                        <span style={{ fontSize: '22px', flexShrink: 0 }}>{card.icon}</span>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' }}>{card.prompt}</div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{card.sub}</div>
                                        </div>
                                        <span style={{ marginLeft: 'auto', color: '#c7d2fe', fontSize: '18px', flexShrink: 0 }}>→</span>
                                    </button>
                                ))}
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '10px', textAlign: 'center' }}>or choose a quick-start prompt below...</p>
                            {/* Horizontal scrollable pill strip */}
                            <div style={{
                                display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px',
                                WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
                            }}>
                                {MOOD_STARTERS.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleMoodStarter(s)}
                                        style={{
                                            padding: '9px 16px', borderRadius: '50px', border: '1.5px solid #e2e8f0',
                                            background: 'white', cursor: 'pointer', fontSize: '13px', color: '#475569',
                                            display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500',
                                            transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                            whiteSpace: 'nowrap', flexShrink: 0,
                                        }}
                                        onMouseOver={e => { e.currentTarget.style.background = '#f8faff'; e.currentTarget.style.borderColor = '#818cf8'; }}
                                        onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                    >
                                        <span style={{ fontSize: '16px' }}>{s.emoji}</span> {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {isTyping && (
                        <div className="chat-message bot">
                            <div className="typing-indicator-label" style={{ fontStyle: 'italic', opacity: 0.8 }}>{thinkingPhrase}</div>
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} className="scroll-anchor" />
                </div>
            </div>

            <div className="input-area-full">
                <div className="input-container-full">
                    <button className={`mic-btn ${isListening ? 'listening' : ''}`} onClick={toggleListening} title={isListening ? "Listening... click to stop" : "Dictate message"}>
                        {isListening ? (
                            <div className="mic-listening-pulse"></div>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                <line x1="12" y1="19" x2="12" y2="23"></line>
                                <line x1="8" y1="23" x2="16" y2="23"></line>
                            </svg>
                        )}
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={isListening ? "Listening..." : "Share what's on your mind... I'm listening."}
                        disabled={isTyping}
                        className="chat-input-full"
                    />
                    <button onClick={sendMessage} disabled={isTyping || !input.trim()} className="send-btn-full">
                        {isTyping ? (
                            <div className="sending-indicator"><span></span><span></span><span></span></div>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chat;