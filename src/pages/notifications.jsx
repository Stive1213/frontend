import { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';
import { LoadingSpinner, Alert } from '../components/ui';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await notificationsAPI.getAll();
      setNotifications(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark a notification as read
  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark notification as read');
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark all as read');
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications?')) return;
    
    try {
      await notificationsAPI.deleteAll();
      setNotifications([]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete notifications');
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete notification');
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Notifications</h2>
        <div className="flex gap-2">
          {notifications.length > 0 && (
            <>
              {notifications.some(n => !n.read) && (
                <button
                  onClick={markAllAsRead}
                  className="bg-secondary text-secondary-text px-4 py-2 rounded-lg hover:bg-secondary-hover transition-colors"
                >
                  Mark All Read
                </button>
              )}
              <button
                onClick={clearAllNotifications}
                className="bg-error text-error-text px-4 py-2 rounded-lg hover:bg-error-hover transition-colors"
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {error && <Alert type="error" message={error} className="mb-4" />}

      {/* Notifications List */}
      <div className="bg-card-bg border border-card-border p-6 rounded-lg shadow">
        {notifications.length > 0 ? (
          <ul className="space-y-4">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`p-4 rounded-lg flex justify-between items-center ${
                  notification.read ? 'bg-surface-elevated' : 'bg-primary/20'
                } ${notification.read ? 'text-text-primary' : 'text-text-primary'}`}
              >
                <div className="flex-1">
                  <p className="font-medium">{notification.title || notification.type}</p>
                  <p className="text-sm text-text-muted mt-1">{notification.message}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="px-3 py-1 rounded-lg bg-secondary text-secondary-text hover:bg-secondary-hover transition-colors text-sm"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="px-3 py-1 rounded-lg bg-error/20 text-error hover:bg-error/30 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-muted text-center py-8">No notifications available.</p>
        )}
      </div>
    </div>
  );
}

export default Notifications;