import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Chat.css';
import { API_BASE_URL } from '../api';

const THINKING_PHRASES = [
  'I am listening...',
  'I am here with you...',
  'I understand...',
  'Just a moment...',
  'Thinking...',
  'Reflecting on your input...',
  'You are safe here...',
];

const MOOD_STARTERS = [
  {
    icon: 'Calm',
    label: 'Neutral / Observation',
    hint: 'Talk through your day without pressure.',
    message: 'I am feeling generally centered but would like to explore some thoughts.',
  },
  {
    icon: 'Pause',
    label: 'Feeling Overwhelmed',
    hint: 'Sort out everything that feels stacked at once.',
    message: 'I feel as though everything is happening simultaneously, and I am unsure where to focus my attention.',
  },
  {
    icon: 'Low',
    label: 'Experiencing Low Mood',
    hint: 'Describe a heavy or slow emotional stretch.',
    message: "I've noticed my energy and mood have been lower than usual lately.",
  },
  {
    icon: 'Ease',
    label: 'Managing Anxiety',
    hint: 'Use grounding support for physical stress.',
    message: 'I am currently experiencing physical symptoms of anxiety and would like assistance in grounding.',
  },
  {
    icon: 'Rest',
    label: 'Feeling Exhausted',
    hint: 'Check in when your mind and body are both tired.',
    message: 'I am feeling quite exhausted, both mentally and physically.',
  },
  {
    icon: 'Reset',
    label: 'Feeling Frustrated',
    hint: 'Untangle tension before it builds more.',
    message: 'I have been feeling quite frustrated lately, and things do not seem to be going well.',
  },
  {
    icon: 'Open',
    label: 'Just Checking In',
    hint: 'Start small without needing a big topic.',
    message: 'I am here and would like to talk. Nothing specific, just checking in.',
  },
];



const MOOD_INTERVENTIONS = {
  sad: {
    title: "Gentle Mood Lift",
    desc: "When things feel heavy, small physical shifts can help. Would you like a 3-minute behavioral activation exercise?",
    action: "Guide me"
  },
  anxious: {
    title: "Grounding Support",
    desc: "Anxiety often lives in the body. Let's try a Box Breathing routine to steady your nervous system.",
    action: "Start Breathing"
  },
  tired: {
    title: "Restorative Pause",
    desc: "Your battery feels low. A short progressive muscle relaxation can help you recharge without effort.",
    action: "Help me rest"
  },
  angry: {
    title: "Release Tension",
    desc: "Frustration needs a safe outlet. Let's try some physical release or expressive journaling right now.",
    action: "Release now"
  }
};

