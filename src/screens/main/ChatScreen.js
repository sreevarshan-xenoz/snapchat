import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { getFirebaseDb } from '../../config/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';
import {
  fetchChatsStart,
  fetchChatsSuccess,
  fetchChatsFailure,
  setActiveChat,
} from '../../redux/slices/chatSlice';

const ChatScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { chats } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const { friends } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const db = getFirebaseDb();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        dispatch(fetchChatsStart());
        
        // Query chats where the current user is a participant
        const chatsQuery = query(
          collection(db, 'chats'),
          where('participants', 'array-contains', user.uid),
          orderBy('lastMessageTime', 'desc')
        );
        
        // Set up real-time listener
        const unsubscribe = onSnapshot(
          chatsQuery,
          (snapshot) => {
            const chatsData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            
            dispatch(fetchChatsSuccess(chatsData));
            setLoading(false);
          },
          (error) => {
            console.error('Error fetching chats:', error);
            dispatch(fetchChatsFailure(error.message));
            setLoading(false);
          }
        );
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up chats listener:', error);
        dispatch(fetchChatsFailure(error.message));
        setLoading(false);
      }
    };
    
    fetchChats();
  }, [dispatch, db, user.uid]);

  const handleChatPress = (chat) => {
    dispatch(setActiveChat(chat));
    navigation.navigate('ChatDetail', { chatId: chat.id });
  };

  const handleNewChat = () => {
    navigation.navigate('Friends', { selectMode: true });
  };

  const filteredChats = chats.filter((chat) => {
    const otherUser = chat.participants.find((id) => id !== user.uid);
    const otherUserData = friends.find((friend) => friend.uid === otherUser);
    
    if (!otherUserData) return false;
    
    return otherUserData.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderChatItem = ({ item }) => {
    const otherUser = item.participants.find((id) => id !== user.uid);
    const otherUserData = friends.find((friend) => friend.uid === otherUser);
    
    if (!otherUserData) return null;
    
    const unreadCount = item.unreadCounts?.[user.uid] || 0;
    
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleChatPress(item)}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={
              otherUserData.photoURL
                ? { uri: otherUserData.photoURL }
                : require('../../../assets/default-avatar.png')
            }
            style={styles.avatar}
          />
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.chatInfo}>
          <Text style={styles.username}>{otherUserData.username}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || 'No messages yet'}
          </Text>
        </View>
        <Text style={styles.time}>
          {item.lastMessageTime
            ? new Date(item.lastMessageTime.toDate()).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFC00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
          <Ionicons name="add-circle" size={24} color="#FFFC00" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {filteredChats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={80} color="#666" />
          <Text style={styles.emptyText}>No chats available</Text>
          <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
            <Text style={styles.newChatButtonText}>Start a New Chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatsList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  newChatButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    margin: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    paddingVertical: 10,
  },
  chatsList: {
    padding: 10,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFFC00',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 15,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastMessage: {
    color: '#999',
    fontSize: 14,
    marginTop: 3,
  },
  time: {
    color: '#666',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
    marginTop: 10,
    marginBottom: 20,
  },
  newChatButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default ChatScreen; 