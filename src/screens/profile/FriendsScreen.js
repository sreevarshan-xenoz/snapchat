import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { getFirebaseDb } from '../../config/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayRemove,
  getDoc,
} from 'firebase/firestore';
import { updateFriends } from '../../redux/slices/userSlice';

const FriendsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { friends } = useSelector((state) => state.user);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [friendsList, setFriendsList] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);

  useEffect(() => {
    fetchFriends();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = friendsList.filter(friend => 
        friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (friend.displayName && friend.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredFriends(filtered);
    } else {
      setFilteredFriends(friendsList);
    }
  }, [searchQuery, friendsList]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const db = getFirebaseDb();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const friendIds = userData.friends || [];
        
        if (friendIds.length > 0) {
          const friendsQuery = query(
            collection(db, 'users'),
            where('uid', 'in', friendIds)
          );
          
          const friendsSnapshot = await getDocs(friendsQuery);
          const friendsData = [];
          
          friendsSnapshot.forEach((doc) => {
            const data = doc.data();
            friendsData.push({
              uid: data.uid,
              username: data.username || data.email,
              displayName: data.displayName || '',
              photoURL: data.photoURL || null,
            });
          });
          
          setFriendsList(friendsData);
          setFilteredFriends(friendsData);
          
          // Update Redux
          dispatch(updateFriends(friendsData));
        } else {
          setFriendsList([]);
          setFilteredFriends([]);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load friends');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    Alert.alert(
      'Remove Friend',
      'Are you sure you want to remove this friend?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const db = getFirebaseDb();
              
              // Remove friend from user's friends list
              await updateDoc(doc(db, 'users', user.uid), {
                friends: arrayRemove(friendId),
              });
              
              // Remove user from friend's friends list
              await updateDoc(doc(db, 'users', friendId), {
                friends: arrayRemove(user.uid),
              });
              
              // Update local state
              const updatedFriends = friendsList.filter(friend => friend.uid !== friendId);
              setFriendsList(updatedFriends);
              setFilteredFriends(updatedFriends);
              
              // Update Redux
              dispatch(updateFriends(updatedFriends));
              
              setLoading(false);
              Alert.alert('Success', 'Friend removed successfully');
            } catch (error) {
              console.error('Error removing friend:', error);
              setLoading(false);
              Alert.alert('Error', 'Failed to remove friend');
            }
          },
        },
      ]
    );
  };

  const handleAddFriend = () => {
    navigation.navigate('FriendRequests');
  };

  const renderFriendItem = ({ item }) => (
    <View style={styles.friendItem}>
      <Image
        source={
          item.photoURL
            ? { uri: item.photoURL }
            : require('../../../assets/default-avatar.png')
        }
        style={styles.friendAvatar}
      />
      
      <View style={styles.friendInfo}>
        <Text style={styles.friendUsername}>{item.username}</Text>
        {item.displayName && (
          <Text style={styles.friendDisplayName}>{item.displayName}</Text>
        )}
      </View>
      
      <View style={styles.friendActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ChatDetail', {
            chatId: `${user.uid}_${item.uid}`,
            recipientId: item.uid,
            recipientName: item.displayName || item.username,
            recipientPhoto: item.photoURL,
          })}
        >
          <Ionicons name="chatbubble-outline" size={22} color="#FFFC00" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRemoveFriend(item.uid)}
        >
          <Ionicons name="person-remove-outline" size={22} color="#FF3B30" />
        </TouchableOpacity>
      </View>
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
        <Text style={styles.title}>Friends</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddFriend}
        >
          <Ionicons name="person-add-outline" size={24} color="#FFFC00" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFC00" />
        </View>
      ) : filteredFriends.length > 0 ? (
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item.uid}
          renderItem={renderFriendItem}
          contentContainerStyle={styles.friendsList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people" size={60} color="#333" />
          <Text style={styles.emptyText}>
            {searchQuery.trim()
              ? 'No friends match your search'
              : 'You have no friends yet'}
          </Text>
          {!searchQuery.trim() && (
            <TouchableOpacity
              style={styles.addFriendButton}
              onPress={handleAddFriend}
            >
              <Text style={styles.addFriendButtonText}>Add Friends</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 5,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 10,
    margin: 15,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendsList: {
    paddingHorizontal: 15,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
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
  friendUsername: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendDisplayName: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 2,
  },
  friendActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 10,
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  addFriendButton: {
    backgroundColor: '#FFFC00',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  addFriendButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FriendsScreen; 