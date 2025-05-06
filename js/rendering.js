// 3D Underwater Scene Rendering using Three.js - Caribbean Edition

// Scene variables
let scene, camera, renderer;
let targetSphere;
let seabed;
let water;
let directionalLight, ambientLight;
let clock;
let underwaterFog;

// Environment settings
const WORLD_SIZE = 2000; // World dimensions
const SEABED_DEPTH = -100; // Depth of the seabed
const WATER_COLOR = 0x0096ff; // Bright Caribbean blue
const DEEP_WATER_COLOR = 0x0073cf; // Deeper Caribbean blue for gradient
const TARGET_COLOR = 0xff5500; // Bright orange target (more visible in blue water)
const TARGET_SIZE = 5; // Target sphere size
const FOG_COLOR = 0x0096ff; // Match water color
const FOG_NEAR = 1000; //10; // Start fog effect at 10 units
const FOG_FAR = 10000; // 100; Max visibility distance

// Check Three.js version and provide compatibility
const isNewThreeVersion = THREE.REVISION >= 125; // r125+ uses only BufferGeometry

// Initialize the 3D scene
function initScene() {
  // Create clock for animations
  clock = new THREE.Clock();

  // Create scene with Caribbean blue color
  scene = new THREE.Scene();
  scene.background = new THREE.Color(WATER_COLOR);

  // Add underwater fog effect for light scattering/distance obscuring
  underwaterFog = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR);
  scene.fog = underwaterFog;

  // Create camera - first person view
  const aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);

  // For debugging - log initial orientation
  console.log("Initial camera setup at game start");
  console.log("Game state initial rotation (degrees):", "Pitch: 0, Yaw: 0, Roll: 0");
  console.log("Adding 90 degrees to yaw for camera orientation");
  console.log("Expected camera to look towards (1,0,0) world coordinates");

  // Create renderer and attach to canvas
  const canvas = document.getElementById("outside-scene");
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Enable physically correct lighting
  renderer.physicallyCorrectLights = true;

  // Add post-processing for water caustics
  setupPostProcessing();

  // Add lighting for bright Caribbean day
  setupLighting();

  // Create seabed with coral formations
  createSeabed();

  // Create target sphere
  createTarget();

  // Add water effects - caustics, particles, etc.
  createWaterEffects();

  // Add coral reef elements
  createCoralReef();

  // Add boundary walls with rock textures
  createBoundaryWalls();

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
function setupLighting() {
  // Bright sunlight (directional light)
  directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(100, 100, 100);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Add sunrays with light shafts (volumetric lighting effect)
  const sunRayLight = new THREE.SpotLight(0xffffbb, 2, 100, Math.PI / 6, 0.5);
  sunRayLight.position.set(50, 80, 50);
  scene.add(sunRayLight);

  // Warm ambient light for overall scene illumination
  ambientLight = new THREE.AmbientLight(0x6699cc, 0.8);
  scene.add(ambientLight);

  // Add a bright blue point light to simulate water scattering
  const waterLight = new THREE.PointLight(0x00ffff, 0.6, 150);
  waterLight.position.set(0, 20, 0);
  scene.add(waterLight);

  // Add secondary light sources to simulate light refraction in water
  const refractedLight1 = new THREE.PointLight(0x00ccff, 0.4, 80);
  refractedLight1.position.set(30, 10, -20);
  scene.add(refractedLight1);

  const refractedLight2 = new THREE.PointLight(0x88ccff, 0.3, 60);
  refractedLight2.position.set(-40, 5, 15);
  scene.add(refractedLight2);
}

// 1. Replace the createSeabed function with this version
function createSeabed() {
  // Create a large plane for the seabed
  const seabedGeometry = new THREE.PlaneBufferGeometry(WORLD_SIZE, WORLD_SIZE, 80, 80);

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
  textureLoader.load(
    "artwork/sand_texture.jpg",
    function (texture) {
      // Success callback
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(100, 100);
      seabedMaterial.map = texture;
      seabedMaterial.needsUpdate = true;
    },
    undefined,
    function (err) {
      // Error callback - already using fallback color
      console.log("Using fallback sand color (texture failed to load)");
    }
  );

  // Create seabed mesh and position it
  seabed = new THREE.Mesh(seabedGeometry, seabedMaterial);
  seabed.rotation.x = -Math.PI / 2; // Rotate to horizontal
  seabed.position.y = SEABED_DEPTH + 25; // FIX: Add 25 units to ensure walls and seabed connect visually
  // This 25-unit adjustment creates proper overlap between walls and seabed

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
}

