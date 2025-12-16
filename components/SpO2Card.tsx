'use client';

import React, { useState } from 'react';
import { Droplets, Play, Square, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface SpO2CardProps {
  spO2?: number | null;
  isConnected: boolean;
  isSpO2Monitoring: boolean;
  onStartSpO2: () => void;
  onStopSpO2: () => void;
}

/**
 * SpO2Card Component
 *
 * Real-time blood oxygen saturation monitoring from Colmi ring.
 * Based on Python client's SPO2 real-time reading functionality.
 */
export function SpO2Card({
  spO2,
  isConnected,
  isSpO2Monitoring,
  onStartSpO2,
  onStopSpO2
}: SpO2CardProps) {
  const [lastReading, setLastReading] = useState<number | null>(null);
  const [readingHistory, setReadingHistory] = useState<number[]>([]);

  // Update reading history when new SpO2 value comes in
  React.useEffect(() => {
    if (spO2 !== null && spO2 !== undefined && spO2 !== lastReading) {
      setLastReading(spO2);
      setReadingHistory(prev => {
        const newHistory = [...prev, spO2];
        // Keep only last 10 readings
        return newHistory.slice(-10);
      });
    }
  }, [spO2, lastReading]);

  const getSpO2Status = (value: number | null) => {
    if (value === null) return 'unknown';
    if (value >= 95) return 'normal';
    if (value >= 90) return 'low';
    return 'critical';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200';
      case 'low':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'low':
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Droplets className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'normal':
        return 'Normal oxygen levels';
      case 'low':
        return 'Low oxygen levels';
      case 'critical':
        return 'Critical - seek medical attention';
      default:
        return 'No reading available';
    }
  };

  const status = getSpO2Status(spO2 ?? null);
  const averageSpO2 = readingHistory.length > 0
    ? Math.round(readingHistory.reduce((a, b) => a + b, 0) / readingHistory.length)
    : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Droplets className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Blood Oxygen (SpO2)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Real-time oxygen saturation
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          {isSpO2Monitoring && (
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          )}
        </div>
      </div>

      {/* Main SpO2 Display */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {spO2 !== null ? `${spO2}%` : '---'}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          {getStatusMessage(status)}
        </div>

        {/* Average Display */}
        {averageSpO2 && readingHistory.length > 1 && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Average: {averageSpO2}% ({readingHistory.length} readings)
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2 mb-4">
        {!isSpO2Monitoring ? (
          <button
            onClick={onStartSpO2}
            disabled={!isConnected}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
              isConnected
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            <Play className="h-4 w-4" />
            Start SpO2
          </button>
        ) : (
          <button
            onClick={onStopSpO2}
            disabled={!isConnected}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
              isConnected
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            <Square className="h-4 w-4" />
            Stop SpO2
          </button>
        )}
      </div>

      {/* Reading History Visualization */}
      {readingHistory.length > 1 && (
        <div className="mb-4">
          <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
            Recent readings:
          </div>
          <div className="flex gap-1 h-8">
            {readingHistory.slice(-8).map((reading, index) => {
              const height = Math.max(10, (reading / 100) * 100);
              const color = reading >= 95 ? 'bg-green-500' : reading >= 90 ? 'bg-yellow-500' : 'bg-red-500';
              return (
                <div
                  key={index}
                  className={`flex-1 ${color} rounded-sm opacity-70 hover:opacity-100 transition-opacity`}
                  style={{ height: `${height}%` }}
                  title={`${reading}%`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* SpO2 Monitoring Status */}
      {isSpO2Monitoring && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Monitoring blood oxygen levels...
            </span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
            Keep ring still on finger for accurate readings
          </p>
        </div>
      )}

      {/* Connection Status */}
      {!isConnected && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300 text-center">
            Ring disconnected - SpO2 monitoring unavailable
          </p>
        </div>
      )}

      {/* SpO2 Information */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
        <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
          <div className="flex justify-between">
            <span>Normal range:</span>
            <span className="font-medium">95-100%</span>
          </div>
          <div className="flex justify-between">
            <span>Low oxygen:</span>
            <span className="font-medium text-yellow-600">90-94%</span>
          </div>
          <div className="flex justify-between">
            <span>Critical:</span>
            <span className="font-medium text-red-600">&lt;90%</span>
          </div>
        </div>

        <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-700 dark:text-gray-300">
            <strong>Tip:</strong> For accurate SpO2 readings, keep your hand still and ensure
            the ring has good contact with your finger. Readings may take 10-30 seconds to stabilize.
          </p>
        </div>
      </div>
    </div>
  );
}
