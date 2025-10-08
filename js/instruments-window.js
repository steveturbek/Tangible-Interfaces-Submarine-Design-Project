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

          let isConnected = false;

          // Toggle between connect and disconnect
          circuitBoard.addEventListener("click", async () => {
            if (!window.opener) return;

            try {
              if (isConnected) {
                // Disconnect
                if (window.opener.disconnectFromMicrobit) {
                  await window.opener.disconnectFromMicrobit();
                  circuitBoard.setAttribute("fill", "#ffffff");
                  isConnected = false;
                }
              } else {
                // Connect
                if (window.opener.connectToMicrobit) {
                  await window.opener.connectToMicrobit();
                  circuitBoard.setAttribute("fill", "#00ff00");
                  isConnected = true;
                }
              }
            } catch (error) {
              console.log("Microbit toggle error:", error.message);
            }
          });

          // Try to auto-connect
          setTimeout(async () => {
            if (window.opener && window.opener.autoConnectToMicrobit) {
              try {
                const connected = await window.opener.autoConnectToMicrobit();
                // Check if connection succeeded
                if (connected) {
                  circuitBoard.setAttribute("fill", "#00ff00");
                  isConnected = true;
                }
              } catch (error) {
                // Auto-connect failed, stay disconnected
              }
            }
          }, 1000);
        } else {
          circuitBoard.setAttribute("fill", "#ff0000");
        }
      }
    }
  }, 500);
});
