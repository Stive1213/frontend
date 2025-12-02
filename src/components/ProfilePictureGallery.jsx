import { useState, useEffect } from 'react';
import { profilePicturesAPI } from '../services/api';

function ProfilePictureGallery({ userId, onClose }) {
  const [pictures, setPictures] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-bkzz.onrender.com';

  useEffect(() => {
    const loadPictures = async () => {
      try {
        const response = await profilePicturesAPI.getAll(userId);
        setPictures(response.data);
        if (response.data.length > 0) {
          // Start with the last uploaded picture (highest display_order)
          setCurrentIndex(0);
        }
      } catch (error) {
        console.error('Error loading profile pictures:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadPictures();
    }
  }, [userId]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : pictures.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < pictures.length - 1 ? prev + 1 : 0));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (pictures.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
        <div className="text-white">No profile pictures</div>
      </div>
    );
  }

  const currentPicture = pictures[currentIndex];
  const imageUrl = currentPicture.image_url.startsWith('http')
    ? currentPicture.image_url
    : `${API_BASE_URL}${currentPicture.image_url}`;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={onClose}>
      <div className="relative max-w-4xl w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl z-10 bg-black/50 rounded-full w-10 h-10 flex items-center justify-center"
        >
          ✕
        </button>

        {/* Previous button */}
        {pictures.length > 1 && (
          <button
            onClick={handlePrevious}
            className="absolute left-4 text-white hover:text-gray-300 text-4xl z-10 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center"
          >
            ‹
          </button>
        )}

        {/* Image */}
        <img
          src={imageUrl}
          alt={`Profile picture ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />

        {/* Next button */}
        {pictures.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 text-white hover:text-gray-300 text-4xl z-10 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center"
          >
            ›
          </button>
        )}

        {/* Indicator */}
        {pictures.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {pictures.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Counter */}
        <div className="absolute top-4 left-4 text-white bg-black/50 px-3 py-1 rounded">
          {currentIndex + 1} / {pictures.length}
        </div>
      </div>
    </div>
  );
}

export default ProfilePictureGallery;

