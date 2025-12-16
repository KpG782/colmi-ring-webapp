'use client';

import { useState, useEffect, useRef } from 'react';
import type { AccelerometerData, SavedGesture } from '@/lib/types';

interface PointerControlProps {
  isConnected: boolean;
  isRawDataMode: boolean;
  accelerometerData: AccelerometerData | null;
  onStartRawData: () => void;
  onStopRawData: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface HighlightCircle {
  x: number;
  y: number;
  radius: number;
  timestamp: number;
}

type PointerMode = 'cursor' | 'laser' | 'scroll';
type ClickAction = 'none' | 'left' | 'right' | 'double';

export function PointerControl({
  isConnected,
  isRawDataMode,
  accelerometerData,
  onStartRawData,
  onStopRawData,
}: PointerControlProps) {
  // Pointer state
  const [pointerMode, setPointerMode] = useState<PointerMode>('cursor');
  const [pointerActive, setPointerActive] = useState(false);
  const pointerPositionRef = useRef<Point>({ x: 512, y: 384 }); // Center of 1024x768
  const [pointerPosition, setPointerPosition] = useState<Point>({ x: 512, y: 384 });
  
  // Settings
  const [sensitivity, setSensitivity] = useState(30);
  const [smoothing, setSmoothing] = useState(85);
  const [screenWidth, setScreenWidth] = useState(1024);
  const [screenHeight, setScreenHeight] = useState(768);
  const [laserSize, setLaserSize] = useState(50);
  
  // Advanced stabilization settings
  const [deadZone, setDeadZone] = useState(0.05); // Ignore movements < 0.05g
  const [emaAlpha, setEmaAlpha] = useState(0.3); // 30% new data, 70% history
  const [momentumDecay, setMomentumDecay] = useState(0.85); // 85% momentum retention
  const [adaptiveZones, setAdaptiveZones] = useState(true); // Enable adaptive sensitivity zones
  
  // Stabilization state
  const emaStateRef = useRef({ gX: 0, gY: 0, pitchDeg: 0, rollDeg: 0 });
  const momentumRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  
  // Click detection
  const [clickAction, setClickAction] = useState<ClickAction>('none');
  const lastFlickTimeRef = useRef(0);
  const holdStartRef = useRef(0);
  const circlePointsRef = useRef<Point[]>([]);
  
  // Laser pointer highlights
  const [highlights, setHighlights] = useState<HighlightCircle[]>([]);
  
  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Apply Exponential Moving Average smoothing
  const applyEMA = (newValue: number, oldValue: number, alpha: number): number => {
    return alpha * newValue + (1 - alpha) * oldValue;
  };

  // Apply dead zone filtering
  const applyDeadZone = (value: number, threshold: number): number => {
    return Math.abs(value) < threshold ? 0 : value;
  };

  // Calculate adaptive sensitivity based on position
  const getAdaptiveSensitivity = (x: number, y: number, baseSensitivity: number): number => {
    if (!adaptiveZones) return baseSensitivity;

    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    
    // Calculate distance from center (0 to 1)
    const distX = Math.abs(x - centerX) / (screenWidth / 2);
    const distY = Math.abs(y - centerY) / (screenHeight / 2);
    const distFromCenter = Math.sqrt(distX * distX + distY * distY);
    
    // Center zone (0-0.5): High sensitivity
    // Mid zone (0.5-0.8): Medium sensitivity
    // Edge zone (0.8-1.0): Low sensitivity
    if (distFromCenter < 0.5) {
      return baseSensitivity * 1.2; // 20% higher in center
    } else if (distFromCenter < 0.8) {
      return baseSensitivity; // Normal in mid zone
    } else {
      return baseSensitivity * 0.6; // 40% lower at edges
    }
  };



  // Detect quick flick gesture (left click)
  const detectFlick = (gX: number, gY: number, gZ: number): boolean => {
    const magnitude = Math.sqrt(gX * gX + gY * gY + gZ * gZ);
    return magnitude > 2.0; // Threshold for quick movement
  };

  // Detect hold position (right click)
  const detectHold = (gX: number, gY: number, gZ: number): boolean => {
    const magnitude = Math.sqrt(gX * gX + gY * gY + gZ * gZ);
    const isStable = magnitude < 0.3; // Very stable position
    
    if (isStable) {
      if (holdStartRef.current === 0) {
        holdStartRef.current = Date.now();
      } else if (Date.now() - holdStartRef.current > 1500) {
        // Held for 1.5 seconds
        return true;
      }
    } else {
      holdStartRef.current = 0;
    }
    return false;
  };

  // Detect circular motion (scroll)
  const detectCircle = (x: number, y: number): { detected: boolean; direction: 'up' | 'down' } => {
    circlePointsRef.current.push({ x, y });
    
    // Keep last 20 points
    if (circlePointsRef.current.length > 20) {
      circlePointsRef.current.shift();
    }

    // Need at least 15 points to detect circle
    if (circlePointsRef.current.length < 15) {
      return { detected: false, direction: 'up' };
    }

    // Calculate if points form a circular pattern
    const points = circlePointsRef.current;
    let angleSum = 0;
    
    for (let i = 2; i < points.length; i++) {
      const p1 = points[i - 2];
      const p2 = points[i - 1];
      const p3 = points[i];
      
      const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
      
      let angleDiff = angle2 - angle1;
      if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
      
      angleSum += angleDiff;
    }

    // If total angle change > 300 degrees, it's a circle
    const totalRotation = Math.abs(angleSum);
    if (totalRotation > (300 * Math.PI / 180)) {
      const direction = angleSum > 0 ? 'down' : 'up';
      circlePointsRef.current = []; // Reset
      return { detected: true, direction };
    }

    return { detected: false, direction: 'up' };
  };

  // Toggle pointer control
  const togglePointer = () => {
    setPointerActive(!pointerActive);
    if (!pointerActive) {
      // Reset to center when activating
      const centerX = screenWidth / 2;
      const centerY = screenHeight / 2;
      pointerPositionRef.current = { x: centerX, y: centerY };
      setPointerPosition({ x: centerX, y: centerY });
      holdStartRef.current = 0;
      circlePointsRef.current = [];
    }
  };

  // Main accelerometer processing
  useEffect(() => {
    if (!accelerometerData || !isRawDataMode) {
      console.log('🎯 Pointer: No data or not in raw mode', { hasData: !!accelerometerData, isRawDataMode });
      return;
    }

    const pitchRad = accelerometerData.rotateX;
    const rollRad = accelerometerData.rotateY;
    const pitchDeg = (pitchRad * 180) / Math.PI;
    const rollDeg = (rollRad * 180) / Math.PI;
    const { gX, gY, gZ } = accelerometerData;

    // Only process if pointer is active
    if (!pointerActive) return;

    // Detect click gestures
    const flickDetected = detectFlick(gX, gY, gZ);
    const holdDetected = detectHold(gX, gY, gZ);
    const circleResult = detectCircle(pointerPositionRef.current.x, pointerPositionRef.current.y);

    if (flickDetected && Date.now() - lastFlickTimeRef.current > 500) {
      lastFlickTimeRef.current = Date.now();
      setClickAction('left');
      setTimeout(() => setClickAction('none'), 200);
    } else if (holdDetected) {
      setClickAction('right');
      holdStartRef.current = 0;
      setTimeout(() => setClickAction('none'), 200);
    } else if (circleResult.detected) {
      setClickAction('double');
      setTimeout(() => setClickAction('none'), 200);
    }

    // Cursor/laser positioning based on mode
    if (pointerMode === 'cursor' || pointerMode === 'laser') {
      // LAYER 1: Dead Zone - Filter out hand tremor
      const filteredGX = applyDeadZone(gX, deadZone);
      const filteredGY = applyDeadZone(gY, deadZone);
      
      // LAYER 2: EMA Smoothing - Reduce jitter
      emaStateRef.current.gX = applyEMA(filteredGX, emaStateRef.current.gX, emaAlpha);
      emaStateRef.current.gY = applyEMA(filteredGY, emaStateRef.current.gY, emaAlpha);
      emaStateRef.current.pitchDeg = applyEMA(pitchDeg, emaStateRef.current.pitchDeg, emaAlpha);
      emaStateRef.current.rollDeg = applyEMA(rollDeg, emaStateRef.current.rollDeg, emaAlpha);
      
      // Map tilt angles to screen coordinates
      const angleRange = 45; // degrees
      const normalizedPitch = Math.max(-1, Math.min(1, emaStateRef.current.pitchDeg / angleRange));
      const normalizedRoll = Math.max(-1, Math.min(1, emaStateRef.current.rollDeg / angleRange));

      // LAYER 3: Adaptive Sensitivity - Different sensitivity by zone
      const currentX = pointerPositionRef.current.x;
      const currentY = pointerPositionRef.current.y;
      const adaptiveSens = getAdaptiveSensitivity(currentX, currentY, sensitivity);
      
      // Calculate target position with adaptive sensitivity
      const targetX =
        (screenWidth / 2) +
        (normalizedRoll * screenWidth / 2) * (adaptiveSens / 50);
      const targetY =
        (screenHeight / 2) +
        (normalizedPitch * screenHeight / 2) * (adaptiveSens / 50);

      // Clamp to screen bounds
      const clampedX = Math.max(0, Math.min(screenWidth, targetX));
      const clampedY = Math.max(0, Math.min(screenHeight, targetY));

      // LAYER 4: Calculate velocity for momentum
      const deltaX = clampedX - currentX;
      const deltaY = clampedY - currentY;
      velocityRef.current.x = deltaX;
      velocityRef.current.y = deltaY;
      
      // LAYER 5: Apply momentum damping
      momentumRef.current.x = momentumRef.current.x * momentumDecay + velocityRef.current.x * (1 - momentumDecay);
      momentumRef.current.y = momentumRef.current.y * momentumDecay + velocityRef.current.y * (1 - momentumDecay);
      
      // Apply smoothing
      const smoothFactor = smoothing / 100;
      const newX = currentX + (clampedX - currentX) * (1 - smoothFactor) + momentumRef.current.x * 0.1;
      const newY = currentY + (clampedY - currentY) * (1 - smoothFactor) + momentumRef.current.y * 0.1;

      pointerPositionRef.current = { x: newX, y: newY };
      setPointerPosition({ x: newX, y: newY });

      // Add highlight in laser mode when clicking
      if (pointerMode === 'laser' && clickAction === 'left') {
        setHighlights((prev) => [
          ...prev,
          {
            x: newX,
            y: newY,
            radius: laserSize,
            timestamp: Date.now(),
          },
        ]);
      }
    }

    // Scroll mode - use tilt for scroll amount
    if (pointerMode === 'scroll') {
      // Y tilt controls scroll direction and speed
      // No position update in scroll mode
    }
  }, [
    accelerometerData,
    isRawDataMode,
    pointerActive,
    pointerMode,
    sensitivity,
    smoothing,
    screenWidth,
    screenHeight,
    laserSize,
    clickAction,
    deadZone,
    emaAlpha,
    momentumDecay,
    adaptiveZones,
  ]);

  // Clean up old highlights
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setHighlights((prev) =>
        prev.filter((h) => now - h.timestamp < 3000) // Keep for 3 seconds
      );
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Redraw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    // Draw grid lines
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // Vertical lines
    for (let x = 0; x <= screenWidth; x += screenWidth / 4) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, screenHeight);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= screenHeight; y += screenHeight / 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(screenWidth, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Draw highlights (laser mode)
    if (pointerMode === 'laser') {
      highlights.forEach((h) => {
        const age = Date.now() - h.timestamp;
        const opacity = Math.max(0, 1 - age / 3000);
        
        ctx.fillStyle = `rgba(239, 68, 68, ${opacity * 0.3})`;
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = `rgba(239, 68, 68, ${opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    // ALWAYS draw cursor position (visible whether active or not)
    const { x, y } = pointerPosition;
    
    // Draw crosshair at current position
    if (!pointerActive) {
      // When inactive: Show position with gray crosshair
      ctx.strokeStyle = '#6b7280'; // gray-500
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      
      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(screenWidth, y);
      ctx.stroke();
      
      // Vertical line
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, screenHeight);
      ctx.stroke();
      
      ctx.setLineDash([]);
      
      // Center circle
      ctx.fillStyle = '#6b7280';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Position coordinates
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px monospace';
      ctx.fillText(`(${Math.round(x)}, ${Math.round(y)})`, x + 10, y - 10);
    }

    // Draw active pointer
    if (pointerActive) {

      if (pointerMode === 'cursor') {
        // Cursor mode - arrow pointer with position
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 15, y + 10);
        ctx.lineTo(x + 10, y + 15);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Show position
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`(${Math.round(x)}, ${Math.round(y)})`, x + 20, y - 5);
      } else if (pointerMode === 'laser') {
        // Laser mode - red dot with glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, laserSize);
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
        gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.4)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, laserSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Center dot
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (pointerMode === 'scroll') {
        // Scroll mode - arrows indicating scroll direction
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('↕️', x, y);
      }

      // Draw click action feedback
      if (clickAction !== 'none') {
        let actionText = '';
        let actionColor = '';
        
        if (clickAction === 'left') {
          actionText = 'LEFT CLICK';
          actionColor = '#3b82f6';
        } else if (clickAction === 'right') {
          actionText = 'RIGHT CLICK';
          actionColor = '#8b5cf6';
        } else if (clickAction === 'double') {
          actionText = 'SCROLL';
          actionColor = '#10b981';
        }
        
        ctx.fillStyle = actionColor;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(actionText, x, y - 50);
      }
    } else {
      // Show "inactive" message
      ctx.fillStyle = '#9ca3af';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Perform gesture to activate pointer', screenWidth / 2, screenHeight / 2);
    }
  }, [pointerPosition, pointerActive, pointerMode, highlights, clickAction, screenWidth, screenHeight, laserSize]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-50">3D Pointer Control</h2>
            <p className="text-gray-400 mt-1">
              Control your cursor in 3D space - like a Wii remote!
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={togglePointer}
              disabled={!isConnected || !isRawDataMode}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                pointerActive
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed'
              }`}
            >
              {pointerActive ? '⏹️ Stop Pointer' : '▶️ Start Pointer'}
            </button>
          </div>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
            <p className="text-red-400">
              ⚠️ Ring not connected. Please connect your Colmi Ring first.
            </p>
          </div>
        )}

        {isConnected && !isRawDataMode && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
            <p className="text-yellow-400 mb-2">
              📡 Raw Data Mode required for pointer control
            </p>
            <button
              onClick={onStartRawData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Start Raw Data Mode
            </button>
          </div>
        )}
      </div>

      {/* Mode Selection */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-50 mb-4">Pointer Mode</h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setPointerMode('cursor')}
            className={`p-4 rounded-lg border-2 transition-all ${
              pointerMode === 'cursor'
                ? 'border-blue-500 bg-blue-500/20'
                : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
            }`}
          >
            <div className="text-3xl mb-2">🖱️</div>
            <div className="font-semibold text-gray-50">Cursor</div>
            <div className="text-sm text-gray-400 mt-1">Standard pointer</div>
          </button>
          
          <button
            onClick={() => setPointerMode('laser')}
            className={`p-4 rounded-lg border-2 transition-all ${
              pointerMode === 'laser'
                ? 'border-red-500 bg-red-500/20'
                : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
            }`}
          >
            <div className="text-3xl mb-2">🔴</div>
            <div className="font-semibold text-gray-50">Laser</div>
            <div className="text-sm text-gray-400 mt-1">Presentation mode</div>
          </button>
          
          <button
            onClick={() => setPointerMode('scroll')}
            className={`p-4 rounded-lg border-2 transition-all ${
              pointerMode === 'scroll'
                ? 'border-green-500 bg-green-500/20'
                : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
            }`}
          >
            <div className="text-3xl mb-2">↕️</div>
            <div className="font-semibold text-gray-50">Scroll</div>
            <div className="text-sm text-gray-400 mt-1">Vertical scroll</div>
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-50 mb-4">Settings</h3>
        
        {/* Screen dimensions */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Screen Width: {screenWidth}px
            </label>
            <input
              type="range"
              min="800"
              max="3840"
              step="1"
              value={screenWidth}
              onChange={(e) => setScreenWidth(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Screen Height: {screenHeight}px
            </label>
            <input
              type="range"
              min="600"
              max="2160"
              step="1"
              value={screenHeight}
              onChange={(e) => setScreenHeight(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Sensitivity */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sensitivity: {sensitivity}
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={sensitivity}
            onChange={(e) => setSensitivity(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Smoothing */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Smoothing: {smoothing}%
          </label>
          <input
            type="range"
            min="0"
            max="95"
            value={smoothing}
            onChange={(e) => setSmoothing(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Laser size (laser mode only) */}
        {pointerMode === 'laser' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Laser Size: {laserSize}px
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={laserSize}
              onChange={(e) => setLaserSize(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        {/* Stabilization Section */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-md font-semibold text-gray-50 mb-4 flex items-center gap-2">
            🎯 Advanced Stabilization
          </h4>
          
          {/* Dead Zone */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Dead Zone: {(deadZone * 100).toFixed(0)}% (filter tremor)
            </label>
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={deadZone * 100}
              onChange={(e) => setDeadZone(Number(e.target.value) / 100)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Ignores tiny movements below threshold</p>
          </div>

          {/* EMA Alpha */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Response Speed: {(emaAlpha * 100).toFixed(0)}% (jitter reduction)
            </label>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={emaAlpha * 100}
              onChange={(e) => setEmaAlpha(Number(e.target.value) / 100)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Lower = smoother, Higher = more responsive</p>
          </div>

          {/* Momentum Decay */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Momentum: {(momentumDecay * 100).toFixed(0)}% (coast effect)
            </label>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={momentumDecay * 100}
              onChange={(e) => setMomentumDecay(Number(e.target.value) / 100)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Higher = cursor coasts longer when stopping</p>
          </div>

          {/* Adaptive Zones Toggle */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={adaptiveZones}
                onChange={(e) => setAdaptiveZones(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-300">
                Adaptive Sensitivity Zones
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Higher sensitivity in center, lower at edges for better control
            </p>
          </div>
        </div>

        {/* Preset buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setScreenWidth(1920);
              setScreenHeight(1080);
            }}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            1920×1080 (Full HD)
          </button>
          <button
            onClick={() => {
              setScreenWidth(1024);
              setScreenHeight(768);
            }}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            1024×768 (4:3)
          </button>
          <button
            onClick={() => {
              setScreenWidth(2560);
              setScreenHeight(1440);
            }}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            2560×1440 (QHD)
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-50">Virtual Screen</h3>
          <button
            onClick={() => setHighlights([])}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            Clear Highlights
          </button>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={screenWidth}
            height={screenHeight}
            className="border border-gray-700 rounded"
            style={{
              maxWidth: '100%',
              height: 'auto',
            }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-50 mb-4">How to Use</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-50 mb-2">🎯 Cursor Mode</h4>
            <ul className="list-disc list-inside text-gray-400 space-y-1">
              <li>Tilt hand to move cursor</li>
              <li><strong className="text-gray-300">Quick flick</strong> → Left click</li>
              <li><strong className="text-gray-300">Hold steady (1.5s)</strong> → Right click</li>
              <li><strong className="text-gray-300">Draw circle</strong> → Scroll</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-50 mb-2">🔴 Laser Mode (Presentations)</h4>
            <ul className="list-disc list-inside text-gray-400 space-y-1">
              <li>Point at screen to highlight areas</li>
              <li>Quick flick creates persistent highlight circle</li>
              <li>Perfect for presentations and demos</li>
              <li>Highlights fade after 3 seconds</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-50 mb-2">↕️ Scroll Mode</h4>
            <ul className="list-disc list-inside text-gray-400 space-y-1">
              <li>Tilt forward → Scroll down</li>
              <li>Tilt backward → Scroll up</li>
              <li>Great for reading long documents</li>
            </ul>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
            <p className="text-blue-400 font-semibold mb-2">💡 Pro Tips:</p>
            <ul className="list-disc list-inside text-blue-300 space-y-1">
              <li>Rest elbow on desk for stability</li>
              <li>Start with high smoothing (85%) for precise control</li>
              <li>Adjust sensitivity based on your screen size</li>
              <li>Practice gestures for reliable click detection</li>
              <li>Use laser mode for presentations - it looks impressive!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
