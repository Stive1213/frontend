import React from 'react';

/**
 * Reusable Button Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.variant - Button variant: 'primary', 'secondary', 'success', 'error', 'ghost'
 * @param {string} props.size - Button size: 'sm', 'md', 'lg'
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.animated - Whether to apply animation
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {React.ReactNode} props.icon - Optional icon element
 * @param {string} props.iconPosition - Icon position: 'left' or 'right'
 */
function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  animated = true,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  ...props 
}) {
  const baseClasses = 'rounded-lg font-medium flex items-center justify-center gap-2 transition-apple btn-press hover-scale shadow-md hover:shadow-lg';
  
  const variantClasses = {
    primary: 'bg-primary text-primary-text hover:bg-primary-hover',
    secondary: 'bg-secondary text-secondary-text hover:bg-secondary-hover',
    success: 'bg-success text-success-text hover:bg-success-hover',
    error: 'bg-error text-error-text hover:bg-error-hover',
    ghost: 'bg-transparent border border-border text-text-primary hover:bg-surface-hover',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const animationClass = animated ? 'animate-fade-in-scale' : '';
  
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${animationClass} ${className}`;
  
  return (
    <button className={buttonClasses} {...props}>
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </button>
  );
}

export default Button;

