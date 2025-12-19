/**
 * ResponsiveGrid Component
 * 
 * Responsive grid system for layout management with glassmorphic design.
 * Provides consistent spacing and responsive behavior across breakpoints.
 */

'use client';

import React from 'react';
import { combineClasses } from '../../lib/design-system';

export interface ResponsiveGridProps {
  children: React.ReactNode;
  columns: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * ResponsiveGrid component for consistent layout management
 * 
 * Features:
 * - Responsive column layout across breakpoints
 * - Consistent gap spacing options
 * - Maintains visual hierarchy (Requirement 1.5)
 */
export function ResponsiveGrid({
  children,
  columns,
  gap = 'md',
  className,
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8',
  };

  const gridClasses = combineClasses(
    'grid',
    `grid-cols-${columns.mobile}`,
    `md:grid-cols-${columns.tablet}`,
    `lg:grid-cols-${columns.desktop}`,
    gapClasses[gap],
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}