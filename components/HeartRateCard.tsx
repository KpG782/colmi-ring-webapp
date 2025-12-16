'use client';

import { Heart } from 'lucide-react';

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
  const getHeartRateColor = (heartRate: number | null): string => {
    if (heartRate === null) return 'text-gray-400';
    if (heartRate < 60) return 'text-blue-600';
    if (heartRate < 100) return 'text-green-600';
    if (heartRate < 150) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHeartRateStatus = (heartRate: number | null): string => {
    if (heartRate === null) return '';
    if (heartRate < 60) return 'Resting';
    if (heartRate < 100) return 'Normal';
    if (heartRate < 150) return 'Elevated';
    return 'High';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Heart Rate
          </h2>
        </div>
        {/* Heart Rate Status Indicator */}
        <div className="flex items-center gap-2">
          {isHeartRateMonitoring && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isHeartRateMonitoring ? 'Monitoring' : 'Stopped'}
          </span>
        </div>
      </div>

      <div className="text-center mb-4">
        {heartRate !== null ? (
          <>
            <div className={`text-4xl font-bold mb-2 ${getHeartRateColor(heartRate)}`}>
              {heartRate}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">BPM</p>
          </>
        ) : (
          <>
            <div className="text-4xl font-bold text-gray-400 mb-2">--</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isHeartRateMonitoring ? 'Waiting for reading...' : 'No data available'}
            </p>
          </>
        )}
      </div>

      {/* Heart Rate Control Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={onStartHeartRate}
          disabled={!isConnected || isHeartRateMonitoring}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            !isConnected || isHeartRateMonitoring
              ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          Start Monitoring
        </button>
        <button
          onClick={onStopHeartRate}
          disabled={!isConnected || !isHeartRateMonitoring}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            !isConnected || !isHeartRateMonitoring
              ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          Stop Monitoring
        </button>
      </div>

      {heartRate !== null && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {getHeartRateStatus(heartRate)}
        </div>
      )}

      {/* Instructions */}
      {!isHeartRateMonitoring && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-700 dark:text-gray-300 text-center">
            Put ring on finger, then click "Start Monitoring" for real-time heart rate
          </p>
        </div>
      )}
    </div>
  );
}
