// Submarine Game State Structure
const gameState = {
  // Position & Orientation (full 3D representation)
  position: { x: 0, y: 0, z: 0 }, // Absolute position in world space
  rotation: { pitch: 0, yaw: 0, roll: 0 }, // Orientation in degrees
  velocity: { x: 0, y: 0, z: 0 }, // Current movement vector
  angularVelocity: { pitch: 0, yaw: 0, roll: 0 }, // Current rotation speed

  // Controls & Input (player inputs or AI controls)
  controls: {
    targetThrottle: 0, // -100 to +100 (reverse to forward)
    targetPitch: 0, // -100 to +100 (down to up)
    targetYaw: 0, // -100 to +100 (left to right)
    targetRoll: 0, // -100 to +100 (optional: left bank to right bank)
  },

  // Resources & Status
  status: {
    engineRPM: 0, // -100 to +100 (current engine speed)
    oxygenLevel: 100, // 0-100%
    batteryLevel: 100, // 0-100%
    hullIntegrity: 100, // 0-100% (optional: damage model)
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
  },
};

// Example update function to be called each frame
function updateSubmarineState(deltaTime) {
  // Update time
  gameState.time.deltaTime = deltaTime;
  gameState.time.elapsed += deltaTime;

  // Update oxygen based on elapsed time
  gameState.status.oxygenLevel = Math.max(0, 100 - Math.ceil(gameState.time.elapsed / 3));

  // Update battery based on engine usage
  const powerDrain = (Math.abs(gameState.status.engineRPM) * deltaTime) / gameState.constants.maxBatteryTime;
  gameState.status.batteryLevel = Math.max(0, gameState.status.batteryLevel - powerDrain);

  // Gradually adjust actual RPM, pitch and yaw towards target values
  // (Add smooth interpolation logic here)

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
    renderUnderwaterScene();
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
    console.log("Window loaded, starting game in 500ms");
    // Start the game loop after a delay to ensure all initialization is complete
    setTimeout(startGame, 500);
  },
  { once: true }
); // Only attach this listener once
