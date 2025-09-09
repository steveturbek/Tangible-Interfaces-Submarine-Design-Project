// Submarine Game State Structure
const gameState_original = {
  // Position & Orientation (using Three.js coordinate system)
  position: { x: 0, y: 90, z: 0 }, // x: right/left, y: up/down, z: forward/backward
  rotation: { x: 0, y: 0, z: 0 }, // x: pitch, y: yaw, z: roll
  velocity: { x: 0, y: 0, z: 0 }, // velocity vector in Three.js coordinates
  angularVelocity: { x: 0, y: 0, z: 0 }, // rotation speed in Three.js coordinates

  // Controls & Input (player inputs or AI controls)
  controls: {
    ThrottleLeft: 0, // -100 to +100 (reverse to forward)
    ThrottleRight: 0, // -100 to +100 (reverse to forward)
    MaxThrottle: 100, // absolute number

    //Elevator flaps on the horizontal tail produce pitch
    PitchElevatorAngle: 0, // -100 to +100 (down to up)
    maxPitchElevatorAngle: 30, // absolute number

    //rudder on the vertical tail produces yaw
    YawRudderAngle: 0, // -100 to +100 (left to right)
    maxYawRudderAngle: 30, // absolute number

    //Aft Thruster on the horizontal tail produce pitch
    VerticalThruster: 0, // -100 to +100 (down to up)
    MaxVerticalThruster: 100, // absolute number

    // Not using roll  targetRoll: 0, // -100 to +100 (optional: left bank to right bank)
  },

  // Resources & Status
  status: {
    oxygenLevel: 100, // 0-100%
    batteryLevel: 100, // 0-100%
    // hullIntegrity: 100, // 0-100% (optional: damage model)
    depth: 0, // 0 to maxDepth (positive number for UI clarity)
    boundaryWarning: false, // Flag to indicate proximity to boundaries
  },

  // Navigation & Environment
  navigation: {
    targetPosition: { x: 0, y: 0, z: -1000 }, // target location
    distanceToTarget: 0, // 0-100% (scaled)
    headingToTarget: 0, // 0-359 degrees
    // proximityWarning: 0, // 0-100% (distance to nearest obstacle)
    currentSpeed: 0, // 0-100% (scalar speed value)
    compassHeading: 0, // 0-359 degrees
  },

  // Game Constants (configure as needed)
  constants: {
    maxOxygenTime: 300, // 5 minutes in seconds
    maxBatteryTime: 150, // 2.5 minutes at full throttle
    maxDepth: 100, // Maximum dive depth
    maxSpeed: 10, // Units per second at 100% throttle
    maxPitchAngle: 25, // Maximum physical pitch in degrees
    maxYawRate: 20, // Maximum yaw rate in degrees per second
    dragCoefficient: 0.05, // Water resistance factor
    mass: 1000, // Mass affects momentum
    maxDistance: 100000, // Example value, adjust based on your world size
    worldBoundary: 1000, // Half of WORLD_SIZE (2000) from rendering.js
    seabedDepth: 0, // Depth of the seabed from rendering.js
    waterSurface: 100, // Water surface level from rendering.js
  },

  // Game time tracking
  time: {
    elapsed: 0, // Total game time in seconds
    deltaTime: 0, // Time since last update (for physics)
    logTimeCounter: 0, // Temporary count of time to count up to logTimeLengthMS
    logTimeCounterLengthMS: 0.5, //500 milliseconds
  },
};

const gameState = [];

Object.keys(gameState_original).forEach((key) => {
  if (typeof gameState_original[key] === "object" && gameState_original[key] !== null) {
    gameState[key] = JSON.parse(JSON.stringify(gameState_original[key]));
  } else {
    gameState[key] = gameState_original[key];
  }
});

//////////////////////////////////////////////////////////////////////////////////////////

