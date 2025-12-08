// 3D Underwater Scene Rendering using Three.js - Caribbean Edition

// Scene variables
let scene, camera, renderer;
let targetSphere;
let startSphere;
let seabed;
let water;
let directionalLight, ambientLight;
let clock;
let underwaterFog;

// Environment settings
const WATER_COLOR = 0x0096ff; // Bright Caribbean blue
const DEEP_WATER_COLOR = 0x0073cf; // Deeper Caribbean blue for gradient
const FOG_COLOR = 0x0096ff; // Match water color

const TARGET_COLOR = 0xffffff; // White glowing diamond target
const TARGET_SIZE = 5; // Target sphere size
const FOG_NEAR = 50; //10; // Start fog effect at 10 units
const FOG_FAR = 500; // 100; Max visibility distance

// Check Three.js version and provide compatibility
const isNewThreeVersion = THREE.REVISION >= 125; // r125+ uses only BufferGeometry

// Initialize the 3D scene
function initScene() {
  // Create clock for animations
  clock = new THREE.Clock();

  // Create scene with Caribbean blue color
  scene = new THREE.Scene();
  scene.background = new THREE.Color(WATER_COLOR);

  // Add underwater fog effect for light scattering/distance obscuring (skip for easy mode)
  const difficulty = window.gameDifficulty || "hard";
  if (difficulty !== "easy") {
    underwaterFog = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR);
    scene.fog = underwaterFog;
  }

  // Create camera - first person view
  const aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);

  // For debugging - log initial orientation
  // console.log("Initial camera setup at game start");
  // console.log("Game state initial rotation (degrees):", "Pitch: 0, Yaw: 0, Roll: 0");
  // console.log("Adding 90 degrees to yaw for camera orientation");
  // console.log("Expected camera to look towards (1,0,0) world coordinates");

  // Create renderer and attach to canvas
  const canvas = document.getElementById("outside-scene");
  // console.log("initScene - Canvas dimensions:", canvas.offsetWidth, "x", canvas.offsetHeight);

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // console.log("Renderer initialized with size:", canvas.offsetWidth, "x", canvas.offsetHeight);

  // Enable physically correct lighting
  renderer.physicallyCorrectLights = true;

  // Add post-processing for water caustics
  setupPostProcessing();

  // Add lighting for bright Caribbean day
  setupLighting();

  // plain flat area to make it look better outside world area

  //maybe this is limited to world size?
  // createSimpleExtendedSeabed();

  // Create seabed with coral formations
  createSeabed();

  // Create target sphere
  createTarget();

  // Create start position marker
  createStartMarker();

  // Add water effects - caustics, particles, etc.
  // createWaterEffects();  //there was some flashing

  // Add coral reef elements (skip for easy mode)
  if (difficulty !== "easy") {
    createCoralReef();
  }

  // Add visible water surface boundary
  createWaterSurfaceBoundary();

  // Add boundary walls with rock textures
  // createBoundaryWalls();

  // Handle window resize
  window.addEventListener("resize", onWindowResize);

  // Initial camera position
  updateCameraPosition();
}

// Setup post-processing effects
function setupPostProcessing() {
  // This is a simplified placeholder - implement if Three.js version supports it
  if (THREE.EffectComposer) {
    // Setup would go here if using post-processing libraries
    console.log("Post-processing available");
  }
}

// Set up scene lighting for a bright Caribbean day
// Set up scene lighting for a bright Caribbean day with enhanced underwater effects
function setupLighting() {
  // Bright sunlight (directional light) - increased intensity
  directionalLight = new THREE.DirectionalLight(0xffffdd, 2.5); // Increased from 1.5 to 2.5, warmer color
  directionalLight.position.set(100, 150, 100); // Raised position for better angle
  directionalLight.castShadow = true;

  // Improve shadow properties
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 500;
  directionalLight.shadow.bias = -0.001;

  scene.add(directionalLight);

  // Add sunrays with light shafts (volumetric lighting effect) - increased range and intensity
  const sunRayLight = new THREE.SpotLight(0xffffcc, 3, 150, Math.PI / 5, 0.3); // Increased intensity and range
  sunRayLight.position.set(50, 120, 50); // Higher position
  sunRayLight.castShadow = true;
  scene.add(sunRayLight);

  // Add a target for the spotlight to aim at the water
  const spotLightTarget = new THREE.Object3D();
  spotLightTarget.position.set(0, 0, 0);
  scene.add(spotLightTarget);
  sunRayLight.target = spotLightTarget;

  // Warm ambient light for overall scene illumination - increased intensity
  ambientLight = new THREE.AmbientLight(0x88bbff, 1.2); // Increased from 0.8 to 1.2, bluer tint
  scene.add(ambientLight);

  // Add a bright blue point light to simulate water scattering - increased intensity and range
  const waterLight = new THREE.PointLight(0x00ffff, 1.0, 200); // Increased from 0.6 to 1.0, range from 150 to 200
  waterLight.position.set(0, 50, 0); // Higher position (was 20)
  scene.add(waterLight);

  // Add secondary light sources to simulate light refraction in water - increased intensity
  const refractedLight1 = new THREE.PointLight(0x00ccff, 0.7, 100); // Increased from 0.4 to 0.7, range from 80 to 100
  refractedLight1.position.set(30, 40, -20); // Higher position (was 10)
  scene.add(refractedLight1);

  const refractedLight2 = new THREE.PointLight(0x88ccff, 0.6, 80); // Increased from 0.3 to 0.6, range from 60 to 80
  refractedLight2.position.set(-40, 35, 15); // Higher position (was 5)
  scene.add(refractedLight2);

  // NEW: Add caustics effect using additional lights
  const causticsLight = new THREE.SpotLight(0xaaffff, 1.5, 100, Math.PI / 4, 0.8);
  causticsLight.position.set(0, 90, 0);
  causticsLight.castShadow = false;
  // scene.add(causticsLight);

  // Animate the caustics light position subtly
  function animateCaustics() {
    const time = clock ? clock.getElapsedTime() : 0;

    // Subtle movement pattern for caustics
    if (causticsLight) {
      causticsLight.position.x = Math.sin(time * 0.5) * 20;
      causticsLight.position.z = Math.cos(time * 0.3) * 20;
      causticsLight.intensity = 1.0 + Math.sin(time * 2) * 0.5; // Intensity fluctuation
    }

    requestAnimationFrame(animateCaustics);
  }

  // Start caustics animation
  animateCaustics();
}

