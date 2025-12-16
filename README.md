# Colmi Ring Dashboard

A professional, real-time web dashboard for Colmi R02/R09 smart rings built with Next.js 16, React 19, and Web Bluetooth API. Monitor your health metrics including heart rate, SpO2, steps, battery, accelerometer data, and train custom gesture controls directly in your browser.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)

## Features

### Health Monitoring
- **Real-time Heart Rate** - Continuous BPM tracking with status indicators
- **SpO2 Blood Oxygen** - Blood oxygen saturation monitoring with visual feedback
- **Step Tracking** - Daily steps, calories, and distance with live updates
- **Battery Monitoring** - Real-time battery level with status alerts
- **Activity Analytics** - Detailed 15-minute interval activity breakdown

### Gesture Training & Motion Tracking
- **Accelerometer Visualization** - Real-time 3-axis motion data with pitch, roll, and yaw
- **Gesture Recording** - Record and save custom hand gestures
- **Pattern Recognition** - AI-powered gesture matching with confidence scoring
- **Action Triggers** - Set custom actions (messages, images, sounds, URLs) for detected gestures
- **Data Smoothing** - Adjustable smoothing levels for stable gesture detection
- **Import/Export** - Save and share gesture libraries

### User Experience
- **Direct Bluetooth Connection** - No backend or server required, pure Web Bluetooth API
- **Professional UI** - Clean, modern interface following open-source design principles
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Dark Mode** - Full dark mode support throughout the application
- **Tabbed Navigation** - Organized tabs for Overview, Health, Activity, Sensors, Gestures, and Advanced settings

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- A **Colmi R02** or **R09** smart ring
- A **Web Bluetooth compatible browser**:
  - Chrome 56+
  - Edge 79+
  - Opera 43+
  - Chrome for Android 56+

> **Note**: Web Bluetooth is not supported in Firefox or Safari.

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/colmi-ring-dashboard.git
cd colmi-ring-dashboard
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Run the development server**

```bash
npm run dev
# or
yarn dev
```

4. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Getting Started

1. **Click "Connect to Ring"** on the landing page
2. **Select your Colmi device** from the Bluetooth pairing dialog (e.g., "R02_4101")
3. **Grant permissions** when prompted
4. **View your dashboard** - All metrics will start updating automatically

### Health Monitoring

- **Heart Rate**: Navigate to Health tab, click "Start Monitoring" for continuous tracking
- **SpO2**: Click "Start SpO2" to begin blood oxygen monitoring
- **Battery**: Click refresh icon to update battery level
- **Steps**: Automatically synced on connection and updated in real-time
- **Activity**: View 15-minute interval breakdown in the Activity tab

### Gesture Training

1. **Navigate to Gestures tab**
2. **Start Raw Data Mode** to begin receiving accelerometer data
3. **Record a Gesture**:
   - Click "Start Recording"
   - Perform your gesture (e.g., point up, tilt left, twist clockwise)
   - Click "Stop Recording" (aim for 30-50+ samples)
4. **Name and Save** your gesture
5. **Add Actions** (optional):
   - Click on a saved gesture to expand details
   - Select "Add Action" to configure triggers
   - Choose action type: Message, Image, Sound, or URL
   - Actions trigger when gesture is detected with 80%+ confidence
6. **Toggle Actions** on/off using the Action Triggers switch
7. **Export/Import** gestures for backup or sharing

### Advanced Features

- **Data Smoothing**: Adjust smoothing level (1-10) for stable gesture detection
- **Calibration**: Use the calibrate button to set current position as zero reference
- **Emergency Stop**: Stop all monitoring with one click (stops ring flashing)
- **Ring Reboot**: Restart the ring device if needed

## 🏗️ Project Structure

