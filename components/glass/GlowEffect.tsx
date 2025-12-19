/**
 * GlowEffect Component
 * 
 * Colored glow effects for enhanced visual appeal.
 * Implements colored glow effects for cards and interactive elements.
 */

'use client';

import React from 'react';
import { combineClasses } from '../../lib/design-system';

export interface GlowEffectProps {
  color?: 'blue' | 'purple' | 'emerald' | 'amber' | 'red';
  intensity?: 'low' | 'medium' | 'high';
  animated?: boolean;
  className?: string;
}

/**
 * GlowEffect component for colored shadow effects
 * 
 * Features:
 * - Colored glow effects with multiple intensities
 * - Animated glow variations
 * - Multiple color options matching design system
 */
export function GlowEffect({
  color = 'blue',
  intensity = 'medium',
  animated = false,
  className,
}: GlowEffectProps) {
  const glowColors = {
    blue: {
      low: 'shadow-blue-500/10',
      medium: 'shadow-blue-500/20',
      high: 'shadow-blue-500/30',
    },
    purple: {
      low: 'shadow-purple-500/10',
      medium: 'shadow-purple-500/20',
      high: 'shadow-purple-500/30',
    },
    emerald: {
      low: 'shadow-emerald-500/10',
      medium: 'shadow-emerald-500/20',
      high: 'shadow-emerald-500/30',
    },
    amber: {
      low: 'shadow-amber-500/10',
      medium: 'shadow-amber-500/20',
      high: 'shadow-amber-500/30',
    },
    red: {
      low: 'shadow-red-500/10',
      medium: 'shadow-red-500/20',
      high: 'shadow-red-500/30',
    },
  };

  const glowClasses = combineClasses(
    'absolute inset-0 rounded-2xl',
    'shadow-2xl',
    glowColors[color][intensity],
    animated && 'animate-pulse',
    className
  );

  return (
    <div 
      className={glowClasses}
      aria-hidden="true"
    />
  );
}