// Replace the existing createSeabed function with this version
function createSeabed() {
  // Create a circular plane for the seabed using CircleBufferGeometry
  // The radius is half of window.gameState.constants.worldBoundaryVisible to match the diameter with the world boundary
  const radius = window.gameState.constants.worldBoundaryVisible / 2;
  const segments = 40; // Moderate value for smoother circle
  const seabedGeometry = new THREE.CircleBufferGeometry(radius, segments);

  // Load sand texture
  const textureLoader = new THREE.TextureLoader();

  // Create material with tropical white sand appearance
  const seabedMaterial = new THREE.MeshStandardMaterial({
    color: 0xf2e8c9, // Light beige/white sand color
    roughness: 0.8,
    metalness: 0.1,
    flatShading: false,
  });

  // Try to load texture, but have fallback
  // NOTE: When running from file:// protocol (without web server), texture loading
  // will fail due to CORS restrictions. The game will use the fallback color instead.
  // This is expected behavior and does not affect gameplay.
  // textureLoader.load(
  //   "artwork/sand_texture.jpg",
  //   function (texture) {
  //     // Success callback
  //     texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  //     texture.repeat.set(50, 50);
  //     seabedMaterial.map = texture;
  //     seabedMaterial.needsUpdate = true;
  //   },
  //   undefined,
  //   function (err) {
  //     // Error callback - already using fallback color
  //     console.log("Using fallback sand color (texture failed to load - this is expected when running from file://)");
  //   }
  // );

  // Create seabed mesh and position it
  seabed = new THREE.Mesh(seabedGeometry, seabedMaterial);
  seabed.rotation.x = -Math.PI / 2; // Rotate to horizontal
  seabed.position.y = window.gameState.constants.seabedDepth;

  scene.add(seabed);

  // Add wave patterns to seabed for realism
  if (seabedGeometry.attributes.position) {
    const positions = seabedGeometry.attributes.position.array;
    const simplex = new SimplexNoise(); // Require simplex-noise library

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];

      // Create natural sand ripples and dunes
      const noise = simplex.noise2D(x * 0.01, z * 0.01) * 2;
      const smallerNoise = simplex.noise2D(x * 0.05, z * 0.05) * 0.5;

      positions[i + 1] += noise + smallerNoise; // Combine different noise scales
    }

    seabedGeometry.attributes.position.needsUpdate = true;
    seabedGeometry.computeVertexNormals();
  }

  // Optional: Create a dark circular edge around the seabed to create a depth illusion
  createSeabedEdge(radius);
}

// Add this new function to create a circular edge around the seabed
function createSeabedEdge(radius) {
  // Create a slightly larger ring to represent the edge/drop-off
  const edgeOuterRadius = radius * 1.2;
  const edgeInnerRadius = radius * 0.98; // Slightly smaller than seabed to avoid z-fighting
  const segments = 80;

  const edgeGeometry = new THREE.RingBufferGeometry(edgeInnerRadius, edgeOuterRadius, segments);

  // Darker material to create depth illusion
  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: 0x333344, // Dark blue-gray color
    roughness: 0.9,
    metalness: 0.2,
    side: THREE.DoubleSide, // Render both sides
  });

  const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
  edge.rotation.x = -Math.PI / 2; // Rotate to horizontal
  edge.position.y = window.gameState.constants.seabedDepth - 5; // Position slightly below the seabed

  scene.add(edge);

  return edge;
}

// Enhanced Coral Reef Creation with Tempest-inspired geometry and collision detection
// Add this to your rendering.js file, replacing the existing createCoralReef function

// Global array to store collision data for obstacles
// Global array to store collision data for obstacles
let coralObstacles = [];

// Create massive coral structures that reach from seabed to water surface
function createCoralReef() {
  // console.log("Creating massive coral structures...");

  // Clear existing obstacles array
  coralObstacles = [];

  // Create a coral reef group
  const reefGroup = new THREE.Group();
  scene.add(reefGroup);

  // Naturalistic coral colors inspired by the seabed palette
  const coralColors = [
    0xd4a574, // Sandy beige coral
    0xc9956b, // Warm sand coral
    0xe8d5b7, // Light sand coral
    0xb8945a, // Golden sand coral
    0xa67c52, // Dark sand coral
    0xf2e8c9, // Pale sand coral (matching seabed)
    0xdfc49a, // Medium sand coral
    0xcd9b6f, // Rusty sand coral
    0xe6d7a3, // Light golden coral
    0xb5896b, // Brown sand coral
    0xf0e4d0, // Very light sand coral
    0xa08060, // Dark brown coral
  ];

  // Calculate the full height from seabed to water surface
  const fullHeight = window.gameState.constants.waterSurface - window.gameState.constants.seabedDepth;
  // console.log(`Creating coral structures with height: ${fullHeight} units`);

  // Create fewer but much larger formations
  const coralCount = 40;
  const minDistance = 150; // Much larger minimum distance between structures

  for (let i = 0; i < coralCount; i++) {
    let position;
    let attempts = 0;
    const maxAttempts = 50;

    // Try to find a position that doesn't overlap with existing coral
    do {
      const x = (Math.random() - 0.5) * window.gameState.constants.worldBoundaryVisible * 0.6;
      const z = (Math.random() - 0.5) * window.gameState.constants.worldBoundaryVisible * 0.6;
      position = { x, z };
      attempts++;
    } while (attempts < maxAttempts && isTooCloseToExisting(position, minDistance));

    // All coral structures extend above the water surface to make it obvious
    const heightMultiplier = 1.2 + Math.random() * 0.3; // 120-150% height
    const coralHeight = fullHeight * heightMultiplier;

    // Create a massive coral structure
    const coralStructure = createMassiveCoralStructure(coralColors, coralHeight);

    // Position the coral at seabed level
    coralStructure.position.set(position.x, window.gameState.constants.seabedDepth, position.z);
    reefGroup.add(coralStructure);

    // Add to collision detection array with much larger radius
    const collisionRadius = Math.random() * 40 + 60; // Radius between 60-100
    coralObstacles.push({
      position: { x: position.x, y: window.gameState.constants.seabedDepth + fullHeight / 2, z: position.z },
      radius: collisionRadius,
      mesh: coralStructure,
      originalEmissiveIntensity: 0.2,
    });
  }

  // console.log(`Created ${coralObstacles.length} massive coral structures`);
}

