// Connect to the main game window (opener)
function restartGame() {
  if (window.opener && window.opener.restartGame) {
    window.opener.restartGame();
  } else {
    alert("Main game window not found. Please restart from the main window.");
  }
}

// Forward keyboard events to the main game window
// This allows controls to work even when instruments window has focus
window.addEventListener("keydown", (e) => {
  if (window.opener && !window.opener.closed) {
    // Dispatch the same event to the opener window
    const event = new KeyboardEvent("keydown", {
      key: e.key,
      code: e.code,
      keyCode: e.keyCode,
      which: e.which,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
      repeat: e.repeat,
    });
    window.opener.document.dispatchEvent(event);
  }
});

window.addEventListener("keyup", (e) => {
  if (window.opener && !window.opener.closed) {
    // Dispatch the same event to the opener window
    const event = new KeyboardEvent("keyup", {
      key: e.key,
      code: e.code,
      keyCode: e.keyCode,
      which: e.which,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
    });
    window.opener.document.dispatchEvent(event);
  }
});

// Listen for updates from the main window
// The game scripts in the main window will update the elements here by ID

// Setup microbit connection when the window loads
window.addEventListener("load", () => {
  setTimeout(() => {
    const microbitInstrument = document.getElementById("instruments-microBitGauge");

    if (microbitInstrument && microbitInstrument.contentDocument) {
      const circuitBoard = microbitInstrument.contentDocument.getElementById("circuit-board-top-layer");

      if (circuitBoard) {
        circuitBoard.style.cursor = "pointer";

        // Check if Web Serial API is supported
        if ("serial" in navigator && window.opener && !window.opener.closed) {
          circuitBoard.setAttribute("fill", "#ffffff");

          // Connect click to main window's function
          circuitBoard.addEventListener("click", async () => {
            if (window.opener && window.opener.connectToMicrobit) {
              await window.opener.connectToMicrobit();
              // Update the color on success
              circuitBoard.setAttribute("fill", "#00ff00");
            }
          });

          // Try to auto-connect
          setTimeout(() => {
            if (window.opener && window.opener.autoConnectToMicrobit) {
              window.opener.autoConnectToMicrobit();
            }
          }, 1000);
        } else {
          circuitBoard.setAttribute("fill", "#ff0000");
        }
      }
    }
  }, 500);
});
