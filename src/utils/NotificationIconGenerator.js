/**
 * NotificationIconGenerator.js
 * 
 * This utility provides guidance on generating notification icons for different Android device densities.
 * For production use, you should generate PNG files at the following sizes:
 * 
 * - mdpi: 24x24 px
 * - hdpi: 36x36 px
 * - xhdpi: 48x48 px
 * - xxhdpi: 72x72 px
 * - xxxhdpi: 96x96 px
 * 
 * These files should be placed in the appropriate directories:
 * - android/app/src/main/res/drawable-mdpi/notification_icon.png
 * - android/app/src/main/res/drawable-hdpi/notification_icon.png
 * - android/app/src/main/res/drawable-xhdpi/notification_icon.png
 * - android/app/src/main/res/drawable-xxhdpi/notification_icon.png
 * - android/app/src/main/res/drawable-xxxhdpi/notification_icon.png
 * 
 * For iOS, you'll need to configure the notification icon in your app.json:
 * {
 *   "expo": {
 *     "notification": {
 *       "icon": "./assets/notification-icon.png",
 *       "color": "#FFFFFF",
 *       "androidMode": "default",
 *       "androidCollapsedTitle": "#{unread_notifications} new notifications",
 *       "iosDisplayInForeground": true
 *     }
 *   }
 * }
 */

import { Platform } from 'react-native';

/**
 * Returns the appropriate notification icon path based on the platform
 * @returns {string} Path to the notification icon
 */
export const getNotificationIcon = () => {
  if (Platform.OS === 'android') {
    return 'notification_icon';
  }
  return require('../../assets/notification-icon.png');
};

/**
 * Helper to determine if the device supports notification icons
 * @returns {boolean} Whether the device supports notification icons
 */
export const supportsNotificationIcon = () => {
  return Platform.OS === 'android' || Platform.OS === 'ios';
};

export default {
  getNotificationIcon,
  supportsNotificationIcon
}; 