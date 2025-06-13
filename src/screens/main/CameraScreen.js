import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { getFirebaseStorage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseDb } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as FaceDetector from 'expo-face-detector';
import FilterSelector from '../../components/camera/filters/FilterSelector';
import FaceFilterRenderer from '../../components/camera/filters/FaceFilterRenderer';
import ImageFilterOverlay from '../../components/camera/filters/ImageFilterOverlay';
import { isFaceFilter } from '../../components/camera/filters/FilterAssets';

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const [isRecording, setIsRecording] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [faces, setFaces] = useState([]);
  const cameraRef = useRef(null);
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.auth);
  const storage = getFirebaseStorage();
  const db = getFirebaseDb();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: true,
        });
        setCapturedImage(photo);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const handleRecord = async () => {
    if (cameraRef.current) {
      try {
        if (isRecording) {
          cameraRef.current.stopRecording();
          setIsRecording(false);
        } else {
          setIsRecording(true);
          const video = await cameraRef.current.recordAsync({
            maxDuration: 10,
            quality: Camera.Constants.VideoQuality['720p'],
          });
          setCapturedImage(video);
          setIsRecording(false);
        }
      } catch (error) {
        console.error('Error recording video:', error);
        Alert.alert('Error', 'Failed to record video');
        setIsRecording(false);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleSend = async () => {
    if (!capturedImage) return;

    try {
      setIsUploading(true);

      // Create a unique filename
      const timestamp = new Date().getTime();
      const filename = `${user.uid}_${timestamp}.${capturedImage.uri.split('.').pop()}`;
      const storageRef = ref(storage, `media/${filename}`);

      // Convert URI to blob
      const response = await fetch(capturedImage.uri);
      const blob = await response.blob();

      // Upload to Firebase Storage
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Save to Firestore
      const mediaType = capturedImage.uri.includes('video') ? 'video' : 'image';
      await addDoc(collection(db, 'stories'), {
        userId: user.uid,
        username: user.displayName,
        mediaURL: downloadURL,
        mediaType,
        filter: selectedFilter,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        viewers: [],
      });

      // Navigate to story creation screen
      navigation.navigate('CreateStory', { 
        mediaURL: downloadURL, 
        mediaType,
        filter: selectedFilter 
      });
    } catch (error) {
      console.error('Error uploading media:', error);
      Alert.alert('Error', 'Failed to upload media');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleCameraType = () => {
    setType(
      type === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const toggleFlash = () => {
    setFlash(
      flash === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    );
  };

  const handleFacesDetected = ({ faces }) => {
    if (isFaceFilter(selectedFilter)) {
      setFaces(faces);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container} />;
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
      </View>
    );
  }

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedImage.uri }} style={styles.preview} />
        <ImageFilterOverlay filterType={selectedFilter} />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleRetake}>
            <Ionicons name="refresh" size={30} color="#fff" />
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, isUploading && styles.disabledButton]}
            onPress={handleSend}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={30} color="#fff" />
                <Text style={styles.buttonText}>Send</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={type}
        flashMode={flash}
        ref={cameraRef}
        onFacesDetected={isFaceFilter(selectedFilter) ? handleFacesDetected : undefined}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
          runClassifications: FaceDetector.FaceDetectorClassifications.none,
          minDetectionInterval: 100,
          tracking: true,
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
              <Ionicons name="camera-reverse" size={30} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
              <Ionicons
                name={flash === Camera.Constants.FlashMode.on ? 'flash' : 'flash-off'}
                size={30}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
          
          <ImageFilterOverlay filterType={selectedFilter} />
          <FaceFilterRenderer faces={faces} filterType={selectedFilter} />
          
          <FilterSelector 
            selectedFilter={selectedFilter} 
            onSelectFilter={setSelectedFilter} 
          />
          
          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={[styles.captureButton, isRecording && styles.recordingButton]}
              onPress={isRecording ? handleRecord : handleCapture}
              onLongPress={handleRecord}
              delayLongPress={200}
            >
              {isRecording ? (
                <View style={styles.recordingIndicator} />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: 40,
  },
  bottomControls: {
    alignItems: 'center',
    marginBottom: 30,
  },
  flipButton: {
    padding: 10,
  },
  flashButton: {
    padding: 10,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
  },
  recordingButton: {
    borderColor: '#ff0000',
  },
  recordingIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ff0000',
  },
  preview: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
    borderRadius: 10,
    width: 120,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    marginTop: 5,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default CameraScreen; 