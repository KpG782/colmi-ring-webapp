/**
 * ToastNotification Component
 * 
 * Toast notification system with glassmorphic styling and animations.
 * Implements requirements 8.1, 8.2, 8.4, 8.5 for toast notifications.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { AnimatedButton } from './AnimatedButton';
import { combineClasses } from '../../lib/design-system';

export interface ToastNotificationProps {
  id: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  onClose?: (id: string) => void;
  className?: string;
}

/**
 * ToastNotification component with glassmorphic styling
 * 
 * Features:
 * - Slide in from top-right animation (Requirement 8.1)
 * - Glass effect styling consistent with design system (Requirement 8.2)
 * - Clear error messages with appropriate styling (Requirement 8.4)
 * - Smooth fade-out animations for auto-dismiss (Requirement 8.5)
 */
export function ToastNotification({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  persistent = false,
  onClose,
  className,
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Auto-dismiss functionality
  useEffect(() => {
    if (persistent) return;

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, persistent]);

  const handleClose = () => {
    setIsExiting(true);
    // Wait for animation to complete before calling onClose
    setTimeout(() => {
      onClose?.(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'border-emerald-200/50 bg-emerald-50/30';
      case 'warning':
        return 'border-amber-200/50 bg-amber-50/30';
      case 'error':
        return 'border-red-200/50 bg-red-50/30';
      default:
        return 'border-blue-200/50 bg-blue-50/30';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={combineClasses(
        'fixed top-4 right-4 z-50 max-w-sm w-full',
        'transform transition-all duration-300 ease-out',
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100 slide-in-right',
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <GlassCard 
        className={combineClasses(
          'p-4 shadow-lg',
          getTypeStyles()
        )}
        hover={false}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {title}
            </h4>
            {message && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {message}
              </p>
            )}
          </div>

          {/* Close Button */}
          <AnimatedButton
            variant="secondary"
            size="sm"
            onClick={handleClose}
            className="flex-shrink-0 p-1 bg-transparent hover:bg-white/50 border-none"
            aria-label="Close notification"
          >
            <X className="w-4 h-4 text-gray-500" />
          </AnimatedButton>
        </div>

        {/* Progress bar for auto-dismiss */}
        {!persistent && (
          <div className="mt-3 w-full bg-white/30 rounded-full h-1 overflow-hidden">
            <div 
              className={combineClasses(
                'h-full rounded-full transition-all ease-linear',
                type === 'success' ? 'bg-emerald-500' :
                type === 'warning' ? 'bg-amber-500' :
                type === 'error' ? 'bg-red-500' : 'bg-blue-500'
              )}
              style={{
                width: '100%',
                animation: `shrink ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </GlassCard>
    </div>
  );
}