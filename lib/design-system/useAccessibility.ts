/**
 * Accessibility Hook
 * 
 * Custom hook for managing accessibility features and preferences.
 * Implements requirements 6.1-6.4 for accessibility standards.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  prefersReducedMotion, 
  prefersHighContrast, 
  announceToScreenReader,
  manageFocus 
} from './accessibility';

export interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'larger';
  focusVisible: boolean;
}

export interface AccessibilityActions {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  setFocus: (element: HTMLElement | null, options?: { preventScroll?: boolean; restoreFocus?: boolean }) => () => void;
  updatePreferences: (preferences: Partial<AccessibilityPreferences>) => void;
}

/**
 * Custom hook for accessibility management
 * 
 * Features:
 * - Motion preference detection and management
 * - High contrast mode support
 * - Screen reader announcements (Requirement 6.4)
 * - Focus management (Requirement 6.3)
 * - User preference persistence
 */
export function useAccessibility(): AccessibilityPreferences & AccessibilityActions {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reducedMotion: false,
    highContrast: false,
    fontSize: 'normal',
    focusVisible: true,
  });

  // Detect system preferences
  useEffect(() => {
    const updateSystemPreferences = () => {
      setPreferences(prev => ({
        ...prev,
        reducedMotion: prefersReducedMotion(),
        highContrast: prefersHighContrast(),
      }));
    };

    updateSystemPreferences();

    // Listen for changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, highContrast: e.matches }));
    };

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Load saved preferences
  useEffect(() => {
    const savedPreferences = localStorage.getItem('accessibility-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.warn('Failed to parse saved accessibility preferences:', error);
      }
    }
  }, []);

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
  }, [preferences]);

  // Apply font size preferences
  useEffect(() => {
    const root = document.documentElement;
    
    switch (preferences.fontSize) {
      case 'large':
        root.style.fontSize = '18px';
        break;
      case 'larger':
        root.style.fontSize = '20px';
        break;
      default:
        root.style.fontSize = '16px';
        break;
    }
  }, [preferences.fontSize]);

  // Apply high contrast preferences
  useEffect(() => {
    document.body.classList.toggle('high-contrast', preferences.highContrast);
  }, [preferences.highContrast]);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceToScreenReader(message, priority);
  }, []);

  const setFocus = useCallback((
    element: HTMLElement | null, 
    options?: { preventScroll?: boolean; restoreFocus?: boolean }
  ) => {
    return manageFocus(element, options);
  }, []);

  const updatePreferences = useCallback((newPreferences: Partial<AccessibilityPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  }, []);

  return {
    ...preferences,
    announce,
    setFocus,
    updatePreferences,
  };
}

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNavigation(
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowKeys?: (direction: 'up' | 'down' | 'left' | 'right') => void
) {
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        onEnter?.();
        break;
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
      case 'ArrowUp':
        event.preventDefault();
        onArrowKeys?.('up');
        break;
      case 'ArrowDown':
        event.preventDefault();
        onArrowKeys?.('down');
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onArrowKeys?.('left');
        break;
      case 'ArrowRight':
        event.preventDefault();
        onArrowKeys?.('right');
        break;
    }
  }, [onEnter, onEscape, onArrowKeys]);

  return { handleKeyDown };
}

/**
 * Hook for focus trap management
 */
export function useFocusTrap(isActive: boolean = false) {
  const [trapRef, setTrapRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !trapRef) return;

    const focusableElements = trapRef.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive, trapRef]);

  return setTrapRef;
}