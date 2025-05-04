// Submarine Game State Structure
const gameState = {
  // Position & Orientation (full 3D representation)
  position: { x: 0, y: 0, z: 0 }, // Absolute position in world space
  rotation: { pitch: 0, yaw: 0, roll: 0 }, // Orientation in degrees
  velocity: { x: 0, y: 0, z: 0 }, // Current movement vector
  angularVelocity: { pitch: 0, yaw: 0, roll: 0 }, // Current rotation speed

  // Controls & Input (player inputs or AI controls)
  controls: {
    ThrottleLeft: 0, // -100 to +100 (reverse to forward)
    ThrottleRight: 0, // -100 to +100 (reverse to forward)
    MaxThrottle: 100, // absolute number

    //Elevator flaps on the horizontal tail produce pitch
    PitchElevatorAngle: 0, // -100 to +100 (down to up)
    maxPitchElevatorAngle: 100, // absolute number

    //rudder on the vertical tail produces yaw
    YawRudderAngle: 0, // -100 to +100 (left to right)
    maxRudderAngle: 100, // absolute number

    //Aft Thruster on the horizontal tail produce pitch
    AftThruster: 0, // -100 to +100 (down to up)
    MaxAftThruster: 100, // absolute number

    // Not using roll  targetRoll: 0, // -100 to +100 (optional: left bank to right bank)
  },

  // Resources & Status
  status: {
    oxygenLevel: 100, // 0-100%
    batteryLevel: 100, // 0-100%
    // hullIntegrity: 100, // 0-100% (optional: damage model)
    depth: 0, // 0 to maxDepth (positive number for UI clarity)
  },

  // Navigation & Environment
  navigation: {
    targetPosition: { x: 0, y: 0, z: 0 }, // Current objective location
    distanceToTarget: 0, // 0-100% (scaled)
    compassHeading: 0, // 0-359 degrees
    proximityWarning: 0, // 0-100% (distance to nearest obstacle)
    currentSpeed: 0, // 0-100% (scalar speed value)
  },

  // Game Constants (configure as needed)
  constants: {
    maxOxygenTime: 300, // 5 minutes in seconds
    maxBatteryTime: 150, // 2.5 minutes at full throttle
    maxDepth: 100, // Maximum dive depth
    maxSpeed: 10, // Units per second at 100% throttle
    maxPitchAngle: 45, // Maximum physical pitch in degrees
    maxYawRate: 30, // Maximum yaw rate in degrees per second
    dragCoefficient: 0.05, // Water resistance factor
    mass: 1000, // Mass affects momentum
    maxDistance: 100000, // Example value, adjust based on your world size
  },

  // Game time tracking
  time: {
    elapsed: 0, // Total game time in seconds
    deltaTime: 0, // Time since last update (for physics)
    logTimeCounter: 0, // Temporary count of time to count up to logTimeLengthMS
    logTimeCounterLengthMS: 0.5, //500 milliseconds
  },
};

// Example update function to be called each frame
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
  const aftPowerDrain = (Math.abs(gameState.controls.AftThruster) * 0.3 * deltaTime) / gameState.constants.maxBatteryTime;
  const totalPowerDrain = mainPowerDrain + aftPowerDrain;

  gameState.status.batteryLevel = Math.max(0, gameState.status.batteryLevel - totalPowerDrain);

  // Apply water resistance (drag) to slow down the submarine when no thrust is applied
  const drag = gameState.constants.dragCoefficient;

  // Calculate forward thrust vector based on submarine orientation
  // Convert yaw from degrees to radians for trigonometry calculations
  const yawRad = (gameState.rotation.yaw * Math.PI) / 180;
  const pitchRad = (gameState.rotation.pitch * Math.PI) / 180;

  // Calculate thruster impacts on velocity
  // Only apply thrust if battery has power
  if (gameState.status.batteryLevel > 0) {
    // 1. Apply Left and Right Thrusters (main propulsion)
    // Scale thruster values to appropriate acceleration
    const thrustFactor = gameState.constants.maxSpeed / 100;

    // Calculate net forward thrust from both thrusters
    const netThrust = (gameState.controls.ThrottleLeft + gameState.controls.ThrottleRight) / 2;

    // Calculate turning effect from differential thrust (like tank treads)
    const diffThrust = (gameState.controls.ThrottleRight - gameState.controls.ThrottleLeft) / 2;

    // Apply thrust vectors based on current orientation
    // Forward/backward movement
    const thrustAccelX = Math.cos(yawRad) * Math.cos(pitchRad) * netThrust * thrustFactor * deltaTime;
    const thrustAccelY = Math.sin(yawRad) * Math.cos(pitchRad) * netThrust * thrustFactor * deltaTime;
    const thrustAccelZ = Math.sin(pitchRad) * netThrust * thrustFactor * deltaTime;

    gameState.velocity.x += thrustAccelX;
    gameState.velocity.y += thrustAccelY;
    gameState.velocity.z += thrustAccelZ;

    // Apply turning effect from differential thrust
    // This creates additional yaw rotation based on thrust difference
    gameState.angularVelocity.yaw += diffThrust * 0.5 * deltaTime;

    // 2. Apply Rudder effect (yaw control)
    // Rudder effect is proportional to forward speed
    const forwardSpeed = Math.sqrt(gameState.velocity.x * gameState.velocity.x + gameState.velocity.y * gameState.velocity.y);

    // Rudder is more effective at higher speeds
    const rudderEffect = (gameState.controls.YawRudderAngle / 100) * (forwardSpeed / gameState.constants.maxSpeed) * gameState.constants.maxYawRate * deltaTime;

    gameState.angularVelocity.yaw += rudderEffect;

    // 3. Apply Elevator effect (pitch control)
    // Like rudder, elevator effect is proportional to forward speed
    const elevatorEffect =
      (gameState.controls.PitchElevatorAngle / 100) * (forwardSpeed / gameState.constants.maxSpeed) * gameState.constants.maxPitchAngle * 0.5 * deltaTime;

    gameState.angularVelocity.pitch += elevatorEffect;

    // 4. Apply Aft Thrusters (vertical control when stationary)
    // These work regardless of forward speed, but are slower
    const aftThrustFactor = 0.2; // Aft thrusters are weaker than main thrusters
    const aftEffect = (gameState.controls.AftThruster / 100) * aftThrustFactor * deltaTime;

    // Aft thrusters directly affect pitch velocity
    gameState.angularVelocity.pitch += aftEffect;
  }

  // Apply drag/water resistance to velocities
  gameState.velocity.x *= 1 - drag * deltaTime;
  gameState.velocity.y *= 1 - drag * deltaTime;
  gameState.velocity.z *= 1 - drag * deltaTime;

  // Apply drag to angular velocities
  gameState.angularVelocity.pitch *= 1 - drag * 2 * deltaTime;
  gameState.angularVelocity.yaw *= 1 - drag * 2 * deltaTime;
  gameState.angularVelocity.roll *= 1 - drag * 2 * deltaTime;

  // Limit maximum pitch to avoid submarine flipping over
  const maxPitch = gameState.constants.maxPitchAngle;
  gameState.rotation.pitch = Math.max(-maxPitch, Math.min(maxPitch, gameState.rotation.pitch));

  // Apply physics: update position based on velocity
  gameState.position.x += gameState.velocity.x * deltaTime;
  gameState.position.y += gameState.velocity.y * deltaTime;
  gameState.position.z += gameState.velocity.z * deltaTime;

  // Update rotation based on angular velocity
  gameState.rotation.pitch += gameState.angularVelocity.pitch * deltaTime;
  gameState.rotation.yaw += gameState.angularVelocity.yaw * deltaTime;
  gameState.rotation.roll += gameState.angularVelocity.roll * deltaTime;

  // Calculate derived values
  updateDerivedValues();

  // run this every so often to update instruments, etc
  if (gameState.time.logTimeCounter > gameState.time.logTimeCounterLengthMS) {
    gameState.time.logTimeCounter = 0;

    updateCounter();
  }
}

