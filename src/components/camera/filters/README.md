# Camera Filters Implementation

This directory contains components for implementing camera filters in the SnapClone app.

## Components

### FilterSelector.js
A horizontal scrollable list of filter options that allows users to select different filters.

### FilterAssets.js
Contains definitions for filter assets, including:
- Filter thumbnails
- Face filter emojis
- Filter overlay colors
- Helper functions for identifying filter types

### ImageFilterOverlay.js
Renders color overlays for basic image filters like sepia, grayscale, etc.

### FaceFilterRenderer.js
Renders AR face filters (using emoji for simplicity) on detected faces.

## How It Works

1. The `CameraScreen` component uses the `FilterSelector` to let users choose a filter
2. When a filter is selected, the appropriate overlay is applied:
   - For basic filters (sepia, grayscale, etc.), an `ImageFilterOverlay` is rendered
   - For face filters (dog, cat, bunny), face detection is enabled and `FaceFilterRenderer` displays emojis on detected faces
3. The filter type is saved with the image/video when uploaded

## Extending the System

To add new filters:
1. Add the filter to `FILTER_THUMBNAILS` in FilterAssets.js
2. For face filters, add to `FACE_FILTERS` and `FACE_FILTER_EMOJIS`
3. For color filters, add to `FILTER_OVERLAYS`

## Production Implementation

In a production app, you would:
1. Use real image assets instead of emojis for face filters
2. Implement more sophisticated image processing with libraries like GL React
3. Add more precise face landmark detection for better filter placement
4. Include animation effects for filters
5. Implement server-side filter processing for more complex effects 