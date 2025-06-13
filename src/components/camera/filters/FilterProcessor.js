import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';

// Basic filter styles that will be applied to the view containing the camera
const getFilterStyle = (filterType) => {
  switch (filterType) {
    case 'sepia':
      return {
        filter: [
          { sepia: 0.8 },
          { saturate: 1.5 },
          { contrast: 1.2 },
        ],
      };
    case 'grayscale':
      return {
        filter: [{ grayscale: 1 }],
      };
    case 'vintage':
      return {
        filter: [
          { sepia: 0.5 },
          { saturate: 0.8 },
          { contrast: 1.1 },
          { brightness: 1.1 },
        ],
      };
    case 'blur':
      return {
        filter: [{ blur: '5px' }],
      };
    case 'saturate':
      return {
        filter: [{ saturate: 2 }],
      };
    case 'invert':
      return {
        filter: [{ invert: 1 }],
      };
    default:
      return {};
  }
};

const FilterProcessor = ({ 
  filterType, 
  cameraRef, 
  cameraType, 
  flashMode, 
  style 
}) => {
  const faceDetecting = ['dog', 'cat', 'bunny'].includes(filterType);
  const [faces, setFaces] = React.useState([]);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Animation for face filters
  useEffect(() => {
    if (faceDetecting && faces.length > 0) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [faces, faceDetecting]);

  const handleFacesDetected = ({ faces }) => {
    if (faceDetecting) {
      setFaces(faces);
    }
  };

  // Render AR elements on detected faces
  const renderFaceElements = () => {
    if (!faceDetecting || faces.length === 0) return null;

    return faces.map((face, index) => {
      const { bounds, yawAngle, rollAngle } = face;
      const { origin, size } = bounds;
      const { x, y } = origin;
      const { width, height } = size;
      
      // Different accessories based on filter type
      let emoji = '🐶';
      if (filterType === 'cat') emoji = '🐱';
      if (filterType === 'bunny') emoji = '🐰';

      return (
        <Animated.View
          key={index}
          style={{
            position: 'absolute',
            left: x - width * 0.1,
            top: y - height * 0.6,
            transform: [
              { scale: scaleAnim },
              { rotate: `${rollAngle}deg` },
              { perspective: 600 },
              { rotateY: `${-yawAngle}deg` },
            ],
          }}
        >
          <View style={styles.faceOverlay}>
            <View style={styles.faceEmoji}>
              <Text style={styles.emoji}>{emoji}</Text>
            </View>
          </View>
        </Animated.View>
      );
    });
  };

  // Apply CSS-like filter styles to the view
  const getViewStyle = () => {
    const baseStyle = [styles.container, style];
    
    if (!faceDetecting) {
      // For basic image filters, we'll use a simple overlay with blend modes
      // In a real app, you would use more advanced image processing libraries
      switch (filterType) {
        case 'sepia':
          return [...baseStyle, { backgroundColor: 'rgba(112, 66, 20, 0.2)' }];
        case 'grayscale':
          return [...baseStyle, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }];
        case 'vintage':
          return [...baseStyle, { backgroundColor: 'rgba(255, 240, 200, 0.2)' }];
        case 'blur':
          // Blur is difficult to implement this way, would need a real image processing library
          return baseStyle;
        case 'saturate':
          return [...baseStyle, { backgroundColor: 'rgba(255, 100, 100, 0.1)' }];
        case 'invert':
          // Invert is also difficult with this approach
          return baseStyle;
        default:
          return baseStyle;
      }
    }
    
    return baseStyle;
  };

  return (
    <View style={getViewStyle()}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType}
        flashMode={flashMode}
        onFacesDetected={faceDetecting ? handleFacesDetected : undefined}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
          runClassifications: FaceDetector.FaceDetectorClassifications.none,
          minDetectionInterval: 100,
          tracking: true,
        }}
      />
      {renderFaceElements()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  faceOverlay: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceEmoji: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 40,
  },
});

export default FilterProcessor; 