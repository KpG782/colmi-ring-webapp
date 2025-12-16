'use client';

import { Battery, RefreshCw } from 'lucide-react';

interface BatteryCardProps {
  battery: number | null;
  isConnected: boolean;
  onRefreshBattery: () => void;
}

export function BatteryCard({ battery, isConnected, onRefreshBattery }: BatteryCardProps) {
  const getBatteryColor = (battery: number | null): string => {
    if (battery === null) return 'text-gray-400';
    if (battery < 20) return 'text-red-600';
    if (battery < 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getBatteryStatus = (battery: number | null): string => {
    if (battery === null) return '';
    if (battery < 20) return 'Low battery';
    if (battery < 50) return 'Medium battery';
    return 'Good battery';
  };

  const getBatteryBarColor = (battery: number | null): string => {
    if (battery === null) return 'bg-gray-400';
    if (battery < 20) return 'bg-red-600';
    if (battery < 50) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
            <Battery className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Battery
          </h2>
        </div>
      </div>

      <div className="text-center mb-4">
        {battery !== null ? (
          <>
            <div className={`text-4xl font-bold mb-2 ${getBatteryColor(battery)}`}>
              {battery}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Remaining</p>
          </>
        ) : (
          <>
            <div className="text-4xl font-bold text-gray-400 mb-2">--</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
          </>
        )}
      </div>

      {/* Battery Refresh Button */}
      <div className="mb-4">
        <button
          onClick={onRefreshBattery}
          disabled={!isConnected}
          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            !isConnected
              ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Battery
          </div>
        </button>
      </div>

      {battery !== null && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getBatteryBarColor(battery)}`}
              style={{ width: `${battery}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            {getBatteryStatus(battery)}
          </p>
        </div>
      )}

      {/* Battery Instructions */}
      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <p className="text-xs text-green-700 dark:text-green-300 text-center">
          🔋 Click "Refresh Battery" to get current battery level
        </p>
      </div>
    </div>
  );
}
