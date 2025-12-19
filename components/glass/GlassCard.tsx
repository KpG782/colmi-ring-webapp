/**
 * GlassCard Component
 * 
 * Core glassmorphic card component with backdrop blur, transparency,
 * and hover effects. Implements requirements 2.1-2.4 for card styling.
 */

'use client';

import React from 'react';
import { getGlassCardClasses, getGlassCardStyles, combineClasses, type GlowColor } from '../../lib/design-system';

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: GlowColor;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  'aria-label'?: string;
  role?: string;
}

/**
 * GlassCard component with glassmorphic styling
 * 
 * Features:
 * - backdrop-blur-lg with bg-white/70 transparency (Requirement 2.1)
 * - border-white/20 with rounded-2xl corners (Requirement 2.2)
 * - shadow-2xl with colored glow effects (Requirement 2.3)
 * - scale-1.02 transform on hover with increased shadow (Requirement 2.4)
 */
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(({
  children,
  className,
  hover = true,
  glow,
  size = 'md',
  onClick,
  'aria-label': ariaLabel,
  role,
}, ref) => {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const cardClasses = combineClasses(
    'glass-card',
    getGlassCardClasses(glow, hover),
    sizeClasses[size],
    onClick && 'cursor-pointer',
    'glass-focus-ring', // For accessibility focus ring
    className
  );

  const cardStyles = getGlassCardStyles(glow);

  return (
    <div
      ref={ref}
      className={cardClasses}
      style={cardStyles}
      onClick={onClick}
      aria-label={ariaLabel}
      role={role}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
});

GlassCard.displayName = 'GlassCard';