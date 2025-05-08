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

function updateInstruments_Oxygen() {
  const oxygenLevel = gameState.status.oxygenLevel;
  // Create and append the oxygen gauge SVG
  // Get reference to the oxygen SVG object

  const oxygenGaugeSVG = document.getElementById("oxygenGauge");
  const oxygenGaugeLine = oxygenGaugeSVG.contentDocument.getElementById("line");

  // Make sure we have a reference to the line element
  if (!oxygenGaugeLine) return;

  // Normalize oxygen level between 0 and 100
  const normalizedLevel = Math.max(0, Math.min(100, oxygenLevel));

  //THIS part animates the gauge

  // Calculate rotation angle:
  // 0% oxygen = -180 degrees (pointing left)
  // 50% oxygen = -90 degrees (pointing up)
  // 100% oxygen = 0 degrees (pointing right)
  const angle = -180 + normalizedLevel * 1.8;

  // Apply the rotation transform to the line
  // The transform origin is at the left end of the line (where x1 value is)
  const x1 = parseFloat(oxygenGaugeLine.getAttribute("x1"));
  const y1 = parseFloat(oxygenGaugeLine.getAttribute("y1"));

  // Set the transform attribute to rotate around the start point of the line
  oxygenGaugeLine.setAttribute("transform", `rotate(${angle}, ${x1}, ${y1})`);
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_Battery() {
  const BatteryLevel = gameState.status.batteryLevel;
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_depth() {
  const depth = gameState.status.depth;
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_distanceToTarget() {
  const distanceToTarget = gameState.navigation.distanceToTarget;
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_compassHeading() {
  const compassHeading = gameState.navigation.compassHeading;
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_currentSpeed() {
  const currentSpeed = gameState.navigation.currentSpeed;
}

////////////////////////////////////////////////////////////////////////////////////////////////

// You shouldn't need to edit below this line

////////////////////////////////////////////////////////////////////////////////////////////////

// Initialize instruments when the window loads
window.addEventListener(
  "load",
  () => {
    // Set initial state
    if (gameState && gameState.status) updateInstruments();

    document.getElementById("instruments-restart").contentDocument.getElementById("restart").addEventListener("click", restartGame);

    // Check if Web Serial API is supported
    if ("serial" in navigator) {
      // console.log("serial is supported by browser");
      document.getElementById("instruments-microBitGauge").contentDocument.getElementById("circuit-board-top-layer").setAttribute("fill", "#ffffff");
      document
        .getElementById("instruments-microBitGauge")
        .contentDocument.getElementById("circuit-board-top-layer")
        .addEventListener("click", connectToMicrobit);

      // Try to auto-connect when the game loads
      setTimeout(() => autoConnectToMicrobit(), 1000); // Slight delay to ensure everything is loaded
    } else {
      outputDiv.textContent = "Web Serial API is not supported in this browser. Please use Chrome or Edge.";
      document.getElementById("instruments-microBitGauge").contentDocument.getElementById("circuit-board-top-layer").setAttribute("fill", "#ff0000");
    }
  },
  { once: true }
);

////////////////////////////////////////////////////////////////////////////////////////////////

function updateInstruments() {
  if (gameState && gameState.status) {
    updateInstruments_Oxygen();
    updateInstruments_Battery();
    updateInstruments_depth();
    updateInstruments_distanceToTarget();
    updateInstruments_compassHeading();
    updateInstruments_currentSpeed();
    // Add more instrument updates here as needed
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////
