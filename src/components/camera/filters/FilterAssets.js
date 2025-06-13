/**
 * FilterAssets.js
 * 
 * This file contains definitions for filter assets and configurations.
 * In a production app, these would be actual image files, but for this demo
 * we'll use emoji and simple overlays.
 */

// Filter thumbnails
export const FILTER_THUMBNAILS = [
  { id: 'none', name: 'None', icon: '🔍' },
  { id: 'sepia', name: 'Sepia', icon: '🌅' },
  { id: 'grayscale', name: 'B&W', icon: '⚫' },
  { id: 'vintage', name: 'Vintage', icon: '📷' },
  { id: 'blur', name: 'Blur', icon: '🌫️' },
  { id: 'saturate', name: 'Vibrant', icon: '🌈' },
  { id: 'invert', name: 'Invert', icon: '🔄' },
  { id: 'dog', name: 'Dog', icon: '🐶' },
  { id: 'cat', name: 'Cat', icon: '🐱' },
  { id: 'bunny', name: 'Bunny', icon: '🐰' },
];

// Face filter emojis
export const FACE_FILTER_EMOJIS = {
  dog: '🐶',
  cat: '🐱',
  bunny: '🐰',
};

// Filter overlay colors
export const FILTER_OVERLAYS = {
  sepia: 'rgba(112, 66, 20, 0.2)',
  grayscale: 'rgba(0, 0, 0, 0.4)',
  vintage: 'rgba(255, 240, 200, 0.2)',
  saturate: 'rgba(255, 100, 100, 0.1)',
  blur: 'transparent',
  invert: 'transparent',
  none: 'transparent',
};

// Face filter types
export const FACE_FILTERS = ['dog', 'cat', 'bunny'];

// Check if a filter is a face filter
export const isFaceFilter = (filterType) => {
  return FACE_FILTERS.includes(filterType);
};

export default {
  FILTER_THUMBNAILS,
  FACE_FILTER_EMOJIS,
  FILTER_OVERLAYS,
  FACE_FILTERS,
  isFaceFilter,
}; 