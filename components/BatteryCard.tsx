'use client';

import { Battery, RefreshCw } from 'lucide-react';
import { GlassCard, MetricDisplay, AnimatedButton } from './glass';

interface BatteryCardProps {
  battery: number | null;
  isConnected: boolean;
  onRefreshBattery: () => void;
}

export function BatteryCard({ battery, isConnected, onRefreshBattery }: BatteryCardProps) {
  const getBatteryStatus = (battery: number | null): 'success' | 'warning' | 'error' | 'neutral' => {
    if (battery === null) return 'neutral';
    if (battery < 20) return 'error';
    if (battery < 50) return 'warning';
    return 'success';
  };

  const getBatteryStatusText = (battery: number | null): string => {
    if (battery === null) return '';
    if (battery < 20) return 'Low battery';
    if (battery < 50) return 'Medium battery';
    return 'Good battery';
  };

  const getTrend = (battery: number | null): 'down' | 'stable' | undefined => {
    if (battery === null) return undefined;
    if (battery < 30) return 'down';
    return 'stable';
  };

  const getBatteryGradient = (battery: number | null): string => {
    if (battery === null) return 'from-gray-400 to-gray-500';
    if (battery < 20) return 'from-red-500 to-red-600';
    if (battery < 50) return 'from-amber-500 to-amber-600';
    return 'from-emerald-500 to-emerald-600';
  };

  return (
    <GlassCard glow="amber" className="relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
            <Battery className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Battery
          </h2>
        </div>
      </div>

      {/* Metric Display */}
      <MetricDisplay
        value={battery !== null ? `${battery}%` : null}
        unit="Remaining"
        label="Battery Level"
        status={getBatteryStatus(battery)}
        trend={getTrend(battery)}
        miniChart={battery !== null}
        className="mb-6"
      />

      {/* Battery Status */}
      {battery !== null && (
        <div className="text-center mb-4">
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${
            getBatteryStatus(battery) === 'success' ? 'bg-emerald-100 text-emerald-700' :
            getBatteryStatus(battery) === 'warning' ? 'bg-amber-100 text-amber-700' :
            getBatteryStatus(battery) === 'error' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {getBatteryStatusText(battery)}
          </span>
        </div>
      )}

      {/* Battery Level Bar */}
      {battery !== null && (
        <div className="mb-4">
          <div className="w-full bg-white/30 rounded-full h-3 backdrop-blur-sm">
            <div
              className={`bg-gradient-to-r ${getBatteryGradient(battery)} h-3 rounded-full transition-all duration-500 ease-out shadow-sm`}
              style={{ width: `${battery}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-600">0%</span>
            <span className="text-xs font-medium text-gray-700">
              {battery}% remaining
            </span>
            <span className="text-xs text-gray-600">100%</span>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="mb-4">
        <AnimatedButton
          variant="primary"
          size="sm"
          onClick={onRefreshBattery}
          disabled={!isConnected}
          hoverEffect="lift"
          shadowColor="blue"
          className="w-full"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Battery
        </AnimatedButton>
      </div>

      {/* Instructions */}
      <GlassCard size="sm" className="bg-emerald-50/50 border-emerald-200/30">
        <p className="text-xs text-emerald-700 text-center">
          🔋 Click "Refresh Battery" to get current battery level
        </p>
      </GlassCard>
    </GlassCard>
  );
}
