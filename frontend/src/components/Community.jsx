import React, { useState, useEffect, useRef } from 'react';
import './Community.css';

// Sample data
const initialMoodWall = [
  {
    id: 1, 
    userName: "MindfulExplorer", 
    text: "Just completed my first mindfulness meditation. Feeling incredible peace and clarity! 🌿", 
    likes: 284,
    comments: 42,
    shares: 18,
    mood: "peaceful",
    timestamp: "2 minutes ago",
    userLevel: 27,
    userBadges: ["Meditation Expert", "Wellness Champion"],
    verified: true,
    liked: false
  },
  {
    id: 2, 
    userName: "CalmGuide", 
    text: "Our mindfulness group just had an amazing session. The positive energy was palpable! ✨", 
    likes: 567,
    comments: 89,
    shares: 34,
    mood: "calm",
    timestamp: "15 minutes ago",
    userLevel: 42,
    userBadges: ["Mindfulness Teacher", "Group Leader"],
    verified: true,
    liked: false
  }
];

const initialGroups = [
  {
    id: 1, 
    name: "📚 Study Stress & Exams", 
    description: "Share strategies for managing academic pressure and exam anxiety.", 
    members: 2456, 
    isMember: false,
    engagementLevel: 82,
    activity: "high",
    tags: ["academic", "exams", "stress"],
    messages: [
      { 
        id: 1, 
        user: "StudyGuide", 
        text: "Remember to take regular breaks while studying. Pomodoro technique works wonders!", 
        time: "9:30 AM",
        reactions: { like: 5, heart: 2, support: 3 },
        replies: [
          { id: 1, user: "Student123", text: "Thanks for the tip! I'll try this today.", time: "9:45 AM" },
          { id: 2, user: "FocusedMind", text: "Pomodoro changed my study habits completely!", time: "10:15 AM" }
        ]
      },
      { 
        id: 2, 
        user: "ExamSurvivor", 
        text: "Anyone have tips for dealing with test anxiety?", 
        time: "10:45 AM",
        reactions: { like: 8, support: 5 },
        replies: []
      }
    ]
  },
  {
    id: 2, 
    name: "💬 Friends & Social Life", 
    description: "Navigate social challenges and build healthier relationships.", 
    members: 1873, 
    isMember: false,
    engagementLevel: 78,
    activity: "medium",
    tags: ["friendship", "social", "relationships"],
    messages: [
      { 
        id: 1, 
        user: "SocialButterfly", 
        text: "How do you maintain friendships when you're feeling down?", 
        time: "10:15 AM",
        reactions: { like: 4, heart: 7 },
        replies: []
      }
    ]
  },
  {
    id: 3, 
    name: "🏠 Family & Home Issues", 
    description: "Find support for family dynamics and home-related challenges.", 
    members: 1562, 
    isMember: false,
    engagementLevel: 75,
    activity: "medium",
    tags: ["family", "home", "support"],
    messages: [
      { 
        id: 1, 
        user: "FamilyFirst", 
        text: "Dealing with family expectations can be overwhelming sometimes.", 
        time: "8:30 AM",
        reactions: { like: 6, support: 3 },
        replies: []
      }
    ]
  },
  {
    id: 4, 
    name: "💼 Work & Career Pressure", 
    description: "Manage workplace stress and career-related anxieties.", 
    members: 2894, 
    isMember: false,
    engagementLevel: 85,
    activity: "high",
    tags: ["work", "career", "pressure"],
    messages: [
      { 
        id: 1, 
        user: "CareerCoach", 
        text: "Work-life balance is essential for mental health.", 
        time: "9:15 AM",
        reactions: { like: 9, support: 4 },
        replies: []
      }
    ]
  },
  {
    id: 5, 
    name: "💔 Breakups & Relationships", 
    description: "Heal from heartbreak and navigate relationship challenges.", 
    members: 3217, 
    isMember: false,
    engagementLevel: 88,
    activity: "very high",
    tags: ["breakups", "relationships", "healing"],
    messages: [
      { 
        id: 1, 
        user: "HealingHeart", 
        text: "Breakups are tough but remember you're not alone in this.", 
        time: "10:30 AM",
        reactions: { like: 12, heart: 8, support: 5 },
        replies: []
      }
    ]
  },
  {
    id: 6, 
    name: "🌑 Self-Doubt & Confidence", 
    description: "Build self-esteem and overcome negative self-talk.", 
    members: 2756, 
    isMember: false,
    engagementLevel: 80,
    activity: "high",
    tags: ["confidence", "self-esteem", "growth"],
    messages: [
      { 
        id: 1, 
        user: "ConfidentYou", 
        text: "Negative self-talk can be so damaging. How do you combat it?", 
        time: "9:45 AM",
        reactions: { like: 7, support: 4 },
        replies: []
      }
    ]
  },
  {
    id: 7, 
    name: "🚫 Bullying & Discrimination", 
    description: "Find support and resources for dealing with bullying and discrimination.", 
    members: 1893, 
    isMember: false,
    engagementLevel: 83,
    activity: "high",
    tags: ["bullying", "discrimination", "support"],
    messages: [
      { 
        id: 1, 
        user: "StrongTogether", 
        text: "No one should face bullying alone. We're here for each other.", 
        time: "10:10 AM",
        reactions: { like: 10, support: 6, heart: 3 },
        replies: []
      }
    ]
  },
  {
    id: 8, 
    name: "💸 Money & Financial Stress", 
    description: "Manage financial anxiety and develop healthier money habits.", 
    members: 2318, 
    isMember: false,
    engagementLevel: 79,
    activity: "medium",
    tags: ["money", "financial", "stress"],
    messages: [
      { 
        id: 1, 
        user: "FinancialPeace", 
        text: "Budgeting has really helped reduce my money anxiety.", 
        time: "9:30 AM",
        reactions: { like: 5, support: 2 },
        replies: []
      }
    ]
  },
  {
    id: 9, 
    name: "🧠 Anxiety & Panic Support", 
    description: "Share coping strategies and support for anxiety disorders.", 
    members: 3421, 
    isMember: false,
    engagementLevel: 90,
    activity: "very high",
    tags: ["anxiety", "panic", "support"],
    messages: [
      { 
        id: 1, 
        user: "CalmMind", 
        text: "Breathing exercises have been a game changer for my anxiety.", 
        time: "8:45 AM",
        reactions: { like: 15, support: 8, thanks: 3 },
        replies: []
      }
    ]
  },
  {
    id: 10, 
    name: "😴 Sleep & Relaxation", 
    description: "Improve sleep quality and learn relaxation techniques.", 
    members: 1987, 
    isMember: false,
    engagementLevel: 76,
    activity: "medium",
    tags: ["sleep", "relaxation", "wellness"],
    messages: [
      { 
        id: 1, 
        user: "RestfulSleep", 
        text: "Creating a bedtime routine has dramatically improved my sleep quality.", 
        time: "9:00 PM",
        reactions: { like: 8, support: 3 },
        replies: []
      }
    ]
  }
];

