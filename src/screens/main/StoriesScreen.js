import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
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
} from 'firebase/firestore';
import { fetchStoriesStart, fetchStoriesSuccess, fetchStoriesFailure } from '../../redux/slices/storySlice';

const StoriesScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const { stories } = useSelector((state) => state.story);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const db = getFirebaseDb();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        dispatch(fetchStoriesStart());
        
        // Get current time
        const now = new Date();
        
        // Query stories that haven't expired yet
        const storiesQuery = query(
          collection(db, 'stories'),
          where('expiresAt', '>', now),
          orderBy('expiresAt', 'desc')
        );
        
        // Set up real-time listener
        const unsubscribe = onSnapshot(
          storiesQuery,
          (snapshot) => {
            const storiesData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            
            dispatch(fetchStoriesSuccess(storiesData));
            setLoading(false);
          },
          (error) => {
            console.error('Error fetching stories:', error);
            dispatch(fetchStoriesFailure(error.message));
            setLoading(false);
          }
        );
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up stories listener:', error);
        dispatch(fetchStoriesFailure(error.message));
        setLoading(false);
      }
    };
    
    fetchStories();
  }, [dispatch, db]);

  const handleStoryPress = async (story) => {
    try {
      // Mark story as viewed
      if (!story.viewers.includes(user.uid)) {
        await updateDoc(doc(db, 'stories', story.id), {
          viewers: arrayUnion(user.uid),
        });
      }
      
      // Navigate to story view
      navigation.navigate('StoryView', { story });
    } catch (error) {
      console.error('Error viewing story:', error);
    }
  };

  const renderStoryItem = ({ item }) => {
    const isViewed = item.viewers.includes(user.uid);
    
    return (
      <TouchableOpacity
        style={styles.storyItem}
        onPress={() => handleStoryPress(item)}
      >
        <View style={[styles.storyImageContainer, isViewed && styles.viewedStory]}>
          <Image
            source={{ uri: item.mediaURL }}
            style={styles.storyImage}
            resizeMode="cover"
          />
          {item.mediaType === 'video' && (
            <View style={styles.videoIndicator}>
              <Ionicons name="videocam" size={16} color="#fff" />
            </View>
          )}
        </View>
        <Text style={styles.username} numberOfLines={1}>
          {item.username}
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
        <Text style={styles.title}>Stories</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Camera')}
        >
          <Ionicons name="add-circle" size={24} color="#FFFC00" />
        </TouchableOpacity>
      </View>

      {stories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={80} color="#666" />
          <Text style={styles.emptyText}>No stories available</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('Camera')}
          >
            <Text style={styles.createButtonText}>Create a Story</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={stories}
          renderItem={renderStoryItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.storiesList}
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
  addButton: {
    padding: 5,
  },
  storiesList: {
    padding: 10,
  },
  storyItem: {
    flex: 1,
    margin: 5,
    alignItems: 'center',
  },
  storyImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFC00',
  },
  viewedStory: {
    borderColor: '#666',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 3,
  },
  username: {
    color: '#fff',
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
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
  createButton: {
    backgroundColor: '#FFFC00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default StoriesScreen; 