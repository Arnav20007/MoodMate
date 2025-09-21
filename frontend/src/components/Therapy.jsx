import React, { useState, useEffect, useRef } from 'react';
import './Therapy.css'; // The dedicated CSS file for this component

// ✅ The full list of 6 doctors you provided
const allTherapists = [
    {id: 1, name: "Dr. Arnav Singh", specialization: "Clinical Psychology", price: 1999, rating: 5.0, experience: "8 years", avatar: "👨‍⚕️", languages: ["Hindi", "English"], modes: ["Video", "Chat"], bio: "Specialized in anxiety and depression treatment using evidence-based CBT techniques. My goal is to empower you with tools to manage your thoughts and emotions effectively."},
    {id: 2, name: "Aaryan Kumar", specialization: "Counseling Psychology", price: 599, rating: 4.8, experience: "5 years", avatar: "👨‍⚕️", languages: ["Hindi", "English"], modes: ["Voice", "Chat"], bio: "Focuses on youth mental health, career stress, and building healthy relationships. Creates a safe, non-judgmental space for clients."},
    {id: 3, name: "Dr. Ankur Verma", specialization: "Psychiatry", price: 999, rating: 4.9, experience: "4 years", avatar: "👨‍⚕️", languages: ["English"], modes: ["Video"], bio: "MD in Psychiatry with expertise in medication management for complex cases and treatment-resistant depression."},
    {id: 4, name: "Aanchal Patel", specialization: "Art Therapy", price: 499, rating: 4.7, experience: "4 years", avatar: "🎨", languages: ["Hindi"], modes: ["Video", "Chat"], bio: "Uses creative processes to help clients explore emotions, reduce anxiety, and improve self-esteem. No artistic skill required!"},
    {id: 5, name: "Aakash Patel", specialization: "Cognitive Behavioral Therapy", price: 899, rating: 4.9, experience: "10 years", avatar: "👨‍🏫", languages: ["Hindi", "English", "Gujarati"], modes: ["Video", "Chat"], bio: "CBT expert with a focus on helping clients identify and change the negative thought patterns that contribute to emotional distress."},
    {id: 6, name: "Nitin Kumar", specialization: "Mindfulness & Meditation", price: 649, rating: 4.8, experience: "6 years", avatar: "🧘‍♂️", languages: ["English", "Hindi"], modes: ["Video", "Voice"], bio: "Teaches mindfulness techniques to help clients manage stress, anxiety, and improve their overall sense of well-being."}
];

const doctorAvailability = {
    1: ["Mon 2 PM - 3 PM", "Wed 10 AM - 11 AM", "Fri 4 PM - 5 PM"],
    2: ["Tue 9 AM - 10 AM", "Thu 3 PM - 4 PM", "Sat 11 AM - 12 PM"],
    3: ["Mon 5 PM - 6 PM", "Wed 3 PM - 4 PM", "Fri 10 AM - 11 AM"],
    4: ["Wed 1 PM - 2 PM", "Fri 11 AM - 12 PM", "Sun 2 PM - 3 PM"],
    5: ["Mon 11 AM - 12 PM", "Tue 4 PM - 5 PM", "Thu 6 PM - 7 PM"],
    6: ["Tue 8 AM - 9 AM", "Sat 10 AM - 11 AM", "Sun 5 PM - 6 PM"],
};