function Chat({ user }) {
  const storageKey = `moodmate_chat_${user?.id || 'guest'}`;
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [thinkingPhrase, setThinkingPhrase] = useState(THINKING_PHRASES[0]);
  const chatEndRef = useRef(null);
  const thinkingIntervalRef = useRef(null);
  const sessionIdRef = useRef(`web_chat_${Date.now()}`);
  const recognitionRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/status?user_id=${user?.id || 1}`);
      const data = await response.json();
      if (data.status === 'success' && data.nudge) {
        setMessages((prev) => [
          {
            id: `nudge-${Date.now()}`,
            text: data.nudge,
            sender: 'bot',
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch status', err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages.slice(-80)));
      } catch (error) {
        console.warn('Chat save failed', error);
      }
    }
  }, [messages, storageKey]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (isTyping) {
      let index = 0;
      thinkingIntervalRef.current = setInterval(() => {
        index = (index + 1) % THINKING_PHRASES.length;
        setThinkingPhrase(THINKING_PHRASES[index]);
      }, 1500);
    } else {
      clearInterval(thinkingIntervalRef.current);
      setThinkingPhrase(THINKING_PHRASES[0]);
    }
    return () => clearInterval(thinkingIntervalRef.current);
  }, [isTyping]);

  useEffect(() => {
    if (user && user.username) {
      setMessages((prev) => {
        if (prev.length > 0) return prev;
        return [
          {
            id: Date.now(),
            text: 'Welcome back. Please take your time.\n\nHow are you feeling today?',
            sender: 'bot',
          },
        ];
      });
    }
  }, [user]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognitionRef.current = recognition;
    }
  }, []);

  const showTransientToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'chat-toast';
    toast.innerHTML = `<span>${message}</span><button aria-label="Dismiss notification">Close</button>`;
    toast.querySelector('button').onclick = () => {
      if (document.body.contains(toast)) toast.remove();
    };
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) toast.remove();
    }, 3500);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      showTransientToast('Microphone is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = recognitionRef.current;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      setInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    setInput('');
    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
    }
  };

  const playChime = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.2;
      audio.play().catch((error) => console.log('Audio blocked', error));
    } catch (error) {
      console.error('Audio failed', error);
    }
  };

  const playAudio = (url) => {
    if (!url) return;
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    const audio = new Audio(fullUrl);
    audio.play().catch((error) => console.error('Audio playback failed:', error));
  };

  const sendMessageCore = async (text) => {
    if (!text.trim()) return;

    const userMessage = { id: Date.now(), text, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          message: text,
          user_id: user?.id || 1,
          user_name: user?.username || 'Friend',
          session_id: sessionIdRef.current,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = {
        id: Date.now() + 1,
        text: data.reply || "I'm here with you.",
        sender: 'bot',
        audioUrl: data.audioUrl,
      };
      setMessages((prev) => [...prev, botMessage]);
      playChime();
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: 'Connection issue. I could not reach the backend just now. Please check the server and try again.',
          sender: 'bot',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = () => sendMessageCore(input);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => setShowClearModal(true);

  const confirmClearChat = () => {
    const newMessage = {
      id: Date.now(),
      text: "Fresh start. I'm here with you whenever you want to begin again.",
      sender: 'bot',
    };
    setMessages([newMessage]);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to clear local chat history', error);
    }
    setShowClearModal(false);
  };

  const userMessageCount = messages.filter((message) => message.sender === 'user').length;

  return (
    <div className={`chat-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="chat-header">
        <div className="chat-header-avatar">M</div>
        <div className="chat-header-info">
          <h2>MoodMate AI</h2>
          <p>Quiet check-ins, reflection, and grounding support.</p>
        </div>
        <div className="chat-header-actions">
          <button className="header-icon-btn" onClick={clearChat} title="Clear conversation">
            Clear
          </button>
          <button
            className="header-icon-btn dark-mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      {showClearModal && (
        <div className="chat-modal-overlay">
          <div className="chat-modal-card">
            <div className="chat-modal-icon">Reset</div>
            <h3>Clear this conversation?</h3>
            <p>This removes the current local session history from this device.</p>
            <div className="chat-modal-actions">
              <button className="chat-modal-secondary" onClick={() => setShowClearModal(false)}>
                Cancel
              </button>
              <button className="chat-modal-primary" onClick={confirmClearChat}>
                Clear session
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="chat-box">
        <div className="chat-notice-bar">
          <span className="chat-notice-label">Care note</span>
          <p>AI companion, not a therapist or emergency service. If you are in immediate danger, use local emergency support or the SOS crisis numbers in the app.</p>
        </div>

        {userMessageCount === 0 && !isTyping && (
          <section className="chat-intro-panel">
            <div className="chat-intro-copy">
              <h3>Hey... I'm here with you.</h3>
              <p>
                How are you feeling right now?
              </p>
            </div>

            <div className="chat-starter-grid">
              {MOOD_STARTERS.slice(0, 3).map((starter) => (
                <button
                  key={starter.label}
                  className="chat-starter-card"
                  onClick={() => sendMessageCore(starter.message)}
                >
                  <span className="chat-starter-icon">{starter.icon}</span>
                  <strong>{starter.label}</strong>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="chat-messages-container">
          {user?.lastMood && MOOD_INTERVENTIONS[user.lastMood] && (
            <div className={`mood-intervention-card ${user.lastMood}`}>
              <div className="intervention-meta">Recommended for you</div>
              <h3>{MOOD_INTERVENTIONS[user.lastMood].title}</h3>
              <p>{MOOD_INTERVENTIONS[user.lastMood].desc}</p>
              <button onClick={() => sendMessageCore(MOOD_INTERVENTIONS[user.lastMood].desc)} className="intervention-btn">
                {MOOD_INTERVENTIONS[user.lastMood].action}
              </button>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`chat-message ${message.sender}`}>
              <div className="message-content">
                <p>{message.text}</p>
                {message.sender === 'bot' && message.audioUrl && (
                  <button onClick={() => playAudio(message.audioUrl)} className="audio-btn" title="Play aloud">
                    Play audio
                  </button>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chat-message bot">
              <div className="typing-indicator-wrap">
                <div className="typing-indicator-label">{thinkingPhrase}</div>
                <div className="typing-dots">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} className="scroll-anchor" />
        </div>
      </div>

      <div className="input-area-full">
        <div className="input-container-full">
          <button
            className={`mic-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
            title={isListening ? 'Listening, click to stop' : 'Dictate message'}
          >
            {isListening ? <div className="mic-listening-pulse" /> : 'Mic'}
          </button>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isListening ? 'Listening...' : "Share what's on your mind..."}
            disabled={isTyping}
            className="chat-input-full"
          />
          <button onClick={sendMessage} disabled={isTyping || !input.trim()} className="send-btn-full">
            {isTyping ? <span className="sending-indicator">...</span> : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
