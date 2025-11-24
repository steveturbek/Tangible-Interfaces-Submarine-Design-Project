/**
 * STUDENT GAMEPAD CONTROL CONFIGURATION TEMPLATE
 *
 * Use this template to design your own submarine control scheme!
 *
 * INSTRUCTIONS:
 * 1. Open helpers/gamepad-demo.html to see which buttons/axes do what
 * 2. Modify the values below to map gamepad inputs to submarine controls
 * 3. Test your control scheme in the game
 * 4. Iterate until it feels intuitive!
 *
 * GAMEPAD REFERENCE GUIDE:
 *
 * AXES (Analog Sticks):
 * - axes[0]: Left Stick X-axis (left = -1, right = +1)
 * - axes[1]: Left Stick Y-axis (up = -1, down = +1)
 * - axes[2]: Right Stick Y-axis (up = -1, down = +1)
 * - axes[5]: Right Stick X-axis (left = -1, right = +1)
 *
 * BUTTONS:
 * - buttons[0]: Y (top face button)
 * - buttons[1]: B (right face button)
 * - buttons[2]: A (bottom face button)
 * - buttons[3]: X (left face button)
 * - buttons[4]: Left Bumper (LB)
 * - buttons[5]: Right Bumper (RB)
 * - buttons[6]: Left Trigger (LT)
 * - buttons[7]: Right Trigger (RT)
 * - buttons[8]: Back/Select button
 * - buttons[9]: Start button
 * - buttons[12]: D-Pad Up
 * - buttons[13]: D-Pad Down
 * - buttons[14]: D-Pad Left
 * - buttons[15]: D-Pad Right
 *
 * SUBMARINE CONTROLS TO MAP:
 * - Left Thruster: controls left-side propulsion (-100 to +100)
 * - Right Thruster: controls right-side propulsion (-100 to +100)
 * - Rudder: turns submarine left/right (-100 to +100)
 * - Elevator: pitches submarine up/down (-100 to +100)
 * - Blow Tanks: emergency surface (button press)
 * - All Stop: emergency brake (button press)
 */

const GamepadConfig = {
  // === BASIC SETTINGS ===

  // Deadzone: how much the stick must move before registering (0.0 to 1.0)
  // Smaller = more sensitive, Larger = less sensitive
  deadzone: 0.15,

  // === LEFT STICK CONFIGURATION ===
  // This controls the submarine's side thrusters

  leftStick: {
    // Which axes to use for left stick
    xAxis: 0, // TODO: Change this to the axis you want for left/right
    yAxis: 1, // TODO: Change this to the axis you want for up/down

    // Control method:
    // - 'clock': stick position like clock hands (12=forward, 3=spin right, 6=back, 9=spin left)
    // - 'tank': traditional tank controls (Y=forward/back, X=turn while moving)
    // - 'custom': write your own function below
    method: "clock", // TODO: Choose your control method

    // OPTIONAL: If using 'custom' method, write your function here
    // The function receives stickX and stickY (each -1 to 1)
    // Must return an object: {left: -1 to 1, right: -1 to 1}
    /*
    customFunction: (stickX, stickY) => {
      // Example: simple forward/backward only (ignores X)
      return {
        left: -stickY,
        right: -stickY
      };
    }
    */
  },

  // === RIGHT STICK CONFIGURATION ===
  // This controls the submarine's rudder and elevator

  rightStick: {
    // Which axes to use for right stick
    xAxis: 5, // TODO: Axis for rudder (left/right steering)
    yAxis: 2, // TODO: Axis for elevator (up/down pitch)

    // Invert axes if the controls feel backwards
    invertX: true, // TODO: Set to true if rudder is reversed
    invertY: false, // TODO: Set to true if elevator is reversed
  },

  // === VERTICAL THRUSTER CONFIGURATION (OPTIONAL) ===
  // Controls direct up/down movement (ballast control)

  /**
   * CHALLENGE: Map the vertical thruster to gamepad controls!
   *
   * The vertical thruster allows the submarine to move directly up or down
   * without changing pitch (like adjusting buoyancy/ballast).
   *
   * Ideas for mapping:
   * - D-Pad Up/Down (buttons 12 and 13)
   * - Left/Right Bumpers (buttons 4 and 5)
   * - Analog triggers as a single axis
   *
   * To enable, uncomment and configure ONE of the sections below:
   */

  // OPTION 1: Button control (discrete up/down)
  // verticalThruster: {
  //   type: 'buttons',        // Use button presses
  //   upButton: 12,           // TODO: Which button goes up? (try D-Pad up)
  //   downButton: 13,         // TODO: Which button goes down? (try D-Pad down)
  //   power: 50               // TODO: How much power? (0-100)
  // },

  // OPTION 2: Axis control (analog/proportional)
  // verticalThruster: {
  //   type: 'axis',           // Use analog axis
  //   axis: 3,                // TODO: Which axis to use?
  //   invertAxis: false,      // TODO: Set true if up/down is backwards
  // },

  // === BUTTON CONFIGURATION ===

  buttons: {
    // Blow Tanks button (emergency surface)
    blowTanks: {
      buttonIndex: 0, // TODO: Which button to use (see reference above)
      triggerThreshold: 0.5, // How hard to press (0.0 to 1.0)
    },

    // All Stop buttons (emergency brake)
    allStop: {
      // You can use one button or multiple (any will trigger)
      buttonIndices: [6, 7], // TODO: Which buttons for all-stop
      triggerThreshold: 0.3, // How hard to press
    },

    // All stop (emergency brake)
    grabTarget: {
      // Can use multiple buttons - triggers if ANY are pressed
      buttonIndices: [1, 3], // Left and Right triggers
      triggerThreshold: 0.3,
    },
  },
};

// === DESIGN QUESTIONS TO CONSIDER ===
/*

1. Should forward be intuitive (push stick forward) or inverted (like flight stick)?

2. Should turning happen while stationary, or only while moving?

3. Should the rudder be on the same stick as movement, or separate?

4. What should happen at 45-degree angles (e.g., 1:30 on the clock)?
   - Move forward and turn slightly?
   - Split power between thrusters?
   - Something else?

5. Should there be a "boost" button for extra speed?

6. Should trigger pressure affect speed (analog), or just on/off?

WRITE YOUR ANSWERS HERE:
-
-
-

*/

// Export configuration
if (typeof module !== "undefined" && module.exports) {
  module.exports = GamepadConfig;
}
