import React, { useState, useEffect } from 'react';
import './DoctorDashboard.css';

// The doctor logged in — Dr. Priya Sharma
const DOCTOR = {
  id: 1,
  name: 'Dr. Priya Sharma',
  initials: 'PS',
  specialization: 'Clinical Psychology',
  experience: '8 years',
  rating: 5.0,
  reviews: 312,
  languages: ['Hindi', 'English'],
  pricePerSession: 1999,
  palette: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
};

// Hardcoded demo appointments (past + upcoming)
const DEMO_APPTS = [
  {
    id: 'demo-1',
    name: 'Rahul Mehta',
    age: 24, gender: 'Male',
    phone: '9876500001',
    reason: 'Anxiety and procrastination — struggling with college deadlines',
    time: 'Mon 2 PM',
    mode: 'Video',
    lang: 'Hindi',
    status: 'upcoming',
    coins: 1999,
  },
  {
    id: 'demo-2',
    name: 'Sneha Iyer',
    age: 28, gender: 'Female',
    phone: '9876500002',
    reason: 'Relationship stress and self-esteem issues',
    time: 'Wed 10 AM',
    mode: 'Chat',
    lang: 'English',
    status: 'upcoming',
    coins: 1999,
  },
  {
    id: 'demo-3',
    name: 'Karan Joshi',
    age: 22, gender: 'Male',
    phone: '9876500003',
    reason: 'Work-life balance and burnout recovery',
    time: 'Fri 4 PM',
    mode: 'Video',
    lang: 'Hindi',
    status: 'completed',
    coins: 1999,
  },
];

const STATUS_LABEL = {
  upcoming: '🗓 Upcoming',
  pending: '⏳ Pending',
  completed: '✓ Done',
  new: '🆕 New',
};

function toast(msg, color = '#10b981') {
  const t = document.createElement('div');
  t.innerHTML = `<span>${msg}</span><button style="background:transparent;border:none;color:white;cursor:pointer;font-weight:bold;margin-left:12px;opacity:0.8;font-size:16px;">✕</button>`;
  t.style.cssText = `display:flex;align-items:center;position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:${color};color:white;padding:13px 26px;border-radius:14px;font-size:14px;font-weight:700;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,0.2);font-family:Inter,sans-serif;white-space:nowrap`;
  t.querySelector('button').onclick = () => { if (document.body.contains(t)) t.remove(); };
  document.body.appendChild(t);
  setTimeout(() => { if (document.body.contains(t)) t.remove(); }, 3500);
}

