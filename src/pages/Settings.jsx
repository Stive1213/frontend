import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { settingsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Input, Alert, LoadingSpinner } from '../components/ui';

function Settings({ toggleTheme, theme }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await settingsAPI.get();
      setNotificationsEnabled(response.data.notificationsEnabled);
      setLeaderboardOptIn(response.data.leaderboardOptIn);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await settingsAPI.update({
        notificationsEnabled,
        leaderboardOptIn,
      });
      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    if (!window.confirm('Are you absolutely sure? This action cannot be undone and all your data will be permanently deleted.')) {
      setShowDeleteConfirm(false);
      return;
    }

    setSaving(true);
    setError('');
    try {
      await settingsAPI.deleteAccount(deletePassword);
      logout();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete account');
      setShowDeleteConfirm(false);
      setDeletePassword('');
    } finally {
      setSaving(false);
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
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      {error && <Alert type="error" message={error} className="mb-4" />}
      {success && <Alert type="success" message={success} className="mb-4" />}

      {/* General Settings */}
      <Card className="mb-6">
        <h3 className="text-xl font-bold mb-4">General</h3>
        <div className="flex items-center justify-between">
          <span>Theme</span>
          <Button onClick={toggleTheme}>
            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </Button>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="mb-6">
        <h3 className="text-xl font-bold mb-4">Notifications</h3>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={() => setNotificationsEnabled(!notificationsEnabled)}
            className="h-5 w-5 text-primary rounded"
          />
          <span>Enable Notifications</span>
        </label>
      </Card>

      {/* Privacy Settings */}
      <Card className="mb-6">
        <h3 className="text-xl font-bold mb-4">Privacy</h3>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={leaderboardOptIn}
            onChange={() => setLeaderboardOptIn(!leaderboardOptIn)}
            className="h-5 w-5 text-primary rounded"
          />
          <span>Show my score on the leaderboard</span>
        </label>
        <Button onClick={handleSaveSettings} disabled={saving} className="mt-4">
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Card>

      {/* Account Settings */}
      <Card>
        <h3 className="text-xl font-bold mb-4">Account</h3>
        <div className="space-y-4">
          <Button onClick={handleLogout}>
            Logout
          </Button>
          
          {!showDeleteConfirm ? (
            <Button variant="error" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          ) : (
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter your password to confirm"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="error" onClick={handleDeleteAccount} disabled={saving}>
                  {saving ? 'Deleting...' : 'Confirm Delete'}
                </Button>
                <Button variant="secondary" onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword('');
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default Settings;