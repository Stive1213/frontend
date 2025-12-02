import React from 'react';

/**
 * Reusable Alert Component for success/error messages
 * @param {Object} props
 * @param {string} props.type - Alert type: 'success', 'error', 'warning', 'info'
 * @param {string} props.message - Alert message
 * @param {boolean} props.animated - Whether to apply animation
 * @param {function} props.onClose - Optional close handler
 * @param {string} props.className - Additional CSS classes
 */
function Alert({ 
  type = 'info', 
  message, 
  animated = true,
  onClose,
  className = '' 
}) {
  if (!message) return null;
  
  const typeClasses = {
    success: 'bg-success text-success-text',
    error: 'bg-error text-error-text',
    warning: 'bg-warning text-warning-text',
    info: 'bg-primary text-primary-text',
  };
  
  const animationClass = animated ? 'animate-fade-in-scale transition-apple' : '';
  
  return (
    <div className={`${typeClasses[type]} p-4 rounded-lg mb-6 ${animationClass} ${className}`}>
      <div className="flex items-center justify-between">
        <p>{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 hover:opacity-70 transition-opacity"
            aria-label="Close"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default Alert;

