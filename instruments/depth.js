// Update the depth indicator based on localStorage value
function update_depth() {
  const gameValue = localStorage.getItem("game_depth");

  if (!gameValue) return;
  const depth = parseFloat(gameValue);

  // Select the SVG with id 'depth'
  const depthSVG = document.getElementById("depth");
  if (!depthSVG) return;

  // Get the indicator line element within this SVG
  const indicator = depthSVG.querySelector("#indicator");
  if (!indicator) return;

  // Make sure depth is between 0 and 100
  const normalizedDepth = Math.max(0, Math.min(100, depth));

  // Calculate x position
  // Formula: 50 + (depth * 4.12) to map 0-100 to 50-462
  const xPosition = 50 + normalizedDepth * 4.12;

  // Update both x1 and x2 to move the vertical line
  indicator.setAttribute("x1", xPosition);
  indicator.setAttribute("x2", xPosition);
}