export default function DoctorDashboard({ doctor, onLogout }) {
  const [appts, setAppts] = useState([]);
  const [notes, setNotes] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState(null);

  // Use logged-in doctor data if passed, fallback to hardcoded
  const DOC = doctor || DOCTOR;

  // Load: demo appts + any real bookings from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('moodmate_bookings') || '[]');
    // Convert user bookings to doctor appointment format
    const userBookings = saved.map((b, i) => ({
      id: `user-${i}`,
      name: b.name,
      age: b.age || '—',
      gender: b.gender || '—',
      phone: b.phone || '—',
      reason: b.reason,
      time: b.time,
      mode: b.mode || 'Video',
      lang: 'Hindi',
      status: 'new',
      coins: b.price || 1999,
    }));

    setAppts([...userBookings, ...DEMO_APPTS]);
  }, []);

  const handleApprove = (id) => {
    setAppts(prev => prev.map(a => a.id === id ? { ...a, status: 'upcoming' } : a));
    toast('✅ Appointment confirmed!', '#10b981');
  };

  const handleDecline = (id) => {
    setAppts(prev => prev.filter(a => a.id !== id));
    toast('❌ Appointment declined', '#ef4444');
  };

  const handleStart = (appt) => {
    toast(`🎥 Starting session with ${appt.name}…`, '#4f46e5');
  };

  const saveNotes = () => {
    if (!notes.trim()) return;
    toast('📝 Notes saved!', '#7c3aed');
    setNotes('');
  };

  const newBookings = appts.filter(a => a.status === 'new');
  const upcomingAppts = appts.filter(a => a.status === 'upcoming');
  const completedAppts = appts.filter(a => a.status === 'completed');
  const totalEarnings = appts.filter(a => a.status === 'completed').reduce((s, a) => s + a.coins, 0);
  const todayEarnings = completedAppts.length > 0 ? completedAppts[0].coins : 0;

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const handleLogout = () => {
    localStorage.removeItem('moodmate_doctor_session');
    if (onLogout) onLogout();
    else window.location.reload();
  };

  return (
    <div className="dd-page">

      {/* ── Banner ── */}
      <div className="dd-banner">
        <div className="dd-banner-top">
          <span className="dd-banner-label">🩺 Doctor Portal</span>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              className="dd-online-badge"
              onClick={() => { setIsOnline(!isOnline); toast(isOnline ? '⏸ You are now offline' : '🟢 You are now online', isOnline ? '#6b7280' : '#10b981'); }}
            >
              <span className="dd-online-dot" style={{ background: isOnline ? '#10b981' : '#9ca3af', animation: isOnline ? undefined : 'none' }}></span>
              {isOnline ? 'Online' : 'Offline'}
            </button>
            {/* ── Sign Out — always visible ── */}
            <button
              onClick={handleLogout}
              style={{ padding: '7px 16px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
              onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.22)'}
              onMouseOut={e => e.currentTarget.style.background='rgba(255,255,255,0.12)'}
            >
              ↩ Sign Out
            </button>
          </div>
        </div>

        <div className="dd-doctor-row">
          <div className="dd-doc-avatar">{DOC.initials}</div>
          <div>
            <h1>{DOC.name}</h1>
            <p>{DOC.spec || DOC.specialization}</p>
            <div className="dd-doc-meta">
              <span className="dd-doc-meta-item">⭐ {DOCTOR.rating} ({DOCTOR.reviews} reviews)</span>
              <span className="dd-doc-meta-item">🎓 {DOCTOR.experience}</span>
              <span className="dd-doc-meta-item">🌐 {DOCTOR.languages.join(', ')}</span>
              <span className="dd-doc-meta-item">💰 ₹{DOCTOR.pricePerSession}/session</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating Stat Cards ── */}
      <div className="dd-stats-row">
        <div className="dd-stat-card">
          <div className="dd-stat-icon">📅</div>
          <div className="dd-stat-label">Today's Sessions</div>
          <div className="dd-stat-value">{upcomingAppts.length}</div>
          <div className="dd-stat-sub">scheduled</div>
        </div>
        <div className="dd-stat-card">
          <div className="dd-stat-icon">🆕</div>
          <div className="dd-stat-label">New Requests</div>
          <div className="dd-stat-value" style={{ color: newBookings.length > 0 ? '#f59e0b' : '#1e1b4b' }}>
            {newBookings.length}
          </div>
          <div className="dd-stat-sub">awaiting approval</div>
        </div>
        <div className="dd-stat-card">
          <div className="dd-stat-icon">🪙</div>
          <div className="dd-stat-label">Today's Earnings</div>
          <div className="dd-stat-value" style={{ color: '#7c3aed' }}>₹{todayEarnings.toLocaleString('en-IN')}</div>
          <div className="dd-stat-sub">from {completedAppts.length} session{completedAppts.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="dd-stat-card">
          <div className="dd-stat-icon">✅</div>
          <div className="dd-stat-label">Completed</div>
          <div className="dd-stat-value" style={{ color: '#10b981' }}>{completedAppts.length}</div>
          <div className="dd-stat-sub">all time</div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="dd-body">

        {/* Left: Appointments */}
        <div>
          {/* New Booking Requests */}
          {newBookings.length > 0 && (
            <div className="dd-section">
              <div className="dd-section-header">
                <h2>🆕 New Booking Requests</h2>
                <span className="dd-section-badge red">{newBookings.length} pending</span>
              </div>
              <div className="dd-appt-list">
                {newBookings.map(appt => (
                  <div key={appt.id} className="dd-appt-card pending">
                    <span className="dd-status new">NEW</span>
                    <div className="dd-appt-time">
                      <span className="time">{appt.time?.split(' ').slice(1).join(' ')}</span>
                      <span className="day">{appt.time?.split(' ')[0]}</span>
                    </div>
                    <div className="dd-appt-info">
                      <div className="dd-appt-name">{appt.name} <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500' }}>· Age {appt.age} · {appt.gender}</span></div>
                      <div className="dd-appt-topic">"{appt.reason}"</div>
                      <div className="dd-appt-tags">
                        <span className="dd-appt-tag mode">📱 {appt.mode}</span>
                        <span className="dd-appt-tag lang">🌐 {appt.lang}</span>
                        <span className="dd-appt-tag" style={{ background: '#fef3c7', color: '#92400e' }}>🪙 {appt.coins} coins</span>
                      </div>
                    </div>
                    <div className="dd-appt-actions">
                      <button className="dd-btn-approve" onClick={() => handleApprove(appt.id)}>✓ Approve</button>
                      <button className="dd-btn-decline" onClick={() => handleDecline(appt.id)}>✗ Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Sessions */}
          <div className="dd-section">
            <div className="dd-section-header">
              <h2>🗓 Upcoming Sessions</h2>
              <span className="dd-section-badge">{upcomingAppts.length} scheduled</span>
            </div>
            <div className="dd-appt-list">
              {upcomingAppts.length === 0 ? (
                <div className="dd-empty">
                  <div className="icon">📭</div>
                  <p>No upcoming sessions. New bookings will appear here after you approve them.</p>
                </div>
              ) : upcomingAppts.map(appt => (
                <div key={appt.id} className="dd-appt-card upcoming" onClick={() => setSelectedAppt(selectedAppt?.id === appt.id ? null : appt)} style={{ cursor: 'pointer' }}>
                  <span className="dd-status upcoming">Upcoming</span>
                  <div className="dd-appt-time">
                    <span className="time">{appt.time?.split(' ').slice(1).join(' ')}</span>
                    <span className="day">{appt.time?.split(' ')[0]}</span>
                  </div>
                  <div className="dd-appt-info">
                    <div className="dd-appt-name">{appt.name} <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500' }}>· {appt.gender}, {appt.age}</span></div>
                    <div className="dd-appt-topic">"{appt.reason}"</div>
                    <div className="dd-appt-tags">
                      <span className="dd-appt-tag mode">{appt.mode === 'Video' ? '📹' : appt.mode === 'Voice' ? '📞' : '💬'} {appt.mode}</span>
                      <span className="dd-appt-tag lang">🌐 {appt.lang}</span>
                    </div>
                    {selectedAppt?.id === appt.id && (
                      <div style={{ marginTop: '10px', padding: '10px', background: 'white', borderRadius: '10px', border: '1px solid #ede9fe' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</div>
                        <div style={{ fontSize: '13px', color: '#374151' }}>📞 {appt.phone}</div>
                      </div>
                    )}
                  </div>
                  <div className="dd-appt-actions" onClick={e => e.stopPropagation()}>
                    <button className="dd-btn-start" onClick={() => handleStart(appt)}>▶ Start Session</button>
                    <button className="dd-btn-notes" onClick={() => setNotes(`Notes for ${appt.name}: `)}>📝 Add Notes</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed */}
          {completedAppts.length > 0 && (
            <div className="dd-section">
              <div className="dd-section-header">
                <h2>✅ Completed Sessions</h2>
                <span className="dd-section-badge green">{completedAppts.length} done</span>
              </div>
              <div className="dd-appt-list">
                {completedAppts.map(appt => (
                  <div key={appt.id} className="dd-appt-card completed" style={{ opacity: 0.8 }}>
                    <span className="dd-status completed">Done</span>
                    <div className="dd-appt-time" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                      <span className="time">{appt.time?.split(' ').slice(1).join(' ')}</span>
                      <span className="day">{appt.time?.split(' ')[0]}</span>
                    </div>
                    <div className="dd-appt-info">
                      <div className="dd-appt-name">{appt.name}</div>
                      <div className="dd-appt-topic">"{appt.reason}"</div>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#10b981', flexShrink: 0 }}>
                      +₹{appt.coins.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column ── */}
        <div className="dd-right">

          {/* Today summary */}
          <div className="dd-today-card">
            <h3>Today</h3>
            <div className="dd-today-date">{today}</div>
            <div className="dd-today-grid">
              <div className="dd-today-stat">
                <span className="val">{upcomingAppts.length}</span>
                <span className="lbl">Sessions</span>
              </div>
              <div className="dd-today-stat">
                <span className="val">{newBookings.length}</span>
                <span className="lbl">New requests</span>
              </div>
              <div className="dd-today-stat">
                <span className="val">₹{(upcomingAppts.length * DOCTOR.pricePerSession).toLocaleString('en-IN')}</span>
                <span className="lbl">Expected</span>
              </div>
              <div className="dd-today-stat">
                <span className="val">{completedAppts.length}</span>
                <span className="lbl">Completed</span>
              </div>
            </div>
          </div>

          {/* Earnings breakdown */}
          <div className="dd-earnings">
            <h3>💰 Earnings Overview</h3>
            <div className="dd-earn-row">
              <span className="dd-earn-label">Today</span>
              <span className="dd-earn-value green">₹{todayEarnings.toLocaleString('en-IN')}</span>
            </div>
            <div className="dd-earn-row">
              <span className="dd-earn-label">This month</span>
              <span className="dd-earn-value purple">₹{(totalEarnings + 18000).toLocaleString('en-IN')}</span>
            </div>
            <div className="dd-earn-row">
              <span className="dd-earn-label">Total sessions</span>
              <span className="dd-earn-value">{appts.length + 12}</span>
            </div>
            <div className="dd-earn-row">
              <span className="dd-earn-label">Avg session rating</span>
              <span className="dd-earn-value">⭐ {DOCTOR.rating}</span>
            </div>
            <div className="dd-earn-row">
              <span className="dd-earn-label">Next payout</span>
              <span className="dd-earn-value green">Apr 1, 2026</span>
            </div>
          </div>

          {/* Session notes */}
          <div className="dd-section" style={{ marginBottom: 0 }}>
            <div className="dd-section-header">
              <h2>📝 Session Notes</h2>
            </div>
            <textarea
              className="dd-notes-input"
              rows="5"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add private notes for a patient session… (only visible to you)"
            />
            <button className="dd-notes-save" onClick={saveNotes}>Save Notes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
