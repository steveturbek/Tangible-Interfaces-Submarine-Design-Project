/**
 * Updates the depth gauge display
 * - The vertical indicator line moves horizontally to show depth
 * - 0 depth (surface) = x position at left (50)
 * - 50 depth (mid-water) = x position at middle (256)
 * - 100 depth (seabed) = x position at right (462)
 */

setInterval(() => {
  const gameValue = localStorage.getItem("game_depth");
  if (!gameValue) return;
  const depth = parseFloat(gameValue);

  // Get the indicator line element
  const indicator = document.getElementById("indicator");
  if (!indicator) return;

  // Make sure depth is between 0 and 100
  const normalizedDepth = Math.max(0, Math.min(100, depth));

  // Calculate x position
  // Formula: 50 + (depth * 4.12) to map 0-100 to 50-462
  const xPosition = 50 + normalizedDepth * 4.12;

  // Update both x1 and x2 to move the vertical line
  indicator.setAttribute("x1", xPosition);
  indicator.setAttribute("x2", xPosition);
}, 50);
