import React, { useEffect, useState } from 'react';
import './Therapy.css';
import { API_BASE_URL } from '../api';

const PALETTES = [
  { bg: 'linear-gradient(135deg,#4f46e5,#7c3aed)', accent: '#4f46e5' },
  { bg: 'linear-gradient(135deg,#0ea5e9,#6366f1)', accent: '#0ea5e9' },
  { bg: 'linear-gradient(135deg,#ec4899,#f43f5e)', accent: '#ec4899' },
  { bg: 'linear-gradient(135deg,#10b981,#059669)', accent: '#10b981' },
  { bg: 'linear-gradient(135deg,#f59e0b,#ef4444)', accent: '#f59e0b' },
  { bg: 'linear-gradient(135deg,#8b5cf6,#ec4899)', accent: '#8b5cf6' },
];

const allTherapists = [
  {
    id: 1, name: 'Dr. Priya Sharma', initials: 'PS',
    specialization: 'Clinical Psychology', price: 1999, rating: 5.0,
    experience: '8 yrs', reviews: 312,
    languages: ['Hindi', 'English'], modes: ['Video', 'Chat'],
    bio: 'Specialized in anxiety and depression using evidence-based CBT. My goal is to give you tools, not just talk.',
    palette: PALETTES[0],
    badge: 'Top Rated',
  },
  {
    id: 2, name: 'Aaryan Kumar', initials: 'AK',
    specialization: 'Counseling Psychology', price: 599, rating: 4.8,
    experience: '5 yrs', reviews: 184,
    languages: ['Hindi', 'English'], modes: ['Voice', 'Chat'],
    bio: 'Youth mental health, career stress, and relationships with a non-judgmental, practical style.',
    palette: PALETTES[1],
    badge: 'Best Value',
  },
  {
    id: 3, name: 'Dr. Ankur Verma', initials: 'AV',
    specialization: 'Psychiatry', price: 999, rating: 4.9,
    experience: '4 yrs', reviews: 97,
    languages: ['English', 'Hindi'], modes: ['Video'],
    bio: 'MD Psychiatry focused on medication management for treatment-resistant depression and complex anxiety.',
    palette: PALETTES[2],
    badge: null,
  },
  {
    id: 4, name: 'Aanchal Patel', initials: 'AP',
    specialization: 'Art Therapy', price: 499, rating: 4.7,
    experience: '4 yrs', reviews: 76,
    languages: ['Hindi'], modes: ['Video', 'Chat'],
    bio: 'Uses creative processes to explore emotions, reduce anxiety, and build self-esteem.',
    palette: PALETTES[3],
    badge: 'Trending',
  },
  {
    id: 5, name: 'Aakash Patel', initials: 'AaP',
    specialization: 'Cognitive Behavioral Therapy', price: 899, rating: 4.9,
    experience: '10 yrs', reviews: 429,
    languages: ['Hindi', 'English', 'Gujarati'], modes: ['Video', 'Chat'],
    bio: 'CBT expert focused on breaking negative thought loops that fuel anxiety and low mood.',
    palette: PALETTES[4],
    badge: 'Most Experienced',
  },
  {
    id: 6, name: 'Nitin Kumar', initials: 'NK',
    specialization: 'Mindfulness & Meditation', price: 649, rating: 4.8,
    experience: '6 yrs', reviews: 203,
    languages: ['English', 'Hindi'], modes: ['Video', 'Voice'],
    bio: 'Teaches mindfulness techniques to manage stress and anxiety with practical takeaways after every session.',
    palette: PALETTES[5],
    badge: null,
  },
];

const doctorAvailability = {
  1: ['Mon 2 PM', 'Wed 10 AM', 'Fri 4 PM'],
  2: ['Tue 9 AM', 'Thu 3 PM', 'Sat 11 AM'],
  3: ['Mon 5 PM', 'Wed 3 PM', 'Fri 10 AM'],
  4: ['Wed 1 PM', 'Fri 11 AM', 'Sun 2 PM'],
  5: ['Mon 11 AM', 'Tue 4 PM', 'Thu 6 PM'],
  6: ['Tue 8 AM', 'Sat 10 AM', 'Sun 5 PM'],
};

const BADGE_COLORS = {
  'Top Rated': { bg: '#fef3c7', color: '#92400e' },
  'Best Value': { bg: '#d1fae5', color: '#065f46' },
  'Trending': { bg: '#fce7f3', color: '#9d174d' },
  'Most Experienced': { bg: '#ede9fe', color: '#5b21b6' },
};

