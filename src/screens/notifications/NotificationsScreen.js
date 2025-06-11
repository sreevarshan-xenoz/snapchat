import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const { notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead } = useNotification();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleMarkAllAsRead}
          disabled={unreadCount === 0}
        >
          <Text style={[styles.headerButtonText, unreadCount === 0 && styles.disabledText]}>
            Mark all read
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, unreadCount]);

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllNotificationsAsRead();
    }
  };

  const handleNotificationPress = (notification) => {
    // Mark as read
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.data) {
      const { type } = notification.data;
      
      if (type === 'message' && notification.data.chatId) {
        navigation.navigate('ChatDetail', { 
          chatId: notification.data.chatId,
          userId: notification.data.senderId
        });
      } else if (type === 'friendRequest') {
        navigation.navigate('FriendRequests');
      } else if (type === 'story' && notification.data.storyId) {
        navigation.navigate('StoryView', { storyId: notification.data.storyId });
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // The context already handles real-time updates, but we'll add a small delay
    // to give the user feedback that a refresh is happening
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderNotificationItem = ({ item }) => {
    const timestamp = item.createdAt ? item.createdAt.toDate() : new Date();
    const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });
    
    let icon = 'notifications-outline';
    let iconColor = '#999';
    
    if (item.data) {
      switch (item.data.type) {
        case 'message':
          icon = 'chatbubble';
          iconColor = '#0088ff';
          break;
        case 'friendRequest':
          icon = 'person-add';
          iconColor = '#00cc99';
          break;
        case 'story':
          icon = 'camera';
          iconColor = '#ffcc00';
          break;
        default:
          break;
      }
    }
    
    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.read && styles.unreadItem]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.notificationBody} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={styles.timeText}>{timeAgo}</Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No notifications yet</Text>
      <Text style={styles.emptySubText}>
        When you receive notifications, they'll appear here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={notifications.length === 0 ? styles.listContentEmpty : styles.listContent}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ffcc00']}
            tintColor="#ffcc00"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerButton: {
    paddingHorizontal: 15,
  },
  headerButtonText: {
    color: '#0088ff',
    fontSize: 16,
  },
  disabledText: {
    color: '#ccc',
  },
  listContent: {
    paddingBottom: 20,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  unreadItem: {
    backgroundColor: '#f9fcff',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contentContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0088ff',
    alignSelf: 'center',
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default NotificationsScreen; 