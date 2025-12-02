import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { Card, Button, Input, Alert } from '../components/ui';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-bkzz.onrender.com';

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

function Habits() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState({
    name: '',
    frequency: 'Daily',
  });
  const [selectedHabitId, setSelectedHabitId] = useState('');
  const [error, setError] = useState('');

  // Current date (dynamic)
  const currentDate = new Date().toISOString().split('T')[0];

  // Fetch habits on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view habits');
      return;
    }

    axios
      .get(`${API_BASE_URL}/api/habits`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setHabits(response.data);
        if (response.data.length > 0 && !selectedHabitId) {
          setSelectedHabitId(response.data[0].id);
        }
      })
      .catch((err) => setError(err.response?.data?.error || 'Error fetching habits'));
  }, []);

  // Handle form input changes
  const handleHabitChange = (e) => {
    setNewHabit({ ...newHabit, [e.target.name]: e.target.value });
  };

  // Handle adding a new habit
  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabit.name) return;
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/habits`,
        newHabit,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHabits([...habits, response.data]);
      if (habits.length === 0) {
        setSelectedHabitId(response.data.id);
      }
      setNewHabit({ name: '', frequency: 'Daily' });
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding habit');
    }
  };

  // Handle marking a habit as done
  const toggleHabitDone = async (habitId) => {
    const token = localStorage.getItem('token');
    const habit = habits.find((h) => h.id === habitId);
    const isDoneToday = habit.completionHistory.includes(currentDate);
    let newStreak = habit.streak;
    let newCompletionHistory = [...habit.completionHistory];

    if (isDoneToday) {
      // Unmark as done
      newCompletionHistory = newCompletionHistory.filter((date) => date !== currentDate);
      let streak = 0;
      let tempDate = new Date(currentDate);
      tempDate.setDate(tempDate.getDate() - 1);
      while (newCompletionHistory.includes(tempDate.toISOString().split('T')[0])) {
        streak++;
        tempDate.setDate(tempDate.getDate() - 1);
      }
      newStreak = streak;
    } else {
      // Mark as done
      newCompletionHistory.push(currentDate);
      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const wasDoneYesterday = habit.completionHistory.includes(yesterday.toISOString().split('T')[0]);
      newStreak = wasDoneYesterday ? habit.streak + 1 : 1;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/api/habits/${habitId}`,
        { streak: newStreak, completionHistory: newCompletionHistory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHabits(
        habits.map((h) =>
          h.id === habitId ? { ...h, streak: newStreak, completionHistory: newCompletionHistory } : h
        )
      );
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating habit');
    }
  };

  // Calculate weekly summary (last 7 days)
  const getWeeklySummary = () => {
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - 6);
    const totalPossibleCompletions = habits.length * 7;
    let totalCompletions = 0;

    habits.forEach((habit) => {
      if (habit.frequency === 'Daily') {
        habit.completionHistory.forEach((date) => {
          const completionDate = new Date(date);
          if (completionDate >= startDate && completionDate <= new Date(currentDate)) {
            totalCompletions++;
          }
        });
      }
    });

    const completionPercentage =
      totalPossibleCompletions > 0
        ? Math.round((totalCompletions / totalPossibleCompletions) * 100)
        : 0;
    return `Completed ${completionPercentage}% this week`;
  };

  // Prepare data for the line graph
  const getGraphData = () => {
    const selectedHabit = habits.find((habit) => habit.id === selectedHabitId);
    if (!selectedHabit) return { labels: [], datasets: [] };

    const labels = [];
    const data = [];
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - 6);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      const dateString = day.toISOString().split('T')[0];
      labels.push(day.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));
      data.push(selectedHabit.completionHistory.includes(dateString) ? 1 : 0);
    }

    return {
      labels,
      datasets: [
        {
          label: `${selectedHabit.name} Progress`,
          data,
          fill: false,
          borderColor: '#8b5cf6',
          backgroundColor: '#8b5cf6',
          tension: 0.1,
        },
      ],
    };
  };

  const graphOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          stepSize: 1,
          callback: (value) => (value === 1 ? 'Completed' : 'Not Completed'),
          color: '#d1d5db',
        },
        grid: { color: '#334155' },
      },
      x: {
        ticks: { color: '#d1d5db' },
        grid: { color: '#334155' },
      },
    },
    plugins: {
      legend: { labels: { color: '#d1d5db' } },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="text-text-primary animate-fade-in">
      <h2 className="text-2xl text-text-primary font-bold mb-6 animate-fade-in-down">Habit Builder</h2>
      <Alert type="error" message={error} />

      {/* Add Habit Form */}
      <Card stagger={1} className="mb-6">
        <h3 className="text-xl font-bold mb-4 text-text-primary">Add Habit</h3>
        <form onSubmit={handleAddHabit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              type="text"
              id="habit-name"
              name="name"
              label="Name"
              value={newHabit.name}
              onChange={handleHabitChange}
              placeholder="Enter habit name"
              stagger={1}
              animated={false}
            />
            <div>
              <label htmlFor="habit-frequency" className="block text-sm text-text-muted mb-2">
                Frequency
              </label>
              <select
                id="habit-frequency"
                name="frequency"
                value={newHabit.frequency}
                onChange={handleHabitChange}
                className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10 transition-apple"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
          </div>
          <Button
            type="submit"
            fullWidth
            animated={false}
          >
            Add Habit
          </Button>
        </form>
      </Card>

      {/* Habit List */}
      <Card stagger={2} className="mb-6">
        <h3 className="text-xl font-bold mb-4 text-text-primary">Habits</h3>
        {habits.length > 0 ? (
          <ul className="space-y-4">
            {habits.map((habit, index) => {
              const isDoneToday = habit.completionHistory.includes(currentDate);
              const reminderText = isDoneToday ? 'Great job!' : 'Check this today!';
              return (
                <li key={habit.id} className="bg-surface-elevated border border-border p-4 rounded-lg flex items-center justify-between hover-lift transition-smooth animate-fade-in-scale stagger-1">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={isDoneToday}
                      onChange={() => toggleHabitDone(habit.id)}
                      className="accent-primary"
                    />
                    <div>
                      <p className="font-bold text-text-primary">{habit.name}</p>
                      <p className="text-sm text-text-muted">
                        Streak: {habit.streak} {habit.frequency === 'Daily' ? 'days' : 'weeks'}
                      </p>
                      <p className={`text-sm ${isDoneToday ? 'text-success' : 'text-error'}`}>
                        {reminderText}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-text-muted">No habits added yet.</p>
        )}
      </Card>

      {/* History */}
      <Card stagger={3}>
        <h3 className="text-xl font-bold mb-4 text-text-primary">History</h3>
        <p className="text-text-muted mb-4">{getWeeklySummary()}</p>

        {habits.length > 0 ? (
          <div>
            <div className="mb-4">
              <label htmlFor="habit-select" className="block text-sm text-text-muted mb-2">
                Select Habit to View Progress
              </label>
              <select
                id="habit-select"
                value={selectedHabitId}
                onChange={(e) => setSelectedHabitId(e.target.value)}
                className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10 transition-apple"
              >
                {habits.map((habit) => (
                  <option key={habit.id} value={habit.id}>
                    {habit.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="h-64">
              <Line data={getGraphData()} options={graphOptions} />
            </div>
          </div>
        ) : (
          <p className="text-text-muted">Add habits to view progress.</p>
        )}
      </Card>
    </div>
  );
}

export default Habits;