function showToast(message, color = '#10b981') {
  const t = document.createElement('div');
  t.innerHTML = `<span>${message}</span><button style="background:transparent;border:none;color:white;cursor:pointer;font-weight:bold;margin-left:12px;opacity:0.8;font-size:16px;">x</button>`;
  t.style.cssText = `display:flex;align-items:center;position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:${color};color:white;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:600;z-index:9999;font-family:Inter,sans-serif`;
  t.querySelector('button').onclick = () => { if (document.body.contains(t)) t.remove(); };
  document.body.appendChild(t);
  setTimeout(() => { if (document.body.contains(t)) t.remove(); }, 4000);
}

export default function Therapy({ user }) {
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [filtered, setFiltered] = useState(allTherapists);
  const [bookingFor, setBookingFor] = useState(null);
  const [detailsFor, setDetailsFor] = useState(null);
  const [booked, setBooked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: user?.username || '', age: '', gender: '', phone: '', reason: '', time: '' });
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    let list = allTherapists;
    if (search) {
      const query = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(query) || t.specialization.toLowerCase().includes(query));
    }
    if (langFilter !== 'All') list = list.filter((t) => t.languages.includes(langFilter));
    if (modeFilter !== 'All') list = list.filter((t) => t.modes.includes(modeFilter));
    setFiltered(list);
  }, [search, langFilter, modeFilter]);

  const handleQuizAnswer = (key, value) => {
    const nextAnswers = { ...quizAnswers, [key]: value };
    setQuizAnswers(nextAnswers);

    if (quizStep < 2) {
      setQuizStep((prev) => prev + 1);
      return;
    }

    setIsMatching(true);
    setTimeout(() => {
      let bestMatch = allTherapists[0];
      if (nextAnswers.issue === 'Career') bestMatch = allTherapists.find((t) => t.id === 2) || bestMatch;
      if (nextAnswers.issue === 'Anxiety') bestMatch = allTherapists.find((t) => t.id === 5) || bestMatch;
      if (nextAnswers.issue === 'Therapy') bestMatch = allTherapists.find((t) => t.id === 4) || bestMatch;
      if (nextAnswers.lang === 'Hindi') bestMatch = allTherapists.find((t) => t.id === 1) || bestMatch;

      setFiltered([bestMatch]);
      setShowQuiz(false);
      setQuizStep(0);
      setQuizAnswers({});
      setIsMatching(false);
      showToast(`Best match found: ${bestMatch.name}.`);
    }, 1800);
  };

  const handleConfirm = async () => {
    if (!bookingFor) return;
    if (!form.name || !form.phone || !form.reason || !form.time) {
      showToast('Please fill all fields and pick a time slot.', '#ef4444');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/therapy/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user_id: user?.id || null,
          doctor_id: bookingFor.id,
          doctor_name: bookingFor.name,
          name: form.name,
          age: form.age,
          gender: form.gender,
          phone: form.phone,
          reason: form.reason,
          time: form.time,
          mode: bookingFor.modes[0],
          price: bookingFor.price,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        showToast(data.message || 'Could not complete the booking.', '#ef4444');
        return;
      }

      setBooked(true);
      setTimeout(() => {
        setBooked(false);
        setBookingFor(null);
        setForm({ name: user?.username || '', age: '', gender: '', phone: '', reason: '', time: '' });
        showToast(`Session booked with ${bookingFor.name}. The doctor can now review it.`, '#10b981');
      }, 1000);
    } catch {
      showToast('Network error while booking the session.', '#ef4444');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="therapy-hub">
      <div className="th-hero">
        <h1>
          {filtered.filter((t) => t.languages.includes('Hindi')).length} Hindi-speaking therapists
          {langFilter !== 'All' || search ? ' match your search' : ' available today'}
        </h1>
        <p>Licensed professionals who speak your language. Book a session in under a minute.</p>
        <div className="th-hero-stats">
          <div className="th-hero-stat"><span className="num">{allTherapists.length}</span><span className="lbl">Therapists</span></div>
          <div className="th-hero-stat"><span className="num">Rs 499+</span><span className="lbl">Per session</span></div>
          <div className="th-hero-stat"><span className="num">Hindi yes</span><span className="lbl">Supported</span></div>
          <div className="th-hero-stat"><span className="num">4.8</span><span className="lbl">Avg rating</span></div>
        </div>
      </div>

      {/* Intelligent Intake Assessment Card */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', padding: '24px', borderRadius: '24px', margin: '0 20px 24px', color: 'white', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid #4338ca', boxShadow: '0 10px 30px rgba(49, 46, 129, 0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ fontSize: '28px', flexShrink: 0, marginTop: '2px' }}>🧠</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: '800', lineHeight: 1.2 }}>Get Clinically Matched</h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#c7d2fe', lineHeight: 1.5 }}>
              Unsure who to choose? Take our 60-second intelligent intake quiz to find the perfect therapist for your specific needs.
            </p>
          </div>
        </div>
        <button
          onClick={() => { setShowQuiz(true); setQuizStep(0); setQuizAnswers({}); setFiltered(allTherapists); }}
          style={{ padding: '14px', borderRadius: '12px', background: 'white', border: 'none', color: '#312e81', fontWeight: '800', fontSize: '14.5px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', transition: 'all 0.2s', width: '100%' }}
        >
          Start Assessment
        </button>
      </div>

      <div style={{ margin: '0 20px 24px', display: 'flex', gap: '16px' }}>
        <button
          style={{ flex: 1, padding: '16px', borderRadius: '16px', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#b91c1c', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
          onClick={() => showToast('For urgent support, use the crisis chat on Home or contact local emergency services.', '#b91c1c')}
        >
          Need urgent support?
        </button>
      </div>

      {showQuiz && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', background: 'white', borderRadius: '24px', padding: '30px' }}>
            {isMatching ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>...</div>
                <h3 style={{ fontSize: '20px', color: '#0f172a' }}>Analyzing your fit...</h3>
                <p style={{ color: '#64748b' }}>Matching you with the best starting therapist.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#6366f1' }}>Step {quizStep + 1} of 3</span>
                  <button onClick={() => setShowQuiz(false)} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}>x</button>
                </div>

                {quizStep === 0 && (
                  <div>
                    <h3 style={{ fontSize: '22px', color: '#0f172a', marginBottom: '24px' }}>What brings you to therapy today?</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button onClick={() => handleQuizAnswer('issue', 'Anxiety')} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>Overwhelming anxiety or stress</button>
                      <button onClick={() => handleQuizAnswer('issue', 'Depression')} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>Feeling low or depressed</button>
                      <button onClick={() => handleQuizAnswer('issue', 'Career')} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>Career burnout or confusion</button>
                      <button onClick={() => handleQuizAnswer('issue', 'Therapy')} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>I need someone to talk to</button>
                    </div>
                  </div>
                )}

                {quizStep === 1 && (
                  <div>
                    <h3 style={{ fontSize: '22px', color: '#0f172a', marginBottom: '24px' }}>What style works best for you?</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button onClick={() => handleQuizAnswer('style', 'Structured')} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>Structured and goal-oriented</button>
                      <button onClick={() => handleQuizAnswer('style', 'Listening')} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>A safe space to vent and explore</button>
                      <button onClick={() => handleQuizAnswer('style', 'Actionable')} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>Actionable advice and homework</button>
                    </div>
                  </div>
                )}

                {quizStep === 2 && (
                  <div>
                    <h3 style={{ fontSize: '22px', color: '#0f172a', marginBottom: '24px' }}>Any language preference?</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button onClick={() => handleQuizAnswer('lang', 'Hindi')} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>Hindi preferred</button>
                      <button onClick={() => handleQuizAnswer('lang', 'English')} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>English preferred</button>
                      <button onClick={() => handleQuizAnswer('lang', 'Either')} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>No preference</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="th-filters">
        <input className="th-search" placeholder="Search by name or specialty..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="th-select" value={langFilter} onChange={(e) => setLangFilter(e.target.value)}>
          <option value="All">All Languages</option>
          <option value="Hindi">Hindi</option>
          <option value="English">English</option>
          <option value="Gujarati">Gujarati</option>
        </select>
        <select className="th-select" value={modeFilter} onChange={(e) => setModeFilter(e.target.value)}>
          <option value="All">All Modes</option>
          <option value="Video">Video</option>
          <option value="Voice">Voice</option>
          <option value="Chat">Chat</option>
        </select>
        <span className="th-result-count">{filtered.length} therapist{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="th-grid">
        {filtered.length === 0 && (
          <div className="th-no-results">
            <div className="icon">?</div>
            <p>No therapists match your filters. Try broadening your search.</p>
          </div>
        )}

        {filtered.map((t) => (
          <div key={t.id} className="th-card">
            <div className="th-card-accent" style={{ background: t.palette.bg }}></div>

            <div className="th-card-top">
              <div className="th-avatar" style={{ background: t.palette.bg }}>{t.initials}</div>
              <div className="th-info">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <div className="th-name">{t.name}</div>
                    <div className="th-spec-pill">{t.specialization}</div>
                  </div>
                  {t.badge && (
                    <span style={{ background: BADGE_COLORS[t.badge]?.bg || '#ede9fe', color: BADGE_COLORS[t.badge]?.color || '#4f46e5', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {t.badge}
                    </span>
                  )}
                </div>
                <div className="th-meta">
                  <span className="th-meta-item"><span className="th-rating">*</span> {t.rating.toFixed(1)} <span style={{ color: '#d1d5db' }}>({t.reviews})</span></span>
                  <span className="th-meta-item" style={{ background: '#f8fafc', padding: '3px 10px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#475569', fontWeight: '600', fontSize: '11.5px' }}>{t.experience}</span>
                </div>
              </div>

              <div className="th-price-badge">
                <span className="price">Rs {t.price}</span>
                <span className="per">/session</span>
              </div>
            </div>

            <div className="th-divider"></div>
            <p className="th-bio">{t.bio}</p>

            <div className="th-tags">
              {t.languages.map((l) => <span key={l} className="th-tag th-tag-lang">{l}</span>)}
              {t.modes.map((m) => <span key={m} className="th-tag th-tag-mode">{m}</span>)}
            </div>

            <div className="th-avail">
              <div className="th-avail-label">Available slots</div>
              <div className="th-slots">
                {doctorAvailability[t.id].map((slot) => <span key={slot} className="th-slot">{slot}</span>)}
              </div>
            </div>

            <div className="th-card-footer">
              <button className="th-btn-details" onClick={() => setDetailsFor(t)}>View Profile</button>
              <button className="th-btn-book" onClick={() => setBookingFor(t)}>Book Session</button>
            </div>
          </div>
        ))}
      </div>

      {detailsFor && (
        <div className="modal-overlay" onClick={() => setDetailsFor(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setDetailsFor(null)}>x</button>
            <div className="details-modal-header" style={{ background: detailsFor.palette.bg }}>
              <div className="dm-avatar" style={{ background: 'rgba(255,255,255,0.2)' }}>{detailsFor.initials}</div>
              <h2>{detailsFor.name}</h2>
              <p>{detailsFor.specialization}</p>
            </div>
            <div className="details-modal-body">
              <div className="dm-section">
                <div className="dm-label">About</div>
                <div className="dm-value">{detailsFor.bio}</div>
              </div>
              <div className="dm-section">
                <div className="dm-label">Experience and Rating</div>
                <div className="dm-value">{detailsFor.experience} experience, {detailsFor.rating} rating, {detailsFor.reviews} reviews</div>
              </div>
              <div className="dm-section">
                <div className="dm-label">Languages</div>
                <div className="dm-row">{detailsFor.languages.map((l) => <span key={l} className="th-tag th-tag-lang">{l}</span>)}</div>
              </div>
              <div className="dm-section">
                <div className="dm-label">Session Modes</div>
                <div className="dm-row">{detailsFor.modes.map((m) => <span key={m} className="th-tag th-tag-mode">{m}</span>)}</div>
              </div>
              <div className="dm-section">
                <div className="dm-label">Available Slots</div>
                <div className="dm-row">{doctorAvailability[detailsFor.id].map((slot) => <span key={slot} className="th-slot">{slot}</span>)}</div>
              </div>
              <button className="dm-book-btn" onClick={() => { setDetailsFor(null); setBookingFor(detailsFor); }}>
                Book Session - Rs {detailsFor.price}
              </button>
            </div>
          </div>
        </div>
      )}

      {bookingFor && (
        <div className="modal-overlay" onClick={() => !booked && !isSubmitting && setBookingFor(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {!booked && <button className="close-btn" onClick={() => setBookingFor(null)}>x</button>}
            {booked ? (
              <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>Done</div>
                <h2 style={{ color: '#1e1b4b', margin: '0 0 8px', fontSize: '22px', fontWeight: '800' }}>Booking Confirmed</h2>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Your request has been sent to the doctor dashboard for review.</p>
              </div>
            ) : (
              <>
                <div className="booking-form-header" style={{ background: bookingFor.palette.bg }}>
                  <h3>Book a session with</h3>
                  <h2>{bookingFor.name}</h2>
                </div>
                <div className="booking-form">
                  <div className="form-row">
                    <div className="form-group"><label>Full Name</label><input type="text" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Your name" /></div>
                    <div className="form-group"><label>Phone</label><input type="tel" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label>Age</label><input type="number" value={form.age} onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))} placeholder="Your age" /></div>
                    <div className="form-group"><label>Gender</label>
                      <select value={form.gender} onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}>
                        <option value="">Select...</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Non-binary</option>
                        <option>Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group"><label>What would you like to work on?</label><textarea rows="3" value={form.reason} onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))} placeholder="e.g. anxiety, stress at work, relationship issues..." /></div>
                  <div className="form-group">
                    <label>Pick a Time Slot</label>
                    <div className="time-slots">
                      {doctorAvailability[bookingFor.id].map((slot) => (
                        <button key={slot} type="button" className={`time-slot-btn ${form.time === slot ? 'selected' : ''}`} onClick={() => setForm((prev) => ({ ...prev, time: slot }))}>{slot}</button>
                      ))}
                    </div>
                  </div>
                  <div className="booking-summary">
                    <span>Session: <strong style={{ color: '#4f46e5' }}>Rs {bookingFor.price}</strong></span>
                    <button className="confirm-booking-btn" onClick={handleConfirm} disabled={isSubmitting}>
                      {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
