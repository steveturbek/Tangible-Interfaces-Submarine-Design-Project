/**
 * Gamepad Control Configuration
 *
 * This file defines how gamepad inputs map to submarine controls.
 * Students can modify these mappings to create their own control schemes.
 *
 * GAMEPAD REFERENCE:
 * - Axes: analog sticks (values from -1 to 1)
 *   - axes[0]: Left Stick X (left/right)
 *   - axes[1]: Left Stick Y (up/down)
 *   - axes[2]: Right Stick Y (up/down)
 *   - axes[5]: Right Stick X (left/right)
 *
 * - Buttons: (pressed = true/false, value = 0 to 1)
 *   - buttons[0]: Y (top face button)
 *   - buttons[1]: B (right face button)
 *   - buttons[2]: A (bottom face button)
 *   - buttons[3]: X (left face button)
 *   - buttons[4]: Left Bumper (LB)
 *   - buttons[5]: Right Bumper (RB)
 *   - buttons[6]: Left Trigger (LT)
 *   - buttons[7]: Right Trigger (RT)
 *   - buttons[8]: Back/Select
 *   - buttons[9]: Start
 *   - buttons[12-15]: D-Pad
 */

const GamepadConfig = {
  // Deadzone for analog sticks (ignore small movements)
  deadzone: 0.08,

  // === ANALOG STICK MAPPINGS ===

  /**
   * Left stick controls the side thrusters using a "clock" metaphor
   * - 12 o'clock (up): both thrusters forward
   * - 3 o'clock (right): spin right in place
   * - 6 o'clock (down): both thrusters backward
   * - 9 o'clock (left): spin left in place
   */
  leftStick: {
    xAxis: 0, // Axis index for X (left/right)
    yAxis: 1, // Axis index for Y (up/down)

    // Control calculation method (options: 'clock', 'tank', 'custom')
    method: "clock",

    // If using 'custom' method, define your own function here:
    // customFunction: (stickX, stickY) => { return {left: 0, right: 0} }
  },

  /**
   * Right stick controls rudder (X axis) and elevator (Y axis)
   */
  rightStick: {
    xAxis: 5, // Axis index for X (left/right)
    yAxis: 2, // Axis index for Y (up/down)

    // Invert axes if needed (multiply by -1)
    invertX: true, // Rudder: push right to turn right
    invertY: false, // Elevator: push up to pitch up
  },

  // === VERTICAL THRUSTER (OPTIONAL) ===
  /**
   * Vertical thruster for direct up/down movement (ballast control)
   *
   * CURRENTLY NOT MAPPED - To enable, uncomment the section below and configure:
   *
   * Options for mapping:
   * 1. D-Pad buttons: buttons[12] for up, buttons[13] for down
   * 2. Shoulder bumpers: buttons[4] (LB) for up, buttons[5] (RB) for down
   * 3. Analog axis: Use triggers as analog (axes[3] and axes[4] on some controllers)
   *
   * Example configuration:
   */
  // verticalThruster: {
  //   type: 'buttons',  // Options: 'buttons' or 'axis'
  //   upButton: 12,     // D-Pad Up (if using buttons)
  //   downButton: 13,   // D-Pad Down (if using buttons)
  //   // axis: 3,       // Axis index (if using axis type)
  //   // invertAxis: false,
  //   power: 50         // Power level (0-100) when button pressed
  // },

  // === BUTTON MAPPINGS ===

  buttons: {
    // Emergency blow tanks (surface quickly)
    blowTanks: {
      buttonIndex: 0, // Y button
      triggerThreshold: 0.5, // How hard to press (for analog buttons)
    },

    // All stop (emergency brake)
    allStop: {
      // Can use multiple buttons - triggers if ANY are pressed
      buttonIndices: [6, 7], // Left and Right triggers
      triggerThreshold: 0.3,
    },

    // All stop (emergency brake)
    grabTarget: {
      // Can use multiple buttons - triggers if ANY are pressed
      buttonIndices: [1, 3], // Left and Right triggers
      triggerThreshold: 0.3,
    },
  },
};

// Export for use in the controller
if (typeof module !== "undefined" && module.exports) {
  module.exports = GamepadConfig;
}