// Check if a position is too close to existing coral
function isTooCloseToExisting(newPos, minDistance) {
  // Check distance from submarine starting position (0, 0) with a safety radius
  const startSafetyRadius = 200; // Keep coral away from starting position
  const distanceFromStart = Math.sqrt(newPos.x * newPos.x + newPos.z * newPos.z);
  if (distanceFromStart < startSafetyRadius) {
    return true;
  }

  // Check distance from existing coral
  for (let obstacle of coralObstacles) {
    const dx = newPos.x - obstacle.position.x;
    const dz = newPos.z - obstacle.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    if (distance < minDistance) {
      return true;
    }
  }
  return false;
}

// Create a single massive coral structure reaching from seabed to surface
function createMassiveCoralStructure(coralColors, fullHeight) {
  const structureGroup = new THREE.Group();

  // Create multiple intersecting plane systems within this structure
  const planeSystemCount = Math.floor(Math.random() * 4) + 6; // 6-10 plane systems per structure

  for (let i = 0; i < planeSystemCount; i++) {
    const planeSystem = createIntersectingPlaneSystem(coralColors, fullHeight);

    // Position each plane system within the structure bounds
    planeSystem.position.set(
      (Math.random() - 0.5) * 80, // Spread across 80 unit width
      Math.random() * fullHeight * 0.3, // Vary starting height slightly
      (Math.random() - 0.5) * 80 // Spread across 80 unit depth
    );

    // Random rotation for variety
    planeSystem.rotation.y = Math.random() * Math.PI * 2;

    structureGroup.add(planeSystem);
  }

  return structureGroup;
}

// Create a system of intersecting planes that form complex coral-like structures
function createIntersectingPlaneSystem(coralColors, fullHeight) {
  const systemGroup = new THREE.Group();

  // Choose primary color for this system (with variations)
  const primaryColor = coralColors[Math.floor(Math.random() * coralColors.length)];

  // Create 3-6 intersecting planes per system
  const planeCount = Math.floor(Math.random() * 4) + 3;

  for (let i = 0; i < planeCount; i++) {
    const plane = createComplexCoralPlane(primaryColor, fullHeight);

    // Position planes to intersect in interesting ways
    const angle = (i / planeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const distance = Math.random() * 15; // How far from center

    plane.position.set(
      Math.cos(angle) * distance,
      Math.random() * fullHeight * 0.2, // Slight height variation
      Math.sin(angle) * distance
    );

    // Rotate planes to create intersections
    plane.rotation.set(
      (Math.random() - 0.5) * Math.PI * 0.3, // Slight pitch variation
      angle + (Math.random() - 0.5) * 0.8, // Primary rotation with variation
      (Math.random() - 0.5) * Math.PI * 0.3 // Slight roll variation
    );

    systemGroup.add(plane);
  }

  return systemGroup;
}

// Create individual complex coral planes
function createComplexCoralPlane(baseColor, fullHeight) {
  // Create large plane geometry that reaches most of the height
  const planeHeight = fullHeight * (0.7 + Math.random() * 0.3); // 70-100% of full height
  const planeWidth = Math.random() * 40 + 30; // Width between 30-70 units

  // Create plane with moderate subdivision for complex shapes
  const geometry = new THREE.PlaneBufferGeometry(planeWidth, planeHeight, 8, 16);

  // Create complex organic deformation
  const positions = geometry.attributes.position.array;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];

    // Create wave-like deformations
    const wave1 = Math.sin(x * 0.2) * Math.cos(y * 0.15) * 8;
    const wave2 = Math.sin(x * 0.1 + y * 0.1) * 6;
    const wave3 = Math.sin(x * 0.05) * Math.sin(y * 0.08) * 4;

    // Add noise for organic feel
    const noise = (Math.random() - 0.5) * 3;

    // Apply deformation to Z coordinate (depth)
    positions[i + 2] = wave1 + wave2 + wave3 + noise;

    // Create some holes and gaps by moving vertices
    if (Math.random() > 0.85) {
      // Create gaps by pulling vertices inward
      positions[i + 2] *= 0.3;
    }

    // Create branching effects at edges
    const edgeDistance = Math.min(Math.abs(x - planeWidth / 2), Math.abs(x + planeWidth / 2), Math.abs(y - planeHeight / 2), Math.abs(y + planeHeight / 2));

    if (edgeDistance < 8 && Math.random() > 0.7) {
      // Create branching at edges
      positions[i + 2] += (Math.random() - 0.5) * 15;
    }
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.computeVertexNormals();

  // Create color variation based on height
  const heightFactor = Math.random();
  const colorVariation = new THREE.Color(baseColor);
  colorVariation.lerp(new THREE.Color(0xffffff), heightFactor * 0.3); // Lighter at top

  // Create material with natural appearance
  const material = new THREE.MeshStandardMaterial({
    color: colorVariation,
    roughness: 0.8, // More rough for natural coral texture
    metalness: 0.05, // Very low metalness for organic look
    emissive: colorVariation,
    emissiveIntensity: 0.1, // Reduced glow for more natural look
    side: THREE.DoubleSide,
    transparent: false,
  });

  const plane = new THREE.Mesh(geometry, material);

  // Add some random scaling for variety
  const scaleVariation = 0.8 + Math.random() * 0.6; // Scale between 0.8 and 1.4
  plane.scale.set(scaleVariation, scaleVariation, 1.0);

  return plane;
}

// Enhanced collision detection for larger obstacles
function checkCoralCollisions() {
  const submarinePos = window.gameState.position;
  const submarineRadius = 12; // Slightly larger submarine collision radius

  for (let obstacle of coralObstacles) {
    const dx = submarinePos.x - obstacle.position.x;
    const dy = submarinePos.y - obstacle.position.y;
    const dz = submarinePos.z - obstacle.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance < submarineRadius + obstacle.radius) {
      // Collision detected!
      handleCoralCollision(obstacle);
      return true;
    }
  }
  return false;
}

