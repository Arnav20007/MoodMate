import React, { useState, useEffect } from 'react';
import './MoodReport.css'; // The new dedicated CSS file for this component

// Sample data to simulate what would come from a backend
const sampleReportData = {
    week: {
        streak: 5,
        journalEntries: 4,
        meditationMinutes: 35,
        moodDistribution: { happy: 40, calm: 30, neutral: 20, anxious: 10, sad: 0 },
        dailyActivity: [3, 5, 2, 6, 4, 8, 5], // Journals/moods logged per day
        insights: [
            "You seem most calm on weekends. Great job finding time to relax!",
            "Your journaling is most consistent in the evening. Keep it up!"
        ]
    },
    month: {
        streak: 22,
        journalEntries: 18,
        meditationMinutes: 150,
        moodDistribution: { happy: 35, calm: 25, neutral: 15, anxious: 20, sad: 5 },
        dailyActivity: [4, 6, 3, 7, 5, 9, 6], // Average for the month
        insights: [
            "Anxiety tends to be higher midweek. Consider a short breathing exercise on Wednesdays.",
            "You've built a strong meditation habit this month!"
        ]
    }
};

function MoodReport({ user }) {
    const [timeRange, setTimeRange] = useState('week');
    const [reportData, setReportData] = useState(sampleReportData.week);

    useEffect(() => {
        // This simulates fetching new data when the time range changes
        setReportData(sampleReportData[timeRange]);
    }, [timeRange]);

    const moodColors = {
        happy: '#4CAF50', calm: '#FFC107', neutral: '#FF9800', anxious: '#9C27B0', sad: '#F44336'
    };

    const generateConicGradient = (data) => {
        let gradient = '';
        let currentPercentage = 0;
        for (const mood in data) {
            if (data[mood] > 0) {
                const percentage = data[mood];
                gradient += `${moodColors[mood]} ${currentPercentage}% ${currentPercentage + percentage}%, `;
                currentPercentage += percentage;
            }
        }
        return gradient.slice(0, -2); // Remove trailing comma and space
    };

    const maxActivity = Math.max(...reportData.dailyActivity, 0);

    return (
        <div className="report-hub tab-content">
            <div className="report-header">
                <h2>Your Wellness Report</h2>
                <div className="time-filter">
                    <button className={timeRange === 'week' ? 'active' : ''} onClick={() => setTimeRange('week')}>This Week</button>
                    <button className={timeRange === 'month' ? 'active' : ''} onClick={() => setTimeRange('month')}>This Month</button>
                </div>
            </div>

            <div className="report-stats-grid">
                <div className="stat-card">
                    <span className="stat-icon">🔥</span>
                    <span className="stat-value">{reportData.streak}</span>
                    <span className="stat-label">Day Streak</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">📓</span>
                    <span className="stat-value">{reportData.journalEntries}</span>
                    <span className="stat-label">Journal Entries</span>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">🧘</span>
                    <span className="stat-value">{reportData.meditationMinutes}</span>
                    <span className="stat-label">Minutes Meditated</span>
                </div>
            </div>

            <div className="report-charts-grid">
                <div className="report-card">
                    <h3>Mood Distribution</h3>
                    <div className="pie-chart-container">
                        <div className="pie-chart" style={{ background: generateConicGradient(reportData.moodDistribution) }}>
                            <div className="pie-center">
                                <span>{reportData.moodDistribution.happy || 0}% Happy</span>
                            </div>
                        </div>
                        <div className="chart-legend">
                            {Object.keys(reportData.moodDistribution).map(mood => (
                                <div key={mood} className="legend-item">
                                    <span className="color-dot" style={{ backgroundColor: moodColors[mood] }}></span>
                                    {mood.charAt(0).toUpperCase() + mood.slice(1)} ({reportData.moodDistribution[mood]}%)
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="report-card">
                    <h3>Weekly Activity</h3>
                    <div className="bar-chart">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                            <div key={day} className="bar-item">
                                <div className="bar">
                                    <div className="bar-fill" style={{ height: `${(reportData.dailyActivity[index] / maxActivity) * 100}%` }}></div>
                                </div>
                                <span className="bar-label">{day}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="report-card ai-insights">
                <h3>🤖 AI Insights</h3>
                <ul>
                    {reportData.insights.map((insight, index) => <li key={index}>{insight}</li>)}
                </ul>
            </div>
        </div>
    );
}

export default MoodReport;