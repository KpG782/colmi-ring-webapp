/**
 * StatusIndicator Component
 * 
 * Status indicator with pulse animation and glassmorphic styling.
 * Implements requirement 4.5 for status indicator animations.
 */

'use client';

import React from 'react';
import { getStatusIndicatorClasses, combineClasses } from '../../lib/design-system';

export interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'neutral' | 'active';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  label?: string;
  className?: string;
}

/**
 * StatusIndicator component with pulse animations
 * 
 * Features:
 * - w-3 h-3 rounded-full styling (Requirement 7.3)
 * - Pulse animation for colored dots (Requirement 4.5)
 * - Status-based color mapping (Requirements 3.2, 3.3)
 */
export function StatusIndicator({
  status,
  size = 'md',
  pulse = true,
  label,
  className,
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const statusColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    neutral: 'bg-gray-400',
    active: 'bg-purple-500', // Purple 500 for active states
  };

  const indicatorClasses = combineClasses(
    'rounded-full flex-shrink-0',
    sizeClasses[size],
    statusColors[status],
    pulse && 'animate-pulse',
    className
  );

  return (
    <div className="flex items-center gap-2">
      <div 
        className={indicatorClasses}
        aria-label={label || `Status: ${status}`}
        role="status"
      />
      {label && (
        <span className="text-sm text-gray-600">{label}</span>
      )}
    </div>
  );
}