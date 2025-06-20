import React from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '../contexts/NotificationContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main Screens
import CameraScreen from '../screens/main/CameraScreen';
import ChatScreen from '../screens/main/ChatScreen';
import StoriesScreen from '../screens/main/StoriesScreen';
import MapScreen from '../screens/main/MapScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Chat Screens
import ChatDetailScreen from '../screens/chat/ChatDetailScreen';
import CreateGroupChatScreen from '../screens/chat/CreateGroupChatScreen';

// Story Screens
import StoryViewScreen from '../screens/story/StoryViewScreen';
import CreateStoryScreen from '../screens/story/CreateStoryScreen';

// Profile Screens
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import FriendsScreen from '../screens/profile/FriendsScreen';
import FriendRequestsScreen from '../screens/profile/FriendRequestsScreen';

// Notifications Screen
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import TestNotificationsScreen from '../screens/notifications/TestNotificationsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

const ChatNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000',
        },
        headerTintColor: '#FFFC00',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{ title: 'Chats' }}
      />
      <Stack.Screen
        name="ChatDetail"
        component={ChatDetailScreen}
        options={({ route }) => ({
          title: route.params.isGroupChat ? route.params.groupName : route.params.recipientName,
        })}
      />
      <Stack.Screen
        name="CreateGroupChat"
        component={CreateGroupChatScreen}
        options={{ title: 'Create Group Chat' }}
      />
    </Stack.Navigator>
  );
};

const StoryNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Stories" component={StoriesScreen} />
      <Stack.Screen name="StoryView" component={StoryViewScreen} />
      <Stack.Screen name="CreateStory" component={CreateStoryScreen} />
    </Stack.Navigator>
  );
};

const ProfileNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MyProfile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen name="FriendRequests" component={FriendRequestsScreen} options={{ title: 'Friend Requests' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="TestNotifications" component={TestNotificationsScreen} options={{ title: 'Test Notifications' }} />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  const { unreadCount } = useNotification();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Camera') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Stories') {
            iconName = focused ? 'images' : 'images-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View>
              <Ionicons name={iconName} size={size} color={color} />
              {route.name === 'Profile' && unreadCount > 0 && (
                <View style={{
                  position: 'absolute',
                  right: -6,
                  top: -3,
                  backgroundColor: '#FF3B30',
                  borderRadius: 9,
                  width: 18,
                  height: 18,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          );
        },
        tabBarActiveTintColor: '#FFFC00',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: '#333',
        },
        headerStyle: {
          backgroundColor: '#000',
        },
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Chat" component={ChatNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Stories" component={StoryNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Profile" component={ProfileNavigator} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator; 