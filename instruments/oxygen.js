// Check localStorage for updates (test mode takes priority over game mode)
setInterval(() => {
  const gameValue = localStorage.getItem("game_oxygen");
  if (!gameValue) return;
  const percentage = parseFloat(gameValue);

  // Select the SVG with id 'oxygen'
  const oxygenSVG = document.getElementById("oxygen");
  if (!oxygenSVG) return;

  // Select the line element within this SVG
  const line = oxygenSVG.querySelector("#line");
  if (!line) return;
  const normalizedLevel = Math.max(0, Math.min(100, percentage));
  // 120° total span => from -150 to -30
  const angle = (normalizedLevel - 50) * 1.2;
  const x1 = parseFloat(line.getAttribute("x1"));
  const y1 = parseFloat(line.getAttribute("y1"));
  line.setAttribute("transform", `rotate(${angle}, ${x1}, ${y1})`);
}, 50);
