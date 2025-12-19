'use client';

import { Bluetooth, BluetoothOff, RefreshCw, Square, RotateCcw, Maximize2 } from 'lucide-react';

interface DashboardHeaderProps {
  isConnected: boolean;
  lastUpdate: Date;
  isPolling: boolean;
  onDisconnect: () => void;
  onStopAll?: () => void;
  onRebootRing?: () => void;
  isAnyMonitoringActive?: boolean;
  onOpenFullscreenGesture?: () => void;
}

export function DashboardHeader({
  isConnected,
  lastUpdate,
  isPolling,
  onDisconnect,
  onStopAll,
  onRebootRing,
  isAnyMonitoringActive = false,
  onOpenFullscreenGesture
}: DashboardHeaderProps) {
  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-4 md:mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            {isConnected ? (
              <Bluetooth className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
            ) : (
              <BluetoothOff className="h-5 w-5 md:h-6 md:w-6 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Ring Dashboard
            </h1>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
              {isConnected ? 'Connected' : 'Disconnected'} • Last update: {formatTimestamp(lastUpdate)}
              {isAnyMonitoringActive && (
                <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">
                  • Ring may be flashing (monitoring active)
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {isPolling && (
            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
          )}

          {/* Emergency Stop All Button */}
          {isConnected && onStopAll && (
            <button
              onClick={onStopAll}
              className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                isAnyMonitoringActive
                  ? 'bg-orange-600 hover:bg-orange-700 text-white animate-pulse'
                  : 'bg-gray-400 hover:bg-gray-500 text-white'
              }`}
              title="Stop all monitoring (Heart Rate, SpO2, Raw Data) - Stops ring flashing"
            >
              <Square className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">{isAnyMonitoringActive ? 'Stop All (Flashing)' : 'Stop All'}</span>
              <span className="sm:hidden">Stop</span>
            </button>
          )}

          {/* Fullscreen Gesture Mode Button */}
          {isConnected && onOpenFullscreenGesture && (
            <button
              onClick={onOpenFullscreenGesture}
              className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors font-medium text-sm shadow-lg"
              title="Open fullscreen gesture training mode with camera"
            >
              <Maximize2 className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Gesture Mode</span>
              <span className="sm:hidden">Gesture</span>
            </button>
          )}

          {/* Reboot Ring Button */}
          {isConnected && onRebootRing && (
            <button
              onClick={onRebootRing}
              className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium text-sm"
              title="Reboot ring device (restarts the ring, stops all flashing)"
            >
              <RotateCcw className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Reboot Ring</span>
              <span className="sm:hidden">Reboot</span>
            </button>
          )}

          <button
            onClick={onDisconnect}
            className="px-3 md:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}
