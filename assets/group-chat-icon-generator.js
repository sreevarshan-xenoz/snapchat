/**
 * This script generates a group chat icon that can be run with Node.js to create a PNG file.
 * 
 * To use this script:
 * 1. Install the required packages: npm install sharp
 * 2. Run the script: node group-chat-icon-generator.js
 * 
 * The script will generate a PNG file at assets/group-chat-icon.png
 * 
 * For production, you should create different sizes of the icon for various device densities:
 * - mdpi: 48x48
 * - hdpi: 72x72
 * - xhdpi: 96x96
 * - xxhdpi: 144x144
 * - xxxhdpi: 192x192
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// SVG content for the group chat icon
const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="96px" height="96px" viewBox="0 0 96 96" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>Group Chat Icon</title>
    <g id="Group-Chat-Icon" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <circle id="Background" fill="#FFFC00" cx="48" cy="48" r="48"></circle>
        <g id="People" transform="translate(18.000000, 20.000000)">
            <circle id="Person-1" fill="#000000" cx="12" cy="12" r="12"></circle>
            <circle id="Person-2" fill="#000000" cx="42" cy="12" r="12"></circle>
            <circle id="Person-3" fill="#000000" cx="27" cy="28" r="12"></circle>
            <path d="M0,44 C0,38.4771525 5.372583,34 12,34 C18.627417,34 24,38.4771525 24,44" id="Chat-Bubble-1" stroke="#000000" stroke-width="4" stroke-linecap="round"></path>
            <path d="M36,44 C36,38.4771525 41.372583,34 48,34 C54.627417,34 60,38.4771525 60,44" id="Chat-Bubble-2" stroke="#000000" stroke-width="4" stroke-linecap="round"></path>
            <path d="M18,44 C18,38.4771525 23.372583,34 30,34 C36.627417,34 42,38.4771525 42,44" id="Chat-Bubble-3" stroke="#000000" stroke-width="4" stroke-linecap="round"></path>
        </g>
    </g>
</svg>`;

// Write the SVG file
const svgPath = path.join(__dirname, 'group-chat-icon.svg');
fs.writeFileSync(svgPath, svgContent);
console.log(`SVG file created at ${svgPath}`);

// Convert SVG to PNG
const pngPath = path.join(__dirname, 'group-chat-icon.png');
sharp(Buffer.from(svgContent))
  .png()
  .toFile(pngPath)
  .then(() => {
    console.log(`PNG file created at ${pngPath}`);
  })
  .catch(err => {
    console.error('Error converting SVG to PNG:', err);
  }); 