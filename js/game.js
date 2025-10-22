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
    targetPosition: { x: 0, y: 10, z: -1200 }, // target location (30 units above seabed)
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

// Debug: Verify gameState is properly initialized
// console.log("gameState initialized:", {
//   hasStatus: !!gameState.status,
//   oxygenLevel: gameState.status?.oxygenLevel,
//   hasPosition: !!gameState.position,
//   hasRotation: !!gameState.rotation
// });

//////////////////////////////////////////////////////////////////////////////////////////

// Function to start the game
function startGame() {
  // console.log("startGame called, isGameRunning =", isGameRunning);
  if (!isGameRunning) {
    console.log("Starting game with difficulty:", window.gameDifficulty);

    // Reinitialize scene with the selected difficulty
    if (typeof reinitSceneForDifficulty === "function") {
      reinitSceneForDifficulty();
    }

    isGameRunning = true;
    lastFrameTime = 0; // Reset the time tracker

    // Hide the win overlay in whichever window it's in
    const doc = window.instrumentsWindow && !window.instrumentsWindow.closed ? window.instrumentsWindow.document : document;
    const winOverlay = doc.getElementById("win-overlay");
    if (winOverlay) winOverlay.style.display = "none";

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
  const doc = window.instrumentsWindow && !window.instrumentsWindow.closed ? window.instrumentsWindow.document : document;
  const subDataText = doc.getElementById("sub-data-text");
  if (subDataText) subDataText.textContent = "";

  // Restart the game loop
  setTimeout(startGame, 500);
}

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
  gameState.time.deltaTime = deltaTime;
  gameState.time.elapsed += deltaTime;
  gameState.time.logTimeCounter += deltaTime;

  // Update oxygen based on elapsed time (skip for easy mode)
  const difficulty = window.gameDifficulty || "hard";
  if (difficulty !== "easy") {
    gameState.status.oxygenLevel = Math.max(
      0,
      Math.ceil(((gameState.constants.maxOxygenTime - gameState.time.elapsed) / gameState.constants.maxOxygenTime) * 100)
    );
  } else {
    // Easy mode: oxygen stays at 100%
    gameState.status.oxygenLevel = 100;
  }

  // Calculate engine RPM based on thruster values
  // Average the absolute values of both thrusters to get overall engine load
  const avgThrottle = (Math.abs(gameState.controls.ThrottleLeft) + Math.abs(gameState.controls.ThrottleRight)) / 2;
  gameState.status.engineRPM = avgThrottle;

  // Update battery based on engine usage and aft thruster (skip for easy mode)
  if (difficulty !== "easy") {
    const mainPowerDrain = (avgThrottle * deltaTime) / gameState.constants.maxBatteryTime;
    // Aft thrusters also use some power, but less than main thrusters
    const aftPowerDrain = (Math.abs(gameState.controls.VerticalThruster) * 0.3 * deltaTime) / gameState.constants.maxBatteryTime;
    const totalPowerDrain = mainPowerDrain + aftPowerDrain;

    gameState.status.batteryLevel = Math.max(0, gameState.status.batteryLevel - totalPowerDrain);

    // Battery warnings when crossing below 10% thresholds (90, 80, 70, etc.)
    const currentThreshold = Math.floor(gameState.status.batteryLevel / 10) * 10;
    const previousThreshold = Math.floor(gameState.status.lastBatteryWarning / 10) * 10;
    // Only warn when crossing into a new lower threshold
    if (currentThreshold < previousThreshold && gameState.status.batteryLevel > 0) {
      gameState.status.lastBatteryWarning = currentThreshold;
      if (currentThreshold === 0) {
        appendInstrumentConsoleMessage("BATTERY DEPLETED! Thrusters offline!");
      } else {
        appendInstrumentConsoleMessage(`Battery at ${previousThreshold}%`);
      }
    }
  } else {
    // Easy mode: battery stays at 100%
    gameState.status.batteryLevel = 100;
  }

  // Calculate forward thrust vector based on submarine orientation
  // Get orientation angles in radians (for Three.js coordinates)
  const pitch = THREE.MathUtils.degToRad(gameState.rotation.x);
  const yaw = THREE.MathUtils.degToRad(gameState.rotation.y);
  const roll = 0; //THREE.MathUtils.degToRad(gameState.rotation.z);

  // Calculate thrust based on thruster values
  if (gameState.status.batteryLevel > 0) {
    // Calculate thrust factor
    const thrustFactor = gameState.constants.maxSpeed / 100;

    // Calculate net forward thrust from both thrusters
    const netThrust = (gameState.controls.ThrottleLeft + gameState.controls.ThrottleRight) / 2;

    // Calculate turning effect from differential thrust
    const diffThrust = (gameState.controls.ThrottleLeft - gameState.controls.ThrottleRight) / 2;

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
    gameState.velocity.x += thrustVector.x;
    gameState.velocity.y += thrustVector.y;
    gameState.velocity.z += thrustVector.z;

    // Apply turning effect from differential thrust
    gameState.angularVelocity.y -= diffThrust * 0.5 * deltaTime;

    // Apply rudder effect (yaw control)
    const forwardSpeed = Math.abs(gameState.velocity.z);
    const rudderEffect = (gameState.controls.YawRudderAngle / 100) * (forwardSpeed / gameState.constants.maxSpeed) * gameState.constants.maxYawRate * deltaTime;
    gameState.angularVelocity.y += rudderEffect;

    // Apply elevator effect (pitch control)
    gameState.angularVelocity.x +=
      (gameState.controls.PitchElevatorAngle / 100) *
      (forwardSpeed / gameState.constants.maxSpeed) *
      gameState.controls.maxPitchElevatorAngle *
      0.5 *
      deltaTime;

    // INTENTIONALLY NOT AFFECTING Z (ROLL) AXIS

    // Apply vertical thrusters (direct up/down movement)
    const verticalThrustFactor = 1.0; // Adjust this value to control vertical thrust power
    const verticalEffect = (gameState.controls.VerticalThruster / 100) * verticalThrustFactor * deltaTime;
    gameState.velocity.y += verticalEffect; // Direct vertical movement instead of rotation
  }

  // ENHANCED: Aggressively counter any roll to maintain vertical orientation
  // This is critical for intuitive steering, especially for new users
  const rollStabilizationRate = 5; // Increased from 0.7 - more aggressive damping
  const rollResetRate = 8; // Increased from 0.95 - faster return to zero

  // Apply strong damping to roll velocity
  gameState.angularVelocity.z *= 1 - rollStabilizationRate * deltaTime;

  // Actively push roll back to zero with a force proportional to current roll
  const rollCorrection = -gameState.rotation.z * rollResetRate * deltaTime;
  gameState.angularVelocity.z += rollCorrection;

  // For extreme roll values, apply even stronger correction
  if (Math.abs(gameState.rotation.z) > 15) {
    const emergencyCorrection = -Math.sign(gameState.rotation.z) * 3 * deltaTime;
    gameState.angularVelocity.z += emergencyCorrection;
  }

  // Additional anti-roll logic when using rudder
  // This counteracts the natural tendency to roll when turning
  if (Math.abs(gameState.controls.YawRudderAngle) > 10) {
    // Calculate anti-roll force when rudder is used
    const yawRate = gameState.angularVelocity.y;
    const antiRollForce = -yawRate * 0.3 * deltaTime;
    gameState.angularVelocity.z += antiRollForce;
  }

  // YAW CENTERING: Stop turning when rudder is neutral (like a car steering wheel)
  // This makes the submarine feel more natural and controllable
  const rudderDeadZone = 5; // Small dead zone for neutral rudder
  if (Math.abs(gameState.controls.YawRudderAngle) <= rudderDeadZone) {
    // Rudder is neutral - apply strong yaw damping to stop turning
    const yawCenteringStrength = 4.0; // How quickly it stops turning
    gameState.angularVelocity.y *= Math.max(0.1, 1 - yawCenteringStrength * deltaTime);

    // For very slow turning, stop it completely
    if (Math.abs(gameState.angularVelocity.y) < 0.5) {
      gameState.angularVelocity.y *= 0.7;
    }
  } else {
    // Rudder is active - apply normal but lighter yaw damping
    const normalYawDamping = 0.98;
    gameState.angularVelocity.y *= normalYawDamping;
  }

  // PITCH CENTERING: Stop turning when elevator is neutral
  // This makes the submarine feel more natural and controllable
  const elevatorDeadZone = 5; // Small dead zone for neutral rudder
  if (Math.abs(gameState.controls.PitchElevatorAngle) <= elevatorDeadZone) {
    // elevator is neutral - apply strong pitch damping to stop turning
    const pitchCenteringStrength = 4.0; // How quickly it stops turning
    gameState.angularVelocity.x *= Math.max(0.1, 1 - pitchCenteringStrength * deltaTime);

    // For very slow pitching, stop it completely
    if (Math.abs(gameState.angularVelocity.x) < 0.5) {
      gameState.angularVelocity.x *= 0.7;
    }
  } else {
    // Elevator is active - apply normal but lighter pitch damping
    const normalPitchDamping = 0.98;
    gameState.angularVelocity.x *= normalPitchDamping;
  }

  // Apply drag to velocities
  const drag = gameState.constants.dragCoefficient;
  gameState.velocity.x *= 1 - drag * deltaTime;
  gameState.velocity.y *= 1 - drag * deltaTime;
  gameState.velocity.z *= 1 - drag * deltaTime;

  // DIRECTIONAL DRAG: Much higher resistance when moving sideways/backward
  // This makes turns feel realistic - submarine naturally aligns with velocity
  const yawRad = THREE.MathUtils.degToRad(gameState.rotation.y);
  const pitchRad = THREE.MathUtils.degToRad(gameState.rotation.x);

  // Calculate submarine's forward direction vector
  const forwardX = Math.sin(yawRad) * Math.cos(pitchRad);
  const forwardZ = -Math.cos(yawRad) * Math.cos(pitchRad);

  // Calculate speed and direction of movement
  const speed = Math.sqrt(gameState.velocity.x ** 2 + gameState.velocity.z ** 2);

  if (speed > 0.01) {
    // Calculate how much velocity aligns with submarine's forward direction
    const velocityX = gameState.velocity.x / speed;
    const velocityZ = gameState.velocity.z / speed;
    const alignment = velocityX * forwardX + velocityZ * forwardZ; // -1 to 1

    // Apply extra drag to sideways/backward motion (perpendicular to forward)
    const lateralDragFactor = 3.0; // Sideways drag is 3x stronger than forward
    const lateralDrag = (1 - Math.abs(alignment)) * lateralDragFactor * drag * deltaTime;

    gameState.velocity.x *= 1 - lateralDrag;
    gameState.velocity.z *= 1 - lateralDrag;
  }

  // Apply drag to angular velocities
  gameState.angularVelocity.x *= 1 - drag * 4 * deltaTime;
  gameState.angularVelocity.y *= 1 - drag * 4 * deltaTime;
  gameState.angularVelocity.z *= 1 - drag * 2 * deltaTime;

  // Limit maximum pitch angle
  const maxPitch = gameState.controls.maxPitchElevatorAngle;
  gameState.rotation.x = Math.max(-maxPitch, Math.min(maxPitch, gameState.rotation.x));

  // Update position based on velocity
  gameState.position.x += gameState.velocity.x * deltaTime;
  gameState.position.y += gameState.velocity.y * deltaTime;
  gameState.position.z += gameState.velocity.z * deltaTime;

  // Update rotation based on angular velocity
  gameState.rotation.x += gameState.angularVelocity.x * deltaTime;
  gameState.rotation.y += gameState.angularVelocity.y * deltaTime;
  gameState.rotation.z += gameState.angularVelocity.z * deltaTime;

  // Hard clamp roll to prevent excessive banking - keeps submarine feeling upright
  const maxRoll = 5; // Allow only ±5° of roll (barely noticeable)
  gameState.rotation.z = Math.max(-maxRoll, Math.min(maxRoll, gameState.rotation.z));

  // Apply boundary constraints
  applyBoundaryConstraints();

  // Check for coral collisions (skip for easy and medium modes)
  if (difficulty === "hard" && typeof checkCoralCollisions === "function") {
    checkCoralCollisions();
  }

  // Update derived values
  updateDerivedValues();

  // run this every so often to update instruments, etc
  if (gameState.time.logTimeCounter > gameState.time.logTimeCounterLengthMS) {
    gameState.time.logTimeCounter = 0;

    updateUI();
  }
}

