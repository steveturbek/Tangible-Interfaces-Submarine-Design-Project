// Check localStorage for updates (test mode takes priority over game mode)
setInterval(() => {
  const gameValue = localStorage.getItem("game_pitch");
  if (!gameValue) return;
  const percentage = parseFloat(gameValue);

  // Select the SVG with id 'pitch'
  const pitchSVG = document.getElementById("pitch");
  if (!pitchSVG) return;

  // Select the indicator element within this SVG
  const indicator = pitchSVG.querySelector("#indicator");
  if (!indicator) return;

  const normalizedPitch = Math.max(-100, Math.min(100, percentage));
  const xPosition = 256 + (normalizedPitch / 100) * 206;

  indicator.setAttribute("x1", xPosition);
  indicator.setAttribute("x2", xPosition);
}, 50);
