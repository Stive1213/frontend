import React from 'react';

/**
 * Reusable Card Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to display in the card
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.animated - Whether to apply fade-in animation
 * @param {number} props.stagger - Stagger delay (1-5)
 * @param {boolean} props.hoverLift - Whether to apply hover lift effect
 * @param {React.ReactNode} props.header - Optional header content
 * @param {React.ReactNode} props.footer - Optional footer content
 */
function Card({ 
  children, 
  className = '', 
  animated = true, 
  stagger = 0,
  hoverLift = true,
  header,
  footer 
}) {
  const baseClasses = 'bg-card-bg border border-card-border rounded-lg shadow-lg p-6';
  const animationClasses = animated 
    ? `animate-fade-in-up ${stagger > 0 ? `stagger-${stagger}` : ''}` 
    : '';
  const hoverClasses = hoverLift ? 'hover-lift transition-all-smooth' : '';
  
  return (
    <div className={`${baseClasses} ${animationClasses} ${hoverClasses} ${className}`}>
      {header && (
        <div className="mb-4 border-b border-card-border pb-4">
          {header}
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div className="mt-4 border-t border-card-border pt-4">
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;

