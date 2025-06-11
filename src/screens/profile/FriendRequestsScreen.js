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
  Switch,
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
  arrayUnion,
  arrayRemove,
  getDoc,
} from 'firebase/firestore';
import { updateFriends } from '../../redux/slices/userSlice';
import NotificationHelper from '../../utils/NotificationHelper';

const FriendRequestsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { friends } = useSelector((state) => state.user);
  
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showIncoming, setShowIncoming] = useState(true);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const fetchFriendRequests = async () => {
    try {
      setLoading(true);
      const db = getFirebaseDb();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const incomingIds = userData.incomingRequests || [];
        const outgoingIds = userData.outgoingRequests || [];
        
        // Fetch incoming requests
        if (incomingIds.length > 0) {
          const incomingQuery = query(
            collection(db, 'users'),
            where('uid', 'in', incomingIds)
          );
          
          const incomingSnapshot = await getDocs(incomingQuery);
          const incomingData = [];
          
          incomingSnapshot.forEach((doc) => {
            const data = doc.data();
            incomingData.push({
              uid: data.uid,
              username: data.username || data.email,
              displayName: data.displayName || '',
              photoURL: data.photoURL || null,
            });
          });
          
          setIncomingRequests(incomingData);
        } else {
          setIncomingRequests([]);
        }
        
        // Fetch outgoing requests
        if (outgoingIds.length > 0) {
          const outgoingQuery = query(
            collection(db, 'users'),
            where('uid', 'in', outgoingIds)
          );
          
          const outgoingSnapshot = await getDocs(outgoingQuery);
          const outgoingData = [];
          
          outgoingSnapshot.forEach((doc) => {
            const data = doc.data();
            outgoingData.push({
              uid: data.uid,
              username: data.username || data.email,
              displayName: data.displayName || '',
              photoURL: data.photoURL || null,
            });
          });
          
          setOutgoingRequests(outgoingData);
        } else {
          setOutgoingRequests([]);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load friend requests');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a username to search');
      return;
    }

    try {
      setSearching(true);
      const db = getFirebaseDb();
      
      // Search by username
      const usernameQuery = query(
        collection(db, 'users'),
        where('username', '>=', searchQuery.trim()),
        where('username', '<=', searchQuery.trim() + '\uf8ff')
      );
      
      const usernameSnapshot = await getDocs(usernameQuery);
      const results = [];
      
      usernameSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.uid !== user.uid) {
          results.push({
            uid: data.uid,
            username: data.username || data.email,
            displayName: data.displayName || '',
            photoURL: data.photoURL || null,
          });
        }
      });
      
      // Filter out existing friends and requests
      const friendIds = friends.map(friend => friend.uid);
      const incomingIds = incomingRequests.map(request => request.uid);
      const outgoingIds = outgoingRequests.map(request => request.uid);
      
      const filteredResults = results.filter(
        result => !friendIds.includes(result.uid) && 
                 !incomingIds.includes(result.uid) && 
                 !outgoingIds.includes(result.uid)
      );
      
      setSearchResults(filteredResults);
      setSearching(false);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearching(false);
      Alert.alert('Error', 'Failed to search users');
    }
  };

  const handleSendRequest = async (recipientId) => {
    try {
      setLoading(true);
      const db = getFirebaseDb();
      
      // Add to recipient's incoming requests
      await updateDoc(doc(db, 'users', recipientId), {
        incomingRequests: arrayUnion(user.uid),
      });
      
      // Add to user's outgoing requests
      await updateDoc(doc(db, 'users', user.uid), {
        outgoingRequests: arrayUnion(recipientId),
      });
      
      // Send notification to recipient
      await NotificationHelper.sendFriendRequestNotification(user.uid, recipientId);
      
      // Update local state
      const recipient = searchResults.find(result => result.uid === recipientId);
      if (recipient) {
        setOutgoingRequests([...outgoingRequests, recipient]);
        setSearchResults(searchResults.filter(result => result.uid !== recipientId));
      }
      
      setLoading(false);
      Alert.alert('Success', 'Friend request sent');
    } catch (error) {
      console.error('Error sending friend request:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (senderId) => {
    try {
      setLoading(true);
      const db = getFirebaseDb();
      
      // Add to user's friends
      await updateDoc(doc(db, 'users', user.uid), {
        friends: arrayUnion(senderId),
        incomingRequests: arrayRemove(senderId),
      });
      
      // Add to sender's friends
      await updateDoc(doc(db, 'users', senderId), {
        friends: arrayUnion(user.uid),
        outgoingRequests: arrayRemove(user.uid),
      });
      
      // Send notification to sender
      await NotificationHelper.sendFriendAcceptedNotification(user.uid, senderId);
      
      // Update local state
      const sender = incomingRequests.find(request => request.uid === senderId);
      if (sender) {
        dispatch(updateFriends([...friends, sender]));
        setIncomingRequests(incomingRequests.filter(request => request.uid !== senderId));
      }
      
      setLoading(false);
      Alert.alert('Success', 'Friend request accepted');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (senderId) => {
    try {
      setLoading(true);
      const db = getFirebaseDb();
      
      // Remove from user's incoming requests
      await updateDoc(doc(db, 'users', user.uid), {
        incomingRequests: arrayRemove(senderId),
      });
      
      // Remove from sender's outgoing requests
      await updateDoc(doc(db, 'users', senderId), {
        outgoingRequests: arrayRemove(user.uid),
      });
      
      // Update local state
      setIncomingRequests(incomingRequests.filter(request => request.uid !== senderId));
      
      setLoading(false);
      Alert.alert('Success', 'Friend request rejected');
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to reject friend request');
    }
  };

  const handleCancelRequest = async (recipientId) => {
    try {
      setLoading(true);
      const db = getFirebaseDb();
      
      // Remove from recipient's incoming requests
      await updateDoc(doc(db, 'users', recipientId), {
        incomingRequests: arrayRemove(user.uid),
      });
      
      // Remove from user's outgoing requests
      await updateDoc(doc(db, 'users', user.uid), {
        outgoingRequests: arrayRemove(recipientId),
      });
      
      // Update local state
      setOutgoingRequests(outgoingRequests.filter(request => request.uid !== recipientId));
      
      setLoading(false);
      Alert.alert('Success', 'Friend request canceled');
    } catch (error) {
      console.error('Error canceling friend request:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to cancel friend request');
    }
  };

  const renderIncomingRequestItem = ({ item }) => (
    <View style={styles.requestItem}>
      <Image
        source={
          item.photoURL
            ? { uri: item.photoURL }
            : require('../../../assets/default-avatar.png')
        }
        style={styles.requestAvatar}
      />
      
      <View style={styles.requestInfo}>
        <Text style={styles.requestUsername}>{item.username}</Text>
        {item.displayName && (
          <Text style={styles.requestDisplayName}>{item.displayName}</Text>
        )}
      </View>
      
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptRequest(item.uid)}
        >
          <Ionicons name="checkmark" size={22} color="#4CD964" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleRejectRequest(item.uid)}
        >
          <Ionicons name="close" size={22} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOutgoingRequestItem = ({ item }) => (
    <View style={styles.requestItem}>
      <Image
        source={
          item.photoURL
            ? { uri: item.photoURL }
            : require('../../../assets/default-avatar.png')
        }
        style={styles.requestAvatar}
      />
      
      <View style={styles.requestInfo}>
        <Text style={styles.requestUsername}>{item.username}</Text>
        {item.displayName && (
          <Text style={styles.requestDisplayName}>{item.displayName}</Text>
        )}
        <Text style={styles.pendingText}>Pending</Text>
      </View>
      
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => handleCancelRequest(item.uid)}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchResultItem = ({ item }) => (
    <View style={styles.requestItem}>
      <Image
        source={
          item.photoURL
            ? { uri: item.photoURL }
            : require('../../../assets/default-avatar.png')
        }
        style={styles.requestAvatar}
      />
      
      <View style={styles.requestInfo}>
        <Text style={styles.requestUsername}>{item.username}</Text>
        {item.displayName && (
          <Text style={styles.requestDisplayName}>{item.displayName}</Text>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleSendRequest(item.uid)}
      >
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
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
        <Text style={styles.title}>Friend Requests</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by username..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={searching}
        >
          {searching ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {searchResults.length > 0 ? (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.uid}
            renderItem={renderSearchResultItem}
            contentContainerStyle={styles.requestsList}
          />
        </View>
      ) : (
        <>
          <View style={styles.toggleContainer}>
            <Text style={[styles.toggleText, showIncoming ? styles.activeText : {}]}>
              Incoming
            </Text>
            <Switch
              trackColor={{ false: "#FFFC00", true: "#FFFC00" }}
              thumbColor="#fff"
              ios_backgroundColor="#FFFC00"
              onValueChange={() => setShowIncoming(!showIncoming)}
              value={!showIncoming}
            />
            <Text style={[styles.toggleText, !showIncoming ? styles.activeText : {}]}>
              Outgoing
            </Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFC00" />
            </View>
          ) : showIncoming ? (
            incomingRequests.length > 0 ? (
              <FlatList
                data={incomingRequests}
                keyExtractor={(item) => item.uid}
                renderItem={renderIncomingRequestItem}
                contentContainerStyle={styles.requestsList}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="person-add" size={60} color="#333" />
                <Text style={styles.emptyText}>
                  No incoming friend requests
                </Text>
              </View>
            )
          ) : (
            outgoingRequests.length > 0 ? (
              <FlatList
                data={outgoingRequests}
                keyExtractor={(item) => item.uid}
                renderItem={renderOutgoingRequestItem}
                contentContainerStyle={styles.requestsList}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="paper-plane" size={60} color="#333" />
                <Text style={styles.emptyText}>
                  No outgoing friend requests
                </Text>
              </View>
            )
          )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#FFFC00',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  toggleText: {
    color: '#ccc',
    fontSize: 16,
    marginHorizontal: 10,
  },
  activeText: {
    color: '#FFFC00',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestsList: {
    paddingHorizontal: 15,
  },
  resultsContainer: {
    flex: 1,
  },
  sectionTitle: {
    color: '#FFFC00',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  requestAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  requestInfo: {
    flex: 1,
    marginLeft: 15,
  },
  requestUsername: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  requestDisplayName: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 2,
  },
  pendingText: {
    color: '#FFFC00',
    fontSize: 12,
    marginTop: 5,
  },
  requestActions: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: 'rgba(76, 217, 100, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  rejectButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#333',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#FFFC00',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  addButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
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
  },
});

export default FriendRequestsScreen; 