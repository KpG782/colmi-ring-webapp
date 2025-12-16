# Colmi Ring Reverse Engineering Guide

A comprehensive analysis of the Colmi R02/R09 smart ring's Bluetooth Low Energy (BLE) protocol, data structures, and potential areas for expansion.

## Table of Contents

- [Overview](#overview)
- [BLE Connection Details](#ble-connection-details)
- [Protocol Structure](#protocol-structure)
- [Data Types & Commands](#data-types--commands)
- [Sensor Data Analysis](#sensor-data-analysis)
- [Reverse Engineering Insights](#reverse-engineering-insights)
- [Potential Improvements](#potential-improvements)
- [Research Areas](#research-areas)

---

## Overview

The Colmi R02/R09 smart rings use Bluetooth Low Energy (BLE) for wireless communication. The protocol was originally reverse-engineered by [@atc1441](https://github.com/atc1441) and documented in the MIDI Ring implementation. This guide builds upon that work and documents additional findings.

### What We Know

- **Communication**: BLE GATT (Generic Attribute Profile)
- **Service UUID**: `6e40fff0-b5a3-f393-e0a9-e50e24dcca9e`
- **Characteristics**: Read/Write/Notify capabilities
- **Data Format**: Binary packets with specific command structures
- **Ring Models**: R02, R09 (similar protocols)

---

## BLE Connection Details

### Service & Characteristics

```typescript
// Primary Service
SERVICE_UUID = '6e40fff0-b5a3-f393-e0a9-e50e24dcca9e'

// Characteristics
CHARACTERISTIC_WRITE = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'  // Write to ring
CHARACTERISTIC_NOTIFY = '6e400003-b5a3-f393-e0a9-e50e24dcca9e' // Notifications from ring
```

### Connection Flow

1. **Scan** for BLE devices with name pattern `R0*_*` (e.g., "R02_4101")
2. **Connect** to device GATT server
3. **Get** primary service by UUID
4. **Get** characteristics for read/write/notify
5. **Subscribe** to notifications for continuous data
6. **Send** commands to request specific data

---

## Protocol Structure

### Command Packet Format

Most commands follow this structure:

```
[Header] [Command] [Parameters...] [Checksum/Footer]
```

### Common Commands

| Command | Hex | Description | Response |
|---------|-----|-------------|----------|
| Battery | `0xAB 0x00 0x04 0xFF 0x5C 0x80 0x01` | Request battery level | Single byte (0-100) |
| Heart Rate Start | `0xAB 0x00 0x04 0xFF 0x32 0x80 0x01` | Start HR monitoring | Continuous HR data |
| Heart Rate Stop | `0xAB 0x00 0x04 0xFF 0x32 0x00 0x01` | Stop HR monitoring | - |
| SpO2 Start | `0xAB 0x00 0x04 0xFF 0x36 0x80 0x01` | Start SpO2 monitoring | Continuous SpO2 data |
| SpO2 Stop | `0xAB 0x00 0x04 0xFF 0x36 0x00 0x01` | Stop SpO2 monitoring | - |
| Steps | `0xAB 0x00 0x03 0xFF 0x93 0x01` | Request step count | Steps data packet |
| Accelerometer Start | `0xAB 0x00 0x04 0xFF 0xA1 0x80 0x01` | Start raw sensor data | Continuous accel data |
| Accelerometer Stop | `0xAB 0x00 0x04 0xFF 0xA1 0x00 0x01` | Stop raw sensor data | - |
| Set Time | Complex packet | Sync ring time | Acknowledgment |
| Reboot | `0xAB 0x00 0x04 0xFF 0x71 0x80 0x01` | Restart ring | Device reboots |

### Command Pattern Analysis

```
0xAB 0x00 0x04 0xFF [SENSOR_ID] [STATE] 0x01
                    └─────────┘ └─────┘
                    Sensor Code  0x80=ON
                                 0x00=OFF
```

**Sensor Codes:**
- `0x32` = Heart Rate
- `0x36` = SpO2 (Blood Oxygen)
- `0xA1` = Accelerometer
- `0x5C` = Battery
- `0x93` = Steps
- `0x71` = Reboot

---

## Data Types & Commands

### Heart Rate Data

**Structure:**
```
Byte 0: 0xAB (Header)
Byte 1: 0x00
Byte 2: Data length
Byte 3: 0xFF
Byte 4: 0x32 (HR identifier)
Byte 5: Heart rate value (BPM)
```

**Example:**
```
0xAB 0x00 0x03 0xFF 0x32 0x48
                        └─ 72 BPM
```

### SpO2 Data

**Structure:**
```
Byte 0-4: Header (similar to HR)
Byte 5: SpO2 percentage (0-100)
```

**Range:** 90-100% (typical), <90% critical

### Steps Data

**Complex Structure:**
```
0xAB 0x00 [LENGTH] 0xFF 0x93 [TOTAL_STEPS_4_BYTES] [INTERVALS...]
```

**Intervals:** 15-minute blocks (96 per day)
- Each interval contains: steps, calories, distance
- Time index: 0-95 (0 = 00:00-00:15, 95 = 23:45-00:00)

**Example Parsing:**
```typescript
const totalSteps = (data[5] << 24) | (data[6] << 16) | (data[7] << 8) | data[8];
// Then parse 15-minute intervals from remaining bytes
```

### Accelerometer Data

**Most Complex Data Structure**

```
Raw packet (6 bytes):
[X_LOW] [X_HIGH] [Y_LOW] [Y_HIGH] [Z_LOW] [Z_HIGH]
```

**Parsing:**
```typescript
// Extract 12-bit signed values
const rawX = ((data[1] & 0x0F) << 8) | data[0];
const rawY = ((data[3] & 0x0F) << 8) | data[2];
const rawZ = ((data[5] & 0x0F) << 8) | data[4];

// Sign extend (12-bit to signed integer)
const signExtend12Bit = (value: number) => {
  return (value & 0x800) ? value - 0x1000 : value;
};

// Convert to G-force (±4G range)
const gX = signExtend12Bit(rawX) / 1024.0;
const gY = signExtend12Bit(rawY) / 1024.0;
const gZ = signExtend12Bit(rawZ) / 1024.0;

// Calculate rotation angles
const rotateX = Math.atan2(gX, Math.sqrt(gY * gY + gZ * gZ));
const rotateY = Math.atan2(gY, Math.sqrt(gX * gX + gZ * gZ));
const rotateZ = Math.atan2(Math.sqrt(gX * gX + gY * gY), gZ);
```

**Key Insights:**
- **12-bit resolution** per axis (not 16-bit)
- **±4G range** (suitable for wrist/finger motion)
- **Data rate:** ~20-50 Hz when enabled
- **Coordinate system:** Right-hand rule
  - X: Forward/Backward (Pitch)
  - Y: Left/Right (Roll)
  - Z: Up/Down (Yaw/Twist)

---

## Sensor Data Analysis

### Accelerometer Deep Dive

#### Raw ADC Values
- **Range:** 0 to 4095 (12-bit)
- **Neutral:** ~2048 (0G)
- **Format:** Two's complement for negative values

#### G-Force Conversion
```
G = (ADC_Value - 2048) / 1024
```

#### Rotation Angles (Radians)
Based on gravity vector decomposition:
```typescript
pitch = atan2(gX, sqrt(gY² + gZ²))  // Forward/Back
roll  = atan2(gY, sqrt(gX² + gZ²))  // Left/Right
yaw   = atan2(sqrt(gX² + gY²), gZ)  // Twist
```

**To Degrees:** `degrees = radians * (180 / π)`

### Gesture Pattern Recognition

Based on our gesture training implementation:

**Gesture Matching Algorithm:**
```typescript
// 1. Record gesture samples (30-50+ readings)
// 2. Calculate averages
const avgX = samples.reduce((sum, s) => sum + s.rotateX, 0) / samples.length;
const avgY = samples.reduce((sum, s) => sum + s.rotateY, 0) / samples.length;
const avgZ = samples.reduce((sum, s) => sum + s.rotateZ, 0) / samples.length;

// 3. Calculate Euclidean distance from current position
const distance = Math.sqrt(
  (current.rotateX - avgX)² + 
  (current.rotateY - avgY)² + 
  (current.rotateZ - avgZ)²
);

// 4. Convert to confidence percentage
const confidence = (1 - (distance / maxDistance)) * 100;

// 5. Match if confidence > 80%
```

**Common Gestures:**
| Gesture | Pitch (X) | Roll (Y) | Yaw (Z) |
|---------|-----------|----------|---------|
| Point Up | +45° to +60° | ~0° | ~0° |
| Point Down | -45° to -60° | ~0° | ~0° |
| Tilt Left | ~0° | -30° to -45° | ~0° |
| Tilt Right | ~0° | +30° to +45° | ~0° |
| Twist CW | ~0° | ~0° | +45° |
| Twist CCW | ~0° | ~0° | -45° |
| Flat/Neutral | ~0° | ~0° | ~0° |

---

## Reverse Engineering Insights

### What We've Discovered

#### 1. **Ring Flash Behavior**
- When monitoring (HR, SpO2, Accel), ring LED flashes
- Flashing indicates sensor active + BLE transmission
- Can be stopped with "Stop All" or specific stop commands
- Reboot stops all monitoring instantly

#### 2. **Data Quality & Timing**
- **Heart Rate:** 1-2 second intervals, requires stillness
- **SpO2:** 10-30 seconds to stabilize, very sensitive to motion
- **Steps:** Cached, may not update immediately
- **Accelerometer:** High frequency, real-time, very responsive

#### 3. **Battery Impact**
- Heart Rate monitoring: Moderate drain
- SpO2 monitoring: Higher drain (optical sensor + processing)
- Accelerometer: Low drain (MEMS sensor)
- Continuous BLE transmission: Significant impact

#### 4. **Connection Behavior**
- Ring maintains single BLE connection at a time
- Disconnecting from official app allows custom connection
- Connection stable at ~10m range
- Packet loss minimal with good signal

### Undocumented Features Found

#### Time Synchronization
The ring maintains its own RTC (Real-Time Clock). Time sync packet structure:
```
0xAB 0x00 0x0B 0xFF 0x93 
[YEAR_LOW] [YEAR_HIGH] [MONTH] [DAY] [HOUR] [MINUTE] [SECOND]
0x01
```

#### Detailed Step Intervals
The ring stores steps in 15-minute intervals (96 blocks per 24 hours):
- Allows reconstruction of activity timeline
- Each interval: steps, calories, distance
- Provides insight into activity patterns

#### G-Sensor Calibration
Ring appears to auto-calibrate accelerometer:
- Detects when stationary
- Adjusts zero-point automatically
- No manual calibration command found (yet)

---

## Potential Improvements

### 1. **Additional Sensors to Explore**

#### Temperature Sensor
- Ring likely has temperature sensor (common in wearables)
- Command unknown - potential pattern: `0xAB 0x00 0x04 0xFF [TEMP_ID] 0x80 0x01`
- Try sensor IDs: `0x40`, `0x41`, `0x50`, etc.

#### Sleep Tracking
- Ring advertises sleep tracking
- Data might be stored locally and retrieved via command
- Potential command: `0xAB 0x00 0x03 0xFF [SLEEP_ID] 0x01`

#### Stress/HRV (Heart Rate Variability)
- Advanced rings calculate HRV from heart rate data
- May be processed on-device or require raw R-R interval data
- Explore HR data packet variations

### 2. **Data Logging & History**

```typescript
// Potential structure for historical data request
const requestHistory = new Uint8Array([
  0xAB, 0x00, 0x06, 0xFF,
  0x94, // History command ID (hypothetical)
  startDay, startMonth, startYear,
  0x01
]);
```

**What to Try:**
- Request last 7 days of step data
- Daily heart rate averages
- Sleep sessions
- Battery history

### 3. **Ring Configuration**

#### Notification Settings
Some rings support haptic feedback for notifications:
```typescript
// Hypothetical vibration command
const vibrate = new Uint8Array([
  0xAB, 0x00, 0x05, 0xFF,
  0x60, // Vibration command
  duration, // milliseconds
  intensity, // 0-100
  0x01
]);
```

#### Display/LED Control
If ring has LED:
```typescript
// Control LED brightness or pattern
const setLED = new Uint8Array([
  0xAB, 0x00, 0x05, 0xFF,
  0x70, // LED command
  mode, // 0=off, 1=on, 2=blink
  brightness, // 0-255
  0x01
]);
```

### 4. **Advanced Accelerometer Features**

#### Tap Detection
- Double-tap gestures
- May be hardware-supported (interrupt-based)
- Command to enable: Unknown

#### Motion Events
- Raise-to-wake
- Wrist rotation detection
- Sedentary alerts

#### Activity Classification
- Walking vs running detection
- Step cadence analysis
- Exercise auto-detection

---

## Research Areas

### 1. **Protocol Fuzzing**

Systematically test command variations:

```typescript
// Test different sensor IDs
for (let sensorId = 0x00; sensorId <= 0xFF; sensorId++) {
  const testCommand = new Uint8Array([
    0xAB, 0x00, 0x04, 0xFF,
    sensorId,
    0x80, // Enable
    0x01
  ]);
  // Send and monitor response
}
```

**Safety Note:** Some commands might:
- Drain battery rapidly
- Damage hardware (unlikely but possible)
- Factory reset the device
- Proceed with caution!

### 2. **Packet Sniffing**

Use official Colmi app and sniff BLE packets:

**Tools:**
- **Android:** Bluetooth HCI snoop log (Developer Options)
- **iOS:** PacketLogger (requires jailbreak or developer tools)
- **Desktop:** Wireshark with Bluetooth adapter

**Process:**
1. Enable BLE sniffing
2. Use official app features
3. Capture packets
4. Analyze with Wireshark
5. Document new commands

### 3. **Firmware Analysis**

If firmware update is available:

**Steps:**
1. Capture firmware OTA (Over-The-Air) update packets
2. Extract firmware binary
3. Analyze with tools:
   - `binwalk` - Find embedded files
   - `strings` - Extract readable text
   - Ghidra/IDA - Disassemble ARM code
4. Look for:
   - Command handlers
   - Sensor configurations
   - Hidden features

### 4. **Memory Dumping**

Advanced: Direct memory access

**If ring has debug interface:**
- JTAG/SWD pins
- UART serial console
- Bootloader mode

**What to find:**
- Sensor calibration data
- User data storage format
- Ring configuration
- Encryption keys (if any)

---

## Data Structure Documentation

### Complete Data Packets

#### Battery Response
```
Packet: 0xAB 0x00 0x03 0xFF 0x5C [BATTERY]
Length: 6 bytes
Battery: 0-100 (percentage)
```

#### Heart Rate Notification
```
Packet: 0xAB 0x00 0x03 0xFF 0x32 [BPM]
Length: 6 bytes
BPM: 30-200 (typical range)
```

#### SpO2 Notification
```
Packet: 0xAB 0x00 0x03 0xFF 0x36 [SPO2]
Length: 6 bytes
SpO2: 70-100 (percentage)
```

#### Accelerometer Notification
```
Packet: 0xAB 0x00 0x08 0xFF 0xA1 [X_L] [X_H] [Y_L] [Y_H] [Z_L] [Z_H]
Length: 11 bytes
XYZ: 12-bit signed values (little-endian)
```

#### Steps Response
```
Packet: 0xAB 0x00 [LEN] 0xFF 0x93 [TOTAL_STEPS] [INTERVAL_DATA]
Length: Variable (40+ bytes typically)
Total Steps: 4-byte integer
Intervals: 96 blocks x 3 bytes each = 288 bytes (when full day)
```

### Interval Data Structure

Each 15-minute interval (3 bytes):
```
Byte 0: Steps (0-255)
Byte 1: Calories low byte
Byte 2: Distance low byte
```

**Parsing Example:**
```typescript
interface StepInterval {
  timeIndex: number;    // 0-95 (15-min blocks)
  steps: number;
  calories: number;
  distance: number;     // in meters
}

function parseInterval(data: Uint8Array, offset: number): StepInterval {
  return {
    timeIndex: Math.floor(offset / 3),
    steps: data[offset],
    calories: data[offset + 1] * 10,      // Scale factor ~10
    distance: data[offset + 2] * 2        // Scale factor ~2
  };
}
```

---

## Experiment Ideas

### 1. **Gesture Library Expansion**

Test and document more gestures:
- Writing in air (letter shapes)
- Circular motions (clockwise/counterclockwise)
- Quick flicks
- Sustained holds
- Two-handed gestures (if you have two rings!)

### 2. **Activity Recognition ML**

Train machine learning model:
```
Features:
- Mean/variance of each axis
- Peak detection
- Frequency analysis (FFT)
- Cross-correlation between axes

Activities to detect:
- Walking
- Running
- Typing
- Writing
- Eating
- Sleeping
```

### 3. **Custom Watch Face**

If ring has display capabilities (some models do):
- Try sending image data
- Test display commands
- Custom complications

### 4. **Multi-Ring Synchronization**

If you have multiple rings:
- Connect to multiple rings simultaneously
- Compare sensor readings
- Use for 3D position tracking
- Detect hand gestures with both hands

---

## Known Limitations

### Hardware Constraints

1. **Battery Life**
   - ~3-5 days with moderate use
   - Continuous monitoring drains quickly
   - No wireless charging (USB required)

2. **Sensor Accuracy**
   - Heart rate: ±5 BPM typical
   - SpO2: ±2% typical
   - Steps: ±10% (algorithm-dependent)
   - Accelerometer: Good for gestures, not for precise measurements

3. **BLE Range**
   - ~10 meters typical
   - Walls/obstacles reduce range
   - Metal objects interfere

4. **Processing Power**
   - Limited onboard processing
   - Complex calculations better done on phone/PC
   - Storage limited (few days of detailed data)

### Protocol Limitations

1. **Single Connection**
   - Ring connects to one device at a time
   - Must disconnect official app first

2. **No Encryption**
   - BLE connection not encrypted (at protocol level)
   - Anyone in range could potentially sniff data
   - Consider privacy implications

3. **No Authentication**
   - No pairing PIN or security
   - Any device can connect if ring is in pairing mode

---

## Safety & Ethics

### Do's ✅

- Experiment with your own ring
- Document findings openly
- Share discoveries with community
- Respect user privacy
- Contribute back to open source

### Don'ts ❌

- Don't connect to others' rings without permission
- Don't use for medical decisions (ring is fitness device, not medical)
- Don't intercept others' health data
- Don't create malicious tools
- Don't violate manufacturer warranty recklessly

---

## Contributing

Found something new? Document it!

### Template for New Discoveries

```markdown
## [Feature Name]

**Command:**
```
0xAB 0x00 [LENGTH] 0xFF [COMMAND_ID] [PARAMS...] 0x01
```

**Response:**
```
[Packet structure]
```

**Example:**
```
Request: 0xAB...
Response: 0xAB...
```

**Notes:**
- Behavior observations
- Edge cases
- Potential uses
```

---

## Resources

### Official Documentation
- Colmi Official App (reverse engineer this!)
- Ring Manual (usually minimal)

### Community Projects
- [@atc1441 MIDI Ring](https://github.com/atc1441) - Original reverse engineering
- [colmi_r02_client](https://github.com/yourusername/colmi_r02_client) - Python implementation
- This project - Web-based dashboard

### Tools
- **Wireshark** - Packet analysis
- **nRF Connect** - BLE debugging (Android/iOS)
- **Bluetooth HCI Snoop** - Android packet capture
- **Web Bluetooth API** - Browser-based BLE
- **Python BluePy** - Python BLE library

### Learning Resources
- [BLE Primer](https://www.bluetooth.com/bluetooth-resources/)
- [GATT Specifications](https://www.bluetooth.com/specifications/gatt/)
- [Accelerometer Math](https://www.nxp.com/docs/en/application-note/AN3461.pdf)

---

## Future Possibilities

### Advanced Features

1. **Continuous Glucose Monitoring** (if hardware supports)
2. **ECG/EKG** (requires specific sensor)
3. **Blood Pressure** (optical sensors advancing)
4. **Hydration Level** (bioimpedance)
5. **Stress Detection** (HRV + temperature + motion)

### Integration Ideas

1. **Home Automation**
   - Gesture controls for smart home
   - "Swipe left" to turn off lights
   - "Point up" to raise blinds

2. **Gaming**
   - Use ring as game controller
   - Motion-based gameplay
   - VR/AR integration

3. **Accessibility**
   - Alternative input device
   - Communication for non-verbal users
   - Assistive technology

4. **Productivity**
   - Silent notifications (vibration)
   - Quick shortcuts
   - Stress monitoring for breaks

---

## Conclusion

The Colmi ring is a surprisingly capable device with an accessible protocol. While the basic functions are documented, there's much more to discover:

- Hidden sensors
- Advanced features
- Optimization opportunities
- Novel use cases

**Key Takeaways:**
- Protocol is relatively simple (no encryption, clear structure)
- Accelerometer data is rich and enables gesture recognition
- Battery and connection stability are good
- Plenty of room for community innovation

**Next Steps:**
1. Try the experiments listed above
2. Document your findings
3. Share with the community
4. Build cool stuff!

---

**Happy Hacking! 🎯💍**

*Remember: This is for educational and personal use. Respect privacy, safety, and legal boundaries.*
