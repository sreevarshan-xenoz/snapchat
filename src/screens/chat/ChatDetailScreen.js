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
} from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { getFirebaseStorage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import NotificationHelper from '../../utils/NotificationHelper';

const ChatDetailScreen = ({ route, navigation }) => {
  const { chatId, recipientId, recipientName, recipientPhoto } = route.params;
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const flatListRef = useRef(null);
  const db = getFirebaseDb();

  useEffect(() => {
    navigation.setOptions({
      title: recipientName || 'Chat',
      headerRight: () => (
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('CameraScreen', { chatId, recipientId })}
          >
            <Ionicons name="camera-outline" size={24} color="#FFFC00" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => Alert.alert('Video Call', 'Video calling feature coming soon!')}
          >
            <Ionicons name="videocam-outline" size={24} color="#FFFC00" />
          </TouchableOpacity>
        </View>
      ),
    });

    // Subscribe to messages
    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messageList = [];
      snapshot.forEach((doc) => {
        messageList.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setMessages(messageList);
      setLoading(false);

      // Mark messages as read
      snapshot.forEach((docSnapshot) => {
        const messageData = docSnapshot.data();
        if (messageData.senderId !== user.uid && !messageData.read) {
          updateDoc(doc(db, 'chats', chatId, 'messages', docSnapshot.id), {
            read: true,
          });
        }
      });
    });

    return () => unsubscribe();
  }, [chatId, db, navigation, recipientId, recipientName, user.uid]);

  const handleSend = async () => {
    if (!text.trim()) return;

    try {
      setSending(true);
      
      // Add message to Firestore
      const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: text.trim(),
        senderId: user.uid,
        senderName: user.displayName || user.email,
        timestamp: serverTimestamp(),
        read: false,
        type: 'text',
      });

      // Update last message in chat document
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: text.trim(),
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: user.uid,
      });
      
      // Send notification to recipient
      await NotificationHelper.sendMessageNotification(
        user.uid, 
        recipientId, 
        text.trim(),
        chatId
      );

      setText('');
      setSending(false);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      setSending(false);
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
    
    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.sentMessage : styles.receivedMessage,
        ]}
      >
        {item.type === 'image' ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('ImageViewer', { imageUrl: item.imageUrl })}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
          </TouchableOpacity>
        ) : (
          <Text style={styles.messageText}>{item.text}</Text>
        )}
        <View style={styles.messageTimeContainer}>
          <Text style={styles.messageTime}>
            {item.timestamp ? new Date(item.timestamp.toDate()).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : 'Sending...'}
          </Text>
          {isCurrentUser && (
            <Ionicons
              name={item.read ? 'checkmark-done' : 'checkmark'}
              size={16}
              color={item.read ? '#34B7F1' : '#8F8F8F'}
              style={styles.readIcon}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFC00" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton} onPress={handleImagePicker}>
          <Ionicons name="image-outline" size={24} color="#FFFC00" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#666"
          value={text}
          onChangeText={setText}
          multiline
        />
        
        {uploading ? (
          <ActivityIndicator size="small" color="#FFFC00" style={styles.sendButton} />
        ) : (
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFC00" />
            ) : (
              <Ionicons name="send" size={24} color={text.trim() ? "#FFFC00" : "#555"} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
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
});

export default ChatDetailScreen; 