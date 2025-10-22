//Update the cockpit instrument displays

/*
Instrument values in the game
window.gameState.status.oxygenLevel
window.gameState.status.batteryLevel
window.gameState.status.depth
window.gameState.navigation.distanceToTarget
window.gameState.navigation.compassHeading
window.gameState.navigation.currentSpeed
 */

// ========================================
// HELPER FUNCTION - Gets SVG content document
// ========================================
function getSVGContentDocument(svgElementId) {
  // Check if instruments are in a separate window
  try {
    const doc = window.instrumentsWindow && !window.instrumentsWindow.closed ? window.instrumentsWindow.document : document;
    const svgObject = doc.getElementById(svgElementId);
    if (!svgObject || !svgObject.contentDocument) return null;
    return svgObject.contentDocument;
  } catch (e) {
    // Cross-origin access blocked in file:// mode - try main document
    const svgObject = document.getElementById(svgElementId);
    if (!svgObject || !svgObject.contentDocument) return null;
    return svgObject.contentDocument;
  }
}

// ========================================
// SIMPLIFIED UPDATE FUNCTIONS
// Each function gets a value and calls the SVG's internal updateInstrument() function
// ========================================

function updateInstruments_Oxygen() {
  const oxygenLevel = window.gameState.status.oxygenLevel;

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
  const batteryLevel = window.gameState.status.batteryLevel;

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
  if (!gameState || !window.gameState.status) return;
  const depth = ((window.gameState.constants.waterSurface - window.gameState.position.y) / window.gameState.constants.waterSurface) * 100;

  // console.log("depth:" + Math.round(depth) + " Y:" + Math.round(window.gameState.position.y));
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
  if (!gameState || !window.gameState.navigation) return;
  const distanceToTarget = window.gameState.navigation.distanceToTarget;

  const svgDoc = getSVGContentDocument("targetGauge");
  if (!svgDoc) return;

  if (svgDoc.defaultView && svgDoc.defaultView.updateInstrument) {
    svgDoc.defaultView.updateInstrument(distanceToTarget);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_compassHeading() {
  const compassHeading = window.gameState.navigation.compassHeading;

  const svgDoc = getSVGContentDocument("compassGauge");
  if (!svgDoc) return;

  if (svgDoc.defaultView && svgDoc.defaultView.updateInstrument) {
    svgDoc.defaultView.updateInstrument(compassHeading);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_currentSpeed() {
  if (!gameState || !window.gameState.navigation) return;

  // console.log("currentSpeed:" + Math.round(window.gameState.navigation.currentSpeedAsPercentage) + "%");
  const svgDoc = getSVGContentDocument("speedGauge");
  if (!svgDoc) return;

  if (svgDoc.defaultView && svgDoc.defaultView.updateInstrument) {
    svgDoc.defaultView.updateInstrument(window.gameState.navigation.currentSpeedAsPercentage);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_pitch() {
  if (!gameState || !window.gameState.rotation) return;
  const pitch = window.gameState.rotation.x;

  // Convert pitch to percentage (-100% to +100%), then map to SVG's -25 to +25 degree display range
  const pitchPercent = (pitch / window.gameState.controls.maxPitchElevatorAngle) * 100;
  const pitchForDisplay = (pitchPercent / 100) * 25; // Map percentage to ±25 degrees for display

  const svgDoc = getSVGContentDocument("pitchGauge");
  if (!svgDoc) return;

  if (svgDoc.defaultView && svgDoc.defaultView.updateInstrument) {
    // Pass pitch as a value scaled to ±25 degrees
    svgDoc.defaultView.updateInstrument(Math.round(pitchForDisplay));
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_leftThrust() {
  const leftThrust = window.gameState.controls.ThrottleLeft;

  const svgDoc = getSVGContentDocument("leftThrustGauge");
  if (!svgDoc) return;

  if (svgDoc.defaultView && svgDoc.defaultView.updateInstrument) {
    svgDoc.defaultView.updateInstrument(leftThrust);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_rightThrust() {
  const rightThrust = window.gameState.controls.ThrottleRight;

  const svgDoc = getSVGContentDocument("rightThrustGauge");
  if (!svgDoc) return;

  if (svgDoc.defaultView && svgDoc.defaultView.updateInstrument) {
    svgDoc.defaultView.updateInstrument(rightThrust);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_rudder() {
  if (!gameState || !window.gameState.controls) return;
  const rudder = window.gameState.controls.YawRudderAngle;

  // Convert rudder angle to percentage (-100% to +100%)
  const rudderPercent = (rudder / window.gameState.controls.maxYawRudderAngle) * 100;

  const svgDoc = getSVGContentDocument("rudderGauge");
  if (!svgDoc) return;

  if (svgDoc.defaultView && svgDoc.defaultView.updateInstrument) {
    // Pass rudder value as percentage
    svgDoc.defaultView.updateInstrument(Math.round(rudderPercent));
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_elevator() {
  if (!gameState || !window.gameState.controls) return;
  const elevator = window.gameState.controls.PitchElevatorAngle;

  // Convert elevator angle to percentage (-100% to +100%)
  const elevatorPercent = (elevator / window.gameState.controls.maxPitchElevatorAngle) * 100;

  const svgDoc = getSVGContentDocument("elevatorGauge");
  if (!svgDoc) return;

  if (svgDoc.defaultView && svgDoc.defaultView.updateInstrument) {
    // Pass elevator value as percentage
    svgDoc.defaultView.updateInstrument(Math.round(elevatorPercent));
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
function updateInstruments_verticalThruster() {
  const verticalThruster = window.gameState.controls.VerticalThruster;

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
      // Set initial state
      if (window.gameState && window.gameState.status) updateInstruments();

      // Check if instruments are in a separate window
      let doc = document;
      try {
        if (window.instrumentsWindow && !window.instrumentsWindow.closed) {
          doc = window.instrumentsWindow.document;
        }
      } catch (e) {
        // Cross-origin access blocked in file:// mode - use main document
      }

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
  if (gameState && window.gameState.status) {
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
