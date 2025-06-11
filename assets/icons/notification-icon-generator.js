/**
 * This is a simple script to generate a notification icon for the app.
 * You can run this script with Node.js to generate an SVG file.
 * Then you can convert the SVG to PNG using a tool like SVGOMG or Inkscape.
 * 
 * The icon is a simple ghost shape (similar to Snapchat's ghost logo) on a transparent background.
 */

const fs = require('fs');

// Create a simple ghost icon SVG
const svgContent = `
<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" fill="none"/>
  <path d="M48 12C34.7452 12 24 22.7452 24 36V72C24 72 32 64 48 64C64 64 72 72 72 72V36C72 22.7452 61.2548 12 48 12Z" fill="white"/>
  <circle cx="36" cy="40" r="4" fill="#000000"/>
  <circle cx="60" cy="40" r="4" fill="#000000"/>
  <path d="M36 52C36 52 42 58 48 58C54 58 60 52 60 52" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
</svg>
`;

// Write the SVG file
fs.writeFileSync('assets/notification-icon.svg', svgContent);
console.log('SVG icon created at assets/notification-icon.svg');

/**
 * Instructions for converting SVG to PNG:
 * 
 * 1. You can use online tools like SVGOMG or Convertio to convert the SVG to PNG
 * 2. Or use software like Inkscape or Adobe Illustrator
 * 3. Make sure to export at 96x96 pixels for Android notification icons
 * 4. Save the PNG file as assets/notification-icon.png
 * 
 * For production, you should create different sizes of the icon for different device densities:
 * - mdpi: 24x24 px
 * - hdpi: 36x36 px
 * - xhdpi: 48x48 px
 * - xxhdpi: 72x72 px
 * - xxxhdpi: 96x96 px
 */ 