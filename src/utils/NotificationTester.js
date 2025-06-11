/**
 * NotificationTester.js
 * 
 * A utility class for testing notifications in the app.
 * This is primarily used by the TestNotificationsScreen.
 */

import * as Notifications from 'expo-notifications';
import NotificationService from '../services/NotificationService';
import NotificationHelper from './NotificationHelper';

export default class NotificationTester {
  /**
   * Send a generic test notification
   * @returns {Promise<string>} The notification ID
   */
  static async sendTestNotification() {
    return NotificationHelper.sendTestNotification(
      'Test Notification',
      'This is a test notification from SnapClone'
    );
  }

  /**
   * Send a test message notification
   * @returns {Promise<string>} The notification ID
   */
  static async sendTestMessageNotification() {
    const mockSenderId = 'test-user-id';
    const mockReceiverId = 'current-user-id';
    const mockMessage = 'Hey! This is a test message notification.';
    const mockChatId = 'test-chat-id';

    try {
      await NotificationHelper.sendMessageNotification(
        mockSenderId,
        mockReceiverId,
        mockMessage,
        mockChatId
      );
      return 'test-message-notification';
    } catch (error) {
      console.error('Error sending test message notification:', error);
      throw error;
    }
  }

  /**
   * Send a test friend request notification
   * @returns {Promise<string>} The notification ID
   */
  static async sendTestFriendRequestNotification() {
    const mockSenderId = 'test-user-id';
    const mockReceiverId = 'current-user-id';

    try {
      await NotificationHelper.sendFriendRequestNotification(
        mockSenderId,
        mockReceiverId
      );
      return 'test-friend-request-notification';
    } catch (error) {
      console.error('Error sending test friend request notification:', error);
      throw error;
    }
  }

  /**
   * Send a test story notification
   * @returns {Promise<string>} The notification ID
   */
  static async sendTestStoryNotification() {
    const mockSenderId = 'test-user-id';
    const mockStoryId = 'test-story-id';
    const mockReceiverIds = ['current-user-id'];

    try {
      await NotificationHelper.sendStoryNotification(
        mockSenderId,
        mockStoryId,
        mockReceiverIds
      );
      return 'test-story-notification';
    } catch (error) {
      console.error('Error sending test story notification:', error);
      throw error;
    }
  }

  /**
   * Cancel a specific notification
   * @param {string} notificationId - The ID of the notification to cancel
   */
  static async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
      throw error;
    }
  }

  /**
   * Cancel all pending notifications
   */
  static async cancelAllNotifications() {
    try {
      await NotificationService.cancelAllNotifications();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
      throw error;
    }
  }

  /**
   * Get all pending notifications
   * @returns {Promise<Array>} Array of pending notifications
   */
  static async getPendingNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting pending notifications:', error);
      throw error;
    }
  }

  /**
   * Set the badge count
   * @param {number} count - The badge count to set
   */
  static async setBadgeCount(count) {
    try {
      await NotificationService.setBadgeCount(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
      throw error;
    }
  }

  /**
   * Get the current badge count
   * @returns {Promise<number>} The current badge count
   */
  static async getBadgeCount() {
    try {
      return await NotificationService.getBadgeCount();
    } catch (error) {
      console.error('Error getting badge count:', error);
      throw error;
    }
  }
} 