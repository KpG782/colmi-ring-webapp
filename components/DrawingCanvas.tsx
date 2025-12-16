'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Paintbrush, Trash2, Download, Play, Square, Palette, Eraser } from 'lucide-react';
import { AccelerometerData } from '../lib/types';

interface DrawingCanvasProps {
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

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

interface SavedGesture {
  name: string;
  samples: any[];
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
}

/**
 * DrawingCanvas Component
 * 
 * Gesture-controlled drawing using accelerometer data.
 * Use a saved gesture from Gesture Trainer to start/stop drawing.
 */
export function DrawingCanvas({
  isConnected,
  isRawDataMode,
  accelerometerData,
  onStartRawData,
  onStopRawData
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorPositionRef = useRef({ x: 400, y: 300 }); // Use ref to avoid infinite loop
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [penColor, setPenColor] = useState('#000000');
  const [penWidth, setPenWidth] = useState(3);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [cursorPosition, setCursorPosition] = useState({ x: 400, y: 300 });
  const [smoothingFactor, setSmoothingFactor] = useState(0.3);
  const [sensitivity, setSensitivity] = useState(50);
  const [drawingMode, setDrawingMode] = useState<'2d' | '1d' | 'blackboard'>('blackboard'); // Default to blackboard mode
  const [lineSpeed, setLineSpeed] = useState(3); // Pixels per frame in 1D mode
  const [blackboardSensitivity, setBlackboardSensitivity] = useState(150); // Movement sensitivity for blackboard mode
  
  // For gesture detection
  const [savedGestures, setSavedGestures] = useState<SavedGesture[]>([]);
  const [selectedGestureName, setSelectedGestureName] = useState<string>('');
  const [lastTriggeredTime, setLastTriggeredTime] = useState(0);
  const [gestureConfidenceThreshold, setGestureConfidenceThreshold] = useState(80);

  // Load gestures from localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('colmi-ring-gestures');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        const gestures = parsed.map((g: any) => ({
          ...g,
          createdAt: new Date(g.createdAt)
        }));
        setSavedGestures(gestures);
        console.log(`✅ Loaded ${gestures.length} gestures for drawing canvas`);
      }
    } catch (error) {
      console.error('Error loading gestures:', error);
    }
  }, []);

  // Initialize canvas with fixed size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Fixed canvas size for consistent drawing
    const fixedWidth = 600;
    const fixedHeight = 600;
    
    setCanvasSize({ width: fixedWidth, height: fixedHeight });
    canvas.width = fixedWidth;
    canvas.height = fixedHeight;
    
    // Reset cursor to center
    cursorPositionRef.current = { x: fixedWidth / 2, y: fixedHeight / 2 };
    setCursorPosition({ x: fixedWidth / 2, y: fixedHeight / 2 });
    
    redrawCanvas();
  }, []);

  // Redraw all strokes on canvas
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      
      ctx.stroke();
    });

    // Draw current stroke if drawing
    if (isDrawing && currentStroke.length > 0) {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
      }
      
      ctx.stroke();
    }

    // Draw cursor
    ctx.fillStyle = isDrawing ? penColor : '#999999';
    ctx.beginPath();
    ctx.arc(cursorPosition.x, cursorPosition.y, isDrawing ? penWidth / 2 : 5, 0, Math.PI * 2);
    ctx.fill();
  };

  // Redraw when strokes or cursor changes
  useEffect(() => {
    redrawCanvas();
  }, [strokes, currentStroke, cursorPosition, isDrawing, penColor, penWidth]);

  // Detect gesture and update cursor position
  useEffect(() => {
    if (!accelerometerData || !isRawDataMode) return;

    // Gesture recognition - check if selected gesture is matched
    if (selectedGestureName && savedGestures.length > 0) {
      const selectedGesture = savedGestures.find(g => g.name === selectedGestureName);
      
      if (selectedGesture) {
        // Calculate distance from current position to gesture average
        const xDiff = Math.abs(accelerometerData.rotateX - selectedGesture.averages.rotateX);
        const yDiff = Math.abs(accelerometerData.rotateY - selectedGesture.averages.rotateY);
        const zDiff = Math.abs(accelerometerData.rotateZ - selectedGesture.averages.rotateZ);

        const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff + zDiff * zDiff);
        const maxDistance = Math.PI / 2; // 90 degrees in radians
        const confidence = Math.max(0, (1 - (distance / maxDistance)) * 100);

        // Trigger toggle if confidence is high enough
        const now = Date.now();
        if (confidence >= gestureConfidenceThreshold && now - lastTriggeredTime > 1000) {
          console.log(`✅ Gesture "${selectedGestureName}" detected with ${confidence.toFixed(1)}% confidence`);
          toggleDrawing();
          setLastTriggeredTime(now);
        }
      }
    }

    const toDegrees = (rad: number) => (rad * 180) / Math.PI;
    const pitchDeg = toDegrees(accelerometerData.rotateX);  // Forward/Back tilt
    const rollDeg = toDegrees(accelerometerData.rotateY);   // Left/Right tilt
    const currentPos = cursorPositionRef.current;

    let clampedX: number;
    let clampedY: number;

    if (drawingMode === 'blackboard') {
      // BLACKBOARD MODE: Hand movement in space = drawing on board
      // Use G-forces to detect hand movement direction
      const gX = accelerometerData.gX; // Left/Right movement
      const gY = accelerometerData.gY; // Forward/Back movement
      
      // Map hand movement to cursor movement on canvas
      // Positive gX = moving right, Negative gX = moving left
      // Positive gY = moving forward (up on canvas), Negative gY = moving back (down)
      const moveX = gX * blackboardSensitivity;
      const moveY = -gY * blackboardSensitivity; // Inverted Y for natural up/down
      
      // Apply movement to current position
      clampedX = Math.max(0, Math.min(canvasSize.width, currentPos.x + moveX));
      clampedY = Math.max(0, Math.min(canvasSize.height, currentPos.y + moveY));
      
    } else if (drawingMode === '1d') {
      // 1D MODE: Hand tilt controls DIRECTION of line extension
      // Calculate angle from pitch and roll
      const angle = Math.atan2(pitchDeg, rollDeg); // Angle in radians
      
      // Move cursor in that direction at constant speed
      const moveX = Math.cos(angle) * lineSpeed;
      const moveY = Math.sin(angle) * lineSpeed;
      
      // Only move when drawing (so cursor doesn't drift when not drawing)
      if (isDrawing) {
        clampedX = Math.max(0, Math.min(canvasSize.width, currentPos.x + moveX));
        clampedY = Math.max(0, Math.min(canvasSize.height, currentPos.y + moveY));
      } else {
        clampedX = currentPos.x;
        clampedY = currentPos.y;
      }
    } else {
      // 2D MODE: Hand tilt maps directly to canvas position
      const angleRange = 45; // degrees of tilt range to map
      
      const normalizedPitch = Math.max(-angleRange, Math.min(angleRange, pitchDeg)) / angleRange;
      const targetY = (canvasSize.height / 2) + (normalizedPitch * canvasSize.height / 2) * (sensitivity / 50);
      
      const normalizedRoll = Math.max(-angleRange, Math.min(angleRange, rollDeg)) / angleRange;
      const targetX = (canvasSize.width / 2) + (normalizedRoll * canvasSize.width / 2) * (sensitivity / 50);

      const smoothedX = currentPos.x + (targetX - currentPos.x) * smoothingFactor;
      const smoothedY = currentPos.y + (targetY - currentPos.y) * smoothingFactor;

      clampedX = Math.max(0, Math.min(canvasSize.width, smoothedX));
      clampedY = Math.max(0, Math.min(canvasSize.height, smoothedY));
    }

    // Update ref
    cursorPositionRef.current = { x: clampedX, y: clampedY };
    
    // Update state for rendering
    setCursorPosition({ x: clampedX, y: clampedY });

    // Add point to current stroke if drawing
    if (isDrawing) {
      setCurrentStroke(prev => [...prev, { x: clampedX, y: clampedY }]);
    }
  }, [accelerometerData, isRawDataMode, selectedGestureName, savedGestures, gestureConfidenceThreshold, lastTriggeredTime, isDrawing, sensitivity, smoothingFactor, canvasSize]);

  const toggleDrawing = () => {
    if (isDrawing) {
      // Stop drawing - save current stroke
      if (currentStroke.length > 0) {
        setStrokes(prev => [...prev, {
          points: currentStroke,
          color: penColor,
          width: penWidth
        }]);
        setCurrentStroke([]);
      }
      setIsDrawing(false);
    } else {
      // Start drawing - use ref position
      setIsDrawing(true);
      setCurrentStroke([cursorPositionRef.current]);
    }
  };

  const clearCanvas = () => {
    if (confirm('Clear entire canvas? This cannot be undone.')) {
      setStrokes([]);
      setCurrentStroke([]);
      setIsDrawing(false);
      redrawCanvas();
    }
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `ring-drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const undoStroke = () => {
    if (strokes.length > 0) {
      setStrokes(prev => prev.slice(0, -1));
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Paintbrush className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Gesture Drawing Canvas
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Draw with hand movements • Pinch to start/stop
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-50 mb-3">
          📝 How to Draw:
        </h4>
        <ol className="text-sm text-blue-900 dark:text-blue-100 space-y-1 mb-4">
          <li>1. Select a gesture from the dropdown (train it first in Gestures tab)</li>
          <li>2. Start Raw Data Mode</li>
          <li>3. Perform your selected gesture to START drawing</li>
          <li>4. Move your hand to control the cursor (pitch = up/down, roll = left/right)</li>
          <li>5. Perform the same gesture again to STOP drawing</li>
          <li>6. Repeat to create multiple strokes</li>
        </ol>
        
        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
          <h4 className="text-xs font-bold text-blue-900 dark:text-blue-50 mb-2">
            🎨 Drawing Technique Guide:
          </h4>
          <div className="text-xs text-blue-900 dark:text-blue-100 space-y-2">
            <div>
              <strong>Hand Position:</strong> Keep your arm relaxed, rest your elbow on a surface for stability
            </div>
            <div>
              <strong>Drawing Motion:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• <strong>Tilt forward</strong> (pitch down) = cursor moves UP</li>
                <li>• <strong>Tilt backward</strong> (pitch up) = cursor moves DOWN</li>
                <li>• <strong>Tilt left</strong> (roll left) = cursor moves LEFT</li>
                <li>• <strong>Tilt right</strong> (roll right) = cursor moves RIGHT</li>
              </ul>
            </div>
            <div>
              <strong>Pro Tips:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Start with LOW sensitivity (10-30) for precise control</li>
                <li>• Use HIGH smoothing (70-100%) to reduce shake</li>
                <li>• Draw simple shapes first: lines, circles, squares</li>
                <li>• Make small, gentle movements - avoid sudden jerks</li>
                <li>• Rest between strokes to maintain steady control</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        {/* Gesture Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Select Gesture to Start/Stop Drawing:
          </label>
          {savedGestures.length === 0 ? (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-700">
              <p className="text-sm text-yellow-900 dark:text-yellow-100">
                No gestures found. Go to the <strong>Gestures</strong> tab to train a gesture first.
              </p>
            </div>
          ) : (
            <select
              value={selectedGestureName}
              onChange={(e) => setSelectedGestureName(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
            >
              <option value="">-- Select a gesture --</option>
              {savedGestures.map((gesture, idx) => (
                <option key={idx} value={gesture.name}>
                  {gesture.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Raw Data Control */}
        <div className="flex gap-2">
          {!isRawDataMode ? (
            <button
              onClick={onStartRawData}
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
              onClick={onStopRawData}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
            >
              <Square className="h-4 w-4" />
              Stop Raw Data Mode
            </button>
          )}
        </div>

        {/* Drawing Status */}
        {isRawDataMode && (
          <div className={`p-3 rounded-lg text-center font-bold ${
            isDrawing 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-50 border-2 border-green-600'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-2 border-gray-400 dark:border-gray-500'
          }`}>
            {isDrawing ? (selectedGestureName ? `Drawing Active - Do "${selectedGestureName}" to Stop` : 'Drawing Active') : (selectedGestureName ? `Ready - Do "${selectedGestureName}" to Start` : 'Ready - Select a gesture first')}
          </div>
        )}

        {/* Drawing Mode Selector */}
        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-300 dark:border-purple-700">
          <label className="block text-sm font-bold text-purple-900 dark:text-purple-100 mb-2">
            Drawing Mode:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setDrawingMode('blackboard')}
              className={`py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                drawingMode === 'blackboard'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              🖊️ Blackboard
            </button>
            <button
              onClick={() => setDrawingMode('1d')}
              className={`py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                drawingMode === '1d'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              1D Direction
            </button>
            <button
              onClick={() => setDrawingMode('2d')}
              className={`py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                drawingMode === '2d'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              2D Position
            </button>
          </div>
          <p className="text-xs text-purple-800 dark:text-purple-200 mt-2">
            {drawingMode === 'blackboard'
              ? '🖊️ Move your hand in space like drawing on a whiteboard - most intuitive!'
              : drawingMode === '1d' 
              ? '✨ Tilt hand to control direction - line extends automatically while drawing'
              : '🎯 Tilt hand to position cursor anywhere on canvas'}
          </p>
        </div>

        {/* Pen Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              <Palette className="h-4 w-4 inline mr-1" />
              Pen Color:
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={penColor}
                onChange={(e) => setPenColor(e.target.value)}
                className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <div className="flex gap-1">
                {['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'].map(color => (
                  <button
                    key={color}
                    onClick={() => setPenColor(color)}
                    className={`w-8 h-10 rounded border-2 ${penColor === color ? 'border-gray-900 dark:border-white' : 'border-gray-300'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Pen Width */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Pen Width: {penWidth}px
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={penWidth}
              onChange={(e) => setPenWidth(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Mode-specific control */}
          {drawingMode === 'blackboard' ? (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Movement Sensitivity: {blackboardSensitivity}
              </label>
              <input
                type="range"
                min="50"
                max="300"
                value={blackboardSensitivity}
                onChange={(e) => setBlackboardSensitivity(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 mt-1">
                <span>Small moves</span>
                <span>Big moves</span>
              </div>
            </div>
          ) : drawingMode === '1d' ? (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Line Speed: {lineSpeed} px/frame
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={lineSpeed}
                onChange={(e) => setLineSpeed(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 mt-1">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Position Sensitivity: {sensitivity}
              </label>
              <input
                type="range"
                min="10"
                max="200"
                value={sensitivity}
                onChange={(e) => setSensitivity(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 mt-1">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>
          )}

          {/* Smoothing */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Smoothing: {(smoothingFactor * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={smoothingFactor}
              onChange={(e) => setSmoothingFactor(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 mt-1">
              <span>Precise</span>
              <span>Smooth</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={undoStroke}
            disabled={strokes.length === 0}
            className="flex-1 py-2 px-4 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            Undo Last Stroke
          </button>
          <button
            onClick={clearCanvas}
            disabled={strokes.length === 0 && currentStroke.length === 0}
            className="flex-1 py-2 px-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            <Trash2 className="h-4 w-4 inline mr-2" />
            Clear All
          </button>
          <button
            onClick={downloadDrawing}
            disabled={strokes.length === 0}
            className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            <Download className="h-4 w-4 inline mr-2" />
            Download
          </button>
        </div>
      </div>

      {/* Canvas and Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Drawing Canvas - Fixed Size */}
        <div className="lg:col-span-2">
          <div className="relative bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden" style={{ width: '600px', height: '600px', margin: '0 auto' }}>
            <canvas
              ref={canvasRef}
              style={{ touchAction: 'none', width: '600px', height: '600px' }}
            />
            
            {/* Center crosshair guide */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Vertical center line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600 opacity-30" />
              {/* Horizontal center line */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 dark:bg-gray-600 opacity-30" />
              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            
            {/* Stats Overlay */}
            {isRawDataMode && accelerometerData && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
                <div>Strokes: {strokes.length}</div>
                <div>Points: {currentStroke.length}</div>
                <div>Cursor: ({cursorPosition.x.toFixed(0)}, {cursorPosition.y.toFixed(0)})</div>
              </div>
            )}
          </div>
        </div>

        {/* Hand Position Visualizer */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 p-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 text-center">
              Hand Position Guide
            </h4>
            
            {isRawDataMode && accelerometerData ? (
              <div className="space-y-4">
                {/* Tilt Visualizer Box */}
                <div className="relative bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600" style={{ width: '200px', height: '200px', margin: '0 auto' }}>
                  {/* Grid lines */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600" />
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 dark:bg-gray-600" />
                  </div>
                  
                  {/* Center label */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-gray-400">
                    Center
                  </div>
                  
                  {/* Direction labels */}
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400">Up</div>
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400">Down</div>
                  <div className="absolute left-1 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">Left</div>
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">Right</div>
                  
                  {/* Hand position/direction indicator */}
                  {(() => {
                    const toDegrees = (rad: number) => (rad * 180) / Math.PI;
                    const pitchDeg = toDegrees(accelerometerData.rotateX);
                    const rollDeg = toDegrees(accelerometerData.rotateY);
                    
                    if (drawingMode === 'blackboard') {
                      // Show movement vectors
                      const gX = accelerometerData.gX;
                      const gY = accelerometerData.gY;
                      const magnitude = Math.sqrt(gX * gX + gY * gY);
                      
                      // Scale for visibility
                      const arrowLength = Math.min(80, magnitude * 200);
                      const angle = Math.atan2(-gY, gX) * 180 / Math.PI;
                      
                      return (
                        <div className="absolute inset-0 flex items-center justify-center">
                          {arrowLength > 5 && (
                            <div 
                              className="bg-green-500 rounded-full shadow-lg transition-all duration-100"
                              style={{ 
                                width: `${arrowLength}px`,
                                height: '4px',
                                transform: `rotate(${angle}deg)`,
                                boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)'
                              }}
                            >
                              <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-8 border-l-green-500 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
                            </div>
                          )}
                          {arrowLength <= 5 && (
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                          )}
                        </div>
                      );
                    } else if (drawingMode === '1d') {
                      // Show direction arrow
                      const angle = Math.atan2(pitchDeg, rollDeg);
                      const angleDeg = (angle * 180 / Math.PI);
                      
                      return (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div 
                            className="w-16 h-1 bg-red-500 rounded-full shadow-lg transition-all duration-100"
                            style={{ 
                              transform: `rotate(${angleDeg}deg)`,
                              boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                            }}
                          >
                            <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-8 border-l-red-500 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
                          </div>
                        </div>
                      );
                    } else {
                      // Show position dot
                      const angleRange = 45;
                      const normPitch = Math.max(-1, Math.min(1, pitchDeg / angleRange));
                      const normRoll = Math.max(-1, Math.min(1, rollDeg / angleRange));
                      
                      const visualX = 100 + (normRoll * 90);
                      const visualY = 100 + (normPitch * 90);
                      
                      return (
                        <div 
                          className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100"
                          style={{ 
                            left: `${visualX}px`, 
                            top: `${visualY}px`,
                            boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                          }}
                        />
                      );
                    }
                  })()}
                </div>
                
                {/* Angle Readings */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">Pitch (Up/Down):</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
                      {((accelerometerData.rotateX * 180) / Math.PI).toFixed(1)}°
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">Roll (Left/Right):</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
                      {((accelerometerData.rotateY * 180) / Math.PI).toFixed(1)}°
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">G-Force:</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
                      {Math.sqrt(accelerometerData.gX ** 2 + accelerometerData.gY ** 2 + accelerometerData.gZ ** 2).toFixed(2)}g
                    </span>
                  </div>
                </div>
                
                {/* Instructions */}
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-900 dark:text-blue-100">
                  {drawingMode === 'blackboard' ? (
                    <>
                      <strong>Green arrow shows movement</strong>
                      <ul className="mt-1 space-y-1 ml-2">
                        <li>• Imagine whiteboard in front of you</li>
                        <li>• Move hand right = cursor right</li>
                        <li>• Move hand up = cursor up</li>
                        <li>• Like pointing at a real board!</li>
                      </ul>
                    </>
                  ) : drawingMode === '1d' ? (
                    <>
                      <strong>Red arrow shows direction</strong>
                      <ul className="mt-1 space-y-1 ml-2">
                        <li>• Arrow points where line will extend</li>
                        <li>• Tilt hand to change direction</li>
                        <li>• Line draws automatically while active</li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <strong>Red dot shows hand position</strong>
                      <ul className="mt-1 space-y-1 ml-2">
                        <li>• Center = hand flat</li>
                        <li>• Dot position = cursor position</li>
                        <li>• Tilt to move cursor</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
                Start Raw Data Mode to see hand position
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips & Practice Exercises */}
      <div className="mt-4 space-y-3">
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <h5 className="text-xs font-semibold text-green-900 dark:text-green-100 mb-2">
            ✅ Recommended Settings for Beginners:
          </h5>
          <div className="text-xs text-green-800 dark:text-green-200 space-y-1">
            <div>• <strong>Sensitivity:</strong> 15-25 (slow, precise movements)</div>
            <div>• <strong>Smoothing:</strong> 80-90% (reduces hand shake)</div>
            <div>• <strong>Pen Width:</strong> 5-8px (easier to see)</div>
            <div>• <strong>Gesture:</strong> Simple distinct pose like "fist" or "open palm"</div>
          </div>
        </div>

        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
          <h5 className="text-xs font-semibold text-purple-900 dark:text-purple-100 mb-2">
            🎯 Practice Exercises:
          </h5>
          <div className="text-xs text-purple-800 dark:text-purple-200 space-y-1">
            <div><strong>Level 1:</strong> Draw horizontal and vertical lines</div>
            <div><strong>Level 2:</strong> Draw circles and squares</div>
            <div><strong>Level 3:</strong> Write simple letters (L, T, O, I)</div>
            <div><strong>Level 4:</strong> Draw your signature</div>
            <div><strong>Level 5:</strong> Draw complex shapes or doodles</div>
          </div>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h5 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">
            💡 Troubleshooting:
          </h5>
          <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
            <li>• <strong>Cursor too fast?</strong> Lower sensitivity (10-20)</li>
            <li>• <strong>Lines too shaky?</strong> Increase smoothing (80-100%)</li>
            <li>• <strong>Can't control direction?</strong> Rest your elbow on desk</li>
            <li>• <strong>Gesture not triggering?</strong> Hold the pose longer and clearer</li>
            <li>• <strong>Wrong direction?</strong> Check the tilt guide above - pitch = up/down</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
