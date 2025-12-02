import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Input, Alert } from '../components/ui';

function Journal() {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({
    text: '',
    mood: 'Happy',
  });
  const [error, setError] = useState('');

  // Current date (dynamic)
  const currentDate = new Date().toISOString().split('T')[0];

  // Available moods with icons
  const moods = [
    { name: 'Happy', icon: '😊', color: 'text-green-400' },
    { name: 'Sad', icon: '😢', color: 'text-blue-400' },
    { name: 'Neutral', icon: '😐', color: 'text-text-muted' },
    { name: 'Excited', icon: '🎉', color: 'text-yellow-400' },
    { name: 'Stressed', icon: '😓', color: 'text-red-400' },
  ];

  // Fetch journal entries on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view journal entries');
      return;
    }

    axios
      .get('http://localhost:5000/api/journal', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setEntries(response.data))
      .catch((err) => setError(err.response?.data?.error || 'Error fetching journal entries'));
  }, []);

  // Handle form input changes
  const handleEntryChange = (e) => {
    setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
  };

  // Handle mood selection
  const handleMoodSelect = (mood) => {
    setNewEntry({ ...newEntry, mood });
  };

  // Handle adding a new journal entry
  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!newEntry.text) return;
    const token = localStorage.getItem('token');
    const entry = { date: currentDate, text: newEntry.text, mood: newEntry.mood };
    try {
      const response = await axios.post(
        'http://localhost:5000/api/journal',
        entry,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEntries([response.data, ...entries]);
      setNewEntry({ text: '', mood: 'Happy' });
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding journal entry');
    }
  };

  // Calculate mood summary for the current month
  const getMoodSummary = () => {
    const currentMonth = currentDate.slice(0, 7); // e.g., "2025-03"
    const monthEntries = entries.filter((entry) => entry.date.startsWith(currentMonth));
    const totalEntries = monthEntries.length;
    if (totalEntries === 0) return 'No entries this month.';

    const moodCounts = monthEntries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});

    const summary = Object.entries(moodCounts)
      .map(([mood, count]) => {
        const percentage = Math.round((count / totalEntries) * 100);
        return `${percentage}% ${mood}`;
      })
      .join(', ');

    return `This month: ${summary}`;
  };

  return (
    <div className="text-text-primary animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-text-primary animate-fade-in-down">Daily Journal</h2>
      <Alert type="error" message={error} />

      {/* Entry Form */}
      <Card stagger={1} className="mb-6">
        <h3 className="text-xl font-bold mb-4 text-text-primary">New Entry</h3>
        <form onSubmit={handleAddEntry}>
          <Input
            type="textarea"
            id="entry-text"
            name="text"
            label="Write about your day"
            value={newEntry.text}
            onChange={handleEntryChange}
            rows="5"
            placeholder="How was your day?"
            stagger={1}
            animated={false}
          />
          <div className="mb-4">
            <label className="block text-sm text-text-muted mb-2">How are you feeling?</label>
            <div className="flex space-x-4">
              {moods.map((mood) => (
                <button
                  key={mood.name}
                  type="button"
                  onClick={() => handleMoodSelect(mood.name)}
                  className={`text-2xl p-2 rounded-lg transition-colors ${
                    newEntry.mood === mood.name
                      ? 'bg-primary text-primary-text'
                      : 'bg-surface-elevated hover:bg-surface-hover'
                  }`}
                  title={mood.name}
                >
                  <span>{mood.icon}</span>
                </button>
              ))}
            </div>
          </div>
          <Button
            type="submit"
            fullWidth
            animated={false}
          >
            Save
          </Button>
        </form>
      </Card>

      {/* Timeline and Mood Summary */}
      <div className="flex space-x-6">
        {/* Timeline */}
        <Card stagger={2} className="flex-1">
          <h3 className="text-xl font-bold mb-4 text-text-primary">Timeline</h3>
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {entries.length > 0 ? (
              <ul className="space-y-4">
                {entries.map((entry, index) => {
                  const mood = moods.find((m) => m.name === entry.mood);
                  const snippet = entry.text.split(' ').slice(0, 5).join(' ') + '...';
                  return (
                    <li key={entry.id} className="bg-surface-elevated border border-border p-4 rounded-lg hover-lift transition-smooth animate-fade-in-scale stagger-1">
                      <p className="font-bold text-text-primary">
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-text-muted">{snippet}</p>
                      <p className="text-sm text-text-primary">
                        {mood?.icon} {entry.mood}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-text-muted">No journal entries yet.</p>
            )}
          </div>
        </Card>

        {/* Mood Summary */}
        <Card stagger={3} className="w-80">
          <h3 className="text-xl font-bold mb-4 text-text-primary">Mood Summary</h3>
          <p className="text-text-muted">{getMoodSummary()}</p>
        </Card>
      </div>
    </div>
  );
}

export default Journal;