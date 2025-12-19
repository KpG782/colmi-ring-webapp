/**
 * ErrorBoundary Component
 * 
 * React error boundary with glassmorphic styling for graceful error handling.
 * Provides fallback UI when component errors occur.
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { GlassCard } from './GlassCard';
import { AnimatedButton } from './AnimatedButton';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary component for graceful error handling
 * 
 * Features:
 * - Catches JavaScript errors in component tree
 * - Displays glassmorphic fallback UI
 * - Provides error recovery options
 * - Logs errors for debugging
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <GlassCard className="p-8 text-center max-w-md mx-auto mt-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-4">
                An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
                  <summary className="cursor-pointer font-medium text-red-800">
                    Error Details
                  </summary>
                  <pre className="text-xs text-red-700 mt-2 overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex gap-3">
              <AnimatedButton
                variant="secondary"
                onClick={this.handleRetry}
                hoverEffect="lift"
                shadowColor="blue"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </AnimatedButton>
              
              <AnimatedButton
                variant="primary"
                onClick={this.handleReload}
                hoverEffect="lift"
                shadowColor="blue"
              >
                Reload Page
              </AnimatedButton>
            </div>
          </div>
        </GlassCard>
      );
    }

    return this.props.children;
  }
}