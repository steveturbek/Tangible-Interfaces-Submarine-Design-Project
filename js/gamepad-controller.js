/**
 * Submarine Gamepad Controller
 *
 * Controls:
 * - Left Analog Stick: Side thrusters (360° control)
 *   - Forward: both motors forward
 *   - Right: left motor forward, right motor backward
 *   - Left: right motor forward, left motor backward
 * - Right Analog Stick X: Rudder control
 * - Right Analog Stick Y: Elevator control
 * - Y Button: Blow tanks (surface)
 * - Triggers (LT/RT): All stop
 */

class SubmarineGamepadController {
  constructor() {
    this.gamepad = null;
    this.connected = false;
    this.deadzone = 0.15; // Ignore small stick movements

    // Control outputs (normalized -1 to 1)
    this.controls = {
      leftThruster: 0,
      rightThruster: 0,
      rudder: 0,
      elevator: 0,
      blowTanks: false,
      allStop: false
    };

    this.init();
  }

  init() {
    // Listen for gamepad connection
    window.addEventListener('gamepadconnected', (e) => {
      console.log('Gamepad connected:', e.gamepad.id);
      this.gamepad = e.gamepad;
      this.connected = true;
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      console.log('Gamepad disconnected');
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
        console.log('Gamepad already connected:', gamepads[i].id);
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

    // Left stick axes (side thrusters)
    const leftStickX = this.applyDeadzone(this.gamepad.axes[0]);
    const leftStickY = this.applyDeadzone(this.gamepad.axes[1]);

    // Calculate thruster values from stick position (tank drive)
    this.calculateThrusterValues(leftStickX, leftStickY);

    // Right stick axes
    const rightStickX = this.applyDeadzone(this.gamepad.axes[5] || this.gamepad.axes[2]); // Rudder
    const rightStickY = this.applyDeadzone(this.gamepad.axes[2] || this.gamepad.axes[3]); // Elevator

    this.controls.rudder = -rightStickX; // Reversed for intuitive control
    this.controls.elevator = rightStickY;

    // Y button (index 0 on most gamepads, but check your mapping)
    this.controls.blowTanks = this.gamepad.buttons[0]?.pressed || false;

    // Triggers - LT (index 6) or RT (index 7)
    const leftTrigger = this.gamepad.buttons[6]?.value || 0;
    const rightTrigger = this.gamepad.buttons[7]?.value || 0;
    this.controls.allStop = (leftTrigger > 0.3 || rightTrigger > 0.3);

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
    // Convert stick position to thruster values using clock metaphor
    // stickX: -1 (left/9 o'clock) to 1 (right/3 o'clock)
    // stickY: -1 (up/12 o'clock) to 1 (down/6 o'clock)

    // Clock-based control:
    // 12 o'clock (Y=-1): both thrusters 100% forward
    // 3 o'clock (X=1): left 100%, right -100% (spin right)
    // 6 o'clock (Y=1): both thrusters 100% backward
    // 9 o'clock (X=-1): left -100%, right 100% (spin left)

    // Calculate angle and magnitude
    const magnitude = Math.sqrt(stickX * stickX + stickY * stickY);

    // If stick is centered, no thrust
    if (magnitude < 0.1) {
      this.controls.leftThruster = 0;
      this.controls.rightThruster = 0;
      return;
    }

    // Clamp magnitude to 1.0
    const clampedMag = Math.min(magnitude, 1.0);

    // Direct mapping based on stick position
    // Forward component (both thrusters same direction)
    const forward = -stickY * clampedMag / magnitude;

    // Turn component (differential thrust)
    const turn = stickX * clampedMag / magnitude;

    // Combine forward and turn
    this.controls.leftThruster = forward + turn;
    this.controls.rightThruster = forward - turn;

    // Clamp to -1 to 1 range
    this.controls.leftThruster = Math.max(-1, Math.min(1, this.controls.leftThruster));
    this.controls.rightThruster = Math.max(-1, Math.min(1, this.controls.rightThruster));
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
  }

  getControls() {
    return { ...this.controls };
  }

  isConnected() {
    return this.connected;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SubmarineGamepadController;
}