//////////////////////////////////////////////////////////////////////////////////////////

// REPLACE the applyBoundaryConstraints function with this corrected version:

// Helper function to reset velocities when hitting boundaries
function resetVelocities() {
  gameState.velocity.x = 0;
  gameState.velocity.y = 0;
  gameState.velocity.z = 0;
  gameState.angularVelocity.x = 0;
  gameState.angularVelocity.y = 0;
  gameState.angularVelocity.z = 0;
}

function applyBoundaryConstraints() {
  // Get current position
  const { x, y, z } = gameState.position;

  // Get boundary constants
  const worldBoundary = gameState.constants.worldBoundary;

  // CRITICAL FIX: Properly define the valid Y range in Three.js coordinates
  // In Three.js: Y-up means higher Y values are toward water surface

  const threeJsSeabedY = gameState.constants.seabedDepth; // Bottom of the world
  const threeJsWaterSurfaceY = gameState.constants.waterSurface; // Water surface

  // Console log the current position for debugging
  //console.log(`Position before bounds check: x=${x.toFixed(2)}, y=${y.toFixed(2)}, z=${z.toFixed(2)}`);

  // Track if we're hitting a boundary
  let isHittingBoundary = false;

  // Reset velocity helper function
  const resetVelocities = () => {
    gameState.velocity.x = 0;
    gameState.velocity.y = 0;
    gameState.velocity.z = 0;
    gameState.angularVelocity.x = 0;
    gameState.angularVelocity.y = 0;
    gameState.angularVelocity.z = 0;
    gameState.controls.ThrottleLeft = 0;
    gameState.controls.ThrottleRight = 0;
    gameState.controls.PitchElevatorAngle = 0;
    gameState.controls.YawRudderAngle = 0;
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
    if (gameState.navigation.targetGrabbed) {
      gameState.navigation.targetGrabbed = false;
      gameState.navigation.targetFallVelocity = -20; // Start falling
      appendInstrumentConsoleMessage("💎 You dropped the target! It's falling!");
    }

    // Auto-level the submarine to prevent driving back into floor
    gameState.rotation.x = 0; // Level pitch
    gameState.rotation.z = 0; // Level roll
  } else if (y > threeJsWaterSurfaceY) {
    // Above water surface
    newPosition.y = threeJsWaterSurfaceY - 10;
    resetVelocities();
    isHittingBoundary = true;
    appendInstrumentConsoleMessage("Hit Cave ceiling  - stopping submarine");

    // Drop the target if it was grabbed!
    if (gameState.navigation.targetGrabbed) {
      gameState.navigation.targetGrabbed = false;
      gameState.navigation.targetFallVelocity = -20; // Start falling
      appendInstrumentConsoleMessage("💎 You dropped the target! It's falling!");
    }
    // Auto-level the submarine to prevent driving back into ceiling
    gameState.rotation.x = 0; // Level pitch
    gameState.rotation.z = 0; // Level roll
  }

  // Z boundary (forward/backward)
  if (Math.abs(z) > worldBoundary) {
    newPosition.z = Math.sign(z) * (worldBoundary - 10);
    resetVelocities();
    isHittingBoundary = true;
    appendInstrumentConsoleMessage("Hit forward/backward boundary - stopping submarine");
  }

  // Update position with corrected values
  gameState.position.x = newPosition.x;
  gameState.position.y = newPosition.y;
  gameState.position.z = newPosition.z;

  // Set boundary warning flag
  const boundaryWarningThreshold = worldBoundary * 0.9;
  const depthWarningThreshold = 5;

  gameState.status.boundaryWarning =
    Math.abs(x) > boundaryWarningThreshold ||
    Math.abs(z) > boundaryWarningThreshold ||
    y < threeJsSeabedY + depthWarningThreshold ||
    y > threeJsWaterSurfaceY - depthWarningThreshold;

  return isHittingBoundary;
}

