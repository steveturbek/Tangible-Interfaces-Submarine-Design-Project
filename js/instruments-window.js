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
    window.opener.postMessage(
      {
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
      },
      "*"
    );
  }
});

window.addEventListener("keyup", (e) => {
  if (window.opener && !window.opener.closed) {
    // Send keyboard event data via postMessage (works with file:// protocol)
    window.opener.postMessage(
      {
        type: "keyup",
        key: e.key,
        code: e.code,
        keyCode: e.keyCode,
        which: e.which,
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
      },
      "*"
    );
  }
});

// Listen for updates from the main window
// The game scripts in the main window will update the elements here by ID

// Listen for console messages from localStorage (for file:// protocol compatibility)
let lastMessageTimestamp = 0;
let lastClearTimestamp = 0;
setInterval(() => {
  // Check if we need to clear the console
  const clearSignal = localStorage.getItem("consoleClear");
  if (clearSignal) {
    const clearTime = parseInt(clearSignal);
    if (clearTime > lastClearTimestamp) {
      lastClearTimestamp = clearTime;
      const subDataText = document.getElementById("sub-data-text");
      if (subDataText) {
        subDataText.textContent = "";
      }
      // Reset message timestamp so old messages don't reappear
      lastMessageTimestamp = 0;
    }
  }

  // Check for new messages
  const messageData = localStorage.getItem("consoleMessage");
  if (messageData) {
    try {
      const { message, timestamp } = JSON.parse(messageData);
      // Only append if this is a new message
      if (timestamp > lastMessageTimestamp) {
        lastMessageTimestamp = timestamp;
        const subDataText = document.getElementById("sub-data-text");
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
