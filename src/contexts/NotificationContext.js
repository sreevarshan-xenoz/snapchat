import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useSelector } from 'react-redux';
import NotificationService from '../services/NotificationService';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  
  const user = useSelector(state => state.auth.user);
  
  // Register for push notifications when user logs in
  useEffect(() => {
    if (user && !isRegistered) {
      registerForPushNotifications();
    }
  }, [user, isRegistered]);
  
  // Set up notification listeners
  useEffect(() => {
    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = NotificationService.addNotificationReceivedListener(
      notification => {
        const notificationData = notification.request.content;
        addNotification({
          id: notification.request.identifier,
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data,
          read: false,
          createdAt: new Date(),
        });
      }
    );

    // This listener is fired whenever a user taps on or interacts with a notification
    responseListener.current = NotificationService.addNotificationResponseReceivedListener(
      response => {
        const notificationData = response.notification.request.content;
        markNotificationAsRead(response.notification.request.identifier);
        handleNotificationResponse(notificationData.data);
      }
    );

    // Clean up listeners on unmount
    return () => {
      if (notificationListener.current) {
        NotificationService.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        NotificationService.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Register for push notifications
  const registerForPushNotifications = async () => {
    try {
      if (user && user.uid) {
        const token = await NotificationService.registerForPushNotifications(user.uid);
        if (token) {
          setIsRegistered(true);
          console.log('Push notification registration successful');
        }
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  // Add a notification to the list
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Update badge count
    NotificationService.setBadgeCount(unreadCount + 1);
  };

  // Mark a notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    // Update unread count
    const updatedUnreadCount = Math.max(0, unreadCount - 1);
    setUnreadCount(updatedUnreadCount);
    
    // Update badge count
    NotificationService.setBadgeCount(updatedUnreadCount);
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    
    // Reset unread count and badge
    setUnreadCount(0);
    NotificationService.setBadgeCount(0);
  };

  // Handle notification response based on type
  const handleNotificationResponse = (data) => {
    // This function will be expanded to navigate to the appropriate screen
    // based on the notification type (message, friend request, story, etc.)
    console.log('Handling notification response:', data);
    
    // Example navigation logic would go here
    // if (data.type === 'message' && navigation) {
    //   navigation.navigate('Chat', { chatId: data.chatId });
    // }
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 