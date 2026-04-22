import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Community.css';
import { API_BASE_URL } from '../api';

const INITIAL_MOOD_WALL = [
  {
    id: 1,
    userName: 'QuietSoul_22',
    text: 'Today felt small but meaningful. I stepped outside for a few minutes and that counted.',
    likes: 847,
    mood: 'proud',
    timestamp: '4 minutes ago',
    userBadges: ['Consistent'],
    verified: false,
  },
  {
    id: 2,
    userName: 'Anonymous',
    text: 'I still feel tired in a way that is hard to explain, but saying it out loud helps.',
    likes: 1243,
    mood: 'relieved',
    timestamp: '18 minutes ago',
    userBadges: [],
    verified: false,
  },
  {
    id: 3,
    userName: 'MindfulMeera',
    text: 'A grounding trick that helps me: notice five things you can see before reacting to the anxious thought.',
    likes: 2104,
    mood: 'calm',
    timestamp: '42 minutes ago',
    userBadges: ['Community Helper'],
    verified: true,
  },
  {
    id: 4,
    userName: 'HiddenSunrise',
    text: 'Family still treats mental health like weakness. Hearing from people who understand makes a real difference.',
    likes: 3871,
    mood: 'frustrated',
    timestamp: '1 hour ago',
    userBadges: [],
    verified: false,
  },
];

const INITIAL_GROUPS = [
  {
    id: 1,
    name: 'Academic Stress Circle',
    description: 'Peer support for exams, burnout, pressure, and concentration struggles.',
    members: 2456,
    isMember: false,
    activity: 'high',
    tags: ['study', 'stress', 'focus'],
    messages: [
      {
        id: 1,
        user: 'Priya_M',
        time: '2h ago',
        text: 'Does anyone else feel blank during exams even after preparing well?',
        reactions: { appreciate: 4 },
        replies: [{ id: 1, user: 'RohanK', time: '1h ago', text: 'Yes. I do better when I practice under timed conditions.' }],
      },
      {
        id: 2,
        user: 'Ananya_S',
        time: '40m ago',
        text: 'I changed my study system this term and my stress dropped a lot. Smaller sessions helped more than long cramming.',
        reactions: { appreciate: 6 },
        replies: [],
      },
    ],
  },
  {
    id: 2,
    name: 'Work and Burnout Room',
    description: 'A place to talk about work overload, boundaries, and recovery.',
    members: 2894,
    isMember: false,
    activity: 'high',
    tags: ['career', 'burnout', 'boundaries'],
    messages: [
      {
        id: 1,
        user: 'SeniorManya',
        time: '3h ago',
        text: 'If workload keeps expanding, frame the conversation around priorities instead of blame.',
        reactions: { appreciate: 9 },
        replies: [],
      },
    ],
  },
  {
    id: 3,
    name: 'Relationships and Healing',
    description: 'Support for grief, breakups, attachment patterns, and emotional recovery.',
    members: 3217,
    isMember: false,
    activity: 'very high',
    tags: ['relationships', 'healing', 'grief'],
    messages: [
      {
        id: 1,
        user: 'Nalini_H',
        time: '50m ago',
        text: 'Healing is not linear. Good days and difficult days can both belong to progress.',
        reactions: { appreciate: 11 },
        replies: [],
      },
    ],
  },
  {
    id: 4,
    name: 'Anxiety Support Room',
    description: 'Grounding techniques, panic support, and shared experiences with anxiety.',
    members: 3421,
    isMember: false,
    activity: 'very high',
    tags: ['anxiety', 'panic', 'grounding'],
    messages: [
      {
        id: 1,
        user: 'CalmBreath_A',
        time: '20m ago',
        text: 'Naming the panic early helps me interrupt the spiral faster.',
        reactions: { appreciate: 15 },
        replies: [],
      },
    ],
  },
  {
    id: 5,
    name: 'Sleep Reset Collective',
    description: 'For broken sleep, racing thoughts at night, and gentler evening routines.',
    members: 1842,
    isMember: false,
    activity: 'steady',
    tags: ['sleep', 'night', 'recovery'],
    messages: [
      {
        id: 1,
        user: 'LateNightA',
        time: '35m ago',
        text: 'A lower-light hour before bed is helping more than I expected.',
        reactions: { appreciate: 5 },
        replies: [],
      },
    ],
  },
  {
    id: 6,
    name: 'Quiet Men Support',
    description: 'A softer space for stress, vulnerability, identity pressure, and emotional openness.',
    members: 1338,
    isMember: false,
    activity: 'high',
    tags: ['men', 'identity', 'support'],
    messages: [
      {
        id: 1,
        user: 'Harsh_92',
        time: '1h ago',
        text: 'Talking honestly has been harder than working through the stress itself.',
        reactions: { appreciate: 7 },
        replies: [],
      },
    ],
  },
  {
    id: 7,
    name: 'Women and Emotional Load',
    description: 'Discuss invisible labor, boundaries, overwhelm, and carrying too much for too long.',
    members: 2679,
    isMember: false,
    activity: 'very high',
    tags: ['women', 'boundaries', 'load'],
    messages: [
      {
        id: 1,
        user: 'Sana_R',
        time: '12m ago',
        text: 'I am practicing asking for help before I hit the breaking point.',
        reactions: { appreciate: 12 },
        replies: [],
      },
    ],
  },
  {
    id: 8,
    name: 'Healing After Loss',
    description: 'A room for grief, memory, emptiness, and the strange rhythm of missing someone.',
    members: 1951,
    isMember: false,
    activity: 'high',
    tags: ['grief', 'loss', 'memory'],
    messages: [
      {
        id: 1,
        user: 'StillHere_8',
        time: '28m ago',
        text: 'Some days the smallest reminders are the hardest. Naming that helps.',
        reactions: { appreciate: 8 },
        replies: [],
      },
    ],
  },
];

