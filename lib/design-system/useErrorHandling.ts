/**
 * Error Handling Hook
 * 
 * Custom hook for comprehensive error handling with toast notifications.
 * Provides centralized error management and user feedback.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToastHelpers } from '../../components/glass/ToastContainer';

export interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  retryCount: number;
}

export interface ErrorHandlingOptions {
  maxRetries?: number;
  showToast?: boolean;
  logErrors?: boolean;
  fallbackMessage?: string;
}

/**
 * Custom hook for error handling with automatic recovery
 * 
 * Features:
 * - Automatic error recovery with retry logic
 * - Toast notifications for user feedback
 * - Error logging and reporting
 * - Graceful degradation
 */
export function useErrorHandling(options: ErrorHandlingOptions = {}) {
  const {
    maxRetries = 3,
    showToast = true,
    logErrors = true,
    fallbackMessage = 'An unexpected error occurred. Please try again.',
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorId: null,
    retryCount: 0,
  });

  const { showError, showWarning, showSuccess } = useToastHelpers();

  // Handle errors with automatic retry logic
  const handleError = useCallback((error: Error, context?: string) => {
    const errorId = Math.random().toString(36).substr(2, 9);
    
    if (logErrors) {
      console.error(`Error in ${context || 'component'}:`, error);
    }

    setErrorState(prev => ({
      hasError: true,
      error,
      errorId,
      retryCount: prev.retryCount + 1,
    }));

    if (showToast) {
      if (errorState.retryCount < maxRetries) {
        showWarning(
          'Something went wrong',
          `${error.message || fallbackMessage} Retrying...`
        );
      } else {
        showError(
          'Error',
          error.message || fallbackMessage
        );
      }
    }

    return errorId;
  }, [errorState.retryCount, maxRetries, showToast, logErrors, fallbackMessage, showError, showWarning]);

  // Retry function
  const retry = useCallback(() => {
    if (errorState.retryCount < maxRetries) {
      setErrorState(prev => ({
        ...prev,
        hasError: false,
        error: null,
      }));
      
      if (showToast) {
        showSuccess('Retrying', 'Attempting to recover...');
      }
    }
  }, [errorState.retryCount, maxRetries, showToast, showSuccess]);

  // Clear error state
  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0,
    });
  }, []);

  // Async error wrapper
  const withErrorHandling = useCallback(
    <T extends any[], R>(
      asyncFn: (...args: T) => Promise<R>,
      context?: string
    ) => {
      return async (...args: T): Promise<R | null> => {
        try {
          const result = await asyncFn(...args);
          
          // Clear error state on success
          if (errorState.hasError) {
            clearError();
            if (showToast) {
              showSuccess('Recovered', 'Operation completed successfully');
            }
          }
          
          return result;
        } catch (error) {
          handleError(error as Error, context);
          return null;
        }
      };
    },
    [errorState.hasError, handleError, clearError, showToast, showSuccess]
  );

  // Sync error wrapper
  const withSyncErrorHandling = useCallback(
    <T extends any[], R>(
      syncFn: (...args: T) => R,
      context?: string
    ) => {
      return (...args: T): R | null => {
        try {
          const result = syncFn(...args);
          
          // Clear error state on success
          if (errorState.hasError) {
            clearError();
          }
          
          return result;
        } catch (error) {
          handleError(error as Error, context);
          return null;
        }
      };
    },
    [errorState.hasError, handleError, clearError]
  );

  // Check if should retry
  const canRetry = errorState.retryCount < maxRetries;

  return {
    // Error state
    ...errorState,
    canRetry,
    
    // Error handling functions
    handleError,
    retry,
    clearError,
    withErrorHandling,
    withSyncErrorHandling,
  };
}

/**
 * Hook for connection error handling
 */
export function useConnectionErrorHandling() {
  const [connectionState, setConnectionState] = useState<{
    isOnline: boolean;
    lastConnected: Date | null;
    reconnectAttempts: number;
  }>({
    isOnline: navigator?.onLine ?? true,
    lastConnected: new Date(),
    reconnectAttempts: 0,
  });

  const { showWarning, showSuccess, showError } = useToastHelpers();

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setConnectionState(prev => ({
        ...prev,
        isOnline: true,
        lastConnected: new Date(),
        reconnectAttempts: 0,
      }));
      
      showSuccess('Connected', 'Internet connection restored');
    };

    const handleOffline = () => {
      setConnectionState(prev => ({
        ...prev,
        isOnline: false,
      }));
      
      showWarning('Disconnected', 'Internet connection lost. Some features may not work.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showSuccess, showWarning]);

  // Handle device connection errors
  const handleDeviceConnectionError = useCallback((error: Error) => {
    setConnectionState(prev => ({
      ...prev,
      reconnectAttempts: prev.reconnectAttempts + 1,
    }));

    if (connectionState.reconnectAttempts < 3) {
      showWarning(
        'Device Connection Issue',
        'Attempting to reconnect to your device...'
      );
    } else {
      showError(
        'Connection Failed',
        'Unable to connect to device. Please check your device and try again.'
      );
    }
  }, [connectionState.reconnectAttempts, showWarning, showError]);

  return {
    ...connectionState,
    handleDeviceConnectionError,
  };
}

/**
 * Hook for form error handling
 */
export function useFormErrorHandling() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setFieldError = useCallback((field: string, error: string) => {
    setFieldErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const validateField = useCallback((
    field: string,
    value: any,
    validator: (value: any) => string | null
  ) => {
    const error = validator(value);
    if (error) {
      setFieldError(field, error);
      return false;
    } else {
      clearFieldError(field);
      return true;
    }
  }, [setFieldError, clearFieldError]);

  return {
    fieldErrors,
    isSubmitting,
    setIsSubmitting,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    validateField,
    hasErrors: Object.keys(fieldErrors).length > 0,
  };
}