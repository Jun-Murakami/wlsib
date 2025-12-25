# CLAUDE.md
必ず日本語で回答してください。
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"レンズ何持ってく？" (What Lens Should I Bring?) is a camera lens simulation web application for photographers. It calculates and visualizes the field of view and shooting area based on lens focal length, sensor size, and shooting conditions. The app is built with React, TypeScript, and deployed as both a web app and mobile app using Capacitor.

**Live App**: https://lensdore-c55ce.web.app/

## Development Commands

### Core Development
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint with TypeScript support

### Mobile Development (Capacitor)
- `npx cap add android` - Add Android platform
- `npx cap add ios` - Add iOS platform  
- `npx cap run android` - Build and run on Android device/emulator
- `npx cap run ios` - Build and run on iOS device/simulator
- `npx cap sync` - Sync web assets to native platforms
- `npx cap open android` - Open Android project in Android Studio
- `npx cap open ios` - Open iOS project in Xcode

### Deployment
- Firebase hosting is configured - run `npm run build` then deploy via Firebase CLI

## Architecture

### Technology Stack
- **Frontend**: React 19.1.0 with TypeScript
- **UI Framework**: Material-UI (MUI) 7.2.0 with Emotion for styling
- **Canvas Graphics**: Konva.js via react-konva for 2D canvas rendering
- **Build Tool**: Vite with SWC for fast builds
- **Mobile**: Capacitor 7.4.1 for iOS/Android deployment
- **Hosting**: Firebase Hosting
- **Fonts**: Biz UDPGothic (Japanese font)

### Application Structure
- **Single Page Application**: All functionality in `src/App.tsx` (706 lines)
- **Modular Components**: 
  - `ShootingArea`: Main canvas component using Konva for visual simulation
  - `RangeSlider`: Reusable slider component with range controls
- **Core Logic**: Mathematical calculations for field of view, shooting area, and lens optics

### Key Features
1. **Camera Sensor Presets**: Predefined sensor sizes (medium format, full-frame, APS-C, micro four-thirds, etc.)
2. **Real-time Visualization**: Interactive canvas showing shooting area with human subject for scale
3. **Letterbox/Cinematic Ratios**: Support for various aspect ratios (CinemaScope, Vista, etc.)
4. **Responsive Design**: Mobile-optimized UI with breakpoint handling
5. **Cross-platform**: Web app with native iOS/Android versions

### State Management
- React hooks (useState, useEffect) for local state
- No external state management library - all state contained in App component

### Calculations
- Field of view calculations based on sensor size and focal length
- Shooting area calculations using lens optics formulas
- Real-time updates with dependency tracking via useEffect

## File Structure Notes

### Source Code (`src/`)
- `App.tsx` - Main application component (all UI and logic)
- `mui_theme.tsx` - Material-UI theme configuration
- `main.tsx` - React application entry point
- `assets/` - SVG icons and badges

### Configuration Files
- `vite.config.ts` - Vite build configuration (React SWC plugin)
- `capacitor.config.ts` - Capacitor mobile app configuration
- `tsconfig.json` - TypeScript compiler settings (strict mode enabled)
- `.eslintrc.cjs` - ESLint configuration with TypeScript and React rules
- `firebase.json` - Firebase hosting configuration

### Mobile Platforms
- `android/` - Android Capacitor project files
- `ios/` - iOS Capacitor project files

## Development Guidelines

### Code Style
- TypeScript strict mode enabled with comprehensive type checking
- ESLint configured for React/TypeScript best practices
- Japanese comments and UI text (target audience is Japanese photographers)
- Material-UI sx prop for styling (no CSS modules)

### Mathematical Precision
- Lens calculations use precise formulas for field of view and shooting area
- Distance conversions between meters and millimeters
- Scaling calculations for canvas rendering

### Mobile Considerations
- Responsive breakpoints for mobile/desktop layouts
- Capacitor integration for native platform features
- Platform detection for conditional rendering (app store badges)

### Performance
- Konva.js for efficient 2D canvas rendering
- useEffect dependency optimization for calculation updates
- Image loading with use-image hook

## Common Development Tasks

When adding new sensor presets, update the `sensorSizes` array in App.tsx with label, width, and height values.

When modifying lens calculations, focus on the `calculateShootingArea` and `calculateFieldOfView` functions.

For UI changes, all Material-UI components are imported at the top of App.tsx - add any new component imports there.

To test mobile functionality, use Capacitor commands to run on devices or use browser dev tools mobile simulation.