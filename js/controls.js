// Input handling for Submarine Controls

// Control configurations
const controlConfig = {
  thrusterIncrement: 5, // per keypress
  flapIncrement: 10, // per keypress
};

// Set up keyboard event listeners
function setupKeyboardControls() {
  // Key down handler for submarine controls
  document.addEventListener("keydown", handleKeyPress);

  // console.log("Press the TAB key to show/hide Sub data overlay.");
}

// Process key presses individually
function handleKeyPress(event) {
  // Make sure gameState exists
  if (!gameState || !gameState.controls) return;

  // console.log(event.key.toLowerCase());

  // Process the key press based on which key was pressed
  switch (event.key.toLowerCase()) {
    // sub-data-overlay
    case "tab":
      if (document.getElementById("sub-data-overlay").style.display == "block") {
        document.getElementById("sub-data-overlay").style.display = "none";
      } else {
        document.getElementById("sub-data-overlay").style.display = "block";
      }
      break;

    // Left thruster controls
    case "a":
      adjustLeftThruster(controlConfig.thrusterIncrement);
      break;
    case "z":
      adjustLeftThruster(-controlConfig.thrusterIncrement);
      break;

    // Right thruster controls
    case "s":
      adjustRightThruster(controlConfig.thrusterIncrement);
      break;

    case "x":
      adjustRightThruster(-controlConfig.thrusterIncrement);
      break;

    // Elevator (pitch) controls
    case "arrowup":
      adjustElevator(-controlConfig.flapIncrement);
      break;
    case "arrowdown":
      adjustElevator(controlConfig.flapIncrement);
      break;

    // Rudder (yaw) controls
    case "arrowleft":
      adjustRudder(controlConfig.flapIncrement);
      break;
    case "arrowright":
      adjustRudder(-controlConfig.flapIncrement);
      break;

    // Aft thruster controls
    case "p":
      adjustAftThruster(controlConfig.thrusterIncrement);
      break;
    case "l":
      adjustAftThruster(-controlConfig.thrusterIncrement);
      break;

    // Emergency controls
    case "b":
      emergencyBlowTanks();
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

  percent = clamp(
    percent * 0.01 * gameState.controls.maxPitchElevatorAngle,
    -gameState.controls.maxPitchElevatorAngle,
    gameState.controls.maxPitchElevatorAngle
  );
  gameState.controls.PitchElevatorAngle = (gameState.controls.PitchElevatorAngle + percent) / 2;

  // console.log(`Elevator Angle: ${gameState.controls.PitchElevatorAngle}%`);
}

/**
 * Sets the rudder angle to an absolute percentage value
 *
 * @param {number} percent - The percentage value (-100 to 100)
 */
function setRudder(percent) {
  if (!gameState || !gameState.controls) return;

  // percent *= 0.01 * gameState.controls.maxYawRudderAngle; // convert from percent to absolute
  percent = clamp(percent * 0.01 * gameState.controls.maxYawRudderAngle, -gameState.controls.maxYawRudderAngle, gameState.controls.maxYawRudderAngle);
  gameState.controls.YawRudderAngle = (gameState.controls.YawRudderAngle + percent) / 2;
  // console.log(`Rudder Angle: ${percent}%`);
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

/**
 * Emergency all stop - zeros all controls
 */
function emergencyAllStop() {
  console.log("EMERGENCY ALL STOP");
  gameState.controls.ThrottleLeft = 0;
  gameState.controls.ThrottleRight = 0;
  gameState.controls.AftThruster = 0;
  gameState.controls.PitchElevatorAngle = 0;
  gameState.controls.YawRudderAngle = 0;

  // Immediately stop all rotation
  gameState.angularVelocity.x = 0; // Stop pitch rotation
  gameState.angularVelocity.y = 0; // Stop yaw rotation
  gameState.angularVelocity.z = 0; // Stop roll rotation

  // Optionally reduce forward momentum (comment out if you want to coast)
  gameState.velocity.x *= 0.5; // Reduce sideways movement
  gameState.velocity.y *= 0.5; // Reduce vertical movement
  gameState.velocity.z *= 0.7; // Reduce forward/backward movement (keep some momentum)
}

// Initialize keyboard controls when the window loads
window.addEventListener("load", setupKeyboardControls, { once: true });

// ================ EXPORTED CONTROL API ================

// Export control functions for external use (such as from physical controls or UI)
window.submarineControls = {
  // Absolute control setters
  setLeftThruster, // Sets left thruster to an exact percentage value (-100 to 100) - Example: window.submarineControls.setLeftThruster(50);
  setRightThruster, // Sets right thruster to an exact percentage value (-100 to 100) - Example: window.submarineControls.setRightThruster(50);
  setElevator, // Sets elevator angle to an exact percentage value (-100 to 100) - Example: window.submarineControls.setElevator(-30);
  setRudder, // Sets rudder angle to an exact percentage value (-100 to 100) - Example: window.submarineControls.setRudder(25);
  setAftThruster, // Sets aft thruster to an exact percentage value (-100 to 100) - Example: window.submarineControls.setAftThruster(75);

  // Relative control adjusters
  adjustLeftThruster, // Increases/decreases left thruster by specified amount - Example: window.submarineControls.adjustLeftThruster(10);
  adjustRightThruster, // Increases/decreases right thruster by specified amount - Example: window.submarineControls.adjustRightThruster(-5);
  adjustElevator, // Increases/decreases elevator angle by specified amount - Example: window.submarineControls.adjustElevator(2);
  adjustRudder, // Increases/decreases rudder angle by specified amount - Example: window.submarineControls.adjustRudder(-3);
  adjustAftThruster, // Increases/decreases aft thruster by specified amount - Example: window.submarineControls.adjustAftThruster(15);

  // Special functions
  emergencyBlowTanks, // Performs emergency surfacing procedure (full upward pitch and aft thruster) - Example: window.submarineControls.emergencyBlowTanks();
  emergencyAllStop, // Performs emergency stop procedure  - Example: window.submarineControls.emergencyAllStop();
};
