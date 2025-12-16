# Colmi Ring Dashboard 💍

A modern, real-time web dashboard for Colmi R02/R09 smart rings built with Next.js 16, React 19, and Web Bluetooth API. Monitor your health metrics including heart rate, SpO2, steps, battery, and accelerometer data directly in your browser.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)

## ✨ Features

- 🔌 **Direct Bluetooth Connection** - Connect to your Colmi ring using Web Bluetooth API (no backend required)
- ❤️ **Real-time Heart Rate Monitoring** - Continuous heart rate tracking with live charts
- 🩸 **SpO2 Blood Oxygen Monitoring** - Track blood oxygen saturation levels
- 👟 **Step Tracking** - Daily steps, calories, and distance tracking
- 🔋 **Battery Level Monitoring** - Keep track of your ring's battery status
- 📊 **Activity Data** - View detailed 15-minute interval activity data
- 🎯 **Accelerometer Data** - Real-time 3-axis accelerometer visualization
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI** - Clean, intuitive interface built with Tailwind CSS

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

## 📖 Usage

1. **Click "Connect to Ring"** on the landing page
2. **Select your Colmi device** from the Bluetooth pairing dialog (e.g., "R02_4101")
3. **Grant permissions** when prompted
4. **View your dashboard** - All metrics will start updating automatically

### Manual Controls

- **Heart Rate**: Click "Start Monitoring" to begin continuous heart rate tracking
- **SpO2**: Click "Measure SpO2" to start blood oxygen monitoring
- **Battery**: Click the refresh icon to update battery level
- **Steps**: Automatically synced on connection

## 🏗️ Project Structure

```
colmi-ring-dashboard/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   ├── dashboard/               # Dashboard-specific components
│   ├── AccelerometerCard.tsx
│   ├── ActivityCard.tsx
│   ├── BatteryCard.tsx
│   ├── ConnectionAlert.tsx
│   ├── ConnectionStatusCard.tsx
│   ├── DailyStepsCard.tsx
│   ├── DashboardHeader.tsx
│   ├── DataDashboard.tsx
│   ├── DataQualityCard.tsx
│   ├── DebugInfo.tsx
│   ├── HeartRateCard.tsx
│   ├── LiveStepsCard.tsx
│   ├── RingConnector.tsx
│   ├── SpO2Card.tsx
│   ├── StatusFooter.tsx
│   ├── StepsCard.tsx
│   └── index.ts
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

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Charts**: [Recharts 3](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Bluetooth**: [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)

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

## 🗺️ Roadmap

- [ ] Add automated tests
- [ ] Implement data export (CSV, JSON)
- [ ] Add historical data storage
- [ ] Create mobile app wrapper
- [ ] Add more chart visualizations
- [ ] Support for additional Colmi models
- [ ] Multi-language support

---


