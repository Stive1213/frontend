import { useState, useEffect } from 'react';
import { healthAPI } from '../services/api';
import { Card, Input, Button, LoadingSpinner, Alert } from '../components/ui';

function HealthWellness() {
  const [fitnessActivities, setFitnessActivities] = useState([]);
  const [dietLogs, setDietLogs] = useState([]);
  const [sleepLogs, setSleepLogs] = useState([]);
  const [waterIntake, setWaterIntake] = useState({ glasses: 0, date: '' });
  const [healthStats, setHealthStats] = useState({ weeklySteps: 0, averageSleep: 0, weeklyCalories: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newActivity, setNewActivity] = useState({ type: '', duration: '', calories: '', date: '' });
  const [newMeal, setNewMeal] = useState({ meal: '', calories: '', date: '' });
  const [newSleep, setNewSleep] = useState({ hours: '', date: '' });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const today = new Date().toISOString().split('T')[0];
      const [activities, diet, sleep, water, stats] = await Promise.all([
        healthAPI.getFitnessActivities().catch(() => ({ data: [] })),
        healthAPI.getDietLogs().catch(() => ({ data: [] })),
        healthAPI.getSleepLogs().catch(() => ({ data: [] })),
        healthAPI.getWaterIntake({ date: today }).catch(() => ({ data: { glasses: 0, date: today } })),
        healthAPI.getHealthStats().catch(() => ({ data: { weeklySteps: 0, averageSleep: 0, weeklyCalories: 0 } })),
      ]);
      
      setFitnessActivities(activities.data);
      setDietLogs(diet.data);
      setSleepLogs(sleep.data);
      setWaterIntake(water.data);
      setHealthStats(stats.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!newActivity.type || !newActivity.duration) {
      setError('Type and duration are required');
      return;
    }
    
    try {
      const date = newActivity.date || new Date().toISOString().split('T')[0];
      await healthAPI.addFitnessActivity({
        ...newActivity,
        date,
        calories: newActivity.calories || null,
      });
      setNewActivity({ type: '', duration: '', calories: '', date: '' });
      fetchAllData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add activity');
    }
  };

  const handleDeleteActivity = async (id) => {
    try {
      await healthAPI.deleteFitnessActivity(id);
      fetchAllData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete activity');
    }
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!newMeal.meal) {
      setError('Meal is required');
      return;
    }
    
    try {
      const date = newMeal.date || new Date().toISOString().split('T')[0];
      await healthAPI.addDietLog({
        ...newMeal,
        date,
        calories: newMeal.calories || null,
      });
      setNewMeal({ meal: '', calories: '', date: '' });
      fetchAllData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add meal');
    }
  };

  const handleDeleteMeal = async (id) => {
    try {
      await healthAPI.deleteDietLog(id);
      fetchAllData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete meal');
    }
  };

  const handleAddWater = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await healthAPI.updateWaterIntake({
        glasses: (waterIntake.glasses || 0) + 1,
        date: today,
      });
      fetchAllData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update water intake');
    }
  };

  const handleAddSleep = async (e) => {
    e.preventDefault();
    if (!newSleep.hours) {
      setError('Hours are required');
      return;
    }
    
    try {
      const date = newSleep.date || new Date().toISOString().split('T')[0];
      await healthAPI.addSleepLog({
        hours: parseFloat(newSleep.hours),
        date,
      });
      setNewSleep({ hours: '', date: '' });
      fetchAllData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add sleep log');
    }
  };

  const handleDeleteSleep = async (id) => {
    try {
      await healthAPI.deleteSleepLog(id);
      fetchAllData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete sleep log');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="text-text-primary">
      <h2 className="text-2xl font-bold mb-6">Health & Wellness</h2>

      {error && <Alert type="error" message={error} className="mb-4" />}

      {/* Health Stats */}
      <Card className="mb-6">
        <h3 className="text-xl font-bold mb-4">Health Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-elevated p-4 rounded-lg">
            <p className="text-sm text-text-muted">Weekly Steps</p>
            <p className="text-2xl font-semibold text-primary">{healthStats.weeklySteps?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-surface-elevated p-4 rounded-lg">
            <p className="text-sm text-text-muted">Average Sleep</p>
            <p className="text-2xl font-semibold text-primary">{healthStats.averageSleep || 0} hours</p>
          </div>
          <div className="bg-surface-elevated p-4 rounded-lg">
            <p className="text-sm text-text-muted">Weekly Calories</p>
            <p className="text-2xl font-semibold text-primary">{healthStats.weeklyCalories || 0}</p>
          </div>
        </div>
      </Card>

      {/* Fitness Tracking */}
      <Card className="mb-6">
        <h3 className="text-xl font-bold mb-4">Fitness Tracking</h3>
        <form onSubmit={handleAddActivity} className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2">
          <Input
            type="text"
            placeholder="Activity (e.g., Run)"
            value={newActivity.type}
            onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
            required
          />
          <Input
            type="text"
            placeholder="Duration (e.g., 30 mins)"
            value={newActivity.duration}
            onChange={(e) => setNewActivity({ ...newActivity, duration: e.target.value })}
            required
          />
          <Input
            type="number"
            placeholder="Calories (optional)"
            value={newActivity.calories}
            onChange={(e) => setNewActivity({ ...newActivity, calories: e.target.value })}
          />
          <Button type="submit">Add</Button>
        </form>
        {fitnessActivities.length > 0 ? (
          <ul className="space-y-2">
            {fitnessActivities.map((activity) => (
              <li key={activity.id} className="bg-surface-elevated p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">{activity.type} - {activity.duration} {activity.calories && `(${activity.calories} calories)`}</p>
                  <p className="text-sm text-text-muted">{new Date(activity.date).toLocaleDateString()}</p>
                </div>
                <Button variant="error" size="sm" onClick={() => handleDeleteActivity(activity.id)}>Delete</Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-muted">No activities logged.</p>
        )}
      </Card>

      {/* Diet Tracking */}
      <Card className="mb-6">
        <h3 className="text-xl font-bold mb-4">Diet Tracking</h3>
        <form onSubmit={handleAddMeal} className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
          <Input
            type="text"
            placeholder="Meal (e.g., Breakfast - Oatmeal)"
            value={newMeal.meal}
            onChange={(e) => setNewMeal({ ...newMeal, meal: e.target.value })}
            required
          />
          <Input
            type="number"
            placeholder="Calories (optional)"
            value={newMeal.calories}
            onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
          />
          <Button type="submit">Add Meal</Button>
        </form>
        <div className="mb-4">
          <p>Water Intake Today: <span className="text-primary font-semibold">{waterIntake.glasses || 0} glasses</span></p>
          <Button onClick={handleAddWater} className="mt-2">Add Glass of Water</Button>
        </div>
        {dietLogs.length > 0 ? (
          <ul className="space-y-2">
            {dietLogs.map((log) => (
              <li key={log.id} className="bg-surface-elevated p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">{log.meal} {log.calories && `(${log.calories} calories)`}</p>
                  <p className="text-sm text-text-muted">{new Date(log.date).toLocaleDateString()}</p>
                </div>
                <Button variant="error" size="sm" onClick={() => handleDeleteMeal(log.id)}>Delete</Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-muted">No meals logged.</p>
        )}
      </Card>

      {/* Sleep Tracking */}
      <Card>
        <h3 className="text-xl font-bold mb-4">Sleep Tracking</h3>
        <form onSubmit={handleAddSleep} className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
          <Input
            type="number"
            step="0.5"
            placeholder="Hours slept"
            value={newSleep.hours}
            onChange={(e) => setNewSleep({ ...newSleep, hours: e.target.value })}
            required
          />
          <Button type="submit">Add Sleep</Button>
        </form>
        {sleepLogs.length > 0 ? (
          <ul className="space-y-2">
            {sleepLogs.map((log) => (
              <li key={log.id} className="bg-surface-elevated p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">{log.hours} hours</p>
                  <p className="text-sm text-text-muted">{new Date(log.date).toLocaleDateString()}</p>
                </div>
                <Button variant="error" size="sm" onClick={() => handleDeleteSleep(log.id)}>Delete</Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-muted">No sleep logged.</p>
        )}
      </Card>
    </div>
  );
}

export default HealthWellness;
