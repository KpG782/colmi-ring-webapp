/**
 * Constants and configuration for Colmi Ring Dashboard
 * Based on the actual Colmi R02 protocol implementation from Python client
 */

import { BLEConfig } from './types';

/**
 * Bluetooth Low Energy configuration for Colmi R02/R09 rings
 * These are the correct UUIDs from the Python client implementation
 * Note: UUIDs must be lowercase for Web Bluetooth API
 */
export const COLMI_BLE_CONFIG: BLEConfig = {
  serviceUUID: '6e40fff0-b5a3-f393-e0a9-e50e24dcca9e',
  writeCharacteristicUUID: '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
  notifyCharacteristicUUID: '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
};

/**
 * Device Info Service UUIDs for hardware/firmware information
 * Note: UUIDs must be lowercase for Web Bluetooth API
 */
export const DEVICE_INFO_CONFIG = {
  serviceUUID: '0000180a-0000-1000-8000-00805f9b34fb',
  hardwareRevisionUUID: '00002a27-0000-1000-8000-00805f9b34fb',
  firmwareRevisionUUID: '00002a26-0000-1000-8000-00805f9b34fb',
};

/**
 * Colmi Protocol Commands (from Python client)
 */
export const COLMI_COMMANDS = {
  BATTERY: 3,
  REBOOT: 8,
  HEART_RATE_LOG: 21,
  REAL_TIME_START: 105,
  REAL_TIME_STOP: 106,
  STEPS: 67,
} as const;

/**
 * Real-time reading types
 */
export const REAL_TIME_READINGS = {
  HEART_RATE: 1,
  BLOOD_PRESSURE: 2,
  SPO2: 3,
  FATIGUE: 4,
  HEALTH_CHECK: 5,
  ECG: 7,
  PRESSURE: 8,
  BLOOD_SUGAR: 9,
  HRV: 10,
} as const;

/**
 * Real-time actions
 */
export const REAL_TIME_ACTIONS = {
  START: 1,
  PAUSE: 2,
  CONTINUE: 3,
  STOP: 4,
} as const;

/**
 * Data polling interval in milliseconds (15 seconds for battery and steps, heart rate is real-time)
 */
export const DATA_POLLING_INTERVAL = 15000;

/**
 * Connection timeout in milliseconds
 */
export const CONNECTION_TIMEOUT = 10000;

/**
 * Device name patterns for Colmi rings (from Python client testing)
 */
export const COLMI_DEVICE_PATTERNS = [
  'R02_*',  // Most common pattern: R02_XXXX
  'R09_*',  // R09 variant
  'Colmi R02',
  'Colmi R09',
  'R02',
  'R09'
];

/**
 * Creates a properly formatted Colmi protocol packet
 * All packets are exactly 16 bytes with checksum validation
 */
export function makePacket(command: number, subData?: Uint8Array): Uint8Array {
  if (command < 0 || command > 255) {
    throw new Error('Invalid command, must be between 0 and 255');
  }
  
  const packet = new Uint8Array(16);
  packet[0] = command;
  
  if (subData) {
    if (subData.length > 14) {
      throw new Error('Sub data must be less than 14 bytes');
    }
    packet.set(subData, 1);
  }
  
  // Calculate checksum (sum of all bytes 0-14 modulo 256)
  let checksum = 0;
  for (let i = 0; i < 15; i++) {
    checksum += packet[i];
  }
  packet[15] = checksum & 255;
  
  return packet;
}

/**
 * Validates a received packet's checksum
 */
export function validatePacket(packet: Uint8Array): boolean {
  if (packet.length !== 16) {
    return false;
  }
  
  let checksum = 0;
  for (let i = 0; i < 15; i++) {
    checksum += packet[i];
  }
  
  return (checksum & 255) === packet[15];
}

/**
 * Battery request packet
 */
export const BATTERY_PACKET = makePacket(COLMI_COMMANDS.BATTERY);

/**
 * Creates a real-time heart rate start packet
 */
export function createRealTimeHeartRatePacket(): Uint8Array {
  return makePacket(COLMI_COMMANDS.REAL_TIME_START, new Uint8Array([
    REAL_TIME_READINGS.HEART_RATE,
    REAL_TIME_ACTIONS.START
  ]));
}

/**
 * Creates a real-time heart rate stop packet
 */
export function createRealTimeHeartRateStopPacket(): Uint8Array {
  return makePacket(COLMI_COMMANDS.REAL_TIME_STOP, new Uint8Array([
    REAL_TIME_READINGS.HEART_RATE,
    0,
    0
  ]));
}

/**
 * Creates a steps request packet for today (day offset 0)
 */
export function createStepsPacket(dayOffset: number = 0): Uint8Array {
  const subData = new Uint8Array([dayOffset, 0x0f, 0x00, 0x5f, 0x01]);
  return makePacket(COLMI_COMMANDS.STEPS, subData);
}

/**
 * Creates a real-time SpO2 start packet
 */
export function createRealTimeSpO2Packet(): Uint8Array {
  return makePacket(COLMI_COMMANDS.REAL_TIME_START, new Uint8Array([
    REAL_TIME_READINGS.SPO2,
    REAL_TIME_ACTIONS.START
  ]));
}

/**
 * Creates a real-time SpO2 stop packet
 */
export function createRealTimeSpO2StopPacket(): Uint8Array {
  return makePacket(COLMI_COMMANDS.REAL_TIME_STOP, new Uint8Array([
    REAL_TIME_READINGS.SPO2,
    0,
    0
  ]));
}

/**
 * Creates a raw data mode enable packet (based on MIDI Ring demo)
 */
export function createRawDataEnablePacket(): Uint8Array {
  // Command A10404 from MIDI demo
  const packet = new Uint8Array(16);
  packet[0] = 0xA1;
  packet[1] = 0x04;
  packet[2] = 0x04;
  
  // Calculate checksum
  let checksum = 0;
  for (let i = 0; i < 15; i++) {
    checksum += packet[i];
  }
  packet[15] = checksum & 255;
  
  return packet;
}

/**
 * Creates a raw data mode disable packet (based on MIDI Ring demo)
 */
export function createRawDataDisablePacket(): Uint8Array {
  // Command A102 from MIDI demo
  const packet = new Uint8Array(16);
  packet[0] = 0xA1;
  packet[1] = 0x02;
  
  // Calculate checksum
  let checksum = 0;
  for (let i = 0; i < 15; i++) {
    checksum += packet[i];
  }
  packet[15] = checksum & 255;
  
  return packet;
}

/**
 * Creates a reboot packet (from Python client)
 */
export function createRebootPacket(): Uint8Array {
  return makePacket(COLMI_COMMANDS.REBOOT, new Uint8Array([0x01]));
}