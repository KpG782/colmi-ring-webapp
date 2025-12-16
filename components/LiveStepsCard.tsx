'use client';

import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, Timer, Target, RefreshCw } from 'lucide-react';

interface LiveStepsCardProps {
  steps?: number | null;
  isConnected: boolean;
  onRefreshSteps?: () => void;
}

interface StepUpdate {
  steps: number;
  timestamp: Date;
  delta: number;
}

/**
 * LiveStepsCard Component
 *
 * Shows real-time step updates with live tracking and goal progress.
 * Focuses on immediate step detection and movement feedback.
 */
export function LiveStepsCard({
  steps,
  isConnected,
  onRefreshSteps
}: LiveStepsCardProps) {
  const [stepHistory, setStepHistory] = useState<StepUpdate[]>([]);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [stepGoal] = useState<number>(10000); // Daily step goal

  // Track step changes for live updates
  useEffect(() => {
    if (steps !== null && steps !== undefined) {
      const now = new Date();

      // Calculate delta from last known step count
      const lastEntry = stepHistory[stepHistory.length - 1];
      const delta = lastEntry ? Math.max(0, steps - lastEntry.steps) : 0;

      // Only add if there's a meaningful change or it's the first reading
      if (delta > 0 || stepHistory.length === 0) {
        const newUpdate: StepUpdate = {
          steps,
          timestamp: now,
          delta
        };

        setStepHistory(prev => {
          const updated = [...prev, newUpdate];
          // Keep only last 20 updates
          return updated.slice(-20);
        });

        setLastUpdate(now);

        // Set active state if we detected new steps
        if (delta > 0) {
          setIsActive(true);
          setCurrentStreak(prev => prev + delta);

          // Clear active state after 5 seconds of no updates
          setTimeout(() => setIsActive(false), 5000);
        }
      }
    }
  }, [steps, stepHistory]);

  // Calculate steps per minute based on recent activity
  const getStepsPerMinute = () => {
    if (stepHistory.length < 2) return 0;

    const recentUpdates = stepHistory.slice(-5); // Last 5 updates
    const totalSteps = recentUpdates.reduce((sum, update) => sum + update.delta, 0);
    const timeSpan = recentUpdates.length > 1
      ? (recentUpdates[recentUpdates.length - 1].timestamp.getTime() - recentUpdates[0].timestamp.getTime()) / 1000 / 60
      : 1;

    return Math.round(totalSteps / Math.max(timeSpan, 1));
  };

  // Get progress percentage towards daily goal
  const getGoalProgress = () => {
    if (!steps) return 0;
    return Math.min((steps / stepGoal) * 100, 100);
  };

  // Get activity level based on recent step rate
  const getActivityLevel = () => {
    const stepsPerMin = getStepsPerMinute();
    if (stepsPerMin >= 100) return { level: 'high', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' };
    if (stepsPerMin >= 50) return { level: 'moderate', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
    if (stepsPerMin > 0) return { level: 'light', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' };
    return { level: 'inactive', color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-700' };
  };

  const activityLevel = getActivityLevel();
  const stepsPerMinute = getStepsPerMinute();
  const goalProgress = getGoalProgress();

  return (
    <div className={`rounded-xl border-2 p-6 transition-all duration-300 ${
      isActive
        ? 'border-green-400 bg-green-50 dark:bg-green-900/20 shadow-lg'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isActive ? 'bg-green-600 animate-pulse' : 'bg-blue-600'}`}>
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Live Steps
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Real-time step detection
            </p>
          </div>
        </div>

        <button
          onClick={onRefreshSteps}
          disabled={!isConnected}
          className={`p-2 rounded-lg transition-all duration-200 ${
            isConnected
              ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Current Step Count */}
      <div className="text-center mb-6">
        <div className={`text-5xl font-bold mb-2 transition-all duration-300 ${
          isActive ? 'text-green-600 scale-105' : 'text-gray-900 dark:text-white'
        }`}>
          {steps?.toLocaleString() ?? '---'}
        </div>

        {lastUpdate && (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Activity Status */}
      <div className={`p-3 rounded-lg mb-4 ${activityLevel.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className={`h-4 w-4 ${activityLevel.color}`} />
            <span className={`text-sm font-medium ${activityLevel.color}`}>
              {activityLevel.level === 'high' && 'High Activity'}
              {activityLevel.level === 'moderate' && 'Moderate Activity'}
              {activityLevel.level === 'light' && 'Light Activity'}
              {activityLevel.level === 'inactive' && 'No Recent Activity'}
            </span>
          </div>

          {stepsPerMinute > 0 && (
            <div className={`text-sm ${activityLevel.color}`}>
              {stepsPerMinute} steps/min
            </div>
          )}
        </div>

        {isActive && currentStreak > 0 && (
          <div className="mt-2 text-xs text-green-700 dark:text-green-300">
            🔥 Current streak: +{currentStreak} steps detected!
          </div>
        )}
      </div>

      {/* Goal Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Daily Goal Progress
            </span>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {goalProgress.toFixed(1)}%
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${goalProgress}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>0</span>
          <span>{stepGoal.toLocaleString()} steps</span>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      {stepHistory.length > 1 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Recent Activity
          </h4>

          <div className="flex gap-1 h-8">
            {stepHistory.slice(-10).map((update, index) => {
              const height = update.delta > 0 ? Math.max(20, Math.min(100, (update.delta / 50) * 100)) : 10;
              const isRecent = index >= stepHistory.slice(-10).length - 3;

              return (
                <div
                  key={update.timestamp.getTime()}
                  className={`flex-1 rounded-sm transition-all duration-300 ${
                    update.delta > 0
                      ? isRecent ? 'bg-green-500' : 'bg-blue-400'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  style={{ height: `${height}%` }}
                  title={`${update.timestamp.toLocaleTimeString()}: +${update.delta} steps`}
                />
              );
            })}
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
            Last 10 updates (green = recent activity)
          </div>
        </div>
      )}

      {/* Live Detection Status */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Live Detection
            </span>
          </div>

          <div className={`flex items-center gap-2 ${
            isConnected ? 'text-green-600' : 'text-red-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-600 animate-pulse' : 'bg-red-600'
            }`} />
            <span className="text-xs font-medium">
              {isConnected ? 'Active' : 'Disconnected'}
            </span>
          </div>
        </div>

        {isConnected && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Ring is actively monitoring your movement and updating step count in real-time
          </div>
        )}
      </div>

      {/* Movement Encouragement */}
      {isConnected && !isActive && steps !== null && steps !== undefined && steps < stepGoal && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💪 <strong>Keep moving!</strong> You're {(stepGoal - steps).toLocaleString()} steps
            away from your daily goal. Take a walk to see live updates here!
          </p>
        </div>
      )}
    </div>
  );
}
