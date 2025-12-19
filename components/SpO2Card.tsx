'use client';

import React, { useState } from 'react';
import { Droplets, Play, Square, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { GlassCard, MetricDisplay, StatusIndicator, AnimatedButton } from './glass';

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

  const getSpO2StatusForMetric = (value: number | null): 'success' | 'warning' | 'error' | 'neutral' => {
    if (value === null) return 'neutral';
    if (value >= 95) return 'success';
    if (value >= 90) return 'warning';
    return 'error';
  };

  const getTrend = (value: number | null): 'up' | 'down' | 'stable' | undefined => {
    if (value === null) return undefined;
    if (value >= 98) return 'up';
    if (value < 92) return 'down';
    return 'stable';
  };

  return (
    <GlassCard glow="blue" className="relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <Droplets className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Blood Oxygen (SpO2)
            </h2>
            <p className="text-sm text-gray-600">
              Real-time oxygen saturation
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <StatusIndicator
            status={isSpO2Monitoring ? 'active' : 'neutral'}
            pulse={isSpO2Monitoring}
          />
        </div>
      </div>

      {/* Metric Display */}
      <MetricDisplay
        value={spO2 !== null ? `${spO2}%` : null}
        unit="SpO2"
        label="Blood Oxygen"
        status={getSpO2StatusForMetric(spO2 ?? null)}
        trend={getTrend(spO2 ?? null)}
        miniChart={spO2 !== null}
        className="mb-6"
      />

      {/* Average Display */}
      {averageSpO2 && readingHistory.length > 1 && (
        <div className="text-center mb-4">
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">
            Average: {averageSpO2}% ({readingHistory.length} readings)
          </span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2 mb-4">
        {!isSpO2Monitoring ? (
          <AnimatedButton
            variant="primary"
            size="sm"
            onClick={onStartSpO2}
            disabled={!isConnected}
            hoverEffect="lift"
            shadowColor="blue"
            className="flex-1"
          >
            <Play className="h-4 w-4" />
            Start SpO2
          </AnimatedButton>
        ) : (
          <AnimatedButton
            variant="secondary"
            size="sm"
            onClick={onStopSpO2}
            disabled={!isConnected}
            hoverEffect="lift"
            shadowColor="red"
            className="flex-1 bg-red-500 hover:bg-red-600 text-white border-red-500/20"
          >
            <Square className="h-4 w-4" />
            Stop SpO2
          </AnimatedButton>
        )}
      </div>

      {/* Reading History Visualization */}
      {readingHistory.length > 1 && (
        <div className="mb-4">
          <div className="text-xs text-gray-600 mb-2 font-medium">
            Recent readings:
          </div>
          <div className="flex gap-1 h-8 bg-white/20 rounded-lg p-1 backdrop-blur-sm">
            {readingHistory.slice(-8).map((reading, index) => {
              const height = Math.max(10, (reading / 100) * 100);
              const color = reading >= 95 ? 'bg-emerald-500' : reading >= 90 ? 'bg-amber-500' : 'bg-red-500';
              return (
                <div
                  key={index}
                  className={`flex-1 ${color} rounded-sm opacity-70 hover:opacity-100 transition-all duration-200 hover:scale-105`}
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
        <GlassCard size="sm" className="mb-4 bg-blue-50/50 border-blue-200/30">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            <span className="text-sm font-medium text-blue-800">
              Monitoring blood oxygen levels...
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Keep ring still on finger for accurate readings
          </p>
        </GlassCard>
      )}

      {/* Connection Status */}
      {!isConnected && (
        <GlassCard size="sm" className="mb-4 bg-red-50/50 border-red-200/30">
          <p className="text-sm text-red-700 text-center">
            Ring disconnected - SpO2 monitoring unavailable
          </p>
        </GlassCard>
      )}

      {/* SpO2 Information */}
      <GlassCard size="sm" className="bg-white/40 border-white/30">
        <div className="text-xs text-gray-700 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex justify-between">
              <span>Normal:</span>
              <span className="font-medium text-emerald-600">95-100%</span>
            </div>
            <div className="flex justify-between">
              <span>Low:</span>
              <span className="font-medium text-amber-600">90-94%</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span>Critical:</span>
            <span className="font-medium text-red-600">&lt;90%</span>
          </div>
          
          <div className="pt-2 border-t border-white/20">
            <p className="text-xs text-gray-600">
              <strong>Tip:</strong> Keep hand still and ensure good ring contact. 
              Readings stabilize in 10-30 seconds.
            </p>
          </div>
        </div>
      </GlassCard>
    </GlassCard>
  );
}
