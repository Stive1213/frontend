import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Auth() {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setUsername('');
    setFirstName('');
    setLastName('');
    setProfileImage(null);
    setAge('');
    setEmail('');
    setPassword('');
  };

  const handleFileChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleGoogleSignIn = () => {
    setError('');
    setLoading(true);
    try {
      authAPI.googleAuth();
    } catch (err) {
      setError('Failed to initiate Google Sign-In');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isSignup) {
      if (!username || !firstName || !lastName || !age || !email || !password) {
        setError('All fields except profile image are required for signup');
        setLoading(false);
        return;
      }
    } else {
      if (!username || !password) {
        setError('Username and password are required for login');
        setLoading(false);
        return;
      }
    }

    try {
      if (isSignup) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        if (profileImage) formData.append('profileImage', profileImage);
        formData.append('age', age);
        formData.append('email', email);
        formData.append('password', password);

        const response = await authAPI.signup(formData);
        if (response.data.success) {
          setSuccess('Signup successful! Please log in.');
          setIsSignup(false);
          // Clear form
          setUsername('');
          setFirstName('');
          setLastName('');
          setProfileImage(null);
          setAge('');
          setEmail('');
          setPassword('');
        }
      } else {
        const response = await authAPI.login({ username, password });
        if (response.data.success && response.data.token) {
          login(response.data.token);
          navigate('/dashboard');
        } else {
          setError('Login failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error:', err);
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        response: err.response,
        request: err.request,
        config: err.config
      });
      
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Network error: Unable to reach backend server. This could be due to:\n1. Backend server is not running or sleeping (Render free tier)\n2. CORS configuration issue\n3. Network connectivity problem\n\nPlease check the browser console for more details.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timeout: The server took too long to respond. The backend might be sleeping (Render free tier takes time to wake up).');
      } else if (err.response) {
        // Server responded with error status
        const errorMessage = err.response?.data?.error || err.response?.data?.message || `Server error: ${err.response.status}`;
        setError(errorMessage);
      } else {
        const errorMessage = err.message || 'Something went wrong. Please try again.';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {isSignup ? 'Sign Up' : 'Login'}
        </h2>
        {error && <p className="text-red-500 mb-4 text-center text-sm">{error}</p>}
        {success && <p className="text-green-500 mb-4 text-center text-sm">{success}</p>}
        
        {/* Google Sign-In Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 p-3 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>
        
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-800 text-gray-400">Or continue with email</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {isSignup && (
            <>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2" htmlFor="username">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your username"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2" htmlFor="firstName">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your first name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your last name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2" htmlFor="profileImage">
                  Profile Image (optional)
                </label>
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-3 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2" htmlFor="age">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your age"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your email"
                />
              </div>
            </>
          )}
          {!isSignup && (
            <div className="mb-4">
              <label className="block text-gray-400 mb-2" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your username"
              />
            </div>
          )}
          <div className="mb-6">
            <label className="block text-gray-400 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your password"
            />
          </div>
          {!isSignup && (
            <div className="mb-4 text-right">
              <Link to="/forgot-password" className="text-purple-400 hover:underline text-sm">
                Forgot Password?
              </Link>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-500 text-white p-3 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <p className="text-gray-400 mt-4 text-center">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={toggleAuthMode}
            className="text-purple-400 hover:underline ml-1"
          >
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;