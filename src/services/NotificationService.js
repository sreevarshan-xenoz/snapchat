import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirebaseDb } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default class NotificationService {
  static async registerForPushNotifications(userId) {
    if (!Device.isDevice) {
      console.log('Push notifications are not available in the simulator');
      return null;
    }

    try {
      // Request permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission for push notifications was denied');
        return null;
      }

      // Get push token
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      
      // Save token to local storage
      await AsyncStorage.setItem('pushToken', token);
      
      // Save token to Firestore if userId is provided
      if (userId) {
        await this.savePushTokenToFirestore(userId, token);
      }

      // Configure notification settings for Android
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FFFC00',
        });
      }

      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  static async savePushTokenToFirestore(userId, token) {
    try {
      const db = getFirebaseDb();
      await updateDoc(doc(db, 'users', userId), {
        pushToken: token,
        deviceType: Platform.OS,
      });
      console.log('Push token saved to Firestore');
    } catch (error) {
      console.error('Error saving push token to Firestore:', error);
    }
  }

  static async scheduleLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          badge: 1,
        },
        trigger: null, // Immediate notification
      });
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  }

  static async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  static async getBadgeCount() {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  static async setBadgeCount(count) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  static addNotificationReceivedListener(callback) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  static addNotificationResponseReceivedListener(callback) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  static removeNotificationSubscription(subscription) {
    Notifications.removeNotificationSubscription(subscription);
  }
} 