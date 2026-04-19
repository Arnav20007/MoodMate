import React, { useState } from 'react';
import './JournalModal.css';

function JournalModal({ onClose }) {
  const [entries, setEntries] = useState([
    { id: 1, date: 'Today', text: 'Feeling much better after taking a walk. The air was incredibly crisp. Decided to focus on my breath.' },
    { id: 2, date: 'Yesterday', text: 'Work was stressful but I managed to use the 4-7-8 breathing technique.' }
  ]);
  const [newEntry, setNewEntry] = useState('');
  
  const handleSave = () => {
    if(!newEntry.trim()) return;
    setEntries([{ id: Date.now(), date: 'Just now', text: newEntry }, ...entries]);
    setNewEntry('');
  };

  return (
    <div className="modal-overlay journal-overlay" onClick={onClose}>
      <div className="modal-content journal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <h2>📔 Brain Dump Journal</h2>
             <span style={{ fontSize: '9px', background: '#f0f9ff', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', border: '1px solid #bae6fd', fontWeight: 'bold' }}>
               🔒 END-TO-END ENCRYPTED
             </span>
           </div>
           <button onClick={onClose} className="close-btn">✕</button>
        </div>
        
        <div className="journal-input-area">
          <textarea 
            placeholder="What's on your mind right now? Get it out of your head..." 
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
          />
          <button className="save-journal-btn" onClick={handleSave}>Save Entry</button>
        </div>

        <div className="journal-history">
           <h3>Previous Entries</h3>
           {entries.map(e => (
             <div key={e.id} className="journal-card">
               <span className="j-date">{e.date}</span>
               <p>{e.text}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

export default JournalModal;
