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
  getDoc,
} from 'firebase/firestore';
import {
  fetchChatsStart,
  fetchChatsSuccess,
  fetchChatsFailure,
  setActiveChat,
} from '../../redux/slices/chatSlice';

const ChatScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
          orderBy('lastMessageTimestamp', 'desc')
        );
        
        const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
          const chatList = [];
          
          for (const doc of snapshot.docs) {
            const chatData = doc.data();
            
            // For direct chats, get the other participant's info
            if (chatData.type !== 'group') {
              const otherParticipantId = chatData.participants.find(id => id !== user.uid);
              if (otherParticipantId) {
                const userDoc = await getDoc(doc(db, 'users', otherParticipantId));
                const userData = userDoc.data();
                
                chatList.push({
                  id: doc.id,
                  ...chatData,
                  recipientId: otherParticipantId,
                  recipientName: userData.displayName || userData.username,
                  recipientPhoto: userData.photoURL,
                });
              }
            } else {
              // For group chats, use the group name and a group icon
              chatList.push({
                id: doc.id,
                ...chatData,
                isGroupChat: true,
              });
            }
          }
          
          setChats(chatList);
          dispatch(fetchChatsSuccess(chatList));
          setLoading(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching chats:', error);
        dispatch(fetchChatsFailure(error.message));
        setLoading(false);
      }
    };
    
    fetchChats();
  }, [dispatch, db, user.uid]);

  const handleChatPress = (chat) => {
    if (chat.isGroupChat) {
      navigation.navigate('ChatDetail', {
        chatId: chat.id,
        isGroupChat: true,
        groupName: chat.name,
      });
    } else {
      navigation.navigate('ChatDetail', {
        chatId: chat.id,
        recipientId: chat.recipientId,
        recipientName: chat.recipientName,
        recipientPhoto: chat.recipientPhoto,
      });
    }
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
    const unreadCount = item.unreadCounts && item.unreadCounts[user.uid] ? item.unreadCounts[user.uid] : 0;
    
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleChatPress(item)}
      >
        <Image
          source={
            item.isGroupChat
              ? require('../../../assets/group-chat-icon.png')
              : item.recipientPhoto
              ? { uri: item.recipientPhoto }
              : require('../../../assets/default-avatar.png')
          }
          style={styles.avatar}
        />
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>
              {item.isGroupChat ? item.name : item.recipientName}
            </Text>
            <Text style={styles.chatTime}>
              {item.lastMessageTimestamp
                ? new Date(item.lastMessageTimestamp.toDate()).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : ''}
            </Text>
          </View>
          <View style={styles.chatFooter}>
            <Text
              style={[styles.lastMessage, unreadCount > 0 && styles.unreadMessage]}
              numberOfLines={1}
            >
              {item.lastMessageSenderId === user.uid
                ? `You: ${item.lastMessage}`
                : item.lastMessage}
            </Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
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
        <TouchableOpacity
          style={styles.createGroupButton}
          onPress={() => navigation.navigate('CreateGroupChat')}
        >
          <Ionicons name="people" size={24} color="#000" />
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  createGroupButton: {
    backgroundColor: '#FFFC00',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 15,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  chatName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatTime: {
    color: '#999',
    fontSize: 12,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    color: '#999',
    fontSize: 14,
    flex: 1,
  },
  unreadMessage: {
    color: '#fff',
    fontWeight: 'bold',
  },
  unreadBadge: {
    backgroundColor: '#FFFC00',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  unreadCount: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
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
  newChatButton: {
    backgroundColor: '#FFFC00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  newChatButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default ChatScreen; 