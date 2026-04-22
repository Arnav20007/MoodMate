import React, { useEffect, useMemo, useState } from 'react';
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

const FALLBACK_THERAPISTS = [
  {
    id: 1,
    name: 'Dr. Priya Sharma',
    initials: 'PS',
    specialization: 'Clinical Psychology',
    price: 1999,
    rating: 4.9,
    reviews: 128,
    experience: '8 years',
    languages: ['Hindi', 'English'],
    modes: ['Video', 'Chat'],
    badge: 'Verified sample clinician',
    bio: 'A CBT-oriented psychologist focused on anxiety, panic, and work stress.',
    availability: ['Mon 2 PM', 'Wed 10 AM', 'Fri 4 PM'],
    profileSource: 'sample',
    sampleLabel: 'Sample clinician profile for demo use only',
    licenseInfo: 'RCI licensed clinical psychologist, sample profile for demo use',
    qualifications: ['MPhil Clinical Psychology', 'CBT and ACT training'],
    approaches: ['CBT', 'ACT', 'Mindfulness'],
    focusAreas: ['Anxiety', 'Panic', 'Stress', 'Burnout'],
    bestFor: 'Adults who want structured sessions with practical coping tools.',
    firstSession: 'The first session covers goals, current stressors, and a simple plan for the week ahead.',
    cancellationPolicy: 'Sample policy: reschedule at least 12 hours in advance.',
    reviewSummary: 'Clients describe Priya as calm, clear, and practical.',
    isVerified: true,
    photoUrl: '',
  },
];

const QUIZ_STEPS = [
  {
    key: 'issue',
    title: 'What brings you to therapy today?',
    options: [
      { label: 'Overwhelming anxiety or stress', value: 'Anxiety' },
      { label: 'Feeling low or depressed', value: 'Depression' },
      { label: 'Career burnout or confusion', value: 'Career' },
      { label: 'I need someone to talk to', value: 'Therapy' },
    ],
  },
  {
    key: 'style',
    title: 'What style works best for you?',
    options: [
      { label: 'Structured and goal-oriented', value: 'Structured' },
      { label: 'A safe space to vent and explore', value: 'Listening' },
      { label: 'Actionable advice and homework', value: 'Actionable' },
    ],
  },
  {
    key: 'lang',
    title: 'Any language preference?',
    options: [
      { label: 'Hindi preferred', value: 'Hindi' },
      { label: 'English preferred', value: 'English' },
      { label: 'No preference', value: 'Either' },
    ],
  },
];

function showToast(message, color = '#10b981') {
  const toast = document.createElement('div');
  toast.innerHTML = `<span>${message}</span><button style="background:transparent;border:none;color:white;cursor:pointer;font-weight:bold;margin-left:12px;opacity:0.8;font-size:16px;">x</button>`;
  toast.style.cssText = `display:flex;align-items:center;position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:${color};color:white;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:600;z-index:9999;font-family:Inter,sans-serif`;
  toast.querySelector('button').onclick = () => {
    if (document.body.contains(toast)) toast.remove();
  };
  document.body.appendChild(toast);
  setTimeout(() => {
    if (document.body.contains(toast)) toast.remove();
  }, 4000);
}

function paletteFor(index) {
  return PALETTES[index % PALETTES.length];
}

