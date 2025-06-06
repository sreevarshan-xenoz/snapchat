# SnapClone

A modern Snapchat clone built with React Native, Firebase, and Expo.

## Features

- User authentication (sign up, login, logout)
- Camera functionality for taking photos and videos
- Stories that disappear after 24 hours
- Direct messaging between users
- Friend system with add/remove functionality
- Filters and effects for photos/videos
- Map view to see friends' locations (with permission)

## Tech Stack

- **Frontend**: React Native, Expo
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Maps**: React Native Maps
- **Camera**: Expo Camera
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Firebase account

### Installation

1. Clone the repository
```
git clone https://github.com/sreevarshan-xenoz/snapchat.git
cd snapchat

```

2. Install dependencies
```
npm install
# or
yarn install
```

3. Set up Firebase
   - Create a new Firebase project
   - Enable Authentication, Firestore, and Storage
   - Add your Firebase configuration to `src/config/firebase.js`

4. Start the development server
```
npm start
# or
yarn start
```

5. Run on a device or emulator
   - Scan the QR code with the Expo Go app on your phone
   - Press 'a' to run on an Android emulator
   - Press 'i' to run on an iOS simulator

## Project Structure

```
snapclone/
├── assets/              # Images, fonts, and other static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation configuration
│   ├── redux/           # Redux store, actions, and reducers
│   ├── services/        # API and Firebase services
│   ├── utils/           # Utility functions
│   ├── config/          # Configuration files
│   └── App.js           # Main application component
├── App.js               # Entry point
├── app.json             # Expo configuration
├── babel.config.js      # Babel configuration
├── package.json         # Dependencies and scripts
└── README.md            # Project documentation
```

## License

MIT
