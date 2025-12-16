/**
 * ColmiRingService - Bluetooth Low Energy service for Colmi smart rings
 *
 * This service handles all BLE communication with Colmi R02/R09 smart rings,
 * including device discovery, connection management, and data exchange.
 * Updated to use the correct Colmi R02 protocol based on the Python client.
 */

import { RingData } from './types';
import {
  COLMI_BLE_CONFIG,
  COLMI_DEVICE_PATTERNS,
  COLMI_COMMANDS,
  REAL_TIME_READINGS,
  BATTERY_PACKET,
  createRealTimeHeartRatePacket,
  createRealTimeHeartRateStopPacket,
  createRealTimeSpO2Packet,
  createRealTimeSpO2StopPacket,
  createRawDataEnablePacket,
  createRawDataDisablePacket,
  createStepsPacket,
  createRebootPacket
} from './constants';

export class ColmiRingService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private service: BluetoothRemoteGATTService | null = null;
  private writeCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private notifyCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private connected: boolean = false;
  private isPollingHeartRate: boolean = false;
  private isPollingSpO2: boolean = false;
  private isRawDataMode: boolean = false;
  private heartRatePollingInterval: NodeJS.Timeout | null = null;
  private lastHeartRatePacketTime: number = 0;
  private lastSpO2PacketTime: number = 0;
  private heartRateTimeoutCheck: NodeJS.Timeout | null = null;
  private spO2TimeoutCheck: NodeJS.Timeout | null = null;
  private accelerometerCallback: ((data: any) => void) | undefined;

  /**
   * Initiates device discovery and establishes GATT connection to Colmi ring
   * @returns Promise<boolean> - true if connection successful, false otherwise
   */
  async connect(): Promise<boolean> {
    try {
      // Check if Web Bluetooth is supported
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth API is not supported in this browser');
      }

      // Request device with Colmi-specific filters
      // Since your ring "R02_4101" is already paired, we'll use a more flexible approach
      try {
        // First try with specific name patterns
        const filters = [];

        // Add namePrefix filters for wildcard patterns
        filters.push({ namePrefix: 'R02_' });
        filters.push({ namePrefix: 'R09_' });

        // Add exact name filters
        filters.push({ name: 'Colmi R02' });
        filters.push({ name: 'Colmi R09' });
        filters.push({ name: 'R02' });
        filters.push({ name: 'R09' });

        this.device = await navigator.bluetooth.requestDevice({
          filters: filters,
          optionalServices: [COLMI_BLE_CONFIG.serviceUUID]
        });
      } catch (filterError) {
        // If specific filters fail, try a more general approach
        console.log('Specific filters failed, trying general scan:', filterError);

        this.device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [COLMI_BLE_CONFIG.serviceUUID]
        });
      }

      // Add disconnect event listener
      this.device.addEventListener('gattserverdisconnected', this.handleDisconnection.bind(this));

      // Connect to GATT server
      this.server = await this.device.gatt!.connect();

      // Get the primary service
      this.service = await this.server.getPrimaryService(COLMI_BLE_CONFIG.serviceUUID);

      // Get characteristics for communication
      this.writeCharacteristic = await this.service.getCharacteristic(
        COLMI_BLE_CONFIG.writeCharacteristicUUID
      );

      this.notifyCharacteristic = await this.service.getCharacteristic(
        COLMI_BLE_CONFIG.notifyCharacteristicUUID
      );

      this.connected = true;
      return true;

    } catch (error) {
      console.error('Connection failed:', error);

      // Provide specific error messages for common issues
      if (error instanceof Error) {
        if (error.message.includes('User cancelled')) {
          console.log('User cancelled device selection');
        } else if (error.message.includes('not found') || error.message.includes('No device selected')) {
          console.log('No compatible device found or selected');
        } else if (error.message.includes('GATT Server is disconnected')) {
          console.log('Device is not available for connection (may be connected to another app)');
        } else if (error.message.includes('Invalid Service name')) {
          console.log('Service UUID format error - this should be fixed now');
        }
      }

      this.cleanup();
      return false;
    }
  }

  /**
   * Cleanly terminates the connection to the ring
   * @returns Promise<void>
   */
  async disconnect(): Promise<void> {
    try {
      if (this.server && this.server.connected) {
        this.server.disconnect();
      }
    } catch (error) {
      console.error('Error during disconnect:', error);
    } finally {
      this.cleanup();
    }
  }

  /**
   * Returns the current connection status
   * @returns boolean - true if connected, false otherwise
   */
  isConnected(): boolean {
    return this.connected && this.server?.connected === true;
  }

  /**
   * Returns the current heart rate monitoring status
   * @returns boolean - true if monitoring, false otherwise
   */
  isHeartRateMonitoring(): boolean {
    return this.isPollingHeartRate;
  }

  /**
   * Returns the current SpO2 monitoring status
   * @returns boolean - true if monitoring, false otherwise
   */
  isSpO2Monitoring(): boolean {
    return this.isPollingSpO2;
  }

  /**
   * Returns the current raw data mode status
   * @returns boolean - true if raw data mode is active, false otherwise
   */
  getRawDataMode(): boolean {
    return this.isRawDataMode;
  }

  /**
   * Enables data notifications from the ring
   * @param callback - Function to call when new data is received
   * @param accelerometerCallback - Optional function to call when accelerometer data is received
   * @returns Promise<void>
   */
  async startNotifications(
    callback: (data: RingData) => void,
    accelerometerCallback?: (data: any) => void
  ): Promise<void> {
    if (!this.notifyCharacteristic) {
      throw new Error('Not connected to ring or notification characteristic not available');
    }

    // Store the accelerometer callback for use in parseData
    this.accelerometerCallback = accelerometerCallback;

    // Set up notification handler
    this.notifyCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
      const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
      const data = this.parseData(characteristic.value!);
      if (data) {
        callback(data);
      }
    });

    // Start notifications
    await this.notifyCharacteristic.startNotifications();
  }

  /**
   * Requests battery information from the ring
   * @returns Promise<void>
   */
  async requestBattery(): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Ring is not connected');
    }

    try {
      await this.sendCommand(BATTERY_PACKET, 'battery request');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to request battery: ${errorMessage}`);
    }
  }

  /**
   * Starts real-time heart rate monitoring
   * Based on Python client approach - no continue commands needed
   * @returns Promise<void>
   */
  async startRealTimeHeartRate(): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Ring is not connected');
    }

    if (this.isPollingHeartRate) {
      return; // Already polling
    }

    try {
      const startPacket = createRealTimeHeartRatePacket();
      await this.sendCommand(startPacket, 'start real-time heart rate');
      this.isPollingHeartRate = true;
      this.lastHeartRatePacketTime = Date.now();

      // Start monitoring for timeout (if no packets received for 10 seconds)
      this.startHeartRateTimeoutMonitoring();

      console.log('Heart rate monitoring started - ring will send readings automatically');
      console.log('Make sure ring is properly positioned on your finger for best results');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to start real-time heart rate: ${errorMessage}`);
    }
  }

  /**
   * Monitors for heart rate timeout and provides feedback
   */
  private startHeartRateTimeoutMonitoring(): void {
    if (this.heartRateTimeoutCheck) {
      clearInterval(this.heartRateTimeoutCheck);
    }

    this.heartRateTimeoutCheck = setInterval(() => {
      if (!this.isPollingHeartRate) {
        this.stopHeartRateTimeoutMonitoring();
        return;
      }

      const timeSinceLastPacket = Date.now() - this.lastHeartRatePacketTime;

      if (timeSinceLastPacket > 10000) { // 10 seconds without packets
        console.warn('⚠️ Heart rate monitoring may have stopped - no packets received for 10 seconds');
        console.log('💡 Try repositioning the ring or restart monitoring if needed');
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Stops heart rate timeout monitoring
   */
  private stopHeartRateTimeoutMonitoring(): void {
    if (this.heartRateTimeoutCheck) {
      clearInterval(this.heartRateTimeoutCheck);
      this.heartRateTimeoutCheck = null;
    }
  }

  /**
   * Stops real-time heart rate monitoring
   * @returns Promise<void>
   */
  async stopRealTimeHeartRate(): Promise<void> {
    if (!this.isConnected()) {
      return;
    }

    if (!this.isPollingHeartRate) {
      return; // Not polling
    }

    try {
      // Stop timeout monitoring first
      this.stopHeartRateTimeoutMonitoring();

      const stopPacket = createRealTimeHeartRateStopPacket();
      await this.sendCommand(stopPacket, 'stop real-time heart rate');
      this.isPollingHeartRate = false;
      console.log('Heart rate monitoring stopped');
    } catch (error) {
      console.error('Failed to stop real-time heart rate:', error);
    }
  }

  /**
   * Starts real-time SpO2 monitoring
   * Based on Python client approach for SPO2 readings
   * @returns Promise<void>
   */
  async startRealTimeSpO2(): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Ring is not connected');
    }

    if (this.isPollingSpO2) {
      return; // Already polling
    }

    try {
      const startPacket = createRealTimeSpO2Packet();
      await this.sendCommand(startPacket, 'start real-time SpO2');
      this.isPollingSpO2 = true;
      this.lastSpO2PacketTime = Date.now();

      // Start monitoring for timeout
      this.startSpO2TimeoutMonitoring();

      console.log('SpO2 monitoring started - ring will send readings automatically');
      console.log('Keep ring still on finger for accurate SpO2 readings');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to start real-time SpO2: ${errorMessage}`);
    }
  }

  /**
   * Monitors for SpO2 timeout and provides feedback
   */
  private startSpO2TimeoutMonitoring(): void {
    if (this.spO2TimeoutCheck) {
      clearInterval(this.spO2TimeoutCheck);
    }

    this.spO2TimeoutCheck = setInterval(() => {
      if (!this.isPollingSpO2) {
        this.stopSpO2TimeoutMonitoring();
        return;
      }

      const timeSinceLastPacket = Date.now() - this.lastSpO2PacketTime;

      if (timeSinceLastPacket > 15000) { // 15 seconds without packets
        console.warn('⚠️ SpO2 monitoring may have stopped - no packets received for 15 seconds');
        console.log('💡 SpO2 readings take longer than heart rate - keep ring still');
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Stops SpO2 timeout monitoring
   */
  private stopSpO2TimeoutMonitoring(): void {
    if (this.spO2TimeoutCheck) {
      clearInterval(this.spO2TimeoutCheck);
      this.spO2TimeoutCheck = null;
    }
  }

  /**
   * Stops real-time SpO2 monitoring
   * @returns Promise<void>
   */
  async stopRealTimeSpO2(): Promise<void> {
    if (!this.isConnected()) {
      return;
    }

    if (!this.isPollingSpO2) {
      return; // Not polling
    }

    try {
      // Stop timeout monitoring first
      this.stopSpO2TimeoutMonitoring();

      const stopPacket = createRealTimeSpO2StopPacket();
      await this.sendCommand(stopPacket, 'stop real-time SpO2');
      this.isPollingSpO2 = false;
      console.log('SpO2 monitoring stopped');
    } catch (error) {
      console.error('Failed to stop real-time SpO2:', error);
    }
  }

  /**
   * Enables raw accelerometer data mode
   * Based on MIDI Ring demo implementation
   * @returns Promise<void>
   */
  async startRawDataMode(): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Ring is not connected');
    }

    try {
      const enablePacket = createRawDataEnablePacket();
      await this.sendCommand(enablePacket, 'enable raw data mode');
      this.isRawDataMode = true;
      console.log('Raw data mode enabled - ring will send accelerometer data');
      console.log('Data type 3 packets will contain X/Y/Z accelerometer values');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to enable raw data mode: ${errorMessage}`);
    }
  }

  /**
   * Disables raw accelerometer data mode
   * @returns Promise<void>
   */
  async stopRawDataMode(): Promise<void> {
    if (!this.isConnected()) {
      return;
    }

    if (!this.isRawDataMode) {
      return; // Not in raw mode
    }

    try {
      const disablePacket = createRawDataDisablePacket();
      await this.sendCommand(disablePacket, 'disable raw data mode');
      this.isRawDataMode = false;
      console.log('Raw data mode disabled');
    } catch (error) {
      console.error('Failed to disable raw data mode:', error);
    }
  }

  /**
   * Requests step data for today
   * @returns Promise<void>
   */
  async requestSteps(): Promise<void> {
    if (!this.isConnected()) {
      console.warn('Cannot request steps: Ring is not connected');
      return; // Fail silently to avoid crashing the UI
    }

    try {
      const stepsPacket = createStepsPacket(0); // 0 = today
      await this.sendCommand(stepsPacket, 'steps request');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // Log error but don't throw - this prevents UI crashes from transient connection issues
      console.warn(`Failed to request steps: ${errorMessage}`);
      // Connection might be weak or temporarily lost, will retry on next poll
    }
  }

  /**
   * Requests detailed step data with 15-minute intervals
   * Based on Python client's get_steps() method
   * @param dayOffset - Days back from today (0 = today, 1 = yesterday, etc.)
   * @returns Promise<void>
   */
  async requestDetailedSteps(dayOffset: number = 0): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Ring is not connected');
    }

    try {
      const stepsPacket = createStepsPacket(dayOffset);
      await this.sendCommand(stepsPacket, `detailed steps request (${dayOffset} days back)`);
      console.log(`Requesting detailed step data for ${dayOffset === 0 ? 'today' : `${dayOffset} days ago`}`);
      console.log('This will return multiple packets with 15-minute interval data');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to request detailed steps: ${errorMessage}`);
    }
  }

  /**
   * Reboots the ring (restarts the device)
   * Based on Python client's reboot() method
   * @returns Promise<void>
   */
  async rebootRing(): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Ring is not connected');
    }

    try {
      const rebootPacket = createRebootPacket();
      await this.sendCommand(rebootPacket, 'ring reboot');
      console.log('🔄 Ring reboot command sent - device will restart');
      console.log('⚠️ Ring will disconnect and may take 10-30 seconds to become available again');

      // The ring will disconnect after reboot, so clean up our connection state
      setTimeout(() => {
        this.cleanup();
      }, 2000); // Give the command time to be processed before cleanup

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to reboot ring: ${errorMessage}`);
    }
  }

  /**
   * Sends a command to the ring with error handling and timeout protection
   * @param command - Command bytes to send
   * @param commandName - Human-readable command name for error messages
   * @returns Promise<void>
   * @throws Error if command transmission fails
   */
  private async sendCommand(command: Uint8Array, commandName: string): Promise<void> {
    if (!this.writeCharacteristic) {
      throw new Error('Write characteristic not available');
    }

    try {
      // Validate command format
      if (!command) {
        throw new Error('Invalid command format');
      }

      // Validate command length
      if (command.length === 0) {
        throw new Error('Invalid command format');
      }

      // Ensure we're still connected before sending
      if (!this.isConnected()) {
        throw new Error('Connection lost before sending command');
      }

      // Send command with proper error handling
      // Create a new Uint8Array with proper ArrayBuffer to satisfy TypeScript
      const buffer = new ArrayBuffer(command.length);
      const view = new Uint8Array(buffer);
      view.set(command);
      await this.writeCharacteristic.writeValue(view);

      // Log successful command transmission
      console.log(`Successfully sent ${commandName} command:`, Array.from(command).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '));

    } catch (error) {
      // Handle different types of BLE errors
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NetworkError':
            throw new Error(`Network error while sending ${commandName}: Device may be out of range`);
          case 'InvalidStateError':
            throw new Error(`Invalid state error while sending ${commandName}: Connection may be lost`);
          case 'NotSupportedError':
            throw new Error(`Operation not supported while sending ${commandName}: Device may not support this command`);
          default:
            throw new Error(`BLE error while sending ${commandName}: ${error.message}`);
        }
      }

      // Re-throw other errors with context
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Command transmission failed for ${commandName}: ${errorMessage}`);
    }
  }

  /**
   * Parses raw data received from the ring into RingData format
   * @param dataView - Raw data from BLE characteristic
   * @returns RingData | null - Parsed data or null if parsing fails
   */
  private parseData(dataView: DataView): RingData | null {
    try {
      if (dataView.byteLength !== 16) {
        console.warn('Invalid packet length:', dataView.byteLength);
        return null;
      }

      // Convert DataView to Uint8Array for easier processing
      const packet = new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength);

      // Validate packet checksum
      if (!this.validatePacket(packet)) {
        console.warn('Invalid packet checksum:', packet);
        return null;
      }

      const command = packet[0];

      // Log received packet for debugging
      console.log('Received packet:', Array.from(packet).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '));

      // Note: 0xA1 (161) is NOT an error - it's raw data mode!
      // Only commands with bit 7 set AND not 0xA1 are errors
      if (command >= 127 && command !== 0xA1) {
        console.warn('Error response from ring:', packet);
        return null;
      }

      const data: RingData = {
        heartRate: null,
        steps: null,
        battery: null,
        spO2: null,
        accelerometer: null,
        timestamp: Date.now()
      };

      switch (command) {
        case COLMI_COMMANDS.BATTERY:
          data.battery = this.parseBattery(packet);
          break;

        case COLMI_COMMANDS.REAL_TIME_START:
          const realTimeData = this.parseRealTimeReading(packet);
          if (realTimeData !== null) {
            if (realTimeData.type === 'heartRate') {
              data.heartRate = realTimeData.value;
            } else if (realTimeData.type === 'spO2') {
              data.spO2 = realTimeData.value;
            }
          }
          break;

        case COLMI_COMMANDS.STEPS:
          const steps = this.parseSteps(packet);
          if (steps !== null) {
            data.steps = steps;
          }
          break;

        case 0xA1: // Raw data packets (from MIDI Ring demo)
          const rawData = this.parseRawAccelerometerData(packet);
          if (rawData) {
            // Add raw accelerometer data to the response
            data.accelerometer = rawData;

            // Also call the dedicated accelerometer callback if provided
            if (this.accelerometerCallback) {
              this.accelerometerCallback(rawData);
            }

            console.log('Raw accelerometer data:', rawData);
          }
          break;

        default:
          console.log('Unhandled command:', command, 'packet:', packet);
          return null;
      }

      return data;

    } catch (error) {
      console.error('Error parsing ring data:', error);
      return null;
    }
  }

  /**
   * Validates a received packet's checksum
   */
  private validatePacket(packet: Uint8Array): boolean {
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
   * Parses battery data from packet
   * Based on Python client: battery.py parse_battery()
   * Format: [CMD, BATTERY_LEVEL, CHARGING_STATUS, ...]
   */
  private parseBattery(packet: Uint8Array): number | null {
    try {
      // Battery level is in byte 1 (0-100) - Python client: packet[1]
      const batteryLevel = packet[1];
      // Charging status in byte 2 - Python client: bool(packet[2])
      const charging = packet[2] !== 0;

      console.log(`Battery info - Level: ${batteryLevel}%, Charging: ${charging}`);

      // Validate battery level range (0-100%)
      if (batteryLevel < 0 || batteryLevel > 100) {
        console.warn('Invalid battery level received:', batteryLevel);
        return null;
      }

      return batteryLevel;
    } catch (error) {
      console.error('Error parsing battery data:', error);
      return null;
    }
  }

  /**
   * Parses real-time reading data from packet
   * Format: [CMD, READING_TYPE, ERROR_CODE, VALUE, ...]
   * Based on Python client: real_time.py parse_real_time_reading()
   */
  private parseRealTimeReading(packet: Uint8Array): { type: 'heartRate' | 'spO2', value: number } | null {
    try {
      const readingType = packet[1];
      const errorCode = packet[2];
      const value = packet[3];

      // Log additional bytes that might contain sensor data
      const sensorData1 = packet[6];
      const sensorData2 = packet[7];

      console.log(`Real-time reading - Type: ${readingType}, Error: ${errorCode}, Value: ${value}, SensorData: [${sensorData1}, ${sensorData2}]`);

      // Check for errors first
      if (errorCode !== 0) {
        console.warn('Real-time reading error code:', errorCode, 'for type:', readingType);
        return null;
      }

      // Process heart rate readings
      if (readingType === REAL_TIME_READINGS.HEART_RATE) {
        // Update last packet time for timeout monitoring
        this.lastHeartRatePacketTime = Date.now();

        // The Python client accepts any non-zero value as valid
        if (value > 0 && value < 255) {
          console.log(`✅ Heart rate detected: ${value} BPM (sensor locked on)`);
          return { type: 'heartRate', value };
        } else if (value === 0) {
          // Check sensor mode based on byte 7 pattern observed
          if (sensorData2 === 3) {
            console.log(`🔍 HR sensor in pulse detection mode but reading 0 - may have lost contact`);
          } else if (sensorData2 === 2) {
            console.log(`🔍 HR sensor searching for pulse (data: ${sensorData1}) - keep ring still`);
          } else {
            console.log('💤 HR sensor initializing - make sure ring is on finger with good contact');
          }
          return null;
        } else {
          console.warn('Invalid heart rate value:', value);
          return null;
        }
      }

      // Process SpO2 readings
      else if (readingType === REAL_TIME_READINGS.SPO2) {
        // Update last packet time for timeout monitoring
        this.lastSpO2PacketTime = Date.now();

        // SpO2 values should be between 70-100% typically
        if (value > 0 && value <= 100) {
          console.log(`✅ SpO2 detected: ${value}% (oxygen saturation)`);
          return { type: 'spO2', value };
        } else if (value === 0) {
          console.log('🔍 SpO2 sensor measuring - readings may take 10-30 seconds');
          return null;
        } else {
          console.warn('Invalid SpO2 value:', value);
          return null;
        }
      }

      else {
        console.log('Unhandled reading type:', readingType, 'value:', value);
        return null;
      }

    } catch (error) {
      console.error('Error parsing real-time reading:', error);
      return null;
    }
  }

  // Store daily step intervals for accumulation
  private dailyStepIntervals: Map<number, { steps: number; calories: number; distance: number }> = new Map();

  /**
   * Parses steps data from packet
   * Based on Python client: steps.py SportDetailParser
   * Steps data comes in multiple packets - this accumulates daily total
   */
  private parseSteps(packet: Uint8Array): number | null {
    try {
      console.log('Steps packet received:', Array.from(packet).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '));

      // Check for "no data" response (Python client checks packet[1] === 255)
      if (packet[1] === 255) {
        console.log('No steps data available for requested day');
        return 0; // Return 0 instead of null to show in UI
      }

      // Check for initial metadata packet (Python client checks packet[1] === 240)
      if (packet[1] === 240) {
        console.log('Steps metadata packet received - waiting for data packets');
        return null; // Wait for actual data packets
      }

      // Parse actual step data packet
      // Format from Python client: [CMD, year_bcd, month_bcd, day_bcd, time_index, ?, ?, calories_low, calories_high, steps_low, steps_high, distance_low, distance_high, ?, ?, checksum]
      try {
        // Convert BCD to decimal for date (Python client: bcd_to_decimal)
        const year = this.bcdToDecimal(packet[1]) + 2000;
        const month = this.bcdToDecimal(packet[2]);
        const day = this.bcdToDecimal(packet[3]);
        const timeIndex = packet[4]; // 15-minute intervals within a day

        // Extract step count (little-endian 16-bit)
        const steps = packet[9] | (packet[10] << 8);
        const calories = packet[7] | (packet[8] << 8);
        const distance = packet[11] | (packet[12] << 8);

        console.log(`Steps data - Date: ${year}-${month}-${day}, Time: ${timeIndex}, Steps: ${steps}, Calories: ${calories}, Distance: ${distance}m`);

        if (steps >= 0 && steps < 65535) {
          // Store this interval's data
          this.dailyStepIntervals.set(timeIndex, { steps, calories, distance });

          // Calculate total daily steps by summing all intervals
          let totalDailySteps = 0;
          for (const intervalData of this.dailyStepIntervals.values()) {
            totalDailySteps += intervalData.steps;
          }

          console.log(`📊 Daily step accumulation: ${totalDailySteps} total steps from ${this.dailyStepIntervals.size} intervals`);

          // Return the accumulated daily total
          return totalDailySteps;
        }
      } catch (parseError) {
        console.log('Could not parse step count from packet:', parseError);
      }

      return null;
    } catch (error) {
      console.error('Error parsing steps data:', error);
      return null;
    }
  }

  /**
   * Gets the current daily step breakdown
   * @returns Map of time intervals to step data
   */
  getDailyStepBreakdown(): Map<number, { steps: number; calories: number; distance: number }> {
    return new Map(this.dailyStepIntervals);
  }

  /**
   * Gets total daily steps accumulated so far
   * @returns Total steps for the day
   */
  getTotalDailySteps(): number {
    let total = 0;
    for (const intervalData of this.dailyStepIntervals.values()) {
      total += intervalData.steps;
    }
    return total;
  }

  /**
   * Parses raw accelerometer data from packet
   * Based on @atc1441's MIDI Ring implementation
   * @param packet Raw data packet from ring
   * @returns Parsed accelerometer data or null
   */
  private parseRawAccelerometerData(packet: Uint8Array): any | null {
    try {
      // Check if this is accelerometer data (data type 3)
      if (packet.length < 8 || packet[1] !== 3) {
        return null;
      }

      // Convert 12-bit signed integer (from @atc1441's code)
      const int12 = (uint12: number): number => {
        return uint12 > 2047 ? uint12 - 4096 : uint12;
      };

      // Extract 12-bit values using bit shifting (from @atc1441)
      const rawY = int12((((packet[2] << 4) | (packet[3] & 0xf)) & 0xfff));
      const rawZ = int12((((packet[4] << 4) | (packet[5] & 0xf)) & 0xfff));
      const rawX = int12((((packet[6] << 4) | (packet[7] & 0xf)) & 0xfff));

      // Convert to G-force values (±4G accelerometer)
      const convertRawToG = (rawValue: number): number => {
        const rangeG = 4; // ±4G
        return (rawValue / 2048) * rangeG;
      };

      const gX = convertRawToG(rawX);
      const gY = convertRawToG(rawY);
      const gZ = convertRawToG(rawZ);

      // Calculate rotation angles (orientation)
      const rotateX = Math.atan2(gX, Math.sqrt(gY * gY + gZ * gZ));
      const rotateY = Math.atan2(gY, Math.sqrt(gX * gX + gZ * gZ));
      const rotateZ = Math.atan2(gZ, Math.sqrt(gX * gX + gY * gY));

      console.log(`🎯 Raw accelerometer - X:${rawX} Y:${rawY} Z:${rawZ} | G-force X:${gX.toFixed(2)} Y:${gY.toFixed(2)} Z:${gZ.toFixed(2)} | Rotation X:${(rotateX * 180/Math.PI).toFixed(1)}° Y:${(rotateY * 180/Math.PI).toFixed(1)}° Z:${(rotateZ * 180/Math.PI).toFixed(1)}°`);

      return {
        rawX,
        rawY,
        rawZ,
        gX,
        gY,
        gZ,
        rotateX,
        rotateY,
        rotateZ,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error parsing raw accelerometer data:', error);
      return null;
    }
  }

  /**
   * Converts BCD (Binary Coded Decimal) to decimal
   * Used for date parsing in steps data
   */
  private bcdToDecimal(bcd: number): number {
    return (((bcd >> 4) & 15) * 10) + (bcd & 15);
  }

  /**
   * Handles disconnection events from the device
   */
  private handleDisconnection(): void {
    console.log('Ring disconnected');
    this.cleanup();
  }

  /**
   * Cleans up connection resources
   */
  private cleanup(): void {
    // Stop any ongoing monitoring
    if (this.isPollingHeartRate) {
      this.stopRealTimeHeartRate().catch(console.error);
    }
    if (this.isPollingSpO2) {
      this.stopRealTimeSpO2().catch(console.error);
    }

    // Clear any polling intervals
    if (this.heartRatePollingInterval) {
      clearInterval(this.heartRatePollingInterval);
      this.heartRatePollingInterval = null;
    }

    // Clear timeout monitoring
    this.stopHeartRateTimeoutMonitoring();
    this.stopSpO2TimeoutMonitoring();

    this.connected = false;
    this.isPollingHeartRate = false;
    this.isPollingSpO2 = false;
    // Clear daily step data on disconnect
    this.dailyStepIntervals.clear();
    this.device = null;
    this.server = null;
    this.service = null;
    this.writeCharacteristic = null;
    this.notifyCharacteristic = null;
  }
}