const initialLiveEvents = [
  {
    id: 1,
    title: "Guided Meditation Session",
    host: "Mindfulness Coach Sarah",
    participants: 1247,
    startTime: "30 minutes",
    duration: "45 min",
    energyLevel: "calm",
    description: "Join us for a peaceful guided meditation session to reduce stress and improve focus."
  },
  {
    id: 2,
    title: "Anxiety Management Workshop",
    host: "Dr. James Peterson",
    participants: 874,
    startTime: "2 hours",
    duration: "1 hour",
    energyLevel: "informative",
    description: "Learn practical techniques to manage anxiety in daily life from a licensed therapist."
  },
  {
    id: 3,
    title: "Study Skills & Focus Workshop",
    host: "Academic Coach Maria",
    participants: 956,
    startTime: "1 day",
    duration: "1.5 hours",
    energyLevel: "educational",
    description: "Improve your study habits and learn focus techniques for better academic performance."
  }
];

function Community({ user }) {
  const [moodWall, setMoodWall] = useState(initialMoodWall);
  const [groups, setGroups] = useState(initialGroups);
  const [activeTab, setActiveTab] = useState('groups');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newPostText, setNewPostText] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [eventReminders, setEventReminders] = useState({});
  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedGroup?.messages, replyingTo]);

  const handleAddPost = () => {
    if (newPostText.trim() !== "") {
      const newPost = {
        id: Date.now(),
        userName: user?.username || "Anonymous",
        text: newPostText,
        likes: 0,
        comments: 0,
        shares: 0,
        mood: "neutral",
        timestamp: "Just now",
        userLevel: user?.level || 1,
        userBadges: user?.badges || ["New Member"],
        verified: user?.verified || false,
        liked: false
      };
      setMoodWall(prev => [newPost, ...prev]);
      setNewPostText('');
      setIsCreatingPost(false);
    }
  };

  const handleJoinGroup = (groupId) => {
    setGroups(prevGroups => 
      prevGroups.map(group => 
        group.id === groupId ? { 
          ...group, 
          isMember: !group.isMember, 
          members: group.isMember ? group.members - 1 : group.members + 1 
        } : group
      )
    );
  };

  const handleLikePost = (postId) => {
    setMoodWall(prev => 
      prev.map(post => 
        post.id === postId ? { 
          ...post, 
          likes: post.liked ? post.likes - 1 : post.likes + 1,
          liked: !post.liked
        } : post
      )
    );
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== "" && selectedGroup) {
      const updatedGroups = groups.map(group => {
        if (group.id === selectedGroup.id) {
          const newMessageObj = {
            id: group.messages.length + 1,
            user: user?.username || "You",
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reactions: {},
            replies: []
          };
          
          return {
            ...group,
            messages: [...group.messages, newMessageObj]
          };
        }
        return group;
      });
      
      setGroups(updatedGroups);
      setSelectedGroup(updatedGroups.find(g => g.id === selectedGroup.id));
      setNewMessage('');
    }
  };

  const handleReactToMessage = (groupId, messageId, reaction) => {
    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        const updatedMessages = group.messages.map(message => {
          if (message.id === messageId) {
            const currentReactions = { ...message.reactions };
            currentReactions[reaction] = (currentReactions[reaction] || 0) + 1;
            return {
              ...message,
              reactions: currentReactions
            };
          }
          return message;
        });
        
        return {
          ...group,
          messages: updatedMessages
        };
      }
      return group;
    });
    
    setGroups(updatedGroups);
    if (selectedGroup && selectedGroup.id === groupId) {
      setSelectedGroup(updatedGroups.find(g => g.id === groupId));
    }
  };

  const handleReplyToMessage = (groupId, messageId) => {
    if (replyText.trim() !== "") {
      const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          const updatedMessages = group.messages.map(message => {
            if (message.id === messageId) {
              const newReply = {
                id: message.replies.length + 1,
                user: user?.username || "You",
                text: replyText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
              
              return {
                ...message,
                replies: [...message.replies, newReply]
              };
            }
            return message;
          });
          
          return {
            ...group,
            messages: updatedMessages
          };
        }
        return group;
      });
      
      setGroups(updatedGroups);
      if (selectedGroup && selectedGroup.id === groupId) {
        setSelectedGroup(updatedGroups.find(g => g.id === groupId));
      }
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const handleEditMessage = (groupId, messageId, newText) => {
    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        const updatedMessages = group.messages.map(message => {
          if (message.id === messageId && message.user === (user?.username || "You")) {
            return {
              ...message,
              text: newText,
              edited: true
            };
          }
          return message;
        });
        
        return {
          ...group,
          messages: updatedMessages
        };
      }
      return group;
    });
    
    setGroups(updatedGroups);
    if (selectedGroup && selectedGroup.id === groupId) {
      setSelectedGroup(updatedGroups.find(g => g.id === groupId));
    }
    setEditingMessage(null);
  };

  const handleDeleteMessage = (groupId, messageId) => {
    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        const updatedMessages = group.messages.filter(message => 
          !(message.id === messageId && message.user === (user?.username || "You"))
        );
        
        return {
          ...group,
          messages: updatedMessages
        };
      }
      return group;
    });
    
    setGroups(updatedGroups);
    if (selectedGroup && selectedGroup.id === groupId) {
      setSelectedGroup(updatedGroups.find(g => g.id === groupId));
    }
  };

  const handleJoinEvent = (eventId) => {
    alert(`You've joined the event! We'll send you a reminder before it starts.`);
  };

  const handleSetReminder = (eventId) => {
    setEventReminders(prev => ({
      ...prev,
      [eventId]: true
    }));
    alert(`Reminder set for this event!`);
  };

  const renderEngagementIndicator = (level) => {
    return (
      <div className="engagement-indicator">
        <div className="engagement-bar">
          <div className="engagement-fill" style={{ width: `${level}%` }}></div>
        </div>
        <span className="engagement-value">{level}%</span>
      </div>
    );
  };

  const renderActivityLevel = (level) => {
    const levels = {
      "very high": { color: "#10B981", label: "Very Active" },
      "high": { color: "#84CC16", label: "Active" },
      "medium": { color: "#F59E0B", label: "Moderate" },
      "low": { color: "#EF4444", label: "Low" }
    };
    
    return (
      <span className="activity-level" style={{ color: levels[level]?.color }}>
        ● {levels[level]?.label}
      </span>
    );
  };

  return (
    <div className="community-hub">
      <div className="community-header">
        <h2>
          <span className="main-title">Community</span>
        </h2>
        <div className="community-controls">
          <div className="view-toggles">
            <button className={`view-toggle ${activeTab === 'feed' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('feed')}>
              <span className="toggle-icon">💬</span> Feed
            </button>
            <button className={`view-toggle ${activeTab === 'groups' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('groups')}>
              <span className="toggle-icon">👥</span> Groups
            </button>
            <button className={`view-toggle ${activeTab === 'events' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('events')}>
              <span className="toggle-icon">📅</span> Events
            </button>
          </div>
        </div>
      </div>

      <div className="community-layout">
        <div className="main-content">
          {activeTab === 'feed' && (
            <div className="mood-wall-section">
              <div className="section-header">
                <h3>Community Feed</h3>
              </div>
              
              <div className="create-post-card">
                <div className="user-avatar">
                  {user?.username?.charAt(0) || "A"}
                </div>
                <div className="post-input">
                  <textarea 
                    placeholder="Share your thoughts with the community..." 
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    onFocus={() => setIsCreatingPost(true)}
                  ></textarea>
                  {isCreatingPost && (
                    <div className="post-options">
                      <div className="mood-selector">
                        <span>How are you feeling?</span>
                        <div className="mood-options">
                          {["peaceful", "happy", "calm", "neutral", "anxious", "sad"].map(mood => (
                            <button key={mood} className="mood-option">{mood}</button>
                          ))}
                        </div>
                      </div>
                      <div className="post-actions">
                        <button className="cancel-btn" onClick={() => {
                          setIsCreatingPost(false);
                          setNewPostText('');
                        }}>Cancel</button>
                        <button className="share-btn" onClick={handleAddPost}>Share</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="post-list">
                {moodWall.map(post => (
                  <div key={post.id} className="post-card">
                    <div className="post-header">
                      <div className="user-info">
                        <div className="post-avatar">{post.userName.charAt(0)}</div>
                        <div className="user-details">
                          <div className="username-row">
                            <span className="post-username">{post.userName}</span>
                            {post.verified && <span className="verified-badge">✓</span>}
                            <span className="user-level">Level {post.userLevel}</span>
                          </div>
                          <span className="post-timestamp">{post.timestamp}</span>
                        </div>
                      </div>
                      <div className="post-mood">
                        <span className={`mood-indicator ${post.mood}`}></span>
                        {post.mood}
                      </div>
                    </div>
                    <p className="post-content">{post.text}</p>
                    <div className="post-badges">
                      {post.userBadges.map((badge, index) => (
                        <span key={index} className="badge">{badge}</span>
                      ))}
                    </div>
                    <div className="post-actions">
                      <button 
                        className={`action-btn like ${post.liked ? 'active' : ''}`} 
                        onClick={() => handleLikePost(post.id)}
                      >
                        <span className="icon">👍</span> Like ({post.likes})
                      </button>
                      <button className="action-btn comment">
                        <span className="icon">💬</span> Comment ({post.comments})
                      </button>
                      <button className="action-btn share">
                        <span className="icon">↗️</span> Share ({post.shares})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'groups' && !selectedGroup && (
            <div className="groups-grid">
              <h3>Support Groups</h3>
              <div className="groups-container">
                {groups.map(group => (
                  <div key={group.id} className={`group-card ${group.isMember ? 'joined' : ''}`}>
                    <div className="group-header">
                      <h4>{group.name}</h4>
                      {renderEngagementIndicator(group.engagementLevel)}
                    </div>
                    <p className="group-description">{group.description}</p>
                    <div className="group-meta">
                      <div className="group-stats">
                        <span className="members-count">👥 {group.members.toLocaleString()} members</span>
                        {renderActivityLevel(group.activity)}
                      </div>
                      <div className="group-tags">
                        {group.tags.map(tag => (
                          <span key={tag} className="tag">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="group-footer">
                      <button 
                        className={`join-btn ${group.isMember ? 'joined' : ''}`}
                        onClick={() => handleJoinGroup(group.id)}
                      >
                        {group.isMember ? 'Joined' : 'Join Group'}
                      </button>
                      <button 
                        className="explore-btn"
                        onClick={() => setSelectedGroup(group)}
                      >
                        {group.isMember ? 'Enter Chat' : 'View Group'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'groups' && selectedGroup && (
            <div className="group-chat-container">
              <div className="chat-header">
                <button className="back-button" onClick={() => setSelectedGroup(null)}>
                  ← Back
                </button>
                <h3>{selectedGroup.name}</h3>
                <div className="member-count">
                  {selectedGroup.members} members
                </div>
              </div>
              
              <div className="chat-messages">
                {selectedGroup.messages.map(message => (
                  <div key={message.id} className="message-container">
                    <div 
                      className={`message ${message.user === (user?.username || "You") ? 'own-message' : ''}`}
                    >
                      <div className="message-header">
                        <span className="message-user">{message.user}</span>
                        <span className="message-time">{message.time}</span>
                        {message.edited && <span className="edited-indicator">(edited)</span>}
                        {message.user === (user?.username || "You") && (
                          <div className="message-actions">
                            <button 
                              className="edit-btn"
                              onClick={() => setEditingMessage({id: message.id, text: message.text})}
                            >
                              Edit
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => handleDeleteMessage(selectedGroup.id, message.id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {editingMessage && editingMessage.id === message.id ? (
                        <div className="edit-message-container">
                          <input
                            type="text"
                            value={editingMessage.text}
                            onChange={(e) => setEditingMessage({...editingMessage, text: e.target.value})}
                            className="edit-message-input"
                          />
                          <div className="edit-actions">
                            <button 
                              className="save-edit-btn"
                              onClick={() => handleEditMessage(selectedGroup.id, message.id, editingMessage.text)}
                            >
                              Save
                            </button>
                            <button 
                              className="cancel-edit-btn"
                              onClick={() => setEditingMessage(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="message-content">{message.text}</div>
                      )}
                      
                      <div className="message-reactions">
                        {Object.entries(message.reactions).map(([reaction, count]) => (
                          <span key={reaction} className="reaction">
                            {reaction === 'like' && '👍'}
                            {reaction === 'heart' && '❤️'}
                            {reaction === 'support' && '🤗'}
                            {reaction === 'thanks' && '🙏'}
                            {count}
                          </span>
                        ))}
                        <button 
                          className="add-reaction-btn"
                          onClick={() => handleReactToMessage(selectedGroup.id, message.id, 'like')}
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="message-actions-bottom">
                        <button 
                          className="react-btn"
                          onClick={() => handleReactToMessage(selectedGroup.id, message.id, 'like')}
                        >
                          👍 Like
                        </button>
                        <button 
                          className="reply-btn"
                          onClick={() => setReplyingTo(replyingTo === message.id ? null : message.id)}
                        >
                          💬 Reply
                        </button>
                      </div>
                    </div>
                    
                    {/* Replies */}
                    {message.replies && message.replies.length > 0 && (
                      <div className="replies-container">
                        {message.replies.map(reply => (
                          <div key={reply.id} className="reply">
                            <div className="reply-header">
                              <span className="reply-user">{reply.user}</span>
                              <span className="reply-time">{reply.time}</span>
                            </div>
                            <div className="reply-content">{reply.text}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Reply input */}
                    {replyingTo === message.id && (
                      <div className="reply-input-container">
                        <input
                          type="text"
                          placeholder="Type your reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="reply-input"
                        />
                        <div className="reply-actions">
                          <button 
                            className="send-reply-btn"
                            onClick={() => handleReplyToMessage(selectedGroup.id, message.id)}
                          >
                            Send
                          </button>
                          <button 
                            className="cancel-reply-btn"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="chat-input-container">
                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="chat-input"
                />
                <button 
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="events-section">
              <h3>Live Events & Workshops</h3>
              <div className="events-container">
                {initialLiveEvents.map(event => (
                  <div key={event.id} className="event-card">
                    <div className="event-header">
                      <h4>{event.title}</h4>
                      <div className="event-status live">LIVE</div>
                    </div>
                    <div className="event-details">
                      <div className="event-host">
                        <span className="label">Host:</span>
                        <span className="value">{event.host}</span>
                      </div>
                      <div className="event-participants">
                        <span className="label">Participants:</span>
                        <span className="value">{event.participants.toLocaleString()}</span>
                      </div>
                      <div className="event-time">
                        <span className="label">Starts in:</span>
                        <span className="value">{event.startTime}</span>
                      </div>
                      <div className="event-energy">
                        <span className="label">Vibe:</span>
                        <span className="value">{event.energyLevel}</span>
                      </div>
                      <div className="event-description">
                        <p>{event.description}</p>
                      </div>
                    </div>
                    <div className="event-actions">
                      <button 
                        className="join-event-btn"
                        onClick={() => handleJoinEvent(event.id)}
                      >
                        Join Event
                      </button>
                      <button 
                        className={`remind-btn ${eventReminders[event.id] ? 'reminder-set' : ''}`}
                        onClick={() => handleSetReminder(event.id)}
                      >
                        {eventReminders[event.id] ? 'Reminder Set' : 'Set Reminder'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Community;