// Function to start the game
function startGame() {
  if (!isGameRunning) {
    console.log("Starting game");
    isGameRunning = true;
    lastFrameTime = 0; // Reset the time tracker
    animationFrameId = requestAnimationFrame(gameLoop);
  } else stopGame();
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

  // Reset game state to original values (deep copy)
  // This properly copies all nested objects
  Object.keys(gameState_original).forEach((key) => {
    if (typeof gameState_original[key] === "object" && gameState_original[key] !== null) {
      gameState[key] = JSON.parse(JSON.stringify(gameState_original[key]));
    } else {
      gameState[key] = gameState_original[key];
    }
  });

  document.getElementById("sub-data-text").textContent = "";

  // Restart the game loop
  setTimeout(startGame, 500);
}

// Start the game after everything else is loaded
window.addEventListener(
  "load",
  function () {
    // console.log("Window loaded, starting game in 500ms");
    // Start the game loop after a delay to ensure all initialization is complete
    setTimeout(startGame, 500);
  },
  { once: true }
); // Only attach this listener once

//////////////////////////////////////////////////////////////////////////////////////////

function updateSubmarineState(deltaTime) {
  // Update time
  gameState.time.deltaTime = deltaTime;
  gameState.time.elapsed += deltaTime;
  gameState.time.logTimeCounter += deltaTime;

  // Update oxygen based on elapsed time
  gameState.status.oxygenLevel = Math.max(
    0,
    Math.ceil(((gameState.constants.maxOxygenTime - gameState.time.elapsed) / gameState.constants.maxOxygenTime) * 100)
  );

  // Calculate engine RPM based on thruster values
  // Average the absolute values of both thrusters to get overall engine load
  const avgThrottle = (Math.abs(gameState.controls.ThrottleLeft) + Math.abs(gameState.controls.ThrottleRight)) / 2;
  gameState.status.engineRPM = avgThrottle;

  // Update battery based on engine usage and aft thruster
  const mainPowerDrain = (avgThrottle * deltaTime) / gameState.constants.maxBatteryTime;
  // Aft thrusters also use some power, but less than main thrusters
  const aftPowerDrain = (Math.abs(gameState.controls.VerticalThruster) * 0.3 * deltaTime) / gameState.constants.maxBatteryTime;
  const totalPowerDrain = mainPowerDrain + aftPowerDrain;

  gameState.status.batteryLevel = Math.max(0, gameState.status.batteryLevel - totalPowerDrain);

  // Calculate forward thrust vector based on submarine orientation
  // Get orientation angles in radians (for Three.js coordinates)
  const pitch = THREE.MathUtils.degToRad(gameState.rotation.x);
  const yaw = THREE.MathUtils.degToRad(gameState.rotation.y);
  const roll = THREE.MathUtils.degToRad(gameState.rotation.z);

  // Calculate thrust based on thruster values
  if (gameState.status.batteryLevel > 0) {
    // Calculate thrust factor
    const thrustFactor = gameState.constants.maxSpeed / 100;

    // Calculate net forward thrust from both thrusters
    const netThrust = (gameState.controls.ThrottleLeft + gameState.controls.ThrottleRight) / 2;

    // Calculate turning effect from differential thrust
    const diffThrust = (gameState.controls.ThrottleRight - gameState.controls.ThrottleLeft) / 2;

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
    const elevatorEffect =
      (gameState.controls.PitchElevatorAngle / 100) * (forwardSpeed / gameState.constants.maxSpeed) * gameState.constants.maxPitchAngle * 0.5 * deltaTime;
    gameState.angularVelocity.x += elevatorEffect;
    // INTENTIONALLY NOT AFFECTING Z (ROLL) AXIS

    // Apply aft thrusters (vertical control)
    const aftThrustFactor = 0.2;
    const aftEffect = (gameState.controls.VerticalThruster / 100) * aftThrustFactor * deltaTime;
    gameState.angularVelocity.x += aftEffect;
    // INTENTIONALLY NOT AFFECTING Z (ROLL) AXIS

    // ADDED: Actively dampen roll to zero - this is the key fix
    // This ensures any inadvertent roll quickly returns to neutral
    // gameState.angularVelocity.z *= 0.7; // Strong damping factor specifically for roll
    // gameState.rotation.z *= 0.95; // Also gradually reduce any roll that has accumulated
  }

  // ENHANCED: Aggressively counter any roll to maintain vertical orientation
  // This is critical for intuitive steering, especially for new users
  const rollStabilizationRate = 0.95; // Increased from 0.7 - more aggressive damping
  const rollResetRate = 0.8; // Increased from 0.95 - faster return to zero

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

  // Apply drag to velocities
  const drag = gameState.constants.dragCoefficient;
  gameState.velocity.x *= 1 - drag * deltaTime;
  gameState.velocity.y *= 1 - drag * deltaTime;
  gameState.velocity.z *= 1 - drag * deltaTime;

  // Apply drag to angular velocities
  gameState.angularVelocity.x *= 1 - drag * 4 * deltaTime;
  gameState.angularVelocity.y *= 1 - drag * 4 * deltaTime;
  gameState.angularVelocity.z *= 1 - drag * 2 * deltaTime;

  // Limit maximum pitch angle
  const maxPitch = gameState.constants.maxPitchAngle;
  gameState.rotation.x = Math.max(-maxPitch, Math.min(maxPitch, gameState.rotation.x));

  // Update position based on velocity
  gameState.position.x += gameState.velocity.x * deltaTime;
  gameState.position.y += gameState.velocity.y * deltaTime;
  gameState.position.z += gameState.velocity.z * deltaTime;

  // Update rotation based on angular velocity
  gameState.rotation.x += gameState.angularVelocity.x * deltaTime;
  gameState.rotation.y += gameState.angularVelocity.y * deltaTime;
  gameState.rotation.z += gameState.angularVelocity.z * deltaTime;

  // Apply boundary constraints
  applyBoundaryConstraints();

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
  };

  // Make a copy of the position to track changes
  const newPosition = { x, y, z };

  // X boundary (left/right)
  if (Math.abs(x) > worldBoundary) {
    newPosition.x = Math.sign(x) * (worldBoundary - 0.5);
    resetVelocities();
    isHittingBoundary = true;
    console.log("Hit side boundary - stopping submarine");
  }

  // Y boundary (vertical: seabed and water surface)
  if (y < threeJsSeabedY) {
    // Below seabed
    newPosition.y = threeJsSeabedY + 10;
    resetVelocities();
    isHittingBoundary = true;
    console.log("Hit seabed - stopping submarine");
  } else if (y > threeJsWaterSurfaceY) {
    // Above water surface
    newPosition.y = threeJsWaterSurfaceY - 10;
    resetVelocities();
    isHittingBoundary = true;
    console.log("Hit water surface - stopping submarine");
  }

  // Z boundary (forward/backward)
  if (Math.abs(z) > worldBoundary) {
    newPosition.z = Math.sign(z) * (worldBoundary - 10);
    resetVelocities();
    isHittingBoundary = true;
    console.log("Hit forward/backward boundary - stopping submarine");
  }

  // Update position with corrected values
  gameState.position.x = newPosition.x;
  gameState.position.y = newPosition.y;
  gameState.position.z = newPosition.z;

  // Console log the corrected position
  if (isHittingBoundary) {
    console.log(
      `Position after bounds check: x=${gameState.position.x.toFixed(2)}, y=${gameState.position.y.toFixed(2)}, z=${gameState.position.z.toFixed(2)}`
    );
  }

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
  // console.log(gameState.navigation.distanceToTarget);
  //are you at target?
  if (gameState.navigation.distanceToTarget < 0.1) {
    console.log("Won!");
    stopGame();
  }

  // oxygen level
  if (gameState.status.oxygenLevel <= 0) {
    console.log("CRITICAL: Oxygen depleted! You ded.");
    stopGame();
    return;
  }

  // Format position values with 2 decimal places
  // const formatPos = (val) => val.toFixed(2);

  // Update sub-data overlay text
  let overlayText =
    `Welcome to the Tangible Interfaces Class Submarine Design Project Simulator. ` +
    `<a href="https://github.com/steveturbek/Tangible-Interfaces-Submarine-Design-Project/tree/main?tab=readme-ov-file#tangible-interfaces-submarine-design-project" target="new" style="color:white">Read Me for details</a>` +
    `\n` +
    `This is a data panel for testing the game. Use TAB key to hide.` +
    `\n` +
    `\n` +
    `You can drive this submarine using keys \n` +
    `\tA	Increases power to the left thruster \n` +
    `\tS	Increases power to the right thruster \n` +
    `\tZ	Decreases power to the left thruster \n` +
    `\tX	Decreases power to the right thruster \n` +
    `\tArrow keys for steering \n` +
    `\t(There are more controls in the Read Me) \n` +
    `\n` +
    `\n` +
    `Position(${gameState.position.x.toFixed(2)},${gameState.position.y.toFixed(2)},${gameState.position.z.toFixed(2)}) | ` +
    `compassHeading: ${Math.round(gameState.navigation.compassHeading)}° | ` +
    `Speed: ${Math.round(gameState.navigation.currentSpeed)}% | ` +
    `Depth: ${gameState.status.depth.toFixed(2)}m | ` +
    `Pitch: ${Math.round(gameState.rotation.x)}°` +
    `\n` +
    `O₂: ${gameState.status.oxygenLevel}% | ` +
    `Batt: ${gameState.status.batteryLevel.toFixed(1)}% | ` +
    `Target: ${gameState.navigation.distanceToTarget.toFixed(2)}m` +
    `\n` +
    `LeftThrust: ${gameState.controls.ThrottleLeft}% | ` +
    `RightThrust: ${gameState.controls.ThrottleRight}% | ` +
    `Rudder ←→: ${gameState.controls.YawRudderAngle.toFixed(1)}% | ` +
    `Elevator ↑↓: ${gameState.controls.PitchElevatorAngle.toFixed(1)}% | ` +
    `VerticalThruster: ${gameState.controls.VerticalThruster}%`;

  // Add boundary warning if needed
  if (gameState.status.boundaryWarning) {
    overlayText += `\n\n⚠️ Approaching boundary!`;
  }

  document.getElementById("sub-data-text").innerHTML = overlayText;

  // Update instruments
  updateInstruments();
}