// Handle collision with massive coral structures
function handleCoralCollision(obstacle) {
  appendInstrumentConsoleMessage("Collision with massive coral structure!");

  // Drop the target if it was grabbed!
  if (window.gameState.navigation.targetGrabbed) {
    window.gameState.navigation.targetGrabbed = false;
    window.gameState.navigation.targetFallVelocity = -20; // Start falling
    appendInstrumentConsoleMessage("💎 You dropped the target! It's falling!");
  }

  // Stop the submarine (similar to boundary collision)
  window.gameState.velocity.x = 0;
  window.gameState.velocity.y = 0;
  window.gameState.velocity.z = 0;
  window.gameState.angularVelocity.x = 0;
  window.gameState.angularVelocity.y = 0;
  window.gameState.angularVelocity.z = 0;
  window.gameState.rotation.z = 0; // Level roll after collision

  // Reset control surfaces to prevent unexpected behavior after collision
  window.gameState.controls.PitchElevatorAngle = 0;
  window.gameState.controls.YawRudderAngle = 0;

  // Larger penalty for hitting these massive structures
  window.gameState.status.oxygenLevel = Math.max(0, window.gameState.status.oxygenLevel - 3);
  window.gameState.status.batteryLevel = Math.max(0, window.gameState.status.batteryLevel - 8);

  // Push submarine back further from these larger obstacles
  const dx = window.gameState.position.x - obstacle.position.x;
  const dy = window.gameState.position.y - obstacle.position.y;
  const dz = window.gameState.position.z - obstacle.position.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  if (distance > 0) {
    // Much larger push distance to ensure submarine gets completely clear
    const pushDistance = obstacle.radius + 30; // Push beyond collision radius + extra buffer
    window.gameState.position.x = obstacle.position.x + (dx / distance) * pushDistance;
    window.gameState.position.y = obstacle.position.y + (dy / distance) * pushDistance;
    window.gameState.position.z = obstacle.position.z + (dz / distance) * pushDistance;
  }
}

// Add this function to create a simple extended seabed
function createSimpleExtendedSeabed() {
  // Get the current world size
  const currentWorldSize = window.gameState.constants.worldBoundary * 2;

  // Define how much larger the extension should be (e.g., 3x the current world size)
  const extensionSize = currentWorldSize * 3;

  // Create a simple flat plane geometry for the extension
  const extendedSeabedGeometry = new THREE.PlaneBufferGeometry(
    window.gameState.constants.worldBoundary * 1, // Width
    window.gameState.constants.worldBoundary * 1, // Height
    1, // Width segments (minimal)
    1 // Height segments (minimal)
  );

  // Create a simple material with a solid color
  // Using a slightly darker color than the main seabed for subtle differentiation
  const extendedSeabedMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff, // Slightly darker than main seabed
    side: THREE.FrontSide,
  });

  // Create the mesh
  const extendedSeabed = new THREE.Mesh(extendedSeabedGeometry, extendedSeabedMaterial);

  // Position it at the same depth as the main seabed, but ensure it's slightly lower
  // to prevent z-fighting with the main seabed
  extendedSeabed.position.y = window.gameState.constants.seabedDepth - 0.1;

  // Rotate to horizontal
  extendedSeabed.rotation.x = -Math.PI / 2;

  // Add to scene before the main seabed so the main seabed renders on top
  scene.add(extendedSeabed);

  console.log("Simple extended seabed created");

  return extendedSeabed;
}

// function createBoundaryWalls() {
//   // console.log("Creating boundary walls with rock textures...");

//   const WALL_HEIGHT = 150; // Height of the walls
//   const wallsGroup = new THREE.Group();

//   const textureLoader = new THREE.TextureLoader();

//   // Create rock material
//   const rockMaterial = new THREE.MeshStandardMaterial({
//     color: 0x777777,
//     roughness: 0.9,
//     metalness: 0.1,
//     side: THREE.DoubleSide,
//   });

//   // Try to load rock texture
//   textureLoader.load(
//     "artwork/rock_texture.jpg",
//     function (texture) {
//       texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
//       texture.repeat.set(5, 3); // Repeat to avoid stretching
//       rockMaterial.map = texture;
//       rockMaterial.needsUpdate = true;
//       // console.log("Rock texture loaded successfully");
//     },
//     undefined,
//     function (err) {
//       // console.log("Using fallback rock color (texture failed to load)");
//     }
//   );

//   // Try to load rock normal map for added detail
//   textureLoader.load(
//     "artwork/rock_normal.jpg",
//     function (normalMap) {
//       normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
//       normalMap.repeat.set(5, 3);
//       rockMaterial.normalMap = normalMap;
//       rockMaterial.normalScale.set(1, 1);
//       rockMaterial.needsUpdate = true;
//       // console.log("Rock normal map loaded successfully");
//     },
//     undefined,
//     function (err) {
//       // console.log("Rock normal map failed to load");
//     }
//   );

//   // Create four walls (North, South, East, West)

//   //// North wall - at negative Z boundary (north is -Z in Three.js)
//   const northWall = new THREE.Mesh(new THREE.PlaneBufferGeometry(window.gameState.constants.worldBoundaryVisible, WALL_HEIGHT, 16, 8), rockMaterial);
//   northWall.position.set(0, window.gameState.constants.seabedDepth + WALL_HEIGHT / 2, -window.gameState.constants.worldBoundaryVisible / 2);
//   northWall.rotation.y = 0; // No rotation needed, default orientation faces -Z
//   wallsGroup.add(northWall);

//   // South wall - at positive Z boundary
//   const southWall = new THREE.Mesh(new THREE.PlaneBufferGeometry(window.gameState.constants.worldBoundaryVisible, WALL_HEIGHT, 16, 8), rockMaterial);
//   southWall.position.set(0, window.gameState.constants.seabedDepth + WALL_HEIGHT / 2, window.gameState.constants.worldBoundaryVisible / 2);
//   southWall.rotation.y = Math.PI; // Rotate to face the -Z direction (inward)
//   wallsGroup.add(southWall);

//   // East wall - at positive X boundary
//   const eastWall = new THREE.Mesh(new THREE.PlaneBufferGeometry(window.gameState.constants.worldBoundaryVisible, WALL_HEIGHT, 16, 8), rockMaterial);
//   eastWall.position.set(window.gameState.constants.worldBoundaryVisible / 2, window.gameState.constants.seabedDepth + WALL_HEIGHT / 2, 0);
//   eastWall.rotation.y = -Math.PI / 2; // Rotate to face the -X direction (inward)
//   wallsGroup.add(eastWall);

//   // West wall - at negative X boundary
//   const westWall = new THREE.Mesh(new THREE.PlaneBufferGeometry(window.gameState.constants.worldBoundaryVisible, WALL_HEIGHT, 16, 8), rockMaterial);
//   westWall.position.set(-window.gameState.constants.worldBoundaryVisible / 2, window.gameState.constants.seabedDepth + WALL_HEIGHT / 2, 0);
//   westWall.rotation.y = Math.PI / 2; // Rotate to face the +X direction (inward)
//   wallsGroup.add(westWall);

