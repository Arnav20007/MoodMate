import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Community.css';

// Sample data
const initialMoodWall = [
  {
    id: 1,
    userName: "QuietSoul_22",
    text: "Today marked a significant milestone: I managed to step outdoors for the first time in months, even if just for a brief moment. These small increments of progress feel substantial. 🌱",
    likes: 847,
    comments: 63,
    shares: 21,
    mood: "proud",
    timestamp: "4 minutes ago",
    userLevel: 8,
    userBadges: ["Consistent"],
    verified: false,
    liked: false
  },
  {
    id: 2,
    userName: "Anonymous",
    text: "It is often difficult to articulate the depth of exhaustion I feel internally. Sharing here provides a necessary sense of relief. I am grateful for this supportive environment. 💙",
    likes: 1243,
    comments: 94,
    shares: 45,
    mood: "relieved",
    timestamp: "18 minutes ago",
    userLevel: 3,
    userBadges: [],
    verified: false,
    liked: false
  },
  {
    id: 3,
    userName: "MindfulMeera",
    text: "A grounding technique that has proven effective: when experiencing acute anxiety, identify 5 visible objects in your immediate surroundings. It is a simple but clinical approach to resetting the nervous system. 🙏",
    likes: 2104,
    comments: 127,
    shares: 89,
    mood: "calm",
    timestamp: "42 minutes ago",
    userLevel: 19,
    userBadges: ["Community Helper"],
    verified: true,
    liked: false
  },
  {
    id: 4,
    userName: "HiddenSunrise",
    text: "Navigating family dynamics where mental health is stigmatized as 'weakness' remains a primary challenge. Seeking perspectives from those in similar situations. 🏛️",
    likes: 3871,
    comments: 312,
    shares: 144,
    mood: "frustrated",
    timestamp: "1 hour ago",
    userLevel: 11,
    userBadges: [],
    verified: false,
    liked: false
  },
  {
    id: 5,
    userName: "SleeplessInDelhi",
    text: "After two years of emotional suppression, I finally allowed myself to process my grief fully today. The release was cathartic. Prioritize your emotional processing; it is essential for healing. 💧",
    likes: 5203,
    comments: 418,
    shares: 267,
    mood: "healing",
    timestamp: "2 hours ago",
    userLevel: 14,
    userBadges: ["Brave"],
    verified: false,
    liked: false
  },
  {
    id: 6,
    userName: "CalmGuide",
    text: "Daily Reminder: Rest is a requirement, not a reward for productivity. On difficult days, maintaining your well-being is a significant achievement in itself. 🌙",
    likes: 8947,
    comments: 521,
    shares: 403,
    mood: "peaceful",
    timestamp: "3 hours ago",
    userLevel: 42,
    userBadges: ["Community Pillar", "Mindfulness Guide"],
    verified: true,
    liked: false
  }
];

