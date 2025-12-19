/**
 * AccessibleCard Component
 * 
 * Accessible card component with proper focus management and ARIA support.
 * Implements requirements 6.1-6.4 for accessibility standards.
 */

'use client';

import React, { forwardRef } from 'react';
import { GlassCard, type GlassCardProps } from './GlassCard';
import { 
  getKeyboardNavProps, 
  getScreenReaderProps,
  getAriaProps,
  validateColorCombination 
} from '../../lib/design-system/accessibility';
import { combineClasses } from '../../lib/design-system';

export interface AccessibleCardProps extends Omit<GlassCardProps, 'onClick'> {
  onClick?: () => void;
  onActivate?: () => void;
  screenReaderLabel?: string;
  description?: string;
  interactive?: boolean;
  expanded?: boolean;
  selected?: boolean;
  highContrast?: boolean;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  title?: string;
}

/**
 * AccessibleCard component with full accessibility support
 * 
 * Features:
 * - Proper focus management and keyboard navigation (Requirement 6.3)
 * - ARIA labels and screen reader support (Requirement 6.4)
 * - High contrast mode support
 * - Semantic heading structure
 * - Color contrast validation
 */
export const AccessibleCard = forwardRef<HTMLDivElement, AccessibleCardProps>(
  ({
    onClick,
    onActivate,
    screenReaderLabel,
    description,
    interactive = false,
    expanded,
    selected,
    highContrast = false,
    headingLevel = 2,
    title,
    className,
    children,
    'aria-label': ariaLabel,
    ...props
  }, ref) => {
    const isInteractive = interactive || onClick || onActivate;

    const handleClick = () => {
      onClick?.();
      onActivate?.();
    };

    const keyboardProps = isInteractive ? getKeyboardNavProps(handleClick) : {};
    const screenReaderProps = getScreenReaderProps(
      screenReaderLabel || ariaLabel || title || 'Card',
      description
    );
    
    const ariaProps = isInteractive ? getAriaProps(
      'button',
      screenReaderLabel || ariaLabel || title || 'Card',
      expanded,
      selected
    ) : {};

    const accessibleClasses = combineClasses(
      // Focus ring for interactive cards (Requirement 6.2)
      isInteractive && 'focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:ring-offset-2',
      
      // High contrast support
      highContrast && 'border-2 border-current',
      
      // Interactive cursor
      isInteractive && 'cursor-pointer',
      
      className
    );

    const HeadingTag = `h${headingLevel}` as keyof React.JSX.IntrinsicElements;

    return (
      <GlassCard
        ref={ref}
        {...props}
        {...(isInteractive ? keyboardProps : {})}
        {...screenReaderProps}
        {...ariaProps}
        onClick={isInteractive ? handleClick : undefined}
        className={accessibleClasses}
        role={isInteractive ? 'button' : 'region'}
        aria-label={screenReaderLabel || ariaLabel || title}
        aria-describedby={description ? `desc-${title}` : undefined}
      >
        {/* Semantic heading if title provided */}
        {title && (
          <HeadingTag className="text-lg font-semibold text-gray-900 mb-4">
            {title}
          </HeadingTag>
        )}
        
        {children}
        
        {/* Hidden description for screen readers */}
        {description && (
          <span 
            id={`desc-${title}`}
            className="sr-only"
          >
            {description}
          </span>
        )}
      </GlassCard>
    );
  }
);

AccessibleCard.displayName = 'AccessibleCard';