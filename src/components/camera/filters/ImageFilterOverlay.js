import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FILTER_OVERLAYS, isFaceFilter } from './FilterAssets';

const ImageFilterOverlay = ({ filterType }) => {
  // Don't render anything for face filters or 'none'
  if (isFaceFilter(filterType) || filterType === 'none') {
    return null;
  }

  // Get filter properties
  const backgroundColor = FILTER_OVERLAYS[filterType] || 'transparent';
  
  // Special handling for specific filters
  if (filterType === 'blur') {
    return (
      <View style={[styles.overlay, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
        <View style={styles.blurFilter} />
      </View>
    );
  }
  
  if (filterType === 'invert') {
    return (
      <View style={[styles.overlay, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
        <View style={styles.invertFilter} />
      </View>
    );
  }
  
  // Standard filter overlay
  return (
    <View 
      style={[
        styles.overlay, 
        { backgroundColor }
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  blurFilter: {
    flex: 1,
    backgroundColor: 'transparent',
    // Note: actual blur would require a native library or more complex implementation
  },
  invertFilter: {
    flex: 1,
    backgroundColor: 'transparent',
    // Note: actual invert would require a native library or more complex implementation
  },
});

export default ImageFilterOverlay; 