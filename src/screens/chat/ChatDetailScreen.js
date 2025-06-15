import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { getFirebaseDb } from '../../config/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { getFirebaseStorage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import NotificationHelper from '../../utils/NotificationHelper';

const ChatDetailScreen = ({ route, navigation }) => {
  const { chatId, recipientId, recipientName, isGroupChat, groupName } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const flatListRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const db = getFirebaseDb();

  useEffect(() => {
    // Set the header title
    navigation.setOptions({
      title: isGroupChat ? groupName : recipientName,
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 15 }}
          onPress={() => setShowParticipants(!showParticipants)}
        >
          <Ionicons name="people-outline" size={24} color="#FFFC00" />
        </TouchableOpacity>
      ),
    });

    // Fetch chat data
    const fetchChatData = async () => {
      try {
        const chatDoc = await getDoc(doc(db, 'chats', chatId));
        const chatData = chatDoc.data();
        
        if (isGroupChat) {
          // For group chats, fetch participant details
          const participantDetails = [];
          for (const participantId of chatData.participants) {
            if (participantId !== user.uid) {
              const userDoc = await getDoc(doc(db, 'users', participantId));
              const userData = userDoc.data();
              participantDetails.push({
                uid: participantId,
                displayName: userData.displayName || userData.username,
                username: userData.username,
                photoURL: userData.photoURL,
              });
            }
          }
          setParticipants(participantDetails);
        }
        
        // Mark chat as read
        if (chatData.unreadCounts && chatData.unreadCounts[user.uid] > 0) {
          await updateDoc(doc(db, 'chats', chatId), {
            [`unreadCounts.${user.uid}`]: 0,
          });
        }
      } catch (error) {
        console.error('Error fetching chat data:', error);
      }
    };

    fetchChatData();

    // Subscribe to messages
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = [];
      snapshot.forEach((doc) => {
        messageList.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setMessages(messageList);
      setLoading(false);
      
      // Scroll to bottom when new messages arrive
      if (flatListRef.current && messageList.length > 0) {
        setTimeout(() => {
          flatListRef.current.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    return () => unsubscribe();
  }, [chatId, navigation, recipientName, isGroupChat, groupName, user.uid]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      const messageData = {
        text: inputText.trim(),
        senderId: user.uid,
        senderName: user.displayName || user.email,
        timestamp: serverTimestamp(),
        read: false,
        type: 'text',
      };

      // Add message to Firestore
      await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

      // Update last message in chat document
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: inputText.trim(),
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: user.uid,
      });

      // Send notifications
      if (isGroupChat) {
        // For group chats, send notifications to all participants except the sender
        const chatDoc = await getDoc(doc(db, 'chats', chatId));
        const chatData = chatDoc.data();
        
        await NotificationHelper.sendGroupMessageNotification(
          user.uid,
          chatId,
          groupName,
          inputText.trim(),
          chatData.participants
        );
      } else {
        // For direct messages, send notification to the recipient
        await NotificationHelper.sendMessageNotification(
          user.uid,
          recipientId,
          inputText.trim(),
          chatId
        );
      }

      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant permission to access your photos');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (!result.canceled) {
        await sendImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const sendImage = async (uri) => {
    try {
      setUploading(true);
      
      // Upload image to Firebase Storage
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const storage = getFirebaseStorage();
      const imageRef = ref(storage, `chats/${chatId}/images/${Date.now()}`);
      
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      
      // Add message to Firestore
      const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), {
        imageUrl: downloadURL,
        senderId: user.uid,
        senderName: user.displayName || user.email,
        timestamp: serverTimestamp(),
        read: false,
        type: 'image',
      });
      
      // Update last message in chat document
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: '📷 Image',
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: user.uid,
      });
      
      // Send notification to recipient
      await NotificationHelper.sendMessageNotification(
        user.uid, 
        recipientId, 
        '📷 Sent you an image',
        chatId
      );
      
      setUploading(false);
    } catch (error) {
      console.error('Error sending image:', error);
      Alert.alert('Error', 'Failed to send image');
      setUploading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === user.uid;
    const isSystemMessage = item.type === 'system';

    if (isSystemMessage) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        ]}
      >
        {!isCurrentUser && isGroupChat && (
          <Text style={styles.senderName}>{item.senderName}</Text>
        )}
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          ]}
        >
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageTime}>
            {item.timestamp ? new Date(item.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </Text>
        </View>
      </View>
    );
  };

  const renderParticipantsList = () => {
    if (!showParticipants) return null;

    return (
      <View style={styles.participantsContainer}>
        <View style={styles.participantsHeader}>
          <Text style={styles.participantsTitle}>Group Members</Text>
          <TouchableOpacity onPress={() => setShowParticipants(false)}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={participants}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <View style={styles.participantItem}>
              <Image
                source={
                  item.photoURL
                    ? { uri: item.photoURL }
                    : require('../../../assets/default-avatar.png')
                }
                style={styles.participantAvatar}
              />
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>{item.displayName}</Text>
                <Text style={styles.participantUsername}>@{item.username}</Text>
              </View>
            </View>
          )}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFC00" />
        </View>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
          
          {renderParticipantsList()}
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#666"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.disabledButton]}
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    marginRight: 10,
  },
  headerButton: {
    marginHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 10,
    paddingBottom: 20,
  },
  messageContainer: {
    maxWidth: '80%',
    borderRadius: 20,
    padding: 12,
    marginVertical: 5,
    elevation: 1,
  },
  sentMessage: {
    backgroundColor: '#0B93F6',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  receivedMessage: {
    backgroundColor: '#262626',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  messageTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  messageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  readIcon: {
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  attachButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 10,
    color: '#fff',
    maxHeight: 100,
  },
  sendButton: {
    padding: 10,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  systemMessageText: {
    color: '#999',
    fontSize: 12,
    backgroundColor: '#222',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  senderName: {
    color: '#FFFC00',
    fontSize: 12,
    marginBottom: 2,
    marginLeft: 10,
  },
  participantsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 10,
  },
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  participantsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  participantAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  participantInfo: {
    marginLeft: 15,
  },
  participantName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  participantUsername: {
    color: '#999',
    fontSize: 14,
  },
  currentUserMessage: {
    backgroundColor: '#0B93F6',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  otherUserMessage: {
    backgroundColor: '#262626',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
  },
  currentUserBubble: {
    backgroundColor: '#0B93F6',
    alignSelf: 'flex-end',
  },
  otherUserBubble: {
    backgroundColor: '#262626',
    alignSelf: 'flex-start',
  },
  disabledButton: {
    backgroundColor: '#555',
  },
});

export default ChatDetailScreen; 