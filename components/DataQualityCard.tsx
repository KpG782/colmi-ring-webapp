'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Settings, Info } from 'lucide-react';

interface DataQualityCardProps {
  heartRate?: number | null;
  steps?: number | null;
  battery?: number | null;
  spO2?: number | null;
  onCalibrate?: (type: 'heartRate' | 'steps', offset: number) => void;
}

interface CalibrationSettings {
  heartRateOffset: number;
  stepsMultiplier: number;
}

/**
 * DataQualityCard Component
 *
 * Displays data quality indicators and calibration options based on
 * Gadgetbridge insights about device accuracy variations.
 */
export function DataQualityCard({
  heartRate,
  steps,
  battery,
  spO2,
  onCalibrate
}: DataQualityCardProps) {
  const [showCalibration, setShowCalibration] = useState(false);
  const [calibration, setCalibration] = useState<CalibrationSettings>({
    heartRateOffset: 0,
    stepsMultiplier: 1.0
  });

  // Validate heart rate (reasonable human range)
  const validateHeartRate = (hr: number | null): 'good' | 'warning' | 'error' => {
    if (hr === null) return 'good';
    if (hr < 40 || hr > 220) return 'error';
    if (hr < 50 || hr > 180) return 'warning';
    return 'good';
  };

  // Validate steps (check for unrealistic jumps)
  const validateSteps = (currentSteps: number | null): 'good' | 'warning' | 'error' => {
    if (currentSteps === null) return 'good';
    if (currentSteps < 0) return 'error';
    // Could add more validation based on previous readings
    return 'good';
  };

  // Validate SpO2 (normal range 95-100%)
  const validateSpO2 = (spO2Value: number | null): 'good' | 'warning' | 'error' => {
    if (spO2Value === null) return 'good';
    if (spO2Value < 70 || spO2Value > 100) return 'error';
    if (spO2Value < 90) return 'warning';
    if (spO2Value < 95) return 'warning';
    return 'good';
  };

  const heartRateQuality = validateHeartRate(heartRate ?? null);
  const stepsQuality = validateSteps(steps ?? null);
  const spO2Quality = validateSpO2(spO2 ?? null);

  const getQualityIcon = (quality: 'good' | 'warning' | 'error') => {
    switch (quality) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getQualityMessage = (type: string, quality: 'good' | 'warning' | 'error', value?: number | null) => {
    if (value === null) return `${type}: No data`;

    switch (quality) {
      case 'good':
        return `${type}: Reading looks normal`;
      case 'warning':
        return `${type}: Reading may be inaccurate (±30 ${type === 'Heart Rate' ? 'BPM' : 'steps'})`;
      case 'error':
        return `${type}: Reading appears unrealistic`;
    }
  };

  const handleCalibrationChange = (type: 'heartRate' | 'steps', value: number) => {
    if (type === 'heartRate') {
      setCalibration(prev => ({ ...prev, heartRateOffset: value }));
    } else {
      setCalibration(prev => ({ ...prev, stepsMultiplier: value }));
    }
  };

  const applyCalibration = (type: 'heartRate' | 'steps') => {
    const offset = type === 'heartRate' ? calibration.heartRateOffset : calibration.stepsMultiplier;
    onCalibrate?.(type, offset);
  };

  return (
    <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Info className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Data Quality
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Accuracy indicators & calibration
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCalibration(!showCalibration)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Quality Indicators */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2">
            {getQualityIcon(heartRateQuality)}
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {getQualityMessage('Heart Rate', heartRateQuality, heartRate)}
            </span>
          </div>
          {heartRate && (
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {heartRate} BPM
            </span>
          )}
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2">
            {getQualityIcon(stepsQuality)}
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {getQualityMessage('Steps', stepsQuality, steps)}
            </span>
          </div>
          {steps && (
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {steps.toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2">
            {getQualityIcon(spO2Quality)}
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {getQualityMessage('SpO2', spO2Quality, spO2)}
            </span>
          </div>
          {spO2 && (
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {spO2}%
            </span>
          )}
        </div>
      </div>

      {/* Calibration Panel */}
      {showCalibration && (
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Calibration Settings
          </h4>

          {/* Heart Rate Calibration */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
                Heart Rate Offset (±BPM)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={calibration.heartRateOffset}
                  onChange={(e) => handleCalibrationChange('heartRate', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                  {calibration.heartRateOffset > 0 ? '+' : ''}{calibration.heartRateOffset}
                </span>
                <button
                  onClick={() => applyCalibration('heartRate')}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Steps Calibration */}
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">
                Steps Sensitivity (×)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={calibration.stepsMultiplier}
                  onChange={(e) => handleCalibrationChange('steps', parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                  {calibration.stepsMultiplier.toFixed(1)}
                </span>
                <button
                  onClick={() => applyCalibration('steps')}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accuracy Info */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 <strong>Accuracy varies between devices.</strong> Some users report ±30 BPM differences.
          Use calibration if your readings are consistently off compared to other devices.
        </p>
      </div>
    </div>
  );
}
