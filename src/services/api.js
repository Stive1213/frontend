import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-bkzz.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Backend allows credentials (access-control-allow-credentials: true)
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle CORS errors
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || (error.response?.status === 0)) {
      const frontendOrigin = window.location.origin;
      const corsErrorMsg = `CORS Error: The backend is configured to only allow requests from specific origins. 
      
Current frontend origin: ${frontendOrigin}
Backend URL: ${API_BASE_URL}

The backend CORS configuration needs to include your frontend's origin. 
If you're running locally, the backend needs to allow 'http://localhost:5173' (or your local port).
If you've deployed the frontend, update the backend CORS to include your frontend URL.`;
      
      console.error('CORS/Network Error:', {
        frontendOrigin,
        backendURL: API_BASE_URL,
        error: error.message,
        code: error.code
      });
      return Promise.reject(new Error(corsErrorMsg));
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout: Backend took too long to respond');
      return Promise.reject(new Error('Request timeout. The server is taking too long to respond.'));
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (formData) => api.post('/api/auth/signup', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  
  login: (credentials) => api.post('/api/auth/login', credentials),
  
  getUser: () => api.get('/api/auth/user'),
  
  updateUser: (formData) => api.put('/api/auth/user', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  
  googleAuth: () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },
  
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/api/auth/reset-password', { token, password }),
};

// Tasks API
export const tasksAPI = {
  getAll: () => api.get('/api/tasks'),
  create: (task) => api.post('/api/tasks', task),
  update: (id, task) => api.put(`/api/tasks/${id}`, task),
  delete: (id) => api.delete(`/api/tasks/${id}`),
};

// Goals API
export const goalsAPI = {
  getAll: () => api.get('/api/goals'),
  create: (goal) => api.post('/api/goals', goal),
  update: (id, goal) => api.put(`/api/goals/${id}`, goal),
  delete: (id) => api.delete(`/api/goals/${id}`),
};

// Transactions API
export const transactionsAPI = {
  getAll: () => api.get('/api/transactions'),
  create: (transaction) => api.post('/api/transactions', transaction),
  update: (id, transaction) => api.put(`/api/transactions/${id}`, transaction),
  delete: (id) => api.delete(`/api/transactions/${id}`),
};

// Events API
export const eventsAPI = {
  getAll: () => api.get('/api/events'),
  create: (event) => api.post('/api/events', event),
  update: (id, event) => api.put(`/api/events/${id}`, event),
  delete: (id) => api.delete(`/api/events/${id}`),
};

// Habits API
export const habitsAPI = {
  getAll: () => api.get('/api/habits'),
  create: (habit) => api.post('/api/habits', habit),
  update: (id, habit) => api.put(`/api/habits/${id}`, habit),
  delete: (id) => api.delete(`/api/habits/${id}`),
};

// Journal API
export const journalAPI = {
  getAll: () => api.get('/api/journal'),
  create: (entry) => api.post('/api/journal', entry),
  update: (id, entry) => api.put(`/api/journal/${id}`, entry),
  delete: (id) => api.delete(`/api/journal/${id}`),
};

// Communities API
export const communitiesAPI = {
  getAll: () => api.get('/api/communities'),
  getOne: (id) => api.get(`/api/communities/${id}`),
};

// Subscriptions API
export const subscriptionsAPI = {
  getAll: () => api.get('/api/subscriptions'),
  subscribe: (communityId) => api.post('/api/subscriptions', { community_id: communityId }),
  unsubscribe: (communityId) => api.delete('/api/subscriptions', { data: { community_id: communityId } }),
};

// Posts API
export const postsAPI = {
  getAll: (communityId) => api.get(`/api/posts?community_id=${communityId}`),
  create: (post) => api.post('/api/posts', post),
  vote: (postId, type) => api.post('/api/posts/vote', { post_id: postId, type }),
  flag: (postId) => api.post('/api/posts/flag', { post_id: postId }),
};

// Comments API
export const commentsAPI = {
  getAll: (postId) => api.get(`/api/comments?post_id=${postId}`),
  create: (comment) => api.post('/api/comments', comment),
};

// Gamification API
export const gamificationAPI = {
  getPoints: () => api.get('/api/gamification/points'),
  getStats: () => api.get('/api/gamification/stats'),
  getEarnings: () => api.get('/api/gamification/earnings'),
  getBadges: () => api.get('/api/gamification/badges'),
  getLeaderboard: (optIn) => api.get('/api/gamification/leaderboard', { params: { optIn } }),
  updateLeaderboardOptIn: (optIn) => api.put('/api/gamification/leaderboard/opt-in', { optIn }),
};

// Documents API
export const documentsAPI = {
  getAll: (params) => api.get('/api/documents', { params }),
  getCategories: () => api.get('/api/documents/categories'),
  upload: (formData) => api.post('/api/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => api.put(`/api/documents/${id}`, data),
  delete: (id) => api.delete(`/api/documents/${id}`),
  download: (id) => api.get(`/api/documents/${id}/download`, {
    responseType: 'blob',
  }),
};

// Chat API
export const chatAPI = {
  searchUsers: (query) => api.get('/api/chat/search', { params: { query } }),
  getConversations: () => api.get('/api/chat/conversations'),
  getOrCreateConversation: (userId) => api.post(`/api/chat/conversations/${userId}`),
  getMessages: (conversationId, params) => api.get(`/api/chat/conversations/${conversationId}/messages`, { params }),
  sendMessage: (formData) => api.post('/api/chat/messages', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  markAsRead: (conversationId) => api.put(`/api/chat/conversations/${conversationId}/read`),
};

// Profile Pictures API
export const profilePicturesAPI = {
  upload: (formData) => api.post('/api/profile-pictures/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: (userId) => api.get(`/api/profile-pictures/${userId}`),
  delete: (pictureId) => api.delete(`/api/profile-pictures/${pictureId}`),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get('/api/notifications'),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.put('/api/notifications/read-all'),
  delete: (id) => api.delete(`/api/notifications/${id}`),
  deleteAll: () => api.delete('/api/notifications'),
};

// Health & Wellness API
export const healthAPI = {
  // Fitness
  getFitnessActivities: (params) => api.get('/api/health/fitness', { params }),
  addFitnessActivity: (data) => api.post('/api/health/fitness', data),
  deleteFitnessActivity: (id) => api.delete(`/api/health/fitness/${id}`),
  // Diet
  getDietLogs: (params) => api.get('/api/health/diet', { params }),
  addDietLog: (data) => api.post('/api/health/diet', data),
  deleteDietLog: (id) => api.delete(`/api/health/diet/${id}`),
  // Sleep
  getSleepLogs: (params) => api.get('/api/health/sleep', { params }),
  addSleepLog: (data) => api.post('/api/health/sleep', data),
  deleteSleepLog: (id) => api.delete(`/api/health/sleep/${id}`),
  // Water
  getWaterIntake: (params) => api.get('/api/health/water', { params }),
  updateWaterIntake: (data) => api.put('/api/health/water', data),
  // Stats
  getHealthStats: () => api.get('/api/health/stats'),
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/api/settings'),
  update: (data) => api.put('/api/settings', data),
  deleteAccount: (password) => api.delete('/api/settings/account', { data: { password } }),
};

// Search API
export const searchAPI = {
  search: (query) => api.get('/api/search', { params: { query } }),
};

export default api;