const INITIAL_LIVE_EVENTS = [
  {
    id: 1,
    title: 'Guided Meditation Session',
    host: 'Mindfulness Coach Sarah',
    participants: 1247,
    startTime: '30 minutes',
    duration: '45 min',
    description: 'A quiet guided session for stress reduction and grounding.',
  },
  {
    id: 2,
    title: 'Anxiety Skills Workshop',
    host: 'Dr. James Peterson',
    participants: 874,
    startTime: '2 hours',
    duration: '1 hour',
    description: 'Practical daily techniques for working with anxious thoughts and body signals.',
  },
  {
    id: 3,
    title: 'Study Focus Reset',
    host: 'Academic Coach Maria',
    participants: 956,
    startTime: 'Tomorrow',
    duration: '90 min',
    description: 'A workshop on focus, pacing, and study habits that reduce overwhelm.',
  },
];

const TAB_CONFIG = [
  { key: 'feed', label: 'Feed', description: 'Anonymous reflections' },
  { key: 'groups', label: 'Groups', description: 'Focused rooms' },
  { key: 'events', label: 'Events', description: 'Live sessions' },
];

const MOOD_LABELS = {
  peaceful: 'Peaceful',
  happy: 'Hopeful',
  neutral: 'Steady',
  anxious: 'Anxious',
  sad: 'Low',
  stressed: 'Stressed',
  proud: 'Proud',
  relieved: 'Relieved',
  calm: 'Calm',
  frustrated: 'Frustrated',
};

const SUPPORT_REACTIONS = [
  { type: 'upvote', label: 'Relatable' },
  { type: 'same_feeling', label: 'Same here' },
  { type: 'support', label: 'Support' },
];

