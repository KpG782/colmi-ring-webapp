/**
 * PerformanceOptimizedCard Component
 * 
 * Performance-optimized version of GlassCard with lazy loading and intersection observer.
 * Automatically adjusts effects based on device capabilities.
 */

'use client';

import React, { useState, useEffect, useRef, memo } from 'react';
import { GlassCard, type GlassCardProps } from './GlassCard';
import { 
  createIntersectionObserver, 
  getOptimizedAnimationConfig,
  MemoryManager,
  PerformanceMonitor 
} from '../../lib/design-system/performance';

interface PerformanceOptimizedCardProps extends GlassCardProps {
  lazyLoad?: boolean;
  performanceMode?: 'auto' | 'high' | 'low';
  measurePerformance?: boolean;
}

/**
 * PerformanceOptimizedCard component with automatic optimization
 * 
 * Features:
 * - Intersection observer for lazy loading
 * - Automatic performance adjustment
 * - Memory management
 * - Performance monitoring
 */
const PerformanceOptimizedCard = memo<PerformanceOptimizedCardProps>(({
  lazyLoad = true,
  performanceMode = 'auto',
  measurePerformance = false,
  children,
  className,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(!lazyLoad);
  const [isLoaded, setIsLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Performance configuration
  const animationConfig = getOptimizedAnimationConfig();
  const shouldOptimize = performanceMode === 'low' || 
    (performanceMode === 'auto' && !animationConfig.enableBlur);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (!lazyLoad || isVisible) return;

    const observer = createIntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (measurePerformance) {
              PerformanceMonitor.startMeasure('card-load');
            }
            
            setIsVisible(true);
            setIsLoaded(true);
            
            if (measurePerformance) {
              MemoryManager.setTimeout(() => {
                PerformanceMonitor.endMeasure('card-load');
              }, 100);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    if (observer && cardRef.current) {
      observer.observe(cardRef.current);
      observerRef.current = observer;
      MemoryManager.addObserver(observer);
    }

    return () => {
      if (observerRef.current) {
        MemoryManager.removeObserver(observerRef.current);
        observerRef.current = null;
      }
    };
  }, [lazyLoad, isVisible, measurePerformance]);

  // Optimized class names based on performance mode
  const optimizedClassName = React.useMemo(() => {
    let classes = className || '';
    
    if (shouldOptimize) {
      // Remove expensive effects for low-performance devices
      classes = classes
        .replace(/backdrop-blur-\w+/g, '')
        .replace(/shadow-\w+/g, 'shadow-md');
    }
    
    return classes;
  }, [className, shouldOptimize]);

  // Loading placeholder
  if (lazyLoad && !isVisible) {
    return (
      <div 
        ref={cardRef}
        className="bg-gray-100 rounded-2xl animate-pulse"
        style={{ minHeight: '200px' }}
        aria-label="Loading content..."
      />
    );
  }

  return (
    <GlassCard
      ref={cardRef}
      {...props}
      className={optimizedClassName}
      hover={!shouldOptimize && props.hover}
    >
      {children}
    </GlassCard>
  );
});

PerformanceOptimizedCard.displayName = 'PerformanceOptimizedCard';

export { PerformanceOptimizedCard };