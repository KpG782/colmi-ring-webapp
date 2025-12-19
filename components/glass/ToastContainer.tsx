/**
 * ToastContainer Component
 * 
 * Container for managing multiple toast notifications.
 * Provides context and state management for the toast system.
 */

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastNotification, type ToastNotificationProps } from './ToastNotification';

interface Toast extends Omit<ToastNotificationProps, 'onClose'> {
  id: string;
}

interface ToastContextValue {
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

/**
 * ToastProvider component for managing toast notifications
 * 
 * Features:
 * - Centralized toast state management
 * - Automatic stacking and positioning
 * - Maximum toast limit with queue management
 */
export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { ...toast, id };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      // Limit number of toasts
      return updated.slice(0, maxToasts);
    });

    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextValue = {
    addToast,
    removeToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-0 right-0 z-50 p-4 space-y-3 pointer-events-none">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className="pointer-events-auto"
            style={{
              transform: `translateY(${index * 10}px)`,
              zIndex: 1000 - index,
            }}
          >
            <ToastNotification
              {...toast}
              onClose={removeToast}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook to access toast functionality
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * Convenience hook for common toast types
 */
export function useToastHelpers() {
  const { addToast } = useToast();

  const showSuccess = useCallback((title: string, message?: string) => {
    return addToast({ type: 'success', title, message });
  }, [addToast]);

  const showError = useCallback((title: string, message?: string) => {
    return addToast({ type: 'error', title, message, persistent: true });
  }, [addToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    return addToast({ type: 'warning', title, message });
  }, [addToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    return addToast({ type: 'info', title, message });
  }, [addToast]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}