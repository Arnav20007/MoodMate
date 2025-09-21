import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

const API_BASE_URL = 'http://127.0.0.1:5000';

function Chat({ user }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const chatEndRef = useRef(null);

    // Set the initial welcome message when the component loads
    useEffect(() => {
        if (user && user.username) {
            setMessages([{
                id: Date.now(),
                text: `Hello ${user.username}! I'm MoodMate. How can I help you today?`,
                sender: 'bot'
            }]);
        }
    }, [user]);

    // Apply dark mode class to body
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // Save preference to localStorage
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    // Load dark mode preference on component mount
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
    }, []);

    // Automatically scroll to the latest message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Save messages to localStorage
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chatMessages', JSON.stringify(messages));
        }
    }, [messages]);

    // Load messages from localStorage
    useEffect(() => {
        const savedMessages = localStorage.getItem('chatMessages');
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        }
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { 
            id: Date.now(), 
            text: input, 
            sender: 'user'
        };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ message: input })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const botMessage = { 
                id: Date.now() + 1, 
                text: data.reply, 
                sender: 'bot'
            };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("Chat error:", error);
            const errorMsg = { 
                id: Date.now() + 1, 
                text: "Sorry, I couldn't process your request. Please try again.", 
                sender: 'bot'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    const clearChat = () => {
        if (window.confirm("Are you sure you want to clear all messages?")) {
            setMessages([{
                id: Date.now(),
                text: `Chat cleared. How can I help you today, ${user.username}?`,
                sender: 'bot'
            }]);
            localStorage.removeItem('chatMessages');
        }
    };

    return (
        <div className={`chat-container ${darkMode ? 'dark-mode' : ''}`}>
            <div className="chat-header">
                <div className="chat-header-avatar">M</div>
                <div className="chat-header-info">
                    <h2>MoodMate Assistant</h2>
                    <p>Always here to listen</p>
                </div>
                <div className="chat-header-actions">
                    <button 
                        className="clear-chat-btn"
                        onClick={clearChat}
                        title="Clear conversation"
                    >
                        🗑️
                    </button>
                    <button 
                        className="dark-mode-toggle"
                        onClick={() => setDarkMode(!darkMode)}
                        aria-label="Toggle dark mode"
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                </div>
            </div>

            <div className="chat-box">
                <div className="chat-messages-container">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`chat-message ${msg.sender}`}>
                            <div className="message-content">
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="chat-message bot">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} className="scroll-anchor" />
                </div>
            </div>

            <div className="input-area-full">
                <div className="input-container-full">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message here..."
                        disabled={isTyping}
                        className="chat-input-full"
                    />
                    <button 
                        onClick={sendMessage} 
                        disabled={isTyping || !input.trim()}
                        className="send-btn-full"
                    >
                        {isTyping ? (
                            <div className="sending-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chat;