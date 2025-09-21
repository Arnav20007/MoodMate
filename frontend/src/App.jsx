import React, { useState } from 'react';
import './app.css';
// Replace the placeholder components with these imports
import AICoach from './components/AICoach';
import Therapy from './components/Therapy';
import Community from './components/Community';
import Report from './components/Report';
import Profile from './components/Profile';
import Chat from './components/Chat';


const MoodMate = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [user] = useState({
    username: 'Arnav._.singh__'
  });

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1>MoodMate</h1>
          <div className="nav-tabs">
            <button 
              className={activeTab === 'chat' ? 'nav-tab active' : 'nav-tab'}
              onClick={() => setActiveTab('chat')}
            >
              💬 Chat
            </button>
            <button 
              className={activeTab === 'ai-coach' ? 'nav-tab active' : 'nav-tab'}
              onClick={() => setActiveTab('ai-coach')}
            >
              🤖 AI Coach
            </button>
            <button 
              className={activeTab === 'therapy' ? 'nav-tab active' : 'nav-tab'}
              onClick={() => setActiveTab('therapy')}
            >
              👨‍⚕️ Therapy
            </button>
            <button 
              className={activeTab === 'community' ? 'nav-tab active' : 'nav-tab'}
              onClick={() => setActiveTab('community')}
            >
              🌍 Community
            </button>
            <button 
              className={activeTab === 'report' ? 'nav-tab active' : 'nav-tab'}
              onClick={() => setActiveTab('report')}
            >
              📊 Report
            </button>
            <button 
              className={activeTab === 'profile' ? 'nav-tab active' : 'nav-tab'}
              onClick={() => setActiveTab('profile')}
            >
              👤 Profile
            </button>
          </div>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="username">{user.username}</span>
            <button className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {activeTab === 'chat' && <Chat user={user} />}
        {activeTab === 'ai-coach' && <AICoach user={user} />}
        {activeTab === 'therapy' && <Therapy user={user} />}
        {activeTab === 'community' && <Community user={user} />}
        {activeTab === 'report' && <Report user={user} />}
        {activeTab === 'profile' && <Profile user={user} />}
      </main>
    </div>
  );
};

export default MoodMate;