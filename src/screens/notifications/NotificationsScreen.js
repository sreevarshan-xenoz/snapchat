import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useNotification } from '../../contexts/NotificationContext';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const { notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead } = useNotification();

  const handleNotificationPress = (notification) => {
    // Mark as read
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    
    // Navigate based on notification type
    const { data } = notification;
    if (data.type === 'message' && data.chatId) {
      navigation.navigate('ChatDetail', { chatId: data.chatId });
    } else if (data.type === 'friendRequest' && data.senderId) {
      navigation.navigate('FriendRequests');
    } else if (data.type === 'story' && data.storyId) {
      navigation.navigate('StoryView', { storyId: data.storyId });
    }
  };

  const renderNotificationItem = ({ item }) => {
    const notificationDate = new Date(item.createdAt);
    const now = new Date();
    
    // Format the date
    let timeString;
    const diffMs = now - notificationDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) {
      timeString = 'Just now';
    } else if (diffMins < 60) {
      timeString = `${diffMins}m ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      timeString = `${hours}h ago`;
    } else {
      const days = Math.floor(diffMins / 1440);
      timeString = `${days}d ago`;
    }
    
    // Choose icon based on notification type
    let iconName = 'notifications-outline';
    if (item.data.type === 'message') {
      iconName = 'chatbubble-outline';
    } else if (item.data.type === 'friendRequest') {
      iconName = 'person-add-outline';
    } else if (item.data.type === 'story') {
      iconName = 'camera-outline';
    }
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.read && styles.unreadNotification
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={iconName} size={24} color="#000" />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationBody}>{item.body}</Text>
          <Text style={styles.notificationTime}>{timeString}</Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={64} color="#CCCCCC" />
      <Text style={styles.emptyText}>No notifications yet</Text>
      <Text style={styles.emptySubtext}>
        When you receive notifications, they'll appear here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFC00" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllReadButton}
            onPress={markAllNotificationsAsRead}
          >
            <Text style={styles.markAllReadText}>Mark all read</Text>
          </TouchableOpacity>
        )}
        {unreadCount === 0 && <View style={{ width: 80 }} />}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyComponent}
      />
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
  markAllReadButton: {
    padding: 5,
  },
  markAllReadText: {
    color: '#FFFC00',
    fontWeight: '500',
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  unreadNotification: {
    backgroundColor: '#FFFEF0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFC00',
    alignSelf: 'center',
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default NotificationsScreen; 