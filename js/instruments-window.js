// Connect to the main game window (opener)
function restartGame() {
  if (window.opener && !window.opener.closed) {
    // Use postMessage to communicate with main window (works with file:// protocol)
    window.opener.postMessage({ type: "restartGame" }, "*");
  } else {
    alert("Main game window not found. Please restart from the main window.");
  }
}

// Forward keyboard events to the main game window
// This allows controls to work even when instruments window has focus
// Using postMessage API to work with both file:// and https:// protocols
window.addEventListener("keydown", (e) => {
  if (window.opener && !window.opener.closed) {
    // Send keyboard event data via postMessage (works with file:// protocol)
    window.opener.postMessage({
      type: "keydown",
      key: e.key,
      code: e.code,
      keyCode: e.keyCode,
      which: e.which,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
      repeat: e.repeat,
    }, "*");
  }
});

window.addEventListener("keyup", (e) => {
  if (window.opener && !window.opener.closed) {
    // Send keyboard event data via postMessage (works with file:// protocol)
    window.opener.postMessage({
      type: "keyup",
      key: e.key,
      code: e.code,
      keyCode: e.keyCode,
      which: e.which,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
    }, "*");
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

          // Listen for microbit connection status updates from main window
          window.addEventListener("message", (event) => {
            if (event.data && event.data.type === "microbitStatus") {
              isConnected = event.data.connected;
              circuitBoard.setAttribute("fill", isConnected ? "#00ff00" : "#ffffff");
            }
          });

          // Toggle between connect and disconnect
          circuitBoard.addEventListener("click", async () => {
            if (!window.opener || window.opener.closed) return;

            try {
              if (isConnected) {
                // Request disconnect via postMessage
                window.opener.postMessage({ type: "microbitDisconnect" }, "*");
              } else {
                // Request connect via postMessage
                window.opener.postMessage({ type: "microbitConnect" }, "*");
              }
            } catch (error) {
              console.log("Microbit toggle error:", error.message);
            }
          });

          // Try to auto-connect
          setTimeout(() => {
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage({ type: "microbitAutoConnect" }, "*");
            }
          }, 1000);
        } else {
          circuitBoard.setAttribute("fill", "#ff0000");
        }
      }
    }
  }, 500);
});
