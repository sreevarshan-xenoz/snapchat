/**
 * NotificationHelper.js
 * 
 * A utility class to help send different types of notifications in the app.
 * This centralizes notification creation logic and ensures consistent formatting.
 */

import NotificationService from '../services/NotificationService';
import { getFirebaseDb } from '../config/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { sendPushNotification } from '../services/PushNotificationService';

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

  /**
   * Sends a notification for a group chat invite
   * @param {string} senderId - The ID of the user who created the group
   * @param {string} recipientId - The ID of the user being invited to the group
   * @param {string} groupName - The name of the group
   * @param {string} groupId - The ID of the group chat
   * @returns {Promise<void>}
   */
  static async sendGroupInviteNotification(senderId, recipientId, groupName, groupId) {
    try {
      // Get sender info
      const db = getFirebaseDb();
      const senderDoc = await getDoc(doc(db, 'users', senderId));
      const senderData = senderDoc.data();
      
      // Create notification data
      const notificationData = {
        type: 'group_invite',
        title: 'Group Chat Invite',
        body: `${senderData.displayName || senderData.username} added you to "${groupName}"`,
        data: {
          groupId,
          groupName,
          senderId,
          senderName: senderData.displayName || senderData.username,
        },
        timestamp: serverTimestamp(),
        read: false,
      };
      
      // Add notification to recipient's notifications collection
      await addDoc(collection(db, 'users', recipientId, 'notifications'), notificationData);
      
      // Send push notification if the user has a device token
      const recipientDoc = await getDoc(doc(db, 'users', recipientId));
      const recipientData = recipientDoc.data();
      
      if (recipientData.deviceToken) {
        await sendPushNotification({
          to: recipientData.deviceToken,
          title: 'Group Chat Invite',
          body: `${senderData.displayName || senderData.username} added you to "${groupName}"`,
          data: {
            type: 'group_invite',
            groupId,
            groupName,
            senderId,
          },
        });
      }
    } catch (error) {
      console.error('Error sending group invite notification:', error);
    }
  }

  /**
   * Sends a notification for a new group message
   * @param {string} senderId - The ID of the user who sent the message
   * @param {string} groupId - The ID of the group chat
   * @param {string} groupName - The name of the group
   * @param {string} messageText - The text of the message
   * @param {Array<string>} participantIds - Array of participant IDs to notify
   * @returns {Promise<void>}
   */
  static async sendGroupMessageNotification(senderId, groupId, groupName, messageText, participantIds) {
    try {
      // Get sender info
      const db = getFirebaseDb();
      const senderDoc = await getDoc(doc(db, 'users', senderId));
      const senderData = senderDoc.data();
      
      // Create notification data
      const notificationData = {
        type: 'group_message',
        title: groupName,
        body: `${senderData.displayName || senderData.username}: ${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}`,
        data: {
          groupId,
          groupName,
          senderId,
          senderName: senderData.displayName || senderData.username,
        },
        timestamp: serverTimestamp(),
        read: false,
      };
      
      // Send notifications to all participants except the sender
      const recipients = participantIds.filter(id => id !== senderId);
      
      for (const recipientId of recipients) {
        // Add notification to recipient's notifications collection
        await addDoc(collection(db, 'users', recipientId, 'notifications'), notificationData);
        
        // Send push notification if the user has a device token
        const recipientDoc = await getDoc(doc(db, 'users', recipientId));
        const recipientData = recipientDoc.data();
        
        if (recipientData.deviceToken) {
          await sendPushNotification({
            to: recipientData.deviceToken,
            title: groupName,
            body: `${senderData.displayName || senderData.username}: ${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}`,
            data: {
              type: 'group_message',
              groupId,
              groupName,
              senderId,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error sending group message notification:', error);
    }
  }
} 