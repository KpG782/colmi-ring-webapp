'use client';

import { useState, useEffect, useCallback } from 'react';
import { Activity, Heart, TrendingUp, Zap, Settings, Target } from 'lucide-react';
import { DataDashboardProps, RingData } from '../lib/types';
import { DashboardHeader } from './DashboardHeader';
import { ConnectionAlert } from './ConnectionAlert';
import { HeartRateCard } from './HeartRateCard';
import { StepsCard } from './StepsCard';
import { BatteryCard } from './BatteryCard';
import { ConnectionStatusCard } from './ConnectionStatusCard';
import { DataQualityCard } from './DataQualityCard';
import { ActivityCard } from './ActivityCard';
import { DailyStepsCard } from './DailyStepsCard';
import { LiveStepsCard } from './LiveStepsCard';
import { AccelerometerCard } from './AccelerometerCard';
import { GestureTrainer } from './GestureTrainer';
import { SpO2Card } from './SpO2Card';
import { StatusFooter } from './StatusFooter';
import { DebugInfo } from './DebugInfo';
import { Tabs } from './Tabs';

type ConnectionState = 'connected' | 'disconnected' | 'reconnecting' | 'low-power' | 'out-of-range';
type TabId = 'overview' | 'health' | 'activity' | 'sensors' | 'gestures' | 'settings';

/**
 * DataDashboard Component
 * 
 * Displays real-time health metrics from the connected Colmi ring
 * in a responsive grid layout with automatic data polling.
 */
