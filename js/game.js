// Submarine Game State Structure
const gameState_original = {
  // Position & Orientation (using Three.js coordinate system)
  position: { x: 0, y: 10, z: 0 }, // x: right/left, y: up/down, z: forward/backward
  rotation: { x: 0, y: 0, z: 0 }, // x: pitch, y: yaw, z: roll - start facing forward (down -Z axis)
  velocity: { x: 0, y: 0, z: 0 }, // velocity vector in Three.js coordinates
  angularVelocity: { x: 0, y: 0, z: 0 }, // rotation speed in Three.js coordinates

  // Controls & Input (player inputs or AI controls)
  controls: {
    ThrottleLeft: 0, // -100 to +100 (reverse to forward)
    ThrottleRight: 0, // -100 to +100 (reverse to forward)
    MaxThrottle: 100, // absolute number

    //Elevator flaps on the horizontal tail produce pitch
    PitchElevatorAngle: 0, // -100 to +100 (down to up)
    maxPitchElevatorAngle: 45, // absolute number

    //rudder on the vertical tail produces yaw
    YawRudderAngle: 0, // -100 to +100 (left to right)
    maxYawRudderAngle: 30, // absolute number

    //Aft Thruster on the horizontal tail produce pitch
    VerticalThruster: 0, // -100 to +100 (down to up)
    MaxVerticalThruster: 100, // absolute number
    AllStopLastUsedTime: Date.now(),
    BlowTanksLastUsedTime: Date.now(),
    // Not using roll  targetRoll: 0, // -100 to +100 (optional: left bank to right bank)
  },

  // Resources & Status
  status: {
    oxygenLevel: 100, // 0-100%
    batteryLevel: 100, // 0-100%
    lastBatteryWarning: 100, // Track last battery warning threshold
    // hullIntegrity: 100, // 0-100% (optional: damage model)
    depth: 0, // 0 to (waterSurface - seabedDepth) in world units
    boundaryWarning: true, // Flag to indicate proximity to boundaries
  },

  // Navigation & Environment
  navigation: {
    targetPosition: { x: 0, y: 10, z: -1200 }, // target location
    distanceToTarget: 0, // 0-100% (scaled)
    headingToTarget: 0, // 0-359 degrees
    // proximityWarning: 0, // 0-100% (distance to nearest obstacle)
    currentSpeedAsPercentage: 0, // 0-100% (scalar speed value)
    compassHeading: 0, // 0-359 degrees
    targetGrabbed: false, // Has the target been grabbed?
    targetFallVelocity: 0, // Falling speed when dropped
  },

  // Game Constants (configure as needed)
  constants: {
    maxOxygenTime: 300, // 5 minutes in seconds
    maxBatteryTime: 300, // 2.5 minutes at full throttle
    maxSpeed: 10, // Units per second at 100% throttle
    maxYawRate: 20, // Maximum yaw rate in degrees per second
    dragCoefficient: 0.05, // Water resistance factor
    mass: 1000, // Mass affects momentum
    maxDistance: 100000, // Example value, adjust based on your world size
    worldBoundary: 2000,
    worldBoundaryVisible: 4000, //defines how far you can see. 4x worldBoundary seems to look good
    seabedDepth: 0, // Depth of the seabed from rendering.js
    waterSurface: 400, // Water surface level from rendering.js (doubled from 100 to 200)
    // Maximum possible distance in world: diagonal from corner to corner
    // sqrt(worldBoundary^2 + waterSurface^2 + worldBoundary^2) = sqrt(2000^2 + 400^2 + 2000^2) ≈ 2840
    maxWorldDistance: 0, // to be calculated later
  },
  // Game time tracking
  time: {
    elapsed: 0, // Total game time in seconds
    deltaTime: 0, // Time since last update (for physics)
    logTimeCounter: 0, // Temporary count of time to count up to logTimeLengthMS
    logTimeCounterLengthMS: 0.5, //500 milliseconds
  },
};

gameState_original.position.y = gameState_original.constants.waterSurface - 10;
gameState_original.constants.maxWorldDistance = Math.sqrt(
  gameState_original.constants.worldBoundary * gameState_original.constants.worldBoundary +
    gameState_original.constants.waterSurface * gameState_original.constants.waterSurface +
    gameState_original.constants.worldBoundary * gameState_original.constants.worldBoundary
);

const gameState = [];

Object.keys(gameState_original).forEach((key) => {
  if (typeof gameState_original[key] === "object" && gameState_original[key] !== null) {
    gameState[key] = JSON.parse(JSON.stringify(gameState_original[key]));
  } else {
    gameState[key] = gameState_original[key];
  }
});

