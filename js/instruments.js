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
  const doc = window.instrumentsWindow && !window.instrumentsWindow.closed ? window.instrumentsWindow.document : document;

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
  if (!gameState || !gameState.status) return;
  const depth = ((gameState.constants.waterSurface - gameState.position.y) / gameState.constants.waterSurface) * 100;

  // console.log("depth:" + Math.round(depth) + " Y:" + Math.round(gameState.position.y));
  // Get the SVG's content document
  const svgDoc = getSVGContentDocument("depthGauge");
  if (!svgDoc) return;

  // Call the SVG's internal update function
  if (svgDoc.defaultView && svgDoc.defaultView.updateInstrument) {
    svgDoc.defaultView.updateInstrument(depth);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_distanceToTarget() {
  if (!gameState || !gameState.navigation) return;
  const distanceToTarget = gameState.navigation.distanceToTarget;

  const svgDoc = getSVGContentDocument("targetGauge");
  if (!svgDoc) return;

  if (svgDoc.defaultView && svgDoc.defaultView.updateInstrument) {
    svgDoc.defaultView.updateInstrument(distanceToTarget);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_compassHeading() {
  const compassHeading = gameState.navigation.compassHeading;

  const svgDoc = getSVGContentDocument("compassGauge");
  if (!svgDoc) return;

  if (svgDoc.defaultView && svgDoc.defaultView.updateInstrument) {
    svgDoc.defaultView.updateInstrument(compassHeading);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_currentSpeed() {
  if (!gameState || !gameState.navigation) return;

  // console.log("currentSpeed:" + Math.round(gameState.navigation.currentSpeedAsPercentage) + "%");
  const svgDoc = getSVGContentDocument("speedGauge");
  if (!svgDoc) return;

  if (svgDoc.defaultView && svgDoc.defaultView.updateInstrument) {
    svgDoc.defaultView.updateInstrument(gameState.navigation.currentSpeedAsPercentage);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_pitch() {
  if (!gameState || !gameState.rotation) return;
  const pitch = gameState.rotation.x;

  const svgDoc = getSVGContentDocument("pitchGauge");
  if (!svgDoc) return;

  if (svgDoc.defaultView && svgDoc.defaultView.updateInstrument) {
    // Pass pitch directly in degrees (SVG expects -25 to +25 degrees)
    svgDoc.defaultView.updateInstrument(Math.round(pitch));
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_leftThrust() {
  const leftThrust = gameState.controls.ThrottleLeft;

  const svgDoc = getSVGContentDocument("leftThrustGauge");
  if (!svgDoc) return;

  if (svgDoc.defaultView && svgDoc.defaultView.updateInstrument) {
    svgDoc.defaultView.updateInstrument(leftThrust);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_rightThrust() {
  const rightThrust = gameState.controls.ThrottleRight;

  const svgDoc = getSVGContentDocument("rightThrustGauge");
  if (!svgDoc) return;

  if (svgDoc.defaultView && svgDoc.defaultView.updateInstrument) {
    svgDoc.defaultView.updateInstrument(rightThrust);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_rudder() {
  if (!gameState || !gameState.controls) return;
  const rudder = gameState.controls.YawRudderAngle;

  const svgDoc = getSVGContentDocument("rudderGauge");
  if (!svgDoc) return;

  if (svgDoc.defaultView && svgDoc.defaultView.updateInstrument) {
    // Pass rudder value directly (already in correct range)
    svgDoc.defaultView.updateInstrument(Math.round(rudder));
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_elevator() {
  if (!gameState || !gameState.controls) return;
  const elevator = gameState.controls.PitchElevatorAngle;

  const svgDoc = getSVGContentDocument("elevatorGauge");
  if (!svgDoc) return;

  if (svgDoc.defaultView && svgDoc.defaultView.updateInstrument) {
    // Pass elevator value directly (already in correct range)
    svgDoc.defaultView.updateInstrument(Math.round(elevator));
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_verticalThruster() {
  const verticalThruster = gameState.controls.VerticalThruster;

  const svgDoc = getSVGContentDocument("verticalThrusterGauge");
  if (!svgDoc) return;

  if (svgDoc.defaultView && svgDoc.defaultView.updateInstrument) {
    svgDoc.defaultView.updateInstrument(verticalThruster);
  }
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
      const doc = window.instrumentsWindow && !window.instrumentsWindow.closed ? window.instrumentsWindow.document : document;

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
    updateInstruments_pitch();
    updateInstruments_leftThrust();
    updateInstruments_rightThrust();
    updateInstruments_rudder();
    updateInstruments_elevator();
    updateInstruments_verticalThruster();
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////
