'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Target, Save, Play, Square, Download, Upload, Trash2, CheckCircle, AlertCircle, Filter } from 'lucide-react';
import { AccelerometerData } from '../lib/types';

interface GestureTrainerProps {
  isConnected: boolean;
  isRawDataMode: boolean;
  accelerometerData: AccelerometerData | null;
  onStartRawData: () => void;
  onStopRawData: () => void;
}

interface RecordedSample {
  timestamp: number;
  data: AccelerometerData;
}

interface GestureAction {
  type: 'image' | 'message' | 'sound' | 'url';
  content: string; // URL for image/sound, text for message, URL for link
  emoji?: string;
}

interface SavedGesture {
  name: string;
  samples: RecordedSample[];
  averages: {
    rotateX: number;
    rotateY: number;
    rotateZ: number;
    gX: number;
    gY: number;
    gZ: number;
  };
  ranges: {
    rotateX: { min: number; max: number };
    rotateY: { min: number; max: number };
    rotateZ: { min: number; max: number };
  };
  createdAt: Date;
  action?: GestureAction; // Optional action to trigger when gesture is matched
}

/**
 * GestureTrainer Component
 * 
 * Tool for reverse engineering and analyzing accelerometer gestures.
 * Record movements, see the raw data patterns, and save them for recognition.
 */
