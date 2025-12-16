'use client';

import React, { useState } from 'react';
import { Bluetooth, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { ColmiRingService } from '../lib/colmi-ring-service';
import { RingConnectorProps, ConnectionStatus, ConnectionError } from '../lib/types';

/**
 * RingConnector Component
 * 
 * Handles Colmi ring device pairing and connection establishment.
 * Provides user interface for initiating connections and displays
 * connection status with appropriate feedback.
 */
export function RingConnector({ onConnect }: RingConnectorProps) {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [error, setError] = useState<ConnectionError | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  // Check browser compatibility on component mount
  React.useEffect(() => {
    if (!navigator.bluetooth) {
      setIsSupported(false);
      setError({
        message: 'Web Bluetooth is not supported in this browser',
        troubleshooting: 'Please use Chrome, Edge, or another Chromium-based browser with Web Bluetooth support.'
      });
    }
  }, []);

  /**
   * Initiates connection to Colmi ring device
   */
  const handleConnect = async () => {
    if (!isSupported) return;

    setStatus('connecting');
    setError(null);

    try {
      const ringService = new ColmiRingService();
      const connected = await ringService.connect();

      if (connected) {
        setStatus('connected');
        onConnect(ringService);
      } else {
        throw new Error('Failed to establish connection');
      }
    } catch (err) {
      setStatus('error');
      
      // Provide user-friendly error messages based on error type
      if (err instanceof Error) {
        if (err.message.includes('User cancelled')) {
          setError({
            message: 'Connection cancelled',
            troubleshooting: 'Please try again and select your Colmi ring from the device list.'
          });
        } else if (err.message.includes('not supported')) {
          setError({
            message: 'Web Bluetooth not supported',
            troubleshooting: 'Please use Chrome, Edge, or another Chromium-based browser.'
          });
        } else if (err.message.includes('not found')) {
          setError({
            message: 'Colmi ring not found',
            troubleshooting: 'Make sure your ring is charged, nearby, and not connected to another device.'
          });
        } else {
          setError({
            message: 'Connection failed',
            troubleshooting: 'Please ensure your ring is charged and within range, then try again.'
          });
        }
      } else {
        setError({
          message: 'Unknown connection error',
          troubleshooting: 'Please try again or restart your browser.'
        });
      }
    }
  };

  /**
   * Resets connection state to allow retry
   */
  const handleRetry = () => {
    setStatus('idle');
    setError(null);
  };

  /**
   * Renders the appropriate icon based on connection status
   */
  const renderStatusIcon = () => {
    switch (status) {
      case 'connecting':
        return <Loader2 className="h-6 w-6 animate-spin" />;
      case 'connected':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Bluetooth className="h-6 w-6" />;
    }
  };

  /**
   * Gets the button text based on current status
   */
  const getButtonText = () => {
    switch (status) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Retry Connection';
      default:
        return 'Connect Ring';
    }
  };

  /**
   * Determines if the connect button should be disabled
   */
  const isButtonDisabled = () => {
    return !isSupported || status === 'connecting' || status === 'connected';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            {renderStatusIcon()}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Colmi Ring Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Connect your Colmi smart ring to view health data
          </p>
        </div>

        {/* Connection Button */}
        <button
          onClick={status === 'error' ? handleRetry : handleConnect}
          disabled={isButtonDisabled()}
          className={`
            w-full py-3 px-6 rounded-lg font-medium transition-all duration-200
            ${isButtonDisabled()
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : status === 'error'
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
            }
          `}
        >
          <div className="flex items-center justify-center gap-2">
            {renderStatusIcon()}
            {getButtonText()}
          </div>
        </button>

        {/* Status Messages */}
        {status === 'connecting' && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
              Looking for your Colmi ring...
            </p>
          </div>
        )}

        {status === 'connected' && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300 text-center">
              Successfully connected to your ring!
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error.message}
                </p>
                {error.troubleshooting && (
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    {error.troubleshooting}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Browser Compatibility Info */}
        {!isSupported && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Browser Requirements
            </h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Chrome 56+ or Edge 79+</li>
              <li>• Web Bluetooth must be enabled</li>
              <li>• HTTPS connection required</li>
            </ul>
          </div>
        )}

        {/* Connection Tips */}
        {status === 'idle' && isSupported && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
              Connection Tips
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Ensure your ring is charged</li>
              <li>• Keep the ring within 3 feet (very limited range)</li>
              <li>• Disconnect from other devices first</li>
              <li>• Ring may disconnect when not moving (normal behavior)</li>
              <li>• Works with R02, R03, and R06 models</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}