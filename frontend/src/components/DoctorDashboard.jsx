import React, { useEffect, useMemo, useState } from 'react';
import './DoctorDashboard.css';
import { API_BASE_URL } from '../api';

const DEFAULT_DOCTOR = {
  id: 1,
  name: 'Dr. Priya Sharma',
  initials: 'PS',
  spec: 'Clinical Psychology',
  experience: '8 years',
  rating: 5.0,
  reviews: 312,
  languages: ['Hindi', 'English'],
  pricePerSession: 1999,
};

function showToast(message, color = '#10b981') {
  const t = document.createElement('div');
  t.innerHTML = `<span>${message}</span><button style="background:transparent;border:none;color:white;cursor:pointer;font-weight:bold;margin-left:12px;opacity:0.8;font-size:16px;">x</button>`;
  t.style.cssText = `display:flex;align-items:center;position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:${color};color:white;padding:13px 26px;border-radius:14px;font-size:14px;font-weight:700;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,0.2);font-family:Inter,sans-serif;white-space:nowrap`;
  t.querySelector('button').onclick = () => { if (document.body.contains(t)) t.remove(); };
  document.body.appendChild(t);
  setTimeout(() => { if (document.body.contains(t)) t.remove(); }, 3500);
}

export default function DoctorDashboard({ doctor, onLogout }) {
  const currentDoctor = { ...DEFAULT_DOCTOR, ...(doctor || {}) };
  const [appts, setAppts] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [notes, setNotes] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [rescheduleSlot, setRescheduleSlot] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/therapy/bookings?doctor_id=${currentDoctor.id}`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setAppts(data.bookings || []);
        } else {
          showToast(data.message || 'Could not load bookings.', '#ef4444');
        }
      } catch {
        showToast('Doctor dashboard could not load bookings.', '#ef4444');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [currentDoctor.id]);

  useEffect(() => {
    setNotes(selectedAppt?.notes || '');
    setRescheduleSlot(selectedAppt?.time || '');
  }, [selectedAppt]);

  const updateBooking = async (bookingId, payload, successMessage) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/therapy/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        showToast(data.message || 'Could not update the booking.', '#ef4444');
        return null;
      }

      setAppts((prev) => prev.map((appt) => (appt.id === bookingId ? data.booking : appt)));
      setSelectedAppt((prev) => (prev?.id === bookingId ? data.booking : prev));
      if (successMessage) showToast(successMessage);
      return data.booking;
    } catch {
      showToast('Network error while updating the booking.', '#ef4444');
      return null;
    }
  };

  const handleApprove = (id) => updateBooking(id, { status: 'upcoming' }, 'Booking approved.');
  const handleDecline = async (id) => {
    const updated = await updateBooking(id, { status: 'declined' }, 'Booking declined.');
    if (updated) {
      setAppts((prev) => prev.filter((appt) => appt.status !== 'declined'));
      if (selectedAppt?.id === id) setSelectedAppt(null);
    }
  };
  const handleStart = (appt) => {
    setSelectedAppt(appt);
    showToast(`Session opened for ${appt.name}. Add notes and mark it complete when finished.`, '#4f46e5');
  };
  const handleComplete = (id) => updateBooking(id, { status: 'completed' }, 'Session marked complete.');
  const handleReschedule = async (appt = selectedAppt) => {
    if (!appt || !rescheduleSlot || rescheduleSlot === appt.time) return;
    await updateBooking(appt.id, { time: rescheduleSlot }, 'Session rescheduled.');
  };

  const saveNotes = async () => {
    if (!selectedAppt) {
      showToast('Select a session before saving notes.', '#ef4444');
      return;
    }
    setIsSaving(true);
    await updateBooking(selectedAppt.id, { notes }, 'Notes saved.');
    setIsSaving(false);
  };

  const activeAppts = appts.filter((appt) => !['declined', 'cancelled'].includes(appt.status));
  const newBookings = activeAppts.filter((appt) => appt.status === 'new');
  const upcomingAppts = activeAppts.filter((appt) => ['upcoming', 'reschedule_requested'].includes(appt.status));
  const completedAppts = activeAppts.filter((appt) => appt.status === 'completed');
  const totalEarnings = completedAppts.reduce((sum, appt) => sum + (appt.coins || currentDoctor.pricePerSession || 0), 0);
  const todayEarnings = completedAppts.reduce((sum, appt) => sum + (appt.coins || currentDoctor.pricePerSession || 0), 0);
  const expectedRevenue = upcomingAppts.reduce((sum, appt) => sum + (appt.coins || currentDoctor.pricePerSession || 0), 0);
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const nextPayout = useMemo(() => {
    const payout = new Date();
    payout.setDate(payout.getDate() + 7);
    return payout.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('moodmate_doctor_session');
    if (onLogout) onLogout();
    else window.location.reload();
  };

  return (
    <div className="dd-page">
      <div className="dd-banner">
        <div className="dd-banner-top">
          <span className="dd-banner-label">Provider Workspace Preview</span>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              className="dd-online-badge"
              onClick={() => {
                setIsOnline((prev) => !prev);
                showToast(isOnline ? 'You are now offline.' : 'You are now online.', isOnline ? '#6b7280' : '#10b981');
              }}
            >
              <span className="dd-online-dot" style={{ background: isOnline ? '#10b981' : '#9ca3af', animation: isOnline ? undefined : 'none' }}></span>
              {isOnline ? 'Online' : 'Offline'}
            </button>
            <button
              onClick={handleLogout}
              style={{ padding: '7px 16px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="dd-doctor-row">
          <div className="dd-doc-avatar">{currentDoctor.initials}</div>
          <div>
            <h1>{currentDoctor.name}</h1>
            <p>{currentDoctor.spec || currentDoctor.specialization}</p>
            <div className="dd-doc-meta">
              <span className="dd-doc-meta-item">Rating {currentDoctor.rating} ({currentDoctor.reviews} reviews)</span>
              <span className="dd-doc-meta-item">{currentDoctor.experience || `${currentDoctor.experienceYears || 0} years`}</span>
              <span className="dd-doc-meta-item">{(currentDoctor.languages || []).join(', ')}</span>
              <span className="dd-doc-meta-item">Rs {currentDoctor.pricePerSession || currentDoctor.price}/session</span>
              <span className="dd-doc-meta-item">Sample provider profile</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dd-stats-row">
        <div className="dd-stat-card">
          <div className="dd-stat-label">Today's Sessions</div>
          <div className="dd-stat-value">{upcomingAppts.length}</div>
          <div className="dd-stat-sub">scheduled</div>
        </div>
        <div className="dd-stat-card">
          <div className="dd-stat-label">New Requests</div>
          <div className="dd-stat-value" style={{ color: newBookings.length > 0 ? '#f59e0b' : '#1e1b4b' }}>{newBookings.length}</div>
          <div className="dd-stat-sub">awaiting approval</div>
        </div>
        <div className="dd-stat-card">
          <div className="dd-stat-label">Today's Earnings</div>
          <div className="dd-stat-value" style={{ color: '#7c3aed' }}>Rs {todayEarnings.toLocaleString('en-IN')}</div>
          <div className="dd-stat-sub">completed sessions</div>
        </div>
        <div className="dd-stat-card">
          <div className="dd-stat-label">Completed</div>
          <div className="dd-stat-value" style={{ color: '#10b981' }}>{completedAppts.length}</div>
          <div className="dd-stat-sub">all time</div>
        </div>
      </div>

      <div className="dd-body">
        <div>
          {newBookings.length > 0 && (
            <div className="dd-section">
              <div className="dd-section-header">
                <h2>New Booking Requests</h2>
                <span className="dd-section-badge red">{newBookings.length} pending</span>
              </div>
              <div className="dd-appt-list">
                {newBookings.map((appt) => (
                  <div key={appt.id} className="dd-appt-card pending">
                    <span className="dd-status new">NEW</span>
                    <div className="dd-appt-time">
                      <span className="time">{appt.time?.split(' ').slice(1).join(' ')}</span>
                      <span className="day">{appt.time?.split(' ')[0]}</span>
                    </div>
                    <div className="dd-appt-info">
                      <div className="dd-appt-name">{appt.name} <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500' }}>Age {appt.age} - {appt.gender}</span></div>
                      <div className="dd-appt-topic">"{appt.reason}"</div>
                      <div className="dd-appt-tags">
                        <span className="dd-appt-tag mode">{appt.mode}</span>
                        <span className="dd-appt-tag">{appt.phone}</span>
                        <span className="dd-appt-tag" style={{ background: '#fef3c7', color: '#92400e' }}>Rs {(appt.coins || currentDoctor.pricePerSession).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="dd-appt-actions">
                      <button className="dd-btn-approve" onClick={() => handleApprove(appt.id)}>Approve</button>
                      <button className="dd-btn-decline" onClick={() => handleDecline(appt.id)}>Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="dd-section">
            <div className="dd-section-header">
              <h2>Upcoming Sessions</h2>
              <span className="dd-section-badge">{upcomingAppts.length} scheduled</span>
            </div>
            <div className="dd-appt-list">
              {isLoading ? (
                <div className="dd-empty"><p>Loading bookings...</p></div>
              ) : upcomingAppts.length === 0 ? (
                <div className="dd-empty"><p>No upcoming sessions yet. Approved bookings will appear here.</p></div>
              ) : upcomingAppts.map((appt) => (
                <div key={appt.id} className="dd-appt-card upcoming" onClick={() => setSelectedAppt(selectedAppt?.id === appt.id ? null : appt)} style={{ cursor: 'pointer' }}>
                    <span className="dd-status upcoming">{appt.status === 'reschedule_requested' ? 'Reschedule requested' : 'Upcoming'}</span>
                  <div className="dd-appt-time">
                    <span className="time">{appt.time?.split(' ').slice(1).join(' ')}</span>
                    <span className="day">{appt.time?.split(' ')[0]}</span>
                  </div>
                  <div className="dd-appt-info">
                    <div className="dd-appt-name">{appt.name} <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500' }}>{appt.gender}, {appt.age}</span></div>
                    <div className="dd-appt-topic">"{appt.reason}"</div>
                    <div className="dd-appt-tags">
                      <span className="dd-appt-tag mode">{appt.mode}</span>
                      <span className="dd-appt-tag lang">{appt.phone}</span>
                    </div>
                    {selectedAppt?.id === appt.id && (
                      <div style={{ marginTop: '10px', padding: '10px', background: 'white', borderRadius: '10px', border: '1px solid #ede9fe' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selected session</div>
                        <div style={{ fontSize: '13px', color: '#374151' }}>Phone: {appt.phone}</div>
                        <div style={{ marginTop: '10px' }}>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reschedule slot</div>
                          <select
                            value={selectedAppt?.id === appt.id ? rescheduleSlot : appt.time}
                            onChange={(event) => setRescheduleSlot(event.target.value)}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #ddd6fe', fontSize: '13px' }}
                          >
                            {(currentDoctor.availability || []).map((slot) => (
                              <option key={slot} value={slot}>{slot}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="dd-appt-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="dd-btn-start" onClick={() => handleStart(appt)}>Start Session</button>
                    <button className="dd-btn-notes" onClick={() => setSelectedAppt(appt)}>Add Notes</button>
                    <button
                      className="dd-btn-notes"
                      onClick={() => {
                        setSelectedAppt(appt);
                        setRescheduleSlot(appt.time);
                      }}
                    >
                      Open Reschedule
                    </button>
                    <button className="dd-btn-approve" onClick={() => handleComplete(appt.id)}>Complete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {completedAppts.length > 0 && (
            <div className="dd-section">
              <div className="dd-section-header">
                <h2>Completed Sessions</h2>
                <span className="dd-section-badge green">{completedAppts.length} done</span>
              </div>
              <div className="dd-appt-list">
                {completedAppts.map((appt) => (
                  <div key={appt.id} className="dd-appt-card completed" style={{ opacity: 0.85 }}>
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
                      +Rs {(appt.coins || currentDoctor.pricePerSession).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="dd-right">
          <div className="dd-today-card">
            <h3>Today</h3>
            <div className="dd-today-date">{today}</div>
            <div className="dd-today-grid">
              <div className="dd-today-stat"><span className="val">{upcomingAppts.length}</span><span className="lbl">Sessions</span></div>
              <div className="dd-today-stat"><span className="val">{newBookings.length}</span><span className="lbl">New requests</span></div>
              <div className="dd-today-stat"><span className="val">Rs {expectedRevenue.toLocaleString('en-IN')}</span><span className="lbl">Expected</span></div>
              <div className="dd-today-stat"><span className="val">{completedAppts.length}</span><span className="lbl">Completed</span></div>
            </div>
          </div>

          <div className="dd-earnings">
            <h3>Booking Summary Preview</h3>
            <div className="dd-earn-row"><span className="dd-earn-label">Today</span><span className="dd-earn-value green">Rs {todayEarnings.toLocaleString('en-IN')}</span></div>
            <div className="dd-earn-row"><span className="dd-earn-label">Pending revenue</span><span className="dd-earn-value purple">Rs {expectedRevenue.toLocaleString('en-IN')}</span></div>
            <div className="dd-earn-row"><span className="dd-earn-label">Total earned</span><span className="dd-earn-value">Rs {totalEarnings.toLocaleString('en-IN')}</span></div>
            <div className="dd-earn-row"><span className="dd-earn-label">Avg session rating</span><span className="dd-earn-value">{currentDoctor.rating}</span></div>
            <div className="dd-earn-row"><span className="dd-earn-label">Next payout estimate</span><span className="dd-earn-value green">{nextPayout}</span></div>
          </div>

          <div className="dd-section" style={{ marginBottom: 0 }}>
            <div className="dd-section-header">
              <h2>Session Notes</h2>
            </div>
            <p style={{ marginTop: 0, color: '#64748b', fontSize: '13px' }}>
              {selectedAppt ? `Editing notes for ${selectedAppt.name}.` : 'Select an approved session to add private notes.'}
            </p>
            <textarea
              className="dd-notes-input"
              rows="5"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add private notes for a patient session..."
              disabled={!selectedAppt}
            />
            <button className="dd-btn-notes" style={{ width: '100%', marginTop: '10px' }} onClick={() => handleReschedule()} disabled={!selectedAppt || rescheduleSlot === selectedAppt.time}>
              Confirm Reschedule
            </button>
            <button className="dd-notes-save" onClick={saveNotes} disabled={!selectedAppt || isSaving}>
              {isSaving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
