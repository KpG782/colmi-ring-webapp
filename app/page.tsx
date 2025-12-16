'use client';

import React, { useState } from 'react';
import { RingConnector, DataDashboard } from '../components';
import { ColmiRingService } from '../lib/colmi-ring-service';

/**
 * Main application page for the Colmi Ring Dashboard
 * 
 * Manages the application state and transitions between connection
 * and dashboard views based on ring connection status.
 */
export default function Home() {
  const [ringService, setRingService] = useState<ColmiRingService | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  /**
   * Handles successful ring connection
   * @param service - The connected ColmiRingService instance
   */
  const handleConnect = (service: ColmiRingService) => {
    setRingService(service);
    setIsConnected(true);
  };

  /**
   * Handles ring disconnection
   */
  const handleDisconnect = () => {
    setRingService(null);
    setIsConnected(false);
  };

  // Monitor service connection status
  React.useEffect(() => {
    if (ringService) {
      const checkConnection = () => {
        const connected = ringService.isConnected();
        if (!connected && isConnected) {
          handleDisconnect();
        }
      };

      // Check connection status every 2 seconds
      const connectionCheck = setInterval(checkConnection, 2000);

      return () => clearInterval(connectionCheck);
    }
  }, [ringService, isConnected]);

  return (
    <div className="min-h-screen">
      {isConnected && ringService ? (
        <DataDashboard ringService={ringService} />
      ) : (
        <RingConnector onConnect={handleConnect} />
      )}
    </div>
  );
}
