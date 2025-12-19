/**
 * AnimatedButton Component
 * 
 * Enhanced button with advanced hover animations and micro-interactions.
 * Implements requirement 4.2 for lift effect with colored shadow.
 */

'use client';

import React, { useState } from 'react';
import { GlassButton, type GlassButtonProps } from './GlassButton';
import { combineClasses } from '../../lib/design-system';

export interface AnimatedButtonProps extends Omit<GlassButtonProps, 'className'> {
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'none';
  shadowColor?: 'blue' | 'purple' | 'emerald' | 'amber' | 'red';
  className?: string;
}

/**
 * AnimatedButton component with enhanced hover effects
 * 
 * Features:
 * - Lift effect with colored shadow (Requirement 4.2)
 * - 200ms ease-out transitions (Requirement 4.1)
 * - Multiple hover animation variants
 * - Glassmorphic styling with enhanced interactions
 */
export function AnimatedButton({
  hoverEffect = 'lift',
  shadowColor = 'blue',
  className,
  ...props
}: AnimatedButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const shadowColors = {
    blue: 'hover:shadow-blue-500/25',
    purple: 'hover:shadow-purple-500/25',
    emerald: 'hover:shadow-emerald-500/25',
    amber: 'hover:shadow-amber-500/25',
    red: 'hover:shadow-red-500/25',
  };

  const hoverEffectClasses = {
    lift: combineClasses(
      'hover:scale-105 hover:-translate-y-0.5',
      'hover:shadow-lg',
      shadowColors[shadowColor]
    ),
    glow: combineClasses(
      'hover:shadow-lg',
      shadowColors[shadowColor],
      'hover:shadow-2xl'
    ),
    scale: 'hover:scale-110',
    none: '',
  };

  const buttonClasses = combineClasses(
    'transform transition-all duration-200 ease-out',
    hoverEffectClasses[hoverEffect],
    isHovered && hoverEffect === 'glow' && 'animate-pulse',
    className
  );

  return (
    <GlassButton
      {...props}
      className={buttonClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );
}