/**
 * GlassHeader Component
 * 
 * Header component with logo, connection status badge, and user avatar.
 * Implements requirement 1.4 for cohesive header layout with glassmorphic styling.
 */

'use client';

import React from 'react';
import { Bluetooth, BluetoothOff, RefreshCw, Square, RotateCcw, Wifi, WifiOff } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { combineClasses } from '../../lib/design-system';

export interface GlassHeaderProps {
  title?: string;
  subtitle?: string;
  isConnected?: boolean;
  connectionStatus?: 'connected' | 'disconnected' | 'reconnecting' | 'low-power' | 'out-of-range';
  lastUpdate?: Date;
  isPolling?: boolean;
  userAvatar?: string;
  userName?: string;
  onDisconnect?: () => void;
  onStopAll?: () => void;
  onRebootRing?: () => void;
  isAnyMonitoringActive?: boolean;
  className?: string;
}

/**
 * GlassHeader component with glassmorphic styling
 * 
 * Features:
 * - Logo, connection status badge, and user avatar layout (Requirement 1.4)
 * - Glassmorphic card styling with backdrop blur
 * - Responsive design for mobile and desktop
 * - Accessibility support with proper ARIA labels
 */
export function GlassHeader({
  title = 'Ring Dashboard',
  subtitle,
  isConnected = false,
  connectionStatus = 'disconnected',
  lastUpdate,
  isPolling = false,
  userAvatar,
  userName = 'User',
  onDisconnect,
  onStopAll,
  onRebootRing,
  isAnyMonitoringActive = false,
  className,
}: GlassHeaderProps) {
  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getConnectionIcon = () => {
    if (connectionStatus === 'reconnecting') {
      return <RefreshCw className="h-5 w-5 md:h-6 md:w-6 text-amber-500 animate-spin" />;
    }
    return isConnected ? (
      <Bluetooth className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
    ) : (
      <BluetoothOff className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
    );
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'low-power':
        return 'Low Power';
      case 'out-of-range':
        return 'Out of Range';
      default:
        return 'Disconnected';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-emerald-600';
      case 'reconnecting':
        return 'text-amber-600';
      case 'low-power':
        return 'text-orange-600';
      case 'out-of-range':
        return 'text-red-500';
      default:
        return 'text-red-600';
    }
  };

  return (
    <GlassCard className={combineClasses('p-4 md:p-6', className)} glow="blue">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Logo and Title Section */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Logo/Connection Icon */}
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            {getConnectionIcon()}
          </div>
          
          {/* Title and Status */}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
              {title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-600">
              <span className={getConnectionStatusColor()}>
                {getConnectionStatusText()}
              </span>
              {lastUpdate && (
                <>
                  <span>•</span>
                  <span>Last update: {formatTimestamp(lastUpdate)}</span>
                </>
              )}
              {isAnyMonitoringActive && (
                <>
                  <span>•</span>
                  <span className="text-orange-600 font-medium">
                    Ring may be flashing (monitoring active)
                  </span>
                </>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Action Buttons and User Avatar */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Polling Indicator */}
          {isPolling && (
            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-1 lg:flex-initial">
            {/* Emergency Stop All Button */}
            {isConnected && onStopAll && (
              <GlassButton
                variant={isAnyMonitoringActive ? 'accent' : 'secondary'}
                size="sm"
                onClick={onStopAll}
                className={isAnyMonitoringActive ? 'animate-pulse' : ''}
                aria-label="Stop all monitoring (Heart Rate, SpO2, Raw Data) - Stops ring flashing"
              >
                <Square className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">
                  {isAnyMonitoringActive ? 'Stop All (Flashing)' : 'Stop All'}
                </span>
                <span className="sm:hidden">Stop</span>
              </GlassButton>
            )}

            {/* Reboot Ring Button */}
            {isConnected && onRebootRing && (
              <GlassButton
                variant="accent"
                size="sm"
                onClick={onRebootRing}
                aria-label="Reboot ring device (restarts the ring, stops all flashing)"
              >
                <RotateCcw className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Reboot Ring</span>
                <span className="sm:hidden">Reboot</span>
              </GlassButton>
            )}

            {/* Disconnect Button */}
            {onDisconnect && (
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={onDisconnect}
                className="bg-red-500 hover:bg-red-600 text-white border-red-500/20"
              >
                Disconnect
              </GlassButton>
            )}
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-medium text-sm md:text-base">
                  {userName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">
                {isConnected ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}