function Community({ user }) {
  const isAdmin = user?.role === 'admin';
  const [communityPosts, setCommunityPosts] = useState([]);
  const [selectedMood, setSelectedMood] = useState('neutral');
  const [newPostText, setNewPostText] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [eventReminders, setEventReminders] = useState({});
  const [reportingPostId, setReportingPostId] = useState(null);
  const [reportReason, setReportReason] = useState('Harassment');
  const [reportDetails, setReportDetails] = useState('');
  const [moderationQueue, setModerationQueue] = useState([]);
  const [moderationLoading, setModerationLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const joinedGroupsCount = groups.filter((group) => group.isMember).length;
  const totalMembers = groups.reduce((sum, group) => sum + group.members, 0);
  const trendingTags = useMemo(() => {
    const tagCount = new Map();
    groups.forEach((group) => {
      group.tags.forEach((tag) => tagCount.set(tag, (tagCount.get(tag) || 0) + 1));
    });
    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag]) => tag);
  }, [groups]);
  const highlightedGroups = useMemo(
    () => groups.filter((group) => group.activity.includes('high')).slice(0, 3),
    [groups]
  );

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/community/posts`, { credentials: 'include' });
      const data = await response.json();
      if (data.status === 'success') {
        setCommunityPosts(data.posts);
      }
    } catch (err) {
      console.error('Failed to fetch community posts', err);
    }
  };

  const fetchModerationQueue = async () => {
    if (!isAdmin) return;
    setModerationLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/community/reports`, { credentials: 'include' });
      const data = await response.json();
      if (response.ok && data.success) {
        setModerationQueue(data.reports || []);
      }
    } catch (err) {
      console.error('Failed to fetch moderation queue', err);
    } finally {
      setModerationLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchModerationQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedGroup?.messages, replyingTo]);

  const displayPosts = communityPosts.length > 0 ? communityPosts : INITIAL_MOOD_WALL;

  const showToast = (message, color = '#233127') => {
    const toast = document.createElement('div');
    toast.innerHTML = `<span>${message}</span><button style="background:transparent;border:none;color:white;cursor:pointer;font-weight:700;margin-left:12px;opacity:0.84;font-size:13px;">Close</button>`;
    toast.style.cssText = `display:flex;align-items:center;position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:${color};color:white;padding:12px 20px;border-radius:16px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 18px 40px rgba(0,0,0,0.2);font-family:Manrope,sans-serif;white-space:nowrap`;
    toast.querySelector('button').onclick = () => {
      if (document.body.contains(toast)) toast.remove();
    };
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) toast.remove();
    }, 3500);
  };

  const handleAddPost = async () => {
    if (!newPostText.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/community/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mood_tag: selectedMood,
          content: newPostText,
        }),
      });

      if (response.ok) {
        setNewPostText('');
        setIsCreatingPost(false);
        fetchPosts();
        showToast('Shared anonymously with the community.', '#2f6f4d');
      }
    } catch (err) {
      console.error('Failed to share mood', err);
      showToast('Could not share right now. Please try again.', '#9f3434');
    }
  };

  const handleReactToPost = async (postId, reactionType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/community/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          post_id: postId,
          reaction_type: reactionType,
        }),
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (err) {
      console.error('Failed to react', err);
    }
  };

  const handleReportPost = async (postId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: reportReason, details: reportDetails }),
      });
      const data = await response.json();
      if (!response.ok || data.status !== 'success') {
        showToast(data.message || 'Could not submit the report.', '#9f3434');
        return;
      }
      showToast('Report submitted for moderator review.', '#2f6f4d');
      setReportingPostId(null);
      setReportDetails('');
      if (isAdmin) fetchModerationQueue();
    } catch (err) {
      console.error('Failed to report post', err);
      showToast('Could not submit the report.', '#9f3434');
    }
  };

  const handleModerationAction = async (reportId, action) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/community/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action,
          resolutionNote: action === 'dismiss' ? 'Reviewed and left visible.' : `Moderator action: ${action}`,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        showToast(data.message || 'Could not save the moderation action.', '#9f3434');
        return;
      }
      showToast('Moderation queue updated.', '#2f6f4d');
      fetchModerationQueue();
      fetchPosts();
    } catch (err) {
      console.error('Failed moderation action', err);
      showToast('Could not save the moderation action.', '#9f3434');
    }
  };

  const handleJoinGroup = (groupId) => {
    const updatedGroups = groups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            isMember: !group.isMember,
            members: group.isMember ? group.members - 1 : group.members + 1,
          }
        : group
    );

    setGroups(updatedGroups);
    if (selectedGroup && selectedGroup.id === groupId) {
      setSelectedGroup(updatedGroups.find((group) => group.id === groupId));
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedGroup) return;

    const updatedGroups = groups.map((group) => {
      if (group.id !== selectedGroup.id) return group;

      const nextMessage = {
        id: group.messages.length + 1,
        user: user?.username || 'You',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: {},
        replies: [],
      };

      return { ...group, messages: [...group.messages, nextMessage] };
    });

    setGroups(updatedGroups);
    setSelectedGroup(updatedGroups.find((group) => group.id === selectedGroup.id));
    setNewMessage('');
  };

  const handleReactToMessage = (groupId, messageId, reaction) => {
    const updatedGroups = groups.map((group) => {
      if (group.id !== groupId) return group;

      return {
        ...group,
        messages: group.messages.map((message) => {
          if (message.id !== messageId) return message;
          const reactions = { ...message.reactions };
          reactions[reaction] = (reactions[reaction] || 0) + 1;
          return { ...message, reactions };
        }),
      };
    });

    setGroups(updatedGroups);
    if (selectedGroup && selectedGroup.id === groupId) {
      setSelectedGroup(updatedGroups.find((group) => group.id === groupId));
    }
  };

  const handleReplyToMessage = (groupId, messageId) => {
    if (!replyText.trim()) return;

    const updatedGroups = groups.map((group) => {
      if (group.id !== groupId) return group;

      return {
        ...group,
        messages: group.messages.map((message) => {
          if (message.id !== messageId) return message;
          const reply = {
            id: message.replies.length + 1,
            user: user?.username || 'You',
            text: replyText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          return { ...message, replies: [...message.replies, reply] };
        }),
      };
    });

    setGroups(updatedGroups);
    if (selectedGroup && selectedGroup.id === groupId) {
      setSelectedGroup(updatedGroups.find((group) => group.id === groupId));
    }
    setReplyText('');
    setReplyingTo(null);
  };

  const handleEditMessage = (groupId, messageId, updatedText) => {
    const updatedGroups = groups.map((group) => {
      if (group.id !== groupId) return group;

      return {
        ...group,
        messages: group.messages.map((message) =>
          message.id === messageId && message.user === (user?.username || 'You')
            ? { ...message, text: updatedText, edited: true }
            : message
        ),
      };
    });

    setGroups(updatedGroups);
    if (selectedGroup && selectedGroup.id === groupId) {
      setSelectedGroup(updatedGroups.find((group) => group.id === groupId));
    }
    setEditingMessage(null);
  };

  const handleDeleteMessage = (groupId, messageId) => {
    const updatedGroups = groups.map((group) => {
      if (group.id !== groupId) return group;

      return {
        ...group,
        messages: group.messages.filter(
          (message) => !(message.id === messageId && message.user === (user?.username || 'You'))
        ),
      };
    });

    setGroups(updatedGroups);
    if (selectedGroup && selectedGroup.id === groupId) {
      setSelectedGroup(updatedGroups.find((group) => group.id === groupId));
    }
  };

  const handleJoinEvent = () => {
    showToast("You're in. We'll remind you before it starts.", '#2f6f4d');
  };

  const handleSetReminder = (eventId) => {
    setEventReminders((prev) => ({ ...prev, [eventId]: true }));
    showToast('Reminder saved for this event.', '#466d5a');
  };

  const getTabCount = (tabKey) => {
    if (tabKey === 'feed') return displayPosts.length;
    if (tabKey === 'groups') return groups.length;
    return INITIAL_LIVE_EVENTS.length;
  };

  return (
    <div className="community-hub">
      <div className="community-header">
        <div className="header-content-elite">
          <div className="title-section">
            <span className="community-kicker">Protected space</span>
            <h2 className="main-title">Connect</h2>
            <p className="sub-title">Anonymous reflection, small support rooms, and live guided spaces that feel calmer on mobile and easier to trust.</p>
          </div>
          <div className="stats-section-elite">
            <div className="stat-pill-elite active">
              <span className="dot" />
              <span className="stat-label">Sample community preview</span>
            </div>
            <div className="stat-pill-elite">
              <span className="stat-label">{joinedGroupsCount} rooms joined</span>
            </div>
            <div className="stat-pill-elite">
              <span className="stat-label">Anonymity rules still in progress</span>
            </div>
          </div>
        </div>

        <div className="community-controls">
          <div className="view-toggles">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.key}
                className={`view-toggle ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.key);
                  if (tab.key !== 'groups') setSelectedGroup(null);
                }}
              >
                <span className="view-toggle-copy">
                  <strong>{tab.label}</strong>
                  <small>{tab.description}</small>
                </span>
                <span className="view-toggle-count">{getTabCount(tab.key)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="community-layout">
        <div className="community-hero-card card-dark">
          <div>
            <span className="community-section-tag">Protected space</span>
            <h3>{getTabCount(activeTab)} groups are active</h3>
            <p>Read quietly, share anonymously, or step into a smaller room when you want more grounded conversation.</p>
          </div>
          <div className="community-hero-metrics">
            <div className="community-hero-metric">
              <strong>{totalMembers.toLocaleString()}</strong>
              <span>Total room members</span>
            </div>
            <div className="community-hero-metric">
              <strong>{highlightedGroups.length}</strong>
              <span>Trending rooms</span>
            </div>
            <div className="community-hero-metric">
              <strong>Preview</strong>
              <span>Moderation workflow not live</span>
            </div>
          </div>
        </div>

        {isAdmin && activeTab === 'feed' && (
          <div className="community-discovery-card community-admin-card">
            <span className="community-section-tag">Moderator queue</span>
            <h3>Review reported posts before this becomes a public surface.</h3>
            <p>{moderationLoading ? 'Loading reports...' : `${moderationQueue.length} reports need visibility review or dismissal.`}</p>
            <div className="community-admin-queue">
              {moderationQueue.slice(0, 5).map((report) => (
                <div key={report.id} className="community-admin-item">
                  <div>
                    <strong>{report.reason}</strong>
                    <p>{report.content}</p>
                    <small>Status: {report.status} | Post is {report.visibility_status}</small>
                  </div>
                  <div className="community-admin-actions">
                    <button className="support-btn" onClick={() => handleModerationAction(report.id, 'dismiss')}>Dismiss</button>
                    <button className="support-btn" onClick={() => handleModerationAction(report.id, 'hide_post')}>Hide post</button>
                    <button className="support-btn" onClick={() => handleModerationAction(report.id, 'restore_post')}>Restore</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'groups' && !selectedGroup && (
          <div className="community-discovery-strip">
            <div className="community-discovery-card card-dark">
              <span className="community-section-tag">Suggested now</span>
              <h3>Start with rooms that match your pace.</h3>
              <p>High-activity rooms move fast. Steady rooms feel calmer and easier to trust.</p>
            </div>
            <div className="community-tag-row">
              {trendingTags.map((tag) => (
                <span key={tag} className="community-tag-chip">#{tag}</span>
              ))}
            </div>
          </div>
        )}

        <div className="main-content">
          {activeTab === 'feed' && (
            <>
              <div className="create-post-card">
                <div className="composer-heading">
                  <div>
                    <span className="community-section-tag">Anonymous note</span>
                    <h3>Share what feels true right now.</h3>
                  </div>
                  <p>{displayPosts.length.toLocaleString()} reflections are visible in this space.</p>
                </div>

                <textarea
                  className="post-input"
                  placeholder="What feels true right now?"
                  value={newPostText}
                  onChange={(event) => setNewPostText(event.target.value)}
                  onFocus={() => setIsCreatingPost(true)}
                />

                <motion.div
                  initial={false}
                  animate={{ height: isCreatingPost ? 'auto' : 0, opacity: isCreatingPost ? 1 : 0 }}
                  className="composer-expand"
                >
                  <div className="composer-note">
                    <span className="dot" />
                    <span>Keep it honest, kind, and free of identifying details.</span>
                  </div>

                  <div className="mood-selector compact">
                    <span className="mood-selector-label">How does it feel?</span>
                    <div className="mood-options">
                      {['peaceful', 'happy', 'neutral', 'anxious', 'sad', 'stressed'].map((mood) => (
                        <button
                          key={mood}
                          type="button"
                          className={`mood-option-tag ${selectedMood === mood ? 'active' : ''}`}
                          onClick={() => setSelectedMood(mood)}
                        >
                          {MOOD_LABELS[mood]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="post-actions">
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setIsCreatingPost(false);
                        setNewPostText('');
                      }}
                    >
                      Cancel
                    </button>
                    <button className="share-btn primary" onClick={handleAddPost} disabled={!newPostText.trim()}>
                      Share anonymously
                    </button>
                  </div>
                </motion.div>
              </div>

              <div className="post-list">
                {displayPosts.map((post, index) => {
                  const mood = post.mood_tag || post.mood || 'neutral';
                  const content = post.content || post.text;
                  const timeLabel = post.created_at
                    ? new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : post.timestamp || 'Just now';
                  const reactionCounts = post.reactions || {};

                  return (
                    <motion.div
                      key={post.id}
                      className="post-card anonymous-post"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      whileHover={{ y: -2 }}
                    >
                      <div className="post-shell">
                        <div className="post-header">
                          <div className="post-author">
                            <div className="post-avatar">{(post.userName || 'A').charAt(0)}</div>
                            <div>
                              <div className="post-author-name">{post.userName || 'Anonymous'}</div>
                              <div className="post-meta-row">
                                <span className={`mood-indicator ${mood}`} />
                                <span className="post-meta-copy">{MOOD_LABELS[mood] || mood}</span>
                              </div>
                            </div>
                          </div>
                          <span className="post-time">{timeLabel}</span>
                        </div>

                        <p className="post-content">"{content}"</p>
                        {isAdmin && post.visibility_status && (
                          <div className="post-badge-row">
                            <span className="post-badge">{post.visibility_status}</span>
                            {post.moderation_note ? <span className="post-badge trusted">{post.moderation_note}</span> : null}
                          </div>
                        )}

                        {(post.userBadges?.length > 0 || post.verified) && (
                          <div className="post-badge-row">
                            {post.userBadges?.map((badge) => (
                              <span key={badge} className="post-badge">{badge}</span>
                            ))}
                            {post.verified && <span className="post-badge trusted">Verified helper</span>}
                          </div>
                        )}

                        <div className="support-reactions">
                          {SUPPORT_REACTIONS.map((button) => (
                            <button
                              key={button.type}
                              className="support-btn"
                              onClick={() => handleReactToPost(post.id, button.type)}
                            >
                              <span>{button.label}</span>
                              <span className="react-count">{reactionCounts[button.type] || post.likes || 0}</span>
                            </button>
                          ))}
                          <button
                            className="support-btn"
                            onClick={() => {
                              setReportingPostId(post.id);
                              setReportReason('Harassment');
                            }}
                          >
                            <span>Report</span>
                          </button>
                        </div>
                        {reportingPostId === post.id && (
                          <div className="community-report-box">
                            <select value={reportReason} onChange={(event) => setReportReason(event.target.value)} className="th-select">
                              <option>Harassment</option>
                              <option>Spam</option>
                              <option>Triggering content</option>
                              <option>Privacy concern</option>
                            </select>
                            <textarea
                              className="post-input"
                              style={{ minHeight: '84px', marginTop: '10px' }}
                              value={reportDetails}
                              onChange={(event) => setReportDetails(event.target.value)}
                              placeholder="Optional details for the moderator queue"
                            />
                            <div className="post-actions">
                              <button className="cancel-btn" onClick={() => setReportingPostId(null)}>Cancel</button>
                              <button className="share-btn primary" onClick={() => handleReportPost(post.id)}>Submit report</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'groups' && !selectedGroup && (
            <motion.div
              className="groups-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div className="groups-header-elite">
                <span className="community-section-tag">Small rooms</span>
                <h3>Choose a support circle that fits your headspace.</h3>
                <p>Each room has a clearer topic, so it feels more useful and less noisy than one big feed.</p>
              </div>

              <div className="featured-group-strip">
                {highlightedGroups.map((group) => (
                  <div key={group.id} className="featured-group-card">
                    <span className="community-section-tag">Trending room</span>
                    <strong>{group.name}</strong>
                    <span>{group.members.toLocaleString()} members</span>
                  </div>
                ))}
              </div>

              <div className="groups-container">
                {groups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    className={`group-card-elite ${group.isMember ? 'joined' : ''}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ y: -2 }}
                  >
                    <div className={`card-accent-bar ${group.activity.includes('high') ? 'accent-purple' : ''}`} />
                    <div className="gc-header-row">
                      <div>
                        <h4 className="gc-title">{group.name}</h4>
                        <p className="gc-desc">{group.description}</p>
                      </div>
                      {group.isMember && <span className="gc-member-badge">Joined</span>}
                    </div>

                    <div className="gc-meta-row">
                      <span className="gc-pill gc-pill--members">{group.members.toLocaleString()} members</span>
                      <span className={`gc-pill gc-pill--activity ${group.activity.includes('high') ? 'hot' : 'steady'}`}>
                        {group.activity}
                      </span>
                    </div>

                    <div className="gc-tags">
                      {group.tags.map((tag) => (
                        <span key={tag} className="gc-tag">#{tag}</span>
                      ))}
                    </div>

                    {group.messages[0] && (
                      <div className="gc-preview">
                        <span className="gc-preview-label">Recent note</span>
                        <p>{group.messages[0].text}</p>
                      </div>
                    )}

                    <div className="gc-footer">
                      <button
                        className={`gc-btn gc-btn--secondary ${group.isMember ? 'muted' : ''}`}
                        onClick={() => handleJoinGroup(group.id)}
                      >
                        {group.isMember ? 'Leave' : 'Join'}
                      </button>
                      <button className="gc-btn gc-btn--primary" onClick={() => setSelectedGroup(group)}>
                        {group.isMember ? 'Open room' : 'Preview room'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'groups' && selectedGroup && (
            <motion.div
              className="group-portal"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28 }}
            >
              <div className="portal-header">
                <button className="portal-back-btn" onClick={() => setSelectedGroup(null)}>
                  Back
                </button>
                <div className="portal-title-block">
                  <span className="community-section-tag">Group room</span>
                  <h3 className="portal-group-name">{selectedGroup.name}</h3>
                  <span className="portal-members-badge">{selectedGroup.members.toLocaleString()} members</span>
                </div>
                <span className={`portal-live-dot ${selectedGroup.activity.includes('high') ? 'active' : ''}`}>
                  {selectedGroup.activity.includes('high') ? 'Active now' : 'Steady pace'}
                </span>
              </div>

              <div className="portal-messages">
                {selectedGroup.messages.length === 0 ? (
                  <div className="portal-empty-state">
                    <div className="portal-empty-icon">No notes yet</div>
                    <h4>No messages yet</h4>
                    <p>Be the first to start the conversation in this room.</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {selectedGroup.messages.map((message) => (
                      <motion.div
                        key={message.id}
                        className={`portal-msg ${message.user === (user?.username || 'You') ? 'own' : ''}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="portal-msg-avatar">{(message.user || 'A').charAt(0).toUpperCase()}</div>
                        <div className="portal-msg-body">
                          <div className="portal-msg-meta">
                            <span className="portal-msg-user">{message.user}</span>
                            <span className="portal-msg-time">{message.time}</span>
                          </div>

                          {editingMessage && editingMessage.id === message.id ? (
                            <div className="portal-edit-row">
                              <input
                                type="text"
                                value={editingMessage.text}
                                onChange={(event) => setEditingMessage({ ...editingMessage, text: event.target.value })}
                                className="portal-edit-input"
                                autoFocus
                              />
                              <button
                                className="portal-edit-save"
                                onClick={() => handleEditMessage(selectedGroup.id, message.id, editingMessage.text)}
                              >
                                Save
                              </button>
                              <button className="portal-edit-cancel" onClick={() => setEditingMessage(null)}>
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="portal-msg-text">{message.text}</div>
                          )}

                          <div className="portal-msg-actions">
                            <button className="portal-action-btn" onClick={() => handleReactToMessage(selectedGroup.id, message.id, 'appreciate')}>
                              Appreciate
                            </button>
                            <button className="portal-action-btn" onClick={() => setReplyingTo(replyingTo === message.id ? null : message.id)}>
                              Reply
                            </button>
                            {message.user === (user?.username || 'You') && (
                              <>
                                <button
                                  className="portal-action-btn"
                                  onClick={() => setEditingMessage({ id: message.id, text: message.text })}
                                >
                                  Edit
                                </button>
                                <button className="portal-action-btn danger" onClick={() => handleDeleteMessage(selectedGroup.id, message.id)}>
                                  Delete
                                </button>
                              </>
                            )}
                          </div>

                          {Object.entries(message.reactions || {}).some(([, count]) => count > 0) && (
                            <div className="portal-reactions">
                              {Object.entries(message.reactions).map(([reaction, count]) =>
                                count > 0 ? (
                                  <span key={reaction} className="portal-reaction">
                                    {reaction} {count}
                                  </span>
                                ) : null
                              )}
                            </div>
                          )}

                          {message.replies?.length > 0 && (
                            <div className="portal-replies">
                              {message.replies.map((reply) => (
                                <div key={reply.id} className="portal-reply">
                                  <span className="portal-reply-user">{reply.user}</span>
                                  <span className="portal-reply-text">{reply.text}</span>
                                  <span className="portal-reply-time">{reply.time}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {replyingTo === message.id && (
                            <div className="portal-reply-input-row">
                              <input
                                type="text"
                                placeholder="Write a supportive reply..."
                                value={replyText}
                                onChange={(event) => setReplyText(event.target.value)}
                                className="portal-reply-input"
                                autoFocus
                                onKeyDown={(event) => event.key === 'Enter' && handleReplyToMessage(selectedGroup.id, message.id)}
                              />
                              <button className="portal-reply-send" onClick={() => handleReplyToMessage(selectedGroup.id, message.id)}>
                                Send
                              </button>
                              <button
                                className="portal-reply-cancel"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText('');
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>

              {selectedGroup.isMember ? (
                <div className="portal-input-bar">
                  <input
                    type="text"
                    placeholder="Share a thought with the room..."
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && handleSendMessage()}
                    className="portal-input"
                  />
                  <button className="portal-send-btn" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    Send
                  </button>
                </div>
              ) : (
                <div className="portal-join-gate">
                  <button className="portal-join-gate-btn" onClick={() => handleJoinGroup(selectedGroup.id)}>
                    Join this room to participate
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'events' && (
            <div className="events-section">
              <div className="events-header">
                <span className="community-section-tag">Guided sessions</span>
                <h3>Upcoming live workshops</h3>
                <p>Low-pressure sessions you can join live or save for later.</p>
              </div>

              <div className="events-container">
                {INITIAL_LIVE_EVENTS.map((event) => (
                  <div key={event.id} className="event-card">
                    <div className="event-header">
                      <div>
                        <h4>{event.title}</h4>
                        <p>{event.description}</p>
                      </div>
                      <div className="event-status live">Open soon</div>
                    </div>

                    <div className="event-details">
                      <div className="event-detail">
                        <span className="label">Host</span>
                        <span className="value">{event.host}</span>
                      </div>
                      <div className="event-detail">
                        <span className="label">Starts in</span>
                        <span className="value">{event.startTime}</span>
                      </div>
                      <div className="event-detail">
                        <span className="label">Duration</span>
                        <span className="value">{event.duration}</span>
                      </div>
                      <div className="event-detail">
                        <span className="label">Participants</span>
                        <span className="value">{event.participants.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="event-actions">
                      <button className="join-event-btn" onClick={() => handleJoinEvent(event.id)}>
                        Join event
                      </button>
                      <button
                        className={`remind-btn ${eventReminders[event.id] ? 'reminder-set' : ''}`}
                        onClick={() => handleSetReminder(event.id)}
                      >
                        {eventReminders[event.id] ? 'Reminder set' : 'Set reminder'}
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
