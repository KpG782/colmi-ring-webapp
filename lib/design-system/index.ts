/**
 * Glassmorphic Design System - Main Export File
 * 
 * Centralized exports for the complete glassmorphic design system
 * including theme, utilities, components, and hooks.
 */

// Theme and configuration
export * from './theme';
export * from './ThemeProvider';

// Utility functions and classes
export * from './glass-utilities';

// Accessibility utilities
export * from './accessibility';
export * from './useAccessibility';

// Performance utilities
export * from './performance';

// Error handling utilities
export * from './useErrorHandling';

// Type definitions
export type {
  GlassmorphicTheme,
  AnimationConfig,
  AccessibilityConfig,
} from './theme';

export type {
  GlowColor,
  GlassSize,
} from './glass-utilities';