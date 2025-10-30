// Update the compass indicator based on localStorage value
function update_compass() {
  const gameValue = localStorage.getItem("game_compass");

  if (!gameValue) return;

  // Select the SVG with id 'compass'
  const compassSVG = document.getElementById("compass");
  if (!compassSVG) return;

  // Select the compass-rotating element within this SVG
  const compassRotating = compassSVG.querySelector("#compass-rotating");
  if (!compassRotating) return;

  // Rotate the compass so N points north
  // Negative rotation because we want N to point in the opposite direction of travel
  compassRotating.setAttribute("transform", `rotate(${gameValue}, 256, 128)`);
}
