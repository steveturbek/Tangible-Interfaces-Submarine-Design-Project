const canvas = document.getElementById("outside-scene");
const ctx = canvas.getContext("2d");
const img = new Image();
img.src = "assets/cave.png";
img.onload = function () {
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
};

// // 3D scene rendering - Battlezone-inspired vector graphics style

// // Get the canvas element and its context
// const canvas = document.getElementById("outside-scene");
// const ctx = canvas.getContext("2d");

// // Color palette for Battlezone-inspired vector graphics
// const COLORS = {
//   BACKGROUND_TOP: "#000026",
//   BACKGROUND_BOTTOM: "#00003A",
//   CORAL_STROKE: "#3377FF",
//   CORAL_FILL: "#000066",
//   GROUND: "#00004A",
// };

// // Store the generated scene elements to avoid recreating them every frame
// let coralWalls = [];
// let sceneInitialized = false;
// let renderRequested = false;

// // Initialize canvas dimensions
// function initCanvas() {
//   // Set canvas dimensions to match display size
//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight;

//   // Handle window resizing
//   window.addEventListener("resize", () => {
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     // Force a redraw but don't regenerate coral
//     if (!renderRequested) {
//       renderRequested = true;
//       requestAnimationFrame(() => {
//         renderUnderwaterScene();
//         renderRequested = false;
//       });
//     }
//   });
// }

// // Generate a coral wall structure
// function generateCoralWall(x, width, height, segments) {
//   return {
//     x: x,
//     width: width,
//     height: height,
//     segments: segments,
//     points: generateWallPoints(x, width, height, segments),
//   };
// }

// // Generate points for a coral wall's jagged top
// function generateWallPoints(x, width, height, segments) {
//   const points = [];
//   const segmentWidth = width / segments;

//   // Start at bottom left
//   points.push({ x: x, y: canvas.height });

//   // Generate jagged top points
//   for (let i = 0; i <= segments; i++) {
//     const pointX = x + i * segmentWidth;

//     // Vary height for jagged appearance, but ensure it's within reasonable bounds
//     const variance = Math.random() * (height * 0.3);
//     const pointY = canvas.height - height + variance;

//     points.push({ x: pointX, y: pointY });
//   }

//   // End at bottom right
//   points.push({ x: x + width, y: canvas.height });

//   return points;
// }

// // Generate multiple coral walls
// function generateCoralReef() {
//   const walls = [];
//   const wallCount = 8 + Math.floor(Math.random() * 5);

//   // Distribute walls across canvas width
//   for (let i = 0; i < wallCount; i++) {
//     const x = (canvas.width / wallCount) * i - canvas.width * 0.1 + Math.random() * canvas.width * 0.2;
//     const width = canvas.width * (0.1 + Math.random() * 0.15);
//     const height = canvas.height * (0.5 + Math.random() * 0.4);
//     const segments = 3 + Math.floor(Math.random() * 4);

//     walls.push(generateCoralWall(x, width, height, segments));
//   }

//   return walls;
// }

// // Draw a single coral wall - modified for stability
// function drawCoralWall(wall) {
//   ctx.fillStyle = COLORS.CORAL_FILL;
//   ctx.strokeStyle = COLORS.CORAL_STROKE;
//   ctx.lineWidth = 2;

//   // Draw the wall shape
//   ctx.beginPath();

//   // Connect all points to form the wall
//   wall.points.forEach((point, index) => {
//     if (index === 0) {
//       ctx.moveTo(point.x, point.y);
//     } else {
//       ctx.lineTo(point.x, point.y);
//     }
//   });

//   // Close the path to form a complete shape
//   ctx.closePath();

//   // Fill and stroke
//   ctx.fill();
//   ctx.stroke();
// }

// // Find where a horizontal line at height y intersects with the wall
// function findWallIntersections(wall, y) {
//   const intersections = [];

//   // Check each edge of the wall for intersections
//   for (let i = 0; i < wall.points.length - 1; i++) {
//     const p1 = wall.points[i];
//     const p2 = wall.points[i + 1];

//     // Check if the line crosses this edge
//     if ((p1.y <= y && p2.y >= y) || (p1.y >= y && p2.y <= y)) {
//       // Calculate x-coordinate of intersection using line equation
//       // y = y1 + (y2 - y1) * (x - x1) / (x2 - x1)
//       // Solving for x: x = x1 + (y - y1) * (x2 - x1) / (y2 - y1)

//       // Avoid division by zero
//       if (p2.y !== p1.y) {
//         const x = p1.x + ((y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y);
//         intersections.push(x);
//       }
//     }
//   }

//   // Sort intersections from left to right
//   return intersections.sort((a, b) => a - b);
// }

// // Draw all coral walls
// function drawCoralReef(walls) {
//   walls.forEach((wall) => {
//     drawCoralWall(wall);
//   });
// }

// // Draw underwater background
// function drawUnderwaterBackground() {
//   // Create gradient for water effect - dark blue gradient
//   const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
//   gradient.addColorStop(0, COLORS.BACKGROUND_TOP);
//   gradient.addColorStop(1, COLORS.BACKGROUND_BOTTOM);

//   // Fill background
//   ctx.fillStyle = gradient;
//   ctx.fillRect(0, 0, canvas.width, canvas.height);

//   // Add ground
//   ctx.fillStyle = COLORS.GROUND;
//   ctx.fillRect(0, canvas.height * 0.9, canvas.width, canvas.height * 0.1);

//   // Add horizon line
//   ctx.strokeStyle = COLORS.CORAL_STROKE;
//   ctx.lineWidth = 1;
//   ctx.beginPath();
//   ctx.moveTo(0, canvas.height * 0.9);
//   ctx.lineTo(canvas.width, canvas.height * 0.9);
//   ctx.stroke();
// }

// // Update the scene display without regenerating the scene
// function updateSceneDisplay() {
//   // Use the existing method to render the scene - we don't need a separate function
//   renderUnderwaterScene();
// }

// // Main function to render the underwater scene
function renderUnderwaterScene() {
  //   // Clear the canvas
  //   ctx.clearRect(0, 0, canvas.width, canvas.height);
  //   // Draw the background
  //   drawUnderwaterBackground();
  //   // If the scene isn't initialized yet, initialize it
  //   if (!sceneInitialized) {
  //     coralWalls = generateCoralReef();
  //     sceneInitialized = true;
  //   }
  //   // Draw coral walls (using the stored data)
  //   drawCoralReef(coralWalls);
  // }
  // // Initialize canvas and start rendering
  // function initRenderer() {
  //   initCanvas();
  //   // Generate the scene once
  //   if (!sceneInitialized) {
  //     // Generate coral walls and store them
  //     coralWalls = generateCoralReef();
  //     sceneInitialized = true;
}

//   // Initial render
//   renderUnderwaterScene();
// }

// // Start the renderer when the window loads - only attach this once
// window.addEventListener("load", initRenderer, { once: true });