export function DataDashboard({ ringService }: DataDashboardProps) {
  const [ringData, setRingData] = useState<RingData>({
    heartRate: null,
    steps: null,
    battery: null,
    spO2: null,
    accelerometer: null,
    timestamp: Date.now()
  });
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [connectionState, setConnectionState] = useState<ConnectionState>('connected');
  const [signalStrength, setSignalStrength] = useState<number>(100);
  const [lastSeen, setLastSeen] = useState<Date>(new Date());
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [isHeartRateMonitoring, setIsHeartRateMonitoring] = useState<boolean>(false);
  const [isSpO2Monitoring, setIsSpO2Monitoring] = useState<boolean>(false);
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);
  const [accelerometerData, setAccelerometerData] = useState<any>(null);
  const [isRawDataMode, setIsRawDataMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  /**
   * Handles incoming data from the ring service
   */
  const handleDataUpdate = useCallback((data: RingData) => {
    console.log('Dashboard received data update:', data);
    setRingData(prevData => {
      const newData = {
        ...prevData,
        ...data, // Merge new data with existing data
        timestamp: data.timestamp
      };
      console.log('Updated ring data:', newData);
      return newData;
    });
    setLastUpdate(new Date(data.timestamp));
  }, []);

  /**
   * Handles incoming accelerometer data from the ring service
   */
  const handleAccelerometerUpdate = useCallback((data: any) => {
    console.log('Dashboard received accelerometer update:', data);
    setAccelerometerData(data);
  }, []);

  /**
   * Requests data from the ring (battery, heart rate, steps)
   */
  const requestData = useCallback(async () => {
    if (!ringService.isConnected()) {
      setIsConnected(false);
      return;
    }

    try {
      // Request steps data on connection
      await ringService.requestSteps();
      
      // Note: Battery and heart rate are now manual - user clicks buttons to refresh
    } catch (error) {
      console.error('Failed to request initial data:', error);
      // Don't disconnect on single request failure
    }
  }, [ringService]);

  /**
   * Sets up data notifications and polling
   */
  useEffect(() => {
    const initializeDataStream = async () => {
      try {
        // Start notifications for real-time data
        await ringService.startNotifications(handleDataUpdate, handleAccelerometerUpdate);
        
        // Note: Automatic polling removed - now using manual buttons
        setIsPolling(false);
        
        // Initial data request
        await requestData();
        
      } catch (error) {
        console.error('Failed to initialize data stream:', error);
        setIsConnected(false);
      }
    };

    initializeDataStream();

    // Cleanup function
    return () => {
      setIsPolling(false);
    };
  }, [ringService, handleDataUpdate, requestData]);

  /**
   * Enhanced connection monitoring with automatic reconnection
   */
  useEffect(() => {
    const checkStatus = () => {
      const connected = ringService.isConnected();
      setIsConnected(connected);
      setIsHeartRateMonitoring(ringService.isHeartRateMonitoring());
      setIsSpO2Monitoring(ringService.isSpO2Monitoring());
      
      if (connected) {
        setConnectionState('connected');
        setLastSeen(new Date());
        setReconnectAttempts(0);
        // Simulate signal strength (in real implementation, this would come from RSSI)
        setSignalStrength(Math.max(50, 100 - Math.random() * 30));
      } else {
        // Handle disconnection gracefully - this is expected behavior
        if (connectionState === 'connected') {
          setConnectionState('reconnecting');
          attemptReconnection();
        }
      }
    };

    // Check status every second
    const statusCheck = setInterval(checkStatus, 1000);

    return () => clearInterval(statusCheck);
  }, [ringService, connectionState]);

  /**
   * Automatic reconnection logic (Gadgetbridge insight: disconnections are normal)
   */
  const attemptReconnection = useCallback(async () => {
    if (reconnectAttempts >= 5) {
      setConnectionState('disconnected');
      return;
    }

    setConnectionState('reconnecting');
    setReconnectAttempts(prev => prev + 1);

    try {
      // Wait 2 seconds before attempting reconnection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const connected = await ringService.connect();
      if (connected) {
        setConnectionState('connected');
        setReconnectAttempts(0);
        // Restart notifications
        await ringService.startNotifications(handleDataUpdate, handleAccelerometerUpdate);
        console.log('Automatically reconnected to ring');
      } else {
        // Try again after a delay
        setTimeout(attemptReconnection, 3000);
      }
    } catch (error) {
      console.log('Reconnection attempt failed, will retry:', error);
      setTimeout(attemptReconnection, 3000);
    }
  }, [ringService, reconnectAttempts, handleDataUpdate]);

  /**
   * Manual reconnection handler
   */
  const handleManualReconnect = useCallback(async () => {
    setReconnectAttempts(0);
    await attemptReconnection();
  }, [attemptReconnection]);

  /**
   * Starts heart rate monitoring manually
   */
  const handleStartHeartRate = async () => {
    if (!ringService.isConnected()) {
      console.error('Ring is not connected');
      return;
    }

    try {
      await ringService.startRealTimeHeartRate();
      setIsHeartRateMonitoring(true);
      console.log('Heart rate monitoring started manually');
    } catch (error) {
      console.error('Failed to start heart rate monitoring:', error);
    }
  };

  /**
   * Stops heart rate monitoring manually
   */
  const handleStopHeartRate = async () => {
    if (!ringService.isConnected()) {
      console.error('Ring is not connected');
      return;
    }

    try {
      await ringService.stopRealTimeHeartRate();
      setIsHeartRateMonitoring(false);
      console.log('Heart rate monitoring stopped manually');
    } catch (error) {
      console.error('Failed to stop heart rate monitoring:', error);
    }
  };

  /**
   * Refreshes battery information manually
   */
  const handleRefreshBattery = async () => {
    if (!ringService.isConnected()) {
      console.error('Ring is not connected');
      return;
    }

    try {
      await ringService.requestBattery();
      console.log('Battery refresh requested manually');
    } catch (error) {
      console.error('Failed to refresh battery:', error);
    }
  };

  /**
   * Refreshes steps information manually
   */
  const handleRefreshSteps = async () => {
    if (!ringService.isConnected()) {
      console.error('Ring is not connected');
      return;
    }

    try {
      await ringService.requestSteps();
      console.log('Steps refresh requested manually');
    } catch (error) {
      console.error('Failed to refresh steps:', error);
    }
  };

  /**
   * Requests detailed step data with 15-minute intervals
   */
  const handleRequestDetailedSteps = async () => {
    if (!ringService.isConnected()) {
      console.error('Ring is not connected');
      return;
    }

    try {
      await ringService.requestDetailedSteps(0); // 0 = today
      console.log('Detailed steps data requested - watch for multiple packets');
    } catch (error) {
      console.error('Failed to request detailed steps:', error);
    }
  };

  /**
   * Starts SpO2 monitoring manually
   */
  const handleStartSpO2 = async () => {
    if (!ringService.isConnected()) {
      console.error('Ring is not connected');
      return;
    }

    try {
      await ringService.startRealTimeSpO2();
      setIsSpO2Monitoring(true);
      console.log('SpO2 monitoring started manually');
    } catch (error) {
      console.error('Failed to start SpO2 monitoring:', error);
    }
  };

  /**
   * Stops SpO2 monitoring manually
   */
  const handleStopSpO2 = async () => {
    if (!ringService.isConnected()) {
      console.error('Ring is not connected');
      return;
    }

    try {
      await ringService.stopRealTimeSpO2();
      setIsSpO2Monitoring(false);
      console.log('SpO2 monitoring stopped manually');
    } catch (error) {
      console.error('Failed to stop SpO2 monitoring:', error);
    }
  };

  /**
   * Starts raw accelerometer data mode
   */
  const handleStartRawData = async () => {
    if (!ringService.isConnected()) {
      console.error('Ring is not connected');
      return;
    }

    try {
      await ringService.startRawDataMode();
      setIsRawDataMode(true);
      console.log('Raw data mode started - accelerometer data incoming');
    } catch (error) {
      console.error('Failed to start raw data mode:', error);
    }
  };

  /**
   * Stops raw accelerometer data mode
   */
  const handleStopRawData = async () => {
    if (!ringService.isConnected()) {
      console.error('Ring is not connected');
      return;
    }

    try {
      await ringService.stopRawDataMode();
      setIsRawDataMode(false);
      setAccelerometerData(null); // Clear accelerometer data
      console.log('Raw data mode stopped');
    } catch (error) {
      console.error('Failed to stop raw data mode:', error);
    }
  };

  /**
   * Emergency stop all monitoring modes (stops ring flashing)
   */
  const handleStopAll = async () => {
    if (!ringService.isConnected()) {
      console.error('Ring is not connected');
      return;
    }

    try {
      console.log('🛑 Emergency Stop All - Stopping all monitoring modes...');
      
      // Stop all monitoring modes simultaneously
      const stopPromises = [];
      
      if (isHeartRateMonitoring) {
        stopPromises.push(ringService.stopRealTimeHeartRate());
      }
      
      if (isSpO2Monitoring) {
        stopPromises.push(ringService.stopRealTimeSpO2());
      }
      
      if (isRawDataMode) {
        stopPromises.push(ringService.stopRawDataMode());
      }
      
      // Wait for all stop commands to complete
      await Promise.all(stopPromises);
      
      // Update states
      setIsHeartRateMonitoring(false);
      setIsSpO2Monitoring(false);
      setIsRawDataMode(false);
      setAccelerometerData(null);
      
      console.log('✅ All monitoring stopped - Ring should stop flashing');
      
    } catch (error) {
      console.error('Error stopping all monitoring:', error);
      // Even if there's an error, update the states to reflect stopped status
      setIsHeartRateMonitoring(false);
      setIsSpO2Monitoring(false);
      setIsRawDataMode(false);
      setAccelerometerData(null);
    }
  };

  /**
   * Reboots the ring (restarts the device)
   */
  const handleRebootRing = async () => {
    if (!ringService.isConnected()) {
      console.error('Ring is not connected');
      return;
    }

    // Confirm reboot action
    const confirmed = window.confirm(
      '⚠️ Ring Reboot Confirmation\n\n' +
      'This will restart your ring device:\n' +
      '• Ring will disconnect and stop flashing\n' +
      '• Device will take 10-30 seconds to restart\n' +
      '• You will need to reconnect after reboot\n\n' +
      'Continue with reboot?'
    );

    if (!confirmed) {
      return;
    }

    try {
      console.log('🔄 Rebooting ring...');
      
      // Stop all monitoring first
      await handleStopAll();
      
      // Wait a moment for stop commands to process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Send reboot command
      await ringService.rebootRing();
      
      // Update connection state
      setIsConnected(false);
      setConnectionState('disconnected');
      
      console.log('✅ Ring reboot command sent - device is restarting');
      
    } catch (error) {
      console.error('Error rebooting ring:', error);
      // Update connection state even if reboot failed
      setIsConnected(false);
      setConnectionState('disconnected');
    }
  };

  /**
   * Handles manual disconnect
   */
  const handleDisconnect = async () => {
    try {
      // Stop all monitoring first
      await handleStopAll();
      // Then disconnect
      await ringService.disconnect();
      setIsConnected(false);
      setConnectionState('disconnected');
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  /**
   * Handles calibration adjustments
   */
  const handleCalibration = useCallback((type: 'heartRate' | 'steps', offset: number) => {
    console.log(`Applying ${type} calibration: ${offset}`);
    // In a real implementation, you would store these calibration values
    // and apply them to incoming data
    localStorage.setItem(`colmi-calibration-${type}`, offset.toString());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader
          isConnected={isConnected}
          lastUpdate={lastUpdate}
          isPolling={isPolling}
          onDisconnect={handleDisconnect}
          onStopAll={handleStopAll}
          onRebootRing={handleRebootRing}
          isAnyMonitoringActive={isHeartRateMonitoring || isSpO2Monitoring || isRawDataMode}
        />

        <ConnectionAlert isConnected={isConnected} />

        {/* Connection Status - Only show when disconnected or issues */}
        {(!isConnected || connectionState !== 'connected') && (
          <div className="mb-6">
            <ConnectionStatusCard
              isConnected={isConnected}
              connectionState={connectionState}
              signalStrength={signalStrength}
              lastSeen={!isConnected ? lastSeen : undefined}
              onReconnect={handleManualReconnect}
            />
          </div>
        )}

        {/* Tabbed Navigation */}
        <Tabs
          tabs={[
            { id: 'overview', label: 'Overview', icon: <Activity /> },
            { id: 'health', label: 'Health Metrics', icon: <Heart /> },
            { id: 'activity', label: 'Activity', icon: <TrendingUp /> },
            { id: 'sensors', label: 'Sensors', icon: <Zap /> },
            { id: 'gestures', label: 'Gestures', icon: <Target /> },
            { id: 'settings', label: 'Advanced', icon: <Settings /> },
          ]}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as TabId)}
        />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 tab-content">
            {/* Quick Stats - Compact 4-column grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <HeartRateCard
                heartRate={ringData.heartRate}
                isConnected={isConnected}
                isHeartRateMonitoring={isHeartRateMonitoring}
                onStartHeartRate={handleStartHeartRate}
                onStopHeartRate={handleStopHeartRate}
              />
              <SpO2Card
                spO2={ringData.spO2}
                isConnected={isConnected}
                isSpO2Monitoring={isSpO2Monitoring}
                onStartSpO2={handleStartSpO2}
                onStopSpO2={handleStopSpO2}
              />
              <StepsCard
                steps={ringData.steps}
                isConnected={isConnected}
                onRefreshSteps={handleRefreshSteps}
              />
              <BatteryCard
                battery={ringData.battery}
                isConnected={isConnected}
                onRefreshBattery={handleRefreshBattery}
              />
            </div>

            {/* Today's Activity Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <LiveStepsCard
                steps={ringData.steps}
                isConnected={isConnected}
                onRefreshSteps={handleRefreshSteps}
              />
              <ActivityCard
                steps={ringData.steps}
                isConnected={isConnected}
                onRefreshActivity={handleRefreshSteps}
                onRequestDetailedSteps={handleRequestDetailedSteps}
              />
            </div>
          </div>
        )}

        {/* Health Metrics Tab */}
        {activeTab === 'health' && (
          <div className="space-y-6 tab-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HeartRateCard
                heartRate={ringData.heartRate}
                isConnected={isConnected}
                isHeartRateMonitoring={isHeartRateMonitoring}
                onStartHeartRate={handleStartHeartRate}
                onStopHeartRate={handleStopHeartRate}
              />
              <SpO2Card
                spO2={ringData.spO2}
                isConnected={isConnected}
                isSpO2Monitoring={isSpO2Monitoring}
                onStartSpO2={handleStartSpO2}
                onStopSpO2={handleStopSpO2}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BatteryCard
                battery={ringData.battery}
                isConnected={isConnected}
                onRefreshBattery={handleRefreshBattery}
              />
              <DataQualityCard
                heartRate={ringData.heartRate}
                steps={ringData.steps}
                battery={ringData.battery}
                onCalibrate={handleCalibration}
                spO2={ringData.spO2}
              />
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-6 tab-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StepsCard
                steps={ringData.steps}
                isConnected={isConnected}
                onRefreshSteps={handleRefreshSteps}
              />
              <LiveStepsCard
                steps={ringData.steps}
                isConnected={isConnected}
                onRefreshSteps={handleRefreshSteps}
              />
            </div>
            <ActivityCard
              steps={ringData.steps}
              isConnected={isConnected}
              onRefreshActivity={handleRefreshSteps}
              onRequestDetailedSteps={handleRequestDetailedSteps}
            />
            <DailyStepsCard
              isConnected={isConnected}
              currentSteps={ringData.steps}
              ringService={ringService}
              onRequestDailyData={handleRequestDetailedSteps}
            />
          </div>
        )}

        {/* Sensors Tab */}
        {activeTab === 'sensors' && (
          <div className="space-y-6 tab-content">
            <AccelerometerCard
              isConnected={isConnected}
              isRawDataMode={isRawDataMode}
              accelerometerData={accelerometerData}
              onStartRawData={handleStartRawData}
              onStopRawData={handleStopRawData}
            />
            <DataQualityCard
              heartRate={ringData.heartRate}
              steps={ringData.steps}
              battery={ringData.battery}
              onCalibrate={handleCalibration}
              spO2={ringData.spO2}
            />
          </div>
        )}

        {/* Gestures Tab */}
        {activeTab === 'gestures' && (
          <div className="space-y-6 tab-content">
            <GestureTrainer
              isConnected={isConnected}
              isRawDataMode={isRawDataMode}
              accelerometerData={accelerometerData}
              onStartRawData={handleStartRawData}
              onStopRawData={handleStopRawData}
            />
          </div>
        )}

        {/* Advanced/Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6 tab-content">
            <DataQualityCard
              heartRate={ringData.heartRate}
              steps={ringData.steps}
              battery={ringData.battery}
              onCalibrate={handleCalibration}
              spO2={ringData.spO2}
            />
            <DebugInfo isConnected={isConnected} isPolling={isPolling} />
          </div>
        )}

        <StatusFooter lastUpdate={lastUpdate} />
      </div>
    </div>
  );
}