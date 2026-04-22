import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../api';
import './AdminDoctorsPanel.css';

const EMPTY_FORM = {
  name: '',
  initials: '',
  email: '',
  specialization: '',
  experienceYears: 0,
  languages: 'English, Hindi',
  modes: 'Video, Chat',
  pricePerSession: 999,
  rating: 4.8,
  reviewsCount: 0,
  badge: 'Managed profile',
  bio: '',
  licenseInfo: '',
  qualifications: '',
  approaches: '',
  focusAreas: '',
  bestFor: '',
  firstSession: '',
  cancellationPolicy: '',
  reviewSummary: '',
  availability: 'Mon 2 PM, Wed 10 AM',
  photoUrl: '',
  isVerified: true,
  profileSource: 'managed',
  profileStatus: 'active',
  temporaryPassword: '',
};

function listFromString(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function formFromDoctor(doctor) {
  return {
    name: doctor.name || '',
    initials: doctor.initials || '',
    email: doctor.email || '',
    specialization: doctor.specialization || '',
    experienceYears: doctor.experienceYears || 0,
    languages: (doctor.languages || []).join(', '),
    modes: (doctor.modes || []).join(', '),
    pricePerSession: doctor.pricePerSession || doctor.price || 0,
    rating: doctor.rating || 0,
    reviewsCount: doctor.reviewsCount || doctor.reviews || 0,
    badge: doctor.badge || '',
    bio: doctor.bio || '',
    licenseInfo: doctor.licenseInfo || '',
    qualifications: (doctor.qualifications || []).join(', '),
    approaches: (doctor.approaches || []).join(', '),
    focusAreas: (doctor.focusAreas || []).join(', '),
    bestFor: doctor.bestFor || '',
    firstSession: doctor.firstSession || '',
    cancellationPolicy: doctor.cancellationPolicy || '',
    reviewSummary: doctor.reviewSummary || '',
    availability: (doctor.availability || []).join(', '),
    photoUrl: doctor.photoUrl || '',
    isVerified: Boolean(doctor.isVerified),
    profileSource: doctor.profileSource || 'managed',
    profileStatus: doctor.profileStatus || 'active',
    temporaryPassword: '',
  };
}

export default function AdminDoctorsPanel({ onClose }) {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor.id === selectedDoctorId) || null,
    [doctors, selectedDoctorId]
  );

  const loadDoctors = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/doctors`, { credentials: 'include' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Could not load doctors');
      }
      setDoctors(data.doctors || []);
      if (data.doctors?.length && !selectedDoctorId) {
        setSelectedDoctorId(data.doctors[0].id);
        setForm(formFromDoctor(data.doctors[0]));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDoctorId]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const selectDoctor = (doctor) => {
    setSelectedDoctorId(doctor.id);
    setForm(formFromDoctor(doctor));
    setMessage('');
    setError('');
  };

  const startNewDoctor = () => {
    setSelectedDoctorId(null);
    setForm({ ...EMPTY_FORM, temporaryPassword: 'DoctorDemo123!' });
    setMessage('');
    setError('');
  };

  const buildPayload = () => ({
    name: form.name,
    initials: form.initials,
    email: form.email,
    specialization: form.specialization,
    experienceYears: Number(form.experienceYears),
    languages: listFromString(form.languages),
    modes: listFromString(form.modes),
    pricePerSession: Number(form.pricePerSession),
    rating: Number(form.rating),
    reviewsCount: Number(form.reviewsCount),
    badge: form.badge,
    bio: form.bio,
    licenseInfo: form.licenseInfo,
    qualifications: listFromString(form.qualifications),
    approaches: listFromString(form.approaches),
    focusAreas: listFromString(form.focusAreas),
    bestFor: form.bestFor,
    firstSession: form.firstSession,
    cancellationPolicy: form.cancellationPolicy,
    reviewSummary: form.reviewSummary,
    availability: listFromString(form.availability),
    photoUrl: form.photoUrl,
    isVerified: form.isVerified,
    profileSource: form.profileSource,
    profileStatus: form.profileStatus,
  });

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    setError('');
    try {
      const endpoint = selectedDoctorId ? `/api/admin/doctors/${selectedDoctorId}` : '/api/admin/doctors';
      const method = selectedDoctorId ? 'PATCH' : 'POST';
      const payload = buildPayload();
      if (!selectedDoctorId) payload.temporaryPassword = form.temporaryPassword;

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Save failed');
      }
      await loadDoctors();
      if (data.doctor?.id) {
        setSelectedDoctorId(data.doctor.id);
        setForm(formFromDoctor(data.doctor));
      }
      setMessage(selectedDoctorId ? 'Doctor updated.' : 'Doctor created.');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedDoctorId || !form.temporaryPassword) {
      setError('Enter a temporary password first.');
      return;
    }
    setIsSaving(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/doctors/${selectedDoctorId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ temporaryPassword: form.temporaryPassword }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Password reset failed');
      }
      setMessage('Doctor password reset.');
      setForm((prev) => ({ ...prev, temporaryPassword: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-doctors-panel">
      <div className="admin-doctors-header">
        <div>
          <span className="admin-doctors-kicker">Admin workspace</span>
          <h2>Provider Management</h2>
          <p>Create, edit, archive, and reset provider accounts without changing source code.</p>
        </div>
        <div className="admin-doctors-header-actions">
          <button className="admin-secondary-btn" onClick={startNewDoctor}>New doctor</button>
          <button className="admin-secondary-btn" onClick={onClose}>Close</button>
        </div>
      </div>

      {message && <div className="admin-status success">{message}</div>}
      {error && <div className="admin-status error">{error}</div>}

      <div className="admin-doctors-layout">
        <aside className="admin-doctors-sidebar">
          <div className="admin-list-heading">Managed doctors</div>
          {isLoading ? (
            <div className="admin-loading">Loading providers...</div>
          ) : (
            doctors.map((doctor) => (
              <button
                key={doctor.id}
                className={`admin-doctor-row ${selectedDoctorId === doctor.id ? 'selected' : ''}`}
                onClick={() => selectDoctor(doctor)}
              >
                <strong>{doctor.name}</strong>
                <span>{doctor.specialization}</span>
                <small>{doctor.profileStatus}</small>
              </button>
            ))
          )}
        </aside>

        <section className="admin-doctors-form">
          <div className="admin-grid">
            <label>
              Name
              <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
            </label>
            <label>
              Initials
              <input value={form.initials} onChange={(event) => setForm((prev) => ({ ...prev, initials: event.target.value }))} />
            </label>
            <label>
              Email
              <input value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
            </label>
            <label>
              Specialization
              <input value={form.specialization} onChange={(event) => setForm((prev) => ({ ...prev, specialization: event.target.value }))} />
            </label>
            <label>
              Experience years
              <input type="number" value={form.experienceYears} onChange={(event) => setForm((prev) => ({ ...prev, experienceYears: event.target.value }))} />
            </label>
            <label>
              Price per session
              <input type="number" value={form.pricePerSession} onChange={(event) => setForm((prev) => ({ ...prev, pricePerSession: event.target.value }))} />
            </label>
            <label>
              Rating
              <input type="number" step="0.1" value={form.rating} onChange={(event) => setForm((prev) => ({ ...prev, rating: event.target.value }))} />
            </label>
            <label>
              Reviews
              <input type="number" value={form.reviewsCount} onChange={(event) => setForm((prev) => ({ ...prev, reviewsCount: event.target.value }))} />
            </label>
            <label>
              Status
              <select value={form.profileStatus} onChange={(event) => setForm((prev) => ({ ...prev, profileStatus: event.target.value }))}>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label>
              Profile source
              <select value={form.profileSource} onChange={(event) => setForm((prev) => ({ ...prev, profileSource: event.target.value }))}>
                <option value="managed">Managed</option>
                <option value="sample">Sample</option>
              </select>
            </label>
          </div>

          <div className="admin-grid">
            <label>
              Languages
              <input value={form.languages} onChange={(event) => setForm((prev) => ({ ...prev, languages: event.target.value }))} placeholder="English, Hindi" />
            </label>
            <label>
              Session modes
              <input value={form.modes} onChange={(event) => setForm((prev) => ({ ...prev, modes: event.target.value }))} placeholder="Video, Chat" />
            </label>
            <label>
              Badge
              <input value={form.badge} onChange={(event) => setForm((prev) => ({ ...prev, badge: event.target.value }))} />
            </label>
            <label>
              Availability
              <input value={form.availability} onChange={(event) => setForm((prev) => ({ ...prev, availability: event.target.value }))} placeholder="Mon 2 PM, Wed 10 AM" />
            </label>
          </div>

          <label>
            Bio
            <textarea rows="3" value={form.bio} onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))} />
          </label>
          <label>
            License info
            <textarea rows="2" value={form.licenseInfo} onChange={(event) => setForm((prev) => ({ ...prev, licenseInfo: event.target.value }))} />
          </label>
          <label>
            Qualifications
            <input value={form.qualifications} onChange={(event) => setForm((prev) => ({ ...prev, qualifications: event.target.value }))} placeholder="MPhil, RCI Registration" />
          </label>
          <label>
            Approaches
            <input value={form.approaches} onChange={(event) => setForm((prev) => ({ ...prev, approaches: event.target.value }))} placeholder="CBT, ACT" />
          </label>
          <label>
            Focus areas
            <input value={form.focusAreas} onChange={(event) => setForm((prev) => ({ ...prev, focusAreas: event.target.value }))} placeholder="Anxiety, Burnout" />
          </label>
          <label>
            Best fit
            <textarea rows="2" value={form.bestFor} onChange={(event) => setForm((prev) => ({ ...prev, bestFor: event.target.value }))} />
          </label>
          <label>
            First session
            <textarea rows="2" value={form.firstSession} onChange={(event) => setForm((prev) => ({ ...prev, firstSession: event.target.value }))} />
          </label>
          <label>
            Cancellation policy
            <textarea rows="2" value={form.cancellationPolicy} onChange={(event) => setForm((prev) => ({ ...prev, cancellationPolicy: event.target.value }))} />
          </label>
          <label>
            Review summary
            <textarea rows="2" value={form.reviewSummary} onChange={(event) => setForm((prev) => ({ ...prev, reviewSummary: event.target.value }))} />
          </label>

          <div className="admin-actions">
            <button className="admin-primary-btn" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : selectedDoctor ? 'Save changes' : 'Create doctor'}
            </button>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={form.isVerified}
                onChange={(event) => setForm((prev) => ({ ...prev, isVerified: event.target.checked }))}
              />
              Mark as verified
            </label>
          </div>

          <div className="admin-password-box">
            <h3>Credential reset</h3>
            <p>Use this when a provider needs a new temporary password in the demo environment.</p>
            <div className="admin-password-row">
              <input
                value={form.temporaryPassword}
                onChange={(event) => setForm((prev) => ({ ...prev, temporaryPassword: event.target.value }))}
                placeholder="Temporary password"
              />
              <button className="admin-secondary-btn" onClick={handleResetPassword} disabled={!selectedDoctorId || isSaving}>
                Reset password
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
