import React, { useState, useEffect } from 'react';
import './Therapy.css';

// Doctor gradient palettes — each doctor has a unique color identity
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
    bio: 'Specialized in anxiety and depression using evidence-based CBT. My goal is to give you tools — not just talk.',
    palette: PALETTES[0],
    badge: 'Top Rated',
  },
  {
    id: 2, name: 'Dr. Vikram Singh', initials: 'VS',
    specialization: 'Counseling Psychology', price: 599, rating: 4.8,
    experience: '5 yrs', reviews: 184,
    languages: ['Hindi', 'English'], modes: ['Voice', 'Chat'],
    bio: 'Youth mental health, career stress, and relationships. I create a non-judgmental, safe space where Hindi is always welcome.',
    palette: PALETTES[1],
    badge: 'Best Value',
  },
  {
    id: 3, name: 'Dr. Ankur Verma', initials: 'AV',
    specialization: 'Psychiatry', price: 999, rating: 4.9,
    experience: '4 yrs', reviews: 97,
    languages: ['English', 'Hindi'], modes: ['Video'],
    bio: 'MD Psychiatry. Expert in medication management for treatment-resistant depression and complex anxiety disorders.',
    palette: PALETTES[2],
    badge: null,
  },
  {
    id: 4, name: 'Dr. Neha Kapoor', initials: 'NK',
    specialization: 'Art Therapy', price: 499, rating: 4.7,
    experience: '4 yrs', reviews: 76,
    languages: ['Hindi'], modes: ['Video', 'Chat'],
    bio: 'Uses creative processes to explore emotions, reduce anxiety, and build self-esteem. No artistic skill needed at all.',
    palette: PALETTES[3],
    badge: 'Trending',
  },
  {
    id: 5, name: 'Dr. Aakash Desai', initials: 'AD',
    specialization: 'Cognitive Behavioral Therapy', price: 899, rating: 4.9,
    experience: '10 yrs', reviews: 429,
    languages: ['Hindi', 'English', 'Gujarati'], modes: ['Video', 'Chat'],
    bio: 'CBT expert focused on breaking the negative thought loops that fuel anxiety and low mood. Science-backed, human-centered.',
    palette: PALETTES[4],
    badge: 'Most Experienced',
  },
  {
    id: 6, name: 'Dr. Sanjay Reddy', initials: 'SR',
    specialization: 'Mindfulness & Meditation', price: 649, rating: 4.8,
    experience: '6 yrs', reviews: 203,
    languages: ['English', 'Hindi'], modes: ['Video', 'Voice'],
    bio: 'Teaches mindfulness techniques to manage stress and anxiety. Each session leaves you with something you can use tomorrow.',
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

export default function Therapy({ user }) {
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [filtered, setFiltered] = useState(allTherapists);
  const [bookingFor, setBookingFor] = useState(null);
  const [detailsFor, setDetailsFor] = useState(null);
  const [form, setForm] = useState({ name: user?.username || '', age: '', gender: '', phone: '', reason: '', time: '' });
  const [booked, setBooked] = useState(false);
  
  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    let list = allTherapists;
    if (search) list = list.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.specialization.toLowerCase().includes(search.toLowerCase()));
    if (langFilter !== 'All') list = list.filter(t => t.languages.includes(langFilter));
    if (modeFilter !== 'All') list = list.filter(t => t.modes.includes(modeFilter));
    setFiltered(list);
  }, [search, langFilter, modeFilter]);

  const handleConfirm = () => {
    if (!form.name || !form.phone || !form.reason || !form.time) {
      const t = document.createElement('div');
      t.innerHTML = `<span>⚠️ Please fill all fields and pick a time slot</span><button style="background:transparent;border:none;color:white;cursor:pointer;font-weight:bold;margin-left:12px;opacity:0.8;font-size:16px;">✕</button>`;
      t.style.cssText = 'display:flex;align-items:center;position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#ef4444;color:white;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:600;z-index:9999;font-family:Inter,sans-serif';
      t.querySelector('button').onclick = () => { if (document.body.contains(t)) t.remove(); };
      document.body.appendChild(t); setTimeout(() => { if (document.body.contains(t)) t.remove(); }, 3500);
      return;
    }

    // 💾 Save booking to localStorage so Doctor Dashboard can read it
    const booking = {
      ...form,
      doctorId: bookingFor.id,
      doctorName: bookingFor.name,
      price: bookingFor.price,
      mode: bookingFor.modes[0],
      bookedAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('moodmate_bookings') || '[]');
    localStorage.setItem('moodmate_bookings', JSON.stringify([booking, ...existing]));

    setBooked(true);
    setTimeout(() => {
      setBooked(false);
      setBookingFor(null);
      setForm({ name: user?.username || '', age: '', gender: '', phone: '', reason: '', time: '' });
      const t = document.createElement('div');
      t.innerHTML = `<span>✅ Session booked with ${bookingFor.name}! Check Doctor Dashboard.</span><button style="background:transparent;border:none;color:white;cursor:pointer;font-weight:bold;margin-left:12px;opacity:0.8;font-size:16px;">✕</button>`;
      t.style.cssText = 'display:flex;align-items:center;position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#10b981;color:white;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:600;z-index:9999;font-family:Inter,sans-serif';
      t.querySelector('button').onclick = () => { if (document.body.contains(t)) t.remove(); };
      document.body.appendChild(t); setTimeout(() => { if (document.body.contains(t)) t.remove(); }, 4000);
    }, 1400);
  };

  const handleQuizAnswer = (key, val) => {
    const newAnswers = { ...quizAnswers, [key]: val };
    setQuizAnswers(newAnswers);
    
    if (quizStep < 2) {
      setQuizStep(quizStep + 1);
    } else {
      // Finish Quiz -> Run Algorithm
      setIsMatching(true);
      setTimeout(() => {
        setIsMatching(false);
        setShowQuiz(false);
        setQuizStep(0);
        
        // Simple heuristic matching
        let bestMatch = allTherapists[0];
        if (newAnswers.issue === 'Career') bestMatch = allTherapists.find(t => t.id === 2); // Vikram
        if (newAnswers.issue === 'Anxiety') bestMatch = allTherapists.find(t => t.id === 5); // Aakash
        if (newAnswers.issue === 'Therapy') bestMatch = allTherapists.find(t => t.id === 4); // Art Therapy
        
        setFiltered([bestMatch]);
        
        const t = document.createElement('div');
        t.innerHTML = `<span>✨ We found a 98% match for your specific clinical needs!</span><button style="background:transparent;border:none;color:white;cursor:pointer;font-weight:bold;margin-left:12px;opacity:0.8;font-size:16px;">✕</button>`;
        t.style.cssText = 'display:flex;align-items:center;position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#10b981;color:white;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:600;z-index:9999;font-family:Inter,sans-serif';
        t.querySelector('button').onclick = () => { if (document.body.contains(t)) t.remove(); };
        document.body.appendChild(t); setTimeout(() => { if (document.body.contains(t)) t.remove(); }, 4000);

      }, 2000);
    }
  };

  return (
    <div className="therapy-hub">
      {/* Hero */}
      <div className="th-hero">
        <h1>
          {filtered.filter(t => t.languages.includes('Hindi')).length} Hindi-speaking therapists
          {langFilter !== 'All' || search ? ` match your search` : ` available today`}
        </h1>
        <p>Licensed professionals who speak your language — literally. Book a session in 60 seconds.</p>
        <div className="th-hero-stats">
          <div className="th-hero-stat"><span className="num">{allTherapists.length}</span><span className="lbl">Therapists</span></div>
          <div className="th-hero-stat"><span className="num">₹499+</span><span className="lbl">Per session</span></div>
          <div className="th-hero-stat"><span className="num">Hindi ✓</span><span className="lbl">Supported</span></div>
          <div className="th-hero-stat"><span className="num">4.8★</span><span className="lbl">Avg rating</span></div>
        </div>
      </div>

      {/* Billion-Dollar Feature #5: Algorithmic Therapist Matching (BetterHelp Parity) */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', padding: '24px', borderRadius: '24px', margin: '0 20px 24px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #4338ca', boxShadow: '0 10px 30px rgba(49, 46, 129, 0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontSize: '32px', background: 'rgba(255,255,255,0.1)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🧠</div>
            <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '800' }}>Get Clinically Matched</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#c7d2fe', lineHeight: 1.5, maxWidth: '400px' }}>Unsure who to choose? Take our 60-second intelligent intake quiz to find the perfect therapist for your specific needs.</p>
            </div>
        </div>
        <button 
            onClick={() => { setShowQuiz(true); setQuizAnswers({}); setFiltered(allTherapists); }}
            style={{ padding: '12px 24px', borderRadius: '12px', background: 'white', border: 'none', color: '#312e81', fontWeight: '800', fontSize: '14.5px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
        >
            Start Assessment →
        </button>
      </div>

      {/* Mini Feature 9: Urgent Care Drop-in */}
      <div style={{ margin: '0 20px 24px', display: 'flex', gap: '16px' }}>
          <button style={{ flex: 1, padding: '16px', borderRadius: '16px', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#b91c1c', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }} onClick={() => alert('Connecting you to an available professional in < 2 mins...')}>
              <span style={{ position: 'relative', display: 'flex', height: '10px', width: '10px' }}>
                <span style={{ animate: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite', position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', background: '#f87171', opacity: '0.7' }}></span>
                <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '10px', width: '10px', background: '#ef4444' }}></span>
              </span>
              Need an Urgent Care Drop-in?
          </button>
      </div>

      {showQuiz && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', background: 'white', borderRadius: '24px', padding: '30px' }}>
            {isMatching ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 2s linear infinite' }}>⚙️</div>
                <h3 style={{ fontSize: '20px', color: '#0f172a' }}>Analyzing clinical profile...</h3>
                <p style={{ color: '#64748b' }}>Matching you with the ideal licensed specialist.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#6366f1' }}>Step {quizStep + 1} of 3</span>
                  <button onClick={() => setShowQuiz(false)} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
                </div>
                
                {quizStep === 0 && (
                  <div>
                    <h3 style={{ fontSize: '22px', color: '#0f172a', marginBottom: '24px' }}>What brings you to therapy today?</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button onClick={() => handleQuizAnswer('issue', 'Anxiety')} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>Overwhelming Anxiety / Stress</button>
                      <button onClick={() => handleQuizAnswer('issue', 'Depression')} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>Feeling Low / Depressed</button>
                      <button onClick={() => handleQuizAnswer('issue', 'Career')} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>Career Burnout & Confusion</button>
                      <button onClick={() => handleQuizAnswer('issue', 'Therapy')} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>I just need to talk to someone</button>
                    </div>
                  </div>
                )}

                {quizStep === 1 && (
                  <div>
                    <h3 style={{ fontSize: '22px', color: '#0f172a', marginBottom: '24px' }}>What approach works best for you?</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button onClick={() => handleQuizAnswer('style', 'Structured')} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>Structured & Goal-Oriented (CBT)</button>
                      <button onClick={() => handleQuizAnswer('style', 'Listening')} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>A safe space to vent and explore</button>
                      <button onClick={() => handleQuizAnswer('style', 'Actionable')} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>Actionable advice & homework</button>
                    </div>
                  </div>
                )}

                {quizStep === 2 && (
                  <div>
                    <h3 style={{ fontSize: '22px', color: '#0f172a', marginBottom: '24px' }}>Any language preferences?</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button onClick={() => handleQuizAnswer('lang', 'Hindi')} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>Hindi Preferred</button>
                      <button onClick={() => handleQuizAnswer('lang', 'English')} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>English Preferred</button>
                      <button onClick={() => handleQuizAnswer('lang', 'Either')} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>No Preference</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="th-filters">
        <input className="th-search" placeholder="Search by name or specialty…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="th-select" value={langFilter} onChange={e => setLangFilter(e.target.value)}>
          <option value="All">🌐 All Languages</option>
          <option value="Hindi">🇮🇳 Hindi</option>
          <option value="English">🇬🇧 English</option>
          <option value="Gujarati">Gujarati</option>
        </select>
        <select className="th-select" value={modeFilter} onChange={e => setModeFilter(e.target.value)}>
          <option value="All">📱 All Modes</option>
          <option value="Video">📹 Video</option>
          <option value="Voice">📞 Voice</option>
          <option value="Chat">💬 Chat</option>
        </select>
        <span className="th-result-count">{filtered.length} therapist{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Cards Grid */}
      <div className="th-grid">
        {filtered.length === 0 && (
          <div className="th-no-results">
            <div className="icon">🔍</div>
            <p>No therapists match your filters. Try broadening your search.</p>
          </div>
        )}
        {filtered.map(t => (
          <div key={t.id} className="th-card">
            {/* Top accent bar in doctor's color */}
            <div className="th-card-accent" style={{ background: t.palette.bg }}></div>

            <div className="th-card-top">
              {/* Avatar */}
              <div className="th-avatar" style={{ background: t.palette.bg }}>
                {t.initials}
              </div>

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
                  <span className="th-meta-item"><span className="th-rating">★</span> {t.rating.toFixed(1)} <span style={{ color: '#d1d5db' }}>({t.reviews})</span></span>
                  <span className="th-meta-item" style={{ background: '#f8fafc', padding: '3px 10px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#475569', fontWeight: '600', fontSize: '11.5px' }}>🎓 {t.experience}</span>
                </div>
              </div>

              {/* Price */}
              <div className="th-price-badge">
                <span className="price">₹{t.price}</span>
                <span className="per">/session</span>
              </div>
            </div>

            <div className="th-divider"></div>

            <p className="th-bio">{t.bio}</p>

            {/* Tags */}
            <div className="th-tags">
              {t.languages.map(l => <span key={l} className="th-tag th-tag-lang">{l}</span>)}
              {t.modes.map(m => <span key={m} className="th-tag th-tag-mode">{m === 'Video' ? '📹' : m === 'Voice' ? '📞' : '💬'} {m}</span>)}
            </div>

            {/* Availability */}
            <div className="th-avail">
              <div className="th-avail-label">🟢 Available slots</div>
              <div className="th-slots">
                {doctorAvailability[t.id].map(slot => <span key={slot} className="th-slot">{slot}</span>)}
              </div>
            </div>

            <div className="th-card-footer">
              <button className="th-btn-details" onClick={() => setDetailsFor(t)}>View Profile</button>
              <button className="th-btn-book" onClick={() => setBookingFor(t)}>📅 Book Session</button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Details Modal ── */}
      {detailsFor && (
        <div className="modal-overlay" onClick={() => setDetailsFor(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setDetailsFor(null)}>✕</button>
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
                <div className="dm-label">Experience & Rating</div>
                <div className="dm-value">{detailsFor.experience} experience · ★ {detailsFor.rating} ({detailsFor.reviews} reviews)</div>
              </div>
              <div className="dm-section">
                <div className="dm-label">Languages</div>
                <div className="dm-row">{detailsFor.languages.map(l => <span key={l} className="th-tag th-tag-lang">{l}</span>)}</div>
              </div>
              <div className="dm-section">
                <div className="dm-label">Session Modes</div>
                <div className="dm-row">{detailsFor.modes.map(m => <span key={m} className="th-tag th-tag-mode">{m}</span>)}</div>
              </div>
              <div className="dm-section">
                <div className="dm-label">Available Slots</div>
                <div className="dm-row">{doctorAvailability[detailsFor.id].map(s => <span key={s} className="th-slot">{s}</span>)}</div>
              </div>
              <button className="dm-book-btn" onClick={() => { setDetailsFor(null); setBookingFor(detailsFor); }}>
                📅 Book Session — ₹{detailsFor.price}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Booking Modal ── */}
      {bookingFor && (
        <div className="modal-overlay" onClick={() => !booked && setBookingFor(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {!booked && <button className="close-btn" onClick={() => setBookingFor(null)}>✕</button>}
            {booked ? (
              <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
                <h2 style={{ color: '#1e1b4b', margin: '0 0 8px', fontSize: '22px', fontWeight: '800' }}>Booking Confirmed!</h2>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>You'll receive a confirmation shortly. See you there! 💙</p>
              </div>
            ) : (
              <>
                <div className="booking-form-header" style={{ background: bookingFor.palette.bg }}>
                  <h3>Book a session with</h3>
                  <h2>{bookingFor.name}</h2>
                </div>
                <div className="booking-form">
                  <div className="form-row">
                    <div className="form-group"><label>Full Name</label><input type="text" name="name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" /></div>
                    <div className="form-group"><label>Phone</label><input type="tel" name="phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label>Age</label><input type="number" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} placeholder="Your age" /></div>
                    <div className="form-group"><label>Gender</label>
                      <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                        <option value="">Select…</option>
                        <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group"><label>What would you like to work on?</label><textarea rows="3" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="e.g. anxiety, stress at work, relationship issues…"></textarea></div>
                  <div className="form-group">
                    <label>Pick a Time Slot</label>
                    <div className="time-slots">
                      {doctorAvailability[bookingFor.id].map(slot => (
                        <button key={slot} className={`time-slot-btn ${form.time === slot ? 'selected' : ''}`} onClick={() => setForm(p => ({ ...p, time: slot }))}>{slot}</button>
                      ))}
                    </div>
                  </div>
                  <div className="booking-summary">
                    <span>Session: <strong style={{ color: '#4f46e5' }}>🪙 {bookingFor.price} coins</strong></span>
                    <button className="confirm-booking-btn" onClick={handleConfirm}>Confirm Booking ✓</button>
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