// Make gameState globally accessible for file:// protocol compatibility
window.gameState = gameState;
// console.log("game.js loaded: window.gameState assigned", {  hasControls: !!window.gameState.controls, throttleLeft: window.gameState.controls?.ThrottleLeft, throttleRight: window.gameState.controls?.ThrottleRight });

// Make game functions globally accessible for file:// protocol compatibility
// These will be assigned after the functions are declared below

// Debug: Verify gameState is properly initialized
// console.log("gameState initialized:", {
//   hasStatus: !!window.gameState.status,
//   oxygenLevel: window.gameState.status?.oxygenLevel,
//   hasPosition: !!window.gameState.position,
//   hasRotation: !!window.gameState.rotation
// });

//////////////////////////////////////////////////////////////////////////////////////////

// Function to start the game
function startGame() {
  // console.log("startGame called, isGameRunning =", isGameRunning);
  if (!isGameRunning) {
    // console.log("Starting game with difficulty:", window.gameDifficulty);
    // console.log("Initial throttle values - Left:", window.gameState.controls.ThrottleLeft, "Right:", window.gameState.controls.ThrottleRight);

    // Reinitialize scene with the selected difficulty
    if (typeof reinitSceneForDifficulty === "function") {
      reinitSceneForDifficulty();
    }

    isGameRunning = true;
    lastFrameTime = 0; // Reset the time tracker

    // Hide the win overlay in whichever window it's in
    try {
      const doc = window.instrumentsWindow && !window.instrumentsWindow.closed ? window.instrumentsWindow.document : document;
      const winOverlay = doc.getElementById("win-overlay");
      if (winOverlay) winOverlay.style.display = "none";
    } catch (e) {
      // Cross-origin access blocked in file:// mode - safe to ignore
    }

    animationFrameId = requestAnimationFrame(gameLoop);
  } else {
    console.log("Game already running, calling stopGame");
    stopGame();
  }
}

// Function to stop the game
function stopGame() {
  if (isGameRunning) {
    console.log("Stopping game");
    isGameRunning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }
}

// Function to restart the game
function restartGame() {
  // console.log("Resetting game...");

  // Stop the current game loop
  stopGame();

  // Hide win and game over overlays immediately
  const winOverlay = document.getElementById("win-overlay");
  if (winOverlay) winOverlay.style.display = "none";

  const gameoverOverlay = document.getElementById("gameover-overlay");
  if (gameoverOverlay) gameoverOverlay.style.display = "none";

  // Reset game state to original values (deep copy)
  // This properly copies all nested objects
  Object.keys(gameState_original).forEach((key) => {
    if (typeof gameState_original[key] === "object" && gameState_original[key] !== null) {
      gameState[key] = JSON.parse(JSON.stringify(gameState_original[key]));
    } else {
      gameState[key] = gameState_original[key];
    }
  });

  // Clear sub-data text in whichever window it's in
  try {
    const doc = window.instrumentsWindow && !window.instrumentsWindow.closed ? window.instrumentsWindow.document : document;
    const subDataText = doc.getElementById("sub-data-text");
    if (subDataText) subDataText.textContent = "";
  } catch (e) {
    // Cross-origin access blocked in file:// mode - safe to ignore
    // console.log("NOPE");
  }

  // Clear all game data from localStorage (for file:// protocol compatibility)
  // Set a special "clear" message to signal the instruments window to clear its console
  localStorage.setItem("consoleClear", Date.now().toString());
  localStorage.removeItem("consoleMessage");
  localStorage.removeItem("oxygen");
  localStorage.removeItem("battery");
  localStorage.removeItem("compass");
  localStorage.removeItem("depth");
  localStorage.removeItem("speed");
  localStorage.removeItem("pitch");
  localStorage.removeItem("thrust-right");
  localStorage.removeItem("thrust-left");
  localStorage.removeItem("target");
  localStorage.removeItem("rudder");
  localStorage.removeItem("elevator");
  localStorage.removeItem("thrust-vertical");

  // Restart the game loop
  setTimeout(startGame, 500);
}

// Make game control functions globally accessible for file:// protocol compatibility
window.startGame = startGame;
window.stopGame = stopGame;
window.restartGame = restartGame;
// console.log("game.js: game control functions exposed globally");

// Start the game after everything else is loaded
// But only if the welcome screen is not showing (i.e., game was already started)
window.addEventListener(
  "load",
  function () {
    // Check if welcome screen is hidden (game already started from button click)
    const welcomeScreen = document.getElementById("welcome-screen");
    if (!welcomeScreen || welcomeScreen.style.display === "none") {
      // console.log("Window loaded, starting game in 500ms");
      // Start the game loop after a delay to ensure all initialization is complete
      setTimeout(startGame, 500);
    }
  },
  { once: true }
); // Only attach this listener once

