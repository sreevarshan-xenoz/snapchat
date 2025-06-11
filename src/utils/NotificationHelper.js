import { getFirebaseDb } from '../config/firebase';
import { collection, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';

class NotificationHelper {
  // Send a message notification
  static async sendMessageNotification(senderId, recipientId, message, chatId) {
    try {
      const db = getFirebaseDb();
      
      // Get sender info
      const senderDoc = await getDoc(doc(db, 'users', senderId));
      const senderData = senderDoc.exists() ? senderDoc.data() : {};
      const senderName = senderData.username || senderData.displayName || 'Someone';
      
      // Create notification
      await addDoc(collection(db, 'users', recipientId, 'notifications'), {
        title: `New message from ${senderName}`,
        body: message.length > 50 ? message.substring(0, 50) + '...' : message,
        data: {
          type: 'message',
          chatId: chatId,
          senderId: senderId,
        },
        read: false,
        createdAt: Timestamp.now(),
        senderId: senderId,
      });
      
      console.log(`Message notification sent to ${recipientId}`);
    } catch (error) {
      console.error('Error sending message notification:', error);
    }
  }
  
  // Send a friend request notification
  static async sendFriendRequestNotification(senderId, recipientId) {
    try {
      const db = getFirebaseDb();
      
      // Get sender info
      const senderDoc = await getDoc(doc(db, 'users', senderId));
      const senderData = senderDoc.exists() ? senderDoc.data() : {};
      const senderName = senderData.username || senderData.displayName || 'Someone';
      
      // Create notification
      await addDoc(collection(db, 'users', recipientId, 'notifications'), {
        title: 'New Friend Request',
        body: `${senderName} wants to add you as a friend`,
        data: {
          type: 'friendRequest',
          senderId: senderId,
        },
        read: false,
        createdAt: Timestamp.now(),
        senderId: senderId,
      });
      
      console.log(`Friend request notification sent to ${recipientId}`);
    } catch (error) {
      console.error('Error sending friend request notification:', error);
    }
  }
  
  // Send a story notification
  static async sendStoryNotification(senderId, recipientIds, storyId) {
    try {
      const db = getFirebaseDb();
      
      // Get sender info
      const senderDoc = await getDoc(doc(db, 'users', senderId));
      const senderData = senderDoc.exists() ? senderDoc.data() : {};
      const senderName = senderData.username || senderData.displayName || 'Someone';
      
      // Create a batch to add all notifications
      const batch = db.batch();
      
      // Create notifications for each recipient
      for (const recipientId of recipientIds) {
        if (recipientId !== senderId) { // Don't send notification to self
          const notificationRef = doc(collection(db, 'users', recipientId, 'notifications'));
          batch.set(notificationRef, {
            title: 'New Story',
            body: `${senderName} added a new story`,
            data: {
              type: 'story',
              storyId: storyId,
              senderId: senderId,
            },
            read: false,
            createdAt: Timestamp.now(),
            senderId: senderId,
          });
        }
      }
      
      // Commit the batch
      await batch.commit();
      
      console.log(`Story notifications sent to ${recipientIds.length} recipients`);
    } catch (error) {
      console.error('Error sending story notifications:', error);
    }
  }
  
  // Send a friend accepted notification
  static async sendFriendAcceptedNotification(senderId, recipientId) {
    try {
      const db = getFirebaseDb();
      
      // Get sender info
      const senderDoc = await getDoc(doc(db, 'users', senderId));
      const senderData = senderDoc.exists() ? senderDoc.data() : {};
      const senderName = senderData.username || senderData.displayName || 'Someone';
      
      // Create notification
      await addDoc(collection(db, 'users', recipientId, 'notifications'), {
        title: 'Friend Request Accepted',
        body: `${senderName} accepted your friend request`,
        data: {
          type: 'friendAccepted',
          senderId: senderId,
        },
        read: false,
        createdAt: Timestamp.now(),
        senderId: senderId,
      });
      
      console.log(`Friend accepted notification sent to ${recipientId}`);
    } catch (error) {
      console.error('Error sending friend accepted notification:', error);
    }
  }
}

export default NotificationHelper; 