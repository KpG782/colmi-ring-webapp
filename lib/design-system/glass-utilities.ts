/**
 * Glassmorphic Utility Functions and CSS Classes
 * 
 * Provides utility functions and class generators for consistent
 * glassmorphic styling across all components.
 */

import { glassmorphicTheme } from './theme';

export type GlowColor = 'blue' | 'purple' | 'emerald' | 'amber' | 'red';
export type GlassSize = 'sm' | 'md' | 'lg';

/**
 * Generates glassmorphic card classes based on requirements 2.1-2.3
 * - backdrop-blur-lg with bg-white/70 transparency
 * - border-white/20 with rounded-2xl corners  
 * - shadow-2xl with colored glow effects
 */
export const getGlassCardClasses = (glow?: GlowColor, hover: boolean = true): string => {
  const baseClasses = [
    'backdrop-blur-lg',
    'bg-white/70',
    'border',
    'border-white/20',
    'rounded-2xl',
    'shadow-2xl',
  ];

  if (hover) {
    baseClasses.push(
      'transition-all',
      'duration-200',
      'ease-out',
      'hover:scale-[1.02]',
      'hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.35)]'
    );
  }

  return baseClasses.join(' ');
};

/**
 * Generates CSS styles for glassmorphic cards with glow effects
 */
export const getGlassCardStyles = (glow?: GlowColor) => {
  const baseStyles: React.CSSProperties = {
    backdropFilter: glassmorphicTheme.effects.blur.lg,
    backgroundColor: glassmorphicTheme.colors.background.glass,
    border: `1px solid ${glassmorphicTheme.colors.border.glass}`,
    borderRadius: '1rem', // rounded-2xl
    boxShadow: glassmorphicTheme.effects.shadow.glass,
  };

  if (glow) {
    baseStyles.boxShadow = `${glassmorphicTheme.effects.shadow.glass}, ${glassmorphicTheme.effects.shadow.glow[glow]}`;
  }

  return baseStyles;
};

/**
 * Generates button classes with glassmorphic styling and hover effects
 * Based on requirement 4.2 for lift effect with colored shadow
 */
export const getGlassButtonClasses = (variant: 'primary' | 'secondary' | 'accent' = 'primary'): string => {
  const baseClasses = [
    'backdrop-blur-lg',
    'border',
    'border-white/20',
    'rounded-xl',
    'px-4',
    'py-2',
    'font-medium',
    'transition-all',
    'duration-200',
    'ease-out',
    'hover:scale-105',
    'hover:shadow-lg',
    'focus:outline-none',
    'focus:ring-3',
    'focus:ring-blue-500/50',
    'focus:ring-offset-2',
  ];

  switch (variant) {
    case 'primary':
      baseClasses.push(
        'bg-gradient-to-r',
        'from-blue-500',
        'to-blue-600',
        'text-white',
        'hover:from-blue-600',
        'hover:to-blue-700',
        'hover:shadow-blue-500/25'
      );
      break;
    case 'secondary':
      baseClasses.push(
        'bg-white/70',
        'text-gray-900',
        'hover:bg-white/80',
        'hover:shadow-gray-500/25'
      );
      break;
    case 'accent':
      baseClasses.push(
        'bg-purple-500',
        'text-white',
        'hover:bg-purple-600',
        'hover:shadow-purple-500/25'
      );
      break;
  }

  return baseClasses.join(' ');
};

/**
 * Generates metric display classes based on requirement 7.1-7.2
 * - text-5xl font-bold for primary values
 * - text-sm uppercase tracking-wide for labels
 */
export const getMetricValueClasses = (): string => {
  return 'text-5xl font-bold text-gray-900';
};

export const getMetricLabelClasses = (): string => {
  return 'text-sm uppercase tracking-wide text-gray-500';
};

/**
 * Generates status indicator classes based on requirement 7.3
 * - w-3 h-3 rounded-full with pulse animation
 */