//////////////////////////////////////////////////////////////////////////////////////////

function updateSubmarineState(deltaTime) {
  // Update gamepad controls if available
  if (window.submarineControls && window.submarineControls.updateGamepadControls) {
    window.submarineControls.updateGamepadControls();
  }

  // Update time
  window.gameState.time.deltaTime = deltaTime;
  window.gameState.time.elapsed += deltaTime;
  window.gameState.time.logTimeCounter += deltaTime;

  // Update oxygen based on elapsed time
  window.gameState.status.oxygenLevel = Math.max(
    0,
    Math.ceil(((window.gameState.constants.maxOxygenTime - window.gameState.time.elapsed) / window.gameState.constants.maxOxygenTime) * 100)
  );

  // Calculate engine RPM based on thruster values
  // Average the absolute values of both thrusters to get overall engine load
  const avgThrottle = (Math.abs(window.gameState.controls.ThrottleLeft) + Math.abs(window.gameState.controls.ThrottleRight)) / 2;
  window.gameState.status.engineRPM = avgThrottle;

  // Update battery based on engine usage and aft thruster
  const mainPowerDrain = (avgThrottle * deltaTime) / window.gameState.constants.maxBatteryTime;
  // Aft thrusters also use some power, but less than main thrusters
  const aftPowerDrain = (Math.abs(window.gameState.controls.VerticalThruster) * 0.3 * deltaTime) / window.gameState.constants.maxBatteryTime;
  const totalPowerDrain = mainPowerDrain + aftPowerDrain;

  window.gameState.status.batteryLevel = Math.max(0, window.gameState.status.batteryLevel - totalPowerDrain);

  // Battery warnings when crossing below 10% thresholds (90, 80, 70, etc.)
  const currentThreshold = Math.floor(window.gameState.status.batteryLevel / 10) * 10;
  const previousThreshold = Math.floor(window.gameState.status.lastBatteryWarning / 10) * 10;
  // Only warn when crossing into a new lower threshold
  if (currentThreshold < previousThreshold && window.gameState.status.batteryLevel > 0) {
    window.gameState.status.lastBatteryWarning = currentThreshold;
    if (currentThreshold === 0) {
      appendInstrumentConsoleMessage("BATTERY DEPLETED! Thrusters offline!");

      if (window.gameDifficulty === "easy") {
        appendInstrumentConsoleMessage("You are on Easy Mode, restoring power!");
        window.gameState.status.batteryLevel = 100;
      }
    } else {
      appendInstrumentConsoleMessage(`Battery at ${previousThreshold}%`);
    }
  }

  // Calculate forward thrust vector based on submarine orientation
  // Get orientation angles in radians (for Three.js coordinates)
  const pitch = THREE.MathUtils.degToRad(window.gameState.rotation.x);
  const yaw = THREE.MathUtils.degToRad(window.gameState.rotation.y);
  const roll = 0; //THREE.MathUtils.degToRad(window.gameState.rotation.z);

  // Calculate thrust based on thruster values
  if (window.gameState.status.batteryLevel > 0) {
    // Calculate thrust factor
    const thrustFactor = window.gameState.constants.maxSpeed / 100;

    // Calculate net forward thrust from both thrusters
    const netThrust = (window.gameState.controls.ThrottleLeft + window.gameState.controls.ThrottleRight) / 2;

    // Calculate turning effect from differential thrust
    const diffThrust = (window.gameState.controls.ThrottleLeft - window.gameState.controls.ThrottleRight) / 2;

    // Apply thrust vectors using Three.js coordinates
    // Forward thrust: -Z direction (Three.js forward is -Z)
    // Side thrust: X direction
    // Vertical thrust: Y direction

    // Create quaternion for proper 3D rotation
    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(pitch, yaw, roll, "XYZ"));

    // Create thrust vector (pointing forward in local space)
    const thrustVector = new THREE.Vector3(0, 0, -1);
    thrustVector.multiplyScalar(netThrust * thrustFactor * deltaTime);
    thrustVector.applyQuaternion(quaternion);

    // Apply to velocity
    window.gameState.velocity.x += thrustVector.x;
    window.gameState.velocity.y += thrustVector.y;
    window.gameState.velocity.z += thrustVector.z;

    // Apply turning effect from differential thrust
    window.gameState.angularVelocity.y -= diffThrust * 0.5 * deltaTime;

    // Apply rudder effect (yaw control)
    const forwardSpeed = Math.abs(window.gameState.velocity.z);
    const rudderEffect =
      (window.gameState.controls.YawRudderAngle / 100) *
      (forwardSpeed / window.gameState.constants.maxSpeed) *
      window.gameState.constants.maxYawRate *
      deltaTime;
    window.gameState.angularVelocity.y += rudderEffect;

    // Apply elevator effect (pitch control)
    window.gameState.angularVelocity.x +=
      (window.gameState.controls.PitchElevatorAngle / 100) *
      (forwardSpeed / window.gameState.constants.maxSpeed) *
      window.gameState.controls.maxPitchElevatorAngle *
      0.5 *
      deltaTime;

    // INTENTIONALLY NOT AFFECTING Z (ROLL) AXIS

    // Apply vertical thrusters (direct up/down movement)
    const verticalThrustFactor = 1.0; // Adjust this value to control vertical thrust power
    const verticalEffect = (window.gameState.controls.VerticalThruster / 100) * verticalThrustFactor * deltaTime;
    window.gameState.velocity.y += verticalEffect; // Direct vertical movement instead of rotation
  }

  // ENHANCED: Aggressively counter any roll to maintain vertical orientation
  // This is critical for intuitive steering, especially for new users
  const rollStabilizationRate = 5; // Increased from 0.7 - more aggressive damping
  const rollResetRate = 8; // Increased from 0.95 - faster return to zero

  // Apply strong damping to roll velocity
  window.gameState.angularVelocity.z *= 1 - rollStabilizationRate * deltaTime;

  // Actively push roll back to zero with a force proportional to current roll
  const rollCorrection = -window.gameState.rotation.z * rollResetRate * deltaTime;
  window.gameState.angularVelocity.z += rollCorrection;

  // For extreme roll values, apply even stronger correction
  if (Math.abs(window.gameState.rotation.z) > 15) {
    const emergencyCorrection = -Math.sign(window.gameState.rotation.z) * 3 * deltaTime;
    window.gameState.angularVelocity.z += emergencyCorrection;
  }

  // Additional anti-roll logic when using rudder
  // This counteracts the natural tendency to roll when turning
  if (Math.abs(window.gameState.controls.YawRudderAngle) > 10) {
    // Calculate anti-roll force when rudder is used
    const yawRate = window.gameState.angularVelocity.y;
    const antiRollForce = -yawRate * 0.3 * deltaTime;
    window.gameState.angularVelocity.z += antiRollForce;
  }

  // YAW CENTERING: Stop turning when rudder is neutral (like a car steering wheel)
  // This makes the submarine feel more natural and controllable
  const rudderDeadZone = 5; // Small dead zone for neutral rudder
  if (Math.abs(window.gameState.controls.YawRudderAngle) <= rudderDeadZone) {
    // Rudder is neutral - apply strong yaw damping to stop turning
    const yawCenteringStrength = 4.0; // How quickly it stops turning
    window.gameState.angularVelocity.y *= Math.max(0.1, 1 - yawCenteringStrength * deltaTime);

    // For very slow turning, stop it completely
    if (Math.abs(window.gameState.angularVelocity.y) < 0.5) {
      window.gameState.angularVelocity.y *= 0.7;
    }
  } else {
    // Rudder is active - apply normal but lighter yaw damping
    const normalYawDamping = 0.98;
    window.gameState.angularVelocity.y *= normalYawDamping;
  }

  // PITCH CENTERING: Stop turning when elevator is neutral
  // This makes the submarine feel more natural and controllable
  const elevatorDeadZone = 5; // Small dead zone for neutral rudder
  if (Math.abs(window.gameState.controls.PitchElevatorAngle) <= elevatorDeadZone) {
    // elevator is neutral - apply strong pitch damping to stop turning
    const pitchCenteringStrength = 4.0; // How quickly it stops turning
    window.gameState.angularVelocity.x *= Math.max(0.1, 1 - pitchCenteringStrength * deltaTime);

    // For very slow pitching, stop it completely
    if (Math.abs(window.gameState.angularVelocity.x) < 0.5) {
      window.gameState.angularVelocity.x *= 0.7;
    }
  } else {
    // Elevator is active - apply normal but lighter pitch damping
    const normalPitchDamping = 0.98;
    window.gameState.angularVelocity.x *= normalPitchDamping;
  }

  // Apply drag to velocities
  const drag = window.gameState.constants.dragCoefficient;
  window.gameState.velocity.x *= 1 - drag * deltaTime;
  window.gameState.velocity.y *= 1 - drag * deltaTime;
  window.gameState.velocity.z *= 1 - drag * deltaTime;

  // DIRECTIONAL DRAG: Much higher resistance when moving sideways/backward
  // This makes turns feel realistic - submarine naturally aligns with velocity
  const yawRad = THREE.MathUtils.degToRad(window.gameState.rotation.y);
  const pitchRad = THREE.MathUtils.degToRad(window.gameState.rotation.x);

  // Calculate submarine's forward direction vector
  const forwardX = Math.sin(yawRad) * Math.cos(pitchRad);
  const forwardZ = -Math.cos(yawRad) * Math.cos(pitchRad);

  // Calculate speed and direction of movement
  const speed = Math.sqrt(window.gameState.velocity.x ** 2 + window.gameState.velocity.z ** 2);

  if (speed > 0.01) {
    // Calculate how much velocity aligns with submarine's forward direction
    const velocityX = window.gameState.velocity.x / speed;
    const velocityZ = window.gameState.velocity.z / speed;
    const alignment = velocityX * forwardX + velocityZ * forwardZ; // -1 to 1

    // Apply extra drag to sideways/backward motion (perpendicular to forward)
    const lateralDragFactor = 3.0; // Sideways drag is 3x stronger than forward
    const lateralDrag = (1 - Math.abs(alignment)) * lateralDragFactor * drag * deltaTime;

    window.gameState.velocity.x *= 1 - lateralDrag;
    window.gameState.velocity.z *= 1 - lateralDrag;
  }

  // Apply drag to angular velocities
  window.gameState.angularVelocity.x *= 1 - drag * 4 * deltaTime;
  window.gameState.angularVelocity.y *= 1 - drag * 4 * deltaTime;
  window.gameState.angularVelocity.z *= 1 - drag * 2 * deltaTime;

  // Limit maximum pitch angle
  const maxPitch = window.gameState.controls.maxPitchElevatorAngle;
  window.gameState.rotation.x = Math.max(-maxPitch, Math.min(maxPitch, window.gameState.rotation.x));

  // Update position based on velocity
  window.gameState.position.x += window.gameState.velocity.x * deltaTime;
  window.gameState.position.y += window.gameState.velocity.y * deltaTime;
  window.gameState.position.z += window.gameState.velocity.z * deltaTime;

  // Update rotation based on angular velocity
  window.gameState.rotation.x += window.gameState.angularVelocity.x * deltaTime;
  window.gameState.rotation.y += window.gameState.angularVelocity.y * deltaTime;
  window.gameState.rotation.z += window.gameState.angularVelocity.z * deltaTime;

  // clamp roll to prevent excessive banking - keeps submarine feeling upright
  const maxRoll = 5; // Allow only ±5° of roll (barely noticeable)
  window.gameState.rotation.z = Math.max(-maxRoll, Math.min(maxRoll, window.gameState.rotation.z));

  // Apply boundary constraints
  applyBoundaryConstraints();

  // Check for coral collisions (skip for easy and medium modes)
  if (window.gameDifficulty === "hard" && typeof checkCoralCollisions === "function") {
    checkCoralCollisions();
  }

  // Update derived values
  updateDerivedValues();

  // run this every so often to update instruments, etc
  if (window.gameState.time.logTimeCounter > window.gameState.time.logTimeCounterLengthMS) {
    window.gameState.time.logTimeCounter = 0;

    updateUI();
  }
}

