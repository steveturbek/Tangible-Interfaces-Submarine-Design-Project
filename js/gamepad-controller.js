/**
 * Submarine Gamepad Controller
 *
 * This controller reads gamepad input and converts it to submarine controls
 * based on the mappings defined in gamepad-config.js
 *
 * Students can modify gamepad-config.js to create their own control schemes
 * without touching this file!
 */

class SubmarineGamepadController {
  constructor(config = null) {
    this.gamepad = null;
    this.connected = false;

    // Load configuration (use provided config or default GamepadConfig)
    this.config = config || (typeof GamepadConfig !== "undefined" ? GamepadConfig : this.getDefaultConfig());
    this.deadzone = this.config.deadzone;

    // Control outputs (normalized -1 to 1)
    this.controls = {
      leftThruster: 0,
      rightThruster: 0,
      rudder: 0,
      elevator: 0,
      blowTanks: false,
      allStop: false,
      grabTarget: false,
    };

    // Track previous button states for edge detection
    this.previousButtonStates = {
      grabTarget: false,
    };

    this.init();
  }

  getDefaultConfig() {
    // Fallback config if gamepad-config.js is not loaded
    return {
      deadzone: 0.15,
      leftStick: { xAxis: 0, yAxis: 1, method: "clock" },
      rightStick: { xAxis: 5, yAxis: 2, invertX: true, invertY: false },
      buttons: {
        blowTanks: { buttonIndex: 0, triggerThreshold: 0.5 },
        allStop: { buttonIndices: [6, 7], triggerThreshold: 0.3 },
      },
    };
  }