// Create tropical coral reef elements
function createCoralReef() {
  // Create a coral reef group
  const reefGroup = new THREE.Group();
  scene.add(reefGroup);

  // Define colors for Caribbean coral reef
  const coralColors = [
    0xff7f50, // Coral
    0xffd700, // Gold
    0x9370db, // Medium Purple
    0x20b2aa, // Light Sea Green
    0x00ffff, // Cyan
    0xff69b4, // Hot Pink
    0xffb6c1, // Light Pink
    0x7fffd4, // Aquamarine
  ];

  // Create 50-80 coral formations
  const coralCount = 70;

  for (let i = 0; i < coralCount; i++) {
    // Random position within world bounds
    const x = (Math.random() - 0.5) * WORLD_SIZE * 0.8;
    const z = (Math.random() - 0.5) * WORLD_SIZE * 0.8;

    // Create a coral formation (group of shapes)
    const coralFormation = createCoralFormation(coralColors);

    // Position the coral
    coralFormation.position.set(x, SEABED_DEPTH, z);
    reefGroup.add(coralFormation);
  }
}

// Helper to create a single coral formation
function createCoralFormation(coralColors) {
  const coralGroup = new THREE.Group();

  // Number of coral elements in this formation
  const elementCount = Math.floor(Math.random() * 5) + 2;

  for (let i = 0; i < elementCount; i++) {
    // Choose a random coral type and color
    const coralType = Math.floor(Math.random() * 3);
    const coralColor = coralColors[Math.floor(Math.random() * coralColors.length)];

    let coralGeometry;

    // Create different coral shapes
    switch (coralType) {
      case 0: // Branching coral
        coralGeometry = new THREE.CylinderBufferGeometry(0.2, 0.6, Math.random() * 5 + 2, 5, 3, true);
        break;
      case 1: // Brain coral
        coralGeometry = new THREE.SphereBufferGeometry(Math.random() * 2 + 1, 8, 8);
        break;
      case 2: // Fan coral
        coralGeometry = new THREE.PlaneBufferGeometry(Math.random() * 3 + 1, Math.random() * 4 + 2, 4, 4);
        // Deform to create a wavy effect
        if (coralGeometry.attributes.position) {
          const positions = coralGeometry.attributes.position.array;
          for (let j = 0; j < positions.length; j += 3) {
            positions[j + 2] = Math.sin(positions[j] * 2) * 0.3;
          }
          coralGeometry.attributes.position.needsUpdate = true;
        }
        break;
    }

    // Create material with glow and shimmer
    const coralMaterial = new THREE.MeshStandardMaterial({
      color: coralColor,
      roughness: 0.3,
      metalness: 0.2,
      emissive: coralColor,
      emissiveIntensity: 0.1, // Subtle glow
      flatShading: true,
    });

    // Create the coral mesh
    const coral = new THREE.Mesh(coralGeometry, coralMaterial);

    // Position within the formation
    coral.position.set(Math.random() * 2 - 1, Math.random() * 3, Math.random() * 2 - 1);

    // Random rotation
    coral.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI * 2, Math.random() * Math.PI);

    coralGroup.add(coral);
  }

  return coralGroup;
}

