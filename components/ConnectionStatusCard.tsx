'use client';

import React from 'react';
import { Wifi, WifiOff, Battery, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

type ConnectionState = 'connected' | 'disconnected' | 'reconnecting' | 'low-power' | 'out-of-range';

interface ConnectionStatusCardProps {
  isConnected: boolean;
  connectionState: ConnectionState;
  signalStrength?: number; // 0-100
  lastSeen?: Date;
  onReconnect?: () => void;
}

/**
 * ConnectionStatusCard Component
 * 
 * Enhanced connection status display based on Gadgetbridge insights.
 * Shows connection state, signal strength, and handles expected disconnections.
 */
export function ConnectionStatusCard({ 
  isConnected, 
  connectionState, 
  signalStrength = 0,
  lastSeen,
  onReconnect 
}: ConnectionStatusCardProps) {
  
  const getStatusIcon = () => {
    switch (connectionState) {
      case 'connected':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'reconnecting':
        return <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />;
      case 'low-power':
        return <Battery className="h-6 w-6 text-yellow-600" />;
      case 'out-of-range':
        return <WifiOff className="h-6 w-6 text-orange-600" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (connectionState) {
      case 'connected':
        return 'Connected - Keep ring within 3 feet';
      case 'reconnecting':
        return 'Reconnecting... (this is normal)';
      case 'low-power':
        return 'Ring in low-power mode (move to wake up)';
      case 'out-of-range':
        return 'Ring out of range - move closer';
      default:
        return 'Disconnected';
    }
  };

  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20';
      case 'reconnecting':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20';
      case 'low-power':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
      case 'out-of-range':
        return 'border-orange-200 bg-orange-50 dark:bg-orange-900/20';
      default:
        return 'border-red-200 bg-red-50 dark:bg-red-900/20';
    }
  };

  const getSignalBars = () => {
    const bars = [];
    for (let i = 0; i < 4; i++) {
      const isActive = signalStrength > (i * 25);
      bars.push(
        <div
          key={i}
          className={`w-1 bg-current transition-all duration-200 ${
            isActive ? 'opacity-100' : 'opacity-30'
          }`}
          style={{ height: `${8 + i * 4}px` }}
        />
      );
    }
    return bars;
  };

  return (
    <div className={`rounded-xl border-2 p-6 transition-all duration-200 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Connection Status
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {getStatusMessage()}
            </p>
          </div>
        </div>
        
        {/* Signal Strength Indicator */}
        {isConnected && (
          <div className="flex items-center gap-2">
            <div className="flex items-end gap-0.5 h-6">
              {getSignalBars()}
            </div>
            <Wifi className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </div>
        )}
      </div>

      {/* Connection Details */}
      <div className="space-y-2 text-sm">
        {lastSeen && !isConnected && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Last seen:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {lastSeen.toLocaleTimeString()}
            </span>
          </div>
        )}
        
        {isConnected && signalStrength > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Signal strength:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {signalStrength}%
            </span>
          </div>
        )}

        {/* Range Warning */}
        {connectionState === 'connected' && signalStrength < 30 && (
          <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              ⚠️ Weak signal - move ring closer to maintain connection
            </p>
          </div>
        )}

        {/* Reconnect Button */}
        {!isConnected && connectionState !== 'reconnecting' && onReconnect && (
          <button
            onClick={onReconnect}
            className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Reconnect
          </button>
        )}
      </div>

      {/* Device Info */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Compatible: R02, R03, R06</span>
          <span>Range: ~3 feet</span>
        </div>
      </div>
    </div>
  );
}