//////////////////////////////////////////////////////////////////////////////////////////

function updateUI() {
  // Win condition: Must have grabbed target AND returned to the starting hole at surface
  const atSurface = gameState.position.y >= gameState.constants.waterSurface - 5; // Near surface

  // Check if within radius of starting position (the hole) - starting position is x:0, z:0
  const dx = gameState.position.x - 0;
  const dz = gameState.position.z - 0;
  const distanceFromHole = Math.sqrt(dx * dx + dz * dz);
  const inHoleRadius = distanceFromHole < 50; // Within 50 units of the hole

  if (gameState.navigation.targetGrabbed && atSurface && inHoleRadius) {
    appendInstrumentConsoleMessage("🏆 MISSION COMPLETE! You found the target and returned to the surface!");
    showWinScreen();
    stopGame();
  }

  // oxygen level
  if (gameState.status.oxygenLevel <= 0) {
    console.log("GAME OVER: Oxygen depleted, level =", gameState.status.oxygenLevel);
    appendInstrumentConsoleMessage("CRITICAL: Oxygen depleted!");
    showGameOverScreen();
    stopGame();
    return;
  }

  // Format position values with 2 decimal places
  // const formatPos = (val) => val.toFixed(2);

  // Update sub-data overlay text
  // let overlayText =
  //   //    `Welcome to the Tangible Interfaces Class Submarine Design Project Simulator. ` +
  //   //   `<a href="https://github.com/steveturbek/Tangible-Interfaces-Submarine-Design-Project/tree/main?tab=readme-ov-file#tangible-interfaces-submarine-design-project" target="new" style="color:white">Read Me for details</a>` +
  //   //`Position(${gameState.position.x.toFixed(2)},${gameState.position.y.toFixed(2)},${gameState.position.z.toFixed(2)}) | ` +
  //   `\nCompass: ${Math.round(gameState.navigation.compassHeading)}° ` +
  //   `\nSpeed: ${Math.round(gameState.navigation.currentSpeedAsPercentage)}% ` +
  //   `\nDepth: ${gameState.status.depth.toFixed(2)}m ` +
  //   `\nPitch: ${Math.round(gameState.rotation.x)}°` +
  //   `\n` +
  //   `\nOxygen: ${gameState.status.oxygenLevel}% ` +
  //   `\nBattery: ${gameState.status.batteryLevel.toFixed(1)}% ` +
  //   `\nTarget: ${gameState.navigation.distanceToTarget.toFixed(2)}m` +
  //   `\n` +
  //   `\nLeftThrust: ${gameState.controls.ThrottleLeft}% ` +
  //   `\nRightThrust: ${gameState.controls.ThrottleRight}% ` +
  //   `\nRudder: ${gameState.controls.YawRudderAngle.toFixed(1)}% ` +
  //   `\nElevator: ${gameState.controls.PitchElevatorAngle.toFixed(1)}% ` +
  //   `\nVerticalThruster: ${gameState.controls.VerticalThruster}%`;

  // // Add boundary warning if needed
  // if (gameState.status.boundaryWarning) {
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
  updateInstruments();
}

