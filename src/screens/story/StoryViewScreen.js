import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Animated,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { Video } from 'expo-av';
import { getFirebaseDb } from '../../config/firebase';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds per story

const StoryViewScreen = ({ route, navigation }) => {
  const { storyId, userId, username } = route.params;
  const { user } = useSelector((state) => state.auth);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const videoRef = useRef(null);

  useEffect(() => {
    fetchStories();
    
    // Mark story as viewed
    markStoryAsViewed();
  }, []);

  useEffect(() => {
    if (stories.length > 0 && !loading) {
      startProgress();
    }
  }, [currentIndex, loading, stories]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const db = getFirebaseDb();
      const storyDoc = await getDoc(doc(db, 'stories', storyId));
      
      if (storyDoc.exists()) {
        const storyData = storyDoc.data();
        setStories(storyData.media || []);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setLoading(false);
    }
  };

  const markStoryAsViewed = async () => {
    try {
      const db = getFirebaseDb();
      await updateDoc(doc(db, 'stories', storyId), {
        views: arrayUnion(user.uid),
      });
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  };

  const startProgress = () => {
    progressAnim.setValue(0);
    
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !paused) {
        handleNext();
      }
    });
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.goBack();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      navigation.goBack();
    }
  };

  const handlePause = () => {
    if (paused) {
      setPaused(false);
      if (stories[currentIndex]?.type === 'video' && videoRef.current) {
        videoRef.current.playAsync();
      }
      startProgress();
    } else {
      setPaused(true);
      progressAnim.stopAnimation();
      if (stories[currentIndex]?.type === 'video' && videoRef.current) {
        videoRef.current.pauseAsync();
      }
    }
  };

  const renderProgressBars = () => {
    return (
      <View style={styles.progressContainer}>
        {stories.map((_, index) => (
          <View key={index} style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: index === currentIndex 
                    ? progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }) 
                    : index < currentIndex ? '100%' : '0%',
                },
              ]}
            />
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFC00" />
      </View>
    );
  }

  const currentStory = stories[currentIndex];
  const isVideo = currentStory?.type === 'video';

  return (
    <View style={styles.container}>
      {renderProgressBars()}
      
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={
              currentStory?.userPhoto
                ? { uri: currentStory.userPhoto }
                : require('../../../assets/default-avatar.png')
            }
            style={styles.userAvatar}
          />
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.timestamp}>
            {currentStory?.timestamp 
              ? new Date(currentStory.timestamp.toDate()).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        activeOpacity={1}
        style={StyleSheet.absoluteFill}
        onPress={handlePause}
        onLongPress={handlePause}
      >
        {isVideo ? (
          <Video
            ref={videoRef}
            source={{ uri: currentStory.mediaUrl }}
            style={styles.media}
            resizeMode="cover"
            shouldPlay={!paused}
            isLooping={false}
            onPlaybackStatusUpdate={(status) => {
              if (status.didJustFinish) {
                handleNext();
              }
            }}
          />
        ) : (
          <Image
            source={{ uri: currentStory.mediaUrl }}
            style={styles.media}
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>
      
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handlePrevious}
        />
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleNext}
        />
      </View>
      
      {userId !== user.uid && (
        <View style={styles.replyContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder="Reply to story..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.sendButton}>
            <Ionicons name="send" size={24} color="#FFFC00" />
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  progressContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 10,
  },
  progressBarContainer: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFC00',
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestamp: {
    color: '#ccc',
    fontSize: 14,
    marginLeft: 10,
  },
  closeButton: {
    padding: 5,
  },
  media: {
    width,
    height,
    backgroundColor: '#000',
  },
  navigationContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  navButton: {
    flex: 1,
    height: '100%',
  },
  replyContainer: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#fff',
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
  },
});

export default StoryViewScreen; 