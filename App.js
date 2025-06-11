import React, { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeFirebase } from './src/config/firebase';
import { LogBox } from 'react-native';
import { NotificationProvider } from './src/contexts/NotificationContext';
import * as Notifications from 'expo-notifications';

// Configure notifications to show alerts when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Ignore specific warnings
LogBox.ignoreLogs([
  'Setting a timer',
  'AsyncStorage has been extracted from react-native',
]);

export default function App() {
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false);
  const navigationRef = useRef(null);
  const notificationResponseListener = useRef();

  useEffect(() => {
    const initFirebase = async () => {
      await initializeFirebase();
      setIsFirebaseInitialized(true);
    };

    initFirebase();
  }, []);

  useEffect(() => {
    // Set up notification response listener at the app level
    notificationResponseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        
        if (!navigationRef.current) return;
        
        // Handle navigation based on notification type
        if (data.type === 'message' && data.chatId) {
          navigationRef.current.navigate('ChatDetail', { chatId: data.chatId });
        } else if (data.type === 'friendRequest') {
          navigationRef.current.navigate('FriendRequests');
        } else if (data.type === 'story' && data.storyId) {
          navigationRef.current.navigate('StoryView', { storyId: data.storyId });
        }
      }
    );

    return () => {
      if (notificationResponseListener.current) {
        Notifications.removeNotificationSubscription(notificationResponseListener.current);
      }
    };
  }, []);

  if (!isFirebaseInitialized) {
    return null; // Or a loading screen
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <NotificationProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </NotificationProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
} 