//   // Add some variation to the walls
//   for (let wall of [northWall, southWall, eastWall, westWall]) {
//     // Add some displacement to make the walls look more natural
//     if (wall.geometry.attributes && wall.geometry.attributes.position) {
//       const positions = wall.geometry.attributes.position.array;
//       const simplex = new SimplexNoise(); // Using the same noise generator as seabed

//       for (let i = 0; i < positions.length; i += 3) {
//         const x = positions[i];
//         const y = positions[i + 1];

//         // Apply noise to z coordinate to create rocky surface
//         // But reduce displacement near the bottom to ensure better connection with seabed
//         const noise = simplex.noise2D(x * 0.05, y * 0.05) * 3;

//         // Check if this vertex is near the bottom of the wall
//         // WALL_HEIGHT/2 = 75, so bottom vertices are at y ≈ -75
//         if (y < -WALL_HEIGHT / 2 + 10) {
//           // For vertices near the bottom, reduce displacement for better seabed connection
//           const factor = (y + WALL_HEIGHT / 2) / 10; // 0 at bottom, 1 at 10 units up
//           positions[i + 2] = noise * factor;
//         } else {
//           positions[i + 2] = noise;
//         }
//       }

//       wall.geometry.attributes.position.needsUpdate = true;
//       wall.geometry.computeVertexNormals();
//     }
//   }

//   // Add walls to scene
//   scene.add(wallsGroup);

//   // console.log("Boundary walls created");

//   // Return for potential later reference
//   return wallsGroup;
// }

// Create target destination marker - glowing faceted diamond
function createTarget() {
  // Create a faceted diamond using octahedron geometry (simple 8-sided diamond)
  const targetGeometry = new THREE.OctahedronBufferGeometry(TARGET_SIZE, 0);

  // Create a glowing material for the diamond
  const targetMaterial = new THREE.MeshStandardMaterial({
    color: TARGET_COLOR,
    emissive: TARGET_COLOR,
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.9,
    metalness: 0.3,
    roughness: 0.2,
    flatShading: true, // Keeps the faceted look
  });

  targetSphere = new THREE.Mesh(targetGeometry, targetMaterial);
  scene.add(targetSphere);

  // Add a stronger pulsing glow effect
  const pulseLight = new THREE.PointLight(TARGET_COLOR, 3, 40);
  targetSphere.add(pulseLight);

  // Add indicator beam from surface
  const beamGeometry = new THREE.CylinderBufferGeometry(0.5, 0.5, 50, 8, 1, true);
  const beamMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffaa,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
  });

  const beam = new THREE.Mesh(beamGeometry, beamMaterial);
  beam.position.y = 100; // Position above target
  targetSphere.add(beam);
}

function createStartMarker() {
  // Start marker disabled - the escape hole in the ceiling marks the start/exit
  // Keeping function for compatibility but not rendering anything

  // Create invisible placeholder
  startSphere = new THREE.Object3D();
  startSphere.position.set(gameState_original.position.x, gameState_original.position.y, gameState_original.position.z);
  scene.add(startSphere);
}

// Create a textured cave ceiling at the water surface with a hole
function createWaterSurfaceBoundary() {
  // Cave ceiling colors matching the coral palette
  const caveColors = [
    0xd4a574, // Sandy beige
    0xc9956b, // Warm sand
    0xe8d5b7, // Light sand
    0xb8945a, // Golden sand
    0xa67c52, // Dark sand
    0xf2e8c9, // Pale sand
  ];

  const caveCeilingGroup = new THREE.Group();

  // Get start position for creating the escape hole
  const startX = gameState_original.position.x;
  const startZ = gameState_original.position.z;
  const holeRadius = 75;

  // console.log(`Creating escape hole at start position: X=${startX}, Z=${startZ}, radius=${holeRadius}`);

  // Create a ring-shaped ceiling (donut) instead of a full plane
  const outerRadius = window.gameState.constants.worldBoundaryVisible / 2;
  const innerRadius = holeRadius;

  // Create the ring geometry for the main ceiling
  const ceilingGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64, 20);

  // Deform the geometry to create cave texture
  const positions = ceilingGeometry.attributes.position.array;
  const simplex = new SimplexNoise();

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];

    // Create multiple layers of noise for complex cave texture
    const largeNoise = simplex.noise2D(x * 0.005, y * 0.005) * 15;
    const mediumNoise = simplex.noise2D(x * 0.02, y * 0.02) * 6;
    const smallNoise = simplex.noise2D(x * 0.08, y * 0.08) * 2;

    // Create stalactite-like formations randomly
    const stalactiteNoise = Math.random() > 0.95 ? Math.random() * -8 : 0;

    // Apply deformation downward (negative Z for a ceiling)
    positions[i + 2] = -(largeNoise + mediumNoise + smallNoise + stalactiteNoise);
  }

  ceilingGeometry.attributes.position.needsUpdate = true;
  ceilingGeometry.computeVertexNormals();

  // Choose a base cave color
  const baseColor = caveColors[Math.floor(Math.random() * caveColors.length)];

  // Create material matching coral style
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.9,
    metalness: 0.05,
    side: THREE.DoubleSide,
    emissive: baseColor,
    emissiveIntensity: 0.15,
  });

  const ceilingPlane = new THREE.Mesh(ceilingGeometry, ceilingMaterial);

  // Rotate to horizontal and position slightly above water surface to prevent viewing above it
  // The ring is centered at 0,0 so we need to offset it to center on startX, startZ
  const ceilingHeight = window.gameState.constants.waterSurface + 10; // 10 units above surface
  ceilingPlane.rotation.x = -Math.PI / 2;
  ceilingPlane.position.set(startX, ceilingHeight, startZ);

  caveCeilingGroup.add(ceilingPlane);

  // Add additional rocky formations around the hole (but not IN the hole)
  for (let i = 0; i < 15; i++) {
    const formation = createCaveCeilingFormation(caveColors);
    const angle = Math.random() * Math.PI * 2;
    const distance = holeRadius * 1.5 + Math.random() * (outerRadius - holeRadius * 1.5);
    const x = startX + Math.cos(angle) * distance;
    const z = startZ + Math.sin(angle) * distance;
    formation.position.set(x, ceilingHeight, z);
    caveCeilingGroup.add(formation);
  }

  scene.add(caveCeilingGroup);

  // console.log(`Created cave ceiling with escape hole at Y=${window.gameState.constants.waterSurface}`);
  // console.log(`Start position: X=${startX}, Y=${gameState_original.position.y}, Z=${startZ}`);
}

