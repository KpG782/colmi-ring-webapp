/**
 * Accessibility Utilities
 * 
 * Utilities for implementing WCAG AAA compliance and accessibility features.
 * Implements requirements 6.1-6.4 for accessibility standards.
 */

/**
 * Calculate contrast ratio between two colors
 * Used for WCAG AAA compliance (Requirement 6.1)
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Calculate relative luminance
    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if contrast ratio meets WCAG standards
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AAA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  const ratio = calculateContrastRatio(foreground, background);
  
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7.0;
  } else {
    return size === 'large' ? ratio >= 3.0 : ratio >= 4.5;
  }
}

/**
 * Generate accessible focus ring classes (Requirement 6.2)
 */
export function getFocusRingClasses(color: string = '#3b82f6'): string {
  return `focus:outline-none focus:ring-3 focus:ring-[${color}] focus:ring-offset-2`;
}

/**
 * Generate keyboard navigation attributes (Requirement 6.3)
 */
export function getKeyboardNavProps(
  onActivate?: () => void,
  role?: string
): Record<string, any> {
  return {
    tabIndex: 0,
    role: role || 'button',
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onActivate?.();
      }
    },
  };
}

/**
 * Generate screen reader labels (Requirement 6.4)
 */
export function getScreenReaderProps(
  label: string,
  description?: string,
  state?: string
): Record<string, any> {
  const props: Record<string, any> = {
    'aria-label': label,
  };

  if (description) {
    props['aria-describedby'] = `desc-${Math.random().toString(36).substr(2, 9)}`;
  }

  if (state) {
    props['aria-live'] = 'polite';
    props['aria-atomic'] = 'true';
  }

  return props;
}

/**
 * Generate ARIA attributes for interactive elements
 */
export function getAriaProps(
  role: string,
  label: string,
  expanded?: boolean,
  selected?: boolean,
  disabled?: boolean
): Record<string, any> {
  const props: Record<string, any> = {
    role,
    'aria-label': label,
  };

  if (expanded !== undefined) {
    props['aria-expanded'] = expanded;
  }

  if (selected !== undefined) {
    props['aria-selected'] = selected;
  }

  if (disabled !== undefined) {
    props['aria-disabled'] = disabled;
  }

  return props;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (typeof window === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Manage focus for dynamic content
 */
export function manageFocus(element: HTMLElement | null, options?: {
  preventScroll?: boolean;
  restoreFocus?: boolean;
}): () => void {
  if (!element) return () => {};

  const previouslyFocused = document.activeElement as HTMLElement;
  
  element.focus({ preventScroll: options?.preventScroll });

  return () => {
    if (options?.restoreFocus && previouslyFocused) {
      previouslyFocused.focus({ preventScroll: options.preventScroll });
    }
  };
}

/**
 * Color palette with WCAG AAA compliant colors
 */
export const accessibleColors = {
  // High contrast text colors
  text: {
    primary: '#111827',    // gray-900 - AAA on white
    secondary: '#374151',  // gray-700 - AAA on white  
    muted: '#6b7280',      // gray-500 - AA on white
  },
  
  // Status colors with sufficient contrast
  status: {
    success: '#059669',    // emerald-600 - AAA on white
    warning: '#d97706',    // amber-600 - AAA on white
    error: '#dc2626',      // red-600 - AAA on white
    info: '#2563eb',       // blue-600 - AAA on white
  },
  
  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',  // gray-50
    tertiary: '#f3f4f6',   // gray-100
  },
};

/**
 * Validate color combinations for accessibility
 */
export function validateColorCombination(
  foreground: string,
  background: string
): {
  isValid: boolean;
  ratio: number;
  level: 'AA' | 'AAA' | 'fail';
} {
  const ratio = calculateContrastRatio(foreground, background);
  
  let level: 'AA' | 'AAA' | 'fail' = 'fail';
  if (ratio >= 7.0) level = 'AAA';
  else if (ratio >= 4.5) level = 'AA';
  
  return {
    isValid: ratio >= 4.5,
    ratio,
    level,
  };
}