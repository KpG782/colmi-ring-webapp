'use client';

import React, { useState, useEffect } from 'react';
import { Compass, RotateCcw, Play, Square, Zap, Target } from 'lucide-react';
import { AccelerometerData } from '../lib/types';



interface AccelerometerCardProps {
  isConnected: boolean;
  isRawDataMode?: boolean;
  accelerometerData?: AccelerometerData | null;
  onStartRawData?: () => void;
  onStopRawData?: () => void;
}

/**
 * AccelerometerCard Component
 *
 * Shows raw accelerometer data from Colmi ring with 3D orientation.
 * Based on @atc1441's MIDI Ring implementation for raw data parsing.
 */
export function AccelerometerCard({
  isConnected,
  isRawDataMode = false,
  accelerometerData: realAccelerometerData,
  onStartRawData,
  onStopRawData
}: AccelerometerCardProps) {
  const [dataHistory, setDataHistory] = useState<AccelerometerData[]>([]);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibrationOffset, setCalibrationOffset] = useState({ x: 0, y: 0, z: 0 });



  // Update data history when real accelerometer data is received
  useEffect(() => {
    if (realAccelerometerData && isRawDataMode) {
      // Apply calibration offset
      const calibratedData = {
        ...realAccelerometerData,
        rotateX: realAccelerometerData.rotateX - calibrationOffset.x,
        rotateY: realAccelerometerData.rotateY - calibrationOffset.y,
        rotateZ: realAccelerometerData.rotateZ - calibrationOffset.z,
      };

      setDataHistory(prev => [...prev.slice(-19), calibratedData]); // Keep last 20 readings
    }
  }, [realAccelerometerData, isRawDataMode, calibrationOffset]);

  const handleStartRawData = async () => {
    await onStartRawData?.();
  };

  const handleStopRawData = async () => {
    await onStopRawData?.();
  };

  const handleCalibrate = () => {
    if (realAccelerometerData) {
      setCalibrationOffset({
        x: realAccelerometerData.rotateX,
        y: realAccelerometerData.rotateY,
        z: realAccelerometerData.rotateZ
      });
      setIsCalibrating(true);
      setTimeout(() => setIsCalibrating(false), 1000);
    }
  };

  // Convert radians to degrees for display
  const toDegrees = (radians: number): number => {
    return (radians * 180) / Math.PI;
  };

  // Get detailed orientation description with real-world context
  const getOrientationDescription = (): { description: string; details: string; emoji: string } => {
    if (!realAccelerometerData) return { description: 'No data', details: '', emoji: '❓' };

    const { rotateX, rotateY, rotateZ } = realAccelerometerData;
    const xDeg = toDegrees(rotateX - calibrationOffset.x);
    const yDeg = toDegrees(rotateY - calibrationOffset.y);
    const zDeg = toDegrees(rotateZ - calibrationOffset.z);

    const absX = Math.abs(xDeg);
    const absY = Math.abs(yDeg);
    const absZ = Math.abs(zDeg);

    // Determine primary orientation
    if (absX < 15 && absY < 15 && absZ < 15) {
      return {
        description: 'Ring is level/flat',
        details: 'Ring face is parallel to ground',
        emoji: '📱'
      };
    }

    if (absX > 60) {
      const direction = xDeg > 0 ? 'forward' : 'backward';
      return {
        description: `Ring tilted ${direction}`,
        details: `X-axis rotation: ${xDeg.toFixed(1)}° (hand pitch)`,
        emoji: xDeg > 0 ? '⬆️' : '⬇️'
      };
    }

    if (absY > 60) {
      const direction = yDeg > 0 ? 'right' : 'left';
      return {
        description: `Ring tilted ${direction}`,
        details: `Y-axis rotation: ${yDeg.toFixed(1)}° (hand roll)`,
        emoji: yDeg > 0 ? '➡️' : '⬅️'
      };
    }

    if (absZ > 60) {
      const direction = zDeg > 0 ? 'clockwise' : 'counter-clockwise';
      return {
        description: `Ring rotated ${direction}`,
        details: `Z-axis rotation: ${zDeg.toFixed(1)}° (hand twist)`,
        emoji: zDeg > 0 ? '🔄' : '🔃'
      };
    }

    return {
      description: 'Ring is slightly tilted',
      details: `X: ${xDeg.toFixed(1)}°, Y: ${yDeg.toFixed(1)}°, Z: ${zDeg.toFixed(1)}°`,
      emoji: '📐'
    };
  };

  // Get movement intensity description
  const getMovementIntensity = (): { level: string; color: string; description: string } => {
    if (!realAccelerometerData) return { level: 'None', color: 'gray', description: 'No data' };

    const { gX, gY, gZ } = realAccelerometerData;
    const totalG = Math.sqrt(gX * gX + gY * gY + gZ * gZ);

    if (totalG < 0.5) return { level: 'Very Still', color: 'blue', description: 'Ring is barely moving' };
    if (totalG < 1.2) return { level: 'Gentle', color: 'green', description: 'Light hand movements' };
    if (totalG < 2.0) return { level: 'Moderate', color: 'yellow', description: 'Normal hand gestures' };
    if (totalG < 3.0) return { level: 'Active', color: 'orange', description: 'Energetic movements' };
    return { level: 'Intense', color: 'red', description: 'Rapid or forceful motion' };
  };

  // Get axis-specific descriptions
  const getAxisDescription = (axis: 'X' | 'Y' | 'Z', value: number): string => {
    const absValue = Math.abs(value);
    const direction = value > 0 ? 'positive' : 'negative';

    switch (axis) {
      case 'X':
        return `${direction} X: ${absValue > 1 ? 'Strong' : 'Weak'} ${value > 0 ? 'forward' : 'backward'} tilt`;
      case 'Y':
        return `${direction} Y: ${absValue > 1 ? 'Strong' : 'Weak'} ${value > 0 ? 'right' : 'left'} tilt`;
      case 'Z':
        return `${direction} Z: ${absValue > 1 ? 'Strong' : 'Weak'} ${value > 0 ? 'up' : 'down'} orientation`;
      default:
        return 'Unknown axis';
    }
  };

  return (
    <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Compass className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Raw Accelerometer
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              3D orientation and motion tracking
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCalibrate}
            disabled={!isConnected || !realAccelerometerData}
            className={`p-2 rounded-lg transition-colors ${
              isConnected && realAccelerometerData
                ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title="Calibrate (set current position as zero)"
          >
            <Target className={`h-5 w-5 ${isCalibrating ? 'animate-pulse text-green-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Raw Data Controls */}
      <div className="flex gap-2 mb-6">
        {!isRawDataMode ? (
          <button
            onClick={handleStartRawData}
            disabled={!isConnected}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
              isConnected
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            <Play className="h-4 w-4" />
            Start Raw Data Mode
          </button>
        ) : (
          <button
            onClick={handleStopRawData}
            disabled={!isConnected}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
              isConnected
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            <Square className="h-4 w-4" />
            Stop Raw Data Mode
          </button>
        )}
      </div>

      {/* Hand Position Visual Guide */}
      {realAccelerometerData && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-4">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Current Hand Position
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Live tilt angles • {new Date(realAccelerometerData.timestamp).toLocaleTimeString()}
            </p>
          </div>

          {/* Visual Hand Representation */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Forward/Backward Tilt */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-red-200 dark:border-red-700">
              <div className="text-center">
                <div className="text-xs font-semibold text-red-700 dark:text-red-300 mb-2">
                  PITCH (X)
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {toDegrees(realAccelerometerData.rotateX - calibrationOffset.x).toFixed(0)}°
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {toDegrees(realAccelerometerData.rotateX - calibrationOffset.x) > 15 ? 'Pointing Up' :
                   toDegrees(realAccelerometerData.rotateX - calibrationOffset.x) < -15 ? 'Pointing Down' : 'Level'}
                </div>
              </div>
            </div>

            {/* Left/Right Tilt */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
              <div className="text-center">
                <div className="text-xs font-semibold text-green-700 dark:text-green-300 mb-2">
                  ROLL (Y)
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {toDegrees(realAccelerometerData.rotateY - calibrationOffset.y).toFixed(0)}°
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {toDegrees(realAccelerometerData.rotateY - calibrationOffset.y) > 15 ? 'Tilted Right' :
                   toDegrees(realAccelerometerData.rotateY - calibrationOffset.y) < -15 ? 'Tilted Left' : 'Level'}
                </div>
              </div>
            </div>

            {/* Twist/Rotation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
              <div className="text-center">
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  YAW (Z)
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {toDegrees(realAccelerometerData.rotateZ - calibrationOffset.z).toFixed(0)}°
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {toDegrees(realAccelerometerData.rotateZ - calibrationOffset.z) > 15 ? 'Clockwise' :
                   toDegrees(realAccelerometerData.rotateZ - calibrationOffset.z) < -15 ? 'Counter-CW' : 'Neutral'}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Reference Guide */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Quick Guide:
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-semibold text-red-600">Pitch:</span> Fingertip up/down
              </div>
              <div>
                <span className="font-semibold text-green-600">Roll:</span> Hand left/right
              </div>
              <div>
                <span className="font-semibold text-blue-600">Yaw:</span> Wrist twist
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Orientation & Movement */}
      {realAccelerometerData && (
        <div className="mb-6 space-y-4">
          {/* Orientation Status */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {getOrientationDescription().description}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {getOrientationDescription().details}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Last update: {new Date(realAccelerometerData.timestamp).toLocaleTimeString()}
            </div>
          </div>

          {/* Movement Intensity */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-gray-600" />
              <div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Movement: <span className={`text-${getMovementIntensity().color}-600`}>
                    {getMovementIntensity().level}
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {getMovementIntensity().description}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total G-force: {Math.sqrt(
                realAccelerometerData.gX * realAccelerometerData.gX +
                realAccelerometerData.gY * realAccelerometerData.gY +
                realAccelerometerData.gZ * realAccelerometerData.gZ
              ).toFixed(2)}G
            </div>
          </div>
        </div>
      )}

      {/* 3D Rotation Values with Real-World Context */}
      {realAccelerometerData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* X Rotation - Pitch (Forward/Backward) */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="text-center mb-3">
              <div className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Pitch (X-Axis)
              </div>
              <div className="text-xs text-red-600 dark:text-red-300 mb-2">
                Forward / Backward tilt
              </div>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                {toDegrees(realAccelerometerData.rotateX - calibrationOffset.x).toFixed(1)}°
              </div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-red-600 dark:text-red-300">
                <span>Raw ADC:</span>
                <span>{realAccelerometerData.rawX}</span>
              </div>
              <div className="flex justify-between text-red-600 dark:text-red-300">
                <span>G-force:</span>
                <span>{realAccelerometerData.gX.toFixed(2)}G</span>
              </div>
              <div className="text-red-500 dark:text-red-400 text-center mt-2">
                {getAxisDescription('X', realAccelerometerData.gX)}
              </div>
            </div>
          </div>

          {/* Y Rotation - Roll (Left/Right) */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-center mb-3">
              <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                🔄 Roll (Y-Axis)
              </div>
              <div className="text-xs text-green-600 dark:text-green-300 mb-2">
                Left ⬅️ / Right ➡️ tilt
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {toDegrees(realAccelerometerData.rotateY - calibrationOffset.y).toFixed(1)}°
              </div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-green-600 dark:text-green-300">
                <span>Raw ADC:</span>
                <span>{realAccelerometerData.rawY}</span>
              </div>
              <div className="flex justify-between text-green-600 dark:text-green-300">
                <span>G-force:</span>
                <span>{realAccelerometerData.gY.toFixed(2)}G</span>
              </div>
              <div className="text-green-500 dark:text-green-400 text-center mt-2">
                {getAxisDescription('Y', realAccelerometerData.gY)}
              </div>
            </div>
          </div>

          {/* Z Rotation - Yaw (Twist) */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-center mb-3">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                Yaw (Z-Axis)
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-300 mb-2">
                Clockwise / Counter-clockwise rotation
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {toDegrees(realAccelerometerData.rotateZ - calibrationOffset.z).toFixed(1)}°
              </div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-blue-600 dark:text-blue-300">
                <span>Raw ADC:</span>
                <span>{realAccelerometerData.rawZ}</span>
              </div>
              <div className="flex justify-between text-blue-600 dark:text-blue-300">
                <span>G-force:</span>
                <span>{realAccelerometerData.gZ.toFixed(2)}G</span>
              </div>
              <div className="text-blue-500 dark:text-blue-400 text-center mt-2">
                {getAxisDescription('Z', realAccelerometerData.gZ)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Motion History Visualization */}
      {dataHistory.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Motion History (Last 20 readings)
          </h4>

          <div className="grid grid-cols-3 gap-4">
            {/* X-axis history */}
            <div>
              <div className="text-xs text-red-600 dark:text-red-300 mb-1">X-Axis</div>
              <div className="flex gap-0.5 h-8">
                {dataHistory.slice(-20).map((data, index) => {
                  const height = Math.abs(toDegrees(data.rotateX));
                  const normalizedHeight = Math.min(100, (height / 90) * 100);
                  return (
                    <div
                      key={index}
                      className="flex-1 bg-red-400 rounded-sm"
                      style={{ height: `${Math.max(normalizedHeight, 5)}%` }}
                      title={`${toDegrees(data.rotateX).toFixed(1)}°`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Y-axis history */}
            <div>
              <div className="text-xs text-green-600 dark:text-green-300 mb-1">Y-Axis</div>
              <div className="flex gap-0.5 h-8">
                {dataHistory.slice(-20).map((data, index) => {
                  const height = Math.abs(toDegrees(data.rotateY));
                  const normalizedHeight = Math.min(100, (height / 90) * 100);
                  return (
                    <div
                      key={index}
                      className="flex-1 bg-green-400 rounded-sm"
                      style={{ height: `${Math.max(normalizedHeight, 5)}%` }}
                      title={`${toDegrees(data.rotateY).toFixed(1)}°`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Z-axis history */}
            <div>
              <div className="text-xs text-blue-600 dark:text-blue-300 mb-1">Z-Axis</div>
              <div className="flex gap-0.5 h-8">
                {dataHistory.slice(-20).map((data, index) => {
                  const height = Math.abs(toDegrees(data.rotateZ));
                  const normalizedHeight = Math.min(100, (height / 90) * 100);
                  return (
                    <div
                      key={index}
                      className="flex-1 bg-blue-400 rounded-sm"
                      style={{ height: `${Math.max(normalizedHeight, 5)}%` }}
                      title={`${toDegrees(data.rotateZ).toFixed(1)}°`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status and Instructions */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Raw Data Mode
          </span>
          <div className={`flex items-center gap-2 ${
            isRawDataMode ? 'text-green-600' : 'text-gray-500'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isRawDataMode ? 'bg-green-600 animate-pulse' : 'bg-gray-400'
            }`} />
            <span className="text-xs font-medium">
              {isRawDataMode ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          {isRawDataMode
            ? (realAccelerometerData
                ? '✅ Receiving live accelerometer data - try moving your hand to see changes!'
                : '⏳ Raw data mode active - waiting for accelerometer packets...'
              )
            : 'Click "Start Raw Data Mode" to begin receiving 3D orientation data from the ring\'s accelerometer.'
          }
        </div>
      </div>

      {/* Comprehensive Explanation */}
      <div className="mt-4 space-y-3">
        {/* What the Data Means */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
            📊 Understanding Your Ring's Motion Data
          </h4>
          <div className="space-y-2 text-xs text-blue-700 dark:text-blue-300">
            <div><strong>Raw ADC Values:</strong> Direct sensor readings (0-4095) from the ring's accelerometer chip</div>
            <div><strong>G-force Values:</strong> Acceleration in Earth gravity units (1G = 9.8 m/s²)</div>
            <div><strong>Rotation Angles:</strong> How much your hand is tilted in each direction (degrees)</div>
            <div><strong>Calibration:</strong> Sets current position as "zero" for relative measurements</div>
          </div>
        </div>

        {/* Real-World Applications */}
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
            🎯 Real-World Applications
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-green-700 dark:text-green-300">
            <div><strong>Gesture Recognition:</strong> Detect hand waves, taps, rotations</div>
            <div><strong>Activity Tracking:</strong> Walking, running, exercise movements</div>
            <div><strong>Sleep Monitoring:</strong> Hand position during sleep</div>
            <div><strong>Health Metrics:</strong> Movement patterns for wellness</div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            🔬 <strong>Technical:</strong> Based on @atc1441's MIDI Ring implementation.
            Uses 12-bit ADC values from ±4G accelerometer (range: -2048 to +2047),
            converted to G-force (-4G to +4G), then to rotation angles via atan2 calculations.
            Raw data mode enables ~20Hz motion tracking for real-time applications.
          </p>
        </div>

        {/* Quick Reference */}
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            🔍 Quick Reference
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-yellow-700 dark:text-yellow-300">
            <div><strong>0°:</strong> Level/flat position</div>
            <div><strong>±90°:</strong> Completely vertical</div>
            <div><strong>1G:</strong> Normal gravity (ring at rest)</div>
            <div><strong>&gt;2G:</strong> Active movement detected</div>
          </div>
        </div>
      </div>
    </div>
  );
}
