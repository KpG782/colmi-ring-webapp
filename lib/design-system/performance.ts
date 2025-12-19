/**
 * Performance Optimization Utilities
 * 
 * Utilities for optimizing glassmorphic dashboard performance.
 * Includes animation optimization, memory management, and performance monitoring.
 */

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Check if device supports high-performance animations
 */
export function supportsHighPerformanceAnimations(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }
  
  // Check device capabilities
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  // Basic performance heuristics
  const hasWebGL = !!gl;
  const hasHighDPI = window.devicePixelRatio > 1;
  const hasModernBrowser = 'IntersectionObserver' in window;
  
  return hasWebGL && hasModernBrowser;
}

/**
 * Optimize animations based on device capabilities
 */
export function getOptimizedAnimationConfig() {
  const supportsHighPerf = supportsHighPerformanceAnimations();
  
  return {
    enableBlur: supportsHighPerf,
    enableShadows: supportsHighPerf,
    enableTransforms: true,
    animationDuration: supportsHighPerf ? 200 : 100,
    maxConcurrentAnimations: supportsHighPerf ? 10 : 5,
  };
}

/**
 * Intersection Observer for lazy loading and performance
 */
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

/**
 * Memory management for component cleanup
 */
export class MemoryManager {
  private static timers: Set<NodeJS.Timeout> = new Set();
  private static intervals: Set<NodeJS.Timeout> = new Set();
  private static observers: Set<IntersectionObserver> = new Set();
  
  static setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, delay);
    
    this.timers.add(timer);
    return timer;
  }
  
  static setInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const interval = setInterval(callback, delay);
    this.intervals.add(interval);
    return interval;
  }
  
  static clearTimeout(timer: NodeJS.Timeout): void {
    clearTimeout(timer);
    this.timers.delete(timer);
  }
  
  static clearInterval(interval: NodeJS.Timeout): void {
    clearInterval(interval);
    this.intervals.delete(interval);
  }
  
  static addObserver(observer: IntersectionObserver): void {
    this.observers.add(observer);
  }
  
  static removeObserver(observer: IntersectionObserver): void {
    observer.disconnect();
    this.observers.delete(observer);
  }
  
  static cleanup(): void {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();
  
  static startMeasure(name: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-start`);
    }
  }
  
  static endMeasure(name: string): number | null {
    if (typeof performance === 'undefined') return null;
    
    try {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name, 'measure')[0];
      const duration = measure?.duration || 0;
      
      // Store metric
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      
      const metrics = this.metrics.get(name)!;
      metrics.push(duration);
      
      // Keep only last 100 measurements
      if (metrics.length > 100) {
        metrics.shift();
      }
      
      // Clean up performance entries
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);
      
      return duration;
    } catch (error) {
      console.warn('Performance measurement failed:', error);
      return null;
    }
  }
  
  static getAverageTime(name: string): number {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return 0;
    
    return metrics.reduce((sum, time) => sum + time, 0) / metrics.length;
  }
  
  static getMetrics(): Record<string, { average: number; count: number }> {
    const result: Record<string, { average: number; count: number }> = {};
    
    this.metrics.forEach((times, name) => {
      result[name] = {
        average: this.getAverageTime(name),
        count: times.length,
      };
    });
    
    return result;
  }
}

/**
 * Lazy loading utility for components
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
): React.LazyExoticComponent<T> {
  const LazyComponent = React.lazy(importFunc);
  
  if (fallback) {
    return React.lazy(async () => {
      try {
        return await importFunc();
      } catch (error) {
        console.error('Lazy component loading failed:', error);
        return { default: fallback as T };
      }
    });
  }
  
  return LazyComponent;
}

/**
 * Optimize glassmorphic effects based on performance
 */
export function getOptimizedGlassStyles(baseStyles: React.CSSProperties): React.CSSProperties {
  const config = getOptimizedAnimationConfig();
  
  const optimizedStyles: React.CSSProperties = { ...baseStyles };
  
  if (!config.enableBlur) {
    delete optimizedStyles.backdropFilter;
  }
  
  if (!config.enableShadows) {
    optimizedStyles.boxShadow = 'none';
  }
  
  return optimizedStyles;
}

// React import for lazy loading
import React from 'react';