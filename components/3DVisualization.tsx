/**
 * 3DVisualization Component
 * 
 * Real-time 3D visualization of ring accelerometer data.
 * Shows a rotating cube that responds to ring movement.
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Play, Square, RotateCcw, Info } from 'lucide-react';
import { GlassCard, AnimatedButton, StatusIndicator } from './glass';

interface ThreeDVisualizationProps {
  isConnected: boolean;
  isRawDataMode: boolean;
  accelerometerData: any;
  onStartRawData: () => void;
  onStopRawData: () => void;
}

export function ThreeDVisualization({
  isConnected,
  isRawDataMode,
  accelerometerData,
  onStartRawData,
  onStopRawData,
}: ThreeDVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [calibration, setCalibration] = useState({ x: 0, y: 0, z: 0 });
  const [showAxes, setShowAxes] = useState(true);
  const [sensitivity, setSensitivity] = useState(1);
  const [smoothing, setSmoothing] = useState(0.8); // Data stabilization factor (0-1)
  const animationFrameRef = useRef<number | null>(null);
  const previousRotationRef = useRef({ x: 0, y: 0, z: 0 });

  // Update rotation based on accelerometer data with smoothing/stabilization
  useEffect(() => {
    if (accelerometerData) {
      const { rotateX, rotateY, rotateZ } = accelerometerData;
      
      // Apply calibration and sensitivity
      const targetRotation = {
        x: (rotateX - calibration.x) * sensitivity,
        y: (rotateY - calibration.y) * sensitivity,
        z: (rotateZ - calibration.z) * sensitivity,
      };
      
      // Apply exponential smoothing for data stabilization
      // Higher smoothing value = more stable but less responsive
      const smoothedRotation = {
        x: previousRotationRef.current.x * smoothing + targetRotation.x * (1 - smoothing),
        y: previousRotationRef.current.y * smoothing + targetRotation.y * (1 - smoothing),
        z: previousRotationRef.current.z * smoothing + targetRotation.z * (1 - smoothing),
      };
      
      previousRotationRef.current = smoothedRotation;
      setRotation(smoothedRotation);
    }
  }, [accelerometerData, calibration, sensitivity, smoothing]);

  // Calibrate to current position
  const handleCalibrate = () => {
    if (accelerometerData) {
      setCalibration({
        x: accelerometerData.rotateX,
        y: accelerometerData.rotateY,
        z: accelerometerData.rotateZ,
      });
    }
  };

  // Reset calibration
  const handleReset = () => {
    setCalibration({ x: 0, y: 0, z: 0 });
    setRotation({ x: 0, y: 0, z: 0 });
  };

  // Draw 3D cube
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const size = 80;

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw background grid
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // Define cube vertices
      const vertices = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], // Back face
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],     // Front face
      ];

      // Apply rotation transformations
      const rotatedVertices = vertices.map(([x, y, z]) => {
        // Rotate around X axis
        let y1 = y * Math.cos(rotation.x) - z * Math.sin(rotation.x);
        let z1 = y * Math.sin(rotation.x) + z * Math.cos(rotation.x);
        
        // Rotate around Y axis
        let x2 = x * Math.cos(rotation.y) + z1 * Math.sin(rotation.y);
        let z2 = -x * Math.sin(rotation.y) + z1 * Math.cos(rotation.y);
        
        // Rotate around Z axis
        let x3 = x2 * Math.cos(rotation.z) - y1 * Math.sin(rotation.z);
        let y3 = x2 * Math.sin(rotation.z) + y1 * Math.cos(rotation.z);
        
        return [x3, y3, z2];
      });

      // Project to 2D
      const projected = rotatedVertices.map(([x, y, z]) => {
        const scale = 200 / (200 + z * 50);
        return [
          centerX + x * size * scale,
          centerY + y * size * scale,
          z,
        ];
      });

      // Draw cube faces with depth sorting
      const faces = [
        [0, 1, 2, 3], // Back
        [4, 5, 6, 7], // Front
        [0, 1, 5, 4], // Bottom
        [2, 3, 7, 6], // Top
        [0, 3, 7, 4], // Left
        [1, 2, 6, 5], // Right
      ];

      const faceColors = [
        'rgba(239, 68, 68, 0.7)',   // Red - Back
        'rgba(59, 130, 246, 0.7)',  // Blue - Front
        'rgba(34, 197, 94, 0.7)',   // Green - Bottom
        'rgba(234, 179, 8, 0.7)',   // Yellow - Top
        'rgba(168, 85, 247, 0.7)',  // Purple - Left
        'rgba(236, 72, 153, 0.7)',  // Pink - Right
      ];

      // Calculate face depths for sorting
      const facesWithDepth = faces.map((face, index) => {
        const avgZ = face.reduce((sum, i) => sum + projected[i][2], 0) / face.length;
        return { face, color: faceColors[index], depth: avgZ };
      });

      // Sort faces by depth (back to front)
      facesWithDepth.sort((a, b) => a.depth - b.depth);

      // Draw faces
      facesWithDepth.forEach(({ face, color }) => {
        ctx.fillStyle = color;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(projected[face[0]][0], projected[face[0]][1]);
        for (let i = 1; i < face.length; i++) {
          ctx.lineTo(projected[face[i]][0], projected[face[i]][1]);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      // Draw axes if enabled
      if (showAxes) {
        const axisLength = 100;
        
        // X axis (Red)
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + axisLength, centerY);
        ctx.stroke();
        ctx.fillStyle = 'rgba(239, 68, 68, 1)';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('X', centerX + axisLength + 10, centerY + 5);
        
        // Y axis (Green)
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX, centerY - axisLength);
        ctx.stroke();
        ctx.fillStyle = 'rgba(34, 197, 94, 1)';
        ctx.fillText('Y', centerX + 5, centerY - axisLength - 10);
        
        // Z axis (Blue)
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX - 70, centerY + 70);
        ctx.stroke();
        ctx.fillStyle = 'rgba(59, 130, 246, 1)';
        ctx.fillText('Z', centerX - 80, centerY + 85);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [rotation, showAxes]);

  return (
    <div className="space-y-6">
      {/* Main Visualization Card */}
      <GlassCard glow="blue" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                3D Accelerometer Visualization
              </h2>
              <p className="text-sm text-gray-600">
                Real-time ring orientation (Right index finger)
              </p>
            </div>
          </div>
          
          <StatusIndicator
            status={isRawDataMode ? 'active' : 'neutral'}
            label={isRawDataMode ? 'Active' : 'Stopped'}
            pulse={isRawDataMode}
          />
        </div>

        {/* Canvas */}
        <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 mb-6">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full h-auto rounded-lg"
          />
          
          {!isRawDataMode && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Start raw data mode to see visualization</p>
                <AnimatedButton
                  variant="primary"
                  onClick={onStartRawData}
                  disabled={!isConnected}
                  hoverEffect="lift"
                  shadowColor="blue"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Visualization
                </AnimatedButton>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sensitivity: {sensitivity.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="flex items-end gap-2">
            <AnimatedButton
              variant="secondary"
              size="sm"
              onClick={handleCalibrate}
              disabled={!isRawDataMode}
              hoverEffect="lift"
              shadowColor="emerald"
              className="flex-1"
            >
              Calibrate Position
            </AnimatedButton>
            
            <AnimatedButton
              variant="secondary"
              size="sm"
              onClick={handleReset}
              hoverEffect="lift"
              shadowColor="amber"
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </AnimatedButton>
          </div>
        </div>

        {/* Toggle Options */}
        <div className="flex items-center gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showAxes}
              onChange={(e) => setShowAxes(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show Axes</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!isRawDataMode ? (
            <AnimatedButton
              variant="primary"
              onClick={onStartRawData}
              disabled={!isConnected}
              hoverEffect="lift"
              shadowColor="blue"
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Raw Data Mode
            </AnimatedButton>
          ) : (
            <AnimatedButton
              variant="secondary"
              onClick={onStopRawData}
              disabled={!isConnected}
              hoverEffect="lift"
              shadowColor="red"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white border-red-500/20"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Raw Data Mode
            </AnimatedButton>
          )}
        </div>
      </GlassCard>

      {/* Real-time Data Card */}
      {accelerometerData && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Real-time Sensor Data
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Rotation */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl">
              <div className="text-xs uppercase tracking-wide text-red-600 mb-1">Rotation X</div>
              <div className="text-2xl font-bold text-red-700">
                {(rotation.x * (180 / Math.PI)).toFixed(1)}°
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
              <div className="text-xs uppercase tracking-wide text-green-600 mb-1">Rotation Y</div>
              <div className="text-2xl font-bold text-green-700">
                {(rotation.y * (180 / Math.PI)).toFixed(1)}°
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <div className="text-xs uppercase tracking-wide text-blue-600 mb-1">Rotation Z</div>
              <div className="text-2xl font-bold text-blue-700">
                {(rotation.z * (180 / Math.PI)).toFixed(1)}°
              </div>
            </div>

            {/* G-Force */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
              <div className="text-xs uppercase tracking-wide text-purple-600 mb-1">G-Force X</div>
              <div className="text-2xl font-bold text-purple-700">
                {accelerometerData.gX.toFixed(2)}g
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl">
              <div className="text-xs uppercase tracking-wide text-pink-600 mb-1">G-Force Y</div>
              <div className="text-2xl font-bold text-pink-700">
                {accelerometerData.gY.toFixed(2)}g
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl">
              <div className="text-xs uppercase tracking-wide text-indigo-600 mb-1">G-Force Z</div>
              <div className="text-2xl font-bold text-indigo-700">
                {accelerometerData.gZ.toFixed(2)}g
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Info Card */}
      <GlassCard className="p-6 bg-blue-50/50 border-blue-200/30">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-2">Ring Placement: Right Index Finger</p>
            <ul className="space-y-1 text-blue-700">
              <li>• <strong>X-axis (Red):</strong> Finger bending/extension</li>
              <li>• <strong>Y-axis (Green):</strong> Hand rotation (palm up/down)</li>
              <li>• <strong>Z-axis (Blue):</strong> Finger side-to-side movement</li>
              <li>• Use <strong>Calibrate</strong> to set the current position as neutral</li>
              <li>• Adjust <strong>Sensitivity</strong> to control rotation speed</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}