/**
 * LoadingSpinner Component
 * 
 * Glassmorphic loading spinner with shimmer animation.
 * Implements requirement 4.3 for loading state animations.
 */

'use client';

import React from 'react';
import { getShimmerClasses, combineClasses } from '../../lib/design-system';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'shimmer' | 'pulse';
  className?: string;
  'aria-label'?: string;
}

/**
 * LoadingSpinner component with glassmorphic animations
 * 
 * Features:
 * - Shimmer gradient animations (Requirement 4.3)
 * - Multiple loading variants
 * - Accessible with proper ARIA labels
 */
export function LoadingSpinner({
  size = 'md',
  variant = 'spinner',
  className,
  'aria-label': ariaLabel = 'Loading',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  if (variant === 'shimmer') {
    const shimmerSizes = {
      sm: 'h-4',
      md: 'h-6',
      lg: 'h-8',
    };

    return (
      <div 
        className={combineClasses(
          'w-full rounded-lg',
          shimmerSizes[size],
          getShimmerClasses(),
          className
        )}
        role="status"
        aria-label={ariaLabel}
      />
    );
  }

  if (variant === 'pulse') {
    return (
      <div 
        className={combineClasses(
          'rounded-full bg-gray-300 animate-pulse',
          sizeClasses[size],
          className
        )}
        role="status"
        aria-label={ariaLabel}
      />
    );
  }

  // Default spinner variant
  return (
    <div
      className={combineClasses(
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-500',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label={ariaLabel}
    >
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
}