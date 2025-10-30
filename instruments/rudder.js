// Check localStorage for updates (test mode takes priority over game mode)
setInterval(() => {
  const gameValue = localStorage.getItem("game_rudder");
  if (!gameValue) return;
  const percentage = parseFloat(gameValue);

  // Select the SVG with id 'rudder'
  const rudderSVG = document.getElementById("rudder");
  if (!rudderSVG) return;

  // Select the indicator element within this SVG
  const indicator = rudderSVG.querySelector("#indicator");
  if (!indicator) return;

  const normalizedRudder = Math.max(-100, Math.min(100, percentage));
  const xPosition = 256 + (normalizedRudder / 100) * 206;

  indicator.setAttribute("x1", xPosition);
  indicator.setAttribute("x2", xPosition);
}, 50);
