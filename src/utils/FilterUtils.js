/**
 * FilterUtils.js
 * Utility functions for camera filters and effects
 */

// Get overlay color for simple filter effects
export const getFilterOverlay = (filterType) => {
  switch (filterType) {
    case 'sepia':
      return 'rgba(112, 66, 20, 0.2)';
    case 'grayscale':
      return 'rgba(0, 0, 0, 0.4)';
    case 'vintage':
      return 'rgba(255, 240, 200, 0.2)';
    case 'saturate':
      return 'rgba(255, 100, 100, 0.1)';
    case 'blur':
      return 'transparent';
    case 'invert':
      return 'transparent';
    default:
      return 'transparent';
  }
};

// Get blend mode for filter effects
export const getFilterBlendMode = (filterType) => {
  switch (filterType) {
    case 'sepia':
      return 'multiply';
    case 'grayscale':
      return 'saturation';
    case 'vintage':
      return 'overlay';
    case 'saturate':
      return 'screen';
    case 'invert':
      return 'difference';
    default:
      return 'normal';
  }
};

// Check if a filter is an AR face filter
export const isFaceFilter = (filterType) => {
  return ['dog', 'cat', 'bunny'].includes(filterType);
};

// Get emoji for face filters
export const getFaceFilterEmoji = (filterType) => {
  switch (filterType) {
    case 'dog':
      return '🐶';
    case 'cat':
      return '🐱';
    case 'bunny':
      return '🐰';
    default:
      return '🐶';
  }
};

// Get face filter assets
export const getFaceFilterAssets = (filterType) => {
  switch (filterType) {
    case 'dog':
      return {
        ears: require('../../assets/filters/dog_ears.png'),
        nose: require('../../assets/filters/dog_nose.png'),
      };
    case 'cat':
      return {
        ears: require('../../assets/filters/cat_ears.png'),
        nose: require('../../assets/filters/cat_nose.png'),
      };
    case 'bunny':
      return {
        ears: require('../../assets/filters/bunny_ears.png'),
        nose: require('../../assets/filters/bunny_nose.png'),
      };
    default:
      return null;
  }
};

// Helper to calculate face landmark positions
export const calculateFaceLandmarks = (face) => {
  const { bounds, landmarks } = face;
  const { origin, size } = bounds;
  const { x, y } = origin;
  const { width, height } = size;
  
  // For more advanced implementations, we would use actual face landmarks
  // Here we're using approximations based on the face bounds
  return {
    leftEye: { x: x + width * 0.3, y: y + height * 0.4 },
    rightEye: { x: x + width * 0.7, y: y + height * 0.4 },
    nose: { x: x + width * 0.5, y: y + height * 0.5 },
    mouth: { x: x + width * 0.5, y: y + height * 0.7 },
    ears: { x: x + width * 0.5, y: y + height * 0.2 },
  };
};

// Helper to adjust filter position based on face rotation
export const adjustForFaceRotation = (face) => {
  const { yawAngle, rollAngle } = face;
  
  return {
    rotate: `${rollAngle}deg`,
    rotateY: `${-yawAngle}deg`,
    perspective: 600,
  };
};

export default {
  getFilterOverlay,
  getFilterBlendMode,
  isFaceFilter,
  getFaceFilterEmoji,
  getFaceFilterAssets,
  calculateFaceLandmarks,
  adjustForFaceRotation,
}; 