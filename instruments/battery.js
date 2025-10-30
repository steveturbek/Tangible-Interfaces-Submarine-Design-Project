// ========================================
// BATTERY GAUGE ANIMATION
// This script runs INSIDE the SVG context
// ========================================

/**
 * Updates the battery gauge display based on localStorage
 *
 * How it works:
 * - Reads 'game_battery' from localStorage (0-100)
 * - Rotates the needle to show battery level
 * - 0%   = -180 degrees (pointing left)
 * - 50%  = -90 degrees (pointing up)
 * - 100% = 0 degrees (pointing right)
 */

// console.log('🔋 Battery.js loaded and initializing...');
// console.log('📦 Current document:', document);
// console.log('🌐 Window location:', window.location.href);

// Get the needle element once (cached after first success)
let line = null;
let initAttempts = 0;

// Check localStorage for updates every 50ms
setInterval(() => {
  // Get current battery level from game
  const gameValue = localStorage.getItem("game_battery");
  // console.log('📊 localStorage value:', gameValue);

  if (!gameValue) {
    console.warn("⚠️  No game_battery value in localStorage");
    return;
  }

  // Get needle element from the SVG
  if (!line) {
    initAttempts++;
    // console.log(`🔍 Attempt ${initAttempts}: Looking for line element in current document...`);

    // Select the SVG with id 'battery'
    const batterySVG = document.getElementById("battery");
    if (!batterySVG) {
      console.warn("  ❌ Battery SVG container not found");
      return;
    }

    // Select the line element within this SVG
    line = batterySVG.querySelector("#line");
    // console.log("  - line element:", line);

    if (!line) {
      console.warn("  ❌ Line element not found in SVG");
      return;
    }

    // console.log('✅ Successfully found line element! Will stop logging init attempts.');
  }

  // Make sure percentage is between 0 and 100
  const normalizedLevel = Math.max(0, Math.min(100, parseFloat(gameValue)));
  // console.log('📐 Normalized level:', normalizedLevel);

  // Calculate rotation angle: -180° to 0°
  const angle = -180 + normalizedLevel * 1.8;
  // console.log('🔄 Calculated angle:', angle);

  // Get the pivot point (start of the line)
  const x1 = parseFloat(line.getAttribute("x1"));
  const y1 = parseFloat(line.getAttribute("y1"));
  // console.log('📍 Pivot point:', { x1, y1 });

  // Rotate the needle around its pivot point
  line.setAttribute("transform", `rotate(${angle}, ${x1}, ${y1})`);
  // console.log('✨ Applied transform:', `rotate(${angle}, ${x1}, ${y1})`);
}, 50);
