'use client';

interface DebugInfoProps {
  isConnected: boolean;
  isPolling: boolean;
}

export function DebugInfo({ isConnected, isPolling }: DebugInfoProps) {
  return (
    <div className="mt-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
      <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
        Protocol Information
      </h4>
      <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
        <div>Service UUID: 6E40FFF0-B5A3-F393-E0A9-E50E24DCCA9E</div>
        <div>Protocol: Colmi R02 (16-byte packets with checksum validation)</div>
        <div>Real-time heart rate monitoring: {isPolling ? 'Active' : 'Inactive'}</div>
        <div>Connection status: {isConnected ? 'Connected' : 'Disconnected'}</div>
        <div className="text-blue-600 dark:text-blue-400">
          📊 Commands: Battery(3), Heart Rate(105), Steps(67)
        </div>
        <div className="text-yellow-600 dark:text-yellow-400">
          💡 Open browser console (F12) for detailed protocol logs
        </div>
        <div className="text-green-600 dark:text-green-400">
          ✅ Packet validation: Checksum verification enabled
        </div>
      </div>
    </div>
  );
}