export const getStatusIndicatorClasses = (status: 'success' | 'warning' | 'error' | 'neutral' = 'neutral'): string => {
  const baseClasses = ['w-3', 'h-3', 'rounded-full', 'animate-pulse'];

  switch (status) {
    case 'success':
      baseClasses.push('bg-emerald-500');
      break;
    case 'warning':
      baseClasses.push('bg-amber-500');
      break;
    case 'error':
      baseClasses.push('bg-red-500');
      break;
    case 'neutral':
      baseClasses.push('bg-gray-400');
      break;
  }

  return baseClasses.join(' ');
};

/**
 * Generates floating navigation classes based on requirement 5.1-5.2
 * - Glass effect styling with bg-white/90 for active tabs
 */
export const getFloatingNavClasses = (): string => {
  return [
    'backdrop-blur-lg',
    'bg-white/80',
    'border',
    'border-white/20',
    'rounded-2xl',
    'shadow-lg',
    'shadow-blue-500/10',
    'p-3',
    'mb-2', // Add consistent bottom margin
  ].join(' ');
};

export const getNavTabClasses = (isActive: boolean): string => {
  const baseClasses = [
    'flex',
    'items-center',
    'gap-2',
    'px-4',
    'py-2',
    'rounded-xl',
    'font-medium',
    'transition-all',
    'duration-200',
    'ease-out',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500/50',
  ];

  if (isActive) {
    baseClasses.push(
      'bg-white/90',
      'text-blue-600',
      'shadow-md',
      'shadow-blue-500/10'
    );
  } else {
    baseClasses.push(
      'text-gray-600',
      'hover:bg-white/50',
      'hover:text-gray-900'
    );
  }

  return baseClasses.join(' ');
};

/**
 * Generates sidebar classes with glassmorphic styling
 * Based on requirement 1.1-1.2 for collapsible navigation
 */
export const getSidebarClasses = (isCollapsed: boolean): string => {
  const baseClasses = [
    'fixed',
    'left-0',
    'top-0',
    'h-full',
    'backdrop-blur-lg',
    'bg-white/80',
    'border-r',
    'border-white/20',
    'shadow-2xl',
    'transition-transform',
    'duration-300',
    'ease-out',
    'z-50',
  ];

  if (isCollapsed) {
    baseClasses.push('-translate-x-full', 'lg:translate-x-0', 'lg:w-16');
  } else {
    baseClasses.push('translate-x-0', 'w-64');
  }

  return baseClasses.join(' ');
};

/**
 * Generates main content layout classes based on requirement 1.3
 * - max-width-7xl with appropriate padding
 */
export const getMainContentClasses = (sidebarCollapsed: boolean): string => {
  const baseClasses = [
    'min-h-screen',
    'max-w-7xl',
    'mx-auto',
    'px-4',
    'py-6',
    'md:px-6',
    'md:py-8',
    'lg:px-8',
    'transition-all',
    'duration-300',
    'ease-out',
  ];

  if (!sidebarCollapsed) {
    baseClasses.push('lg:ml-64');
  } else {
    baseClasses.push('lg:ml-16');
  }

  return baseClasses.join(' ');
};

/**
 * Generates shimmer loading animation classes based on requirement 4.3
 */
export const getShimmerClasses = (): string => {
  return [
    'animate-pulse',
    'bg-gradient-to-r',
    'from-gray-200',
    'via-gray-300',
    'to-gray-200',
    'bg-[length:200px_100%]',
    'animate-[shimmer_2s_infinite]',
  ].join(' ');
};

/**
 * Utility function to combine classes with proper deduplication
 */
export const combineClasses = (...classes: (string | undefined | null | false)[]): string => {
  return classes
    .filter(Boolean)
    .join(' ')
    .split(' ')
    .filter((cls, index, arr) => arr.indexOf(cls) === index)
    .join(' ');
};

/**
 * Responsive breakpoint utilities
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Media query helpers for responsive design
 */
export const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
} as const;