// Create additional cave ceiling formations (like stalactites)
function createCaveCeilingFormation(caveColors) {
  const formationGroup = new THREE.Group();

  // Create 2-4 overlapping planes for complex shapes
  const planeCount = Math.floor(Math.random() * 3) + 2;

  for (let i = 0; i < planeCount; i++) {
    const width = Math.random() * 30 + 20;
    const height = Math.random() * 30 + 20;

    const geometry = new THREE.PlaneGeometry(width, height, 12, 12);

    // Deform the geometry
    const positions = geometry.attributes.position.array;
    for (let j = 0; j < positions.length; j += 3) {
      const x = positions[j];
      const y = positions[j + 1];

      // Create irregular rocky shapes
      const noise1 = Math.sin(x * 0.3) * Math.cos(y * 0.3) * 5;
      const noise2 = Math.sin(x * 0.1) * Math.sin(y * 0.1) * 3;

      positions[j + 2] = -(noise1 + noise2 + Math.random() * 2);
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    const color = caveColors[Math.floor(Math.random() * caveColors.length)];
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.9,
      metalness: 0.05,
      side: THREE.DoubleSide,
      emissive: color,
      emissiveIntensity: 0.1,
    });

    const plane = new THREE.Mesh(geometry, material);

    // Position and rotate for variety
    const angle = (i / planeCount) * Math.PI * 2;
    plane.position.set(Math.cos(angle) * 5, Math.random() * -3, Math.sin(angle) * 5);
    plane.rotation.set(Math.PI / 2 + (Math.random() - 0.5) * 0.5, angle, (Math.random() - 0.5) * 0.5);

    formationGroup.add(plane);
  }

  return formationGroup;
}

// Create underwater effects (caustics, particles, water surface) with improved water texture

function createWaterEffects() {
  // Create water surface with improved texture and ripple effect
  const waterGeometry = new THREE.PlaneBufferGeometry(window.gameState.constants.worldBoundaryVisible, window.gameState.constants.worldBoundaryVisible, 32, 32);

  // Create better material for water with updated properties for lighter appearance from below
  // Make it much more visible with brighter color and higher opacity
  const waterMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x00d4ff, // Bright cyan/turquoise - very visible
    transparent: true,
    opacity: 0.85, // Much more opaque to be clearly visible
    roughness: 0.1,
    metalness: 0.0,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide,
    envMapIntensity: 2.0,
    transmission: 0.3, // Reduced transmission for more solid appearance
    reflectivity: 0.5, // Increased reflectivity
    emissive: 0x0088aa, // Add slight glow to make it stand out
    emissiveIntensity: 0.3,
  });

  // Load water texture and normal map
  const textureLoader = new THREE.TextureLoader();

  // Try to load water texture
  textureLoader.load(
    "artwork/water_texture.jpg",
    function (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(10, 10);
      waterMaterial.map = texture;
      waterMaterial.needsUpdate = true;
    },
    undefined,
    function (err) {
      console.log("Using fallback water color (texture failed to load)");
    }
  );

  // Try to load normal map for water ripples
  textureLoader.load(
    "artwork/water_normal.jpg",
    function (normalMap) {
      normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
      normalMap.repeat.set(15, 15);
      waterMaterial.normalMap = normalMap;
      waterMaterial.normalScale.set(0.2, 0.2);
      waterMaterial.needsUpdate = true;
    },
    undefined,
    function (err) {
      console.log("Water normal map failed to load");
    }
  );

  // Create water mesh
  water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.rotation.x = Math.PI / 2;
  water.position.y = window.gameState.constants.waterSurface;
  scene.add(water);

  // Add underwater particles for better depth perception
  addUnderwaterParticles();

  // NEW: Add caustics effect to the seabed
  //addCausticsEffect();
}

// NEW: Function to add water caustics effect to the scene
function addCausticsEffect() {
  // Create caustics texture plane for the seabed
  const causticsGeometry = new THREE.PlaneBufferGeometry(
    window.gameState.constants.worldBoundaryVisible,
    window.gameState.constants.worldBoundaryVisible,
    1,
    1
  );

  // Create caustics material
  const causticsMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
    depthWrite: false,
  });

  // Try to load caustics texture
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    "artwork/sand_texture.jpg", // You'll need to add this image to your assets
    function (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(10, 10);
      causticsMaterial.map = texture;
      causticsMaterial.needsUpdate = true;
      // console.log("Caustics texture loaded successfully");
    },
    undefined,
    function (err) {
      console.log("Using fallback caustics (texture failed to load)");
      // Create a dynamic caustics texture if image fails to load
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");

      // Create a simple caustics-like pattern
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 20 + 5;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      const dynamicTexture = new THREE.CanvasTexture(canvas);
      dynamicTexture.wrapS = dynamicTexture.wrapT = THREE.RepeatWrapping;
      dynamicTexture.repeat.set(5, 5);

      causticsMaterial.map = dynamicTexture;
      causticsMaterial.needsUpdate = true;
    }
  );

  // Create the caustics plane
  const causticsPlane = new THREE.Mesh(causticsGeometry, causticsMaterial);
  causticsPlane.rotation.x = -Math.PI / 2; // Align with seabed
  causticsPlane.position.y = window.gameState.constants.seabedDepth + 0.1; // Slightly above seabed
  scene.add(causticsPlane);

  // Animate the caustics
  function animateCaustics() {
    if (causticsMaterial.map) {
      const time = clock.getElapsedTime();

      // Move the texture for a swimming pool light effect
      causticsMaterial.map.offset.x = time * 0.05;
      causticsMaterial.map.offset.y = time * 0.03;

      // Vary the opacity slightly
      causticsMaterial.opacity = 0.2 + Math.sin(time * 1.5) * 0.1;
    }

    requestAnimationFrame(animateCaustics);
  }

  // Start caustics animation
  animateCaustics();
}

