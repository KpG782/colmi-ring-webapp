# Project Architecture

This document describes the architecture and design decisions of the Colmi Ring Dashboard.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Core Components](#core-components)
- [Data Flow](#data-flow)
- [Bluetooth Communication](#bluetooth-communication)
- [State Management](#state-management)
- [Best Practices](#best-practices)

## Overview

The Colmi Ring Dashboard is a client-side web application that connects directly to Colmi smart rings via the Web Bluetooth API. It provides real-time monitoring of health metrics without requiring a backend server.

### Key Principles

1. **Client-Side First**: All processing happens in the browser
2. **No Data Storage**: Ephemeral data only, no persistence
3. **Direct Connection**: Bluetooth communication without intermediaries
4. **Type Safety**: Full TypeScript coverage
5. **Component Isolation**: Single responsibility components
6. **Responsive Design**: Mobile-first approach

## Technology Stack

### Core Framework

- **Next.js 16**: React framework with App Router
- **React 19**: UI library with modern hooks
- **TypeScript 5**: Type-safe development

### Styling & UI

- **Tailwind CSS 4**: Utility-first CSS framework
- **Recharts 3**: Data visualization library
- **Lucide React**: Icon library

### APIs & Protocols

- **Web Bluetooth API**: Direct Bluetooth Low Energy communication
- **Colmi Protocol**: Custom binary protocol for ring communication

## Project Structure

```
colmi-ring-dashboard/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Home page (connection router)
│   └── globals.css        # Global styles
│
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   │   ├── DataDashboard.tsx       # Main dashboard container
│   │   ├── DashboardHeader.tsx     # Header with title/actions
│   │   ├── ConnectionStatusCard.tsx # Connection status display
│   │   ├── HeartRateCard.tsx       # Heart rate monitoring
│   │   ├── SpO2Card.tsx            # Blood oxygen monitoring
│   │   ├── StepsCard.tsx           # Step tracking
│   │   ├── BatteryCard.tsx         # Battery level
│   │   ├── ActivityCard.tsx        # Activity history
│   │   ├── AccelerometerCard.tsx   # Accelerometer data
│   │   └── ...
│   │
│   ├── ui/                # Reusable UI components (future)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   │
│   ├── RingConnector.tsx  # Bluetooth connection UI
│   └── index.ts           # Component exports
│
├── lib/                   # Core library code
│   ├── colmi-ring-service.ts  # Bluetooth service layer
│   ├── constants.ts           # Protocol constants/commands
│   ├── types.ts               # TypeScript definitions
│   └── index.ts               # Library exports
│
├── public/                # Static assets
├── .github/               # GitHub templates & workflows
└── docs/                  # Additional documentation
```

### Folder Conventions

- `app/` - Next.js pages and layouts (App Router)
- `components/` - React components organized by feature
- `lib/` - Business logic and utilities
- `public/` - Static assets (images, fonts)
- `types/` - Shared TypeScript types (future)
- `hooks/` - Custom React hooks (future)
- `utils/` - Helper functions (future)

## Core Components

### 1. Page Component (`app/page.tsx`)

**Responsibility**: Application entry point and connection routing

```typescript
- Manages connection state
- Routes between RingConnector and DataDashboard
- Monitors connection status
```

### 2. RingConnector (`components/RingConnector.tsx`)

**Responsibility**: Bluetooth connection UI and pairing

```typescript
- Initiates Web Bluetooth pairing
- Creates ColmiRingService instance
- Handles connection errors
- Displays connection instructions
```

### 3. DataDashboard (`components/DataDashboard.tsx`)

**Responsibility**: Main dashboard container and data orchestration

```typescript
- Manages ring data state
- Coordinates data updates from service
- Distributes data to child components
- Handles polling intervals
- Manages monitoring states (HR, SpO2)
```

### 4. ColmiRingService (`lib/colmi-ring-service.ts`)

**Responsibility**: Bluetooth communication layer

```typescript
- Handles BLE device discovery
- Manages GATT connection
- Implements Colmi protocol
- Processes binary packets
- Provides data callbacks
- Manages monitoring sessions
```

### 5. Dashboard Cards

**Responsibility**: Display specific metrics

Each card component:
- Receives data from DataDashboard
- Renders metric-specific UI
- Handles user interactions (if applicable)
- Shows loading/error states

## Data Flow

### Connection Flow

```
User clicks "Connect"
    ↓
RingConnector initiates pairing
    ↓
Web Bluetooth API shows device selector
    ↓
User selects Colmi ring
    ↓
ColmiRingService establishes GATT connection
    ↓
Service starts notifications on characteristic
    ↓
Page component receives service instance
    ↓
DataDashboard mounted with ring service
    ↓
Dashboard requests initial data (steps, battery)
```

### Data Update Flow

```
Ring sends notification
    ↓
ColmiRingService receives raw bytes
    ↓
Service parses binary packet
    ↓
Service extracts data based on packet type
    ↓
Service calls registered callback
    ↓
DataDashboard receives parsed data
    ↓
Dashboard updates state
    ↓
React re-renders affected components
    ↓
Cards display new data
```

### Monitoring Flow (Heart Rate / SpO2)

```
User clicks "Start Monitoring"
    ↓
Card sends request to DataDashboard
    ↓
Dashboard calls service.startRealTimeHeartRate()
    ↓
Service sends BLE command packet
    ↓
Ring starts sending data
    ↓
Service receives continuous packets
    ↓
Service parses and callbacks with data
    ↓
Dashboard updates state
    ↓
Card displays real-time updates
```

## Bluetooth Communication

### Web Bluetooth API

The application uses the [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) for direct browser-to-device communication.

**Key Concepts:**

- **GATT Server**: Bluetooth device's service database
- **Service**: Group of related characteristics (UUID: 6e40fff0-b5a3-f393-e0a9-e50e24dcca9e)
- **Characteristics**: Data endpoints
  - Write: 6e400002-b5a3-f393-e0a9-e50e24dcca9e
  - Notify: 6e400003-b5a3-f393-e0a9-e50e24dcca9e

### Colmi Protocol

The Colmi R02/R09 uses a custom binary protocol:

**Packet Structure:**
```
[Header] [Length] [Command] [Data...] [Checksum]
```

**Common Commands:**
- `0xAB 0x00 0x04 0xFF 0x95 0x80 0x63` - Request battery
- `0xAB 0x00 0x0B 0xFF 0x92 0x80 0x5C` - Request steps
- `0xAB 0x00 0x05 0xFF 0x4B 0x01 0x00 0xAE` - Start heart rate
- `0xAB 0x00 0x05 0xFF 0x4B 0x01 0x01 0xAF` - Start SpO2

**Response Parsing:**

The service parses responses based on packet signatures:
- Heart rate: `AB 00 05 FF 45` prefix
- SpO2: `AB 00 05 FF 45` prefix with different data
- Battery: `AB 00 04 FF 95` prefix
- Steps: Various packet formats
- Accelerometer: `AB 00 05 FF 53` prefix

## State Management

### Current Approach

The application uses **React's built-in state management**:

- `useState` for component state
- `useEffect` for side effects
- `useCallback` for memoized callbacks
- Props drilling for data distribution

### State Location

```
app/page.tsx
├── ringService (ColmiRingService | null)
├── isConnected (boolean)
└── passes to DataDashboard

components/DataDashboard.tsx
├── ringData (RingData)
├── isConnected (boolean)
├── connectionState (ConnectionState)
├── isHeartRateMonitoring (boolean)
├── isSpO2Monitoring (boolean)
└── distributes to child components
```

### Future Considerations

For larger applications, consider:
- Context API for global state
- Zustand for lightweight state management
- React Query for data fetching/caching
- IndexedDB for data persistence

## Best Practices

### Component Design

✅ **Do:**
- Keep components small and focused
- Use TypeScript for all components
- Document props with JSDoc comments
- Handle loading and error states
- Use proper semantic HTML
- Implement proper accessibility (ARIA)

❌ **Don't:**
- Mix business logic with UI
- Create overly complex components
- Use `any` type in TypeScript
- Ignore error handling
- Forget mobile responsiveness

### Bluetooth Communication

✅ **Do:**
- Always check if Web Bluetooth is supported
- Handle connection failures gracefully
- Implement reconnection logic
- Add proper timeouts for operations
- Validate packet data before parsing
- Clean up listeners on disconnect

❌ **Don't:**
- Assume browser support
- Leave dangling listeners
- Parse unvalidated data
- Ignore connection state changes
- Block UI during operations

### Data Handling

✅ **Do:**
- Validate incoming data
- Use proper TypeScript types
- Handle null/undefined values
- Sanitize user inputs
- Log errors appropriately
- Provide user feedback

❌ **Don't:**
- Trust data blindly
- Use magic numbers
- Mutate state directly
- Store sensitive data
- Expose raw errors to users

### Performance

✅ **Do:**
- Memoize expensive calculations
- Use `useCallback` for event handlers
- Debounce frequent updates
- Lazy load heavy components
- Optimize re-renders
- Clean up intervals/timeouts

❌ **Don't:**
- Create functions in render
- Update state in loops
- Forget dependency arrays
- Poll excessively
- Load unused libraries

## Security Considerations

1. **No Data Persistence**: Health data is ephemeral
2. **HTTPS Required**: Production requires secure connection
3. **User Consent**: Bluetooth pairing requires explicit permission
4. **Input Validation**: All Bluetooth data is validated
5. **No External APIs**: No data leaves the browser
6. **CSP Headers**: Implement Content Security Policy
7. **Dependency Audits**: Regular `npm audit` checks

## Testing Strategy (Future)

### Unit Tests
- Component rendering
- Data parsing functions
- Utility functions
- Type checking

### Integration Tests
- Component interactions
- Data flow between components
- Service layer operations

### E2E Tests (Limited)
- Connection flow
- Dashboard navigation
- User interactions
- Note: Actual Bluetooth testing requires physical device

## Contributing

When adding new features:

1. Follow the existing folder structure
2. Maintain TypeScript strict mode
3. Add JSDoc comments for public APIs
4. Update this documentation
5. Consider performance implications
6. Test with actual hardware

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Hooks](https://react.dev/reference/react)
- [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
