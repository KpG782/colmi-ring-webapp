# 📁 Folder Structure Reference

Quick reference guide for the Colmi Ring Dashboard project structure.

## 🗂️ Complete Project Structure

```
colmi-ring-dashboard/
│
├── 📄 Configuration Files (Root)
│   ├── .editorconfig              # Editor consistency
│   ├── .env.example               # Environment template
│   ├── .gitignore                 # Git exclusions
│   ├── .prettierignore            # Prettier exclusions
│   ├── .prettierrc                # Code formatting rules
│   ├── eslint.config.mjs          # ESLint configuration
│   ├── next.config.ts             # Next.js configuration
│   ├── next-env.d.ts              # Next.js types
│   ├── package.json               # Dependencies & scripts
│   ├── postcss.config.mjs         # PostCSS configuration
│   └── tsconfig.json              # TypeScript configuration
│
├── 📚 Documentation Files (Root)
│   ├── ARCHITECTURE.md            # Technical architecture
│   ├── CHANGELOG.md               # Version history
│   ├── CODE_OF_CONDUCT.md         # Community guidelines
│   ├── CONTRIBUTING.md            # How to contribute
│   ├── DEPLOYMENT.md              # Deployment guide
│   ├── GETTING_STARTED.md         # Quick start guide
│   ├── LICENSE                    # MIT License
│   ├── PROJECT_CLEANUP_SUMMARY.md # This cleanup summary
│   ├── README.md                  # Main project overview
│   └── SECURITY.md                # Security policy
│
├── 🔧 .github/                    # GitHub-specific files
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md          # Bug report template
│   │   └── feature_request.md     # Feature request template
│   ├── workflows/
│   │   └── ci.yml                 # CI/CD pipeline
│   └── pull_request_template.md   # PR template
│
├── 💻 .vscode/                    # VS Code configuration
│   ├── extensions.json            # Recommended extensions
│   └── settings.json              # Workspace settings
│
├── 🎨 app/                        # Next.js App Router (Pages)
│   ├── favicon.ico                # Browser icon
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout + metadata
│   └── page.tsx                   # Home page (main entry)
│
├── 🧩 components/                 # React Components
│   ├── dashboard/                 # [Future] Dashboard components
│   ├── ui/                        # [Future] Reusable UI components
│   ├── AccelerometerCard.tsx      # 3-axis motion data
│   ├── ActivityCard.tsx           # Activity intervals
│   ├── BatteryCard.tsx            # Battery level display
│   ├── ConnectionAlert.tsx        # Connection alerts
│   ├── ConnectionStatusCard.tsx   # Connection status
│   ├── DailyStepsCard.tsx         # Daily step summary
│   ├── DashboardHeader.tsx        # Dashboard header
│   ├── DataDashboard.tsx          # Main dashboard container
│   ├── DataQualityCard.tsx        # Data quality metrics
│   ├── DebugInfo.tsx              # Debug information
│   ├── HeartRateCard.tsx          # Heart rate monitoring
│   ├── index.ts                   # Component exports
│   ├── LiveStepsCard.tsx          # Real-time steps
│   ├── RingConnector.tsx          # Bluetooth connection UI
│   ├── SpO2Card.tsx               # Blood oxygen monitoring
│   ├── StatusFooter.tsx           # Footer status bar
│   └── StepsCard.tsx              # Step tracking
│
├── 📚 lib/                        # Core Library Code
│   ├── colmi-ring-service.ts      # Bluetooth service layer
│   ├── constants.ts               # Protocol constants/commands
│   ├── index.ts                   # Library exports
│   └── types.ts                   # TypeScript type definitions
│
├── 🖼️ public/                     # Static Assets
│   └── (Add images, fonts, etc.)
│
├── 📦 src/                        # [Future] Organized source code
│   ├── components/
│   │   ├── dashboard/             # Dashboard-specific components
│   │   └── ui/                    # Reusable UI components
│   ├── config/                    # Configuration files
│   ├── hooks/                     # Custom React hooks
│   ├── services/                  # Business logic services
│   ├── types/                     # TypeScript definitions
│   └── utils/                     # Utility functions
│
└── 📋 Other Directories
    ├── .next/                     # [Generated] Next.js build output
    ├── node_modules/              # [Generated] Dependencies
    └── out/                       # [Generated] Static export (if used)
```

## 📂 Directory Purposes

### Root Level

| File/Folder | Purpose | When to Edit |
|-------------|---------|--------------|
| `package.json` | Dependencies, scripts, metadata | Adding packages, changing scripts |
| `tsconfig.json` | TypeScript configuration | Adjusting compiler settings |
| `next.config.ts` | Next.js settings | Adding headers, redirects, etc. |
| `README.md` | Main project documentation | Major changes, new features |
| `LICENSE` | Open source license | Never (MIT is standard) |

### .github/

| Folder/File | Purpose | When to Edit |
|-------------|---------|--------------|
| `ISSUE_TEMPLATE/` | Issue templates | Improving issue reporting |
| `workflows/` | CI/CD automation | Adding tests, deployment |
| `pull_request_template.md` | PR guidelines | Changing PR process |

### app/ (Next.js App Router)

| File | Purpose | When to Edit |
|------|---------|--------------|
| `layout.tsx` | Root layout, metadata, fonts | Global changes, SEO |
| `page.tsx` | Home page entry point | Main app logic changes |
| `globals.css` | Global CSS styles | Global styling |

### components/

