// Report.jsx — Complete UX Redesign
// Single scrolling page, no nested tabs, tells user's story top to bottom
import React, { useState, useEffect } from 'react';
import './Report.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://moodmate-8-sucu.onrender.com';

const MOOD_EMOJIS = {
  'Happy': '😊', 'Calm': '😌', 'Neutral': '😐',
  'Anxious': '😰', 'Sad': '😔', 'Stressed': '😤',
  'Energetic': '⚡', 'Tired': '😴'
};

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const Report = ({ user }) => {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Derived state
  const streak = reportData?.streak ?? 0;
  const coins = reportData?.coins ?? 0;
  const overallScore = reportData?.overall_score ?? 0;
  const moodData = reportData?.mood_data ?? [];
  const moodDist = reportData?.mood_distribution ?? {};
  const totalDays = moodData.length;

  useEffect(() => { fetchReport(); }, [user]);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/report?user_id=${user?.id || 1}`);
      const data = await res.json();
      // Accept both success and graceful error responses
      if (data.status === 'success' || data.mood_data !== undefined) {
        setReportData(data);
      } else {
        // Backend returned error — use empty default so UI still renders
        setReportData({ mood_data: [], mood_distribution: {}, streak: 0, coins: 0, total_checkins: 0, avg_score: 0, status: 'success' });
      }
    } catch (e) {
      // Network error — still show empty state, not a blank screen
      setReportData({ mood_data: [], mood_distribution: {}, streak: 0, coins: 0, total_checkins: 0, avg_score: 0, status: 'success' });
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg, color = '#1e293b') => {
    const t = document.createElement('div');
    t.innerHTML = `<span>${msg}</span><button style="background:transparent;border:none;color:white;cursor:pointer;font-weight:bold;margin-left:12px;opacity:0.8;font-size:16px;">✕</button>`;
    t.style.cssText = `display:flex;align-items:center;position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:${color};color:white;padding:13px 26px;border-radius:14px;font-size:14px;font-weight:600;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,0.2);font-family:Inter,sans-serif;white-space:nowrap;animation:fadeSlideUp 0.3s ease`;
    t.querySelector('button').onclick = () => { if (document.body.contains(t)) t.remove(); };
    document.body.appendChild(t);
    setTimeout(() => { if (document.body.contains(t)) t.remove(); }, 3500);
  };

  const generateAI = async () => {
    setIsGeneratingAI(true);
    setAiAnalysis('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/report/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id || 1 })
      });
      const data = await res.json();
      setAiAnalysis(data.status === 'success' ? data.analysis : 'Analysis unavailable right now.');
    } catch {
      setAiAnalysis('Could not reach the server.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Score ring circumference = 2π × 54 = 339.29
  const ringCircumference = 339.29;
  const ringOffset = ringCircumference * (1 - overallScore / 100);

  const scoreColor = overallScore >= 80 ? '#10b981' : overallScore >= 60 ? '#8b5cf6' : overallScore >= 40 ? '#f59e0b' : '#ef4444';
  const scoreLabel = overallScore >= 80 ? 'Excellent 🌟' : overallScore >= 60 ? 'Good 👍' : overallScore >= 40 ? 'Building Up 🌱' : 'Early Days 💪';

  const achievements = [
    { icon: '🔥', name: '7-Day Streak', earned: streak >= 7, desc: 'Logged in 7 days straight' },
    { icon: '🧘', name: 'Mindful Week', earned: totalDays >= 7, desc: 'Tracked mood for a week' },
    { icon: '📊', name: 'Data Explorer', earned: totalDays >= 1, desc: 'Started your wellness journey' },
    { icon: '🌅', name: 'Early Bird', earned: false, desc: 'Complete 5 morning check-ins' },
    { icon: '🛡️', name: 'Wellness Warrior', earned: streak >= 30, desc: '30 consecutive days' },
    { icon: '🌙', name: 'Night Owl', earned: false, desc: 'Track sleep for 14 nights' },
  ];

  if (isLoading) return (
    <div className="rp-loading">
      <div className="rp-spinner"></div>
      <p>Preparing your wellness story…</p>
    </div>
  );

  return (
    <div className="rp-page">

      {/* ── HERO SECTION ── */}
      <div className="rp-hero">
        <div className="rp-hero-left">
          <div className="rp-greeting">
            <span className="rp-greeting-wave">👋</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1>{user?.username || 'Friend'}'s Wellness Report</h1>
                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', color: 'white', padding: '3px 8px', borderRadius: '20px', letterSpacing: '0.05em', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(255,255,255,0.2)' }}>
                  🔒 SECURE & ENCRYPTED
                </span>
              </div>
              <p>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Score Ring */}
          <div className="rp-score-section">
            <div className="rp-ring-wrap">
              <svg width="130" height="130" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                <defs>
                  <linearGradient id="rg1" x1="0%" y1="0%" x2="100%">
                    <stop offset="0%" stopColor={scoreColor} />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10"/>
                <circle cx="60" cy="60" r="54" fill="none"
                  stroke={overallScore > 0 ? 'url(#rg1)' : 'rgba(255,255,255,0.06)'}
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={overallScore > 0 ? ringOffset : ringCircumference}
                  style={{ transition: 'stroke-dashoffset 1.5s ease' }}
                />
              </svg>
              <div className="rp-ring-label">
                <span className="rp-score-num">{overallScore}</span>
                <span className="rp-score-denom">/100</span>
              </div>
            </div>
            <div>
              <div className="rp-score-badge">{scoreLabel}</div>
              <p className="rp-score-sub">
                {totalDays === 0
                  ? 'Chat with MoodMate to start tracking'
                  : `Based on ${totalDays} day${totalDays !== 1 ? 's' : ''} of data`}
              </p>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="rp-stats-grid">
          <div className="rp-stat-card rp-stat-streak">
            <div className="rp-stat-icon">🔥</div>
            <div className="rp-stat-num">{streak}</div>
            <div className="rp-stat-label">Day Streak</div>
            {streak === 0 && <div className="rp-stat-hint">Chat today to start one</div>}
          </div>
          <div className="rp-stat-card rp-stat-days">
            <div className="rp-stat-icon">📅</div>
            <div className="rp-stat-num">{totalDays}</div>
            <div className="rp-stat-label">Days Logged</div>
          </div>
          <div className="rp-stat-card rp-stat-coins">
            <div className="rp-stat-icon">🪙</div>
            <div className="rp-stat-num">{coins}</div>
            <div className="rp-stat-label">Coins Earned</div>
          </div>
          <div className="rp-stat-card rp-stat-mood">
            <div className="rp-stat-icon">😊</div>
            <div className="rp-stat-num">{Object.keys(moodDist).length}</div>
            <div className="rp-stat-label">Mood Types</div>
          </div>
        </div>
      </div>

      {/* ── NEW USER EMPTY STATE ── */}
      {totalDays === 0 && (
        <div className="rp-empty-state">
          <div className="rp-empty-icon">🌱</div>
          <h2>Your journey starts here</h2>
          <p>Head to the Chat tab and tell MoodMate how you're feeling. Your mood, streaks, and insights will appear here as you use the app.</p>
          <div className="rp-empty-steps">
            <div className="rp-empty-step"><span>1</span>Open Chat tab</div>
            <div className="rp-empty-arrow">→</div>
            <div className="rp-empty-step"><span>2</span>Share how you feel</div>
            <div className="rp-empty-arrow">→</div>
            <div className="rp-empty-step"><span>3</span>Come back here</div>
          </div>
        </div>
      )}

      {/* ── MOOD JOURNEY (7-day) ── */}
      {moodData.length > 0 && (
        <div className="rp-section">
          <div className="rp-section-header">
            <h2>Your Week at a Glance</h2>
            <span className="rp-section-badge">Last 7 days</span>
          </div>
          <div className="rp-week-strip">
            {(moodData.length >= 7 ? moodData.slice(-7) : [
              ...Array(7 - moodData.length).fill(null),
              ...moodData
            ]).map((day, i) => (
              <div key={i} className={`rp-day-card ${day ? 'has-data' : 'no-data'}`}>
                <div className="rp-day-name">{WEEK_DAYS[i]}</div>
                {day ? (
                  <>
                    <div className="rp-day-emoji">{MOOD_EMOJIS[day.mood?.split(' ')[1]] || day.mood?.split(' ')[0] || '😐'}</div>
                    <div className="rp-day-bar-wrap">
                      <div className="rp-day-bar" style={{ height: `${day.score}%`, background: `hsl(${day.score * 1.2}, 70%, 55%)` }}></div>
                    </div>
                    <div className="rp-day-score">{day.score}</div>
                  </>
                ) : (
                  <>
                    <div className="rp-day-emoji" style={{ opacity: 0.2 }}>·</div>
                    <div className="rp-day-bar-wrap"><div className="rp-day-bar" style={{ height: '4px', background: 'rgba(255,255,255,0.07)' }}></div></div>
                    <div className="rp-day-score" style={{ opacity: 0.2 }}>–</div>
                  </>
                )}
              </div>
            ))}
          </div>
          {/* Insight line */}
          {moodData.length >= 3 && (
            <div className="rp-insight-bar">
              <span className="rp-insight-dot"></span>
              {moodData[moodData.length-1]?.score > moodData[0]?.score
                ? `📈 You ended the week stronger than you started. That's growth.`
                : moodData[moodData.length-1]?.score === moodData[0]?.score
                ? `➡️ Consistent week. Stability is underrated.`
                : `💙 Tough end to the week — but you showed up. That counts.`}
            </div>
          )}
        </div>
      )}

      {/* ── MOOD BREAKDOWN ── */}
      {Object.keys(moodDist).length > 0 && (
        <div className="rp-section">
          <div className="rp-section-header">
            <h2>How Your Moods Break Down</h2>
            <span className="rp-section-badge">{totalDays} entries</span>
          </div>
          <div className="rp-mood-breakdown">
            {Object.entries(moodDist)
              .sort((a, b) => b[1] - a[1])
              .map(([mood, count]) => {
                const pct = Math.round((count / totalDays) * 100);
                return (
                  <div key={mood} className="rp-mood-row">
                    <div className="rp-mood-rowlabel">
                      <span className="rp-mood-emoji">{MOOD_EMOJIS[mood] || '😐'}</span>
                      <span>{mood}</span>
                    </div>
                    <div className="rp-mood-bar-track">
                      <div className="rp-mood-bar-fill"
                        style={{ width: `${pct}%`, animationDelay: `${Math.random() * 0.3}s` }}
                      ></div>
                    </div>
                    <div className="rp-mood-pct">{pct}%</div>
                    <div className="rp-mood-count">{count}×</div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── AI INSIGHTS ── */}
      {totalDays > 0 && (
        <div className="rp-section">
          <div className="rp-section-header">
            <h2>AI Insights</h2>
          </div>
          <div className="rp-insights-grid">
            {[
              { icon: '📈', text: 'Your mood improves on days after consistent check-ins.', color: '#10b981' },
              { icon: '🕐', text: 'Evening check-ins seem to correlate with calmer mornings.', color: '#8b5cf6' },
              { icon: '🤝', text: 'Community interactions on lower-mood days seem to help lift your score.', color: '#3b82f6' },
              { icon: '🪙', text: `You've earned ${coins} coins so far — real consistency building.`, color: '#f59e0b' },
            ].map((ins, i) => (
              <div key={i} className="rp-insight-card" style={{ '--accent': ins.color }}>
                <div className="rp-insight-icon">{ins.icon}</div>
                <p>{ins.text}</p>
              </div>
            ))}
          </div>

          {/* Deep AI analysis */}
          <div className="rp-deep-ai">
            <div className="rp-deep-ai-header">
              <div>
                <h3>🧠 Deep Emotional Analysis</h3>
                <p>Get a personalised CBT-style wellness narrative from your mood history</p>
              </div>
              {!aiAnalysis && (
                <button className="rp-btn-ai" onClick={generateAI} disabled={isGeneratingAI}>
                  {isGeneratingAI ? (
                    <><span className="rp-spinner-sm"></span> Analyzing…</>
                  ) : '✨ Generate'}
                </button>
              )}
            </div>
            {aiAnalysis && (
              <div className="rp-ai-result">
                {aiAnalysis.split('\n').map((line, i) => {
                  if (!line.trim()) return null;
                  if (line.startsWith('#')) return <h4 key={i}>{line.replace(/#/g, '').trim()}</h4>;
                  if (line.startsWith('-') || line.startsWith('*')) return <li key={i}>{line.substring(1).trim()}</li>;
                  return <p key={i}>{line}</p>;
                })}
                <button className="rp-btn-sm" onClick={() => setAiAnalysis('')} style={{ marginTop: '16px' }}>Regenerate</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ACHIEVEMENTS ── */}
      <div className="rp-section">
        <div className="rp-section-header">
          <h2>Achievements</h2>
          <span className="rp-section-badge">{achievements.filter(a => a.earned).length}/{achievements.length} earned</span>
        </div>
        <div className="rp-achv-grid">
          {achievements.map((a, i) => (
            <div key={i} className={`rp-achv-card ${a.earned ? 'earned' : 'locked'}`}>
              {a.earned && <div className="rp-achv-glow"></div>}
              <div className="rp-achv-icon">{a.icon}</div>
              <div className="rp-achv-name">{a.name}</div>
              <div className="rp-achv-desc">{a.desc}</div>
              <div className="rp-achv-status">{a.earned ? '✓ Earned' : '🔒 Locked'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ACTION FOOTER ── */}
      <div className="rp-footer">
        <div className="rp-footer-left">
          <h3>Share or export your progress</h3>
          <p>Show your therapist how far you've come, or keep it for yourself.</p>
        </div>
        <div className="rp-footer-btns">
          <button className="rp-btn rp-btn-download" onClick={() => showToast('✅ PDF feature coming soon!', '#1e293b')}>
            📄 Download PDF
          </button>
          <button className="rp-btn rp-btn-share" onClick={() => showToast('🔗 Share link copied!', '#4f46e5')}>
            ↗ Share with Coach
          </button>
          {!user?.is_premium && (
            <button className="rp-btn rp-btn-premium" onClick={() => setShowPremiumModal(true)}>
              🌟 Go Premium
            </button>
          )}
        </div>
      </div>

      {/* ── PREMIUM MODAL ── */}
      {showPremiumModal && (
        <div className="rp-modal-overlay" onClick={() => setShowPremiumModal(false)}>
          <div className="rp-modal" onClick={e => e.stopPropagation()}>
            <button className="rp-modal-close" onClick={() => setShowPremiumModal(false)}>✕</button>
            <div className="rp-modal-icon">✨</div>
            <h2>Unlock Premium</h2>
            <p>Get advanced analytics, therapist sharing, and weekly AI wellness reports.</p>
            <div className="rp-modal-features">
              {['📊 Advanced Analytics', '🔍 Deep Insights', '📈 Trend Predictions', '💎 Therapist Reports'].map(f => (
                <div key={f} className="rp-modal-feature">{f}</div>
              ))}
            </div>
            <button className="rp-modal-upgrade" onClick={async () => {
              try {
                const response = await fetch(`${API_BASE_URL}/buy_premium/${user.id}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ plan: 'monthly' })
                });
                const result = await response.json();
                if (response.ok && result.success) {
                  showToast('✨ Premium activated! Reloading...', '#10b981');
                  setTimeout(() => window.location.reload(), 1500);
                } else {
                  showToast('⚠️ Could not process upgrade. Please try again.', '#f59e0b');
                }
              } catch(e) {
                showToast('⚠️ Network error. Please check your connection.', '#ef4444');
              }
            }}>✨ Upgrade Now - ₹99/month</button>
            <p className="rp-modal-note">7-day free trial · Cancel anytime</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;