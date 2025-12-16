# Gesture Drawing Guide

## Overview

The Gesture Drawing feature transforms your Colmi Ring into an air-drawing device, allowing you to create artwork by moving your hand in 3D space. Using the ring's accelerometer data, you can draw on a virtual canvas with three different intuitive modes.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Drawing Modes](#drawing-modes)
- [Setup Instructions](#setup-instructions)
- [Drawing Techniques](#drawing-techniques)
- [Settings & Configuration](#settings--configuration)
- [Troubleshooting](#troubleshooting)
- [Tips for Best Results](#tips-for-best-results)
- [Technical Details](#technical-details)

---

## Quick Start

### Prerequisites
1. Connected Colmi R02/R09 Ring
2. At least one trained gesture in the Gestures tab
3. Start Raw Data Mode for real-time accelerometer streaming

### 5-Second Start
1. Navigate to **Drawing** tab
2. Select a trained gesture from dropdown
3. Click **Start Raw Data Mode**
4. Perform your gesture to **START** drawing
5. Move your hand to draw
6. Perform gesture again to **STOP** drawing

---

## Drawing Modes

The Drawing Canvas offers three distinct modes, each optimized for different drawing styles:

### 🖊️ Blackboard Mode (Default - Most Intuitive)

**Concept:** Draw as if pointing at a whiteboard in front of you

**How It Works:**
- Uses G-force data (gX, gY) to detect physical hand movement
- Movement in space = movement on canvas
- Just like pointing at a real board!

**Controls:**
- Move hand **RIGHT** → Cursor moves RIGHT
- Move hand **LEFT** → Cursor moves LEFT
- Move hand **UP** → Cursor moves UP
- Move hand **DOWN** → Cursor moves DOWN

**Best For:**
- Natural, intuitive drawing
- Freehand sketches
- Beginners
- General purpose drawing

**Visual Indicator:**
- Green arrow showing movement direction and intensity
- Arrow length = speed of movement

**Settings:**
- Movement Sensitivity: 50-300 (adjusts how much movement affects cursor)

---

### ✨ 1D Direction Mode

**Concept:** Steer a continuously extending line

**How It Works:**
- Tilt your hand to control the direction
- Line extends automatically while drawing
- Like steering a pen that draws continuously

**Controls:**
- Tilt **RIGHT** → Line extends right
- Tilt **LEFT** → Line extends left
- Tilt **FORWARD** → Line extends up
- Tilt **BACKWARD** → Line extends down
- Tilt **DIAGONALLY** → Line extends diagonally

**Best For:**
- Flowing, continuous lines
- Abstract art
- Calligraphy-style drawings
- Spiral patterns

**Visual Indicator:**
- Red arrow pointing in the direction line will extend

**Settings:**
- Line Speed: 1-10 pixels/frame (how fast line extends)

---

### 🎯 2D Position Mode (Advanced)

**Concept:** Direct mapping of hand tilt to cursor position

**How It Works:**
- Hand angle directly controls cursor position on canvas
- Hold hand flat (0°) = cursor at center
- Tilt in any direction = cursor moves to that area
- Like a joystick controller

**Controls:**
- Tilt angle = cursor position
- -45° to +45° tilt maps to full canvas range
- Hold position = cursor stays there

**Best For:**
- Precise positioning
- Geometric shapes
- Detailed work requiring exact placement
- Advanced users

**Visual Indicator:**
- Red dot showing exact cursor position relative to tilt

**Settings:**
- Position Sensitivity: 10-200 (how responsive cursor is to tilt)
- Smoothing: 10-100% (reduces jitter in lines)

---

## Setup Instructions

### Step 1: Train a Gesture

Before drawing, you need at least one gesture:

1. Go to **Gestures** tab
2. Click **Start Raw Data Mode**
3. Hold a distinct hand position (e.g., closed fist, peace sign)
4. Click **Start Recording**
5. Hold the position steady for 2-3 seconds
6. Click **Stop Recording**
7. Name your gesture (e.g., "fist", "pinch", "peace")
8. Click **Save Gesture**

**Recommended Gestures:**
- **Closed Fist** - Easy to hold, distinct
- **Peace Sign** - Clear position
- **Open Palm** - Simple and comfortable
- **Pointing Finger** - Natural for "drawing" concept

### Step 2: Select Drawing Mode

Choose the mode that fits your drawing style:
- **Blackboard** - Most natural, recommended for beginners
- **1D Direction** - For flowing, continuous lines
- **2D Position** - For precise control

### Step 3: Configure Settings

**Blackboard Mode:**
- Start with Movement Sensitivity: 150
- Adjust up if movements too small
- Adjust down if too sensitive

**1D Direction Mode:**
- Start with Line Speed: 3
- Smoothing: 70%

**2D Position Mode:**
- Start with Position Sensitivity: 25
- Smoothing: 80-90%

### Step 4: Start Drawing

1. Select your trained gesture from dropdown
2. Click **Start Raw Data Mode**
3. Observe the visualizer (right panel) - you should see movement
4. Perform your gesture to **activate drawing**
5. Move your hand and watch the cursor/line
6. Perform gesture again to **stop drawing**
7. Repeat to create multiple strokes

---

## Drawing Techniques

### Blackboard Mode Techniques

**Basic Lines:**
1. Activate drawing (perform gesture)
2. Move hand smoothly in desired direction
3. Keep movements deliberate and controlled
4. Stop drawing (perform gesture again)

**Curves:**
- Use smooth, continuous hand motions
- Imagine tracing the curve on an invisible board
- Higher sensitivity = larger curves

**Shapes:**
- Break into multiple strokes
- Draw one side, stop, reposition, continue
- Use the visualizer to plan next stroke

**Best Practices:**
- Rest your elbow on desk for stability
- Make deliberate movements
- Use the green arrow as feedback
- Start with small, simple shapes

---

### 1D Direction Mode Techniques

**Spirals:**
1. Activate drawing
2. Slowly rotate your hand
3. Line will spiral as direction changes
4. Adjust line speed for tighter/looser spirals

**Waves:**
1. Activate drawing
2. Alternate tilting left and right rhythmically
3. Creates wave pattern

**Radiating Lines:**
1. Draw short strokes in different directions
2. Stop and restart between each line
3. Creates starburst effect

---

### 2D Position Mode Techniques

**Geometric Shapes:**
1. Hold hand at position for corner 1
2. Activate drawing
3. Smoothly tilt to corner 2
4. Continue to corner 3, 4, etc.
5. Stop drawing

**Precise Positioning:**
- Use low sensitivity (15-25)
- High smoothing (80-90%)
- Watch the red dot in visualizer
- Small tilts = small movements

---

## Settings & Configuration

### Canvas Settings

**Fixed Size:** 600x600 pixels
- Consistent drawing area
- No stretching or resizing
- Center guidelines for reference

**Pen Settings:**
- **Color:** Choose from presets or custom color picker
- **Width:** 1-20 pixels
- **Presets:** Black, Red, Green, Blue, Yellow, Magenta

### Mode-Specific Settings

| Setting | Blackboard | 1D Direction | 2D Position |
|---------|-----------|--------------|-------------|
| Primary Control | Movement Sensitivity (50-300) | Line Speed (1-10) | Position Sensitivity (10-200) |
| Secondary Control | - | - | Smoothing (10-100%) |
| Recommended Start | 150 | Speed: 3 | Sensitivity: 25, Smoothing: 85% |

### Gesture Settings

**Confidence Threshold:** 80% (matches Gesture Trainer)
**Cooldown:** 1 second between gesture detections
**Detection:** Continuous when in Raw Data Mode

---

## Troubleshooting

### Issue: Gesture Not Triggering

**Symptoms:** Drawing doesn't start/stop when performing gesture

**Solutions:**
1. Re-train the gesture with more samples
2. Hold the gesture position more clearly
3. Check that gesture appears in dropdown
4. Ensure confidence is reaching 80%+
5. Wait for cooldown period (1 second) between triggers

---

### Issue: Cursor Not Moving (Blackboard Mode)

**Symptoms:** Green arrow appears but cursor doesn't move

**Solutions:**
1. Make larger, more deliberate movements
2. Increase Movement Sensitivity (try 200-250)
3. Ensure you're in drawing mode (gesture activated)
4. Check that Raw Data Mode is active
5. Verify accelerometer data updating in stats overlay

---

### Issue: Lines Too Shaky

**Symptoms:** Drawings have jitter or unwanted noise

**Solutions:**
- Increase Smoothing to 80-100% (2D mode)
- Rest your elbow on a stable surface
- Make slower, more controlled movements
- Lower sensitivity to reduce small movements
- Use Blackboard mode instead of 2D Position

---

### Issue: Cursor Moves Too Fast/Slow

**Solutions:**

**Too Fast:**
- Lower sensitivity/movement settings
- Make smaller hand movements
- Increase smoothing (2D mode)

**Too Slow:**
- Increase sensitivity/movement settings
- Make larger hand movements
- Check that you're moving hand, not just tilting

---

### Issue: Wrong Direction (Blackboard Mode)

**Symptoms:** Moving hand right makes cursor go left, etc.

**Note:** This is currently by design based on accelerometer orientation

**Workaround:**
- Adjust your mental model (practice adapts quickly)
- Watch the green arrow for feedback
- Switch to 1D or 2D mode if needed

---

## Tips for Best Results

### General Tips

1. **Start Simple:** Draw basic shapes first (lines, circles, squares)
2. **Use Visualizer:** Watch the hand position guide constantly
3. **Practice Gestures:** Make them clear and distinct
4. **Rest Your Arm:** Stabilize elbow on desk for better control
5. **Small Movements:** Especially in Blackboard mode
6. **Be Patient:** Air drawing takes practice!

### Mode-Specific Tips

**Blackboard Mode:**
- Imagine an actual whiteboard 1-2 feet in front of you
- Point with your index finger mentally
- Make deliberate, visible movements
- Start with sensitivity at 150, adjust from there

**1D Direction Mode:**
- Keep tilts gentle and controlled
- Great for signatures and flowing text
- Try lower line speeds (2-3) for control
- Perfect for abstract/decorative patterns

**2D Position Mode:**
- Use for geometric shapes requiring precision
- Low sensitivity + high smoothing = maximum control
- Watch red dot closely in visualizer
- Best when hand is stabilized

### Practice Exercises

**Level 1 (Beginner):**
- Draw horizontal lines (left to right)
- Draw vertical lines (up and down)
- Draw diagonal lines
- Draw simple circles

**Level 2 (Intermediate):**
- Draw squares
- Draw triangles
- Draw your initials
- Draw simple smiley face

**Level 3 (Advanced):**
- Draw your signature
- Draw complex shapes
- Draw recognizable objects
- Create artistic patterns

---

## Technical Details

### Data Flow

```
Ring Accelerometer (100Hz)
    ↓
Web Bluetooth API
    ↓
Accelerometer Data Parsing
    ↓
Mode-Specific Processing
    ↓
Cursor Position Calculation
    ↓
Canvas Drawing (if gesture active)
```

### Blackboard Mode Algorithm

```typescript
// Use G-force to detect physical movement
const gX = accelerometerData.gX; // Left/Right movement
const gY = accelerometerData.gY; // Forward/Back movement

// Map to cursor movement
const moveX = gX * sensitivity;
const moveY = -gY * sensitivity; // Inverted Y

// Apply to current position
cursorX = clamp(currentX + moveX, 0, canvasWidth);
cursorY = clamp(currentY + moveY, 0, canvasHeight);
```

### 1D Direction Mode Algorithm

```typescript
// Calculate direction from tilt angles
const angle = Math.atan2(pitchDeg, rollDeg);

// Move cursor in that direction
const moveX = Math.cos(angle) * lineSpeed;
const moveY = Math.sin(angle) * lineSpeed;

cursorX += moveX;
cursorY += moveY;
```

### 2D Position Mode Algorithm

```typescript
// Direct angle-to-position mapping
const angleRange = 45; // degrees

// Normalize tilt to -1 to +1
const normalizedPitch = clamp(pitchDeg / angleRange, -1, 1);
const normalizedRoll = clamp(rollDeg / angleRange, -1, 1);

// Map to canvas coordinates
const targetX = (canvasWidth / 2) + (normalizedRoll * canvasWidth / 2) * (sensitivity / 50);
const targetY = (canvasHeight / 2) + (normalizedPitch * canvasHeight / 2) * (sensitivity / 50);

// Apply smoothing
cursorX += (targetX - cursorX) * smoothingFactor;
cursorY += (targetY - cursorY) * smoothingFactor;
```

### Gesture Detection

Uses same algorithm as Gesture Trainer:
- Euclidean distance calculation between current angles and saved gesture averages
- Confidence threshold: 80%
- Cooldown period: 1000ms
- Toggle behavior: gesture activates/deactivates drawing

### Canvas Details

- **Size:** Fixed 600x600 pixels
- **Format:** HTML5 Canvas
- **Export:** PNG format via canvas.toDataURL()
- **Strokes:** Stored as arrays of {x, y} points
- **Undo:** Removes last complete stroke
- **Clear:** Removes all strokes (confirmation required)

### Accelerometer Data Used

| Mode | Primary Data | Secondary Data |
|------|-------------|----------------|
| Blackboard | gX, gY (G-forces) | rotateX, rotateY (for visualizer) |
| 1D Direction | rotateX, rotateY (tilt angles) | - |
| 2D Position | rotateX, rotateY (tilt angles) | gX, gY, gZ (for smoothing) |

### Performance

- **Update Rate:** ~100Hz (accelerometer sampling rate)
- **Rendering:** RequestAnimationFrame (~60fps)
- **Latency:** <50ms from hand movement to screen
- **Canvas Updates:** Incremental (only redraws on change)

---

## Future Enhancements

Potential features for future development:

- **Calibration:** Custom orientation calibration
- **Recording:** Save drawing sessions as video
- **Playback:** Replay drawing process
- **Layers:** Multiple drawing layers
- **Eraser Mode:** Dedicated eraser gesture
- **Color Palette:** Quick-switch between colors
- **Templates:** Grid/guide overlays
- **Multi-User:** Collaborative drawing
- **3D Drawing:** True 3D space utilization
- **Export Formats:** SVG, JSON paths

---

## Credits

The Gesture Drawing feature leverages:
- Colmi Ring R02/R09 accelerometer hardware
- Web Bluetooth API for real-time data streaming
- HTML5 Canvas for rendering
- React 19 for UI components
- Custom gesture recognition algorithm

---

## Support & Feedback

For issues, suggestions, or questions about the Gesture Drawing feature:

1. Check this guide thoroughly
2. Review the [Gesture Trainer Guide](./GESTURE_TRAINER_GUIDE.md)
3. See [Accelerometer Implementation](../ACCELEROMETER_IMPLEMENTATION.md)
4. Open an issue on the project repository

---

**Happy Drawing! 🎨✨**

*Remember: Air drawing is a skill - practice makes perfect!*
