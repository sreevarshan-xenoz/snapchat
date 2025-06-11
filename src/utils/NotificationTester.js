import * as Notifications from 'expo-notifications';

class NotificationTester {
  /**
   * Send a test local notification
   * @param {string} title - The notification title
   * @param {string} body - The notification body
   * @param {Object} data - Additional data to include with the notification
   * @returns {Promise<string>} - The notification identifier
   */
  static async sendTestNotification(title = 'Test Notification', body = 'This is a test notification', data = {}) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { ...data, test: true },
        },
        trigger: null, // Show immediately
      });
      
      console.log(`Test notification sent with ID: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }

  /**
   * Send a test message notification
   * @returns {Promise<string>} - The notification identifier
   */
  static async sendTestMessageNotification() {
    return this.sendTestNotification(
      'New Message',
      'John Doe: Hey, how are you?',
      { type: 'message', chatId: 'test-chat-id', senderId: 'test-sender-id' }
    );
  }

  /**
   * Send a test friend request notification
   * @returns {Promise<string>} - The notification identifier
   */
  static async sendTestFriendRequestNotification() {
    return this.sendTestNotification(
      'New Friend Request',
      'Jane Smith wants to add you as a friend',
      { type: 'friendRequest', senderId: 'test-sender-id' }
    );
  }

  /**
   * Send a test story notification
   * @returns {Promise<string>} - The notification identifier
   */
  static async sendTestStoryNotification() {
    return this.sendTestNotification(
      'New Story',
      'Mike Johnson added a new story',
      { type: 'story', storyId: 'test-story-id', senderId: 'test-sender-id' }
    );
  }

  /**
   * Cancel a specific notification
   * @param {string} notificationId - The ID of the notification to cancel
   */
  static async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`Notification with ID ${notificationId} canceled`);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  /**
   * Cancel all pending notifications
   */
  static async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications canceled');
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  /**
   * Get all pending notification requests
   * @returns {Promise<Array>} - Array of notification requests
   */
  static async getPendingNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`Found ${notifications.length} pending notifications`);
      return notifications;
    } catch (error) {
      console.error('Error getting pending notifications:', error);
      return [];
    }
  }

  /**
   * Set the app badge count
   * @param {number} count - The badge count to set
   */
  static async setBadgeCount(count) {
    try {
      await Notifications.setBadgeCountAsync(count);
      console.log(`Badge count set to ${count}`);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }
}

export default NotificationTester; 