function createBoundaryWalls() {
  // console.log("Creating boundary walls with rock textures...");

  const WALL_HEIGHT = 150; // Height of the walls
  const wallsGroup = new THREE.Group();

  const textureLoader = new THREE.TextureLoader();

  // Create rock material
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: 0x777777,
    roughness: 0.9,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  // Try to load rock texture
  textureLoader.load(
    "artwork/rock_texture.jpg",
    function (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(5, 3); // Repeat to avoid stretching
      rockMaterial.map = texture;
      rockMaterial.needsUpdate = true;
      // console.log("Rock texture loaded successfully");
    },
    undefined,
    function (err) {
      // console.log("Using fallback rock color (texture failed to load)");
    }
  );

  // Try to load rock normal map for added detail
  textureLoader.load(
    "artwork/rock_normal.jpg",
    function (normalMap) {
      normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
      normalMap.repeat.set(5, 3);
      rockMaterial.normalMap = normalMap;
      rockMaterial.normalScale.set(1, 1);
      rockMaterial.needsUpdate = true;
      // console.log("Rock normal map loaded successfully");
    },
    undefined,
    function (err) {
      // console.log("Rock normal map failed to load");
    }
  );

  // Create four walls (North, South, East, West)
  // The wall positions are actually correct, as explained in the analysis
  // The wall bottoms are at -100, which matches SEABED_DEPTH
  // We're keeping the original position calculation since it works

  // North wall
  const northWall = new THREE.Mesh(new THREE.PlaneBufferGeometry(WORLD_SIZE, WALL_HEIGHT, 16, 8), rockMaterial);
  northWall.position.set(0, WORLD_SIZE / 2, (SEABED_DEPTH + 50) / 2);
  northWall.rotation.y = Math.PI; // Face inward
  wallsGroup.add(northWall);

  // South wall
  const southWall = new THREE.Mesh(new THREE.PlaneBufferGeometry(WORLD_SIZE, WALL_HEIGHT, 16, 8), rockMaterial);
  southWall.position.set(0, -WORLD_SIZE / 2, (SEABED_DEPTH + 50) / 2);
  // No rotation needed, already facing inward
  wallsGroup.add(southWall);

  // East wall
  const eastWall = new THREE.Mesh(new THREE.PlaneBufferGeometry(WORLD_SIZE, WALL_HEIGHT, 16, 8), rockMaterial);
  eastWall.position.set(WORLD_SIZE / 2, 0, (SEABED_DEPTH + 50) / 2);
  eastWall.rotation.y = -Math.PI / 2; // Face inward
  wallsGroup.add(eastWall);

  // West wall
  const westWall = new THREE.Mesh(new THREE.PlaneBufferGeometry(WORLD_SIZE, WALL_HEIGHT, 16, 8), rockMaterial);
  westWall.position.set(-WORLD_SIZE / 2, 0, (SEABED_DEPTH + 50) / 2);
  westWall.rotation.y = Math.PI / 2; // Face inward
  wallsGroup.add(westWall);

  // Add some variation to the walls
  for (let wall of [northWall, southWall, eastWall, westWall]) {
    // Add some displacement to make the walls look more natural
    if (wall.geometry.attributes && wall.geometry.attributes.position) {
      const positions = wall.geometry.attributes.position.array;
      const simplex = new SimplexNoise(); // Using the same noise generator as seabed

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];

        // Apply noise to z coordinate to create rocky surface
        // But reduce displacement near the bottom to ensure better connection with seabed
        const noise = simplex.noise2D(x * 0.05, y * 0.05) * 3;

        // Check if this vertex is near the bottom of the wall
        // WALL_HEIGHT/2 = 75, so bottom vertices are at y ≈ -75
        if (y < -WALL_HEIGHT / 2 + 10) {
          // For vertices near the bottom, reduce displacement for better seabed connection
          const factor = (y + WALL_HEIGHT / 2) / 10; // 0 at bottom, 1 at 10 units up
          positions[i + 2] = noise * factor;
        } else {
          positions[i + 2] = noise;
        }
      }

      wall.geometry.attributes.position.needsUpdate = true;
      wall.geometry.computeVertexNormals();
    }
  }

  // Add walls to scene
  scene.add(wallsGroup);

  // console.log("Boundary walls created");

  // Return for potential later reference
  return wallsGroup;
}