//////////////////////////////////////////////////////////////////////////////////////////

// Helper function to reset velocities when hitting boundaries
function resetVelocities() {
  window.gameState.velocity.x = 0;
  window.gameState.velocity.y = 0;
  window.gameState.velocity.z = 0;
  window.gameState.angularVelocity.x = 0;
  window.gameState.angularVelocity.y = 0;
  window.gameState.angularVelocity.z = 0;
}

function applyBoundaryConstraints() {
  // Get current position
  const { x, y, z } = window.gameState.position;

  // Get boundary constants
  const worldBoundary = window.gameState.constants.worldBoundary;

  // CRITICAL FIX: Properly define the valid Y range in Three.js coordinates
  // In Three.js: Y-up means higher Y values are toward water surface

  const threeJsSeabedY = window.gameState.constants.seabedDepth; // Bottom of the world
  const threeJsWaterSurfaceY = window.gameState.constants.waterSurface; // Water surface

  // Console log the current position for debugging
  //console.log(`Position before bounds check: x=${x.toFixed(2)}, y=${y.toFixed(2)}, z=${z.toFixed(2)}`);

  // Track if we're hitting a boundary
  let isHittingBoundary = false;

  // Reset velocity helper function
  const resetVelocities = () => {
    window.gameState.velocity.x = 0;
    window.gameState.velocity.y = 0;
    window.gameState.velocity.z = 0;
    window.gameState.angularVelocity.x = 0;
    window.gameState.angularVelocity.y = 0;
    window.gameState.angularVelocity.z = 0;
    window.gameState.controls.ThrottleLeft = 0;
    window.gameState.controls.ThrottleRight = 0;
    window.gameState.controls.PitchElevatorAngle = 0;
    window.gameState.controls.YawRudderAngle = 0;
  };

  // Make a copy of the position to track changes
  const newPosition = { x, y, z };

  // X boundary (left/right)
  if (Math.abs(x) > worldBoundary) {
    newPosition.x = Math.sign(x) * (worldBoundary - 0.5);
    resetVelocities();
    isHittingBoundary = true;
    appendInstrumentConsoleMessage("Hit side boundary - stopping submarine");
  }

  // Y boundary (vertical: seabed and water surface)
  if (y < threeJsSeabedY) {
    // Below seabed
    newPosition.y = threeJsSeabedY + 10;
    resetVelocities();
    isHittingBoundary = true;
    appendInstrumentConsoleMessage("Hit seabed - stopping submarine");

    // Drop the target if it was grabbed!
    if (window.gameState.navigation.targetGrabbed && window.gameDifficulty === "hard") {
      window.gameState.navigation.targetGrabbed = false;
      window.gameState.navigation.targetFallVelocity = -20; // Start falling
      appendInstrumentConsoleMessage("💎 You dropped the target! It's falling!");
    }

    // Auto-level the submarine to prevent driving back into floor
    window.gameState.rotation.x = 0; // Level pitch
    window.gameState.rotation.z = 0; // Level roll
  } else if (y > threeJsWaterSurfaceY) {
    // Above water surface
    newPosition.y = threeJsWaterSurfaceY - 10;
    resetVelocities();
    isHittingBoundary = true;
    appendInstrumentConsoleMessage("Hit Cave ceiling  - stopping submarine");

    // Drop the target if it was grabbed!
    if (window.gameState.navigation.targetGrabbed) {
      window.gameState.navigation.targetGrabbed = false;
      window.gameState.navigation.targetFallVelocity = -20; // Start falling
      appendInstrumentConsoleMessage("💎 You dropped the target! It's falling!");
    }
    // Auto-level the submarine to prevent driving back into ceiling
    window.gameState.rotation.x = 0; // Level pitch
    window.gameState.rotation.z = 0; // Level roll
  }

  // Z boundary (forward/backward)
  if (Math.abs(z) > worldBoundary) {
    newPosition.z = Math.sign(z) * (worldBoundary - 10);
    resetVelocities();
    isHittingBoundary = true;
    appendInstrumentConsoleMessage("Hit forward/backward boundary - stopping submarine");
  }

  // Update position with corrected values
  window.gameState.position.x = newPosition.x;
  window.gameState.position.y = newPosition.y;
  window.gameState.position.z = newPosition.z;

  // Set boundary warning flag
  const boundaryWarningThreshold = worldBoundary * 0.9;
  const depthWarningThreshold = 5;

  window.gameState.status.boundaryWarning =
    Math.abs(x) > boundaryWarningThreshold ||
    Math.abs(z) > boundaryWarningThreshold ||
    y < threeJsSeabedY + depthWarningThreshold ||
    y > threeJsWaterSurfaceY - depthWarningThreshold;

  return isHittingBoundary;
}

