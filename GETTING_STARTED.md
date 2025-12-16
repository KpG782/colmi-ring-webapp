# Getting Started Guide

Welcome to the Colmi Ring Dashboard! This guide will help you get up and running quickly.

## Quick Start (5 minutes)

### 1. Prerequisites Check

Before you begin, ensure you have:

- ✅ **Node.js 18.x or higher** - [Download here](https://nodejs.org/)
- ✅ **A Colmi R02 or R09 smart ring** - Charged and ready
- ✅ **A compatible browser**:
  - Chrome 56+ (Recommended)
  - Edge 79+
  - Opera 43+
  - Chrome for Android 56+

> **Note**: Firefox and Safari do not support Web Bluetooth.

Verify Node.js installation:
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 8.x.x or higher
```

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/colmi-ring-dashboard.git
cd colmi-ring-dashboard

# Install dependencies
npm install

# Start the development server
npm run dev
```

The dashboard will be available at [http://localhost:3000](http://localhost:3000)

### 3. Connect Your Ring

1. Open your browser to [http://localhost:3000](http://localhost:3000)
2. Click the **"Connect to Ring"** button
3. In the Bluetooth pairing dialog:
   - Look for your ring (e.g., "R02_4101")
   - Click on it to pair
4. Grant permission when prompted
5. You're connected! 🎉

### 4. Explore the Dashboard

Once connected, you'll see:

- **Heart Rate Card** - Click "Start Monitoring" for continuous tracking
- **SpO2 Card** - Click "Measure SpO2" for blood oxygen levels
- **Steps Card** - Automatically syncs your step count
- **Battery Card** - Shows current battery level
- **Activity Card** - View detailed activity history
- **Accelerometer Card** - Real-time motion data

## Detailed Setup

### System Requirements

#### Hardware
- Computer with Bluetooth 4.0+ (BLE) support
- Colmi R02 or R09 smart ring (fully charged)

#### Software
- **Node.js**: 18.x or 20.x (LTS versions)
- **npm**: 8.x or higher (comes with Node.js)
- **Operating System**: Windows 10+, macOS 10.15+, or Linux

#### Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 56+ | ✅ Recommended |
| Edge | 79+ | ✅ Supported |
| Opera | 43+ | ✅ Supported |
| Chrome Android | 56+ | ✅ Supported |
| Firefox | Any | ❌ Not supported |
| Safari | Any | ❌ Not supported |

### Installation Options

#### Option 1: Git Clone (Recommended)

```bash
git clone https://github.com/yourusername/colmi-ring-dashboard.git
cd colmi-ring-dashboard
npm install
```

#### Option 2: Download ZIP

1. Download from [GitHub Releases](https://github.com/yourusername/colmi-ring-dashboard/releases)
2. Extract the ZIP file
3. Open terminal in the extracted folder
4. Run `npm install`

#### Option 3: Fork for Development

1. Fork the repository on GitHub
2. Clone your fork:
```bash
git clone https://github.com/YOUR-USERNAME/colmi-ring-dashboard.git
cd colmi-ring-dashboard
git remote add upstream https://github.com/original-owner/colmi-ring-dashboard.git
npm install
```

### Running the Application

#### Development Mode

```bash
npm run dev
```

- Hot reload enabled
- Source maps included
- Development tools available
- Runs on http://localhost:3000

#### Production Build

```bash
npm run build
npm run start
```

- Optimized for performance
- Minified JavaScript/CSS
- Production environment
- Runs on http://localhost:3000

#### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Create production build
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run type-check   # Check TypeScript types
npm run format       # Format code with Prettier
npm run format:check # Check if code is formatted
```

## First-Time Connection

### Prepare Your Ring

1. **Charge your ring** (should be 20%+ battery)
2. **Enable Bluetooth** on your computer
3. **Remove previous pairings** (if any):
   - Windows: Settings > Bluetooth > Remove device
   - macOS: System Preferences > Bluetooth > Remove
   - Linux: Settings > Bluetooth > Forget device

### Connection Process

#### Step 1: Open the Dashboard

Navigate to http://localhost:3000 in Chrome or Edge.

#### Step 2: Initiate Pairing

Click the **"Connect to Ring"** button on the landing page.

#### Step 3: Select Your Device

A Bluetooth pairing dialog will appear showing available devices:

```
Devices found:
├─ R02_4101         ← Your ring (example name)
├─ R09_2384         ← Another ring
└─ Other devices...
```

Click on your Colmi ring (starts with R02_ or R09_).

#### Step 4: Grant Permissions

If prompted by your operating system:
- **Windows**: Allow the browser to use Bluetooth
- **macOS**: Grant Bluetooth permissions to your browser
- **Linux**: May require manual pairing first

#### Step 5: Wait for Connection

You'll see a loading indicator. Within 2-5 seconds:
- ✅ Connection successful → Dashboard appears
- ❌ Connection failed → Error message with retry option

### Troubleshooting Connection

#### Ring Not Appearing

1. **Check ring battery** - Charge if below 20%
2. **Check distance** - Keep ring within 1 meter
3. **Restart Bluetooth**:
   - Turn Bluetooth off and on
   - Or restart your computer
4. **Clear browser cache**:
   - Chrome: Settings > Privacy > Clear browsing data
   - Edge: Settings > Privacy > Choose what to clear
5. **Try different browser** (Chrome recommended)

#### Connection Fails

Error: "Failed to connect to ring"

**Solutions:**
1. Refresh the page and try again
2. Remove ring from system Bluetooth settings
3. Make sure ring isn't connected to another device
4. Try turning ring off/on (press button for 10 seconds)
5. Check browser console (F12) for detailed errors

#### Connection Drops

If connection drops frequently:

1. **Check signal strength** - Stay within 1 meter
2. **Check battery level** - Charge if low
3. **Close other Bluetooth apps** - May interfere
4. **Update browser** - Use latest version
5. **Check for interference** - WiFi routers, microwaves

## Using the Dashboard

### Heart Rate Monitoring

1. Click **"Start Monitoring"** in Heart Rate card
2. Wait 5-10 seconds for first reading
3. Data updates every 2-3 seconds
4. Click **"Stop Monitoring"** when done

**Tips:**
- Wear ring snugly on finger
- Keep hand still for accurate readings
- First reading may take longer
- Normal range: 60-100 bpm (resting)

### SpO2 Measurement

1. Click **"Measure SpO2"** in SpO2 card
2. Keep hand completely still
3. Wait 10-15 seconds for reading
4. Results appear automatically

**Tips:**
- Sit still during measurement
- Ensure good ring contact with skin
- Warm hands improve accuracy
- Normal range: 95-100%

### Step Tracking

Steps sync automatically when connected.

**Features:**
- Total daily steps
- Calories burned
- Distance traveled
- Updates every 15 minutes

### Battery Monitoring

Battery level shown in battery card.

**Tips:**
- Click refresh icon to update
- Charge when below 20%
- Full charge takes ~1-2 hours
- Lasts 3-7 days per charge

### Activity Data

View detailed 15-minute interval data:

**Shows:**
- Steps per interval
- Calories per interval
- Distance per interval
- Time breakdown

**Tips:**
- Scroll to see full day
- Data organized chronologically
- May take time to load full history

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + R` | Refresh data |
| `Ctrl/Cmd + D` | Toggle debug info |
| `F12` | Open browser console |
| `Esc` | Close modals |

## Configuration

### Browser Settings

#### Chrome/Edge

1. Enable Web Bluetooth (usually on by default)
2. Settings > Privacy > Site settings > Bluetooth
3. Ensure localhost is allowed

#### Permissions

Allow these permissions:
- ✅ Bluetooth access
- ✅ Notifications (optional)

### Performance Settings

For better performance on slower computers:

1. Close unnecessary browser tabs
2. Disable browser extensions temporarily
3. Use lighter dashboard cards only
4. Reduce polling frequency (in code if needed)

## Data Privacy

### What Data is Stored?

**Nothing is stored permanently:**
- All data is in-memory only
- No cookies used
- No local storage
- No server communication
- Data cleared on page refresh

### Your Privacy

- ✅ All processing is client-side
- ✅ No data sent to external servers
- ✅ No tracking or analytics (by default)
- ✅ Open source - verify the code
- ✅ Bluetooth data encrypted at protocol level

## Next Steps

Now that you're set up:

1. **Explore features** - Try all dashboard cards
2. **Read documentation** - Check [ARCHITECTURE.md](ARCHITECTURE.md)
3. **Customize** - Modify the code to your needs
4. **Contribute** - See [CONTRIBUTING.md](CONTRIBUTING.md)
5. **Deploy** - Host it yourself ([DEPLOYMENT.md](DEPLOYMENT.md))
6. **Report issues** - Found a bug? [Open an issue](https://github.com/yourusername/colmi-ring-dashboard/issues)

## Getting Help

### Documentation

- **README.md** - Project overview
- **ARCHITECTURE.md** - Technical architecture
- **CONTRIBUTING.md** - How to contribute
- **DEPLOYMENT.md** - Deployment guide
- **FAQ.md** - Common questions (create if needed)

### Support Channels

1. **GitHub Issues** - Bug reports and features
2. **GitHub Discussions** - General questions
3. **Documentation** - Read the docs
4. **Browser Console** - Check for errors (F12)

### Common Issues

#### "Web Bluetooth not supported"
- Use Chrome, Edge, or Opera
- Update browser to latest version
- HTTPS required (not in localhost)

#### "No devices found"
- Check ring is charged
- Enable Bluetooth on computer
- Try restarting Bluetooth

#### "Cannot read heart rate"
- Start monitoring first
- Wait 10-15 seconds
- Check ring is on finger properly

#### "Connection lost"
- Check distance to ring
- Check battery level
- Refresh and reconnect

## Tips for Best Experience

### Hardware Tips

1. **Ring Placement**: Wear on index or middle finger
2. **Fit**: Should be snug but comfortable
3. **Clean**: Keep sensors clean for accuracy
4. **Charge**: Keep above 20% battery
5. **Distance**: Stay within 5 meters of computer

### Software Tips

1. **Browser**: Use Chrome for best compatibility
2. **Updates**: Keep dashboard updated
3. **Refresh**: Reload page if data stops updating
4. **Console**: Check console (F12) for issues
5. **Incognito**: Try incognito mode if issues persist

## Frequently Asked Questions

**Q: Does this work offline?**
A: Yes, once loaded. No internet needed for Bluetooth.

**Q: Can I use multiple rings?**
A: Currently one at a time. Disconnect to switch.

**Q: Is my data secure?**
A: Yes. All processing is local, no data sent anywhere.

**Q: Does this drain ring battery?**
A: Normal usage. Continuous monitoring uses more power.

**Q: Can I export data?**
A: Not yet. Planned feature. Data is ephemeral currently.

**Q: Works on phone?**
A: Yes, Chrome for Android supports Web Bluetooth.

**Q: Can I customize the dashboard?**
A: Yes! It's open source. Fork and modify freely.

## Resources

- [Web Bluetooth API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Colmi Ring Protocol](https://github.com/yourusername/colmi_r02_client)

---

**Ready to start?** Run `npm run dev` and visit [http://localhost:3000](http://localhost:3000)! 🚀
