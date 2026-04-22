import React, { useEffect, useMemo, useState } from 'react';
import './Report.css';
import { API_BASE_URL } from '../api';

const MOOD_EMOJIS = {
  Happy: ':)',
  Calm: ':|',
  Neutral: ':|',
  Anxious: ':(',
  Sad: ':(',
  Stressed: ':/',
  Energetic: '+',
  Tired: 'z',
};

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toast(message, color = '#1e293b') {
  const t = document.createElement('div');
  t.innerHTML = `<span>${message}</span><button style="background:transparent;border:none;color:white;cursor:pointer;font-weight:bold;margin-left:12px;opacity:0.8;font-size:16px;">x</button>`;
  t.style.cssText = `display:flex;align-items:center;position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:${color};color:white;padding:13px 26px;border-radius:14px;font-size:14px;font-weight:600;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,0.2);font-family:Inter,sans-serif;white-space:nowrap`;
  t.querySelector('button').onclick = () => { if (document.body.contains(t)) t.remove(); };
  document.body.appendChild(t);
  setTimeout(() => { if (document.body.contains(t)) t.remove(); }, 3500);
}

const Report = ({ user, onUpdateUser }) => {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/report`, { credentials: 'include' });
        const data = await res.json();
        if (data.status === 'success' || data.mood_data !== undefined) {
          setReportData(data);
        } else {
          setReportData({ mood_data: [], mood_distribution: {}, streak: 0, coins: 0, total_checkins: 0, avg_score: 0, overall_score: 0 });
        }
      } catch {
        setReportData({ mood_data: [], mood_distribution: {}, streak: 0, coins: 0, total_checkins: 0, avg_score: 0, overall_score: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [user?.id]);

  const streak = reportData?.streak ?? 0;
  const coins = reportData?.coins ?? 0;
  const overallScore = reportData?.overall_score ?? reportData?.avg_score ?? 0;
  const moodData = reportData?.mood_data ?? [];
  const moodDist = reportData?.mood_distribution ?? {};
  const totalDays = moodData.length;
  const topMood = Object.entries(moodDist).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Neutral';

  const scoreColor = overallScore >= 80 ? '#10b981' : overallScore >= 60 ? '#8b5cf6' : overallScore >= 40 ? '#f59e0b' : '#ef4444';
  const scoreLabel = overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : overallScore >= 40 ? 'Building Up' : 'Early Days';

  const insights = useMemo(() => {
    if (totalDays === 0) return [];
    return [
      { title: 'Most common mood', text: `${topMood} appeared most often across your check-ins.`, color: '#10b981' },
      { title: 'Consistency', text: streak > 0 ? `Your current streak is ${streak} day${streak === 1 ? '' : 's'}, which is building momentum.` : 'A fresh check-in today will restart your streak and improve your history.', color: '#8b5cf6' },
      { title: 'Tracking depth', text: `You have logged ${totalDays} day${totalDays === 1 ? '' : 's'} and earned ${coins} coins so far.`, color: '#3b82f6' },
      { title: 'Wellness score', text: `Your current wellness score is ${overallScore}/100, based on your recent report data.`, color: '#f59e0b' },
    ];
  }, [coins, overallScore, streak, topMood, totalDays]);

  const exportSummary = () => {
    const lines = [
      `${user?.username || 'User'} Wellness Summary`,
      `Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      '',
      `Wellness score: ${overallScore}/100`,
      `Current streak: ${streak}`,
      `Coins earned: ${coins}`,
      `Days logged: ${totalDays}`,
      `Most common mood: ${topMood}`,
      '',
      'Key insights:',
      ...insights.map((item) => `- ${item.title}: ${item.text}`),
      '',
      aiAnalysis ? `AI analysis:\n${aiAnalysis}` : 'AI analysis: not generated yet.',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'moodmate-wellness-summary.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast('Summary downloaded.', '#1e293b');
  };

  const shareSummary = async () => {
    const summary = `${user?.username || 'User'} wellness summary: score ${overallScore}/100, streak ${streak}, top mood ${topMood}, days logged ${totalDays}.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'MoodMate Summary', text: summary });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(summary);
        toast('Summary copied to clipboard.', '#4f46e5');
        return;
      } else {
        toast('Sharing is not supported in this browser.', '#ef4444');
        return;
      }
      toast('Summary shared.', '#4f46e5');
    } catch {
      toast('Share cancelled or unavailable.', '#ef4444');
    }
  };

  const generateAI = async () => {
    setIsGeneratingAI(true);
    setAiAnalysis('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/report/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
        credentials: 'include',
      });
      const data = await res.json();
      setAiAnalysis(data.status === 'success' ? data.analysis : 'Analysis unavailable right now.');
    } catch {
      setAiAnalysis('Could not reach the server.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const upgradePremium = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/buy-premium`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan: 'monthly' }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        onUpdateUser?.({ is_premium: true, premium_plan: 'monthly', role: 'premium' });
        setShowPremiumModal(false);
        toast('Premium activated.', '#10b981');
      } else {
        toast(result.error || 'Could not process the upgrade.', '#f59e0b');
      }
    } catch {
      toast('Network error. Please check your connection.', '#ef4444');
    }
  };

  if (isLoading) {
    return (
      <div className="rp-loading">
        <div className="rp-spinner"></div>
        <p>Preparing your wellness story...</p>
      </div>
    );
  }

  return (
    <div className="rp-page">
      <div className="rp-hero">
        <div className="rp-hero-left">
          <div className="rp-greeting">
            <span className="rp-greeting-wave">Hi</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1>{user?.username || 'Friend'}'s Wellness Report</h1>
                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', color: 'white', padding: '3px 8px', borderRadius: '20px', letterSpacing: '0.05em', fontWeight: '800', border: '1px solid rgba(255,255,255,0.2)' }}>
                  SECURE
                </span>
              </div>
              <p>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="rp-score-section">
            <div className="rp-ring-wrap">
              <div className="rp-ring-label" style={{ position: 'relative', width: 130, height: 130, borderRadius: '50%', border: `10px solid ${scoreColor}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span className="rp-score-num">{overallScore}</span>
                <span className="rp-score-denom">/100</span>
              </div>
            </div>
            <div>
              <div className="rp-score-badge">{scoreLabel}</div>
              <p className="rp-score-sub">
                {totalDays === 0 ? 'Chat with MoodMate to start tracking.' : `Based on ${totalDays} day${totalDays !== 1 ? 's' : ''} of data.`}
              </p>
            </div>
          </div>
        </div>

        <div className="rp-stats-grid">
          <div className="rp-stat-card rp-stat-streak"><div className="rp-stat-num">{streak}</div><div className="rp-stat-label">Day Streak</div></div>
          <div className="rp-stat-card rp-stat-days"><div className="rp-stat-num">{totalDays}</div><div className="rp-stat-label">Days Logged</div></div>
          <div className="rp-stat-card rp-stat-coins"><div className="rp-stat-num">{coins}</div><div className="rp-stat-label">Coins Earned</div></div>
          <div className="rp-stat-card rp-stat-mood"><div className="rp-stat-num">{Object.keys(moodDist).length}</div><div className="rp-stat-label">Mood Types</div></div>
        </div>
      </div>

      {totalDays === 0 && (
        <div className="rp-empty-state">
          <div className="rp-empty-icon">Start</div>
          <h2>Your journey starts here</h2>
          <p>Head to the Chat tab and tell MoodMate how you're feeling. Your mood, streaks, and insights will appear here as you use the app.</p>
        </div>
      )}

      {moodData.length > 0 && (
        <div className="rp-section">
          <div className="rp-section-header">
            <h2>Your Week at a Glance</h2>
            <span className="rp-section-badge">Last 7 days</span>
          </div>
          <div className="rp-week-strip">
            {(moodData.length >= 7 ? moodData.slice(-7) : [...Array(7 - moodData.length).fill(null), ...moodData]).map((day, index) => (
              <div key={index} className={`rp-day-card ${day ? 'has-data' : 'no-data'}`}>
                <div className="rp-day-name">{WEEK_DAYS[index]}</div>
                {day ? (
                  <>
                    <div className="rp-day-emoji">{MOOD_EMOJIS[day.mood?.split(' ')[1]] || MOOD_EMOJIS[day.mood?.split(' ')[0]] || ':|'}</div>
                    <div className="rp-day-score">{day.score}</div>
                  </>
                ) : <div className="rp-day-score">-</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {totalDays > 0 && (
        <div className="rp-section">
          <div className="rp-section-header">
            <h2>AI Insights</h2>
          </div>
          <div className="rp-insights-grid">
            {insights.map((item) => (
              <div key={item.title} className="rp-insight-card" style={{ '--accent': item.color }}>
                <div className="rp-insight-icon">{item.title}</div>
                <p>{item.text}</p>
              </div>
            ))}
          </div>

          <div className="rp-deep-ai">
            <div className="rp-deep-ai-header">
              <div>
                <h3>Deep Emotional Analysis</h3>
                <p>Get a personalized narrative from your mood history.</p>
              </div>
              {!aiAnalysis && (
                <button className="rp-btn-ai" onClick={generateAI} disabled={isGeneratingAI}>
                  {isGeneratingAI ? 'Analyzing...' : 'Generate'}
                </button>
              )}
            </div>
            {aiAnalysis && (
              <div className="rp-ai-result">
                {aiAnalysis.split('\n').filter(Boolean).map((line, index) => (
                  <p key={index}>{line.replace(/^[-*#]\s*/, '')}</p>
                ))}
                <button className="rp-btn-sm" onClick={() => setAiAnalysis('')} style={{ marginTop: '16px' }}>Regenerate</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rp-footer">
        <div className="rp-footer-left">
          <h3>Share or export your progress</h3>
          <p>Download a text summary or share a quick progress update with someone you trust.</p>
        </div>
        <div className="rp-footer-btns">
          <button className="rp-btn rp-btn-download" onClick={exportSummary}>Download Summary</button>
          <button className="rp-btn rp-btn-share" onClick={shareSummary}>Share Summary</button>
          {!user?.is_premium && (
            <button className="rp-btn rp-btn-premium" onClick={() => setShowPremiumModal(true)}>Go Premium</button>
          )}
        </div>
      </div>

      {showPremiumModal && (
        <div className="rp-modal-overlay" onClick={() => setShowPremiumModal(false)}>
          <div className="rp-modal" onClick={(e) => e.stopPropagation()}>
            <button className="rp-modal-close" onClick={() => setShowPremiumModal(false)}>x</button>
            <div className="rp-modal-icon">Premium</div>
            <h2>Unlock Premium</h2>
            <p>Get advanced analytics, therapist sharing, and weekly AI wellness reports.</p>
            <div className="rp-modal-features">
              {['Advanced analytics', 'Deep insights', 'Trend predictions', 'Therapist-ready summaries'].map((feature) => (
                <div key={feature} className="rp-modal-feature">{feature}</div>
              ))}
            </div>
            <button className="rp-modal-upgrade" onClick={upgradePremium}>Upgrade Now - Rs 99/month</button>
            <p className="rp-modal-note">7-day free trial. Cancel anytime.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