//////////////////////////////////////////////////////////////////////////////////////////

function updateUI() {
  // Win condition: Must have grabbed target AND returned to the starting hole at surface
  const atSurface = window.gameState.position.y >= window.gameState.constants.waterSurface - 5; // Near surface

  // Check if within radius of starting position (the hole) - starting position is x:0, z:0
  const dx = window.gameState.position.x - 0;
  const dz = window.gameState.position.z - 0;
  const distanceFromHole = Math.sqrt(dx * dx + dz * dz);
  const inHoleRadius = distanceFromHole < 50; // Within 50 units of the hole

  if (window.gameState.navigation.targetGrabbed && atSurface && inHoleRadius) {
    appendInstrumentConsoleMessage("🏆 MISSION COMPLETE! You found the target and returned to the surface!");
    showWinScreen();
    stopGame();
  }

  // oxygen level
  if (window.gameState.status.oxygenLevel <= 0) {
    if (window.gameDifficulty === "easy") {
      console.log("Oxygen depleted, But you are on Easy Mode, so restoring Oxygen");
      appendInstrumentConsoleMessage("Restoring Oxygen on Easy Mode");
      window.gameState.status.oxygenLevel = 100;
    } else {
      console.log("GAME OVER: Oxygen depleted, level =", window.gameState.status.oxygenLevel);
      appendInstrumentConsoleMessage("CRITICAL: Oxygen depleted!");
      showGameOverScreen();
      stopGame();
      return;
    }
  }

  // Format position values with 2 decimal places
  // const formatPos = (val) => val.toFixed(2);

  // Update sub-data overlay text
  // let overlayText =
  //   //    `Welcome to the Tangible Interfaces Class Submarine Design Project Simulator. ` +
  //   //   `<a href="https://github.com/steveturbek/Tangible-Interfaces-Submarine-Design-Project/tree/main?tab=readme-ov-file#tangible-interfaces-submarine-design-project" target="new" style="color:white">Read Me for details</a>` +
  //   //`Position(${window.gameState.position.x.toFixed(2)},${window.gameState.position.y.toFixed(2)},${window.gameState.position.z.toFixed(2)}) | ` +
  //   `\nCompass: ${Math.round(window.gameState.navigation.compassHeading)}° ` +
  //   `\nSpeed: ${Math.round(window.gameState.navigation.currentSpeedAsPercentage)}% ` +
  //   `\nDepth: ${window.gameState.status.depth.toFixed(2)}m ` +
  //   `\nPitch: ${Math.round(window.gameState.rotation.x)}°` +
  //   `\n` +
  //   `\nOxygen: ${window.gameState.status.oxygenLevel}% ` +
  //   `\nBattery: ${window.gameState.status.batteryLevel.toFixed(1)}% ` +
  //   `\nTarget: ${window.gameState.navigation.distanceToTarget.toFixed(2)}m` +
  //   `\n` +
  //   `\nLeftThrust: ${window.gameState.controls.ThrottleLeft}% ` +
  //   `\nRightThrust: ${window.gameState.controls.ThrottleRight}% ` +
  //   `\nRudder: ${window.gameState.controls.YawRudderAngle.toFixed(1)}% ` +
  //   `\nElevator: ${window.gameState.controls.PitchElevatorAngle.toFixed(1)}% ` +
  //   `\nVerticalThruster: ${window.gameState.controls.VerticalThruster}%`;

  // // Add boundary warning if needed
  // if (window.gameState.status.boundaryWarning) {
  //   overlayText += `\n\n⚠️ Approaching boundary!`;
  // }

  // Update sub-data text in whichever window it's in
  // const doc = window.instrumentsWindow && !window.instrumentsWindow.closed ? window.instrumentsWindow.document : document;
  // const subDataText = doc.getElementById("sub-data-text");
  // if (subDataText) {
  //   subDataText.textContent = overlayText;
  // } else {
  //   console.log("sub-data-text element not found in", window.instrumentsWindow ? "instruments window" : "main window");
  // }

  // Update instruments
  // updateInstruments();

  // Write to localStorage for file:// protocol compatibility

  localStorage.setItem("battery", window.gameState.status.batteryLevel.toString());
  localStorage.setItem("oxygen", window.gameState.status.oxygenLevel.toString());
  const depth = ((window.gameState.constants.waterSurface - window.gameState.position.y) / window.gameState.constants.waterSurface) * 100;
  localStorage.setItem("depth", depth.toString());
  localStorage.setItem("target", window.gameState.navigation.distanceToTarget.toString());
  localStorage.setItem("compass", window.gameState.navigation.compassHeading.toString());
  localStorage.setItem("speed", window.gameState.navigation.currentSpeedAsPercentage.toString());
  const pitchPercent = (window.gameState.rotation.x / window.gameState.controls.maxPitchElevatorAngle) * 100;
  localStorage.setItem("pitch", Math.round(pitchPercent).toString());

  localStorage.setItem("thrust-right", window.gameState.controls.ThrottleRight.toString());
  localStorage.setItem("thrust-left", window.gameState.controls.ThrottleLeft.toString());

  const rudderPercent = (window.gameState.controls.YawRudderAngle / window.gameState.controls.maxYawRudderAngle) * 100; // Convert rudder angle to percentage (-100% to +100%)
  localStorage.setItem("rudder", Math.round(rudderPercent).toString());

  const elevatorPercent = (window.gameState.controls.PitchElevatorAngle / window.gameState.controls.maxPitchElevatorAngle) * 100; // Convert elevator angle to percentage (-100% to +100%)
  localStorage.setItem("elevator", Math.round(elevatorPercent).toString());

  localStorage.setItem("thrust-vertical", window.gameState.controls.VerticalThruster.toString());
}

