import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { getFirebaseDb } from '../../config/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import NotificationHelper from '../../utils/NotificationHelper';

const CreateGroupChatScreen = ({ navigation }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { friends } = useSelector((state) => state.user);
  const db = getFirebaseDb();

  const handleFriendSelect = (friend) => {
    if (selectedFriends.some(f => f.uid === friend.uid)) {
      setSelectedFriends(selectedFriends.filter(f => f.uid !== friend.uid));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (selectedFriends.length === 0) {
      Alert.alert('Error', 'Please select at least one friend');
      return;
    }

    try {
      setLoading(true);

      // Create an array of all participant IDs (including the current user)
      const participantIds = [user.uid, ...selectedFriends.map(friend => friend.uid)];
      
      // Create a map of participant names for easy reference
      const participantNames = {
        [user.uid]: user.displayName || user.email,
      };
      
      selectedFriends.forEach(friend => {
        participantNames[friend.uid] = friend.displayName || friend.username;
      });

      // Create the group chat document
      const groupChatRef = await addDoc(collection(db, 'chats'), {
        name: groupName.trim(),
        type: 'group',
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        participants: participantIds,
        participantNames: participantNames,
        lastMessage: null,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: user.uid,
        unreadCounts: {},
      });

      // Add a system message to the group
      await addDoc(collection(db, 'chats', groupChatRef.id, 'messages'), {
        text: `${user.displayName || user.email} created the group "${groupName.trim()}"`,
        senderId: 'system',
        senderName: 'System',
        timestamp: serverTimestamp(),
        read: true,
        type: 'system',
      });

      // Send notifications to all participants
      for (const friend of selectedFriends) {
        await NotificationHelper.sendGroupInviteNotification(
          user.uid,
          friend.uid,
          groupName.trim(),
          groupChatRef.id
        );
      }

      setLoading(false);
      Alert.alert('Success', 'Group chat created successfully', [
        { text: 'OK', onPress: () => navigation.navigate('ChatDetail', { 
          chatId: groupChatRef.id,
          isGroupChat: true,
          groupName: groupName.trim()
        })}
      ]);
    } catch (error) {
      console.error('Error creating group chat:', error);
      Alert.alert('Error', 'Failed to create group chat');
      setLoading(false);
    }
  };

  const renderFriendItem = ({ item }) => {
    const isSelected = selectedFriends.some(friend => friend.uid === item.uid);
    
    return (
      <TouchableOpacity
        style={[styles.friendItem, isSelected && styles.selectedFriendItem]}
        onPress={() => handleFriendSelect(item)}
      >
        <Image
          source={
            item.photoURL
              ? { uri: item.photoURL }
              : require('../../../assets/default-avatar.png')
          }
          style={styles.friendAvatar}
        />
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.displayName || item.username}</Text>
          <Text style={styles.friendUsername}>@{item.username}</Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#FFFC00" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Create Group Chat</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Group Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter group name"
          placeholderTextColor="#666"
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>

      <View style={styles.friendsContainer}>
        <Text style={styles.label}>Select Friends ({selectedFriends.length} selected)</Text>
        {friends.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={80} color="#666" />
            <Text style={styles.emptyText}>No friends available</Text>
            <TouchableOpacity 
              style={styles.addFriendsButton}
              onPress={() => navigation.navigate('Friends')}
            >
              <Text style={styles.addFriendsButtonText}>Add Friends</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={friends}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.uid}
            contentContainerStyle={styles.friendsList}
          />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.createButton, (!groupName.trim() || selectedFriends.length === 0) && styles.disabledButton]}
          onPress={handleCreateGroup}
          disabled={!groupName.trim() || selectedFriends.length === 0 || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.createButtonText}>Create Group</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputContainer: {
    padding: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 16,
  },
  friendsContainer: {
    flex: 1,
    padding: 15,
  },
  friendsList: {
    paddingBottom: 20,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectedFriendItem: {
    backgroundColor: '#222',
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 15,
  },
  friendName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendUsername: {
    color: '#999',
    fontSize: 14,
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
  addFriendsButton: {
    backgroundColor: '#FFFC00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addFriendsButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  createButton: {
    backgroundColor: '#FFFC00',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#555',
  },
  createButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateGroupChatScreen; 