function appendInstrumentConsoleMessage(message) {
  //add a line to sub-data-text

  const doc = window.instrumentsWindow && !window.instrumentsWindow.closed ? window.instrumentsWindow.document : document;
  const subDataText = doc.getElementById("sub-data-text");
  if (subDataText) {
    subDataText.textContent += "\n" + message + "\n";
  } else {
    console.log("sub-data-text element not found in", window.instrumentsWindow ? "instruments window" : "main window");
  }
}

// Calculate values derived from core state
//////////////////////////////////////////////////////////////////////////////////////////

function updateDerivedValues() {
  // Calculate distance to target
  const dx = gameState.navigation.targetPosition.x - gameState.position.x;
  const dy = gameState.navigation.targetPosition.y - gameState.position.y;
  const dz = gameState.navigation.targetPosition.z - gameState.position.z;
  const distanceToTargetRaw = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Scale distance to 0-100% based on maximum possible world distance
  // This gives a consistent reference frame: 0% = at target, 100% = at opposite corner of world
  // maxWorldDistance ≈ 2840 units (diagonal across entire world)
  gameState.navigation.distanceToTarget = Math.min(100, (distanceToTargetRaw / gameState.constants.maxWorldDistance) * 100);

  // Calculate compass heading (in XZ plane)
  gameState.navigation.headingToTarget = ((Math.atan2(dx, -dz) * 180) / Math.PI + 360) % 360;

  // Use raw yaw value for compass heading
  gameState.navigation.compassHeading = ((gameState.rotation.y % 360) + 360) % 360;

  // Calculate current speed as percentage of max
  const speed = Math.sqrt(
    gameState.velocity.x * gameState.velocity.x + gameState.velocity.y * gameState.velocity.y + gameState.velocity.z * gameState.velocity.z
  );
  gameState.navigation.currentSpeedAsPercentage = Math.min(100, (speed / gameState.constants.maxSpeed) * 100);

  // Convert depth to positive number for display (Y is up, so negative Y is depth)
  const maxDepth = gameState.constants.waterSurface - gameState.constants.seabedDepth;
  gameState.status.depth = Math.min(maxDepth, -gameState.position.y + gameState.constants.waterSurface);

  //  gameState.status.depth = Math.min(maxDepth, 100 - gameState.position.y);
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
  const minutes = Math.floor(gameState.time.elapsed / 60);
  const seconds = Math.floor(gameState.time.elapsed % 60);
  const timeString = minutes + ":" + String(seconds).padStart(2, "0");

  // Show win overlay in the main window (where the canvas is)
  const finalTime = document.getElementById("final-time");
  const finalOxygen = document.getElementById("final-oxygen");
  const finalBattery = document.getElementById("final-battery");
  const winOverlay = document.getElementById("win-overlay");

  if (finalTime) finalTime.textContent = timeString;
  if (finalOxygen) finalOxygen.textContent = Math.round(gameState.status.oxygenLevel) + "%";
  if (finalBattery) finalBattery.textContent = Math.round(gameState.status.batteryLevel) + "%";

  // Show the win overlay in main window
  if (winOverlay) winOverlay.style.display = "flex";
}

function showGameOverScreen() {
  // Format time from seconds to MM:SS
  const minutes = Math.floor(gameState.time.elapsed / 60);
  const seconds = Math.floor(gameState.time.elapsed % 60);
  const timeString = minutes + ":" + String(seconds).padStart(2, "0");

  // Show game over overlay in the main window
  const gameoverTime = document.getElementById("gameover-time");
  const gameoverOverlay = document.getElementById("gameover-overlay");

  if (gameoverTime) gameoverTime.textContent = timeString;

  // Show the game over overlay with fade-to-black animation
  if (gameoverOverlay) gameoverOverlay.style.display = "flex";
}
