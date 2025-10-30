// Update the battery indicator based on localStorage value
function update_battery() {
  const gameValue = localStorage.getItem("game_battery");

  if (!gameValue) return;

  // Select the SVG with id 'battery'
  const batterySVG = document.getElementById("battery");
  if (!batterySVG) return;

  // Select the line element within this SVG
  const line = batterySVG.querySelector("#line");
  if (!line) return;

  // Make sure percentage is between 0 and 100
  const normalizedLevel = Math.max(0, Math.min(100, parseFloat(gameValue)));

  // Calculate rotation angle: -180° to 0°
  const angle = -180 + normalizedLevel * 1.8;

  // Get the pivot point (start of the line)
  const x1 = parseFloat(line.getAttribute("x1"));
  const y1 = parseFloat(line.getAttribute("y1"));

  // Rotate the needle around its pivot point
  line.setAttribute("transform", `rotate(${angle}, ${x1}, ${y1})`);
}
