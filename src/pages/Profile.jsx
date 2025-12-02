import { useState, useEffect } from 'react';
import { authAPI, profilePicturesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Input, LoadingSpinner, Alert } from '../components/ui';
import ProfilePictureGallery from '../components/ProfilePictureGallery';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-bkzz.onrender.com';

function Profile() {
  const { user: authUser, fetchUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    age: '',
    email: '',
    phoneNumber: '',
    password: '',
    profileImage: null,
  });
  const [imagePreview, setImagePreview] = useState('');
  const [profilePictures, setProfilePictures] = useState([]);
  const [showGallery, setShowGallery] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await authAPI.getUser();
        if (response.data.success) {
          const userData = response.data.user;
          setUser(userData);
          setFormData({
            username: userData.username || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            age: userData.age || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || '',
            password: '',
            profileImage: userData.profileImage || 'https://via.placeholder.com/40',
          });
          
          // Load profile pictures
          if (userData.id) {
            profilePicturesAPI.getAll(userData.id)
              .then((response) => {
                setProfilePictures(response.data);
              })
              .catch((err) => {
                console.error('Error loading profile pictures:', err);
              });
          }
          setImagePreview(
            userData.profileImage?.startsWith('http')
              ? userData.profileImage
              : `${API_BASE_URL}${userData.profileImage}`
          );
        } else {
          setError(response.data.error || 'Failed to fetch user data');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.error || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const loadProfilePictures = async (userId) => {
    try {
      const targetUserId = userId || user?.id;
      if (targetUserId) {
        const response = await profilePicturesAPI.getAll(targetUserId);
        setProfilePictures(response.data);
      }
    } catch (err) {
      console.error('Error loading profile pictures:', err);
    }
  };

  const handleUploadProfilePicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);
      await profilePicturesAPI.upload(formData);
      await loadProfilePictures(user?.id);
      setSuccess('Profile picture uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload profile picture');
    }
  };

  const handleDeleteProfilePicture = async (pictureId) => {
    if (!window.confirm('Are you sure you want to delete this profile picture?')) {
      return;
    }

    try {
      await profilePicturesAPI.delete(pictureId);
      await loadProfilePictures(user?.id);
      setSuccess('Profile picture deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete profile picture');
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle profile picture upload
  const handlePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profileImage: file });
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const formDataToSend = new FormData();
    if (formData.username) formDataToSend.append('username', formData.username);
    if (formData.firstName) formDataToSend.append('firstName', formData.firstName);
    if (formData.lastName) formDataToSend.append('lastName', formData.lastName);
    if (formData.age) formDataToSend.append('age', formData.age);
    if (formData.email) formDataToSend.append('email', formData.email);
    if (formData.phoneNumber !== undefined) formDataToSend.append('phoneNumber', formData.phoneNumber || '');
    if (formData.password) formDataToSend.append('password', formData.password);
    if (formData.profileImage instanceof File) {
      formDataToSend.append('profileImage', formData.profileImage);
    }

    try {
      const response = await authAPI.updateUser(formDataToSend);
      if (response.data.success) {
        setSuccess('Profile updated successfully!');
        // Refresh user data
        const updatedResponse = await authAPI.getUser();
        if (updatedResponse.data.success) {
          const updatedUser = updatedResponse.data.user;
          setUser(updatedUser);
          setFormData({
            ...updatedUser,
            password: '',
            profileImage: updatedUser.profileImage,
          });
          setImagePreview(
            updatedUser.profileImage?.startsWith('http')
              ? updatedUser.profileImage
              : `${API_BASE_URL}${updatedUser.profileImage}`
          );
          // Refresh auth context
          fetchUser();
        }
        setEditMode(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const getProfileImageUrl = (imagePath) => {
    if (!imagePath || imagePath === 'https://via.placeholder.com/40') return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  };

  const getInitials = () => {
    if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user?.lastName) return user.lastName.charAt(0).toUpperCase();
    if (user?.username && user.username !== 'Guest') return user.username.charAt(0).toUpperCase();
    return null;
  };

  if (loading) {
    return <LoadingSpinner message="Loading profile..." fullScreen />;
  }

  if (error && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen animate-fade-in">
        <div className="text-center">
          <Alert type="error" message={error} className="mb-4" />
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-text-primary mb-6 animate-fade-in-down">My Profile</h1>

      {/* Success/Error Messages */}
      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Profile Header Card */}
      <Card stagger={1} className="mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Image */}
          <div className="relative">
            {(imagePreview || getProfileImageUrl(user?.profileImage)) ? (
              <img
                src={imagePreview || getProfileImageUrl(user?.profileImage)}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-primary object-cover hover-scale transition-smooth animate-fade-in-scale"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-32 h-32 rounded-full border-4 border-primary bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-text hover-scale transition-smooth animate-fade-in-scale ${
                (imagePreview || getProfileImageUrl(user?.profileImage)) ? 'hidden' : ''
              }`}
            >
              {getInitials() ? (
                <span className="text-5xl font-bold">{getInitials()}</span>
              ) : (
                <svg
                  className="w-16 h-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              )}
            </div>
            {editMode && (
              <label className="absolute bottom-0 right-0 bg-primary text-primary-text p-2 rounded-full cursor-pointer hover:bg-primary-hover transition-apple shadow-lg btn-press animate-scale-in">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePictureUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-text-muted mb-1">@{user?.username}</p>
            <p className="text-text-muted mb-4">{user?.email}</p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-surface-elevated border border-border rounded-lg p-3 hover-lift transition-smooth animate-fade-in-scale stagger-2">
                <p className="text-text-muted text-sm">Age</p>
                <p className="text-text-primary text-xl font-bold">{user?.age || 'N/A'}</p>
              </div>
              <div className="bg-surface-elevated border border-border rounded-lg p-3 hover-lift transition-smooth animate-fade-in-scale stagger-3">
                <p className="text-text-muted text-sm">Total Points</p>
                <p className="text-text-primary text-xl font-bold">{user?.totalPoints || 0}</p>
              </div>
              <div className="bg-surface-elevated border border-border rounded-lg p-3 hover-lift transition-smooth animate-fade-in-scale stagger-4">
                <p className="text-text-muted text-sm">Member Since</p>
                <p className="text-text-primary text-sm">{user?.joinedDate || 'Recently'}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Details Card */}
      <Card stagger={2}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-text-primary transition-apple">
            {editMode ? 'Edit Profile Information' : 'Profile Information'}
          </h3>
          {!editMode && (
            <Button
              onClick={() => setEditMode(true)}
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              }
            >
              Edit Profile
            </Button>
          )}
        </div>

        {editMode ? (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-scale">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="text"
                name="username"
                label="Username"
                value={formData.username}
                onChange={handleInputChange}
                stagger={1}
                required
              />

              <Input
                type="email"
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange}
                stagger={2}
                required
              />

              <Input
                type="tel"
                name="phoneNumber"
                label="Phone Number (optional)"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="e.g., +1234567890"
                stagger={3}
              />

              <Input
                type="text"
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                stagger={4}
                required
              />

              <Input
                type="text"
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                stagger={5}
                required
              />

              <Input
                type="number"
                name="age"
                label="Age"
                value={formData.age}
                onChange={handleInputChange}
                min="1"
                max="120"
                stagger={6}
              />

              <Input
                type="password"
                name="password"
                label="New Password (optional)"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Leave blank to keep current password"
                stagger={1}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-text-muted mb-2">
                Profile Pictures
              </label>
              <div className="flex flex-wrap gap-4 mb-4">
                {profilePictures.map((pic) => (
                  <div key={pic.id} className="relative group">
                    <img
                      src={pic.image_url.startsWith('http') ? pic.image_url : `${API_BASE_URL}${pic.image_url}`}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary cursor-pointer hover:opacity-80 transition-smooth"
                      onClick={() => {
                        setSelectedUserId(user?.id);
                        setShowGallery(true);
                      }}
                    />
                    <button
                      onClick={() => handleDeleteProfilePicture(pic.id)}
                      className="absolute -top-2 -right-2 bg-error text-error-text rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadProfilePicture}
                className="block w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-text hover:file:bg-primary-hover"
              />
              <p className="text-xs text-text-muted mt-2">
                Upload multiple profile pictures. The last uploaded picture will be shown first.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                }
              >
                Save Changes
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditMode(false);
                  setError('');
                  setSuccess('');
                  // Reset form data
                  if (user) {
                    setFormData({
                      username: user.username || '',
                      firstName: user.firstName || '',
                      lastName: user.lastName || '',
                      age: user.age || '',
                      email: user.email || '',
                      phoneNumber: user.phoneNumber || '',
                      password: '',
                      profileImage: user.profileImage || 'https://via.placeholder.com/40',
                    });
                    setImagePreview(
                      user.profileImage?.startsWith('http')
                        ? user.profileImage
                        : `${API_BASE_URL}${user.profileImage}`
                    );
                  }
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-elevated border border-border rounded-lg p-4 hover-lift transition-smooth animate-fade-in-scale stagger-1">
              <p className="text-text-muted text-sm mb-1">Username</p>
              <p className="text-text-primary text-lg font-semibold">{user?.username || 'N/A'}</p>
            </div>
            <div className="bg-surface-elevated border border-border rounded-lg p-4 hover-lift transition-smooth animate-fade-in-scale stagger-2">
              <p className="text-text-muted text-sm mb-1">Email</p>
              <p className="text-text-primary text-lg font-semibold">{user?.email || 'N/A'}</p>
            </div>
            <div className="bg-surface-elevated border border-border rounded-lg p-4 hover-lift transition-smooth animate-fade-in-scale stagger-3">
              <p className="text-text-muted text-sm mb-1">First Name</p>
              <p className="text-text-primary text-lg font-semibold">{user?.firstName || 'N/A'}</p>
            </div>
            <div className="bg-surface-elevated border border-border rounded-lg p-4 hover-lift transition-smooth animate-fade-in-scale stagger-4">
              <p className="text-text-muted text-sm mb-1">Last Name</p>
              <p className="text-text-primary text-lg font-semibold">{user?.lastName || 'N/A'}</p>
            </div>
            <div className="bg-surface-elevated border border-border rounded-lg p-4 hover-lift transition-smooth animate-fade-in-scale stagger-5">
              <p className="text-text-muted text-sm mb-1">Age</p>
              <p className="text-text-primary text-lg font-semibold">{user?.age || 'N/A'}</p>
            </div>
            <div className="bg-surface-elevated border border-border rounded-lg p-4 hover-lift transition-smooth animate-fade-in-scale stagger-6">
              <p className="text-text-muted text-sm mb-1">Phone Number</p>
              <p className="text-text-primary text-lg font-semibold">{user?.phoneNumber || 'Not set'}</p>
            </div>
            <div className="bg-surface-elevated border border-border rounded-lg p-4 hover-lift transition-smooth animate-fade-in-scale stagger-1">
              <p className="text-text-muted text-sm mb-1">Total Points</p>
              <p className="text-text-primary text-lg font-semibold">{user?.totalPoints || 0}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Profile Pictures Gallery */}
      {showGallery && selectedUserId && (
        <ProfilePictureGallery
          userId={selectedUserId}
          onClose={() => {
            setShowGallery(false);
            setSelectedUserId(null);
          }}
        />
      )}
    </div>
  );
}

export default Profile;
