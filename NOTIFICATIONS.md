# Notifications System for SnapClone

This document provides an overview of the notification system implemented in the SnapClone application.

## Features

- Push notifications for new messages, friend requests, and stories
- In-app notification center with read/unread status
- Badge counts on app icon and profile tab
- Real-time updates using Firestore

## Setup Requirements

1. **Firebase Project Setup**:
   - Make sure your Firebase project has Cloud Messaging enabled
   - Add the server key to your app configuration

2. **Expo Configuration**:
   - The app uses `expo-notifications` for handling push notifications
   - Notification icon should be placed at `./assets/notification-icon.png`
   - For custom notification sounds, add sound files to the `./assets/` directory and update the `app.json` configuration

## Usage

### Sending Notifications

The app uses the `NotificationHelper` utility class to send notifications for different events:

```javascript
// Send a message notification
await NotificationHelper.sendMessageNotification(
  senderId, 
  recipientId, 
  messageText,
  chatId
);

// Send a friend request notification
await NotificationHelper.sendFriendRequestNotification(
  senderId, 
  recipientId
);

// Send a story notification to multiple recipients
await NotificationHelper.sendStoryNotification(
  senderId,
  recipientIds,
  storyId
);

// Send a friend accepted notification
await NotificationHelper.sendFriendAcceptedNotification(
  senderId, 
  recipientId
);
```

### Notification Context

The app uses a React Context (`NotificationContext`) to manage notifications throughout the app. To access notification data and functions:

```javascript
import { useNotification } from '../contexts/NotificationContext';

function MyComponent() {
  const { 
    notifications, 
    unreadCount, 
    markNotificationAsRead,
    markAllNotificationsAsRead,
    sendNotification 
  } = useNotification();
  
  // Use notification data and functions
}
```

### Notification Service

The `NotificationService` class handles device-specific notification functionality:

- Registering for push notifications
- Managing notification permissions
- Handling notification interactions
- Setting badge counts

## Testing Notifications

To test notifications locally:

1. Use the Expo development client, which supports push notifications
2. For testing without a server, use local notifications:

```javascript
import * as Notifications from 'expo-notifications';

// Schedule a local notification
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Test Notification",
    body: "This is a test notification",
    data: { type: 'test' },
  },
  trigger: null, // Show immediately
});
```

## Production Deployment

For production deployment, you'll need:

1. A server component to send push notifications using Firebase Admin SDK
2. Proper error handling for notification failures
3. Rate limiting to prevent notification spam

## Troubleshooting

Common issues:

- **Notifications not showing**: Check device permissions and notification settings
- **Badge counts not updating**: Make sure the badge count is properly updated in both local state and with the Notifications API
- **Missing notifications**: Check Firestore security rules to ensure proper access to notification collections

## Future Improvements

Potential enhancements:

- Notification grouping for multiple messages from the same sender
- Custom notification sounds for different notification types
- Notification preferences to allow users to customize which notifications they receive
- Rich notifications with images and action buttons 