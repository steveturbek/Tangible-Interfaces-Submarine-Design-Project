// Check localStorage for updates (test mode takes priority over game mode)
setInterval(() => {
  const gameValue = localStorage.getItem("game_rightThrust");
  if (!gameValue) return;
  const percentage = parseFloat(gameValue);

  // Select the SVG with id 'thrust-right'
  const thrustRightSVG = document.getElementById("thrust-right");
  if (!thrustRightSVG) return;

  // Select the indicator element within this SVG
  const indicator = thrustRightSVG.querySelector("#indicator");
  if (!indicator) return;

  const normalizedThrust = Math.max(-100, Math.min(100, percentage));
  const xPosition = 256 + (normalizedThrust / 100) * 206;

  indicator.setAttribute("x1", xPosition);
  indicator.setAttribute("x2", xPosition);
}, 50);