export default function Therapy({ user }) {
  const [therapists, setTherapists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [recommendedDoctorId, setRecommendedDoctorId] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [detailsFor, setDetailsFor] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [bookingFor, setBookingFor] = useState(null);
  const [booked, setBooked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [isMatching, setIsMatching] = useState(false);
  const [savedDoctorIds, setSavedDoctorIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('moodmate_saved_doctors') || '[]');
    } catch {
      return [];
    }
  });
  const [form, setForm] = useState({
    name: user?.username || '',
    age: '',
    gender: '',
    phone: '',
    reason: '',
    time: '',
  });
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingActionId, setBookingActionId] = useState(null);

  useEffect(() => {
    setForm((prev) => ({ ...prev, name: user?.username || '' }));
  }, [user?.username]);

  useEffect(() => {
    localStorage.setItem('moodmate_saved_doctors', JSON.stringify(savedDoctorIds));
  }, [savedDoctorIds]);

  const fetchMyBookings = async () => {
    if (!user?.id) {
      setMyBookings([]);
      return;
    }
    setBookingsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/therapy/bookings`, { credentials: 'include' });
      const data = await response.json();
      if (response.ok && data.success) {
        setMyBookings(data.bookings || []);
      }
    } catch {
      setMyBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    const loadDoctors = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/doctors`, { credentials: 'include' });
        const data = await response.json();
        if (response.ok && data.success && Array.isArray(data.doctors) && data.doctors.length > 0) {
          setTherapists(
            data.doctors.map((doctor, index) => {
              // Map snake_case from DB to camelCase for frontend matching logic
              const mapped = {
                ...doctor,
                initials: doctor.initials || (doctor.name ? doctor.name.split(' ').map(n => n[0]).join('') : 'DR'),
                specialization: doctor.specialization || 'Clinical Psychologist',
                experience: doctor.experience_years ? `${doctor.experience_years} years` : '5+ years',
                languages: typeof doctor.languages_json === 'string' ? JSON.parse(doctor.languages_json) : (doctor.languages || []),
                modes: typeof doctor.modes_json === 'string' ? JSON.parse(doctor.modes_json) : (doctor.modes || []),
                focusAreas: typeof doctor.focus_areas_json === 'string' ? JSON.parse(doctor.focus_areas_json) : (doctor.focus_areas || []),
                approaches: typeof doctor.approaches_json === 'string' ? JSON.parse(doctor.approaches_json) : (doctor.approaches || []),
                qualifications: typeof doctor.qualifications_json === 'string' ? JSON.parse(doctor.qualifications_json) : (doctor.qualifications || []),
                availability: typeof doctor.availability_json === 'string' ? JSON.parse(doctor.availability_json) : (doctor.availability || []),
                price: doctor.price_per_session || doctor.price || 0,
                rating: doctor.rating || 0,
                reviews: doctor.reviews_count || 0,
                palette: paletteFor(index),
                isVerified: !!doctor.is_verified
              };
              return mapped;
            })
          );
          return;
        }
      } catch {}

      setTherapists(
        FALLBACK_THERAPISTS.map((doctor, index) => ({
          ...doctor,
          palette: paletteFor(index),
        }))
      );
      setIsLoading(false);
      return;
    };

    loadDoctors().finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchMyBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const availableLanguages = useMemo(() => {
    const set = new Set();
    therapists.forEach((doctor) => doctor.languages?.forEach((language) => set.add(language)));
    return ['All', ...Array.from(set)];
  }, [therapists]);

  const availableModes = useMemo(() => {
    const set = new Set();
    therapists.forEach((doctor) => doctor.modes?.forEach((mode) => set.add(mode)));
    return ['All', ...Array.from(set)];
  }, [therapists]);

  const filtered = useMemo(() => {
    let list = [...therapists];
    if (recommendedDoctorId) {
      list = list.filter((doctor) => doctor.id === recommendedDoctorId);
    }
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      list = list.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(query) ||
          doctor.specialization.toLowerCase().includes(query) ||
          doctor.focusAreas?.some((area) => area.toLowerCase().includes(query))
      );
    }
    if (langFilter !== 'All') {
      list = list.filter((doctor) => doctor.languages?.includes(langFilter));
    }
    if (modeFilter !== 'All') {
      list = list.filter((doctor) => doctor.modes?.includes(modeFilter));
    }
    return list;
  }, [therapists, recommendedDoctorId, search, langFilter, modeFilter]);

  const sampleProfiles = therapists.filter((doctor) => doctor.profileSource === 'sample').length;
  const averageRating = therapists.length
    ? (therapists.reduce((total, doctor) => total + (doctor.rating || 0), 0) / therapists.length).toFixed(1)
    : '0.0';
  const minimumPrice = therapists.length ? Math.min(...therapists.map((doctor) => doctor.price || 0)) : 0;
  const myActiveBookings = myBookings.filter((booking) => booking.status !== 'completed');

  const openDetails = async (doctor) => {
    setSelectedDoctor(doctor);
    setDetailsFor(null);
    setDetailsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctors/${doctor.id}`, { credentials: 'include' });
      const data = await response.json();
      if (response.ok && data.success && data.doctor) {
        setDetailsFor({ ...doctor, ...data.doctor, palette: doctor.palette });
      } else {
        setDetailsFor(doctor);
      }
    } catch {
      setDetailsFor(doctor);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedDoctor(null);
    setDetailsFor(null);
    setDetailsLoading(false);
  };

  const resetQuiz = () => {
    setShowQuiz(false);
    setQuizStep(0);
    setQuizAnswers({});
    setIsMatching(false);
  };

  const handleQuizAnswer = (key, value) => {
    const nextAnswers = { ...quizAnswers, [key]: value };
    setQuizAnswers(nextAnswers);

    if (quizStep < QUIZ_STEPS.length - 1) {
      setQuizStep((prev) => prev + 1);
      return;
    }

    setIsMatching(true);
    setTimeout(() => {
      let bestMatch = therapists[0];
      if (nextAnswers.issue === 'Career') bestMatch = therapists.find((doctor) => doctor.specialization.includes('Counseling')) || bestMatch;
      if (nextAnswers.issue === 'Anxiety') bestMatch = therapists.find((doctor) => doctor.focusAreas?.includes('Anxiety')) || bestMatch;
      if (nextAnswers.issue === 'Therapy') bestMatch = therapists.find((doctor) => doctor.approaches?.includes('Art therapy')) || bestMatch;
      if (nextAnswers.lang === 'Hindi') bestMatch = therapists.find((doctor) => doctor.languages?.includes('Hindi')) || bestMatch;
      setRecommendedDoctorId(bestMatch?.id || null);
      setIsMatching(false);
      resetQuiz();
      if (bestMatch) showToast(`Sample matching preview recommends ${bestMatch.name}.`);
    }, 1400);
  };

  const toggleSaveDoctor = (doctorId) => {
    setSavedDoctorIds((prev) =>
      prev.includes(doctorId) ? prev.filter((id) => id !== doctorId) : [...prev, doctorId]
    );
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
          doctor_id: bookingFor.id,
          name: form.name,
          age: form.age,
          gender: form.gender,
          phone: form.phone,
          reason: form.reason,
          time: form.time,
          mode: bookingFor.modes?.[0] || 'Video',
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        showToast(data.message || 'Could not complete the booking.', '#ef4444');
        return;
      }

      setBooked(true);
      fetchMyBookings();
      setTimeout(() => {
        setBooked(false);
        setBookingFor(null);
        setForm({ name: user?.username || '', age: '', gender: '', phone: '', reason: '', time: '' });
        showToast(`Session request sent to ${bookingFor.name}.`, '#10b981');
      }, 900);
    } catch {
      showToast('Network error while booking the session.', '#ef4444');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookingAction = async (bookingId, payload, successMessage) => {
    setBookingActionId(bookingId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/therapy/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        showToast(data.message || 'Could not update your booking.', '#ef4444');
        return;
      }
      setMyBookings((prev) => prev.map((booking) => (booking.id === bookingId ? data.booking : booking)));
      showToast(successMessage, '#0f766e');
    } catch {
      showToast('Network error while updating your booking.', '#ef4444');
    } finally {
      setBookingActionId(null);
    }
  };

  return (
    <div className="therapy-hub">
      {!showQuiz && !recommendedDoctorId && (
        <div className="th-discovery">
          <div className="discovery-content">
            <span className="th-hero-kicker">Care discovery</span>
            <h1>Find someone who understands.</h1>
            <p>
              Therapy is better when you don't have to search for it. Tell us a bit about what you're facing, and we'll introduce you to 2–3 clinicians who fit your needs.
            </p>
            <button className="th-assessment-btn" onClick={() => setShowQuiz(true)}>
              Start guided matching
            </button>
          </div>
          
          <div className="th-my-bookings-teaser">
            {myActiveBookings.length > 0 && (
              <div className="teaser-card" onClick={() => setRecommendedDoctorId('bookings')}>
                <span>You have {myActiveBookings.length} active session{myActiveBookings.length > 1 ? 's' : ''}</span>
                <button>Manage</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showQuiz && (
        <div className="th-quiz-container">
          {isMatching ? (
            <div className="th-quiz-matching">
              <div className="th-quiz-spinner">...</div>
              <h3>Finding your matches...</h3>
              <p>We're looking at clinicians who specialize in {quizAnswers.issue}.</p>
            </div>
          ) : (
            <div className="th-quiz-step">
              <div className="quiz-header">
                <span>Discovery • Step {quizStep + 1} of {QUIZ_STEPS.length}</span>
                <button onClick={resetQuiz} className="th-plain-close">Cancel</button>
              </div>
              <h2>{QUIZ_STEPS[quizStep].title}</h2>
              <div className="th-quiz-options">
                {QUIZ_STEPS[quizStep].options.map((option) => (
                  <button
                    key={option.value}
                    className="th-quiz-option"
                    onClick={() => handleQuizAnswer(QUIZ_STEPS[quizStep].key, option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {recommendedDoctorId && recommendedDoctorId !== 'bookings' && (
        <div className="th-results-page">
          <div className="results-header">
            <button className="back-btn" onClick={() => setRecommendedDoctorId(null)}>← Start over</button>
            <h1>Your matches</h1>
            <p>Based on what you shared, these clinicians are a strong fit for you.</p>
          </div>

          <div className="th-match-grid">
            {filtered.slice(0, 3).map((doctor) => (
              <div key={doctor.id} className="th-match-card">
                <div className="match-card-top">
                  <div className="match-avatar">
                   {doctor.photoUrl ? <img src={doctor.photoUrl} alt={doctor.name} /> : doctor.initials}
                  </div>
                  <div className="match-info">
                    <div className="match-name">{doctor.name}</div>
                    <div className="match-trust">
                      {doctor.is_verified && <span className="verified-pill">Verified</span>}
                      <span className="exp-pill">{doctor.experience} expertise</span>
                    </div>
                  </div>
                </div>
                <p className="match-bio">“{doctor.bio}”</p>
                <div className="match-card-footer">
                   <button className="th-btn-details" onClick={() => openDetails(doctor)}>View profile</button>
                   <button className="th-btn-book" onClick={() => setBookingFor(doctor)}>Talk to {doctor.name.split(' ')[1]}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendedDoctorId === 'bookings' && (
        <div className="th-results-page">
           <div className="results-header">
            <button className="back-btn" onClick={() => setRecommendedDoctorId(null)}>← Back</button>
            <h1>My sessions</h1>
          </div>
          <div className="th-grid" style={{ gridTemplateColumns: '1fr' }}>
            {myActiveBookings.map((booking) => (
               <div key={booking.id} className="th-card">
                  <div className="th-card-top">
                    <div className="th-info">
                      <div className="th-card-title-row">
                        <div>
                          <div className="th-name">{booking.doctor_name}</div>
                          <div className="th-spec-pill">{booking.mode} session</div>
                        </div>
                        <span className="th-badge-pill">{booking.status}</span>
                      </div>
                      <div className="th-meta">
                        <span className="th-meta-chip">{booking.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="th-card-footer">
                    <button className="th-btn-book" onClick={() => {
                        const dr = therapists.find(d => d.id === booking.doctor_id);
                        if(dr) openDetails(dr);
                    }}>View profile</button>
                  </div>
               </div>
            ))}
          </div>
        </div>
      )}

      {selectedDoctor && (
        <div className="modal-overlay">
          <div className="th-profile-modal">
            <button className="close-btn" onClick={closeDetails}>← Back</button>
            {detailsLoading ? (
              <div className="th-profile-loading">
                <h3>Loading profile...</h3>
                <p>Pulling the latest trust details for this therapist.</p>
              </div>
            ) : (
              <>
                <div className="th-profile-hero" style={{ background: (detailsFor || selectedDoctor).palette.bg }}>
                  <div className="th-profile-hero-content">
                    <div className="th-profile-avatar">
                      {(detailsFor || selectedDoctor).photoUrl ? (
                        <img src={(detailsFor || selectedDoctor).photoUrl} alt={(detailsFor || selectedDoctor).name} />
                      ) : (
                        (detailsFor || selectedDoctor).initials
                      )}
                    </div>
                    <div className="th-profile-copy">
                      <div className="th-profile-badges">
                        {(detailsFor || selectedDoctor).isVerified && <span className="th-trust-badge"><span className="icon">✓</span> Verified Clinician</span>}
                        {(detailsFor || selectedDoctor).sampleLabel && <span className="th-trust-badge soft">Sample Profile</span>}
                      </div>
                      <h2>{(detailsFor || selectedDoctor).name}</h2>
                      <p className="th-profile-subtitle">{(detailsFor || selectedDoctor).specialization}</p>
                      
                      <div className="th-profile-meta-row">
                        <div className="meta-pill"><strong>{(detailsFor || selectedDoctor).experience}</strong><span>Exp.</span></div>
                        <div className="meta-pill"><strong>Rs {(detailsFor || selectedDoctor).price}</strong><span>Fee</span></div>
                        <div className="meta-pill"><strong>{(detailsFor || selectedDoctor).rating} ★</strong><span>Rating</span></div>
                        <div className="meta-pill"><strong>{(detailsFor || selectedDoctor).reviews}</strong><span>Reviews</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="th-profile-content-wrapper">
                  <div className="th-profile-sidebar">
                    <div className="th-sticky-actions">
                      <button className="dm-book-btn-lg" onClick={() => { setBookingFor(detailsFor || selectedDoctor); closeDetails(); }}>
                        Book a Session
                      </button>
                      <button className="th-secondary-btn-lg" onClick={() => toggleSaveDoctor((detailsFor || selectedDoctor).id)}>
                        {savedDoctorIds.includes((detailsFor || selectedDoctor).id) ? '♥ Already Saved' : '♡ Save to Favorites'}
                      </button>
                      
                      <div className="th-sidebar-info">
                        <h4>Immediate Help</h4>
                        <p>If you're in a crisis, don't wait for a session. Please use our SOS section or dial 112.</p>
                      </div>
                    </div>
                  </div>

                  <div className="th-profile-main">
                    <section className="th-profile-card">
                      <h3>Professional Bio</h3>
                      <p>{(detailsFor || selectedDoctor).bio}</p>
                    </section>

                    <div className="th-profile-split-cards">
                      <section className="th-profile-card mini">
                        <h3>Licensure</h3>
                        <p className="th-license-txt">{(detailsFor || selectedDoctor).licenseInfo}</p>
                        <div className="th-list-wrap">
                          {(detailsFor || selectedDoctor).qualifications?.map((item) => <span key={item} className="th-qual-badge">{item}</span>)}
                        </div>
                      </section>

                      <section className="th-profile-card mini">
                        <h3>Languages</h3>
                        <div className="th-list-wrap">
                          {(detailsFor || selectedDoctor).languages?.map((item) => <span key={item} className="th-lang-badge">{item}</span>)}
                        </div>
                      </section>
                    </div>

                    <section className="th-profile-card">
                      <h3>Expertise & Approach</h3>
                      <div className="th-expertise-grid">
                        <div className="exp-col">
                          <label>Clinical Focus</label>
                          <div className="th-list-wrap">
                            {(detailsFor || selectedDoctor).focusAreas?.map((item) => <span key={item} className="th-feat-badge">{item}</span>)}
                          </div>
                        </div>
                        <div className="exp-col">
                          <label>Methods Used</label>
                          <div className="th-list-wrap">
                            {(detailsFor || selectedDoctor).approaches?.map((item) => <span key={item} className="th-meth-badge">{item}</span>)}
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="th-profile-card">
                      <h3>Practice Details</h3>
                      <div className="practice-details">
                        <div className="det-row">
                          <span className="det-icon">👥</span>
                          <div>
                            <label>Best For</label>
                            <p>{(detailsFor || selectedDoctor).bestFor}</p>
                          </div>
                        </div>
                        <div className="det-row">
                          <span className="det-icon">✨</span>
                          <div>
                            <label>The First Session</label>
                            <p>{(detailsFor || selectedDoctor).firstSession}</p>
                          </div>
                        </div>
                        <div className="det-row">
                          <span className="det-icon">📅</span>
                          <div>
                            <label>Upcoming Availability</label>
                            <div className="th-list-wrap">
                              {(detailsFor || selectedDoctor).availability?.map((slot) => <span key={slot} className="th-avail-pill">{slot}</span>)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="th-profile-card">
                      <h3>Clinical Reviews</h3>
                      <div className="th-review-preview">
                        <div className="quote-icon">"</div>
                        <p>{(detailsFor || selectedDoctor).reviewSummary}</p>
                      </div>
                    </section>

                    <section className="th-profile-card warning">
                      <h3>Policy & Cancellation</h3>
                      <p>{(detailsFor || selectedDoctor).cancellationPolicy}</p>
                    </section>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {bookingFor && (
        <div className="modal-overlay" onClick={() => !booked && !isSubmitting && setBookingFor(null)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            {!booked && <button className="close-btn" onClick={() => setBookingFor(null)}>x</button>}
            {booked ? (
              <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>Done</div>
                <h2 style={{ color: '#1e1b4b', margin: '0 0 8px', fontSize: '22px', fontWeight: '800' }}>Booking requested</h2>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>The sample doctor dashboard can now review this request.</p>
              </div>
            ) : (
              <>
                <div className="booking-form-header" style={{ background: bookingFor.palette.bg }}>
                  <h3>Request a session with</h3>
                  <h2>{bookingFor.name}</h2>
                  <p>{bookingFor.sampleLabel || 'Share a few details so the therapist knows what support you need.'}</p>
                </div>
                <div className="booking-form">
                  {(() => {
                    const unavailableSlots = new Set(
                      myBookings
                        .filter((item) => item.doctor_id === bookingFor.id && !['cancelled', 'declined'].includes(item.status))
                        .map((item) => item.time)
                    );
                    return (
                      <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input type="text" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Your name" />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input type="tel" value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} placeholder="+91 XXXXX XXXXX" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Age</label>
                      <input type="number" value={form.age} onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))} placeholder="Your age" />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select value={form.gender} onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}>
                        <option value="">Select...</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Non-binary</option>
                        <option>Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>What would you like to work on?</label>
                    <textarea rows="3" value={form.reason} onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))} placeholder="e.g. anxiety, stress at work, relationship issues..." />
                  </div>
                  <div className="form-group">
                    <label>Pick a sample time slot</label>
                    <div className="time-slots">
                      {bookingFor.availability?.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          className={`time-slot-btn ${form.time === slot ? 'selected' : ''}`}
                          disabled={unavailableSlots.has(slot)}
                          onClick={() => setForm((prev) => ({ ...prev, time: slot }))}
                        >
                          {slot}{unavailableSlots.has(slot) ? ' (taken)' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="booking-summary">
                    <span>
                      Session fee: <strong style={{ color: '#4f46e5' }}>Rs {bookingFor.price}</strong>
                    </span>
                    <button className="confirm-booking-btn" onClick={handleConfirm} disabled={isSubmitting}>
                      {isSubmitting ? 'Booking...' : 'Confirm request'}
                    </button>
                  </div>
                      </>
                    );
                  })()}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
