// use this code to interpret the data coming from the microbit to send to the sub controls
// This is where you write the code to handle physical controls or UI clicks)

function getSerialMessageFromMicrobit(ArrayOfValues) {
  // the microbit example program for this project https://makecode.microbit.org/_gEFMcFExqRF2
  // It sends data twice a second

  /*
//  controls.js contains control functions 

// Absolute control setters
    setLeftThruster(value) // Sets left thruster to an exact percentage value (-100 to 100) - Example: window.submarineControls.setLeftThruster(50);
    setRightThruster(value) // Sets right thruster to an exact percentage value (-100 to 100) - Example: window.submarineControls.setRightThruster(50);
    setElevator(value) // Sets elevator angle to an exact percentage value (-100 to 100) - Example: window.submarineControls.setElevator(-30);
    setRudder(value) // Sets rudder angle to an exact percentage value (-100 to 100) - Example: window.submarineControls.setRudder(25);
    setAftThruster(value) // Sets aft thruster to an exact percentage value (-100 to 100) - Example: window.submarineControls.setAftThruster(75);
  
    // Relative control adjusters
    adjustLeftThruster(value) // Increases/decreases left thruster by specified amount - Example: window.submarineControls.adjustLeftThruster(10);
    adjustRightThruster(value) // Increases/decreases right thruster by specified amount - Example: window.submarineControls.adjustRightThruster(-5);
    adjustElevator(value) // Increases/decreases elevator angle by specified amount - Example: window.submarineControls.adjustElevator(2);
    adjustRudder(value) // Increases/decreases rudder angle by specified amount - Example: window.submarineControls.adjustRudder(-3);
    adjustAftThruster(value) // Increases/decreases aft thruster by specified amount - Example: window.submarineControls.adjustAftThruster(15);
  
    // Special functions
    emergencyBlowTanks(value) // Performs emergency surfacing procedure (full upward pitch and aft thruster) - Example: window.submarineControls.emergencyBlowTanks();
 */

  /* example code
   */
  // console.log(ArrayOfValues);

  if (ArrayOfValues[0] == 1) {
    window.submarineControls.adjustLeftThruster(10); // Increases/decreases left thruster by specified amount - Example: window.submarineControls.adjustLeftThruster(10);
  }
  if (ArrayOfValues[1] == 1) {
    window.submarineControls.adjustRightThruster(10); // Increases/decreases right thruster by specified amount - Example: window.submarineControls.adjustRightThruster(-5);
  }

  window.submarineControls.setElevator(ArrayOfValues[2]); // Sets elevator angle to an exact percentage value (-100 to 100) - Example: window.submarineControls.setElevator(-30);
  window.submarineControls.setRudder(ArrayOfValues[3]); // Sets rudder angle to an exact percentage value (-100 to 100) - Example: window.submarineControls.setRudder(25);
}
