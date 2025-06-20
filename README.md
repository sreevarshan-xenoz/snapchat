# SnapClone

A modern Snapchat clone built with React Native, Firebase, and Expo.

## Features

- User authentication (sign up, login, logout)
- Camera functionality for taking photos and videos
- Stories that disappear after 24 hours
- Direct messaging between users
- Friend system with add/remove functionality
- Filters and effects for photos/videos
  - Basic image filters (sepia, grayscale, vintage, etc.)
  - AR face filters with face detection (dog, cat, bunny)
- Map view to see friends' locations (with permission)
- Push notifications for messages, friend requests, and stories
- In-app notification center with read/unread status
- Group chat functionality

## Tech Stack

- **Frontend**: React Native, Expo
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Maps**: React Native Maps
- **Camera**: Expo Camera
- **Face Detection**: Expo Face Detector
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **Notifications**: Expo Notifications

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
│   └── filters/         # Filter assets for camera effects
├── src/
│   ├── components/      # Reusable UI components
│   │   └── camera/      # Camera-related components
│   │       └── filters/ # Camera filter components
│   ├── contexts/        # React contexts (including NotificationContext)
│   ├── screens/         # Screen components
│   │   ├── auth/        # Authentication screens
│   │   ├── chat/        # Chat-related screens
│   │   ├── main/        # Main app screens
│   │   ├── notifications/ # Notification screens
│   │   ├── profile/     # Profile-related screens
│   │   └── story/       # Story-related screens
│   ├── navigation/      # Navigation configuration
│   ├── redux/           # Redux store, actions, and reducers
│   ├── services/        # API and Firebase services
│   ├── utils/           # Utility functions
│   └── config/          # Configuration files
├── App.js               # Entry point
├── app.json             # Expo configuration
├── babel.config.js      # Babel configuration
├── package.json         # Dependencies and scripts
├── NOTIFICATIONS.md     # Detailed documentation for the notification system
└── README.md            # Project documentation
```

## Notifications

The app includes a comprehensive notification system:

- Push notifications for new messages, friend requests, and stories
- In-app notification center with read/unread status tracking
- Badge counts on app icon and profile tab
- Real-time updates using Firestore

For detailed information about the notification system, see [NOTIFICATIONS.md](./NOTIFICATIONS.md).

## Camera Filters

The app includes a variety of camera filters and effects:

- Basic image filters (sepia, grayscale, vintage, etc.)
- AR face filters with real-time face detection
- Filter selection UI with preview thumbnails
- Filter information saved with photos/videos

For detailed information about the camera filters implementation, see [src/components/camera/filters/README.md](./src/components/camera/filters/README.md).

## Chat Features

The app includes a comprehensive chat system with the following features:

- Direct messaging between users
- Real-time message updates
- Read receipts
- Image sharing in chats
- Group chat functionality
  - Create groups with multiple friends
  - Send messages to all group members
  - View group participants
  - System messages for group events

For more details on the chat implementation, see [Chat Documentation](src/screens/chat/README.md).

## License

MIT
