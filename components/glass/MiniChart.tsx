/**
 * MiniChart Component
 * 
 * Subtle gradient background charts for metric displays.
 * Implements requirement 7.4 for mini chart background styling.
 */

'use client';

import React from 'react';
import { combineClasses } from '../../lib/design-system';

export interface MiniChartProps {
  data?: number[];
  type?: 'area' | 'bar' | 'gradient';
  color?: 'blue' | 'purple' | 'emerald' | 'amber' | 'red';
  className?: string;
  animated?: boolean;
}

/**
 * MiniChart component with subtle gradient backgrounds
 * 
 * Features:
 * - Subtle gradient backgrounds behind metrics (Requirement 7.4)
 * - Multiple chart types and color variants
 * - Smooth animations and transitions
 */
export function MiniChart({
  data = [],
  type = 'gradient',
  color = 'blue',
  className,
  animated = true,
}: MiniChartProps) {
  const colorGradients = {
    blue: 'from-blue-500/20 via-blue-400/10 to-transparent',
    purple: 'from-purple-500/20 via-purple-400/10 to-transparent',
    emerald: 'from-emerald-500/20 via-emerald-400/10 to-transparent',
    amber: 'from-amber-500/20 via-amber-400/10 to-transparent',
    red: 'from-red-500/20 via-red-400/10 to-transparent',
  };

  const colorSolids = {
    blue: 'bg-blue-500/10',
    purple: 'bg-purple-500/10',
    emerald: 'bg-emerald-500/10',
    amber: 'bg-amber-500/10',
    red: 'bg-red-500/10',
  };

  if (type === 'gradient') {
    return (
      <div 
        className={combineClasses(
          'absolute inset-0 rounded-2xl opacity-30',
          `bg-gradient-to-br ${colorGradients[color]}`,
          animated && 'animate-pulse',
          className
        )}
        aria-hidden="true"
      />
    );
  }

  if (type === 'area' && data.length > 0) {
    const maxValue = Math.max(...data);
    const normalizedData = data.map(value => (value / maxValue) * 100);

    return (
      <div 
        className={combineClasses(
          'absolute inset-0 rounded-2xl overflow-hidden opacity-20',
          className
        )}
        aria-hidden="true"
      >
        <svg 
          className="w-full h-full" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={`var(--glass-primary-${color === 'blue' ? '500' : '500'})`} stopOpacity="0.3" />
              <stop offset="100%" stopColor={`var(--glass-primary-${color === 'blue' ? '500' : '500'})`} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`M 0,100 ${normalizedData.map((value, index) => 
              `L ${(index / (data.length - 1)) * 100},${100 - value}`
            ).join(' ')} L 100,100 Z`}
            fill={`url(#gradient-${color})`}
            className={animated ? 'animate-pulse' : ''}
          />
        </svg>
      </div>
    );
  }

  if (type === 'bar' && data.length > 0) {
    const maxValue = Math.max(...data);
    const normalizedData = data.map(value => (value / maxValue) * 100);

    return (
      <div 
        className={combineClasses(
          'absolute inset-0 rounded-2xl overflow-hidden opacity-20 flex items-end gap-1 p-2',
          className
        )}
        aria-hidden="true"
      >
        {normalizedData.map((height, index) => (
          <div
            key={index}
            className={combineClasses(
              'flex-1 rounded-sm',
              colorSolids[color],
              animated && 'animate-pulse'
            )}
            style={{ 
              height: `${height}%`,
              animationDelay: animated ? `${index * 100}ms` : undefined
            }}
          />
        ))}
      </div>
    );
  }

  // Fallback to simple gradient
  return (
    <div 
      className={combineClasses(
        'absolute inset-0 rounded-2xl opacity-10',
        colorSolids[color],
        animated && 'animate-pulse',
        className
      )}
      aria-hidden="true"
    />
  );
}