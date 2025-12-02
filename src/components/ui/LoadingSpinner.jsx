import React from 'react';

/**
 * Reusable Loading Spinner Component
 * @param {Object} props
 * @param {string} props.message - Loading message to display
 * @param {string} props.size - Spinner size: 'sm', 'md', 'lg'
 * @param {boolean} props.fullScreen - Whether to display full screen
 * @param {string} props.className - Additional CSS classes
 */
function LoadingSpinner({ 
  message = 'Loading...', 
  size = 'md',
  fullScreen = false,
  className = '' 
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };
  
  const spinner = (
    <div className={`text-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4 transition-apple ${sizeClasses[size]}`}></div>
      {message && (
        <p className="text-text-muted animate-pulse">{message}</p>
      )}
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen animate-fade-in">
        {spinner}
      </div>
    );
  }
  
  return spinner;
}

export default LoadingSpinner;

