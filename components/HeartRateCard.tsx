'use client';

import { Heart } from 'lucide-react';
import { GlassCard, MetricDisplay, StatusIndicator, AnimatedButton } from './glass';

interface HeartRateCardProps {
  heartRate: number | null;
  isConnected: boolean;
  isHeartRateMonitoring: boolean;
  onStartHeartRate: () => void;
  onStopHeartRate: () => void;
}

export function HeartRateCard({
  heartRate,
  isConnected,
  isHeartRateMonitoring,
  onStartHeartRate,
  onStopHeartRate
}: HeartRateCardProps) {
  const getHeartRateStatus = (heartRate: number | null): 'success' | 'warning' | 'error' | 'neutral' => {
    if (heartRate === null) return 'neutral';
    if (heartRate < 60) return 'neutral';
    if (heartRate < 100) return 'success';
    if (heartRate < 150) return 'warning';
    return 'error';
  };

  const getHeartRateStatusText = (heartRate: number | null): string => {
    if (heartRate === null) return '';
    if (heartRate < 60) return 'Resting';
    if (heartRate < 100) return 'Normal';
    if (heartRate < 150) return 'Elevated';
    return 'High';
  };

  const getTrend = (heartRate: number | null): 'up' | 'down' | 'stable' | undefined => {
    if (heartRate === null) return undefined;
    if (heartRate > 100) return 'up';
    if (heartRate < 60) return 'down';
    return 'stable';
  };

  return (
    <GlassCard glow="blue" className="relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Heart Rate
          </h2>
        </div>
        
        {/* Status Indicator */}
        <StatusIndicator
          status={isHeartRateMonitoring ? 'active' : 'neutral'}
          label={isHeartRateMonitoring ? 'Monitoring' : 'Stopped'}
          pulse={isHeartRateMonitoring}
        />
      </div>

      {/* Metric Display */}
      <MetricDisplay
        value={heartRate}
        unit="BPM"
        label="Heart Rate"
        status={getHeartRateStatus(heartRate)}
        trend={getTrend(heartRate)}
        miniChart={heartRate !== null}
        className="mb-6"
      />

      {/* Status Text */}
      {heartRate !== null && (
        <div className="text-center mb-4">
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${
            getHeartRateStatus(heartRate) === 'success' ? 'bg-emerald-100 text-emerald-700' :
            getHeartRateStatus(heartRate) === 'warning' ? 'bg-amber-100 text-amber-700' :
            getHeartRateStatus(heartRate) === 'error' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {getHeartRateStatusText(heartRate)}
          </span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2 mb-4">
        <AnimatedButton
          variant="secondary"
          size="sm"
          onClick={onStartHeartRate}
          disabled={!isConnected || isHeartRateMonitoring}
          hoverEffect="lift"
          shadowColor="emerald"
          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500/20"
        >
          Start Monitoring
        </AnimatedButton>
        <AnimatedButton
          variant="secondary"
          size="sm"
          onClick={onStopHeartRate}
          disabled={!isConnected || !isHeartRateMonitoring}
          hoverEffect="lift"
          shadowColor="red"
          className="flex-1 bg-red-500 hover:bg-red-600 text-white border-red-500/20"
        >
          Stop Monitoring
        </AnimatedButton>
      </div>

      {/* Instructions */}
      {!isHeartRateMonitoring && (
        <GlassCard size="sm" className="bg-white/50 border-white/30">
          <p className="text-xs text-gray-700 text-center">
            Put ring on finger, then click "Start Monitoring" for real-time heart rate
          </p>
        </GlassCard>
      )}
    </GlassCard>
  );
}
