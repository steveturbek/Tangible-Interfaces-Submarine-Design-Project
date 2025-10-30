// Update the thrust-left indicator based on localStorage value
function update_thrust_left() {
  const gameValue = localStorage.getItem("game_leftThrust");

  if (!gameValue) return;
  const percentage = parseFloat(gameValue);

  // Select the SVG with id 'thrust-left'
  const thrustLeftSVG = document.getElementById("thrust-left");
  if (!thrustLeftSVG) return;

  // Select the indicator element within this SVG
  const indicator = thrustLeftSVG.querySelector("#indicator");
  if (!indicator) return;

  // Clamp between -100 and +100
  const normalizedThrust = Math.max(-100, Math.min(100, percentage));

  // Map -100 to +100 to x position 50 to 462
  const xPosition = 256 + (normalizedThrust / 100) * 206;

  indicator.setAttribute("x1", xPosition);
  indicator.setAttribute("x2", xPosition);
}
