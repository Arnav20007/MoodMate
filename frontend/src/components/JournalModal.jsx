import React, { useState } from 'react';

// Sample data until backend is fully integrated
const sampleJournalEntries = [
    {id: 1, text: "Feeling pretty good today! Finally finished my big project.", date: "2025-09-18", mood: "happy"},
    {id: 2, text: "A bit stressed about the upcoming exams. Need to plan my study schedule.", date: "2025-09-17", mood: "anxious"},
];

function Journal({ user }) {
  const [journalEntries, setJournalEntries] = useState(sampleJournalEntries);

  const analyzeMood = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("happy") || lowerText.includes("great") || lowerText.includes("excited")) return "happy";
    if (lowerText.includes("sad") || lowerText.includes("depressed") || lowerText.includes("down")) return "sad";
    if (lowerText.includes("anxious") || lowerText.includes("worried") || lowerText.includes("stressed")) return "anxious";
    return "neutral";
  };

  const addJournalEntry = () => {
    const entryText = prompt("What's on your mind today?");
    if (entryText && entryText.trim() !== "") {
      const newEntry = {
        id: Date.now(),
        text: entryText,
        date: new Date().toISOString().split('T')[0],
        mood: analyzeMood(entryText),
      };
      setJournalEntries(prevEntries => [newEntry, ...prevEntries]);
      // Here you would also make an API call to save the entry to the backend
    }
  };

  return (
    <div className="tab-content journal-tab">
      <div className="journal-header">
        <h2>Your Journal</h2>
        <div className="journal-actions">
          <button onClick={addJournalEntry} className="add-entry-btn">
            + New Entry
          </button>
          <button className="analyze-btn" disabled>📊 Analyze (Premium)</button>
        </div>
      </div>

      <div className="journal-entries">
        {journalEntries.length === 0 ? (
          <div className="empty-state">
            <p>Your journal is empty. Write your first entry to get started!</p>
            <button onClick={addJournalEntry}>Create First Entry</button>
          </div>
        ) : (
          journalEntries.map((entry) => (
            <div key={entry.id} className="journal-entry">
              <div className="entry-header">
                <div className="entry-date">{entry.date}</div>
                <div className={`entry-mood mood-${entry.mood}`}>{entry.mood}</div>
              </div>
              <p className="entry-text">{entry.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Journal;