const initialGroups = [
  {
    id: 1,
    name: "📚 Academic Rigor & Stress",
    description: "Collaborative strategies for managing academic expectations and examination-related stress.",
    members: 2456,
    isMember: false,
    engagementLevel: 82,
    activity: "high",
    tags: ["academic", "resilience", "focus"],
    messages: [
      { id: 101, user: "Priya_M", time: "2h ago", text: "Anyone else feel like their brain just shuts down during exams even after thorough preparation? It's not test anxiety per se — more like sudden cognitive fog.", reactions: { like: 14, heart: 3, support: 5, thanks: 2 }, replies: [{ id: 1011, user: "RohanK", time: "1h 50m ago", text: "Yes. It's called 'retrieval-induced forgetting' — your brain over-indexes on anxiety signals. The fix is interleaved practice rather than blocked revision." }] },
      { id: 102, user: "StudyBot_Kai", time: "1h ago", text: "📌 Tip of the Day: Studies show that the Pomodoro Technique (25 min focus, 5 min rest) improves recall by ~23% compared to marathon sessions. Try it during your next revision block.", reactions: { like: 22, heart: 7, support: 0, thanks: 11 }, replies: [] },
      { id: 103, user: "Ananya_S", time: "45m ago", text: "I scored a 38/100 last semester. Instead of giving up, I restructured my approach — spaced repetition, active recall, no highlighting. Got 82 this time. It is genuinely turnable.", reactions: { like: 31, heart: 18, support: 9, thanks: 14 }, replies: [{ id: 1031, user: "Priya_M", time: "40m ago", text: "This is exactly what I needed to read today. Thank you." }] },
    ]
  },
  {
    id: 2,
    name: "💬 Social Dynamics & Interpersonal Life",
    description: "Navigating social complexities and developing foundational habits for healthy relationships.",
    members: 1873,
    isMember: false,
    engagementLevel: 78,
    activity: "medium",
    tags: ["interpersonal", "boundaries", "connection"],
    messages: [
      { id: 201, user: "Meera_V", time: "3h ago", text: "I've been told I'm 'too much' by multiple people in my life. At what point do I accept this as feedback versus recognize it as people being uncomfortable with emotional honesty?", reactions: { like: 9, heart: 21, support: 16, thanks: 4 }, replies: [{ id: 2011, user: "Jordan_C", time: "2h 45m ago", text: "'Too much' often means 'too much for me specifically.' It's not a universal measurement. The right people won't say that." }] },
      { id: 202, user: "NeutralNav", time: "2h ago", text: "Setting a boundary with a close friend for the first time this week. It felt like betrayal but it was necessary. Growth is uncomfortable.", reactions: { like: 27, heart: 12, support: 8, thanks: 3 }, replies: [] },
      { id: 203, user: "Dr_WellnessBot", time: "40m ago", text: "📌 Research note: People with strong social support networks have 50% lower risk of premature mortality (Holt-Lunstad, 2015). Quality > quantity always applies.", reactions: { like: 18, heart: 5, support: 0, thanks: 9 }, replies: [] },
    ]
  },
  {
    id: 3,
    name: "🏠 Family Dynamics & Recovery",
    description: "Professional peer support for navigating family complexities and personal development at home.",
    members: 1562,
    isMember: false,
    engagementLevel: 75,
    activity: "medium",
    tags: ["family-dynamics", "support", "healing"],
    messages: [
      { id: 301, user: "AaravP", time: "5h ago", text: "My parents don't believe mental health is real. They attribute everything to 'laziness' or 'attitude'. It's isolating to receive a clinical diagnosis and then go home to complete invalidation.", reactions: { like: 41, heart: 29, support: 33, thanks: 7 }, replies: [{ id: 3011, user: "Lakshmi_R", time: "4h 30m ago", text: "You're not alone in this. First-generation awareness is real. I've learned to quietly build my own support system outside the home." }] },
      { id: 302, user: "CalmGarden_T", time: "2h ago", text: "Something that helped me: writing unsent letters to family members who hurt me. Not to send — just to process. My therapist calls it 'completing the emotional loop'.", reactions: { like: 19, heart: 14, support: 6, thanks: 11 }, replies: [] },
      { id: 303, user: "HealingPath_Bot", time: "1h ago", text: "📌 Reminder: You are not responsible for managing your parents' emotional regulation. That was their job. Healing is not disloyalty.", reactions: { like: 56, heart: 38, support: 17, thanks: 22 }, replies: [] },
    ]
  },
  {
    id: 4,
    name: "💼 Professional & Career Resilience",
    description: "Managing workplace expectations and developing sustainable career growth habits.",
    members: 2894,
    isMember: false,
    engagementLevel: 85,
    activity: "high",
    tags: ["career", "workplace-wellness", "burnout"],
    messages: [
      { id: 401, user: "Dev_R", time: "4h ago", text: "Six weeks into a new role and already being handed deliverables that were originally scoped for a senior. I'm enjoying the challenge but the timeline expectations feel unrealistic. How do I address this without seeming under-qualified?", reactions: { like: 12, heart: 4, support: 8, thanks: 3 }, replies: [{ id: 4011, user: "SeniorManya", time: "3h 50m ago", text: "Document everything first. Then have a 1:1 with your manager framed as 'I want to set myself up for success — can we align on priorities?' It shifts the conversation from complaint to collaboration." }] },
      { id: 402, user: "BurnoutAware_Bot", time: "2h ago", text: "📌 WHO formally classified burnout as an occupational phenomenon in 2019. Symptoms: emotional exhaustion, depersonalization, reduced performance. If you recognize these — it's real, and it's treatable.", reactions: { like: 34, heart: 9, support: 5, thanks: 18 }, replies: [] },
      { id: 403, user: "Ishaan_Career", time: "30m ago", text: "Left my corporate job 8 months ago after a burnout spiral. Now freelancing at 60% of my previous salary but working 40% fewer hours. I've never felt this clear-headed. The math checks out differently when you factor in your health.", reactions: { like: 47, heart: 22, support: 11, thanks: 16 }, replies: [] },
    ]
  },
  {
    id: 5,
    name: "💔 Emotional Healing & Relationships",
    description: "Supportive dialogue for processing relationship transitions and emotional recovery.",
    members: 3217,
    isMember: false,
    engagementLevel: 88,
    activity: "very high",
    tags: ["relationships", "emotional-wellbeing", "healing"],
    messages: [
      { id: 501, user: "QuietMoon_S", time: "6h ago", text: "It's been 4 months since the breakup. Some days I wake up completely fine and actually excited. Other days I still check their Instagram like I'll find an answer there. Both are normal, right?", reactions: { like: 38, heart: 51, support: 29, thanks: 8 }, replies: [{ id: 5011, user: "Nalini_H", time: "5h 45m ago", text: "Completely normal. Grief isn't linear and neither is healing from love. The good days mean it's working." }, { id: 5012, user: "RiverFlow_V", time: "5h ago", text: "The Instagram checking is your nervous system trying to resolve unfinished pattern-matching. Try muting them — not blocking, just muting. It helps." }] },
      { id: 502, user: "HealingBot_M", time: "3h ago", text: "📌 Attachment theory insight: Anxious attachment styles often intensify during breakups because the threat system activates. This is neurological, not weakness. Identifying your style helps immensely.", reactions: { like: 29, heart: 13, support: 7, thanks: 21 }, replies: [] },
      { id: 503, user: "Arjun_R", time: "1h ago", text: "Therapy helped me realize I wasn't grieving the person — I was grieving a future I had already built in my head. Once I understood that, the healing became more targeted.", reactions: { like: 44, heart: 37, support: 19, thanks: 12 }, replies: [] },
    ]
  },
  {
    id: 6,
    name: "🌑 Self-Efficacy & Confidence",
    description: "Building self-esteem and overcoming habitual negative self-perceptions.",
    members: 2756,
    isMember: false,
    engagementLevel: 80,
    activity: "high",
    tags: ["self-efficacy", "growth", "confidence"],
    messages: [
      { id: 601, user: "SilentGrow_K", time: "3h ago", text: "I applied for something I was convinced I was underqualified for. Got the callback. A year ago I wouldn't have even submitted. This is what incremental confidence looks like.", reactions: { like: 62, heart: 44, support: 18, thanks: 27 }, replies: [{ id: 6011, user: "BoostBot", time: "2h 50m ago", text: "This is the exact mechanism — action precedes confidence, not the other way around. You're proving it." }] },
      { id: 602, user: "CognitiveLift_Bot", time: "2h ago", text: "📌 Bandura's self-efficacy theory: The strongest predictor of future success is past mastery experience. Small wins compound. Document yours.", reactions: { like: 21, heart: 7, support: 4, thanks: 14 }, replies: [] },
      { id: 603, user: "Tanya_W", time: "45m ago", text: "The inner critic is loud today. Trying to observe it like a weather pattern instead of believing it. 'Oh, there's that storm again.' It actually helps more than arguing with it.", reactions: { like: 33, heart: 18, support: 9, thanks: 7 }, replies: [] },
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
      { id: 701, user: "Anonymous_Safe", time: "8h ago", text: "Finally reported the workplace harassment to HR after 3 months of hesitation. The process was nerve-wracking but I feel lighter. You don't have to absorb what isn't yours.", reactions: { like: 49, heart: 61, support: 44, thanks: 18 }, replies: [{ id: 7011, user: "AdvocateBot", time: "7h 30m ago", text: "You just did one of the hardest things. Whatever the outcome, speaking up protects the next person too. Proud of your courage." }] },
      { id: 702, user: "SafeSpace_Mod", time: "4h ago", text: "📌 Reminder: Documenting incidents with timestamps, location, witnesses, and exact language significantly strengthens any formal complaint. Start a private record today if you haven't.", reactions: { like: 27, heart: 11, support: 8, thanks: 33 }, replies: [] },
      { id: 703, user: "Veena_K", time: "1h ago", text: "Being the only person who looks like me in my entire department is a daily cognitive load that most of my colleagues never think about. Visibility has a tax. I'm glad this group exists.", reactions: { like: 38, heart: 29, support: 22, thanks: 6 }, replies: [] },
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
      { id: 801, user: "BudgetMind_R", time: "5h ago", text: "The most impactful financial decision I made wasn't investment or budgeting — it was identifying my emotional spending triggers. Stress, boredom, and loneliness each have a purchase pattern.", reactions: { like: 41, heart: 16, support: 7, thanks: 29 }, replies: [{ id: 8011, user: "WiseSpend_Bot", time: "4h 45m ago", text: "This is behavioral finance 101 and most people never hear it. Tracking the 'why' is more powerful than tracking the spend." }] },
      { id: 802, user: "MoneyBalance_Bot", time: "3h ago", text: "📌 Financial anxiety affects 72% of adults (APA). If thinking about money triggers physical symptoms (tightness, avoidance), that's worth addressing with a professional alongside your financial plan.", reactions: { like: 19, heart: 8, support: 11, thanks: 14 }, replies: [] },
      { id: 803, user: "Dhruv_S", time: "1h ago", text: "I used to keep zero savings because I felt I didn't deserve financial security. Unpacked that in therapy. Now at 4 months emergency fund. The wound was psychological, not mathematical.", reactions: { like: 53, heart: 34, support: 17, thanks: 22 }, replies: [] },
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
      { id: 901, user: "CalmBreath_A", time: "2h ago", text: "Had my first panic attack in a public place yesterday. The physical symptoms were terrifying — I was convinced it was cardiac. Once I grounded myself and named it for what it was, the spiral slowed down. Naming it matters.", reactions: { like: 34, heart: 47, support: 55, thanks: 13 }, replies: [{ id: 9011, user: "PanicAware_Bot", time: "1h 50m ago", text: "You did exactly the right thing. The naming interrupts the amygdala hijack. 5-4-3-2-1 grounding: 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste." }, { id: 9012, user: "NayanS", time: "1h 40m ago", text: "I've had hundreds of panic attacks. Each time I've survived 100% of them. That statistic helps me in the moment." }] },
      { id: 902, user: "AnxietyLens_Bot", time: "1h ago", text: "📌 Anxiety lies. It predicts catastrophe with apparent certainty. But the evidence base for its predictions is statistically terrible. Cognitive restructuring helps expose this.", reactions: { like: 28, heart: 12, support: 9, thanks: 19 }, replies: [] },
      { id: 903, user: "Sneha_P", time: "20m ago", text: "Three months on a low-dose SSRI + weekly CBT. The anxiety isn't gone but it's no longer running my day. There are hours now where I forget I have it. That used to feel impossible.", reactions: { like: 61, heart: 48, support: 24, thanks: 31 }, replies: [] },
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
      { id: 1001, user: "NightOwl_Fixed", time: "7h ago", text: "After 6 years of irregular sleep, I tried consistent wake times — same time every day including weekends — for 3 weeks. My sleep pressure built naturally and I started falling asleep in minutes. The wake time is the anchor, not the bedtime.", reactions: { like: 47, heart: 19, support: 8, thanks: 36 }, replies: [{ id: 10011, user: "SleepBot_Pro", time: "6h 45m ago", text: "This is sleep restriction therapy in principle — one of the most evidence-based treatments for chronic insomnia. Glad it's working for you." }] },
      { id: 1002, user: "SleepResearch_Bot", time: "4h ago", text: "📌 Matthew Walker (Why We Sleep): Core temp needs to drop ~1°C to initiate sleep. Keep your room 18–19°C, wear socks (counterintuitive but it dilates blood vessels and helps thermoregulate faster).", reactions: { like: 38, heart: 11, support: 6, thanks: 27 }, replies: [] },
      { id: 1003, user: "Ritu_K", time: "2h ago", text: "Body scan meditation before bed changed everything for me. I don't use it to fall asleep — I use it to give myself permission to stop thinking. The sleep follows from that.", reactions: { like: 29, heart: 22, support: 10, thanks: 15 }, replies: [] },
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

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://moodmate-8-sucu.onrender.com';

function Community({ user }) {
  // --- New State for Mood Wall ---
  const [communityPosts, setCommunityPosts] = useState([]);
  const [selectedMood, setSelectedMood] = useState('neutral');
  const [newPostText, setNewPostText] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // --- Restored State for Groups & Events ---
  const [groups, setGroups] = useState(initialGroups);
  const [activeTab, setActiveTab] = useState('feed'); // Start on feed
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [eventReminders, setEventReminders] = useState({});
  const messagesEndRef = useRef(null);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/community/posts`);
      const data = await response.json();
      if (data.status === 'success') {
        setCommunityPosts(data.posts);
      }
    } catch (err) {
      console.error("Failed to fetch community posts", err);
    }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 8000);
    return () => clearInterval(interval);
  }, []);

  // Merge: show backend posts OR fall back to rich seed data so the feed is never empty
  const displayPosts = communityPosts.length > 0 ? communityPosts : initialMoodWall;

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedGroup?.messages, replyingTo]);

  const handleAddPost = async () => {
    if (newPostText.trim() === "") return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/community/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood_tag: selectedMood,
          content: newPostText
        })
      });
      if (response.ok) {
        setNewPostText('');
        setIsCreatingPost(false);
        fetchPosts();
      }
    } catch (err) {
      console.error("Failed to share mood", err);
    }
  };

  const handleReactToPost = async (postId, reactionType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/community/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          reaction_type: reactionType
        })
      });
      if (response.ok) {
        fetchPosts();
      }
    } catch (err) {
      console.error("Failed to react", err);
    }
  };

  // --- Restored Helper Functions ---
  const handleJoinGroup = (groupId) => {
    const updatedGroups = groups.map(group =>
      group.id === groupId ? {
        ...group,
        isMember: !group.isMember,
        members: group.isMember ? group.members - 1 : group.members + 1
      } : group
    );
    setGroups(updatedGroups);
    if (selectedGroup && selectedGroup.id === groupId) {
      setSelectedGroup(updatedGroups.find(g => g.id === groupId));
    }
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
          return { ...group, messages: [...group.messages, newMessageObj] };
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
            return { ...message, reactions: currentReactions };
          }
          return message;
        });
        return { ...group, messages: updatedMessages };
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
              return { ...message, replies: [...message.replies, newReply] };
            }
            return message;
          });
          return { ...group, messages: updatedMessages };
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
            return { ...message, text: newText, edited: true };
          }
          return message;
        });
        return { ...group, messages: updatedMessages };
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
        return { ...group, messages: updatedMessages };
      }
      return group;
    });
    setGroups(updatedGroups);
    if (selectedGroup && selectedGroup.id === groupId) {
      setSelectedGroup(updatedGroups.find(g => g.id === groupId));
    }
  };

  const showToast = (msg, color = '#1e293b') => {
    const t = document.createElement('div');
    t.innerHTML = `<span>${msg}</span><button style="background:transparent;border:none;color:white;cursor:pointer;font-weight:bold;margin-left:12px;opacity:0.8;font-size:16px;">✕</button>`;
    t.style.cssText = `display:flex;align-items:center;position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:${color};color:white;padding:12px 24px;border-radius:14px;font-size:13.5px;font-weight:600;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,0.2);font-family:Inter,sans-serif;white-space:nowrap`;
    t.querySelector('button').onclick = () => { if (document.body.contains(t)) t.remove(); };
    document.body.appendChild(t);
    setTimeout(() => { if (document.body.contains(t)) t.remove(); }, 3500);
  };

  const handleJoinEvent = (eventId) => {
    showToast("✅ You've joined! We'll remind you before it starts.", '#10b981');
  };

  const handleSetReminder = (eventId) => {
    setEventReminders(prev => ({ ...prev, [eventId]: true }));
    showToast('🔔 Reminder set for this event!', '#6366f1');
  };

  const renderEngagementIndicator = (level) => (
    <div className="engagement-indicator">
      <div className="engagement-bar">
        <div className="engagement-fill" style={{ width: `${level}%` }}></div>
      </div>
      <span className="engagement-value">{level}%</span>
    </div>
  );

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

  const supportReactions = [
    { type: 'upvote', label: '⬆️ Relatable' },
    { type: 'same_feeling', label: '🫂 Same Feeling' },
    { type: 'support', label: '❤️ Sending Love' }
  ];

  return (
    <div className="community-hub">
      <div className="community-header">
        <div className="header-content-elite">
          <div className="title-section">
            <h2 className="main-title">Community Feed</h2>
            <p className="sub-title">Secure peer support and anonymous reflection platform.</p>
          </div>
          <div className="stats-section-elite">
            <div className="stat-pill-elite active">
               <span className="dot" />
               <span className="stat-label">{(4192).toLocaleString()} Active Members</span>
            </div>
            <div className="stat-pill-elite">
               <span className="stat-label">24/7 Moderation Active</span>
            </div>
          </div>
        </div>
        <div className="community-controls">
          <div className="view-toggles">
            <button
              className={`view-toggle ${activeTab === 'feed' ? 'active' : ''}`}
              onClick={() => setActiveTab('feed')}
            >
              🌍 Community Feed
              <span style={{ marginLeft: '6px', background: activeTab === 'feed' ? '#6366f1' : '#e2e8f0', color: activeTab === 'feed' ? 'white' : '#64748b', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' }}>
                {displayPosts.length}
              </span>
            </button>
            <button
              className={`view-toggle ${activeTab === 'groups' ? 'active' : ''}`}
              onClick={() => setActiveTab('groups')}
            >
              👥 Support Groups
              <span style={{ marginLeft: '6px', background: activeTab === 'groups' ? '#6366f1' : '#e2e8f0', color: activeTab === 'groups' ? 'white' : '#64748b', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' }}>
                {groups.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="community-layout">
        <div className="main-content">
          {activeTab === 'feed' && (
            <>
              {/* ── IMPROVED POST COMPOSER ── */}
              <div className="create-post-card">
                <div className="post-input">
                  <textarea
                    placeholder="Describe your current emotional state or share a reflection..."
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    onFocus={() => setIsCreatingPost(true)}
                  />
                  {isCreatingPost && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="post-options"
                    >
                      <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', padding: '12px 15px', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', background: '#6366f1', borderRadius: '50%', boxShadow: '0 0 8px #6366f1', flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: '#6366f1', fontWeight: '600' }}>
                          {displayPosts.length.toLocaleString()} members are sharing right now. Your words matter.
                        </span>
                      </div>

                      <div className="mood-selector">
                        <span>How are you feeling?</span>
                        <div className="mood-options">
                          {["peaceful", "happy", "neutral", "anxious", "sad", "stressed"].map(m => (
                            <button
                              key={m}
                              className={`mood-option-tag ${selectedMood === m ? 'active' : ''}`}
                              onClick={() => setSelectedMood(m)}
                            >
                              {m === 'peaceful' ? '☮️' : m === 'happy' ? '😊' : m === 'neutral' ? '😐' : m === 'anxious' ? '😰' : m === 'sad' ? '😢' : '😤'} {m}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="post-actions">
                        <button className="cancel-btn" onClick={() => { setIsCreatingPost(false); setNewPostText(''); }}>Cancel</button>
                        <button className="share-btn" onClick={handleAddPost} disabled={!newPostText.trim()} style={{ opacity: newPostText.trim() ? 1 : 0.5 }}>🌍 Share Anonymously</button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* ── POST CARDS ── */}
              <div className="post-list">
                {displayPosts.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    className="post-card anonymous-post"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="post-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '800', flexShrink: 0 }}>
                          {(post.userName || 'A').charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{post.userName || 'Anonymous'}</div>
                          <div className="post-mood">
                            <span className={`mood-indicator ${post.mood_tag || post.mood}`} />
                            Feeling {post.mood_tag || post.mood}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{post.created_at ? new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : post.timestamp || 'Just now'}</span>
                    </div>
                    <p className="post-content">"{post.content || post.text}"</p>
                    {post.likes && (
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                        {post.userBadges?.map(b => <span key={b} style={{ fontSize: '10px', background: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>{b}</span>)}
                        {post.verified && <span style={{ fontSize: '10px', background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>✓ Verified Helper</span>}
                      </div>
                    )}
                    <div className="support-reactions">
                      {supportReactions.map(btn => (
                        <button
                          key={btn.type}
                          className="support-btn"
                          onClick={() => handleReactToPost(post.id, btn.type)}
                        >
                          {btn.label} <span className="react-count">{post.reactions?.[btn.type] || post.likes || 0}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}
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
              {/* Header */}
              <div className="groups-header-elite">
                <h3>🫂 Peer Support Cohorts</h3>
                <p>Join specialized communities. Share your experience. Grow together.</p>
              </div>

              {/* Card Grid */}
              <div className="groups-container">
                {groups.map((group, idx) => (
                  <motion.div
                    key={group.id}
                    className={`group-card-elite ${group.isMember ? 'joined' : ''}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06, duration: 0.32 }}
                    whileHover={{ y: -4 }}
                  >
                    {/* Accent bar — purple if high engagement */}
                    <div className={`card-accent-bar ${group.engagementLevel > 85 ? 'accent-purple' : ''}`} />

                    {/* Header row */}
                    <div className="gc-header-row">
                      <h4 className="gc-title">{group.name}</h4>
                      {group.isMember && <span className="gc-member-badge">✓ Joined</span>}
                    </div>

                    {/* Description */}
                    <p className="gc-desc">{group.description}</p>

                    {/* Meta pills row */}
                    <div className="gc-meta-row">
                      <span className="gc-pill gc-pill--members">👥 {group.members.toLocaleString()}</span>
                      <span
                        className="gc-pill gc-pill--activity"
                        style={{
                          background: group.activity.includes('high') ? '#ecfdf5' : '#fffbeb',
                          color: group.activity.includes('high') ? '#059669' : '#d97706',
                        }}
                      >
                        ● {group.activity.toUpperCase()}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="gc-tags">
                      {group.tags.map(tag => (
                        <span key={tag} className="gc-tag">#{tag}</span>
                      ))}
                    </div>

                    {/* Footer buttons */}
                    <div className="gc-footer">
                      <button
                        className={`gc-btn gc-btn--secondary ${group.isMember ? 'muted' : ''}`}
                        onClick={() => handleJoinGroup(group.id)}
                      >
                        {group.isMember ? '✓ Joined' : '+ Join'}
                      </button>
                      <button
                        className="gc-btn gc-btn--primary"
                        onClick={() => setSelectedGroup(group)}
                      >
                        {group.isMember ? 'Open Room →' : 'Preview'}
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
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.28 }}
            >
              {/* Portal Header */}
              <div className="portal-header">
                <button className="portal-back-btn" onClick={() => setSelectedGroup(null)}>
                  ← Back
                </button>
                <div className="portal-title-block">
                  <h3 className="portal-group-name">{selectedGroup.name}</h3>
                  <span className="portal-members-badge">👥 {selectedGroup.members.toLocaleString()} members</span>
                </div>
                <span className={`portal-live-dot ${selectedGroup.activity.includes('high') ? 'active' : ''}`}>
                  ● {selectedGroup.activity.includes('high') ? 'Live' : 'Active'}
                </span>
              </div>

              {/* Messages Area */}
              <div className="portal-messages">
                {selectedGroup.messages.length === 0 ? (
                  <div className="portal-empty-state">
                    <div className="portal-empty-icon">💬</div>
                    <h4>No messages yet</h4>
                    <p>Be the first to start the conversation in this cohort.</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {selectedGroup.messages.map(message => (
                      <motion.div
                        key={message.id}
                        className={`portal-msg ${message.user === (user?.username || 'You') ? 'own' : ''}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="portal-msg-avatar">
                          {(message.user || 'A').charAt(0).toUpperCase()}
                        </div>
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
                                onChange={e => setEditingMessage({ ...editingMessage, text: e.target.value })}
                                className="portal-edit-input"
                                autoFocus
                              />
                              <button className="portal-edit-save" onClick={() => handleEditMessage(selectedGroup.id, message.id, editingMessage.text)}>Save</button>
                              <button className="portal-edit-cancel" onClick={() => setEditingMessage(null)}>Cancel</button>
                            </div>
                          ) : (
                            <div className="portal-msg-text">{message.text}</div>
                          )}
                          <div className="portal-msg-actions">
                            <button className="portal-action-btn" onClick={() => handleReactToMessage(selectedGroup.id, message.id, 'like')}>👍</button>
                            <button className="portal-action-btn" onClick={() => setReplyingTo(replyingTo === message.id ? null : message.id)}>↩ Reply</button>
                            {message.user === (user?.username || 'You') && (
                              <>
                                <button className="portal-action-btn" onClick={() => setEditingMessage({ id: message.id, text: message.text })}>✏️ Edit</button>
                                <button className="portal-action-btn danger" onClick={() => handleDeleteMessage(selectedGroup.id, message.id)}>🗑️</button>
                              </>
                            )}
                          </div>

                          {/* Reactions */}
                          {Object.entries(message.reactions || {}).some(([, c]) => c > 0) && (
                            <div className="portal-reactions">
                              {Object.entries(message.reactions).map(([r, c]) => c > 0 && (
                                <span key={r} className="portal-reaction">
                                  {r === 'like' ? '👍' : r === 'heart' ? '❤️' : r === 'support' ? '🤗' : '🙏'} {c}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Replies */}
                          {message.replies && message.replies.length > 0 && (
                            <div className="portal-replies">
                              {message.replies.map(reply => (
                                <div key={reply.id} className="portal-reply">
                                  <span className="portal-reply-user">{reply.user}</span>
                                  <span className="portal-reply-text">{reply.text}</span>
                                  <span className="portal-reply-time">{reply.time}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply Input */}
                          {replyingTo === message.id && (
                            <div className="portal-reply-input-row">
                              <input
                                type="text"
                                placeholder="Write a reply..."
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                className="portal-reply-input"
                                autoFocus
                                onKeyDown={e => e.key === 'Enter' && handleReplyToMessage(selectedGroup.id, message.id)}
                              />
                              <button className="portal-reply-send" onClick={() => handleReplyToMessage(selectedGroup.id, message.id)}>Send</button>
                              <button className="portal-reply-cancel" onClick={() => { setReplyingTo(null); setReplyText(''); }}>✕</button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar — members only */}
              {selectedGroup.isMember ? (
                <div className="portal-input-bar">
                  <input
                    type="text"
                    placeholder="Share a thought with the group..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    className="portal-input"
                  />
                  <button
                    className="portal-send-btn"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    Send →
                  </button>
                </div>
              ) : (
                <div className="portal-join-gate">
                  <button
                    className="portal-join-gate-btn"
                    style={{ width: '100%', fontSize: '15px', padding: '14px 20px' }}
                    onClick={() => handleJoinGroup(selectedGroup.id)}
                  >
                    + Join Cohort to Participate
                  </button>
                </div>
              )}
            </motion.div>
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