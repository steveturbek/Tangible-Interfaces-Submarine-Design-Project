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