function appendInstrumentConsoleMessage(message) {
  //add a line to sub-data-text

  // Store message in localStorage for file:// protocol compatibility
  const timestamp = Date.now();
  localStorage.setItem("consoleMessage", JSON.stringify({ message, timestamp }));

  try {
    const doc = window.instrumentsWindow && !window.instrumentsWindow.closed ? window.instrumentsWindow.document : document;
    const subDataText = doc.getElementById("sub-data-text");
    if (subDataText) {
      subDataText.textContent += "\n" + message + "\n";
      // Auto-scroll to bottom
      subDataText.scrollTop = subDataText.scrollHeight;
    }
  } catch (e) {
    // Cross-origin access blocked in file:// mode - message will be read from localStorage
    console.log("Instrument message:", message);
  }
}

// Calculate values derived from core state
//////////////////////////////////////////////////////////////////////////////////////////

function updateDerivedValues() {
  // Calculate distance to target
  const dx = window.gameState.navigation.targetPosition.x - window.gameState.position.x;
  const dy = window.gameState.navigation.targetPosition.y - window.gameState.position.y;
  const dz = window.gameState.navigation.targetPosition.z - window.gameState.position.z;
  const distanceToTargetRaw = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Scale distance to 0-100% based on maximum possible world distance
  // This gives a consistent reference frame: 0% = at target, 100% = at opposite corner of world
  // maxWorldDistance ≈ 2840 units (diagonal across entire world)
  window.gameState.navigation.distanceToTarget = Math.min(100, (distanceToTargetRaw / window.gameState.constants.maxWorldDistance) * 100);

  // Calculate compass heading (in XZ plane)
  window.gameState.navigation.headingToTarget = ((Math.atan2(dx, -dz) * 180) / Math.PI + 360) % 360;

  // Use raw yaw value for compass heading
  window.gameState.navigation.compassHeading = ((window.gameState.rotation.y % 360) + 360) % 360;

  // Calculate current speed as percentage of max
  const speed = Math.sqrt(
    window.gameState.velocity.x * window.gameState.velocity.x +
      window.gameState.velocity.y * window.gameState.velocity.y +
      window.gameState.velocity.z * window.gameState.velocity.z
  );
  window.gameState.navigation.currentSpeedAsPercentage = Math.min(100, (speed / window.gameState.constants.maxSpeed) * 100);

  // Convert depth to positive number for display (Y is up, so negative Y is depth)
  const maxDepth = window.gameState.constants.waterSurface - window.gameState.constants.seabedDepth;
  window.gameState.status.depth = Math.min(maxDepth, -window.gameState.position.y + window.gameState.constants.waterSurface);

  //  window.gameState.status.depth = Math.min(maxDepth, 100 - window.gameState.position.y);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Game loop variables
let lastFrameTime = 0;
let isGameRunning = false;
let animationFrameId = null;

// Main game loop function - more optimized
function gameLoop(currentTime) {
  // Convert time to seconds (it comes in as milliseconds)
  currentTime = currentTime / 1000;

  // Calculate delta time (time since last frame)
  if (lastFrameTime === 0) {
    lastFrameTime = currentTime;
    animationFrameId = requestAnimationFrame(gameLoop);
    return; // Skip the first frame to establish timing
  }

  const deltaTime = Math.min(0.1, currentTime - lastFrameTime); // Cap delta time to avoid large jumps
  lastFrameTime = currentTime;

  // Update game state with the calculated delta time
  updateSubmarineState(deltaTime);

  // Request the next frame if the game is still running
  if (isGameRunning) {
    // We're calling renderUnderwaterScene directly from rendering.js
    renderUnderwaterScene();
    animationFrameId = requestAnimationFrame(gameLoop);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////

function showWinScreen() {
  // Format time from seconds to MM:SS
  const minutes = Math.floor(window.gameState.time.elapsed / 60);
  const seconds = Math.floor(window.gameState.time.elapsed % 60);
  const timeString = minutes + ":" + String(seconds).padStart(2, "0");

  // Show win overlay in the main window (where the canvas is)
  const finalTime = document.getElementById("final-time");
  const finalOxygen = document.getElementById("final-oxygen");
  const finalBattery = document.getElementById("final-battery");
  const winOverlay = document.getElementById("win-overlay");

  if (finalTime) finalTime.textContent = timeString;
  if (finalOxygen) finalOxygen.textContent = Math.round(window.gameState.status.oxygenLevel) + "%";
  if (finalBattery) finalBattery.textContent = Math.round(window.gameState.status.batteryLevel) + "%";

  // Show the win overlay in main window
  if (winOverlay) winOverlay.style.display = "flex";
}

function showGameOverScreen() {
  // Format time from seconds to MM:SS
  const minutes = Math.floor(window.gameState.time.elapsed / 60);
  const seconds = Math.floor(window.gameState.time.elapsed % 60);
  const timeString = minutes + ":" + String(seconds).padStart(2, "0");

  // Show game over overlay in the main window
  const gameoverTime = document.getElementById("gameover-time");
  const gameoverOverlay = document.getElementById("gameover-overlay");

  if (gameoverTime) gameoverTime.textContent = timeString;

  // Show the game over overlay with fade-to-black animation
  if (gameoverOverlay) gameoverOverlay.style.display = "flex";
}
