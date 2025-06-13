import React from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { isFaceFilter, getFaceFilterEmoji } from '../../../utils/FilterUtils';

const FaceFilterRenderer = ({ faces, filterType, animationValue }) => {
  if (!isFaceFilter(filterType) || faces.length === 0) {
    return null;
  }

  return faces.map((face, index) => {
    const { bounds, yawAngle, rollAngle } = face;
    const { origin, size } = bounds;
    const { x, y } = origin;
    const { width, height } = size;
    
    // Get appropriate emoji for the filter type
    const emoji = getFaceFilterEmoji(filterType);

    return (
      <Animated.View
        key={index}
        style={{
          position: 'absolute',
          left: x - width * 0.1,
          top: y - height * 0.6,
          transform: [
            { scale: animationValue || 1 },
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

const styles = StyleSheet.create({
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

export default FaceFilterRenderer; 