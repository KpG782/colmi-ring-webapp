'use client';

import { Activity, RefreshCw } from 'lucide-react';
import { GlassCard, MetricDisplay, AnimatedButton } from './glass';

interface StepsCardProps {
  steps: number | null;
  isConnected: boolean;
  onRefreshSteps: () => void;
}

export function StepsCard({ steps, isConnected, onRefreshSteps }: StepsCardProps) {
  const getStepsStatus = (steps: number | null): 'success' | 'warning' | 'neutral' => {
    if (steps === null) return 'neutral';
    if (steps >= 10000) return 'success';
    if (steps >= 5000) return 'warning';
    return 'neutral';
  };

  const getTrend = (steps: number | null): 'up' | 'stable' | undefined => {
    if (steps === null) return undefined;
    if (steps >= 8000) return 'up';
    return 'stable';
  };

  const getProgressPercentage = (steps: number | null): number => {
    if (steps === null) return 0;
    return Math.min((steps / 10000) * 100, 100);
  };

  return (
    <GlassCard glow="emerald" className="relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Steps
          </h2>
        </div>
      </div>

      {/* Metric Display */}
      <MetricDisplay
        value={steps}
        unit="Today"
        label="Steps"
        status={getStepsStatus(steps)}
        trend={getTrend(steps)}
        miniChart={steps !== null}
        className="mb-6"
      />

      {/* Progress Bar */}
      {steps !== null && (
        <div className="mb-4">
          <div className="w-full bg-white/30 rounded-full h-3 backdrop-blur-sm">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${getProgressPercentage(steps)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-600">0</span>
            <span className="text-xs font-medium text-gray-700">
              {steps >= 10000 ? 'Goal Reached! 🎉' : `${10000 - steps} to goal`}
            </span>
            <span className="text-xs text-gray-600">10,000</span>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="mb-4">
        <AnimatedButton
          variant="secondary"
          size="sm"
          onClick={onRefreshSteps}
          disabled={!isConnected}
          hoverEffect="lift"
          shadowColor="emerald"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500/20"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Steps
        </AnimatedButton>
      </div>

      {/* Instructions */}
      <GlassCard size="sm" className="bg-white/50 border-white/30">
        <p className="text-xs text-gray-700 text-center">
          Click "Refresh Steps" to get current step count
        </p>
      </GlassCard>
    </GlassCard>
  );
}