  init() {
    // Listen for gamepad connection
    window.addEventListener("gamepadconnected", (e) => {
      console.log("Gamepad connected:", e.gamepad.id);
      this.gamepad = e.gamepad;
      this.connected = true;
    });

    window.addEventListener("gamepaddisconnected", (e) => {
      console.log("Gamepad disconnected");
      this.gamepad = null;
      this.connected = false;
      this.resetControls();
    });

    // Check if already connected
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        this.gamepad = gamepads[i];
        this.connected = true;
        console.log("Gamepad already connected:", gamepads[i].id);
        break;
      }
    }
  }

  update() {
    if (!this.connected) return;

    // Get latest gamepad state
    const gamepads = navigator.getGamepads();
    this.gamepad = gamepads[this.gamepad.index];

    if (!this.gamepad) return;

    // Read left stick based on config
    const leftStickX = this.applyDeadzone(this.gamepad.axes[this.config.leftStick.xAxis]);
    const leftStickY = this.applyDeadzone(this.gamepad.axes[this.config.leftStick.yAxis]);

    // Calculate thruster values using configured method
    this.calculateThrusterValues(leftStickX, leftStickY);

    // Read right stick based on config
    const rightStickX = this.applyDeadzone(this.gamepad.axes[this.config.rightStick.xAxis]);
    const rightStickY = this.applyDeadzone(this.gamepad.axes[this.config.rightStick.yAxis]);

    // Apply inversion if configured
    this.controls.rudder = rightStickX * (this.config.rightStick.invertX ? -1 : 1);
    this.controls.elevator = rightStickY * (this.config.rightStick.invertY ? -1 : 1);

    // Read buttons based on config
    const blowTanksBtn = this.config.buttons.blowTanks;
    this.controls.blowTanks = this.gamepad.buttons[blowTanksBtn.buttonIndex]?.pressed || false;

    // All stop can use multiple buttons
    const allStopBtns = this.config.buttons.allStop;
    const allStopIndices = Array.isArray(allStopBtns.buttonIndices) ? allStopBtns.buttonIndices : [allStopBtns.buttonIndices];

    this.controls.allStop = allStopIndices.some((idx) => (this.gamepad.buttons[idx]?.value || 0) > allStopBtns.triggerThreshold);

    // Grab target button (if configured) - only trigger on button press (rising edge)
    if (this.config.buttons.grabTarget) {
      const grabTargetBtns = this.config.buttons.grabTarget;
      const grabTargetIndices = Array.isArray(grabTargetBtns.buttonIndices)
        ? grabTargetBtns.buttonIndices
        : [grabTargetBtns.buttonIndices];

      const currentlyPressed = grabTargetIndices.some((idx) => this.gamepad.buttons[idx]?.pressed || false);

      // Only trigger on rising edge (button just pressed, not held)
      this.controls.grabTarget = currentlyPressed && !this.previousButtonStates.grabTarget;
      this.previousButtonStates.grabTarget = currentlyPressed;
    }

    // If all stop is engaged, zero out movement controls only
    if (this.controls.allStop) {
      this.controls.leftThruster = 0;
      this.controls.rightThruster = 0;
      this.controls.rudder = 0;
      this.controls.elevator = 0;
      this.controls.blowTanks = false;
    }
  }

  calculateThrusterValues(stickX, stickY) {
    const method = this.config.leftStick.method || "clock";

    // Use custom function if provided
    if (method === "custom" && this.config.leftStick.customFunction) {
      const result = this.config.leftStick.customFunction(stickX, stickY);
      this.controls.leftThruster = result.left;
      this.controls.rightThruster = result.right;
      return;
    }

    // Clock method (current implementation)
    if (method === "clock") {
      this.calculateClockMethod(stickX, stickY);
    }
    // Tank method (traditional)
    else if (method === "tank") {
      this.calculateTankMethod(stickX, stickY);
    }
  }

  calculateClockMethod(stickX, stickY) {
    // Clock-based control:
    // 12 o'clock (Y=-1): both thrusters 100% forward
    // 3 o'clock (X=1): left 100%, right -100% (spin right)
    // 6 o'clock (Y=1): both thrusters 100% backward
    // 9 o'clock (X=-1): left -100%, right 100% (spin left)

    const magnitude = Math.sqrt(stickX * stickX + stickY * stickY);

    if (magnitude < 0.1) {
      this.controls.leftThruster = 0;
      this.controls.rightThruster = 0;
      return;
    }

    // Use magnitude for power scaling, but don't normalize direction
    // This way full deflection in any direction = 100% on at least one thruster
    const power = Math.min(magnitude, 1.0);

    // Forward component (both thrusters same direction)
    const forward = -stickY;

    // Turn component (differential thrust)
    const turn = stickX;

    // Combine forward and turn, then scale by power
    let left = (forward + turn) * power;
    let right = (forward - turn) * power;

    // Normalize if combined values exceed -1 to 1 range
    const maxMag = Math.max(Math.abs(left), Math.abs(right));
    if (maxMag > 1.0) {
      left /= maxMag;
      right /= maxMag;
    }

    this.controls.leftThruster = left;
    this.controls.rightThruster = right;
  }

  calculateTankMethod(stickX, stickY) {
    // Traditional tank drive:
    // Y controls forward/backward
    // X controls turning (differential thrust)

    let left = -stickY + stickX;
    let right = -stickY - stickX;

    // Normalize if values exceed -1 to 1 range
    const maxMagnitude = Math.max(Math.abs(left), Math.abs(right));
    if (maxMagnitude > 1.0) {
      left /= maxMagnitude;
      right /= maxMagnitude;
    }

    this.controls.leftThruster = left;
    this.controls.rightThruster = right;
  }

  applyDeadzone(value) {
    return Math.abs(value) < this.deadzone ? 0 : value;
  }

  resetControls() {
    this.controls.leftThruster = 0;
    this.controls.rightThruster = 0;
    this.controls.rudder = 0;
    this.controls.elevator = 0;
    this.controls.blowTanks = false;
    this.controls.allStop = false;
    this.controls.grabTarget = false;
    this.previousButtonStates.grabTarget = false;
  }

  getControls() {
    return { ...this.controls };
  }

  isConnected() {
    return this.connected;
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = SubmarineGamepadController;
}
