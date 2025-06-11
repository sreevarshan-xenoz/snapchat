import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import NotificationTester from '../../utils/NotificationTester';

const TestNotificationsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [lastNotificationId, setLastNotificationId] = useState(null);

  const handleSendTestNotification = async () => {
    try {
      setLoading(true);
      const notificationId = await NotificationTester.sendTestNotification();
      setLastNotificationId(notificationId);
      setLoading(false);
      Alert.alert('Success', 'Test notification sent successfully');
    } catch (error) {
      console.error('Error sending test notification:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const handleSendMessageNotification = async () => {
    try {
      setLoading(true);
      const notificationId = await NotificationTester.sendTestMessageNotification();
      setLastNotificationId(notificationId);
      setLoading(false);
      Alert.alert('Success', 'Message notification sent successfully');
    } catch (error) {
      console.error('Error sending message notification:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to send message notification');
    }
  };

  const handleSendFriendRequestNotification = async () => {
    try {
      setLoading(true);
      const notificationId = await NotificationTester.sendTestFriendRequestNotification();
      setLastNotificationId(notificationId);
      setLoading(false);
      Alert.alert('Success', 'Friend request notification sent successfully');
    } catch (error) {
      console.error('Error sending friend request notification:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to send friend request notification');
    }
  };

  const handleSendStoryNotification = async () => {
    try {
      setLoading(true);
      const notificationId = await NotificationTester.sendTestStoryNotification();
      setLastNotificationId(notificationId);
      setLoading(false);
      Alert.alert('Success', 'Story notification sent successfully');
    } catch (error) {
      console.error('Error sending story notification:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to send story notification');
    }
  };

  const handleCancelNotification = async () => {
    if (!lastNotificationId) {
      Alert.alert('Error', 'No notification to cancel');
      return;
    }

    try {
      setLoading(true);
      await NotificationTester.cancelNotification(lastNotificationId);
      setLoading(false);
      Alert.alert('Success', 'Notification canceled successfully');
      setLastNotificationId(null);
    } catch (error) {
      console.error('Error canceling notification:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to cancel notification');
    }
  };

  const handleCancelAllNotifications = async () => {
    try {
      setLoading(true);
      await NotificationTester.cancelAllNotifications();
      setLoading(false);
      Alert.alert('Success', 'All notifications canceled');
      setLastNotificationId(null);
    } catch (error) {
      console.error('Error canceling all notifications:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to cancel all notifications');
    }
  };

  const handleGetPendingNotifications = async () => {
    try {
      setLoading(true);
      const notifications = await NotificationTester.getPendingNotifications();
      setLoading(false);
      Alert.alert('Pending Notifications', `Found ${notifications.length} pending notifications`);
    } catch (error) {
      console.error('Error getting pending notifications:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to get pending notifications');
    }
  };

  const handleSetBadgeCount = async (count) => {
    try {
      setLoading(true);
      await NotificationTester.setBadgeCount(count);
      setLoading(false);
      Alert.alert('Success', `Badge count set to ${count}`);
    } catch (error) {
      console.error('Error setting badge count:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to set badge count');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFC00" />
        </TouchableOpacity>
        <Text style={styles.title}>Test Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Send Test Notifications</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleSendTestNotification}
          disabled={loading}
        >
          <Ionicons name="notifications-outline" size={24} color="#000" />
          <Text style={styles.buttonText}>Send Generic Notification</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleSendMessageNotification}
          disabled={loading}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#000" />
          <Text style={styles.buttonText}>Send Message Notification</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleSendFriendRequestNotification}
          disabled={loading}
        >
          <Ionicons name="person-add-outline" size={24} color="#000" />
          <Text style={styles.buttonText}>Send Friend Request Notification</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleSendStoryNotification}
          disabled={loading}
        >
          <Ionicons name="camera-outline" size={24} color="#000" />
          <Text style={styles.buttonText}>Send Story Notification</Text>
        </TouchableOpacity>
        
        <Text style={styles.sectionTitle}>Manage Notifications</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleCancelNotification}
          disabled={loading || !lastNotificationId}
        >
          <Ionicons name="close-circle-outline" size={24} color="#000" />
          <Text style={styles.buttonText}>Cancel Last Notification</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleCancelAllNotifications}
          disabled={loading}
        >
          <Ionicons name="trash-outline" size={24} color="#000" />
          <Text style={styles.buttonText}>Cancel All Notifications</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleGetPendingNotifications}
          disabled={loading}
        >
          <Ionicons name="list-outline" size={24} color="#000" />
          <Text style={styles.buttonText}>Get Pending Notifications</Text>
        </TouchableOpacity>
        
        <Text style={styles.sectionTitle}>Badge Count</Text>
        
        <View style={styles.badgeButtons}>
          <TouchableOpacity
            style={styles.badgeButton}
            onPress={() => handleSetBadgeCount(0)}
            disabled={loading}
          >
            <Text style={styles.badgeButtonText}>0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.badgeButton}
            onPress={() => handleSetBadgeCount(1)}
            disabled={loading}
          >
            <Text style={styles.badgeButtonText}>1</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.badgeButton}
            onPress={() => handleSetBadgeCount(5)}
            disabled={loading}
          >
            <Text style={styles.badgeButtonText}>5</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.badgeButton}
            onPress={() => handleSetBadgeCount(10)}
            disabled={loading}
          >
            <Text style={styles.badgeButtonText}>10</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFC00" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#000',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFC00',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  badgeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  badgeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFC00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TestNotificationsScreen; 