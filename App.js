import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeFirebase } from './src/config/firebase';
import { LogBox } from 'react-native';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Setting a timer',
  'AsyncStorage has been extracted from react-native',
]);

export default function App() {
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false);

  useEffect(() => {
    const initFirebase = async () => {
      await initializeFirebase();
      setIsFirebaseInitialized(true);
    };

    initFirebase();
  }, []);

  if (!isFirebaseInitialized) {
    return null; // Or a loading screen
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
} 