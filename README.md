# 💧 Drip - Hydration Tracking App

A beautiful, mobile-first hydration tracking app with an animated water vessel visualization, quick logging, streak tracking, and achievements system.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Capacitor](https://img.shields.io/badge/Capacitor-7-3880FF)

## ✨ Features

- **🫙 Animated Water Vessel** - Beautiful liquid visualization that fills as you track your hydration
- **⚡ Quick Logging** - One-tap presets for water, coffee, tea, juice, and smoothies
- **🔥 Streak Tracking** - Stay motivated with daily streak counts and celebrations
- **🏆 Achievements** - Unlock badges for hydration milestones
- **📊 Statistics** - View weekly/monthly hydration charts and quality scores
- **🌙 Smart Reminders** - Circadian-guided hydration suggestions
- **☕ Caffeine Tracking** - Monitor your coffee and tea intake
- **🎨 Dark Mode** - Beautiful light and dark themes
- **📱 Mobile-First** - Swipe gestures and touch-optimized UI
- **🗺️ Grid Navigation** - Unique spatial navigation between screens

## 🚀 Getting Started

### Web Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Mobile App (iOS/Android)

This app uses [Capacitor](https://capacitorjs.com/) for native mobile deployment.

```bash
# Build and add platforms
npm run cap:add:ios      # Add iOS (requires macOS)
npm run cap:add:android  # Add Android

# Sync web build to native projects
npm run cap:sync

# Open in native IDEs
npm run cap:open:ios     # Opens Xcode
npm run cap:open:android # Opens Android Studio
```

#### Requirements

- **iOS**: macOS + Xcode 16.0+
- **Android**: Android Studio 2024.2.1+
- **Node.js**: 20+

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── screens/           # Main app screens
│   ├── ui/                # Reusable UI components
│   ├── WaterVessel.tsx    # Animated water visualization
│   ├── QuickLog.tsx       # Quick drink logging
│   ├── Onboarding.tsx     # First-time user setup
│   └── ...
├── hooks/
│   ├── useHydration.ts    # Core hydration state management
│   └── useNotifications.ts # Reminder notifications
├── lib/
│   ├── capacitor.ts       # Native platform utilities
│   ├── hydration-quality.ts
│   └── stats-utils.ts
└── contexts/              # React contexts
```

## 🎮 Navigation

- **Swipe** left/right/up/down to navigate between screens
- **Scroll wheel** at screen edges to switch views
- **Long press** or tap the grid icon to open the overview map
- **Drag & drop** screens in overview to customize your layout
- **Arrow keys** for keyboard navigation

## 📱 Screens

| Screen | Description |
|--------|-------------|
| **Bottle** | Main view with water vessel and quick log buttons |
| **Details** | Today's progress, caffeine tracking, drink log |
| **Stats** | Weekly/monthly charts and trends |
| **Quality** | Hydration quality score and analysis |
| **History** | Calendar view of past hydration data |
| **Achievements** | Unlockable badges and milestones |
| **Settings** | Goals, reminders, theme, data export |

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Mobile**: Capacitor 7
- **Storage**: localStorage (client-side persistence)

## 📄 License

MIT License - feel free to use this for your own projects!

---

Made with 💧 by the Drip team