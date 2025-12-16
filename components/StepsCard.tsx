'use client';

import { Activity, RefreshCw } from 'lucide-react';

interface StepsCardProps {
  steps: number | null;
  isConnected: boolean;
  onRefreshSteps: () => void;
}

export function StepsCard({ steps, isConnected, onRefreshSteps }: StepsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Steps
          </h2>
        </div>
      </div>
      
      <div className="text-center mb-4">
        {steps !== null ? (
          <>
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              {steps.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Today</p>
          </>
        ) : (
          <>
            <div className="text-4xl font-bold text-gray-400 mb-2">--</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
          </>
        )}
      </div>

      {/* Steps Refresh Button */}
      <div className="mb-4">
        <button
          onClick={onRefreshSteps}
          disabled={!isConnected}
          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            !isConnected
              ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Steps
          </div>
        </button>
      </div>

      {steps !== null && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((steps / 10000) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            Goal: 10,000 steps
          </p>
        </div>
      )}

      {/* Steps Instructions */}
      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <p className="text-xs text-green-700 dark:text-green-300 text-center">
          👟 Click "Refresh Steps" to get current step count
        </p>
      </div>
    </div>
  );
}