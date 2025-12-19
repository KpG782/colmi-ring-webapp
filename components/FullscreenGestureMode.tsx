/**
 * FullscreenGestureMode Component
 * 
 * Fullscreen mode with front camera overlay for gesture training.
 * Shows live camera feed with gesture controls overlaid.
 * Includes: gesture matching, actions, smoothing, import/export
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import { X, Camera, CameraOff, Plus, Save, Trash2, Play, Square, Filter, CheckCircle, Download, Upload } from 'lucide-react';
import { GlassCard, AnimatedButton, StatusIndicator } from './glass';
import { AccelerometerData } from '../lib/types';

interface FullscreenGestureModeProps {
  isOpen: boolean;
  onClose: () => void;
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
  type: 'image' | 'message' | 'sound' | 'url' | 'youtube' | 'linkedin';
  content: string;
  emoji?: string;
  imageSize?: 'small' | 'medium' | 'large' | 'fullscreen';
  autoCloseTime?: number; // in seconds
  showConfetti?: boolean; // for message actions
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
  action?: GestureAction;
  sampleCount?: number;
}

// Simple Confetti Effect Component
const ConfettiEffect = () => {
  useEffect(() => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const confettiCount = 50;
    const confettiElements: HTMLElement[] = [];

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = '-10px';
      confetti.style.zIndex = '9999';
      confetti.style.pointerEvents = 'none';
      confetti.style.borderRadius = '50%';
      
      document.body.appendChild(confetti);
      confettiElements.push(confetti);

      // Animate confetti falling
      const fallDuration = Math.random() * 3000 + 2000; // 2-5 seconds
      const horizontalMovement = (Math.random() - 0.5) * 200; // -100px to 100px

      confetti.animate([
        { 
          transform: `translateY(0px) translateX(0px) rotate(0deg)`,
          opacity: 1 
        },
        { 
          transform: `translateY(100vh) translateX(${horizontalMovement}px) rotate(720deg)`,
          opacity: 0 
        }
      ], {
        duration: fallDuration,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      });
    }

    // Cleanup after animation
    const cleanup = setTimeout(() => {
      confettiElements.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    }, 5000);

    return () => {
      clearTimeout(cleanup);
      confettiElements.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    };
  }, []);

  return null;
};

export function FullscreenGestureMode({
  isOpen,
  onClose,
  isConnected,
  isRawDataMode,
  accelerometerData,
  onStartRawData,
  onStopRawData,
}: FullscreenGestureModeProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [gestureName, setGestureName] = useState('');
  const [recordedSamples, setRecordedSamples] = useState<RecordedSample[]>([]);
  const [savedGestures, setSavedGestures] = useState<SavedGesture[]>([]);
  const [smoothingLevel, setSmoothingLevel] = useState(3);
  const [smoothedData, setSmoothedData] = useState<AccelerometerData | null>(null);
  const dataBuffer = useRef<AccelerometerData[]>([]);
  const [selectedGesture, setSelectedGesture] = useState<SavedGesture | null>(null);
  const [cameraZoom, setCameraZoom] = useState(1);
  
  // Action trigger states
  const [showActionModal, setShowActionModal] = useState(false);
  const [triggeredAction, setTriggeredAction] = useState<GestureAction | null>(null);
  const [triggeredGestureName, setTriggeredGestureName] = useState('');
  const [lastTriggeredTime, setLastTriggeredTime] = useState(0);
  const [actionsEnabled, setActionsEnabled] = useState(true);
  const [editingActionForGesture, setEditingActionForGesture] = useState<SavedGesture | null>(null);
  const [actionType, setActionType] = useState<'image' | 'message' | 'sound' | 'url' | 'youtube' | 'linkedin'>('message');
  const [actionContent, setActionContent] = useState('');
  const [actionEmoji, setActionEmoji] = useState('🎉');
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [imageSize, setImageSize] = useState<'small' | 'medium' | 'large' | 'fullscreen'>('medium');
  const [autoCloseTime, setAutoCloseTime] = useState(3);
  const [showConfetti, setShowConfetti] = useState(false);

  // Load gestures and preferences from localStorage
  useEffect(() => {
    try {
      const actionsEnabledStored = localStorage.getItem('colmi-actions-enabled');
      if (actionsEnabledStored !== null) {
        setActionsEnabled(actionsEnabledStored === 'true');
      }
      const savedData = localStorage.getItem('colmi-ring-gestures');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        const gestures: SavedGesture[] = parsed.map((g: Partial<SavedGesture> & { name: string; samples: RecordedSample[] }) => ({
          name: g.name,
          samples: g.samples,
          averages: g.averages || { rotateX: 0, rotateY: 0, rotateZ: 0, gX: 0, gY: 0, gZ: 0 },
          ranges: g.ranges || { rotateX: { min: 0, max: 0 }, rotateY: { min: 0, max: 0 }, rotateZ: { min: 0, max: 0 } },
          createdAt: new Date(g.createdAt || Date.now()),
          action: g.action,
          sampleCount: g.sampleCount
        }));
        setSavedGestures(gestures);
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
      } catch (error) {
        console.error('Error saving gestures to localStorage:', error);
      }
    }
  }, [savedGestures]);

  // Apply smoothing filter to accelerometer data
  useEffect(() => {
    if (accelerometerData) {
      dataBuffer.current.push(accelerometerData);
      if (dataBuffer.current.length > smoothingLevel) {
        dataBuffer.current.shift();
      }
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

  // Stop camera - wrapped in useCallback to prevent dependency issues
  const stopCamera = React.useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraEnabled(false);
  }, [stream]);

  // Start front camera
  const startCamera = async () => {
    try {
      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false,
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Ensure video plays
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
        });
      }
      
      setCameraEnabled(true);
    } catch (error) {
      console.error('Failed to start camera:', error);
      alert('Failed to access camera. Please grant camera permissions and ensure no other app is using the camera.');
      setCameraEnabled(false);
    }
  };

  // Start camera when component opens and cleanup on close
  useEffect(() => {
    let mounted = true;

    if (isOpen && !cameraEnabled && !stream) {
      startCamera();
    }
    
    return () => {
      mounted = false;
      // Cleanup camera when component closes
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Apply camera zoom
  useEffect(() => {
    if (videoRef.current && cameraEnabled) {
      videoRef.current.style.transform = `scale(${cameraZoom})`;
    }
  }, [cameraZoom, cameraEnabled]);

  // Toggle camera
  const toggleCamera = () => {
    if (cameraEnabled) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const toDegrees = (radians: number) => (radians * 180) / Math.PI;

  // Start recording gesture
  const startRecording = () => {
    if (!isRawDataMode) {
      onStartRawData();
    }
    setIsRecording(true);
    setRecordedSamples([]);
  };

  // Stop recording gesture
  const stopRecording = () => {
    setIsRecording(false);
  };

  // Save gesture with statistics
  const saveGesture = () => {
    if (recordedSamples.length === 0 || !gestureName.trim()) {
      alert('Please enter a gesture name and record some samples first');
      return;
    }

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
      createdAt: new Date(),
      sampleCount: recordedSamples.length
    };

    setSavedGestures(prev => [...prev, newGesture]);
    setGestureName('');
    setRecordedSamples([]);
    alert(`✅ Gesture "${newGesture.name}" saved with ${recordedSamples.length} samples!`);
  };

  // Delete gesture
  const deleteGesture = (index: number) => {
    const gesture = savedGestures[index];
    if (confirm(`Delete gesture "${gesture.name}"?`)) {
      setSavedGestures(prev => prev.filter((_, i) => i !== index));
      alert(`✅ Deleted "${gesture.name}"`);
    }
  };

  // Get current gesture match
  const getCurrentMatch = (): { gesture: SavedGesture; confidence: number } | null => {
    if (!smoothedData || savedGestures.length === 0) return null;

    let bestMatchGesture: SavedGesture | null = null;
    let bestConfidence = 0;
    let bestScore = Infinity;

    savedGestures.forEach((gesture: SavedGesture) => {
      const xDiff = Math.abs(smoothedData.rotateX - gesture.averages.rotateX);
      const yDiff = Math.abs(smoothedData.rotateY - gesture.averages.rotateY);
      const zDiff = Math.abs(smoothedData.rotateZ - gesture.averages.rotateZ);
      const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff + zDiff * zDiff);

      if (distance < bestScore) {
        bestScore = distance;
        const maxDistance = Math.PI / 2;
        const confidence = Math.max(0, (1 - (distance / maxDistance)) * 100);
        bestMatchGesture = gesture;
        bestConfidence = confidence;
      }
    });

    if (bestMatchGesture && bestConfidence > 30) {
      return { gesture: bestMatchGesture, confidence: bestConfidence };
    }
    return null;
  };

  const currentMatch = getCurrentMatch();

  // Trigger action when gesture is matched
  useEffect(() => {
    if (actionsEnabled && currentMatch && currentMatch.confidence >= 80 && currentMatch.gesture.action) {
      const now = Date.now();
      if (now - lastTriggeredTime > 2000) {
        setTriggeredAction(currentMatch.gesture.action);
        setTriggeredGestureName(currentMatch.gesture.name);
        setShowActionModal(true);
        setLastTriggeredTime(now);

        if (currentMatch.gesture.action.type === 'message') {
          const closeTime = (currentMatch.gesture.action.autoCloseTime || 3) * 1000;
          setTimeout(() => setShowActionModal(false), closeTime);
        }
        
        if (currentMatch.gesture.action.type === 'image') {
          const closeTime = (currentMatch.gesture.action.autoCloseTime || 3) * 1000;
          setTimeout(() => setShowActionModal(false), closeTime);
        }

        if (currentMatch.gesture.action.type === 'youtube') {
          window.open(currentMatch.gesture.action.content, '_blank');
        }

        if (currentMatch.gesture.action.type === 'linkedin') {
          // Show modal for 3 seconds, then auto-close
          setTimeout(() => setShowActionModal(false), 3000);
        }
      }
    }
  }, [currentMatch, lastTriggeredTime, actionsEnabled]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setActionContent(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveActionForGesture = () => {
    if (!editingActionForGesture || !actionContent) {
      alert('Please enter content for the action');
      return;
    }

    const action: GestureAction = {
      type: actionType,
      content: actionContent,
      emoji: actionEmoji,
      imageSize: actionType === 'image' ? imageSize : undefined,
      autoCloseTime: (actionType === 'image' || actionType === 'message') ? autoCloseTime : undefined,
      showConfetti: actionType === 'message' ? showConfetti : undefined
    };

    setSavedGestures(prev => prev.map(g =>
      g === editingActionForGesture ? { ...g, action } : g
    ));

    const gestureName = editingActionForGesture.name;
    setEditingActionForGesture(null);
    setActionContent('');
    alert(`✅ Action added to "${gestureName}"!`);
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
        if (!Array.isArray(imported)) {
          throw new Error('Invalid format: expected array of gestures');
        }
        const validatedGestures: SavedGesture[] = imported.map((g: Partial<SavedGesture> & { name: string; samples: RecordedSample[] }) => ({
          name: g.name,
          samples: g.samples,
          averages: g.averages || { rotateX: 0, rotateY: 0, rotateZ: 0, gX: 0, gY: 0, gZ: 0 },
          ranges: g.ranges || { rotateX: { min: 0, max: 0 }, rotateY: { min: 0, max: 0 }, rotateZ: { min: 0, max: 0 } },
          createdAt: new Date(g.createdAt || Date.now()),
          action: g.action,
          sampleCount: g.sampleCount
        }));
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
    event.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-black">
      {/* Camera Feed - Full Background */}
      <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-slate-900 to-blue-900">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-all duration-300 ${
            cameraEnabled ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transform: `scale(${cameraZoom})` }}
        />
        {!cameraEnabled && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <CameraOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Camera is off</p>
            </div>
          </div>
        )}
      </div>

      {/* Overlay Controls */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full flex flex-col p-4 md:p-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-4 pointer-events-auto">
            <GlassCard className="px-4 py-2 bg-black/70 border-white/40 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <StatusIndicator
                  status={isRawDataMode ? 'active' : 'neutral'}
                  label={isRawDataMode ? 'Recording Active' : 'Stopped'}
                  pulse={isRawDataMode}
                />
                <span className="text-black font-semibold drop-shadow-lg">Gesture Training Mode</span>
              </div>
            </GlassCard>

            <div className="flex items-center gap-2">
              {/* Camera Zoom Controls */}
              {cameraEnabled && (
                <GlassCard className="px-3 py-2 bg-black/70 border-white/40 backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-black text-xs font-semibold drop-shadow-lg">Zoom:</span>
                    <button
                      onClick={() => setCameraZoom(Math.max(0.5, cameraZoom - 0.1))}
                      className="px-2 py-1 bg-white/20 hover:bg-white/30 text-black rounded text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="text-black text-xs font-mono font-bold drop-shadow-lg min-w-[3ch] text-center">
                      {cameraZoom.toFixed(1)}x
                    </span>
                    <button
                      onClick={() => setCameraZoom(Math.min(3, cameraZoom + 0.1))}
                      className="px-2 py-1 bg-white/20 hover:bg-white/30 text-black rounded text-xs font-bold"
                    >
                      +
                    </button>
                    <button
                      onClick={() => setCameraZoom(1)}
                      className="px-2 py-1 bg-white/20 hover:bg-white/30 text-black rounded text-xs font-bold"
                    >
                      Reset
                    </button>
                  </div>
                </GlassCard>
              )}

              <AnimatedButton
                variant="secondary"
                size="sm"
                onClick={toggleCamera}
                className="bg-black/70 border-white/40 text-white hover:bg-black/80 backdrop-blur-xl"
              >
                {cameraEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
              </AnimatedButton>

              <AnimatedButton
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="bg-black/70 border-white/40 text-white hover:bg-red-500/70 backdrop-blur-xl"
              >
                <X className="w-5 h-5" />
              </AnimatedButton>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex gap-4">
            {/* Left Sidebar - All Controls */}
            <div className="w-80 lg:w-96 space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] pointer-events-auto">
              
              {/* Smoothing Control */}
              <GlassCard className="p-3 bg-black/80 border-white/50 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-black drop-shadow-lg" />
                    <span className="text-sm font-bold text-black drop-shadow-lg">Smoothing</span>
                  </div>
                  <span className="text-xs text-black font-semibold drop-shadow-lg">Level: {smoothingLevel}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={smoothingLevel}
                  onChange={(e) => setSmoothingLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
                />
              </GlassCard>

              {/* Action Triggers Toggle */}
              <GlassCard className="p-3 bg-black/80 border-white/50 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-black drop-shadow-lg">Actions</div>
                    <div className="text-xs text-black/90 font-semibold drop-shadow-lg">
                      {actionsEnabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newValue = !actionsEnabled;
                      setActionsEnabled(newValue);
                      localStorage.setItem('colmi-actions-enabled', newValue.toString());
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors shadow-lg ${
                      actionsEnabled
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/30 text-white'
                    }`}
                  >
                    {actionsEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              </GlassCard>

              {/* Live Data & Match Detection */}
              {smoothedData && (
                <GlassCard className="p-3 bg-black/80 border-white/50 backdrop-blur-xl shadow-2xl">
                  <h4 className="text-sm font-bold text-black drop-shadow-lg mb-2">Live Data</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <div className="bg-red-500/30 p-2 rounded border border-red-500/50">
                      <div className="text-black font-bold drop-shadow-lg">X</div>
                      <div className="text-black font-mono font-bold drop-shadow-lg">{toDegrees(smoothedData.rotateX).toFixed(0)}°</div>
                    </div>
                    <div className="bg-green-500/30 p-2 rounded border border-green-500/50">
                      <div className="text-black font-bold drop-shadow-lg">Y</div>
                      <div className="text-black font-mono font-bold drop-shadow-lg">{toDegrees(smoothedData.rotateY).toFixed(0)}°</div>
                    </div>
                    <div className="bg-blue-500/30 p-2 rounded border border-blue-500/50">
                      <div className="text-black font-bold drop-shadow-lg">Z</div>
                      <div className="text-black font-mono font-bold drop-shadow-lg">{toDegrees(smoothedData.rotateZ).toFixed(0)}°</div>
                    </div>
                  </div>
                  {currentMatch && (
                    <div className="p-2 bg-green-500/30 rounded border-2 border-green-400/70 shadow-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-black drop-shadow-lg" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-black drop-shadow-lg truncate">
                            {currentMatch.gesture.name}
                          </div>
                          <div className="text-xs text-black font-bold drop-shadow-lg">
                            {currentMatch.confidence.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </GlassCard>
              )}

              {/* Recording Controls */}
              <GlassCard className="p-3 bg-black/80 border-white/50 backdrop-blur-xl shadow-2xl">
                <h3 className="text-sm font-bold text-black drop-shadow-lg mb-3">Record Gesture</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={gestureName}
                    onChange={(e) => setGestureName(e.target.value)}
                    placeholder="Gesture name..."
                    className="w-full px-3 py-2 text-sm bg-white/20 border-2 border-white/40 rounded-lg text-black placeholder-black/70 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  />
                  <div className="flex gap-2">
                    {!isRecording ? (
                      <AnimatedButton
                        variant="primary"
                        size="sm"
                        onClick={startRecording}
                        disabled={!isConnected || !gestureName.trim()}
                        className="flex-1"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Record
                      </AnimatedButton>
                    ) : (
                      <AnimatedButton
                        variant="secondary"
                        size="sm"
                        onClick={stopRecording}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Square className="w-3 h-3 mr-1" />
                        Stop ({recordedSamples.length})
                      </AnimatedButton>
                    )}
                  </div>
                  {recordedSamples.length > 0 && !isRecording && (
                    <AnimatedButton
                      variant="primary"
                      size="sm"
                      onClick={saveGesture}
                      className="w-full bg-emerald-500 hover:bg-emerald-600"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save ({recordedSamples.length} samples)
                    </AnimatedButton>
                  )}
                </div>
              </GlassCard>

              {/* Saved Gestures */}
              <GlassCard className="p-3 bg-black/80 border-white/50 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-black drop-shadow-lg">
                    Gestures ({savedGestures.length})
                  </h3>
                  <div className="flex gap-2">
                    <label className="cursor-pointer p-1 bg-white/20 hover:bg-white/30 rounded">
                      <Upload className="h-4 w-4 text-black drop-shadow-lg" />
                      <input
                        type="file"
                        accept=".json"
                        onChange={importGestures}
                        className="hidden"
                      />
                    </label>
                    <button 
                      onClick={exportGestures} 
                      disabled={savedGestures.length === 0}
                      className="p-1 bg-white/20 hover:bg-white/30 rounded disabled:opacity-50"
                    >
                      <Download className="h-4 w-4 text-black drop-shadow-lg" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {savedGestures.length === 0 ? (
                    <div className="text-center text-black py-4">
                      <Plus className="w-8 h-8 mx-auto mb-1 drop-shadow-lg" />
                      <p className="text-xs font-semibold drop-shadow-lg">No gestures yet</p>
                    </div>
                  ) : (
                    savedGestures.map((gesture, index) => (
                      <div
                        key={index}
                        className={`rounded-lg p-2 cursor-pointer transition-colors border-2 ${
                          selectedGesture === gesture 
                            ? 'bg-white/30 border-white/60' 
                            : 'bg-white/20 border-white/40 hover:bg-white/25'
                        }`}
                        onClick={() => setSelectedGesture(selectedGesture === gesture ? null : gesture)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-black text-sm font-bold truncate drop-shadow-lg">{gesture.name}</div>
                            <div className="text-black/90 text-xs font-semibold drop-shadow-lg">
                              {gesture.sampleCount || gesture.samples.length} samples
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteGesture(index);
                            }}
                            className="p-1 text-red-600 hover:bg-red-500/30 rounded border border-red-400/50"
                          >
                            <Trash2 className="w-4 h-4 drop-shadow-lg" />
                          </button>
                        </div>
                        {selectedGesture === gesture && (
                          <div className="mt-2 pt-2 border-t-2 border-white/40 text-xs text-black space-y-1">
                            <div className="font-bold drop-shadow-lg">X: {toDegrees(gesture.averages.rotateX).toFixed(0)}°</div>
                            <div className="font-bold drop-shadow-lg">Y: {toDegrees(gesture.averages.rotateY).toFixed(0)}°</div>
                            <div className="font-bold drop-shadow-lg">Z: {toDegrees(gesture.averages.rotateZ).toFixed(0)}°</div>
                            {gesture.action ? (
                              <div className="pt-1 border-t-2 border-white/40">
                                <div className="flex items-center justify-between">
                                  <span className="text-green-700 font-bold drop-shadow-lg">Action: {gesture.action.type}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingActionForGesture(gesture);
                                      setActionType(gesture.action!.type);
                                      setActionContent(gesture.action!.content);
                                      setActionEmoji(gesture.action!.emoji || '🎉');
                                      setImageSize(gesture.action!.imageSize || 'medium');
                                      setAutoCloseTime(gesture.action!.autoCloseTime || 3);
                                      setShowConfetti(gesture.action!.showConfetti || false);
                                    }}
                                    className="text-blue-700 hover:underline text-xs font-bold drop-shadow-lg"
                                  >
                                    Edit
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingActionForGesture(gesture);
                                  setActionType('message');
                                  setActionContent('');
                                  setImageSize('medium');
                                  setAutoCloseTime(3);
                                  setShowConfetti(false);
                                }}
                                className="w-full mt-1 py-1 px-2 bg-blue-500/40 hover:bg-blue-500/60 text-black text-xs rounded font-bold border border-blue-400/50"
                              >
                                + Add Action
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Center/Right Area - Camera Feed (Always Visible) */}
            <div className="flex-1 flex items-center justify-center">
              {!cameraEnabled && (
                <div className="bg-black/60 backdrop-blur-md rounded-2xl p-8 pointer-events-auto">
                  <CameraOff className="w-16 h-16 mx-auto mb-4 text-white/50" />
                  <p className="text-white/80 text-lg mb-4">Camera is off</p>
                  <AnimatedButton
                    variant="primary"
                    onClick={startCamera}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Enable Camera
                  </AnimatedButton>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Instructions */}
          <div className="mt-4 pointer-events-auto">
            <GlassCard className="px-4 py-3 bg-black/80 border-white/50 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-2 text-black text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-lg" />
                <span className="font-bold drop-shadow-lg">
                  {isRecording 
                    ? 'Perform your gesture now...' 
                    : 'Enter a gesture name and click Record to begin'}
                </span>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Action Configuration Modal */}
      {editingActionForGesture && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Configure Action: &ldquo;{editingActionForGesture.name}&rdquo;
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Action Type:
                </label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as 'image' | 'message' | 'sound' | 'url' | 'youtube' | 'linkedin')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="message">Show Message</option>
                  <option value="image">Show Image (URL or Upload)</option>
                  <option value="youtube">Play YouTube Video</option>
                  <option value="linkedin">Open LinkedIn (Auto-close 3s)</option>
                  <option value="sound">Play Sound</option>
                  <option value="url">Open URL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {actionType === 'message' && 'Message Text:'}
                  {actionType === 'image' && 'Image (Upload or URL):'}
                  {actionType === 'youtube' && 'YouTube Video URL:'}
                  {actionType === 'linkedin' && 'LinkedIn Profile URL:'}
                  {actionType === 'sound' && 'Sound URL:'}
                  {actionType === 'url' && 'URL to Open:'}
                </label>

                {actionType === 'image' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Image Size:
                        </label>
                        <select
                          value={imageSize}
                          onChange={(e) => setImageSize(e.target.value as 'small' | 'medium' | 'large' | 'fullscreen')}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="small">Small (128px)</option>
                          <option value="medium">Medium (256px)</option>
                          <option value="large">Large (384px)</option>
                          <option value="fullscreen">Fullscreen</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Auto-close Time:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="30"
                            value={autoCloseTime}
                            onChange={(e) => setAutoCloseTime(Math.max(1, Math.min(30, parseInt(e.target.value) || 3)))}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <span className="text-sm text-gray-500 dark:text-gray-400">sec</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block w-full">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Click to upload image
                          </p>
                          {uploadedImageFile && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                              ✓ {uploadedImageFile.name}
                            </p>
                          )}
                        </div>
                      </label>
                    </div>
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400">OR</div>
                    <input
                      type="text"
                      value={uploadedImageFile ? '' : actionContent}
                      onChange={(e) => {
                        setActionContent(e.target.value);
                        setUploadedImageFile(null);
                      }}
                      placeholder="Enter image URL (https://...)"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      disabled={!!uploadedImageFile}
                    />
                  </div>
                )}

                {actionType === 'youtube' && (
                  <div>
                    <input
                      type="text"
                      value={actionContent}
                      onChange={(e) => setActionContent(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      YouTube link will open in new tab
                    </p>
                  </div>
                )}

                {actionType === 'linkedin' && (
                  <div>
                    <input
                      type="text"
                      value={actionContent}
                      onChange={(e) => setActionContent(e.target.value)}
                      placeholder="https://www.linkedin.com/in/your-profile"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Attempts to load LinkedIn website in iframe (may be blocked by LinkedIn&apos;s security)
                    </p>
                  </div>
                )}

                {actionType === 'message' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Auto-close Time:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="30"
                            value={autoCloseTime}
                            onChange={(e) => setAutoCloseTime(Math.max(1, Math.min(30, parseInt(e.target.value) || 3)))}
                            className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <span className="text-sm text-gray-500 dark:text-gray-400">sec</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confetti Effect:
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowConfetti(!showConfetti)}
                          className={`w-full px-3 py-2 rounded-lg font-medium transition-colors ${
                            showConfetti
                              ? 'bg-purple-600 text-white hover:bg-purple-700'
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                          }`}
                        >
                          {showConfetti ? '🎉 ON' : 'OFF'}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message Text:
                      </label>
                      <textarea
                        value={actionContent}
                        onChange={(e) => setActionContent(e.target.value)}
                        placeholder="Enter your message here..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows={6}
                      />
                    </div>
                  </div>
                )}

                {actionType !== 'image' && actionType !== 'youtube' && actionType !== 'linkedin' && actionType !== 'message' && (
                  <textarea
                    value={actionContent}
                    onChange={(e) => setActionContent(e.target.value)}
                    placeholder={
                      actionType === 'sound' ? 'https://example.com/sound.mp3' :
                      'https://example.com'
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={2}
                  />
                )}
              </div>

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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-8 shadow-2xl transform animate-scaleIn">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Gesture Detected: &ldquo;{triggeredGestureName}&rdquo;
              </h2>

              {triggeredAction.type === 'message' && (
                <>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-wrap">
                    {triggeredAction.content}
                  </p>
                  {triggeredAction.showConfetti && <ConfettiEffect />}
                </>
              )}

              {triggeredAction.type === 'image' && (
                <div className={`mb-6 ${triggeredAction.imageSize === 'fullscreen' ? 'fixed inset-0 bg-black/95 flex items-center justify-center z-50' : ''}`}>
                  <img
                    src={triggeredAction.content}
                    alt="Gesture action"
                    className={`mx-auto rounded-lg shadow-lg ${
                      triggeredAction.imageSize === 'small' ? 'max-w-32 max-h-32' :
                      triggeredAction.imageSize === 'medium' ? 'max-w-64 max-h-64' :
                      triggeredAction.imageSize === 'large' ? 'max-w-96 max-h-96' :
                      triggeredAction.imageSize === 'fullscreen' ? 'max-w-[90vw] max-h-[90vh] object-contain' :
                      'max-w-full max-h-96'
                    }`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" text-anchor="middle" dy=".3em">Image not found</text></svg>';
                    }}
                  />
                  {triggeredAction.imageSize === 'fullscreen' && (
                    <button
                      onClick={() => setShowActionModal(false)}
                      className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  )}
                </div>
              )}

              {triggeredAction.type === 'youtube' && (
                <div className="mb-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">YouTube video opened in new tab</p>
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

              {triggeredAction.type === 'linkedin' && (
                <div className="mb-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">👋</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Loading LinkedIn Profile...
                    </h3>
                    
                    {/* LinkedIn Website Iframe */}
                    <div className="relative w-full h-96 mb-6 rounded-lg overflow-hidden shadow-2xl border-4 border-blue-600">
                      <iframe
                        src={triggeredAction.content}
                        className="w-full h-full"
                        title="LinkedIn Profile"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        loading="eager"
                        onError={() => {
                          console.log('LinkedIn iframe failed to load - this is expected due to X-Frame-Options');
                        }}
                      />
                      
                      {/* Fallback overlay in case iframe is blocked */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white opacity-0 hover:opacity-95 transition-opacity duration-300">
                        <div className="text-center p-6">
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-blue-600 text-3xl font-bold">in</span>
                          </div>
                          <h4 className="text-xl font-bold mb-2">LinkedIn Profile</h4>
                          <p className="text-blue-100 mb-4">
                            LinkedIn blocks embedding for security.<br/>
                            Click below to view my profile!
                          </p>
                          <a
                            href={triggeredAction.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
                          >
                            Open LinkedIn Profile →
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {triggeredAction.content}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Auto-closing in 3 seconds... (Hover over frame if LinkedIn is blocked)
                      </p>
                    </div>
                  </div>
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
                className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
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