function updateCounter() {
  // Check oxygen level
  if (gameState.status.oxygenLevel <= 0) {
    console.log("CRITICAL: Oxygen depleted! You died.");
    stopGame();
    return;
  }

  // Format position values with 2 decimal places
  const formatPos = (val) => val.toFixed(2);

  // Log submarine state values in a single line
  console.log(
    `Position(${formatPos(gameState.position.x)},${formatPos(gameState.position.y)},${formatPos(gameState.position.z)}) | ` +
      `Heading: ${Math.round(gameState.navigation.compassHeading)}° | ` +
      `Speed: ${Math.round(gameState.navigation.currentSpeed)}% | ` +
      `Depth: ${formatPos(gameState.status.depth)}m | ` +
      `Pitch: ${formatPos(gameState.rotation.pitch)}° | ` +
      `O₂: ${gameState.status.oxygenLevel}% | ` +
      `Batt: ${gameState.status.batteryLevel.toFixed(1)}% | ` +
      `Target: ${gameState.navigation.distanceToTarget.toFixed(1)}m` +
      `LeftThrust: ${gameState.controls.ThrottleLeft}% | ` +
      `RightThrust: ${gameState.controls.ThrottleRight}% | ` +
      `Rudder: ${gameState.controls.YawRudderAngle}% | ` +
      `Elevator: ${gameState.controls.PitchElevatorAngle}% | ` +
      `Aft: ${gameState.controls.AftThruster}%`
  );

  // Update instruments
  updateInstruments();
}

// Calculate values derived from core state
function updateDerivedValues() {
  // Calculate distance to target
  const dx = gameState.navigation.targetPosition.x - gameState.position.x;
  const dy = gameState.navigation.targetPosition.y - gameState.position.y;
  const dz = gameState.navigation.targetPosition.z - gameState.position.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Scale distance to 0-100%
  gameState.navigation.distanceToTarget = Math.min(100, (distance / gameState.constants.maxDistance) * 100);

  // Calculate compass heading (simplified - assumes y is up)
  gameState.navigation.compassHeading = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;

  // Calculate current speed as percentage of max
  const speed = Math.sqrt(
    gameState.velocity.x * gameState.velocity.x + gameState.velocity.y * gameState.velocity.y + gameState.velocity.z * gameState.velocity.z
  );
  gameState.navigation.currentSpeed = (speed / gameState.constants.maxSpeed) * 100;

  // Convert depth to positive number for display (assuming negative z is down)
  gameState.status.depth = Math.min(gameState.constants.maxDepth, -gameState.position.z);
}

// Game loop implementation to add to the end of game.js

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
    // renderUnderwaterScene();
    animationFrameId = requestAnimationFrame(gameLoop);
  }
}

// Function to start the game
function startGame() {
  if (!isGameRunning) {
    console.log("Starting game loop");
    isGameRunning = true;
    lastFrameTime = 0; // Reset the time tracker
    animationFrameId = requestAnimationFrame(gameLoop);
  }
}

// Function to stop the game
function stopGame() {
  if (isGameRunning) {
    console.log("Stopping game loop");
    isGameRunning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }
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
