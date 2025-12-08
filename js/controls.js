// Input handling for Submarine Controls

// Control configurations
const controlConfig = {
  thrusterIncrement: 5, // per keypress
  flapIncrement: 3, // per keypress
};

// Gamepad controller instance
let gamepadController = null;

// Set up keyboard and gamepad event listeners
function setupKeyboardControls() {
  // console.log("setupKeyboardControls called - keyboard listener attached");
  //console.log("window.gameState available:", !!window.gameState, "has controls:", !!window.gameState?.controls);

  // Key down handler for submarine controls
  document.addEventListener("keydown", handleKeyPress);

  // Initialize gamepad controller if available
  if (typeof SubmarineGamepadController !== "undefined") {
    gamepadController = new SubmarineGamepadController();
    // Note: Actual gamepad connection will be logged when a gamepad is detected
  }

  // console.log("Press the TAB key to show/hide Sub data overlay.");
}

// Process key presses individually
function handleKeyPress(event) {
  // Make sure gameState exists (access via window for file:// protocol compatibility)
  if (!window.gameState || !window.window.gameState.controls) {
    //console.log("handleKeyPress: gameState not ready", "window.gameState exists:", !!window.gameState);
    return;
  }

  // console.log("Key pressed:", event.key.toLowerCase());

  // Process the key press based on which key was pressed
  switch (event.key.toLowerCase()) {
    // Left thruster controls
    case "a":
      adjustPortThruster(controlConfig.thrusterIncrement);
      break;
    case "z":
      adjustPortThruster(-controlConfig.thrusterIncrement);
      break;

    // Right thruster controls
    case "s":
      adjustStarboardThruster(controlConfig.thrusterIncrement);
      break;

    case "x":
      adjustStarboardThruster(-controlConfig.thrusterIncrement);
      break;

    // Elevator (pitch) controls
    case "arrowup":
      adjustElevator(controlConfig.flapIncrement);
      break;
    case "arrowdown":
      adjustElevator(-controlConfig.flapIncrement);
      break;

    // Rudder (yaw) controls
    case "arrowleft":
      adjustRudder(controlConfig.flapIncrement);
      break;
    case "arrowright":
      adjustRudder(-controlConfig.flapIncrement);
      break;

    // Aft thruster controls
    case "d":
      adjustVerticalThruster(controlConfig.thrusterIncrement);
      break;
    case "c":
      adjustVerticalThruster(-controlConfig.thrusterIncrement);
      break;

    // grab target
    case "g":
      grabTarget();
      break;

    // Emergency brake
    case "escape":
      emergencyAllStop();
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
function setPortThruster(percent) {
  if (!window.gameState || !window.gameState.controls) return;

  window.gameState.controls.ThrottleLeft = Math.round(
    clamp(percent * 0.01 * window.gameState.controls.MaxThrottle, -window.gameState.controls.MaxThrottle, window.gameState.controls.MaxThrottle)
  );

  // console.log(`Left Thruster: ${window.gameState.controls.ThrottleLeft}%`);
}

/**
 * Sets the right thruster to an absolute percentage value
 *
 * @param {number} percent - The percentage value (-100 to 100)
 */
function setStarboardThruster(percent) {
  if (!window.gameState || !window.gameState.controls) return;

  window.gameState.controls.ThrottleRight = Math.round(
    clamp(percent * 0.01 * window.gameState.controls.MaxThrottle, -window.gameState.controls.MaxThrottle, window.gameState.controls.MaxThrottle)
  );

  // console.log(percent, `Right Thruster: ${window.gameState.controls.ThrottleRight}%`);
}

/**
 * Sets the elevator angle to an absolute percentage value
 *
 * @param {number} percent - The percentage value (-100 to 100)
 */
function setElevator(percent) {
  if (!window.gameState || !window.gameState.controls) return;

  // Convert percentage to actual angle value and clamp to valid range
  window.gameState.controls.PitchElevatorAngle = Math.round(
    clamp(
      percent * 0.01 * window.gameState.controls.maxPitchElevatorAngle,
      -window.gameState.controls.maxPitchElevatorAngle,
      window.gameState.controls.maxPitchElevatorAngle
    )
  );

  // console.log(`Elevator Angle: ${window.gameState.controls.PitchElevatorAngle}%`);
}

/**
 * Sets the rudder angle to an absolute percentage value
 *
 * @param {number} percent - The percentage value (-100 to 100)
 */
function setRudder(percent) {
  if (!window.gameState || !window.gameState.controls) return;

  // Convert percentage to actual angle value and clamp to valid range
  window.gameState.controls.YawRudderAngle = Math.round(
    clamp(
      percent * 0.01 * window.gameState.controls.maxYawRudderAngle,
      -window.gameState.controls.maxYawRudderAngle,
      window.gameState.controls.maxYawRudderAngle
    )
  );

  // console.log(`Rudder Angle: ${window.gameState.controls.YawRudderAngle}%`);
}

/**
 * Sets the aft thruster to an absolute percentage value
 *
 * @param {number} percent - The percentage value (-100 to 100)
 */
function setVerticalThruster(percent) {
  if (!window.gameState || !window.gameState.controls) return;

  window.gameState.controls.VerticalThruster = Math.round(
    clamp(percent, -window.gameState.controls.MaxVerticalThruster, window.gameState.controls.MaxVerticalThruster)
  );

  // console.log(`Aft Thruster: ${window.gameState.controls.VerticalThruster}%`);
}

// ================ ADJUSTMENT WRAPPER FUNCTIONS ================

/**
 * Adjusts the left thruster by the specified amount
 *
 * @param {number} amount - Amount to adjust by (-100 to 100)
 */
function adjustPortThruster(amount) {
  if (!window.gameState || !window.gameState.controls) {
    // console.log("adjustPortThruster: gameState not ready");
    return;
  }
  // console.log(`adjustPortThruster called: ${amount}, current: ${window.gameState.controls.ThrottleLeft}`);
  // ThrottleLeft is already in the range -100 to 100, so just add and clamp directly
  window.gameState.controls.ThrottleLeft = Math.round(
    clamp(window.gameState.controls.ThrottleLeft + amount, -window.gameState.controls.MaxThrottle, window.gameState.controls.MaxThrottle)
  );
  // console.log(`New ThrottleLeft: ${window.gameState.controls.ThrottleLeft}`);
}

/**
 * Adjusts the right thruster by the specified amount
 *
 * @param {number} amount - Amount to adjust by (-100 to 100)
 */
function adjustStarboardThruster(amount) {
  if (!window.gameState || !window.gameState.controls) {
    // console.log("adjustStarboardThruster: gameState not ready");
    return;
  }
  // console.log(`adjustStarboardThruster called: ${amount}, current: ${window.gameState.controls.ThrottleRight}`);
  // ThrottleRight is already in the range -100 to 100, so just add and clamp directly
  window.gameState.controls.ThrottleRight = Math.round(
    clamp(window.gameState.controls.ThrottleRight + amount, -window.gameState.controls.MaxThrottle, window.gameState.controls.MaxThrottle)
  );
  // console.log(`New ThrottleRight: ${window.gameState.controls.ThrottleRight}`);
}

/**
 * Adjusts the elevator angle by the specified amount
 *
 * @param {number} amount - Amount to adjust by (-100 to 100)
 */
function adjustElevator(amount) {
  if (!window.gameState || !window.gameState.controls) return;
  // Convert current angle to percentage, add the increment, then pass to setElevator
  const currentPercent = (window.gameState.controls.PitchElevatorAngle / window.gameState.controls.maxPitchElevatorAngle) * 100;
  const newPercent = currentPercent + (amount / window.gameState.controls.maxPitchElevatorAngle) * 100;
  setElevator(newPercent);
}

/**
 * Adjusts the rudder angle by the specified amount
 *
 * @param {number} amount - Amount to adjust by (-100 to 100)
 */
function adjustRudder(amount) {
  if (!window.gameState || !window.gameState.controls) return;
  // Convert current angle to percentage, add the increment, then pass to setRudder
  const currentPercent = (window.gameState.controls.YawRudderAngle / window.gameState.controls.maxYawRudderAngle) * 100;
  const newPercent = currentPercent + (amount / window.gameState.controls.maxYawRudderAngle) * 100;
  setRudder(newPercent);
}

/**
 * Adjusts the aft thruster by the specified amount
 *
 * @param {number} amount - Amount to adjust by (-100 to 100)
 */
function adjustVerticalThruster(amount) {
  if (!window.gameState || !window.gameState.controls) return;
  setVerticalThruster(window.gameState.controls.VerticalThruster + amount);
}

/**
 * Updates submarine controls from gamepad input
 * Call this every frame to process gamepad input
 */
function updateGamepadControls() {
  if (!gamepadController || !gamepadController.isConnected()) return;

  gamepadController.update();
  const controls = gamepadController.getControls();

  // Apply thruster values directly (bypassing the averaging in set functions)
  // Convert -1 to 1 range to actual throttle values
  if (gameState && window.gameState.controls) {
    window.gameState.controls.ThrottleLeft = Math.round(controls.leftThruster * window.gameState.controls.MaxThrottle);
    window.gameState.controls.ThrottleRight = Math.round(controls.rightThruster * window.gameState.controls.MaxThrottle);

    // Apply rudder and elevator with light smoothing for stability
    const targetRudder = Math.round(controls.rudder * window.gameState.controls.maxYawRudderAngle);
    const targetElevator = Math.round(controls.elevator * window.gameState.controls.maxPitchElevatorAngle);

    // Smooth transition (70% new value, 30% old value) - less aggressive than before
    window.gameState.controls.YawRudderAngle = Math.round(targetRudder * 0.7 + window.gameState.controls.YawRudderAngle * 0.3);
    window.gameState.controls.PitchElevatorAngle = Math.round(targetElevator * 0.7 + window.gameState.controls.PitchElevatorAngle * 0.3);
  }

  // Handle emergency controls
  if (controls.blowTanks) {
    emergencyBlowTanks();
  }

  if (controls.allStop) {
    emergencyAllStop();
  }

  if (controls.grabTarget) {
    grabTarget();
  }
}

/**
 * Emergency procedure to rapidly rise to the surface NOT CURRENTLY USED
 */
function emergencyBlowTanks() {
  if (Date.now() - window.gameState.controls.BlowTanksLastUsedTime < 5000) return; // debounce physical buttons

  console.log("EMERGENCY: Blowing tanks!");

  // Set full upward pitch
  setElevator(window.gameState.controls.maxPitchElevatorAngle);

  // Set full upward aft thruster
  setVerticalThruster(window.gameState.controls.MaxVerticalThruster);
  //this is not working as it is overwritten by joystick
}

function grabTarget() {
  // If already grabbed, drop it instead
  // if (gameState.navigation.targetGrabbed) {
  //   console.log("Dropping target!");
  //   gameState.navigation.targetGrabbed = false;
  //   gameState.navigation.targetFallVelocity = -20; // Start falling
  //   if (typeof appendInstrumentConsoleMessage === "function") {
  //     appendInstrumentConsoleMessage("💎 Target released! It's falling!");
  //   }
  //   return;
  // }

  // Calculate vector from submarine to target
  const dx = gameState.navigation.targetPosition.x - gameState.position.x;
  const dy = gameState.navigation.targetPosition.y - gameState.position.y;
  const dz = gameState.navigation.targetPosition.z - gameState.position.z;

  // Calculate distance to target
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Check if close enough
  if (distance > 50) {
    console.log(`Target too far away: ${distance.toFixed(2)} units`);
    return;
  }

  // Get submarine's forward direction vector
  // In Three.js, camera looks down -Z axis in local space
  const pitch = THREE.MathUtils.degToRad(gameState.rotation.x);
  const yaw = THREE.MathUtils.degToRad(gameState.rotation.y);

  // Create forward vector (looking down -Z axis)
  const forwardX = -Math.sin(yaw) * Math.cos(pitch);
  const forwardY = Math.sin(pitch);
  const forwardZ = -Math.cos(yaw) * Math.cos(pitch);

  // Normalize the direction to target
  const targetDirX = dx / distance;
  const targetDirY = dy / distance;
  const targetDirZ = dz / distance;

  // Calculate dot product to get angle
  const dotProduct = forwardX * targetDirX + forwardY * targetDirY + forwardZ * targetDirZ;
  const angleInRadians = Math.acos(Math.max(-1, Math.min(1, dotProduct)));
  const angleInDegrees = angleInRadians * (180 / Math.PI);

  // Check if within ±30 degrees
  if (angleInDegrees > 40) {
    console.log(`Target not in front: ${angleInDegrees.toFixed(1)} degrees off`);
    return;
  }

  // Success! Grab the target
  console.log("TARGET GRABBED!");
  gameState.navigation.targetGrabbed = true;

  // Show message to user
  if (typeof appendInstrumentConsoleMessage === "function") {
    appendInstrumentConsoleMessage("Target Grabbed. Return to surface to win!");
  }
}

/**
 * Emergency all stop - zeros all controls
 */
function emergencyAllStop() {
  if (Date.now() - window.gameState.controls.AllStopLastUsedTime < 3000) return; // debounce physical buttons

  console.log("EMERGENCY ALL STOP");
  window.gameState.controls.ThrottleLeft = 0;
  window.gameState.controls.ThrottleRight = 0;
  window.gameState.controls.VerticalThruster = 0;
  window.gameState.controls.PitchElevatorAngle = 0;
  window.gameState.controls.YawRudderAngle = 0;

  // Immediately stop all rotation
  window.gameState.angularVelocity.x = 0; // Stop pitch rotation
  window.gameState.angularVelocity.y = 0; // Stop yaw rotation
  window.gameState.angularVelocity.z = 0; // Stop roll rotation

  // Immediately stop all velocity
  window.gameState.velocity.x = 0;
  window.gameState.velocity.y = 0;
  window.gameState.velocity.z = 0;
}

// Initialize keyboard controls when the window loads
window.addEventListener(
  "load",
  function () {
    // Wait a bit for all scripts to finish loading (especially in file:// mode)
    setTimeout(setupKeyboardControls, 100);
  },
  { once: true }
);

// Expose handleKeyPress globally for cross-window communication
window.handleKeyPress = handleKeyPress;

// ================ EXPORTED CONTROL API ================

// Export control functions for external use (such as from physical controls or UI)
window.submarineControls = {
  // Absolute control setters
  setPortThruster, // Sets left thruster to an exact percentage value (-100 to 100) - Example: window.submarineControls.setPortThruster(50);
  setStarboardThruster, // Sets right thruster to an exact percentage value (-100 to 100) - Example: window.submarineControls.setStarboardThruster(50);
  setElevator, // Sets elevator angle to an exact percentage value (-100 to 100) - Example: window.submarineControls.setElevator(-30);
  setRudder, // Sets rudder angle to an exact percentage value (-100 to 100) - Example: window.submarineControls.setRudder(25);
  setVerticalThruster, // Sets aft thruster to an exact percentage value (-100 to 100) - Example: window.submarineControls.setVerticalThruster(75);

  // Relative control adjusters
  adjustPortThruster, // Increases/decreases left thruster by specified amount - Example: window.submarineControls.adjustPortThruster(10);
  adjustStarboardThruster, // Increases/decreases right thruster by specified amount - Example: window.submarineControls.adjustStarboardThruster(-5);
  adjustElevator, // Increases/decreases elevator angle by specified amount - Example: window.submarineControls.adjustElevator(2);
  adjustRudder, // Increases/decreases rudder angle by specified amount - Example: window.submarineControls.adjustRudder(-3);
  adjustVerticalThruster, // Increases/decreases aft thruster by specified amount - Example: window.submarineControls.adjustVerticalThruster(15);

  // Special functions
  emergencyBlowTanks, // Performs emergency surfacing procedure (full upward pitch and aft thruster) - Example: window.submarineControls.emergencyBlowTanks();
  emergencyAllStop, // Performs emergency stop procedure  - Example: window.submarineControls.emergencyAllStop();
  grabTarget, // Attempts to grab the target if within range - Example: window.submarineControls.grabTarget();

  // Gamepad update function (call this in the game loop)
  updateGamepadControls, // Updates controls from gamepad if connected and in use - Example: window.submarineControls.updateGamepadControls();
};
