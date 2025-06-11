# SnapClone Notification System

This document provides detailed information about the notification system implemented in the SnapClone application.

## Overview

The notification system in SnapClone provides users with real-time updates about important events in the app, such as:
- New messages
- Friend requests
- New stories from friends
- Friend request acceptances

The system supports both local notifications (displayed on the device) and push notifications (delivered through Expo's push notification service).

## Architecture

The notification system consists of several key components:

### 1. NotificationService

Located at `src/services/NotificationService.js`, this is the core service that handles:
- Registration for push notifications
- Scheduling local notifications
- Managing notification permissions
- Handling notification badges
- Setting up notification listeners

### 2. NotificationHelper

Located at `src/utils/NotificationHelper.js`, this utility class provides methods for sending different types of notifications:
- Message notifications
- Friend request notifications
- Story notifications
- Test notifications

### 3. NotificationTester

Located at `src/utils/NotificationTester.js`, this utility is used for testing the notification system during development:
- Sending test notifications of various types
- Managing notification lifecycle (cancellation, retrieval)
- Setting badge counts

### 4. TestNotificationsScreen

Located at `src/screens/notifications/TestNotificationsScreen.js`, this screen provides a UI for testing the notification system:
- Buttons for sending different types of test notifications
- Controls for managing notifications
- Badge count controls

## Configuration

The notification system is configured in several places:

### app.json

The `app.json` file contains Expo-specific configuration for notifications:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.svg",
          "color": "#FFFC00",
          "sounds": [],
          "androidMode": "default",
          "androidCollapsedTitle": "#{unread_notifications} new notifications",
          "iosDisplayInForeground": true
        }
      ]
    ],
    "notification": {
      "icon": "./assets/notification-icon.svg",
      "color": "#FFFC00",
      "androidMode": "default",
      "androidCollapsedTitle": "#{unread_notifications} new notifications",
      "iosDisplayInForeground": true
    }
  }
}
```

### NotificationService.js

The `NotificationService.js` file configures how notifications are handled:

```javascript
// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
```

## Usage

### Registering for Push Notifications

To register a user for push notifications:

```javascript
import NotificationService from '../services/NotificationService';

// When user logs in
const userId = 'user-123';
const token = await NotificationService.registerForPushNotifications(userId);
```

### Sending a Notification

To send a notification:

```javascript
import NotificationHelper from '../utils/NotificationHelper';

// Send a message notification
await NotificationHelper.sendMessageNotification(
  senderId,
  receiverId,
  messageText,
  chatId
);

// Send a friend request notification
await NotificationHelper.sendFriendRequestNotification(
  senderId,
  receiverId
);

// Send a story notification
await NotificationHelper.sendStoryNotification(
  senderId,
  storyId,
  receiverIds
);
```

### Handling Notification Interactions

To handle when a user taps on a notification:

```javascript
import NotificationService from '../services/NotificationService';

// In your App.js or a context provider
const responseListener = NotificationService.addNotificationResponseReceivedListener(
  (response) => {
    const data = response.notification.request.content.data;
    
    // Handle different notification types
    switch (data.type) {
      case 'message':
        // Navigate to chat
        navigation.navigate('Chat', { chatId: data.chatId });
        break;
      case 'friendRequest':
        // Navigate to friend requests screen
        navigation.navigate('FriendRequests');
        break;
      case 'story':
        // Navigate to story view
        navigation.navigate('StoryView', { storyId: data.storyId });
        break;
    }
  }
);

// Clean up when component unmounts
return () => {
  NotificationService.removeNotificationSubscription(responseListener);
};
```

## Notification Icons

The notification system uses a custom SVG icon located at `assets/notification-icon.svg`. For production use, this should be converted to PNG files at different resolutions for Android:

- mdpi: 24x24 px
- hdpi: 36x36 px
- xhdpi: 48x48 px
- xxhdpi: 72x72 px
- xxxhdpi: 96x96 px

These files should be placed in the appropriate Android resource directories.

## Testing

The TestNotificationsScreen provides a comprehensive UI for testing all aspects of the notification system:

1. Navigate to the Profile screen
2. Tap on "Test Notifications"
3. Use the provided buttons to test different notification types and features

## Troubleshooting

### Common Issues

1. **Notifications not appearing on Android**
   - Check that the notification channel is properly configured
   - Verify that the app has notification permissions

2. **Notifications not appearing on iOS**
   - Verify that the user has granted notification permissions
   - Check that the app is correctly registered for push notifications

3. **Badge counts not updating**
   - Some devices may not support badge counts
   - Ensure the app has the appropriate permissions

### Debugging

To debug notification issues:

1. Check the console logs for error messages
2. Use the TestNotificationsScreen to verify basic functionality
3. Verify that the device token is being correctly saved to Firestore

## Future Enhancements

Planned improvements for the notification system:

1. **Server-side components**:
   - Implement Firebase Cloud Functions to send push notifications
   - Add notification grouping and categorization

2. **Enhanced notification types**:
   - Location sharing notifications
   - Birthday reminders
   - Streak notifications

3. **User preferences**:
   - Allow users to customize which notifications they receive
   - Support for quiet hours and do-not-disturb settings

## Resources

- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Android Notification Channels](https://developer.android.com/develop/ui/views/notifications/channels) 