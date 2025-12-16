'use client';

import { RefreshCw } from 'lucide-react';

interface StatusFooterProps {
  lastUpdate: Date;
}

export function StatusFooter({ lastUpdate }: StatusFooterProps) {
  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="mt-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>Manual control mode • Use buttons to refresh data</span>
        </div>
        <div className="text-gray-500 dark:text-gray-400">
          Last updated: {formatTimestamp(lastUpdate)}
        </div>
      </div>
    </div>
  );
}