function Therapy({ user, onUpdateUser }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [languageFilter, setLanguageFilter] = useState('All');
    const [modeFilter, setModeFilter] = useState('All');
    const [filteredTherapists, setFilteredTherapists] = useState(allTherapists);
    
    // States to manage the modals
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedTherapist, setSelectedTherapist] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(null);
    const [formState, setFormState] = useState({
        name: user.username || '', age: '', gender: '', phone: '', reason: '', time: ''
    });
    
    const modalRef = useRef(null);

    // Filter logic for therapists
    useEffect(() => {
        let therapists = allTherapists;
        if (searchTerm) {
            therapists = therapists.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.specialization.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (languageFilter !== 'All') {
            therapists = therapists.filter(t => t.languages.includes(languageFilter));
        }
        if (modeFilter !== 'All') {
            therapists = therapists.filter(t => t.modes.includes(modeFilter));
        }
        setFilteredTherapists(therapists);
    }, [searchTerm, languageFilter, modeFilter]);

    // Handlers for opening modals
    const handleBookNow = (therapist) => {
        setSelectedTherapist(therapist);
        setShowBookingModal(true);
    };

    const handleViewDetails = (therapist) => {
        setSelectedTherapist(therapist);
        setShowDetailsModal(therapist);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleConfirmBooking = () => {
        if (!formState.name || !formState.age || !formState.gender || !formState.phone || !formState.reason || !formState.time) {
            alert("Please fill out all fields before confirming.");
            return;
        }
        alert(`✅ Booking confirmed with ${selectedTherapist.name} for ${formState.time}!`);
        setShowBookingModal(false);
        setFormState({ name: user.username || '', age: '', gender: '', phone: '', reason: '', time: '' });
    };

    return (
        <div className="therapy-hub">
            <div className="therapy-header">
                <h2>Find Your Therapist</h2>
                <p>Connect with licensed professionals to support your wellness journey.</p>
            </div>

            <div className="filter-bar">
                <input type="text" placeholder="Search by name or specialty..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)}>
                    <option value="All">All Languages</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Gujarati">Gujarati</option>
                </select>
                <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)}>
                    <option value="All">All Session Modes</option>
                    <option value="Video">Video</option>
                    <option value="Voice">Voice</option>
                    <option value="Chat">Chat</option>
                </select>
            </div>

            <div className="therapists-grid">
                {filteredTherapists.map(therapist => (
                    <div key={therapist.id} className="therapist-card">
                        <div className="therapist-card-header">
                            <div className="therapist-avatar">{therapist.avatar}</div>
                            <div className="therapist-header-info">
                                <h4>{therapist.name}</h4>
                                <p>{therapist.specialization}</p>
                            </div>
                        </div>
                        <div className="therapist-card-body">
                            <div className="therapist-stats">
                                <span>⭐ {therapist.rating.toFixed(1)}</span>
                                <span>{therapist.experience}</span>
                                <span>₹{therapist.price}/session</span>
                            </div>
                            <div className="therapist-tags">
                                {therapist.languages.map(lang => <span key={lang}>{lang}</span>)}
                            </div>
                            <p className="therapist-bio">{therapist.description}</p>
                        </div>
                        <div className="therapist-card-footer">
                            <button className="info-btn" onClick={() => handleViewDetails(therapist)}>View Details</button>
                            <button className="book-btn" onClick={() => handleBookNow(therapist)}>Book Now</button>
                        </div>
                    </div>
                ))}
            </div>

            {showDetailsModal && (
                <div className="modal-overlay">
                    <div className="modal-content" ref={modalRef}>
                         <button className="close-btn" onClick={() => setShowDetailsModal(null)}>×</button>
                         <div className="details-modal-header">
                            <div className="therapist-avatar">{showDetailsModal.avatar}</div>
                            <h2>{showDetailsModal.name}</h2>
                            <p>{showDetailsModal.specialization}</p>
                         </div>
                         <div className="details-modal-body">
                            <p><strong>Bio:</strong> {showDetailsModal.bio}</p>
                            <p><strong>Languages:</strong> {showDetailsModal.languages.join(', ')}</p>
                            <p><strong>Modes:</strong> {showDetailsModal.modes.join(', ')}</p>
                         </div>
                    </div>
                </div>
            )}

            {showBookingModal && selectedTherapist && (
                <div className="modal-overlay">
                    <div className="modal-content" ref={modalRef}>
                        <button className="close-btn" onClick={() => setShowBookingModal(false)}>×</button>
                        <div className="booking-form-header">
                            <h3>Book a Session with</h3>
                            <h2>{selectedTherapist.name}</h2>
                        </div>
                        <div className="booking-form">
                            <div className="form-row">
                                <div className="form-group"><label>Full Name</label><input type="text" name="name" value={formState.name} onChange={handleFormChange} placeholder="Enter your full name" /></div>
                                <div className="form-group"><label>Phone Number</label><input type="tel" name="phone" value={formState.phone} onChange={handleFormChange} placeholder="Enter your phone number" /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Age</label><input type="number" name="age" value={formState.age} onChange={handleFormChange} placeholder="Your age" /></div>
                                <div className="form-group"><label>Gender</label><select name="gender" value={formState.gender} onChange={handleFormChange}><option value="">Select...</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option><option value="Prefer not to say">Prefer not to say</option></select></div>
                            </div>
                            <div className="form-group">
                                <label>What would you like to discuss?</label>
                                <textarea name="reason" value={formState.reason} onChange={handleFormChange} rows="3" placeholder="e.g., Managing stress, relationship advice..."></textarea>
                            </div>
                            <div className="form-group">
                                <label>Available Times</label>
                                <div className="time-slots">
                                    {doctorAvailability[selectedTherapist.id].map(slot => (
                                        <button key={slot} className={`time-slot-btn ${formState.time === slot ? 'selected' : ''}`} onClick={() => setFormState(prev => ({ ...prev, time: slot }))}>{slot}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="booking-summary">
                                <span>Session Cost: <strong>🪙 {selectedTherapist.price} Coins</strong></span>
                                <button className="confirm-booking-btn" onClick={handleConfirmBooking}>Confirm Booking</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Therapy;