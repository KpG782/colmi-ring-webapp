/**
 * AccessibleButton Component
 * 
 * Fully accessible button with WCAG AAA compliance.
 * Implements requirements 6.1-6.4 for accessibility standards.
 */

'use client';

import React, { forwardRef } from 'react';
import { GlassButton, type GlassButtonProps } from './GlassButton';
import { 
  getFocusRingClasses, 
  getKeyboardNavProps, 
  getScreenReaderProps,
  announceToScreenReader 
} from '../../lib/design-system/accessibility';
import { combineClasses } from '../../lib/design-system';

export interface AccessibleButtonProps extends Omit<GlassButtonProps, 'onClick'> {
  onClick?: () => void;
  onActivate?: () => void;
  screenReaderLabel?: string;
  description?: string;
  announceOnClick?: string;
  highContrast?: boolean;
}

/**
 * AccessibleButton component with full WCAG AAA compliance
 * 
 * Features:
 * - 3px colored outline focus rings (Requirement 6.2)
 * - Full keyboard navigation support (Requirement 6.3)
 * - Appropriate ARIA labels and screen reader support (Requirement 6.4)
 * - High contrast mode support
 * - Screen reader announcements
 */
export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    onClick,
    onActivate,
    screenReaderLabel,
    description,
    announceOnClick,
    highContrast = false,
    className,
    disabled,
    'aria-label': ariaLabel,
    ...props
  }, ref) => {
    const handleClick = () => {
      if (disabled) return;
      
      onClick?.();
      onActivate?.();
      
      if (announceOnClick) {
        announceToScreenReader(announceOnClick);
      }
    };

    const keyboardProps = getKeyboardNavProps(handleClick);
    const screenReaderProps = getScreenReaderProps(
      screenReaderLabel || ariaLabel || 'Button',
      description
    );

    const accessibleClasses = combineClasses(
      // Focus ring (Requirement 6.2)
      'focus:outline-none focus:ring-3 focus:ring-blue-500/50 focus:ring-offset-2',
      
      // High contrast support
      highContrast && 'border-2 border-current',
      
      // Ensure minimum touch target size (44px)
      'min-h-[44px] min-w-[44px]',
      
      className
    );

    return (
      <GlassButton
        ref={ref}
        {...props}
        {...keyboardProps}
        {...screenReaderProps}
        onClick={handleClick}
        disabled={disabled}
        className={accessibleClasses}
        aria-label={screenReaderLabel || ariaLabel}
        aria-describedby={description ? `desc-${screenReaderLabel}` : undefined}
      >
        {props.children}
        
        {/* Hidden description for screen readers */}
        {description && (
          <span 
            id={`desc-${screenReaderLabel}`}
            className="sr-only"
          >
            {description}
          </span>
        )}
      </GlassButton>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';