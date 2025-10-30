// Update the speed indicator based on localStorage value
function update_speed() {
  const gameValue = localStorage.getItem("game_speed");

  if (!gameValue) return;
  const percentage = parseFloat(gameValue);

  // Select the SVG with id 'speed'
  const speedSVG = document.getElementById("speed");
  if (!speedSVG) return;

  // Select the indicator element within this SVG
  const indicator = speedSVG.querySelector("#indicator");
  if (!indicator) return;

  const normalizedSpeed = Math.max(0, Math.min(100, percentage));
  const xPosition = 50 + normalizedSpeed * 4.12;

  indicator.setAttribute("x1", xPosition);
  indicator.setAttribute("x2", xPosition);
}