| Component | Purpose | Displays |
|-----------|---------|----------|
| `RingConnector.tsx` | Bluetooth pairing UI | Connection screen |
| `DataDashboard.tsx` | Main dashboard container | All metrics |
| `DashboardHeader.tsx` | Dashboard title/actions | Header section |
| `HeartRateCard.tsx` | Heart rate monitoring | HR data + chart |
| `SpO2Card.tsx` | Blood oxygen monitoring | SpO2 percentage |
| `StepsCard.tsx` | Step tracking | Steps, calories, distance |
| `BatteryCard.tsx` | Battery level | Battery % + icon |
| `ActivityCard.tsx` | Activity intervals | 15-min activity data |
| `AccelerometerCard.tsx` | Motion data | X/Y/Z axis data |
| `ConnectionStatusCard.tsx` | Connection status | Connected/disconnected |
| `DataQualityCard.tsx` | Data metrics | Update frequency, etc. |
| `LiveStepsCard.tsx` | Real-time steps | Live step count |
| `DailyStepsCard.tsx` | Daily summary | Daily totals |
| `StatusFooter.tsx` | Footer information | Status bar |
| `DebugInfo.tsx` | Debug panel | Technical info |
| `ConnectionAlert.tsx` | Alert messages | Warnings/errors |

### lib/

| File | Purpose | Contains |
|------|---------|----------|
| `colmi-ring-service.ts` | Bluetooth communication | Service class, BLE logic |
| `constants.ts` | Protocol definitions | UUIDs, commands, packets |
| `types.ts` | TypeScript types | Interfaces, types |
| `index.ts` | Barrel export | Exports for easy imports |

### src/ (Future Organization)

**Note**: This structure is prepared but not yet fully implemented.

| Folder | Purpose | Future Contents |
|--------|---------|-----------------|
| `components/dashboard/` | Dashboard components | Moved from `/components` |
| `components/ui/` | Reusable UI | Button, Card, Badge, etc. |
| `services/` | Business logic | API services, utilities |
| `hooks/` | Custom React hooks | useRingConnection, etc. |
| `types/` | Type definitions | Shared types |
| `utils/` | Utility functions | Formatters, validators |
| `config/` | Configuration | Constants, settings |

## 🔍 Finding What You Need

### "I want to..."

| Task | Look in |
|------|---------|
| Add a new metric card | `components/` - Create new card component |
| Change Bluetooth logic | `lib/colmi-ring-service.ts` |
| Update protocol commands | `lib/constants.ts` |
| Modify TypeScript types | `lib/types.ts` |
| Change app metadata (title, description) | `app/layout.tsx` |
| Style the app globally | `app/globals.css` |
| Add a new page | `app/your-page/page.tsx` |
| Configure build settings | `next.config.ts` |
| Add/update dependencies | `package.json` |
| Change linting rules | `eslint.config.mjs` |
| Update documentation | Relevant `.md` file in root |
| Add GitHub workflows | `.github/workflows/` |
| Configure VS Code | `.vscode/settings.json` |

## 📝 File Naming Conventions

### Components
- **Format**: `PascalCase.tsx`
- **Examples**: `HeartRateCard.tsx`, `DataDashboard.tsx`
- **Location**: `/components/`

### Hooks (Future)
- **Format**: `camelCase.ts`
- **Examples**: `useRingConnection.ts`, `useHeartRate.ts`
- **Location**: `/src/hooks/`

### Utilities (Future)
- **Format**: `kebab-case.ts`
- **Examples**: `bluetooth-utils.ts`, `data-formatter.ts`
- **Location**: `/src/utils/`

### Types
- **Format**: `types.ts` or `PascalCase.ts`
- **Examples**: `types.ts`, `RingTypes.ts`
- **Location**: `/lib/` or `/src/types/`

### Pages (App Router)
- **Format**: `page.tsx`, `layout.tsx`
- **Location**: `/app/your-route/`

## 🎯 Import Path Examples

### Using Path Aliases

```typescript
// Components
import { HeartRateCard } from '@/components/HeartRateCard';
import { DataDashboard } from '@/components/DataDashboard';

// Services
import { ColmiRingService } from '@/lib/colmi-ring-service';

// Types
import type { RingData } from '@/lib/types';

// Constants
import { COLMI_BLE_CONFIG } from '@/lib/constants';
```

### Relative Imports (When Path Aliases Don't Work)

```typescript
// From components/HeartRateCard.tsx
import type { RingData } from '../lib/types';
import { ColmiRingService } from '../lib/colmi-ring-service';
```

## 🔧 Working with the Structure

### Adding a New Component

1. Create file in `/components/`
2. Follow naming convention: `YourComponent.tsx`
3. Export from `/components/index.ts`
4. Import using path alias: `@/components/YourComponent`

### Adding a New Page

1. Create folder: `/app/your-page/`
2. Add file: `/app/your-page/page.tsx`
3. Access at: `http://localhost:3000/your-page`

### Adding Documentation

1. Create `.md` file in root
2. Link from `README.md` if relevant
3. Use clear section headers
4. Include examples where helpful

## 📊 Project Stats

- **Total Files**: 50+
- **Documentation**: 10 major files
- **Configuration**: 12 files
- **Components**: 17 components
- **Services**: 1 main service + constants
- **GitHub Templates**: 5 files
- **Lines of Code**: ~3,000+ (code) + ~4,000+ (docs)

## 🚀 Quick Commands

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build            # Production build
npm run start            # Start production server

# Code Quality
npm run lint             # Check linting
npm run lint:fix         # Fix linting issues
npm run type-check       # Check TypeScript
npm run format           # Format code
npm run format:check     # Check formatting

# Other
npm install              # Install dependencies
npm audit                # Check for vulnerabilities
npm update               # Update dependencies
```

## 📚 Related Documentation

- [README.md](README.md) - Project overview
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical details
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
- [GETTING_STARTED.md](GETTING_STARTED.md) - User guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment options

---

**Need help finding something?** Open an issue on GitHub or check the relevant documentation file!
