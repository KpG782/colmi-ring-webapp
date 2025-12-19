/**
 * Glassmorphic Theme Provider
 * 
 * Provides theme context and injects CSS custom properties
 * for consistent design token access across the application.
 */

'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { glassmorphicTheme, cssCustomProperties, accessibilityConfig, type GlassmorphicTheme } from './theme';

interface ThemeContextValue {
  theme: GlassmorphicTheme;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultDarkMode?: boolean;
}

/**
 * Theme Provider component that manages glassmorphic theme state
 * and injects CSS custom properties into the document
 */
export function ThemeProvider({ children, defaultDarkMode = false }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = React.useState(defaultDarkMode);

  // Inject CSS custom properties into the document
  useEffect(() => {
    const root = document.documentElement;
    
    // Inject all CSS custom properties
    Object.entries(cssCustomProperties).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Add glassmorphic keyframes to the document
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes shimmer {
        0% { background-position: -200px 0; }
        100% { background-position: calc(200px + 100%) 0; }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Reduced motion support for accessibility */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: ${accessibilityConfig.motion.fallbackDuration} !important;
          animation-iteration-count: 1 !important;
          transition-duration: ${accessibilityConfig.motion.fallbackDuration} !important;
        }
      }

      /* Focus ring styles for accessibility */
      .glass-focus-ring:focus {
        outline: ${accessibilityConfig.focusRing.width} solid ${accessibilityConfig.focusRing.color};
        outline-offset: ${accessibilityConfig.focusRing.offset};
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .glass-card {
          border-width: 2px;
          border-color: currentColor;
        }
      }
    `;
    
    document.head.appendChild(styleSheet);

    // Cleanup function
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Apply background gradient to body
  useEffect(() => {
    document.body.style.background = glassmorphicTheme.colors.background.gradient;
    document.body.style.minHeight = '100vh';
    
    return () => {
      document.body.style.background = '';
      document.body.style.minHeight = '';
    };
  }, []);

  const toggleDarkMode = React.useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const contextValue: ThemeContextValue = {
    theme: glassmorphicTheme,
    isDarkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access the glassmorphic theme context
 */
export function useGlassTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useGlassTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Hook to get CSS custom property values
 */
export function useCSSCustomProperty(property: keyof typeof cssCustomProperties): string {
  return cssCustomProperties[property];
}

/**
 * Hook to check if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to check if user prefers high contrast
 */
export function usePrefersHighContrast(): boolean {
  const [prefersHighContrast, setPrefersHighContrast] = React.useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersHighContrast;
}