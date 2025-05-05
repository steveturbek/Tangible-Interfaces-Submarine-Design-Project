// Input handling for Submarine Controls

// Control configurations
const controlConfig = {
  thrusterIncrement: 10, // 10% per keypress
  flapIncrement: 1, // 10% per keypress
};

// Define our debug toggle key (backtick key)
const DEBUG_TOGGLE_KEY = "Backquote"; // This is the ` key (backtick)

// Track the debug overlay state
let debugOverlayVisible = false;

// Set up keyboard event listeners
function setupKeyboardControls() {
  // Key down handler for submarine controls
  document.addEventListener("keydown", handleKeyPress);

  // Key down handler for debug overlay toggle
  document.addEventListener("keydown", function (event) {
    // Check if the key pressed is our debug toggle key (backtick)
    if (event.code === DEBUG_TOGGLE_KEY) {
      // Toggle debug visibility
      debugOverlayVisible = !debugOverlayVisible;

      // Update debug overlay visibility
      const debugOverlay = document.getElementById("debug-overlay");
      if (debugOverlay) {
        debugOverlay.style.display = debugOverlayVisible ? "block" : "none";
      } else {
        // If the overlay doesn't exist, create it dynamically
        createDebugOverlay();
      }

      console.log("Debug overlay toggled:", debugOverlayVisible ? "visible" : "hidden");

      // Prevent default behavior for our toggle key
      event.preventDefault();
    }
  });

  // Ensure the debug overlay exists
  ensureDebugOverlayExists();

  console.log(`Debug overlay toggle initialized. Press the \`${DEBUG_TOGGLE_KEY}\` key to toggle.`);
}

// Create debug overlay dynamically if it doesn't exist
function ensureDebugOverlayExists() {
  if (!document.getElementById("debug-overlay")) {
    createDebugOverlay();
  }
}

// Create the debug overlay elements
function createDebugOverlay() {
  // Create the overlay container
  const debugOverlay = document.createElement("div");
  debugOverlay.id = "debug-overlay";
  debugOverlay.style.position = "absolute";
  debugOverlay.style.top = "10px";
  debugOverlay.style.left = "0";
  debugOverlay.style.width = "100%";
  debugOverlay.style.zIndex = "30";
  debugOverlay.style.display = debugOverlayVisible ? "block" : "none";
  debugOverlay.style.textAlign = "center";
  debugOverlay.style.pointerEvents = "none";

  // Create the text container
  const debugText = document.createElement("pre");
  debugText.id = "debug-text";
  debugText.style.display = "inline-block";
  debugText.style.margin = "0 auto";
  debugText.style.padding = "5px 10px";
  debugText.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  debugText.style.color = "#00ff00";
  debugText.style.fontFamily = "monospace";
  debugText.style.fontSize = "12px";
  debugText.style.borderRadius = "5px";
  debugText.style.textAlign = "left";
  debugText.style.maxWidth = "80%";

  // Add text container to overlay
  debugOverlay.appendChild(debugText);

  // Add overlay to the container
  const container = document.getElementById("container");
  if (container) {
    container.appendChild(debugOverlay);
  } else {
    document.body.appendChild(debugOverlay);
  }

  console.log("Debug overlay created dynamically");
}

// Process key presses individually
function handleKeyPress(event) {
  // Make sure gameState exists
  if (!gameState || !gameState.controls) return;

  // Process the key press based on which key was pressed
  switch (event.key.toLowerCase()) {
    // Left thruster controls
    case "q":
    case "u":
      adjustLeftThruster(controlConfig.thrusterIncrement);
      break;
    case "z":
    case "m":
      adjustLeftThruster(-controlConfig.thrusterIncrement);
      break;

    // Right thruster controls
    case "e":
    case "o":
      adjustRightThruster(controlConfig.thrusterIncrement);
      break;
    case "c":
    case ".":
      adjustRightThruster(-controlConfig.thrusterIncrement);
      break;

    // Elevator (pitch) controls
    case "w":
    case "i":
      adjustElevator(controlConfig.thrusterIncrement);
      break;
    case "s":
    case "k":
      adjustElevator(-controlConfig.thrusterIncrement);
      break;

    // Rudder (yaw) controls
    case "a":
    case "j":
      adjustRudder(-controlConfig.thrusterIncrement);
      break;
    case "d":
    case "l":
      adjustRudder(controlConfig.thrusterIncrement);
      break;

    // Aft thruster controls
    case "2":
    case "8":
      adjustAftThruster(controlConfig.thrusterIncrement);
      break;
    case "x":
    case ",":
      adjustAftThruster(-controlConfig.thrusterIncrement);
      break;

    // Emergency controls
    case "b":
      emergencyBlowTanks();
      break;

    default:
      // Key not mapped, do nothing
      return;
  }

  // Prevent default behavior for our control keys
  event.preventDefault();
}

// ================ UTILITY FUNCTIONS ================

/**
 * Clamps a value between a minimum and maximum
 *
 * @param {number} value - The value to clamp
 * @param {number} min - The minimum allowed value
 * @param {number} max - The maximum allowed value
 * @returns {number} - The clamped value
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Sets the left thruster to an absolute percentage value
 *
 * @param {number} percent - The percentage value (-100 to 100)
 */