// Add floating particles to enhance underwater effect
function addUnderwaterParticles() {
  // Create a group for particles
  const particlesGroup = new THREE.Group();
  scene.add(particlesGroup);

  // Particle count - more for more dense water effect
  const particleCount = 500;

  // Create particles with simple points
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);

  // Different particle sizes
  const particleSizes = new Float32Array(particleCount);

  // Distribute particles randomly in a cylinder around the viewer
  const radius = 120;
  const height = 120;

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;

    // Create particles in a cylindrical pattern around viewer path
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * radius;

    particlePositions[i3] = Math.cos(angle) * r; // x
    particlePositions[i3 + 1] = Math.sin(angle) * r; // y
    particlePositions[i3 + 2] = Math.random() * height - height / 2; // z

    // Variable particle sizes
    particleSizes[i] = Math.random() * 0.5 + 0.1;
  }

  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute("size", new THREE.BufferAttribute(particleSizes, 1));

  // Improved material for particles - simulate suspended matter in water
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xccffff, // Bright cyan particles
    size: 0.3,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending, // Additive blending for light scatter effect
  });

  // Create points mesh
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  particlesGroup.add(particles);

  // Create a second particle system for larger "dust" particles
  const dustParticleCount = 100;
  const dustGeometry = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(dustParticleCount * 3);
  const dustSizes = new Float32Array(dustParticleCount);

  for (let i = 0; i < dustParticleCount; i++) {
    const i3 = i * 3;

    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * radius;

    dustPositions[i3] = Math.cos(angle) * r;
    dustPositions[i3 + 1] = Math.sin(angle) * r;
    dustPositions[i3 + 2] = Math.random() * height - height / 2;

    dustSizes[i] = Math.random() * 1.5 + 0.5;
  }

  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  dustGeometry.setAttribute("size", new THREE.BufferAttribute(dustSizes, 1));

  const dustMaterial = new THREE.PointsMaterial({
    color: 0xffffaa,
    size: 0.8,
    transparent: true,
    opacity: 0.3,
    sizeAttenuation: true,
  });

  const dustParticles = new THREE.Points(dustGeometry, dustMaterial);
  particlesGroup.add(dustParticles);

  // Animate particles in render loop
  function animateParticles() {
    // Make particles slowly drift
    particlesGroup.position.x = window.gameState.position.x;
    particlesGroup.position.y = window.gameState.position.y;
    particlesGroup.position.z = window.gameState.position.z;

    const positions = particleGeometry.attributes.position.array;
    const dustPos = dustGeometry.attributes.position.array;
    const time = clock.getElapsedTime() * 0.1;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Small sinusoidal movement to simulate water currents
      positions[i3] += Math.sin(time + i * 0.1) * 0.01;
      positions[i3 + 1] += Math.cos(time + i * 0.1) * 0.01;
      positions[i3 + 2] += Math.sin(time * 0.5 + i * 0.05) * 0.01;

      // Wrap particles if they drift too far
      const distX = positions[i3];
      const distY = positions[i3 + 1];
      const distZ = positions[i3 + 2];

      if (Math.sqrt(distX * distX + distY * distY + distZ * distZ) > radius) {
        // Reset particle position
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * radius * 0.8;

        positions[i3] = Math.cos(angle) * r;
        positions[i3 + 1] = Math.sin(angle) * r;
        positions[i3 + 2] = Math.random() * height - height / 2;
      }
    }

    // Animate dust particles (slower movement)
    for (let i = 0; i < dustParticleCount; i++) {
      const i3 = i * 3;

      dustPos[i3] += Math.sin(time * 0.5 + i * 0.05) * 0.005;
      dustPos[i3 + 1] += Math.cos(time * 0.5 + i * 0.05) * 0.005;
      dustPos[i3 + 2] += Math.sin(time * 0.3 + i * 0.05) * 0.005;

      // Wrap dust particles
      const distX = dustPos[i3];
      const distY = dustPos[i3 + 1];
      const distZ = dustPos[i3 + 2];

      if (Math.sqrt(distX * distX + distY * distY + distZ * distZ) > radius) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * radius * 0.8;

        dustPos[i3] = Math.cos(angle) * r;
        dustPos[i3 + 1] = Math.sin(angle) * r;
        dustPos[i3 + 2] = Math.random() * height - height / 2;
      }
    }

    particleGeometry.attributes.position.needsUpdate = true;
    dustGeometry.attributes.position.needsUpdate = true;

    // Continue animation in next frame
    requestAnimationFrame(animateParticles);
  }

  // Start particle animation
  animateParticles();
}

// Update camera position for first-person view
function updateCameraPosition() {
  // Defensive check - ensure gameState is initialized
  if (!gameState || !window.gameState.position || !window.gameState.rotation) {
    console.warn("updateCameraPosition: gameState not fully initialized yet");
    return;
  }

  // Position camera at submarine position
  camera.position.copy(window.gameState.position);

  // Create quaternion from Euler angles
  const quaternion = new THREE.Quaternion();
  quaternion.setFromEuler(
    new THREE.Euler(
      THREE.MathUtils.degToRad(window.gameState.rotation.x),
      THREE.MathUtils.degToRad(window.gameState.rotation.y),
      THREE.MathUtils.degToRad(window.gameState.rotation.z),
      "XYZ"
    )
  );

  // Set camera quaternion
  camera.quaternion.copy(quaternion);

  // Update fog based on depth
  updateFogWithDepth();
}

// Adjust fog based on water depth
function updateFogWithDepth() {
  // Defensive check - ensure gameState is initialized
  if (!gameState || !window.gameState.position || !window.gameState.constants) {
    return;
  }

  // Skip fog updates if fog doesn't exist (easy mode)
  if (!underwaterFog) {
    return;
  }

  // Get current depth (in Three.js, depth is negative Y from water surface)
  const depth = Math.max(0, -window.gameState.position.y + window.gameState.constants.waterSurface);

  // Make water get darker and visibility decrease with depth
  const maxDepth = window.gameState.constants.waterSurface - window.gameState.constants.seabedDepth;
  const depthFactor = Math.min(1, depth / maxDepth);

  // Blend from surface color to deep color using the corrected depthFactor
  const r1 = (WATER_COLOR >> 16) & 255;
  const g1 = (WATER_COLOR >> 8) & 255;
  const b1 = WATER_COLOR & 255;

  const r2 = (DEEP_WATER_COLOR >> 16) & 255;
  const g2 = (DEEP_WATER_COLOR >> 8) & 255;
  const b2 = DEEP_WATER_COLOR & 255;

  const r = Math.floor(r1 * (1 - depthFactor) + r2 * depthFactor);
  const g = Math.floor(g1 * (1 - depthFactor) + g2 * depthFactor);
  const b = Math.floor(b1 * (1 - depthFactor) + b2 * depthFactor);

  const blendedColor = (r << 16) | (g << 8) | b;

  // Update fog and scene color
  underwaterFog.color.setHex(blendedColor);
  scene.background.setHex(blendedColor);

  // REDUCED FOG DENSITY - double the visible range
  // Original values: FOG_NEAR + depthFactor * 5, FOG_FAR - depthFactor * 50
  // Reduce fog by extending the far plane and reducing the near plane effects
  underwaterFog.near = FOG_NEAR; // Keep constant near plane for less fog up close
  underwaterFog.far = FOG_FAR - depthFactor * 25; // Only reduce far plane by half as much

  // At max depth, original fog was from 15 to 50 units
  // New fog at max depth will be from 10 to 75 units (much better visibility)
}

