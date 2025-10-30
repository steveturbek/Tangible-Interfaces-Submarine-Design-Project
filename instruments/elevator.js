// Check localStorage for updates (test mode takes priority over game mode)
setInterval(() => {
  const gameValue = localStorage.getItem("game_elevator");
  if (!gameValue) return;
  const percentage = parseFloat(gameValue);

  // Select the SVG with id 'elevator'
  const elevatorSVG = document.getElementById("elevator");
  if (!elevatorSVG) return;

  // Select the indicator element within this SVG
  const indicator = elevatorSVG.querySelector("#indicator");
  if (!indicator) return;

  const normalizedElevator = Math.max(-100, Math.min(100, percentage));
  const xPosition = 256 + (normalizedElevator / 100) * 206;

  indicator.setAttribute("x1", xPosition);
  indicator.setAttribute("x2", xPosition);
}, 50);
