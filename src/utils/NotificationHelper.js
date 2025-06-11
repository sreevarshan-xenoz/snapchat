/**
 * NotificationHelper.js
 * 
 * A utility class to help send different types of notifications in the app.
 * This centralizes notification creation logic and ensures consistent formatting.
 */

import NotificationService from '../services/NotificationService';
import { getFirebaseDb } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default class NotificationHelper {
  /**
   * Send a message notification
   * @param {string} senderId - The ID of the user sending the message
   * @param {string} receiverId - The ID of the user receiving the message
   * @param {string} message - The message content
   * @param {string} chatId - The ID of the chat
   */
  static async sendMessageNotification(senderId, receiverId, message, chatId) {
    try {
      // Get sender information
      const db = getFirebaseDb();
      const senderDoc = await getDoc(doc(db, 'users', senderId));
      
      if (!senderDoc.exists()) {
        console.error('Sender not found');
        return;
      }
      
      const senderData = senderDoc.data();
      const senderName = senderData.displayName || senderData.username || 'Someone';
      
      // Create notification
      const title = `${senderName} sent you a message`;
      let body = message;
      
      // Truncate message if too long
      if (body.length > 100) {
        body = body.substring(0, 97) + '...';
      }
      
      // Add data for deep linking
      const data = {
        type: 'message',
        senderId,
        chatId,
        timestamp: new Date().toISOString()
      };
      
      await NotificationService.scheduleLocalNotification(title, body, data);
    } catch (error) {
      console.error('Error sending message notification:', error);
    }
  }
  
  /**
   * Send a friend request notification
   * @param {string} senderId - The ID of the user sending the request
   * @param {string} receiverId - The ID of the user receiving the request
   */
  static async sendFriendRequestNotification(senderId, receiverId) {
    try {
      // Get sender information
      const db = getFirebaseDb();
      const senderDoc = await getDoc(doc(db, 'users', senderId));
      
      if (!senderDoc.exists()) {
        console.error('Sender not found');
        return;
      }
      
      const senderData = senderDoc.data();
      const senderName = senderData.displayName || senderData.username || 'Someone';
      
      // Create notification
      const title = 'New Friend Request';
      const body = `${senderName} wants to add you as a friend`;
      
      // Add data for deep linking
      const data = {
        type: 'friendRequest',
        senderId,
        timestamp: new Date().toISOString()
      };
      
      await NotificationService.scheduleLocalNotification(title, body, data);
    } catch (error) {
      console.error('Error sending friend request notification:', error);
    }
  }
  
  /**
   * Send a story notification
   * @param {string} senderId - The ID of the user who posted the story
   * @param {string} storyId - The ID of the story
   * @param {Array<string>} receiverIds - Array of user IDs to notify
   */
  static async sendStoryNotification(senderId, storyId, receiverIds = []) {
    try {
      // Get sender information
      const db = getFirebaseDb();
      const senderDoc = await getDoc(doc(db, 'users', senderId));
      
      if (!senderDoc.exists()) {
        console.error('Sender not found');
        return;
      }
      
      const senderData = senderDoc.data();
      const senderName = senderData.displayName || senderData.username || 'Someone';
      
      // Create notification
      const title = 'New Story';
      const body = `${senderName} added a new story`;
      
      // Add data for deep linking
      const data = {
        type: 'story',
        senderId,
        storyId,
        timestamp: new Date().toISOString()
      };
      
      await NotificationService.scheduleLocalNotification(title, body, data);
    } catch (error) {
      console.error('Error sending story notification:', error);
    }
  }
  
  /**
   * Send a generic test notification
   * @param {string} title - The notification title
   * @param {string} body - The notification body
   * @returns {Promise<string>} The notification ID
   */
  static async sendTestNotification(title = 'Test Notification', body = 'This is a test notification') {
    try {
      const data = {
        type: 'test',
        timestamp: new Date().toISOString()
      };
      
      const notificationId = await NotificationService.scheduleLocalNotification(title, body, data);
      return notificationId;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return null;
    }
  }
} 