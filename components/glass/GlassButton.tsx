/**
 * GlassButton Component
 * 
 * Glassmorphic button with hover effects and accessibility features.
 * Implements requirement 4.2 for lift effect with colored shadow.
 */

'use client';

import React from 'react';
import { getGlassButtonClasses, combineClasses } from '../../lib/design-system';

export interface GlassButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'aria-label'?: string;
}

/**
 * GlassButton component with glassmorphic styling and hover effects
 * 
 * Features:
 * - Lift effect with colored shadow on hover (Requirement 4.2)
 * - 200ms ease-out transitions (Requirement 4.1)
 * - 3px colored outline focus rings (Requirement 6.2)
 * - Full keyboard navigation support (Requirement 6.3)
 */
export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  type = 'button',
  className,
  'aria-label': ariaLabel,
}, ref) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const buttonClasses = combineClasses(
    'glass-button',
    getGlassButtonClasses(variant),
    sizeClasses[size],
    'relative',
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-2',
    disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    loading && 'cursor-wait',
    className
  );

  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-disabled={disabled || loading}
    >
      {loading && (
        <svg 
          className="animate-spin h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
});

GlassButton.displayName = 'GlassButton';