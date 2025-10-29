// Check localStorage for updates (test mode takes priority over game mode)
setInterval(() => {
  const gameValue = localStorage.getItem("game_leftThrust");

  if (!gameValue) return;
  const percentage = parseFloat(gameValue);

  const indicator = document.getElementById("indicator");
  if (!indicator) return;

  // Clamp between -100 and +100
  const normalizedThrust = Math.max(-100, Math.min(100, percentage));

  // Map -100 to +100 to x position 50 to 462
  const xPosition = 256 + (normalizedThrust / 100) * 206;

  indicator.setAttribute("x1", xPosition);
  indicator.setAttribute("x2", xPosition);
}, 50);
