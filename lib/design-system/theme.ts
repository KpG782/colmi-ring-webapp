/**
 * Glassmorphic Health Dashboard Theme Configuration
 * 
 * Defines the complete design system including colors, effects, animations,
 * and accessibility settings for the glassmorphic health dashboard.
 */

export interface GlassmorphicTheme {
  colors: {
    primary: {
      50: string;
      500: string;
      600: string;
      gradient: string;
    };
    accent: {
      purple: string;
      emerald: string;
      amber: string;
    };
    background: {
      gradient: string;
      glass: string;
    };
    text: {
      heading: string;
      body: string;
      muted: string;
    };
    border: {
      glass: string;
      focus: string;
    };
  };
  effects: {
    blur: {
      sm: string;
      md: string;
      lg: string;
    };
    shadow: {
      glass: string;
      glow: Record<string, string>;
    };
  };
  animation: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      smooth: string;
      bounce: string;
    };
  };
}

export interface AnimationConfig {
  transitions: {
    card: string;
    button: string;
    sidebar: string;
    tab: string;
  };
  keyframes: {
    shimmer: string;
    pulse: string;
    slideIn: string;
    fadeIn: string;
  };
}

export interface AccessibilityConfig {
  focusRing: {
    width: string;
    color: string;
    offset: string;
  };
  contrast: {
    minimum: number;
    enhanced: number;
  };
  motion: {
    respectsReducedMotion: boolean;
    fallbackDuration: string;
  };
}

/**
 * Main glassmorphic theme configuration
 * Based on requirements 3.1-3.5 for color palette and visual design
 */
export const glassmorphicTheme: GlassmorphicTheme = {
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    },
    accent: {
      purple: '#8b5cf6', // Purple 500 for active states
      emerald: '#10b981', // Emerald 500 for success
      amber: '#f59e0b',   // Amber 500 for warning
    },
    background: {
      gradient: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)', // slate-50 to blue-50
      glass: 'rgba(255, 255, 255, 0.7)', // bg-white/70
    },
    text: {
      heading: '#111827', // gray-900
      body: '#4b5563',    // gray-600
      muted: '#9ca3af',   // gray-400
    },
    border: {
      glass: 'rgba(255, 255, 255, 0.2)', // border-white/20
      focus: '#3b82f6', // blue-500 for focus rings
    },
  },
  effects: {
    blur: {
      sm: 'blur(4px)',
      md: 'blur(8px)',
      lg: 'blur(16px)', // backdrop-blur-lg
    },
    shadow: {
      glass: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // shadow-2xl
      glow: {
        blue: '0 0 20px rgba(59, 130, 246, 0.1)',
        purple: '0 0 20px rgba(139, 92, 246, 0.1)',
        emerald: '0 0 20px rgba(16, 185, 129, 0.1)',
        amber: '0 0 20px rgba(245, 158, 11, 0.1)',
      },
    },
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms', // 200ms ease-out for interactions
      slow: '300ms',
    },
    easing: {
      smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)', // ease-out
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
};

/**
 * Animation configuration for consistent micro-interactions
 * Based on requirement 4.1 for 200ms ease-out transitions
 */
export const animationConfig: AnimationConfig = {
  transitions: {
    card: `transform ${glassmorphicTheme.animation.duration.normal} ${glassmorphicTheme.animation.easing.smooth}, box-shadow ${glassmorphicTheme.animation.duration.normal} ${glassmorphicTheme.animation.easing.smooth}`,
    button: `all ${glassmorphicTheme.animation.duration.normal} ${glassmorphicTheme.animation.easing.smooth}`,
    sidebar: `transform ${glassmorphicTheme.animation.duration.slow} ${glassmorphicTheme.animation.easing.smooth}`,
    tab: `all ${glassmorphicTheme.animation.duration.normal} ${glassmorphicTheme.animation.easing.smooth}`,
  },
  keyframes: {
    shimmer: `
      @keyframes shimmer {
        0% { background-position: -200px 0; }
        100% { background-position: calc(200px + 100%) 0; }
      }
    `,
    pulse: `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `,
    slideIn: `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `,
    fadeIn: `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `,
  },
};

/**
 * Accessibility configuration for WCAG AAA compliance
 * Based on requirement 6.1-6.4 for accessibility standards
 */
export const accessibilityConfig: AccessibilityConfig = {
  focusRing: {
    width: '3px', // 3px colored outline
    color: glassmorphicTheme.colors.border.focus,
    offset: '2px',
  },
  contrast: {
    minimum: 4.5, // WCAG AA
    enhanced: 7.0, // WCAG AAA
  },
  motion: {
    respectsReducedMotion: true,
    fallbackDuration: '0ms',
  },
};

/**
 * CSS custom properties for the glassmorphic theme
 * These will be injected into the global CSS
 */
export const cssCustomProperties = {
  // Colors
  '--glass-primary-50': glassmorphicTheme.colors.primary[50],
  '--glass-primary-500': glassmorphicTheme.colors.primary[500],
  '--glass-primary-600': glassmorphicTheme.colors.primary[600],
  '--glass-primary-gradient': glassmorphicTheme.colors.primary.gradient,
  '--glass-accent-purple': glassmorphicTheme.colors.accent.purple,
  '--glass-accent-emerald': glassmorphicTheme.colors.accent.emerald,
  '--glass-accent-amber': glassmorphicTheme.colors.accent.amber,
  '--glass-bg-gradient': glassmorphicTheme.colors.background.gradient,
  '--glass-bg-glass': glassmorphicTheme.colors.background.glass,
  '--glass-text-heading': glassmorphicTheme.colors.text.heading,
  '--glass-text-body': glassmorphicTheme.colors.text.body,
  '--glass-text-muted': glassmorphicTheme.colors.text.muted,
  '--glass-border-glass': glassmorphicTheme.colors.border.glass,
  '--glass-border-focus': glassmorphicTheme.colors.border.focus,
  
  // Effects
  '--glass-blur-sm': glassmorphicTheme.effects.blur.sm,
  '--glass-blur-md': glassmorphicTheme.effects.blur.md,
  '--glass-blur-lg': glassmorphicTheme.effects.blur.lg,
  '--glass-shadow-glass': glassmorphicTheme.effects.shadow.glass,
  '--glass-shadow-glow-blue': glassmorphicTheme.effects.shadow.glow.blue,
  '--glass-shadow-glow-purple': glassmorphicTheme.effects.shadow.glow.purple,
  '--glass-shadow-glow-emerald': glassmorphicTheme.effects.shadow.glow.emerald,
  '--glass-shadow-glow-amber': glassmorphicTheme.effects.shadow.glow.amber,
  
  // Animation
  '--glass-duration-fast': glassmorphicTheme.animation.duration.fast,
  '--glass-duration-normal': glassmorphicTheme.animation.duration.normal,
  '--glass-duration-slow': glassmorphicTheme.animation.duration.slow,
  '--glass-easing-smooth': glassmorphicTheme.animation.easing.smooth,
  '--glass-easing-bounce': glassmorphicTheme.animation.easing.bounce,
  
  // Accessibility
  '--glass-focus-width': accessibilityConfig.focusRing.width,
  '--glass-focus-color': accessibilityConfig.focusRing.color,
  '--glass-focus-offset': accessibilityConfig.focusRing.offset,
};