//Update the cockpit instrument displays

/*
Instrument values in the game
gameState.status.oxygenLevel
gameState.status.batteryLevel
gameState.status.depth
gameState.navigation.distanceToTarget
gameState.navigation.compassHeading
gameState.navigation.currentSpeed
 */

function initializeInstruments() {
  // Create and append the oxygen gauge SVG
  // Get reference to the oxygen SVG object
  let oxygenSVG = null;
  let oxygenLine = null;

  // Set initial state
  if (gameState && gameState.status) {
    updateInstrumentsOxygen(gameState.status.oxygenLevel);
  }
}

// Initialize instruments when the window loads
window.addEventListener(
  "load",
  () => {
    initializeInstruments();
  },
  { once: true }
);

////////////////////////////////////////////////////////////////////////////////////////////////

function updateInstruments() {
  if (gameState && gameState.status) {
    updateInstrumentsOxygen(gameState.status.oxygenLevel);
    // Add more instrument updates here as needed
  }
}

function updateInstrumentsOxygen(oxygenLevel) {
  const oxygenGauge = document.getElementById("oxygenGauge");
  oxygenSVG = oxygenGauge.contentDocument;
  oxygenLine = oxygenSVG.getElementById("line");

  // Make sure we have a reference to the line element
  if (!oxygenLine) return;

  // Normalize oxygen level between 0 and 100
  const normalizedLevel = Math.max(0, Math.min(100, oxygenLevel));

  // Calculate rotation angle:
  // 0% oxygen = -180 degrees (pointing left)
  // 50% oxygen = -90 degrees (pointing up)
  // 100% oxygen = 0 degrees (pointing right)
  const angle = -180 + normalizedLevel * 1.8;

  // Apply the rotation transform to the line
  // The transform origin is at the left end of the line (where x1 value is)
  const x1 = parseFloat(oxygenLine.getAttribute("x1"));
  const y1 = parseFloat(oxygenLine.getAttribute("y1"));

  // Set the transform attribute to rotate around the start point of the line
  oxygenLine.setAttribute("transform", `rotate(${angle}, ${x1}, ${y1})`);
}
