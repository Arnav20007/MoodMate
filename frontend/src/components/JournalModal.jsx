import React, { useState } from 'react';
import './JournalModal.css';

function JournalModal({ onClose }) {
  const [entries, setEntries] = useState([
    {
      id: 1,
      date: 'Today',
      text: 'Feeling much better after taking a walk. The air was crisp and my breathing finally slowed down.',
    },
    {
      id: 2,
      date: 'Yesterday',
      text: 'Work felt heavy, but the 4-7-8 breathing exercise helped me reset before sleeping.',
    },
  ]);
  const [newEntry, setNewEntry] = useState('');

  const handleSave = () => {
    if (!newEntry.trim()) return;
    setEntries([{ id: Date.now(), date: 'Just now', text: newEntry }, ...entries]);
    setNewEntry('');
  };

  return (
    <div className="modal-overlay journal-overlay" onClick={onClose}>
      <div className="modal-content journal-box" onClick={(event) => event.stopPropagation()}>
        <div className="journal-shell">
          <div className="journal-header">
            <div>
              <span className="journal-kicker">Private writing space</span>
              <h2>Brain Dump Journal</h2>
              <p>Unload the thoughts that are taking up too much room. This space is meant to feel private, simple, and low-pressure.</p>
            </div>
            <button onClick={onClose} className="close-btn journal-close-btn">
              Close
            </button>
          </div>

          <div className="journal-trust-row">
            <span className="journal-trust-pill">End-to-end encrypted</span>
            <span className="journal-trust-pill">Write without formatting pressure</span>
          </div>

          <div className="journal-input-area">
            <textarea
              placeholder="What feels loud in your head right now? You can write messily here."
              value={newEntry}
              onChange={(event) => setNewEntry(event.target.value)}
            />
            <div className="journal-actions">
              <span className="journal-wording-note">{newEntry.length} characters</span>
              <button className="save-journal-btn" onClick={handleSave}>
                Save entry
              </button>
            </div>
          </div>

          <div className="journal-history">
            <div className="journal-history-header">
              <h3>Recent Entries</h3>
              <span>For reflection, not perfection</span>
            </div>
            {entries.map((entry) => (
              <div key={entry.id} className="journal-card">
                <span className="j-date">{entry.date}</span>
                <p>{entry.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JournalModal;
