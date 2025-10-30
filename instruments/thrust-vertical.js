// Update the thrust-vertical indicator based on localStorage value
function update_thrust_vertical() {
  const gameValue = localStorage.getItem("game_verticalThruster");

  if (!gameValue) return;
  const percentage = parseFloat(gameValue);

  // Select the SVG with id 'thrust-vertical'
  const thrustVerticalSVG = document.getElementById("thrust-vertical");
  if (!thrustVerticalSVG) return;

  // Select the indicator element within this SVG
  const indicator = thrustVerticalSVG.querySelector("#indicator");
  if (!indicator) return;

  const normalizedThruster = Math.max(-100, Math.min(100, percentage));
  const xPosition = 256 + (normalizedThruster / 100) * 206;

  indicator.setAttribute("x1", xPosition);
  indicator.setAttribute("x2", xPosition);
}
