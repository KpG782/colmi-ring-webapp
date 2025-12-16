'use client';

import { BluetoothOff } from 'lucide-react';

interface ConnectionAlertProps {
  isConnected: boolean;
}

export function ConnectionAlert({ isConnected }: ConnectionAlertProps) {
  if (isConnected) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2">
        <BluetoothOff className="h-5 w-5 text-red-600" />
        <p className="text-red-800 dark:text-red-200 font-medium">
          Connection lost to your Colmi ring
        </p>
      </div>
      <p className="text-red-600 dark:text-red-300 text-sm mt-1">
        Please check that your ring is charged and within range, then refresh the page to reconnect.
      </p>
    </div>
  );
}