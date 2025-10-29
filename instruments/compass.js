// ========================================
// STUDENT EDIT ZONE
// This script controls how the compass displays
// ========================================

/**
 * Updates the compass display
 * @param {number} heading - Compass heading in degrees (0-360)
 *
 * How it works:
 * - The compass needle rotates to show direction
 * - 0° = North (needle points up)
 * - 90° = East (needle points right)
 * - 180° = South (needle points down)
 * - 270° = West (needle points left)
 * - The compass rotates so N always points toward true north
 */

// Check localStorage for updates (test mode takes priority over game mode)
setInterval(() => {
  const game_compass = localStorage.getItem("game_compass");
  if (!game_compass) return;
  //   // Normalize heading to 0-360 range
  //   const normalizedHeading = ((game_compass % 360) + 360) % 360;

  //   console.log(game_compass, normalizedHeading);

  const compassRotating = document.getElementById("compass-rotating");
  if (!compassRotating) return;

  // Rotate the compass so N points north
  // Negative rotation because we want N to point in the opposite direction of travel
  compassRotating.setAttribute("transform", `rotate(${game_compass}, 256, 128)`);
}, 50);

//console.log('Compass gauge script loaded');
