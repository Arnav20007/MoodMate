import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SESSIONS = ['Chat Only', 'Voice Call', 'Video Call'];
const TIMESLOTS = ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '04:30 PM', '06:00 PM'];

function BookingModal({ therapist, onClose, user }) {
  const [step, setStep] = useState(1); // 1=details, 2=confirm, 3=success
  const [mode, setMode] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');

  if (!therapist) return null;

  const handleBook = () => {
    if (!mode || !selectedSlot) return;
    setStep(3);
  };

  return (
    <div
      className="booking-overlay"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)', padding: '16px'
      }}
      onClick={onClose}
    >
      <motion.div
        style={{
          background: 'white', borderRadius: '24px', padding: '32px',
          width: '100%', maxWidth: '480px', boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
          maxHeight: '90vh', overflowY: 'auto'
        }}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
      >
        {step === 3 ? (
          /* ── SUCCESS ── */
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '60px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '22px' }}>Booking Confirmed!</h2>
            <p style={{ color: '#64748b', marginBottom: '8px' }}>
              Your session with <strong>{therapist.name}</strong> is scheduled.
            </p>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>
              📅 {selectedSlot} · {mode}
            </p>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '28px' }}>
              A confirmation will be sent to your registered email.
            </p>
            <button
              onClick={onClose}
              style={{
                padding: '12px 32px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', fontSize: '15px', fontWeight: '700', cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(99,102,241,0.4)'
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* ── HEADER ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '36px', marginBottom: '6px' }}>{therapist.avatar}</div>
                <h2 style={{ margin: '0 0 4px', color: '#0f172a', fontSize: '20px' }}>{therapist.name}</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                  {therapist.specialization} · ⭐ {therapist.rating} · {therapist.experience}
                </p>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            {/* ── SESSION TYPE ── */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#0f172a', marginBottom: '10px', fontSize: '14px' }}>
                Session Format
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {SESSIONS.filter(s => {
                  const map = { 'Chat Only': 'chat', 'Voice Call': 'call', 'Video Call': 'video' };
                  return (therapist.modes || []).includes(map[s]);
                }).map(s => (
                  <button
                    key={s}
                    onClick={() => setMode(s)}
                    style={{
                      padding: '10px 16px', borderRadius: '10px', border: '2px solid',
                      borderColor: mode === s ? '#6366f1' : '#e2e8f0',
                      background: mode === s ? '#eef2ff' : 'white',
                      color: mode === s ? '#4338ca' : '#64748b',
                      fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {s === 'Chat Only' ? '💬' : s === 'Voice Call' ? '📞' : '🎥'} {s}
                  </button>
                ))}
              </div>
            </div>

            {/* ── TIME SLOTS ── */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#0f172a', marginBottom: '10px', fontSize: '14px' }}>
                Available Slots (Today)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {TIMESLOTS.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    style={{
                      padding: '10px', borderRadius: '10px', border: '2px solid',
                      borderColor: selectedSlot === slot ? '#6366f1' : '#e2e8f0',
                      background: selectedSlot === slot ? '#eef2ff' : 'white',
                      color: selectedSlot === slot ? '#4338ca' : '#475569',
                      fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* ── NOTES ── */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#0f172a', marginBottom: '8px', fontSize: '14px' }}>
                Notes for the therapist <span style={{ color: '#94a3b8', fontWeight: '400' }}>(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. I've been feeling anxious lately and would like to talk about coping strategies..."
                rows={3}
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '12px 14px',
                  borderRadius: '12px', border: '1.5px solid #e2e8f0',
                  fontSize: '13px', color: '#334155', outline: 'none',
                  resize: 'vertical', fontFamily: 'Inter, sans-serif', lineHeight: '1.5'
                }}
              />
            </div>

            {/* ── PRICE + BOOK ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>
                  ₹{therapist.price}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Per session</div>
              </div>
              <button
                onClick={handleBook}
                disabled={!mode || !selectedSlot}
                style={{
                  padding: '14px 28px', borderRadius: '14px', border: 'none',
                  background: (!mode || !selectedSlot)
                    ? '#e2e8f0'
                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: (!mode || !selectedSlot) ? '#94a3b8' : 'white',
                  fontSize: '15px', fontWeight: '700', cursor: (!mode || !selectedSlot) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: (!mode || !selectedSlot) ? 'none' : '0 8px 20px rgba(99,102,241,0.35)'
                }}
              >
                Confirm Booking
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default BookingModal;