function setLeftThruster(percent) {
  if (!gameState || !gameState.controls) return;

  gameState.controls.ThrottleLeft = clamp(percent, -gameState.controls.MaxThrottle, gameState.controls.MaxThrottle);

  console.log(`Left Thruster: ${gameState.controls.ThrottleLeft}%`);
}

/**
 * Sets the right thruster to an absolute percentage value
 *
 * @param {number} percent - The percentage value (-100 to 100)
 */
function setRightThruster(percent) {
  if (!gameState || !gameState.controls) return;

  gameState.controls.ThrottleRight = clamp(percent, -gameState.controls.MaxThrottle, gameState.controls.MaxThrottle);

  console.log(`Right Thruster: ${gameState.controls.ThrottleRight}%`);
}

/**
 * Sets the elevator angle to an absolute percentage value
 *
 * @param {number} percent - The percentage value (-100 to 100)
 */
function setElevator(percent) {
  if (!gameState || !gameState.controls) return;

  gameState.controls.PitchElevatorAngle = clamp(percent, -gameState.controls.maxPitchElevatorAngle, gameState.controls.maxPitchElevatorAngle);

  console.log(`Elevator Angle: ${gameState.controls.PitchElevatorAngle}%`);
}

/**
 * Sets the rudder angle to an absolute percentage value
 *
 * @param {number} percent - The percentage value (-100 to 100)
 */
function setRudder(percent) {
  if (!gameState || !gameState.controls) return;

  gameState.controls.YawRudderAngle = clamp(percent, -gameState.controls.maxRudderAngle, gameState.controls.maxRudderAngle);

  console.log(`Rudder Angle: ${gameState.controls.YawRudderAngle}%`);
}

/**
 * Sets the aft thruster to an absolute percentage value
 *
 * @param {number} percent - The percentage value (-100 to 100)
 */
function setAftThruster(percent) {
  if (!gameState || !gameState.controls) return;

  gameState.controls.AftThruster = clamp(percent, -gameState.controls.MaxAftThruster, gameState.controls.MaxAftThruster);

  console.log(`Aft Thruster: ${gameState.controls.AftThruster}%`);
}

// ================ ADJUSTMENT WRAPPER FUNCTIONS ================

/**
 * Adjusts the left thruster by the specified amount
 *
 * @param {number} amount - Amount to adjust by (-100 to 100)
 */
function adjustLeftThruster(amount) {
  if (!gameState || !gameState.controls) return;
  setLeftThruster(gameState.controls.ThrottleLeft + amount);
}

/**
 * Adjusts the right thruster by the specified amount
 *
 * @param {number} amount - Amount to adjust by (-100 to 100)
 */
function adjustRightThruster(amount) {
  if (!gameState || !gameState.controls) return;
  setRightThruster(gameState.controls.ThrottleRight + amount);
}

/**
 * Adjusts the elevator angle by the specified amount
 *
 * @param {number} amount - Amount to adjust by (-100 to 100)
 */
function adjustElevator(amount) {
  if (!gameState || !gameState.controls) return;
  setElevator(gameState.controls.PitchElevatorAngle + amount);
}

/**
 * Adjusts the rudder angle by the specified amount
 *
 * @param {number} amount - Amount to adjust by (-100 to 100)
 */
function adjustRudder(amount) {
  if (!gameState || !gameState.controls) return;
  setRudder(gameState.controls.YawRudderAngle + amount);
}

/**
 * Adjusts the aft thruster by the specified amount
 *
 * @param {number} amount - Amount to adjust by (-100 to 100)
 */
function adjustAftThruster(amount) {
  if (!gameState || !gameState.controls) return;
  setAftThruster(gameState.controls.AftThruster + amount);
}

/**
 * Emergency procedure to rapidly rise to the surface
 */
function emergencyBlowTanks() {
  console.log("EMERGENCY: Blowing tanks!");

  // Set full upward pitch
  setElevator(gameState.controls.maxPitchElevatorAngle);

  // Set full upward aft thruster
  setAftThruster(gameState.controls.MaxAftThruster);
}

// Initialize keyboard controls when the window loads
window.addEventListener("load", setupKeyboardControls, { once: true });

// ================ EXPORTED CONTROL API ================

// Export control functions for external use (such as from physical controls or UI)
window.submarineControls = {
  // Absolute control setters
  setLeftThruster,
  setRightThruster,
  setElevator,
  setRudder,
  setAftThruster,

  // Relative control adjusters
  adjustLeftThruster,
  adjustRightThruster,
  adjustElevator,
  adjustRudder,
  adjustAftThruster,

  // Special functions
  emergencyBlowTanks,

  // Debug overlay functions
  isDebugOverlayVisible: function () {
    return debugOverlayVisible;
  },

  toggleDebugOverlay: function (show) {
    if (show !== undefined) {
      debugOverlayVisible = show;
    } else {
      debugOverlayVisible = !debugOverlayVisible;
    }

    const debugOverlay = document.getElementById("debug-overlay");
    if (debugOverlay) {
      debugOverlay.style.display = debugOverlayVisible ? "block" : "none";
    }

    return debugOverlayVisible;
  },
};
