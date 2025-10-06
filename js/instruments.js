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

// ========================================
// HELPER FUNCTION - Gets SVG content document
// ========================================
function getSVGContentDocument(svgElementId) {
  // Check if instruments are in a separate window
  const doc = window.instrumentsWindow && !window.instrumentsWindow.closed
    ? window.instrumentsWindow.document
    : document;

  const svgObject = doc.getElementById(svgElementId);
  if (!svgObject || !svgObject.contentDocument) return null;

  return svgObject.contentDocument;
}

// ========================================
// SIMPLIFIED UPDATE FUNCTIONS
// Each function gets a value and calls the SVG's internal updateInstrument() function
// ========================================

function updateInstruments_Oxygen() {
  const oxygenLevel = gameState.status.oxygenLevel;

  // Get the SVG's content document
  const svgDoc = getSVGContentDocument("oxygenGauge");
  if (!svgDoc) return;

  // Call the SVG's internal update function
  if (svgDoc.defaultView && svgDoc.defaultView.updateInstrument) {
    svgDoc.defaultView.updateInstrument(oxygenLevel);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_Battery() {
  const batteryLevel = gameState.status.batteryLevel;

  // Get the SVG's content document
  const svgDoc = getSVGContentDocument("batteryGauge");
  if (!svgDoc) return;

  // Call the SVG's internal update function
  if (svgDoc.defaultView && svgDoc.defaultView.updateInstrument) {
    svgDoc.defaultView.updateInstrument(batteryLevel);
  }
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
    // Wait a bit for instruments window to open
    setTimeout(() => {
      // Check if instruments are in a separate window
      const doc = window.instrumentsWindow && !window.instrumentsWindow.closed
        ? window.instrumentsWindow.document
        : document;

      // Set initial state
      if (gameState && gameState.status) updateInstruments();

      // Only set up restart button and microbit if instruments exist in main window
      // (instruments.html has its own restart button)
      if (doc === document) {
        const restartInstrument = document.getElementById("instruments-restart");
        const microbitInstrument = document.getElementById("instruments-microBitGauge");

        if (restartInstrument && restartInstrument.contentDocument) {
          restartInstrument.contentDocument.getElementById("restart").addEventListener("click", restartGame);
          restartInstrument.contentDocument.getElementById("restart").style = "cursor:pointer;";
        }

        if (microbitInstrument && microbitInstrument.contentDocument) {
          microbitInstrument.contentDocument.getElementById("circuit-board-top-layer").style = "cursor:pointer;";

          // Check if Web Serial API is supported
          if ("serial" in navigator) {
            microbitInstrument.contentDocument.getElementById("circuit-board-top-layer").setAttribute("fill", "#ffffff");
            microbitInstrument.contentDocument.getElementById("circuit-board-top-layer").addEventListener("click", connectToMicrobit);

            // Try to auto-connect when the game loads
            setTimeout(() => autoConnectToMicrobit(), 1000);
          } else {
            microbitInstrument.contentDocument.getElementById("circuit-board-top-layer").setAttribute("fill", "#ff0000");
          }
        }
      }
    }, 500);
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