// Handle window resize
function onWindowResize() {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

// Update scene elements based on game state
function updateScene() {
  // Defensive check - ensure gameState is initialized
  if (!gameState || !window.gameState.navigation || !window.gameState.constants || !window.gameState.time) {
    console.warn("updateScene: gameState not fully initialized yet");
    return;
  }

  // Update target position - if grabbed, follow camera, otherwise stay at fixed position
  if (window.gameState.navigation.targetGrabbed) {
    // Position target in front of camera when grabbed
    const grabDistance = 8; // Distance in front of camera
    const targetPos = new THREE.Vector3(0, 0, -grabDistance);
    targetPos.applyQuaternion(camera.quaternion);
    targetPos.add(camera.position);

    targetSphere.position.copy(targetPos);
    // Also update the gameState position so distance calculations work
    window.gameState.navigation.targetPosition.x = targetPos.x;
    window.gameState.navigation.targetPosition.y = targetPos.y;
    window.gameState.navigation.targetPosition.z = targetPos.z;
  } else {
    // Apply falling physics if target is falling
    if (window.gameState.navigation.targetFallVelocity < 0) {
      window.gameState.navigation.targetPosition.y += window.gameState.navigation.targetFallVelocity * window.gameState.time.deltaTime;
      // Stop at seabed
      if (window.gameState.navigation.targetPosition.y <= window.gameState.constants.seabedDepth + 10) {
        window.gameState.navigation.targetPosition.y = window.gameState.constants.seabedDepth + 10;
        window.gameState.navigation.targetFallVelocity = 0;
      }
    }
    // Normal fixed position
    targetSphere.position.set(
      window.gameState.navigation.targetPosition.x,
      window.gameState.navigation.targetPosition.y,
      window.gameState.navigation.targetPosition.z
    );
  }

  // Make target pulse for visibility and rotate to show facets
  const time = clock.getElapsedTime();
  const pulseFactor = Math.sin(time * 2) * 0.1 + 0.9;
  targetSphere.scale.set(pulseFactor, pulseFactor, pulseFactor);

  // Gentle rotation to catch light on the faceted diamond
  targetSphere.rotation.y = time * 0.5;
  targetSphere.rotation.x = Math.sin(time * 0.3) * 0.3;

  // Create light shaft effect from surface
  if (targetSphere.children.length > 1) {
    const beam = targetSphere.children[1];
    beam.rotation.y = time * 0.1;
    beam.material.opacity = 0.1 + Math.sin(time) * 0.05;
  }

  // Create gentle water surface movement with enhanced effect
  if (water) {
    // Animate water around the water surface constant with more pronounced movement
    water.position.y = window.gameState.constants.waterSurface + Math.sin(time * 0.2) * 0.8;

    // Animate water texture if normal map is loaded with more dramatic rippling
    if (water.material && water.material.normalMap) {
      // Animate normal map by shifting the UV coordinates with varying speeds
      water.material.normalMap.offset.x = Math.sin(time * 0.1) * 0.1 + time * 0.02;
      water.material.normalMap.offset.y = Math.cos(time * 0.15) * 0.1 + time * 0.01;
    }

    // NEW: Add subtle color variations to the water for more dynamic appearance
    if (water.material) {
      // Subtle color shift based on time
      const hueShift = Math.sin(time * 0.1) * 0.05; // Small hue variation
      const saturationBoost = Math.sin(time * 0.2) * 0.1 + 0.1; // Small saturation boost
      water.material.emissive.setHSL(0.55 + hueShift, 0.7 + saturationBoost, 0.5);
      water.material.emissiveIntensity = 0.2 + Math.sin(time * 0.3) * 0.1;
    }
  }

  // NEW: Simulate light rays through water (if sunrays object exists)
  scene.children.forEach((child) => {
    if (child.type === "SpotLight" && child !== targetSphere) {
      // Gently move the light position for dynamic light effect
      child.position.x += Math.sin(time * 0.2) * 0.2;
      child.position.z += Math.cos(time * 0.3) * 0.2;

      // Vary intensity slightly
      if (Math.random() > 0.95) {
        // Occasional intensity flicker
        child.intensity = child.intensity * (0.95 + Math.random() * 0.1);
      }
    }
  });

  // Update camera position for first person view
  updateCameraPosition();
}

// Render the 3D scene
function renderUnderwaterScene() {
  // Defensive check - ensure rendering objects are initialized
  if (!renderer || !scene || !camera) {
    console.error("renderUnderwaterScene: renderer, scene, or camera not initialized!");
    return;
  }

  // // Debug: Log occasionally to verify rendering is happening
  // if (Math.random() < 0.01) {
  //   console.log("Rendering frame - camera pos:", camera.position, "scene children:", scene.children.length);
  // }

  // Update scene elements
  updateScene();

  // Render scene with camera
  renderer.render(scene, camera);
}

// Initialize the renderer and scene
function initRenderer() {
  // Set canvas to correct dimensions
  const canvas = document.getElementById("outside-scene");
  const container = canvas.parentElement;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;

  // Initialize 3D scene with default difficulty for preview
  if (!window.gameDifficulty) {
    window.gameDifficulty = "preview"; // Special mode for initial preview
  }
  initScene();

  // Perform initial render
  renderUnderwaterScene();
}

// Function to reinitialize scene with correct difficulty
function reinitSceneForDifficulty() {
  const difficulty = window.gameDifficulty || "hard";

  // Remove fog if in easy mode
  if (difficulty === "easy") {
    scene.fog = null;
    underwaterFog = null;

    // Traverse all coral structures and set opacity to 25%
    for (let obstacle of coralObstacles) {
      const coralStructure = obstacle.mesh;
      coralStructure.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.transparent = true;
          child.material.opacity = 0.25;
        }
      });
    }
  }
}
