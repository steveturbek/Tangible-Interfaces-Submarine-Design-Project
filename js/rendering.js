// 3D Underwater Scene Rendering using Three.js

// Scene variables
let scene, camera, renderer;
let targetSphere;
let seabed;
let water;
let directionalLight, ambientLight;
let clock;

// Environment settings
const WORLD_SIZE = 2000; // World dimensions
const SEABED_DEPTH = -100; // Depth of the seabed
const WATER_COLOR = 0x001e0f; // Deep blue-green color
const TARGET_COLOR = 0xff0000; // Red target
const TARGET_SIZE = 5; // Target sphere size

// Check Three.js version and provide compatibility
const isNewThreeVersion = THREE.REVISION >= 125; // r125+ uses only BufferGeometry

// Initialize the 3D scene
function initScene() {
  // Create clock for animations
  clock = new THREE.Clock();

  // Create scene with underwater color
  scene = new THREE.Scene();
  scene.background = new THREE.Color(WATER_COLOR);
  // No fog as requested

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

  // Add lighting
  setupLighting();

  // Create seabed
  createSeabed();

  // Create target sphere
  createTarget();

  // Add water effects
  createWaterEffects();

  // Handle window resize
  window.addEventListener("resize", onWindowResize);

  // Initial camera position
  updateCameraPosition();
}

// Set up scene lighting
function setupLighting() {
  // Main directional light (sun)
  directionalLight = new THREE.DirectionalLight(0x88ccff, 0.5);
  directionalLight.position.set(100, 100, 100);
  scene.add(directionalLight);

  // Ambient light for overall scene illumination
  ambientLight = new THREE.AmbientLight(0x003366, 0.7);
  scene.add(ambientLight);

  // Add a slight blue point light to simulate water scattering
  const waterLight = new THREE.PointLight(0x0077ff, 0.5, 100);
  waterLight.position.set(0, 20, 0);
  scene.add(waterLight);
}

// Create a flat sandy seabed
function createSeabed() {
  // Create a large plane for the seabed
  const seabedGeometry = new THREE.PlaneBufferGeometry(WORLD_SIZE, WORLD_SIZE, 50, 50);

  // Load sand texture
  const textureLoader = new THREE.TextureLoader();

  // Create material with sandy appearance (set texture later if loaded)
  const seabedMaterial = new THREE.MeshStandardMaterial({
    color: 0xd2b48c, // Sandy color
    roughness: 0.8,
    metalness: 0.1,
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
  seabed.position.y = SEABED_DEPTH;
  scene.add(seabed);

  // Add subtle displacement to seabed for realism
  if (seabedGeometry.attributes.position) {
    const positions = seabedGeometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.random() * 2 - 1; // Subtle height variation
    }
    seabedGeometry.attributes.position.needsUpdate = true;
    seabedGeometry.computeVertexNormals();
  }
}

// Create a simple submarine representation
function createSubmarine() {
  // Create submarine body - CapsuleGeometry was added in r125+
  // If using older versions, create with cylinders and spheres
  let subGeometry;

  if (THREE.CapsuleGeometry) {
    // Use CapsuleGeometry if available (newer versions)
    subGeometry = new THREE.CapsuleGeometry(2, 6, 8, 16);
  } else {
    // Fallback for older Three.js versions - create from cylinder and spheres
    const cylinderGeo = new THREE.CylinderBufferGeometry(2, 2, 6, 16);

    // Reposition to match capsule positioning (centered)
    cylinderGeo.translate(0, 0, 0);

    subGeometry = cylinderGeo;
  }

  const subMaterial = new THREE.MeshStandardMaterial({ color: SUBMARINE_COLOR });
  submarine = new THREE.Mesh(subGeometry, subMaterial);

  // Add a conning tower
  const towerGeometry = new THREE.CylinderBufferGeometry(1, 1, 2, 8);
  const tower = new THREE.Mesh(towerGeometry, subMaterial);
  tower.position.y = 2;
  submarine.add(tower);

  // Add simple propellers
  const propGeometry = new THREE.BoxBufferGeometry(0.5, 2, 0.2);
  const propMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });

  const propeller = new THREE.Mesh(propGeometry, propMaterial);
  propeller.position.set(0, 0, -4);
  submarine.add(propeller);

  scene.add(submarine);
}

// Create target destination marker
function createTarget() {
  const targetGeometry = new THREE.SphereBufferGeometry(TARGET_SIZE, 16, 16);
  const targetMaterial = new THREE.MeshStandardMaterial({
    color: TARGET_COLOR,
    emissive: TARGET_COLOR,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.8,
  });

  targetSphere = new THREE.Mesh(targetGeometry, targetMaterial);
  scene.add(targetSphere);

  // Add a pulsing effect to make it more visible
  const pulseLight = new THREE.PointLight(TARGET_COLOR, 2, 20);
  targetSphere.add(pulseLight);
}

// Create underwater effects (caustics, particles)
function createWaterEffects() {
  // Add subtle water movement effect
  const waterGeometry = new THREE.PlaneBufferGeometry(WORLD_SIZE, WORLD_SIZE, 1, 1);
  const waterMaterial = new THREE.MeshBasicMaterial({
    color: WATER_COLOR,
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide,
  });

  water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.rotation.x = Math.PI / 2;
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

  // Particle count
  const particleCount = 200;

  // Create particles with simple points
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);

  // Distribute particles randomly in a cylinder around the viewer
  const radius = 100;
  const height = 100;

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;

    // Create particles in a cylindrical pattern around viewer path
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * radius;

    particlePositions[i3] = Math.cos(angle) * r; // x
    particlePositions[i3 + 1] = Math.sin(angle) * r; // y
    particlePositions[i3 + 2] = Math.random() * height - height / 2; // z
  }

  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

  // Simple material for particles
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xaaaaff,
    size: 0.3,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
  });

  // Create points mesh
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  particlesGroup.add(particles);

  // Animate particles in render loop
  function animateParticles() {
    // Make particles slowly drift
    particlesGroup.position.x = gameState.position.x;
    particlesGroup.position.y = gameState.position.y;
    particlesGroup.position.z = gameState.position.z;

    const positions = particleGeometry.attributes.position.array;
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

    particleGeometry.attributes.position.needsUpdate = true;

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
