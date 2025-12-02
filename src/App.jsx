import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import Auth from './pages/auth';
import TasksGoals from './pages/TasksGoals';
import BudgetTracker from './pages/BudgetTracker';
import CalendarPage from './pages/Calendar';
import Habits from './pages/Habits';
import Journal from './pages/Journal';
import SocialCircle from './pages/SocialCircle';
import DocumentVault from './pages/DocumentVault';
import QuickTools from './pages/QuickTools';
import CommunityHub from './pages/CommunityHub';
import MentalWellness from './pages/MentalWellness';
import AIPoweredAssistant from './pages/AIPoweredAssistant';
import Gamification from './pages/Gamification';
import Notifications from './pages/notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import HealthWellness from './pages/HealthWellness';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Search from './pages/search';
import Onboarding from './pages/onboarding';
import NotFound from './pages/NotFound';

import './App.css';

// OAuth Callback Component
function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      login(token);
      navigate('/dashboard');
    } else if (error) {
      navigate('/?error=' + error);
    } else {
      navigate('/');
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-text-primary text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'dark'
    return localStorage.getItem('theme') || 'dark';
  });

  // Apply theme to root element on mount and when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    console.log('Sidebar toggled. isSidebarOpen:', !isSidebarOpen);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const renderProtectedPage = (Component) => (
    <div className="min-h-screen bg-bg">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} theme={theme} />
      <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Navbar
          toggleSidebar={toggleSidebar}
          toggleTheme={toggleTheme}
          theme={theme}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="flex-1 p-6 bg-bg">
          <Component />
        </main>
      </div>
    </div>
  );

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={renderProtectedPage(Dashboard)} />
            <Route path="/tasks-goals" element={renderProtectedPage(TasksGoals)} />
            <Route path="/budget-tracker" element={renderProtectedPage(BudgetTracker)} />
            <Route path="/calendar" element={renderProtectedPage(CalendarPage)} />
            <Route path="/habits" element={renderProtectedPage(Habits)} />
            <Route path="/journal" element={renderProtectedPage(Journal)} />
            <Route path="/social-circle" element={renderProtectedPage(SocialCircle)} />
            <Route path="/documents" element={renderProtectedPage(DocumentVault)} />
            <Route path="/quick-tools" element={renderProtectedPage(QuickTools)} />
            <Route path="/community-hub" element={renderProtectedPage(CommunityHub)} />
            <Route path="/wellness" element={renderProtectedPage(MentalWellness)} />
            <Route path="/assistant" element={renderProtectedPage(AIPoweredAssistant)} />
            <Route path="/gamification" element={renderProtectedPage(Gamification)} />
            <Route path="/notifications" element={renderProtectedPage(Notifications)} />
            <Route path="/profile" element={renderProtectedPage(Profile)} />
            <Route path="/HealthWellness" element={renderProtectedPage(HealthWellness)} />
            <Route path="/Settings" element={renderProtectedPage(Settings)} />
            <Route path="/search" element={renderProtectedPage(Search)} />
          </Route>
          
          {/* 404 Route - must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