```
colmi-ring-dashboard/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── AccelerometerCard.tsx    # 3-axis motion visualization
│   ├── ActivityCard.tsx         # Activity tracking and analytics
│   ├── BatteryCard.tsx          # Battery level monitoring
│   ├── ConnectionAlert.tsx      # Connection status alerts
│   ├── ConnectionStatusCard.tsx # Detailed connection info
│   ├── DailyStepsCard.tsx       # 15-minute interval breakdown
│   ├── DashboardHeader.tsx      # Main dashboard header
│   ├── DataDashboard.tsx        # Main dashboard component
│   ├── DataQualityCard.tsx      # Data quality metrics
│   ├── DebugInfo.tsx            # Debug information panel
│   ├── GestureTrainer.tsx       # Gesture recording & recognition
│   ├── HeartRateCard.tsx        # Heart rate monitoring
│   ├── LiveStepsCard.tsx        # Real-time step updates
│   ├── RingConnector.tsx        # Bluetooth connection UI
│   ├── SpO2Card.tsx             # Blood oxygen monitoring
│   ├── StatusFooter.tsx         # Dashboard footer
│   ├── StepsCard.tsx            # Step counter display
│   ├── Tabs.tsx                 # Tab navigation component
│   └── index.ts                 # Component exports
├── lib/                         # Core library code
│   ├── colmi-ring-service.ts   # Bluetooth service implementation
│   ├── constants.ts             # Protocol constants and commands
│   ├── types.ts                 # TypeScript type definitions
│   └── index.ts
├── public/                      # Static assets
├── .gitignore                   # Git ignore rules
├── CODE_OF_CONDUCT.md          # Community guidelines
├── CONTRIBUTING.md             # Contribution guidelines
├── LICENSE                      # MIT License
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies and scripts
├── postcss.config.mjs          # PostCSS configuration
├── README.md                   # This file
└── tsconfig.json               # TypeScript configuration
```

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router and Turbopack
- **UI Library**: [React 19.2](https://react.dev/) with Server Components
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with custom design system
- **Icons**: [Lucide React](https://lucide.dev/) - Modern icon library
- **Bluetooth**: [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
- **Storage**: Browser LocalStorage for gesture persistence

## Key Features in Detail

### Gesture Training System

The gesture training system allows you to:

1. **Record gestures** by capturing raw accelerometer data in real-time
2. **Analyze patterns** with automatic averaging and range calculation
3. **Match gestures** using Euclidean distance algorithms with confidence scoring
4. **Trigger actions** when gestures are detected (80%+ confidence threshold)
5. **Persist data** with automatic localStorage saving and JSON import/export

**Use Cases:**
- Quick actions (e.g., tilt left to open a URL)
- Accessibility shortcuts
- Silent notifications
- Custom alert systems
- Prototype development for wearable interactions

### Accelerometer Visualization

- **Pitch (X-axis)**: Forward/backward hand tilt
- **Roll (Y-axis)**: Left/right hand tilt  
- **Yaw (Z-axis)**: Clockwise/counter-clockwise wrist twist
- **G-Force Display**: Real-time gravity force on each axis
- **Motion History**: Visual graph of last 20 readings per axis
- **Calibration**: Set any position as zero reference point

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

### Environment Variables

No environment variables required! This app runs entirely in the browser.

## 📱 Browser Compatibility

| Browser        | Support | Notes                       |
| -------------- | ------- | --------------------------- |
| Chrome         | ✅ Yes  | Full support (56+)          |
| Edge           | ✅ Yes  | Full support (79+)          |
| Opera          | ✅ Yes  | Full support (43+)          |
| Firefox        | ❌ No   | Web Bluetooth not supported |
| Safari         | ❌ No   | Web Bluetooth not supported |
| Chrome Android | ✅ Yes  | Full support (56+)          |

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a PR.

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[@atc1441](https://github.com/atc1441)** - For reverse engineering the Colmi protocol
- **[colmi_r02_client](https://github.com/yourusername/colmi_r02_client)** - Python client that inspired this project
- **Colmi** - For creating these amazing smart rings

## 🐛 Known Issues

- Web Bluetooth requires HTTPS in production (works with localhost in development)
- Some browsers may require manual Bluetooth pairing before connection
- Connection stability may vary based on browser and device

## 📚 Related Projects

- [colmi_r02_client](https://github.com/yourusername/colmi_r02_client) - Python client for Colmi rings
- [Gadgetbridge](https://github.com/Freeyourgadget/Gadgetbridge) - Android app for various smart devices

## 📧 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/colmi-ring-dashboard/issues) page
2. Read the documentation in the `docs/` folder
3. Open a new issue with detailed information

## Roadmap

### Completed ✅
- [x] Gesture training and recognition system
- [x] Accelerometer visualization with pitch/roll/yaw
- [x] Data export (JSON for gestures)
- [x] Real-time step tracking with live updates
- [x] Professional UI with dark mode
- [x] SpO2 monitoring
- [x] Action triggers for gestures

### Planned 🚀
- [ ] Add automated tests (Jest, React Testing Library)
- [ ] Historical data storage with IndexedDB
- [ ] CSV export for health metrics
- [ ] Create Progressive Web App (PWA)
- [ ] Add more chart visualizations (trends, comparisons)
- [ ] Support for additional Colmi models (R06, etc.)
- [ ] Multi-language support (i18n)
- [ ] Cloud sync for gesture libraries
- [ ] Advanced gesture analytics
- [ ] Gesture collision detection

---


