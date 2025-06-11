import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import { getFirebaseDb, getFirebaseStorage } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const CreateStoryScreen = ({ navigation, route }) => {
  const { user } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.user);
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [capturedImage, setCapturedImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef(null);

  // If image was passed from another screen
  useEffect(() => {
    if (route.params?.imageUri) {
      setCapturedImage(route.params.imageUri);
    }
  }, [route.params?.imageUri]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        
        // Compress the image to reduce size
        const compressedImage = await manipulateAsync(
          photo.uri,
          [{ resize: { width: 1080 } }],
          { compress: 0.7, format: SaveFormat.JPEG }
        );
        
        setCapturedImage(compressedImage.uri);
      } catch (error) {
        console.error('Error capturing image:', error);
        Alert.alert('Error', 'Failed to capture image');
      }
    }
  };

  const handleFlipCamera = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const handleFlashToggle = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    );
  };

  const handlePickImage = async () => {
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
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCaption('');
  };

  const handlePost = async () => {
    if (!capturedImage) {
      Alert.alert('Error', 'Please capture or select an image first');
      return;
    }

    try {
      setUploading(true);
      
      // Upload image to Firebase Storage
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      const storage = getFirebaseStorage();
      const storageRef = ref(storage, `stories/${user.uid}/${Date.now()}`);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Add story to Firestore
      const db = getFirebaseDb();
      const storyDoc = await addDoc(collection(db, 'stories'), {
        userId: user.uid,
        username: profile?.username || user.email,
        userPhoto: profile?.photoURL || null,
        timestamp: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        caption: caption.trim(),
        media: [
          {
            mediaUrl: downloadURL,
            type: 'image',
            timestamp: serverTimestamp(),
          },
        ],
        views: [],
      });
      
      setUploading(false);
      Alert.alert('Success', 'Your story has been posted!');
      navigation.navigate('Stories');
    } catch (error) {
      console.error('Error posting story:', error);
      Alert.alert('Error', 'Failed to post story');
      setUploading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFC00" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-off-outline" size={60} color="#FFFC00" />
        <Text style={styles.permissionText}>No access to camera</Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.permissionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!capturedImage ? (
        <>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={cameraType}
            flashMode={flashMode}
          >
            <View style={styles.cameraControlsContainer}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="close" size={30} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.flashButton}
                onPress={handleFlashToggle}
              >
                <Ionicons 
                  name={flashMode === Camera.Constants.FlashMode.on ? "flash" : "flash-off"} 
                  size={24} 
                  color="#fff" 
                />
              </TouchableOpacity>
            </View>
          </Camera>
          
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              style={styles.galleryButton}
              onPress={handlePickImage}
            >
              <Ionicons name="images-outline" size={30} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.captureButton}
              onPress={handleCapture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.flipButton}
              onPress={handleFlipCamera}
            >
              <Ionicons name="camera-reverse-outline" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <ScrollView style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          
          <View style={styles.captionContainer}>
            <TextInput
              style={styles.captionInput}
              placeholder="Add a caption..."
              placeholderTextColor="#999"
              value={caption}
              onChangeText={setCaption}
              multiline
            />
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.retakeButton}
              onPress={handleRetake}
            >
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.postButton}
              onPress={handlePost}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.postButtonText}>Post to Story</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  permissionText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#FFFC00',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
  },
  permissionButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  cameraControlsContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  closeButton: {
    padding: 10,
  },
  flashButton: {
    padding: 10,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  galleryButton: {
    padding: 10,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
  },
  flipButton: {
    padding: 10,
  },
  previewContainer: {
    flex: 1,
  },
  previewImage: {
    width: '100%',
    height: 500,
    resizeMode: 'cover',
  },
  captionContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  captionInput: {
    color: '#fff',
    fontSize: 16,
    minHeight: 60,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  retakeButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FFFC00',
  },
  retakeButtonText: {
    color: '#FFFC00',
    fontWeight: 'bold',
    fontSize: 16,
  },
  postButton: {
    backgroundColor: '#FFFC00',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  postButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CreateStoryScreen; 