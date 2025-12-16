/**
 * TypeScript interfaces for the Colmi Ring Dashboard application
 */

import type { ColmiRingService } from './colmi-ring-service';

/**
 * Raw accelerometer data from Colmi ring
 * Based on @atc1441's MIDI Ring implementation
 */
export interface AccelerometerData {
  /** Raw 12-bit X-axis value */
  rawX: number;
  /** Raw 12-bit Y-axis value */
  rawY: number;
  /** Raw 12-bit Z-axis value */
  rawZ: number;
  /** G-force X-axis value (±4G range) */
  gX: number;
  /** G-force Y-axis value (±4G range) */
  gY: number;
  /** G-force Z-axis value (±4G range) */
  gZ: number;
  /** X-axis rotation angle in radians */
  rotateX: number;
  /** Y-axis rotation angle in radians */
  rotateY: number;
  /** Z-axis rotation angle in radians */
  rotateZ: number;
  /** Unix timestamp of when data was collected */
  timestamp: number;
}

/**
 * Health metrics data structure from Colmi smart ring
 */
export interface RingData {
  /** Heart rate in beats per minute, null if unavailable */
  heartRate: number | null;
  /** Step count, null if unavailable */
  steps: number | null;
  /** Battery percentage (0-100), null if unavailable */
  battery: number | null;
  /** Blood oxygen saturation percentage (0-100), null if unavailable */
  spO2: number | null;
  /** Raw accelerometer data, null if unavailable */
  accelerometer: AccelerometerData | null;
  /** Unix timestamp of when data was collected */
  timestamp: number;
  /** Optional detailed activity data */
  activityData?: ActivityData;
}

/**
 * Detailed activity data from Colmi ring (15-minute intervals)
 * Based on Python client's SportDetail structure
 */
export interface ActivityData {
  /** Year (e.g., 2024) */
  year: number;
  /** Month (1-12) */
  month: number;
  /** Day (1-31) */
  day: number;
  /** Time index representing 15-minute intervals within a day (0-95) */
  timeIndex: number;
  /** Calories burned in this interval */
  calories: number;
  /** Steps taken in this interval */
  steps: number;
  /** Distance traveled in meters */
  distance: number;
  /** Calculated timestamp for this interval */
  timestamp: Date;
}

/**
 * Props for the RingConnector component
 */
export interface RingConnectorProps {
  /** Callback function called when ring connection is established */
  onConnect: (service: ColmiRingService) => void;
}

/**
 * Props for the DataDashboard component
 */
export interface DataDashboardProps {
  /** Instance of the ring service for data communication */
  ringService: ColmiRingService;
}

/**
 * Connection states for the ring connector
 */
export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected';

/**
 * Error information for connection failures
 */
export interface ConnectionError {
  /** Error message to display to user */
  message: string;
  /** Optional troubleshooting guidance */
  troubleshooting?: string;
}

/**
 * Bluetooth Low Energy configuration for Colmi rings
 */
export interface BLEConfig {
  /** Primary service UUID for Colmi ring communication */
  serviceUUID: string;
  /** Characteristic UUID for writing commands to ring */
  writeCharacteristicUUID: string;
  /** Characteristic UUID for receiving notifications from ring */
  notifyCharacteristicUUID: string;
}

// ColmiRingService is now exported from ./colmi-ring-service