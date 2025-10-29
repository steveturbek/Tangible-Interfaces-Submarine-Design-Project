/**
 * Depth Claude Instrument Script
 * Updates the vertical scrolling depth gauge with vintage style
 * - Moving scale displays depth from 0-100
 * - 0% at bottom of window, 100% at top
 */

// Animation variables for smooth movement
let currentPosition = -500; // Starting position (0% at indicator)
let targetPosition = -500;
const animationSpeed = 0.1; // Smoothing factor
let minorTicksGenerated = false;

// Original function structure preserved
window.updateInstrument = function(depth) {
  // Normalize depth between 0 and 100
  const normalizedDepth = Math.max(0, Math.min(100, depth));

  // Calculate target position
  // At depth=0, scale should show 0 at center (translate by -500)
  // At depth=100, scale should show 100 at center (translate by 300)
  // Each percent moves the scale up by 8px
  targetPosition = -500 + (normalizedDepth * 8);
}

// Smooth animation function
let animateCallCount = 0;
function animateScale() {
  // Smooth interpolation towards target
  currentPosition += (targetPosition - currentPosition) * animationSpeed;

  // Apply transformation
  const scale = document.getElementById('movingScale');
  if (scale) {
    scale.setAttribute('transform', `translate(0, ${currentPosition})`);
    if (animateCallCount < 3) {
      console.log('animateScale called, currentPosition:', currentPosition, 'element found:', !!scale);
      animateCallCount++;
    }
  } else {
    if (animateCallCount < 3) {
      console.log('animateScale called but movingScale element NOT FOUND');
      animateCallCount++;
    }
  }
}

// Generate minor tick marks once on first animation frame
function generateMinorTicks() {
  if (minorTicksGenerated) return;

  const minorTicksGroup = document.getElementById('minorTicks');
  if (!minorTicksGroup) return;

  for (let i = 0; i <= 100; i++) {
    if (i % 10 !== 0) { // Skip major tick positions
      const y = 700 - (i * 8); // Each percent is 8px
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '135');
      line.setAttribute('y1', y);
      line.setAttribute('x2', '150');
      line.setAttribute('y2', y);
      minorTicksGroup.appendChild(line);
    }
  }
  minorTicksGenerated = true;
  console.log('Depth instrument initialized');
}

// Start animation loop immediately
setInterval(function() {
  generateMinorTicks(); // Try to generate ticks each frame until successful
  animateScale();
}, 16); // ~60fps for smooth animation

// Check localStorage for test mode or game state updates
let lastLoggedValue = null;
setInterval(function() {
  // Check test mode first
  const testValue = localStorage.getItem('testMode_depth');
  if (testValue !== null) {
    const parsedValue = parseFloat(testValue);
    if (lastLoggedValue === null || Math.abs(parsedValue - lastLoggedValue) > 10) {
      console.log('testMode_depth value:', parsedValue, 'targetPosition:', targetPosition);
      lastLoggedValue = parsedValue;
    }
    window.updateInstrument(parsedValue);
    return;
  }

  // Otherwise check game state
  const gameStateStr = localStorage.getItem('gameState');
  if (gameStateStr) {
    try {
      const gameState = JSON.parse(gameStateStr);
      if (gameState.depth !== undefined) {
        window.updateInstrument(gameState.depth);
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
}, 50); // Check every 50ms

// Initialize at 0
window.updateInstrument(0);
console.log('Depth claude SVG script loaded, initial targetPosition:', targetPosition);