// Create target destination marker
function createTarget() {
  const targetGeometry = new THREE.SphereBufferGeometry(TARGET_SIZE, 16, 16);
  const targetMaterial = new THREE.MeshStandardMaterial({
    color: TARGET_COLOR,
    emissive: TARGET_COLOR,
    emissiveIntensity: 0.7,
    transparent: true,
    opacity: 0.8,
  });

  targetSphere = new THREE.Mesh(targetGeometry, targetMaterial);
  scene.add(targetSphere);

  // Add a pulsing effect to make it more visible
  const pulseLight = new THREE.PointLight(TARGET_COLOR, 2, 30);
  targetSphere.add(pulseLight);

  // Add indicator beam from surface
  const beamGeometry = new THREE.CylinderBufferGeometry(0.5, 0.5, 200, 8, 1, true);
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

// Create underwater effects (caustics, particles, water surface) with improved water texture
function createWaterEffects() {
  // Create water surface with improved texture and ripple effect
  const waterGeometry = new THREE.PlaneBufferGeometry(WORLD_SIZE, WORLD_SIZE, 32, 32);

  // Create better material for water with physical properties
  const waterMaterial = new THREE.MeshPhysicalMaterial({
    color: WATER_COLOR,
    transparent: true,
    opacity: 0.8,
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 0.5,
    clearcoatRoughness: 0.2,
    side: THREE.DoubleSide,
    envMapIntensity: 1.5,
  });

  // Load water texture and normal map
  const textureLoader = new THREE.TextureLoader();

  // Try to load water texture
  textureLoader.load(
    "artwork/water_texture.jpg",
    function (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(10, 10); // Repeat the texture for better detail
      waterMaterial.map = texture;
      waterMaterial.needsUpdate = true;
      // console.log("Water texture loaded successfully");
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
      normalMap.repeat.set(15, 15); // More repetition for normals gives finer detail
      waterMaterial.normalMap = normalMap;
      waterMaterial.normalScale.set(0.3, 0.3); // Adjust normal intensity
      waterMaterial.needsUpdate = true;
      // console.log("Water normal map loaded successfully");
    },
    undefined,
    function (err) {
      console.log("Water normal map failed to load");
    }
  );

  // Create water mesh
  water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.rotation.x = Math.PI / 2; // Make it horizontal
  water.position.y = 50; // Water surface level
  scene.add(water);

  // Add underwater particles for better depth perception
  addUnderwaterParticles();
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
    particlesGroup.position.x = gameState.position.x;
    particlesGroup.position.y = gameState.position.y;
    particlesGroup.position.z = gameState.position.z;

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
  // Position camera at submarine position
  camera.position.set(gameState.position.x, gameState.position.y, gameState.position.z);

  // Convert game coordinates to Three.js coordinates
  // Based on thruster and movement behavior:
  // Game: +X axis is right, +Y axis is forward
  // Three.js: +X is right, -Z is forward

  // Calculate orientation angles
  const pitchRad = THREE.MathUtils.degToRad(gameState.rotation.pitch);
  const yawRad = THREE.MathUtils.degToRad(-gameState.rotation.yaw - 90); // Adjust for coordinate system difference
  const rollRad = THREE.MathUtils.degToRad(gameState.rotation.roll);

  // Calculate forward vector in Three.js coordinates
  const lookX = -Math.sin(yawRad) * Math.cos(pitchRad);
  const lookY = Math.sin(pitchRad);
  const lookZ = -Math.cos(yawRad) * Math.cos(pitchRad);

  // Create look target point
  const target = new THREE.Vector3(camera.position.x + lookX, camera.position.y + lookY, camera.position.z + lookZ);

  // Look at calculated target
  camera.lookAt(target);

  // Apply roll (if needed)
  if (rollRad !== 0) {
    // Calculate up vector with roll applied
    camera.up.set(Math.sin(rollRad) * Math.sin(yawRad), Math.cos(rollRad), Math.sin(rollRad) * Math.cos(yawRad));
  } else {
    camera.up.set(0, 1, 0); // Default up direction in Three.js
  }

  // Update fog density and color based on depth
  updateFogWithDepth();
}

// Adjust fog based on water depth
function updateFogWithDepth() {
  // Get current depth (modified to enforce minimum of 0)
  const depth = Math.max(0, gameState.status.depth);

  // Make water get darker and visibility decrease with depth
  const depthFactor = Math.min(1, depth / gameState.constants.maxDepth);

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
  // Update target position
  targetSphere.position.set(gameState.navigation.targetPosition.x, gameState.navigation.targetPosition.y, gameState.navigation.targetPosition.z);

  // Make target pulse for visibility
  const time = clock.getElapsedTime();
  const pulseFactor = Math.sin(time * 2) * 0.1 + 0.9;
  targetSphere.scale.set(pulseFactor, pulseFactor, pulseFactor);

  // Create light shaft effect from surface
  if (targetSphere.children.length > 1) {
    const beam = targetSphere.children[1];
    beam.rotation.y = time * 0.1;
    beam.material.opacity = 0.1 + Math.sin(time) * 0.05;
  }

  // Create gentle water surface movement
  if (water) {
    water.position.y = 50 + Math.sin(time * 0.2) * 0.5;

    // Animate water texture if normal map is loaded
    if (water.material && water.material.normalMap) {
      // Animate normal map by shifting the UV coordinates
      water.material.normalMap.offset.x = time * 0.01;
      water.material.normalMap.offset.y = time * 0.01;
    }
  }

  // Update camera position for first person view
  updateCameraPosition();
}

// Render the 3D scene
function renderUnderwaterScene() {
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

  // Initialize 3D scene
  initScene();

  // Perform initial render
  renderUnderwaterScene();
}

// Start the renderer when the window loads
window.addEventListener("load", initRenderer, { once: true });
