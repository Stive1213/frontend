import React from 'react';

/**
 * Reusable Input Component
 * @param {Object} props
 * @param {string} props.type - Input type (text, email, password, number, date, etc.)
 * @param {string} props.label - Label text
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.animated - Whether to apply animation
 * @param {number} props.stagger - Stagger delay (1-5)
 * @param {string} props.error - Error message to display
 */
function Input({ 
  label,
  type = 'text',
  className = '',
  animated = true,
  stagger = 0,
  error,
  ...props 
}) {
  const baseInputClasses = 'w-full p-3 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10 transition-apple placeholder:text-input-placeholder';
  const errorClasses = error ? 'border-error focus:ring-error/10' : '';
  const animationClasses = animated 
    ? `animate-fade-in-up ${stagger > 0 ? `stagger-${stagger}` : ''}` 
    : '';
  
  return (
    <div className={animationClasses}>
      {label && (
        <label className="block text-text-muted mb-2 font-medium">
          {label}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          className={`${baseInputClasses} ${errorClasses} ${className}`}
          {...props}
        />
      ) : (
        <input
          type={type}
          className={`${baseInputClasses} ${errorClasses} ${className}`}
          {...props}
        />
      )}
      {error && (
        <p className="text-error text-sm mt-1 animate-fade-in-scale">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;