// Calculate values derived from core state
//////////////////////////////////////////////////////////////////////////////////////////

function updateDerivedValues() {
  // Calculate distance to target
  const dx = gameState.navigation.targetPosition.x - gameState.position.x;
  const dy = gameState.navigation.targetPosition.y - gameState.position.y;
  const dz = gameState.navigation.targetPosition.z - gameState.position.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Scale distance to 0-100%
  gameState.navigation.distanceToTarget = Math.min(100, (distance / gameState.constants.maxDistance) * 100);

  // Calculate compass heading (in XZ plane)
  gameState.navigation.headingToTarget = ((Math.atan2(dx, -dz) * 180) / Math.PI + 360) % 360;

  // Use raw yaw value for compass heading
  gameState.navigation.compassHeading = ((gameState.rotation.y % 360) + 360) % 360;

  // Calculate current speed as percentage of max
  const speed = Math.sqrt(
    gameState.velocity.x * gameState.velocity.x + gameState.velocity.y * gameState.velocity.y + gameState.velocity.z * gameState.velocity.z
  );
  gameState.navigation.currentSpeed = (speed / gameState.constants.maxSpeed) * 100;

  // Convert depth to positive number for display (Y is up, so negative Y is depth)
  // OLD gameState.status.depth = Math.min(gameState.constants.maxDepth, -gameState.position.y + gameState.constants.waterSurface);

  gameState.status.depth = Math.min(gameState.constants.maxDepth, 100 - gameState.position.y);
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
    // This is defined there and should not recreate the coral reef
    renderUnderwaterScene();
    animationFrameId = requestAnimationFrame(gameLoop);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////