export function GestureTrainer({
  isConnected,
  isRawDataMode,
  accelerometerData,
  onStartRawData,
  onStopRawData
}: GestureTrainerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSamples, setRecordedSamples] = useState<RecordedSample[]>([]);
  const [gestureName, setGestureName] = useState('');
  const [savedGestures, setSavedGestures] = useState<SavedGesture[]>([]);
  const [selectedGesture, setSelectedGesture] = useState<SavedGesture | null>(null);
  const [smoothingLevel, setSmoothingLevel] = useState(3); // Number of samples to average
  const [smoothedData, setSmoothedData] = useState<AccelerometerData | null>(null);
  const dataBuffer = useRef<AccelerometerData[]>([]);
  
  // Action trigger states
  const [showActionModal, setShowActionModal] = useState(false);
  const [triggeredAction, setTriggeredAction] = useState<GestureAction | null>(null);
  const [triggeredGestureName, setTriggeredGestureName] = useState('');
  const [lastTriggeredTime, setLastTriggeredTime] = useState(0);
  const [actionsEnabled, setActionsEnabled] = useState(true); // Toggle for showing/hiding action triggers
  const [editingActionForGesture, setEditingActionForGesture] = useState<SavedGesture | null>(null);
  const [actionType, setActionType] = useState<'image' | 'message' | 'sound' | 'url'>('message');
  const [actionContent, setActionContent] = useState('');
  const [actionEmoji, setActionEmoji] = useState('🎉');

  // Load gestures and actionsEnabled preference from localStorage on mount
  useEffect(() => {
    try {
      const actionsEnabledStored = localStorage.getItem('colmi-actions-enabled');
      if (actionsEnabledStored !== null) {
        setActionsEnabled(actionsEnabledStored === 'true');
      }
      const savedData = localStorage.getItem('colmi-ring-gestures');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Convert date strings back to Date objects
        const gestures = parsed.map((g: any) => ({
          ...g,
          createdAt: new Date(g.createdAt)
        }));
        setSavedGestures(gestures);
        console.log(`✅ Loaded ${gestures.length} gestures from localStorage`);
      }
    } catch (error) {
      console.error('Error loading gestures from localStorage:', error);
    }
  }, []);

  // Save gestures to localStorage whenever they change
  useEffect(() => {
    if (savedGestures.length > 0) {
      try {
        localStorage.setItem('colmi-ring-gestures', JSON.stringify(savedGestures));
        console.log(`💾 Saved ${savedGestures.length} gestures to localStorage`);
      } catch (error) {
        console.error('Error saving gestures to localStorage:', error);
        alert('⚠️ Failed to save gestures to localStorage. Storage might be full.');
      }
    }
  }, [savedGestures]);

  // Apply smoothing filter to accelerometer data
  useEffect(() => {
    if (accelerometerData) {
      // Add to buffer
      dataBuffer.current.push(accelerometerData);
      
      // Keep only last N samples based on smoothing level
      if (dataBuffer.current.length > smoothingLevel) {
        dataBuffer.current.shift();
      }

      // Calculate moving average
      if (dataBuffer.current.length >= smoothingLevel) {
        const avgData: AccelerometerData = {
          rawX: Math.round(dataBuffer.current.reduce((sum, d) => sum + d.rawX, 0) / dataBuffer.current.length),
          rawY: Math.round(dataBuffer.current.reduce((sum, d) => sum + d.rawY, 0) / dataBuffer.current.length),
          rawZ: Math.round(dataBuffer.current.reduce((sum, d) => sum + d.rawZ, 0) / dataBuffer.current.length),
          gX: dataBuffer.current.reduce((sum, d) => sum + d.gX, 0) / dataBuffer.current.length,
          gY: dataBuffer.current.reduce((sum, d) => sum + d.gY, 0) / dataBuffer.current.length,
          gZ: dataBuffer.current.reduce((sum, d) => sum + d.gZ, 0) / dataBuffer.current.length,
          rotateX: dataBuffer.current.reduce((sum, d) => sum + d.rotateX, 0) / dataBuffer.current.length,
          rotateY: dataBuffer.current.reduce((sum, d) => sum + d.rotateY, 0) / dataBuffer.current.length,
          rotateZ: dataBuffer.current.reduce((sum, d) => sum + d.rotateZ, 0) / dataBuffer.current.length,
          timestamp: accelerometerData.timestamp
        };
        setSmoothedData(avgData);
      } else {
        setSmoothedData(accelerometerData);
      }
    }
  }, [accelerometerData, smoothingLevel]);

  // Record samples when recording is active
  useEffect(() => {
    if (isRecording && smoothedData) {
      setRecordedSamples(prev => [...prev, {
        timestamp: Date.now(),
        data: smoothedData
      }]);
    }
  }, [isRecording, smoothedData]);

  const startRecording = () => {
    setRecordedSamples([]);
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const toDegrees = (radians: number) => (radians * 180) / Math.PI;

  const saveGesture = () => {
    if (recordedSamples.length === 0 || !gestureName.trim()) {
      alert('Please enter a gesture name and record some samples first');
      return;
    }

    // Calculate statistics
    const rotateXValues = recordedSamples.map(s => s.data.rotateX);
    const rotateYValues = recordedSamples.map(s => s.data.rotateY);
    const rotateZValues = recordedSamples.map(s => s.data.rotateZ);

    const newGesture: SavedGesture = {
      name: gestureName,
      samples: recordedSamples,
      averages: {
        rotateX: rotateXValues.reduce((a, b) => a + b, 0) / rotateXValues.length,
        rotateY: rotateYValues.reduce((a, b) => a + b, 0) / rotateYValues.length,
        rotateZ: rotateZValues.reduce((a, b) => a + b, 0) / rotateZValues.length,
        gX: recordedSamples.reduce((sum, s) => sum + s.data.gX, 0) / recordedSamples.length,
        gY: recordedSamples.reduce((sum, s) => sum + s.data.gY, 0) / recordedSamples.length,
        gZ: recordedSamples.reduce((sum, s) => sum + s.data.gZ, 0) / recordedSamples.length,
      },
      ranges: {
        rotateX: { min: Math.min(...rotateXValues), max: Math.max(...rotateXValues) },
        rotateY: { min: Math.min(...rotateYValues), max: Math.max(...rotateYValues) },
        rotateZ: { min: Math.min(...rotateZValues), max: Math.max(...rotateZValues) },
      },
      createdAt: new Date()
    };

    setSavedGestures(prev => [...prev, newGesture]);
    setGestureName('');
    setRecordedSamples([]);
    alert(`✅ Gesture "${newGesture.name}" saved with ${recordedSamples.length} samples!`);
  };

  const exportGestures = () => {
    if (savedGestures.length === 0) {
      alert('⚠️ No gestures to export!');
      return;
    }

    const dataStr = JSON.stringify(savedGestures, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `colmi-gestures-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert(`✅ Exported ${savedGestures.length} gestures to file!`);
  };

  const importGestures = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = JSON.parse(content);
        
        // Validate imported data
        if (!Array.isArray(imported)) {
          throw new Error('Invalid format: expected array of gestures');
        }

        // Convert date strings to Date objects and validate structure
        const validatedGestures = imported.map((g: any) => {
          if (!g.name || !g.samples || !g.averages || !g.ranges) {
            throw new Error('Invalid gesture format');
          }
          return {
            ...g,
            createdAt: new Date(g.createdAt || Date.now())
          };
        });

        // Ask user if they want to merge or replace
        const merge = confirm(
          `Import ${validatedGestures.length} gestures.\n\n` +
          `Click OK to MERGE with existing (${savedGestures.length} gestures)\n` +
          `Click Cancel to REPLACE all existing gestures`
        );

        if (merge) {
          setSavedGestures(prev => [...prev, ...validatedGestures]);
          alert(`✅ Imported and merged ${validatedGestures.length} gestures!`);
        } else {
          setSavedGestures(validatedGestures);
          alert(`✅ Imported ${validatedGestures.length} gestures (replaced existing)!`);
        }
      } catch (error) {
        console.error('Import error:', error);
        alert(`❌ Failed to import gestures: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
    
    // Reset input so same file can be imported again
    event.target.value = '';
  };

  const clearAllGestures = () => {
    if (confirm(`⚠️ Delete ALL ${savedGestures.length} gestures?\n\nThis cannot be undone!`)) {
      setSavedGestures([]);
      localStorage.removeItem('colmi-ring-gestures');
      alert('✅ All gestures cleared!');
    }
  };

  const deleteGesture = (index: number) => {
    const gesture = savedGestures[index];
    if (confirm(`Delete gesture "${gesture.name}"?`)) {
      setSavedGestures(prev => prev.filter((_, i) => i !== index));
      alert(`✅ Deleted "${gesture.name}"`);
    }
  };

  const getCurrentMatch = (): { gesture: SavedGesture; confidence: number } | null => {
    if (!smoothedData || savedGestures.length === 0) return null;

    let bestMatch: { gesture: SavedGesture; confidence: number } | null = null;
    let bestScore = Infinity;

    savedGestures.forEach(gesture => {
      // Calculate distance from current position to gesture average
      const xDiff = Math.abs(smoothedData.rotateX - gesture.averages.rotateX);
      const yDiff = Math.abs(smoothedData.rotateY - gesture.averages.rotateY);
      const zDiff = Math.abs(smoothedData.rotateZ - gesture.averages.rotateZ);
      
      const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff + zDiff * zDiff);
      
      if (distance < bestScore) {
        bestScore = distance;
        const maxDistance = Math.PI / 2; // 90 degrees in radians
        const confidence = Math.max(0, (1 - (distance / maxDistance)) * 100);
        bestMatch = { gesture, confidence };
      }
    });

    return bestMatch && bestMatch.confidence > 30 ? bestMatch : null;
  };

  const currentMatch = getCurrentMatch();

  // Trigger action when gesture is matched with high confidence (80%+)
  useEffect(() => {
    if (actionsEnabled && currentMatch && currentMatch.confidence >= 80 && currentMatch.gesture.action) {
      const now = Date.now();
      // Prevent triggering too frequently (cooldown of 2 seconds)
      if (now - lastTriggeredTime > 2000) {
        setTriggeredAction(currentMatch.gesture.action);
        setTriggeredGestureName(currentMatch.gesture.name);
        setShowActionModal(true);
        setLastTriggeredTime(now);
        
        // Auto-close after 3 seconds for messages
        if (currentMatch.gesture.action.type === 'message') {
          setTimeout(() => setShowActionModal(false), 3000);
        }
      }
    }
  }, [currentMatch, lastTriggeredTime]);

  const saveActionForGesture = () => {
    if (!editingActionForGesture || !actionContent) {
      alert('Please enter content for the action');
      return;
    }

    const action: GestureAction = {
      type: actionType,
      content: actionContent,
      emoji: actionEmoji
    };

    setSavedGestures(prev => prev.map(g => 
      g === editingActionForGesture 
        ? { ...g, action }
        : g
    ));

    setEditingActionForGesture(null);
    setActionContent('');
    alert(`✅ Action added to "${editingActionForGesture.name}"!`);
  };

  return (
    <div className="rounded-xl border-2 border-orange-200 dark:border-orange-700 bg-white dark:bg-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-orange-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              🎯 Gesture Trainer & Analyzer
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Reverse engineer movements - See what raw data your actions produce
            </p>
          </div>
        </div>
      </div>

      {/* How to Use Guide */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-2">
          📚 How to Use This Tool:
        </h4>
        <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-decimal">
          <li><strong>Start Raw Data Mode</strong> - Enable sensor streaming</li>
          <li><strong>Adjust Smoothing</strong> - Set stabilization level (higher = more stable, but slower response)</li>
          <li><strong>Hold a Position</strong> - Get your hand in the position you want to save</li>
          <li><strong>Start Recording</strong> - Click the record button and hold the position for 2-3 seconds</li>
          <li><strong>Stop Recording</strong> - Stop when you have ~20-50 samples</li>
          <li><strong>Name & Save</strong> - Give it a name like "Point Up", "Twist Right", etc.</li>
          <li><strong>Test It</strong> - Repeat the gesture and see if it matches!</li>
        </ol>
      </div>

      {/* Wearing Guidelines */}
      <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
        <h4 className="text-sm font-bold text-green-900 dark:text-green-100 mb-2">
          👆 Consistent Wearing Guidelines:
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs text-green-800 dark:text-green-200">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Same finger:</strong> Always wear on same finger (index recommended)
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Snug fit:</strong> Ring shouldn't rotate or slip
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Same orientation:</strong> Keep sensor facing the same direction
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Calibrate first:</strong> Use neutral hand position as baseline
            </div>
          </div>
        </div>
      </div>

      {/* Smoothing Control */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Data Stabilizer / Smoothing
            </span>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Level: {smoothingLevel} samples
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={smoothingLevel}
          onChange={(e) => setSmoothingLevel(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
          <span>Fast (Jittery)</span>
          <span>Balanced</span>
          <span>Smooth (Delayed)</span>
        </div>
      </div>

      {/* Action Triggers Toggle */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{actionsEnabled ? '🔔' : '🔕'}</span>
            <div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Action Triggers
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {actionsEnabled ? 'Actions will show when gestures are detected' : 'Actions are disabled'}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              const newValue = !actionsEnabled;
              setActionsEnabled(newValue);
              localStorage.setItem('colmi-actions-enabled', newValue.toString());
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              actionsEnabled
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
          >
            {actionsEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Current Live Data */}
      {smoothedData && (
        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
          <h4 className="text-sm font-bold text-purple-900 dark:text-purple-100 mb-3">
            📡 Live Smoothed Data (What you're doing RIGHT NOW):
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded p-2">
              <div className="text-xs text-red-600 dark:text-red-400 font-semibold">Pitch (X)</div>
              <div className="text-lg font-bold text-red-700 dark:text-red-300">
                {toDegrees(smoothedData.rotateX).toFixed(1)}°
              </div>
              <div className="text-xs text-gray-500">{smoothedData.gX.toFixed(2)}G</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded p-2">
              <div className="text-xs text-green-600 dark:text-green-400 font-semibold">Roll (Y)</div>
              <div className="text-lg font-bold text-green-700 dark:text-green-300">
                {toDegrees(smoothedData.rotateY).toFixed(1)}°
              </div>
              <div className="text-xs text-gray-500">{smoothedData.gY.toFixed(2)}G</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded p-2">
              <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Yaw (Z)</div>
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                {toDegrees(smoothedData.rotateZ).toFixed(1)}°
              </div>
              <div className="text-xs text-gray-500">{smoothedData.gZ.toFixed(2)}G</div>
            </div>
          </div>

          {/* Current Match Detection */}
          {currentMatch && (
            <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/30 rounded border border-green-300 dark:border-green-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-green-800 dark:text-green-200">
                    Matched: "{currentMatch.gesture.name}"
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">
                    Confidence: {currentMatch.confidence.toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recording Controls */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-2">
          {!isRawDataMode ? (
            <button
              onClick={onStartRawData}
              disabled={!isConnected}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg font-medium"
            >
              <Play className="h-4 w-4" />
              Start Raw Data Mode
            </button>
          ) : !isRecording ? (
            <button
              onClick={startRecording}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
            >
              <Play className="h-4 w-4" />
              Start Recording Gesture
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium animate-pulse"
            >
              <Square className="h-4 w-4" />
              Stop Recording ({recordedSamples.length} samples)
            </button>
          )}
        </div>

        {/* Save Controls */}
        {recordedSamples.length > 0 && !isRecording && (
          <div className="flex gap-2">
            <input
              type="text"
              value={gestureName}
              onChange={(e) => setGestureName(e.target.value)}
              placeholder="Enter gesture name (e.g., 'Point Up', 'Fist')"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={saveGesture}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
          </div>
        )}
      </div>

      {/* No Gestures - Show Import Option */}
      {savedGestures.length === 0 && !isRecording && recordedSamples.length === 0 && (
        <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
          <div className="text-4xl mb-3">📦</div>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            No Gestures Yet
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Record your first gesture or import existing ones
          </p>
          <div className="flex gap-2 justify-center">
            <label className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer font-medium">
              <Upload className="h-4 w-4" />
              Import from File
              <input
                type="file"
                accept=".json"
                onChange={importGestures}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* Saved Gestures */}
      {savedGestures.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              💾 Saved Gestures ({savedGestures.length})
            </h4>
            <div className="flex gap-2">
              <label className="flex items-center gap-1 px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded cursor-pointer">
                <Upload className="h-3 w-3" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importGestures}
                  className="hidden"
                />
              </label>
              <button
                onClick={exportGestures}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                <Download className="h-3 w-3" />
                Export
              </button>
              <button
                onClick={clearAllGestures}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
              >
                <Trash2 className="h-3 w-3" />
                Clear All
              </button>
            </div>
          </div>
          
          {/* LocalStorage Info */}
          <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-800 dark:text-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3" />
              <span>Auto-saved to browser localStorage • Import/Export for backup</span>
            </div>
          </div>

          <div className="space-y-2">
            {savedGestures.map((gesture, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedGesture === gesture
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-orange-300'
                }`}
                onClick={() => setSelectedGesture(selectedGesture === gesture ? null : gesture)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {gesture.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {gesture.samples.length} samples • Avg: X={toDegrees(gesture.averages.rotateX).toFixed(0)}° 
                      Y={toDegrees(gesture.averages.rotateY).toFixed(0)}° 
                      Z={toDegrees(gesture.averages.rotateZ).toFixed(0)}°
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteGesture(index);
                    }}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Expanded Details */}
                {selectedGesture === gesture && (
                  <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                    <div className="text-xs space-y-2 mb-3">
                      <div>
                        <strong>Pitch Range:</strong> {toDegrees(gesture.ranges.rotateX.min).toFixed(1)}° to {toDegrees(gesture.ranges.rotateX.max).toFixed(1)}°
                      </div>
                      <div>
                        <strong>Roll Range:</strong> {toDegrees(gesture.ranges.rotateY.min).toFixed(1)}° to {toDegrees(gesture.ranges.rotateY.max).toFixed(1)}°
                      </div>
                      <div>
                        <strong>Yaw Range:</strong> {toDegrees(gesture.ranges.rotateZ.min).toFixed(1)}° to {toDegrees(gesture.ranges.rotateZ.max).toFixed(1)}°
                      </div>
                      <div className="pt-2 text-gray-600 dark:text-gray-400">
                        <strong>Saved:</strong> {gesture.createdAt.toLocaleString()}
                      </div>
                    </div>
                    
                    {/* Action Display/Config */}
                    <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
                      {gesture.action ? (
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-xs font-bold text-green-800 dark:text-green-200">
                              {gesture.action.emoji} Action Configured
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingActionForGesture(gesture);
                                setActionType(gesture.action!.type);
                                setActionContent(gesture.action!.content);
                                setActionEmoji(gesture.action!.emoji || '🎉');
                              }}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Edit
                            </button>
                          </div>
                          <div className="text-xs text-green-700 dark:text-green-300">
                            <strong>Type:</strong> {gesture.action.type}
                          </div>
                          <div className="text-xs text-green-700 dark:text-green-300 break-all">
                            <strong>Content:</strong> {gesture.action.content.substring(0, 50)}{gesture.action.content.length > 50 ? '...' : ''}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingActionForGesture(gesture);
                            setActionType('message');
                            setActionContent('');
                            setActionEmoji('🎉');
                          }}
                          className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium"
                        >
                          + Add Action (Image/Message/Sound)
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Ideas */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
        <h4 className="text-sm font-bold text-yellow-900 dark:text-yellow-100 mb-2">
          💡 Suggested Actions to Try:
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-yellow-800 dark:text-yellow-200">
          <div>• Point Up (Pitch +45°)</div>
          <div>• Point Down (Pitch -45°)</div>
          <div>• Tilt Right (Roll +30°)</div>
          <div>• Tilt Left (Roll -30°)</div>
          <div>• Twist Clockwise (Yaw +45°)</div>
          <div>• Twist Counter-CW (Yaw -45°)</div>
          <div>• Flat/Neutral (All ~0°)</div>
          <div>• Fist Up (Pitch +60°)</div>
        </div>
      </div>

      {/* Action Configuration Modal */}
      {editingActionForGesture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              🎬 Configure Action for "{editingActionForGesture.name}"
            </h3>
            
            <div className="space-y-4">
              {/* Action Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Action Type:
                </label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="message">💬 Show Message</option>
                  <option value="image">🖼️ Show Image</option>
                  <option value="sound">🔊 Play Sound</option>
                  <option value="url">🔗 Open URL</option>
                </select>
              </div>

              {/* Emoji Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Emoji:
                </label>
                <div className="flex gap-2">
                  {['🎉', '👍', '✨', '🚀', '💡', '❤️', '⭐', '🔥'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setActionEmoji(emoji)}
                      className={`text-2xl p-2 rounded ${
                        actionEmoji === emoji 
                          ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {actionType === 'message' && 'Message Text:'}
                  {actionType === 'image' && 'Image URL:'}
                  {actionType === 'sound' && 'Sound URL:'}
                  {actionType === 'url' && 'URL to Open:'}
                </label>
                <textarea
                  value={actionContent}
                  onChange={(e) => setActionContent(e.target.value)}
                  placeholder={
                    actionType === 'message' ? 'Enter your message here...' :
                    actionType === 'image' ? 'https://example.com/image.jpg' :
                    actionType === 'sound' ? 'https://example.com/sound.mp3' :
                    'https://example.com'
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={actionType === 'message' ? 4 : 2}
                />
                {actionType === 'image' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    💡 Tip: Use imgur.com or similar to host images
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={saveActionForGesture}
                  className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                >
                  Save Action
                </button>
                <button
                  onClick={() => {
                    setEditingActionForGesture(null);
                    setActionContent('');
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Triggered Action Modal */}
      {showActionModal && triggeredAction && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-8 shadow-2xl transform animate-scaleIn">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">
                {triggeredAction.emoji}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Gesture Detected: "{triggeredGestureName}"
              </h2>
              
              {/* Action Content */}
              {triggeredAction.type === 'message' && (
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-wrap">
                  {triggeredAction.content}
                </p>
              )}
              
              {triggeredAction.type === 'image' && (
                <div className="mb-6">
                  <img 
                    src={triggeredAction.content} 
                    alt="Gesture action"
                    className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" text-anchor="middle" dy=".3em">Image not found</text></svg>';
                    }}
                  />
                </div>
              )}
              
              {triggeredAction.type === 'url' && (
                <div className="mb-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Opening URL:</p>
                  <a 
                    href={triggeredAction.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                  >
                    {triggeredAction.content}
                  </a>
                </div>
              )}
              
              {triggeredAction.type === 'sound' && (
                <audio src={triggeredAction.content} autoPlay className="hidden" />
              )}
              
              <button
                onClick={() => setShowActionModal(false)}
                className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
