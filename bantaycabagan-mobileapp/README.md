# BantayCabagan Mobile App

React Native + Expo (TypeScript) mobile client scaffold for rapid feature development and Expo Go testing.

## Quick Start

1. Install dependencies

```bash
npm install
```

1. Start Expo server

```bash
npx expo start
```

1. Open Expo Go on your phone and scan the QR code.

## Current Sample Features

- Dashboard summary cards (Total, In Field, At Base, Off Duty)
- Monitoring list with pull-to-refresh behavior
- Settings sample action to reload mock data
- Typed data models, hooks, services, and reusable components

## Project Structure

- App.tsx: App shell and tab switching
- src/constants: Theme tokens
- src/types: Shared TypeScript models
- src/data: Mock data source
- src/services: Data fetching layer
- src/hooks: State and data orchestration
- src/components: Reusable UI components
- src/screens: Feature screens
- src/utils: Utility helpers

## Next Development Steps

- Replace mock service with backend API calls
- Add authentication screen flow
- Add map screen (personnel tracking)
- Wire push notifications and location updates
