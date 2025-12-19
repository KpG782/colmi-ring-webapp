/**
 * AccelerometerVisualizer Component
 * 
 * 3D visualization of accelerometer data with real-time rotation and movement.
 * Helps understand ring orientation and movement patterns.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GlassCard, AnimatedButton, StatusIndicator, MetricDisplay } from './glass';
import { Cube, RotateCw, Hand, Info } from 'lucide-react';

interface AccelerometerVisualizerProps {
  isConnected: boolean;
  isRawDataMode: boolean;
  accelerometerData: any;
  onStartRawData: () => void;
  onStopRawData: () => void;
}

export function AccelerometerVisualizer({
  isConnected,
  isRawDataMode,
  accelerometerData,
  onStartRawData,
  onStopRawData,
}: AccelerometerVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 });
  const [orientation, setOrientation] = useState('Unknown');
  const [movement, setMovement] = useState('Still');

  // Process accelerometer data
  useEffect(() => {
    if (!accelerometerData) return;

    const { gX, gY, gZ, rotateX, rotateY, rotateZ } = accelerometerData;

    // Update rotation (convert radians to degrees)
    setRotation({
      x: (rotateX * 180) / Math.PI,
      y: (rotateY * 180) / Math.PI,
      z: (rotateZ * 180) / Math.PI,
    });

    // Update acceleration
    setAcceleration({
      x: gX,
      y: gY,
      z: gZ,
    });

    // Determine orientation based on gravity
    // Right hand index finger orientation adjustments
    determineOrientation(gX, gY, gZ);
    
    // Determine movement intensity
    const totalAccel = Math.sqrt(gX * gX + gY * gY + gZ * gZ);
    if (totalAccel < 0.5) {
      setMovement('Still');
    } else if (totalAccel < 1.5) {
      setMovement('Gentle');
    } else if (totalAccel < 2.5) {
      setMovement('Moderate');
    } else {
      setMovement('Vigorous');
    }
  }, [accelerometerData]);

  // Determine ring orientation (adjusted for right hand index finger)
  const determineOrientation = (gX: number, gY: number, gZ: number) => {
    const threshold = 0.7;
    
    // Right hand index finger specific orientations
    if (Math.abs(gZ) > threshold) {
      if (gZ > 0) {
        setOrientation('Palm Down (Natural)');
      } else {
        setOrientation('Palm Up (Inverted)');
      }
    } else if (Math.abs(gY) > threshold) {
      if (gY > 0) {
        setOrientation('Finger Pointing Up');
      } else {
        setOrientation('Finger Pointing Down');
      }
    } else if (Math.abs(gX) > threshold) {
      if (gX > 0) {
        setOrientation('Hand Tilted Right');
      } else {
        setOrientation('Hand Tilted Left');
      }
    } else {
      setOrientation('Neutral Position');
    }
  };

  // Draw 3D cube on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = 80;

    // Convert rotation to radians
    const rotX = (rotation.x * Math.PI) / 180;
    const rotY = (rotation.y * Math.PI) / 180;
    const rotZ = (rotation.z * Math.PI) / 180;

    // Define cube vertices
    const vertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], // Back face
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],     // Front face
    ];

    // Rotate and project vertices
    const projectedVertices = vertices.map(([x, y, z]) => {
      // Apply rotations
      // Rotate around X axis
      let y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
      let z1 = y * Math.sin(rotX) + z * Math.cos(rotX);
      
      // Rotate around Y axis
      let x1 = x * Math.cos(rotY) + z1 * Math.sin(rotY);
      let z2 = -x * Math.sin(rotY) + z1 * Math.cos(rotY);
      
      // Rotate around Z axis
      let x2 = x1 * Math.cos(rotZ) - y1 * Math.sin(rotZ);
      let y2 = x1 * Math.sin(rotZ) + y1 * Math.cos(rotZ);

      // Project to 2D (simple perspective)
      const scale = 200 / (200 + z2 * 50);
      return {
        x: centerX + x2 * size * scale,
        y: centerY + y2 * size * scale,
        z: z2,
      };
    });

    // Define cube edges
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Back face
      [4, 5], [5, 6], [6, 7], [7, 4], // Front face
      [0, 4], [1, 5], [2, 6], [3, 7], // Connecting edges
    ];

    // Draw edges with depth-based coloring
    edges.forEach(([start, end]) => {
      const startVertex = projectedVertices[start];
      const endVertex = projectedVertices[end];
      
      // Calculate average depth for color
      const avgDepth = (startVertex.z + endVertex.z) / 2;
      const brightness = Math.floor(150 + avgDepth * 50);
      
      ctx.strokeStyle = `rgb(${brightness}, ${brightness}, 255)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startVertex.x, startVertex.y);
      ctx.lineTo(endVertex.x, endVertex.y);
      ctx.stroke();
    });

    // Draw vertices
    projectedVertices.forEach((vertex) => {
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw axes indicators
    drawAxes(ctx, centerX, centerY, size, rotX, rotY, rotZ);
  }, [rotation]);

  // Draw coordinate axes
  const drawAxes = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    size: number,
    rotX: number,
    rotY: number,
    rotZ: number
  ) => {
    const axisLength = size * 1.5;
    
    // X axis (Red)
    drawAxis(ctx, centerX, centerY, axisLength, 0, 0, rotX, rotY, rotZ, '#ef4444', 'X');
    
    // Y axis (Green)
    drawAxis(ctx, centerX, centerY, 0, axisLength, 0, rotX, rotY, rotZ, '#10b981', 'Y');
    
    // Z axis (Blue)
    drawAxis(ctx, centerX, centerY, 0, 0, axisLength, rotX, rotY, rotZ, '#3b82f6', 'Z');
  };

  const drawAxis = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    x: number,
    y: number,
    z: number,
    rotX: number,
    rotY: number,
    rotZ: number,
    color: string,
    label: string
  ) => {
    // Apply rotations
    let y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
    let z1 = y * Math.sin(rotX) + z * Math.cos(rotX);
    
    let x1 = x * Math.cos(rotY) + z1 * Math.sin(rotY);
    let z2 = -x * Math.sin(rotY) + z1 * Math.cos(rotY);
    
    let x2 = x1 * Math.cos(rotZ) - y1 * Math.sin(rotZ);
    let y2 = x1 * Math.sin(rotZ) + y1 * Math.cos(rotZ);

    // Draw line
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + x2, centerY + y2);
    ctx.stroke();

    // Draw label
    ctx.fillStyle = color;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(label, centerX + x2 + 10, centerY + y2);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <GlassCard glow="purple">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <Cube className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                3D Accelerometer Visualizer
              </h2>
              <p className="text-sm text-gray-600">
                Real-time visualization of ring movement and orientation
              </p>
            </div>
          </div>
          <StatusIndicator
            status={isRawDataMode ? 'active' : 'neutral'}
            label={isRawDataMode ? 'Streaming' : 'Stopped'}
            pulse={isRawDataMode}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3">
          {!isRawDataMode ? (
            <AnimatedButton
              variant="primary"
              onClick={onStartRawData}
              disabled={!isConnected}
              hoverEffect="lift"
              shadowColor="purple"
              className="flex-1"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Start Visualization
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
              Stop Visualization
            </AnimatedButton>
          )}
        </div>
      </GlassCard>

      {/* 3D Cube Visualization */}
      <GlassCard glow="blue" className="relative overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Cube className="w-5 h-5 text-blue-600" />
          3D Cube Rotation
        </h3>
        
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-4">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="w-full h-auto max-w-md mx-auto"
          />
        </div>

        {/* Rotation Values */}
        <div className="grid grid-cols-3 gap-4">
          <MetricDisplay
            value={rotation.x.toFixed(1)}
            unit="degrees"
            label="X Rotation"
            status="neutral"
            className="text-center"
          />
          <MetricDisplay
            value={rotation.y.toFixed(1)}
            unit="degrees"
            label="Y Rotation"
            status="neutral"
            className="text-center"
          />
          <MetricDisplay
            value={rotation.z.toFixed(1)}
            unit="degrees"
            label="Z Rotation"
            status="neutral"
            className="text-center"
          />
        </div>
      </GlassCard>

      {/* Acceleration & Orientation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Acceleration Values */}
        <GlassCard glow="emerald">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Acceleration (G-Force)
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">X Axis:</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-200"
                    style={{ width: `${Math.abs(acceleration.x) * 25}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900 w-16 text-right">
                  {acceleration.x.toFixed(2)}g
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Y Axis:</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-200"
                    style={{ width: `${Math.abs(acceleration.y) * 25}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900 w-16 text-right">
                  {acceleration.y.toFixed(2)}g
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Z Axis:</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-200"
                    style={{ width: `${Math.abs(acceleration.z) * 25}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900 w-16 text-right">
                  {acceleration.z.toFixed(2)}g
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Orientation & Movement */}
        <GlassCard glow="amber">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Hand className="w-5 h-5 text-amber-600" />
            Right Hand Index Finger
          </h3>
          
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Orientation:</span>
              <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-lg font-bold text-amber-900">{orientation}</p>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-600">Movement:</span>
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-lg font-bold text-blue-900">{movement}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                  Optimized for right hand index finger. The cube rotates in real-time 
                  based on your hand movements. Try different orientations to see how 
                  the visualization responds.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Instructions */}
      {!isRawDataMode && (
        <GlassCard className="bg-purple-50/50 border-purple-200/30">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-purple-900 mb-2">How to Use</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Click "Start Visualization" to begin streaming accelerometer data</li>
                <li>• Wear the ring on your right hand index finger</li>
                <li>• Move your hand to see the cube rotate in real-time</li>
                <li>• The axes show: X (Red), Y (Green), Z (Blue)</li>
                <li>• Watch the orientation and movement indicators update</li>
              </ul>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}