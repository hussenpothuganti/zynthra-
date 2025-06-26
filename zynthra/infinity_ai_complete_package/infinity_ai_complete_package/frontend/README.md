# Infinity AI - Frontend (React Native)

This is the frontend codebase for the Infinity AI mobile application built with React Native.

## Features

- Jarvis-like AI chat assistant with voice interaction (English + Telugu)
- Emergency SOS button that shares live GPS to saved contacts
- Daily skill-based challenges with XP + leaderboard
- Auto ticket/product ordering assistant via guided UI
- Career Mentor with AI resume tips, job links, and timeline
- Private P2P chat and calls using WebRTC
- Modern, animated UI with ripple effects and story sliders
- Full support for English, Telugu, and Hindi, with real-time translation

## Tech Stack

- React Native for cross-platform mobile development
- Redux for state management
- WebRTC for P2P communication
- i18next for localization
- React Native Voice & TTS for voice interactions

## Project Structure

```
src/
├── assets/            # Images, fonts, and other static assets
├── components/        # Reusable UI components
├── navigation/        # Navigation configuration
├── screens/           # App screens
├── services/          # API services and other external services
├── store/             # Redux store configuration
├── utils/             # Utility functions
└── App.js             # Main application entry point
```

## Installation

1. Clone the repository
2. Install dependencies: `npm install` or `yarn install`
3. Run the app: `npm start` or `yarn start`

## Building for Production

- Android: `npm run android` or `yarn android`
- iOS: `npm run ios` or `yarn ios`

## Color Scheme

- Primary: Deep Purple (#4A148C)
- Secondary: Electric Blue (#0091EA)
- Supporting colors for UI elements and gradients
