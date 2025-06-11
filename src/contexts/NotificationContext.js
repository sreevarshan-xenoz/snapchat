import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getFirebaseDb } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  arrayUnion, 
  Timestamp, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import NotificationService from '../services/NotificationService';

export const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationReceivedListener = useRef();
  const notificationResponseListener = useRef();

  useEffect(() => {
    if (user) {
      // Register for push notifications
      registerForPushNotifications();
      
      // Set up notification listeners
      setupNotificationListeners();
      
      // Fetch notifications from Firestore
      fetchNotifications();

      // Clean up on unmount
      return () => {
        if (notificationReceivedListener.current) {
          NotificationService.removeNotificationSubscription(notificationReceivedListener.current);
        }
        if (notificationResponseListener.current) {
          NotificationService.removeNotificationSubscription(notificationResponseListener.current);
        }
      };
    }
  }, [user]);

  const registerForPushNotifications = async () => {
    if (user) {
      await NotificationService.registerForPushNotifications(user.uid);
    }
  };

  const setupNotificationListeners = () => {
    // When a notification is received while the app is in the foreground
    notificationReceivedListener.current = NotificationService.addNotificationReceivedListener(
      handleNotificationReceived
    );

    // When a user taps on a notification (app was in the background)
    notificationResponseListener.current = NotificationService.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );
  };

  const handleNotificationReceived = (notification) => {
    const { data } = notification.request.content;
    console.log('Notification received in foreground:', data);
    
    // Update badge count
    updateBadgeCount();
  };

  const handleNotificationResponse = (response) => {
    const { data } = response.notification.request.content;
    console.log('Notification response:', data);
    
    // Handle navigation based on notification type
    if (data.type === 'message') {
      // Navigate to chat detail
      // This will be handled by the component that uses this context
    } else if (data.type === 'friendRequest') {
      // Navigate to friend requests
    } else if (data.type === 'story') {
      // Navigate to story view
    }
  };

  const fetchNotifications = () => {
    if (!user) return;

    try {
      const db = getFirebaseDb();
      const notificationsRef = collection(db, 'users', user.uid, 'notifications');
      const notificationsQuery = query(
        notificationsRef,
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
        const notificationsList = [];
        let unread = 0;

        snapshot.forEach((doc) => {
          const notification = {
            id: doc.id,
            ...doc.data(),
          };
          
          notificationsList.push(notification);
          
          if (!notification.read) {
            unread++;
          }
        });

        setNotifications(notificationsList);
        setUnreadCount(unread);
        
        // Update badge count
        NotificationService.setBadgeCount(unread);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const updateBadgeCount = async () => {
    try {
      const count = await NotificationService.getBadgeCount();
      NotificationService.setBadgeCount(count + 1);
    } catch (error) {
      console.error('Error updating badge count:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    if (!user || !notificationId) return;

    try {
      const db = getFirebaseDb();
      await updateDoc(doc(db, 'users', user.uid, 'notifications', notificationId), {
        read: true,
        readAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!user) return;

    try {
      const db = getFirebaseDb();
      const batch = db.batch();
      
      notifications.forEach((notification) => {
        if (!notification.read) {
          const notificationRef = doc(db, 'users', user.uid, 'notifications', notification.id);
          batch.update(notificationRef, {
            read: true,
            readAt: Timestamp.now(),
          });
        }
      });
      
      await batch.commit();
      
      // Reset badge count
      NotificationService.setBadgeCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const sendNotification = async (recipientId, title, body, data = {}) => {
    if (!recipientId) return;

    try {
      const db = getFirebaseDb();
      
      // Add notification to recipient's notifications collection
      await addDoc(collection(db, 'users', recipientId, 'notifications'), {
        title,
        body,
        data,
        read: false,
        createdAt: Timestamp.now(),
        senderId: user ? user.uid : null,
      });
      
      // In a real app, you would call a server endpoint to send a push notification
      // For this example, we'll just log that we would send a push notification
      console.log(`Push notification would be sent to ${recipientId}`);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    sendNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 