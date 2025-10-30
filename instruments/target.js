// Check localStorage for updates (test mode takes priority over game mode)
setInterval(() => {
  const gameValue = localStorage.getItem("game_target");
  if (!gameValue) return;
  const meters = parseFloat(gameValue);

  // Select the SVG with id 'target'
  const targetSVG = document.getElementById("target");
  if (!targetSVG) return;

  // Select the indicator element within this SVG
  const indicator = targetSVG.querySelector("#indicator");
  if (!indicator) return;

  // Clamp distance between 0 and 100 meters
  const normalizedDistance = Math.max(0, Math.min(100, meters));

  // Map 0 to 100 meters to x position 50 to 462
  const xPosition = 50 + normalizedDistance * 4.12;

  indicator.setAttribute("x1", xPosition);
  indicator.setAttribute("x2", xPosition);
}, 50);
