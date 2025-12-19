/**
 * VisualEnhancement Component
 * 
 * Visual enhancement utilities for consistent spacing and alignment.
 * Implements requirement 7.5 for metric card layout consistency.
 */

'use client';

import React from 'react';
import { combineClasses } from '../../lib/design-system';

export interface VisualEnhancementProps {
  children: React.ReactNode;
  spacing?: 'tight' | 'normal' | 'loose';
  alignment?: 'left' | 'center' | 'right';
  direction?: 'row' | 'column';
  className?: string;
}

/**
 * VisualEnhancement component for consistent layout
 * 
 * Features:
 * - Consistent spacing and alignment (Requirement 7.5)
 * - Flexible layout directions
 * - Responsive spacing options
 */
export function VisualEnhancement({
  children,
  spacing = 'normal',
  alignment = 'left',
  direction = 'column',
  className,
}: VisualEnhancementProps) {
  const spacingClasses = {
    tight: direction === 'row' ? 'gap-2' : 'space-y-2',
    normal: direction === 'row' ? 'gap-4' : 'space-y-4',
    loose: direction === 'row' ? 'gap-6' : 'space-y-6',
  };

  const alignmentClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  };

  const directionClasses = {
    row: 'flex flex-row',
    column: 'flex flex-col',
  };

  const containerClasses = combineClasses(
    directionClasses[direction],
    alignmentClasses[alignment],
    spacingClasses[spacing],
    className
  );

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
}

/**
 * MetricGrid component for consistent metric card layouts
 */
export interface MetricGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MetricGrid({
  children,
  columns = 2,
  gap = 'md',
  className,
}: MetricGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-3 md:gap-4',
    md: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8',
  };

  const gridClasses = combineClasses(
    'grid',
    columnClasses[columns],
    gapClasses[gap],
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}

/**
 * CardSection component for consistent card internal layout
 */
export interface CardSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  spacing?: 'tight' | 'normal' | 'loose';
  className?: string;
}

export function CardSection({
  children,
  title,
  subtitle,
  action,
  spacing = 'normal',
  className,
}: CardSectionProps) {
  const spacingClasses = {
    tight: 'space-y-2',
    normal: 'space-y-4',
    loose: 'space-y-6',
  };

  return (
    <div className={combineClasses(spacingClasses[spacing], className)}>
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0 ml-4">
              {action}
            </div>
          )}
        </div>
      )}
      <div>
        {children}
      </div>
    </div>
  );
}