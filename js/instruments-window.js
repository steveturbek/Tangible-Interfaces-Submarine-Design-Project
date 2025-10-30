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

// Listen for console messages from localStorage (for file:// protocol compatibility)
let lastMessageTimestamp = 0;
let lastClearTimestamp = 0;
setInterval(() => {
  // Check if we need to clear the console
  const clearSignal = localStorage.getItem('game_consoleClear');
  if (clearSignal) {
    const clearTime = parseInt(clearSignal);
    if (clearTime > lastClearTimestamp) {
      lastClearTimestamp = clearTime;
      const subDataText = document.getElementById('sub-data-text');
      if (subDataText) {
        subDataText.textContent = "";
      }
      // Reset message timestamp so old messages don't reappear
      lastMessageTimestamp = 0;
    }
  }

  // Check for new messages
  const messageData = localStorage.getItem('game_consoleMessage');
  if (messageData) {
    try {
      const { message, timestamp } = JSON.parse(messageData);
      // Only append if this is a new message
      if (timestamp > lastMessageTimestamp) {
        lastMessageTimestamp = timestamp;
        const subDataText = document.getElementById('sub-data-text');
        if (subDataText) {
          subDataText.textContent += "\n" + message + "\n";
          // Auto-scroll to bottom
          subDataText.scrollTop = subDataText.scrollHeight;
        }
      }
    } catch (e) {
      // Invalid JSON, ignore
    }
  }
}, 50);

// Microbit connection is now handled in the main window (index.html)
// This keeps the instruments window simpler and focused on displaying gauges

// Fullscreen functionality
// Wait for DOM to be ready before adding event listener
document.addEventListener('DOMContentLoaded', function() {
  const fullscreenIcon = document.getElementById("fullscreen-icon");
  if (fullscreenIcon) {
    fullscreenIcon.addEventListener("click", function () {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        document.documentElement.requestFullscreen().catch((err) => {
          console.error("Error attempting to enable fullscreen:", err);
        });
      } else {
        // Exit fullscreen
        document.exitFullscreen();
      }
    });
  }
});

// // Test Mode functionality
// let testModeInterval = null;
// const testModeCheckbox = document.getElementById("testModeCheckbox");

// // List of all gauge IDs to animate
// const gaugeIds = [
//   "oxygenGauge",
//   "batteryGauge",
//   "compassGauge",
//   "depthGauge",
//   "speedGauge",
//   "pitchGauge",
//   "leftThrustGauge",
//   "rightThrustGauge",
//   "targetGauge",
//   "rudderGauge",
//   "elevatorGauge",
//   "verticalThrusterGauge",
// ];

// testModeCheckbox.addEventListener("change", function () {
//   if (this.checked) {
//     // Start test mode animation
//     const loopDuration = 5000; // 5 seconds for complete loop
//     const startTime = Date.now();

//     testModeInterval = setInterval(() => {
//       const elapsed = Date.now() - startTime;
//       const cyclePosition = (elapsed % loopDuration) / loopDuration; // 0 to 1

//       // Create triangle wave: 0 -> 100 -> 0
//       const percentage =
//         cyclePosition < 0.5
//           ? cyclePosition * 200 // 0 to 100 in first half
//           : (1 - cyclePosition) * 200; // 100 to 0 in second half

//       // Write test values to localStorage for each gauge
//       localStorage.setItem("testMode_oxygen", percentage.toString());
//       localStorage.setItem("testMode_battery", percentage.toString());
//       localStorage.setItem("testMode_compass", (percentage * 3.6).toString()); // 0-360 degrees
//       localStorage.setItem("testMode_depth", percentage.toString());
//       localStorage.setItem("testMode_speed", percentage.toString());
//       localStorage.setItem("testMode_pitch", percentage.toString());
//       localStorage.setItem("testMode_leftThrust", percentage.toString());
//       localStorage.setItem("testMode_rightThrust", percentage.toString());
//       localStorage.setItem("testMode_target", percentage.toString());
//       localStorage.setItem("testMode_rudder", percentage.toString());
//       localStorage.setItem("testMode_elevator", percentage.toString());
//       localStorage.setItem("testMode_verticalThruster", percentage.toString());
//     }, 50); // Update every 50ms for smooth animation
//   } else {
//     // Stop test mode animation and clear localStorage
//     if (testModeInterval) {
//       clearInterval(testModeInterval);
//       testModeInterval = null;

//       // Clear all test mode values from localStorage
//       localStorage.removeItem("testMode_oxygen");
//       localStorage.removeItem("testMode_battery");
//       localStorage.removeItem("testMode_compass");
//       localStorage.removeItem("testMode_depth");
//       localStorage.removeItem("testMode_speed");
//       localStorage.removeItem("testMode_pitch");
//       localStorage.removeItem("testMode_leftThrust");
//       localStorage.removeItem("testMode_rightThrust");
//       localStorage.removeItem("testMode_target");
//       localStorage.removeItem("testMode_rudder");
//       localStorage.removeItem("testMode_elevator");
//       localStorage.removeItem("testMode_verticalThruster");
//     }
//   }
// });
