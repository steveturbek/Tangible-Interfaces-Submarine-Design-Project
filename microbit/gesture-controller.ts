/**
* This is a https://makecode.microbit.org Javascript program for the Microbit V2
* This demo app demonstrates reading multiple sensor inputs and sending via serial messages to Chrome Browser over USB
* part of project https://github.com/steveturbek/Tangible-Interfaces-Submarine-Design-Project/tree/main
* This is a demo code the student can modify for their project.  
* The student should not need to edit the main game javascript to control the sub, just this program

* 
* This microbit program 
*   Reads internal sensors and buttons
*   Calculates the state of the controls set by the user, for example the power of the engines
*   Sends a serial message a few times per second, formatted in a way the game expects "#f00,r85,f99,f99,f00|0|0"
* 
* BACKGROUND
* Microbit can read up to 6 analog pins, some digital pins
* Microbit Pinout is at https://tech.microbit.org/hardware/edgeconnector/


// SERIAL OUTPUT FORMATTING
// # is to double check the serial message start
//\n for message end

// Formatting of serial output 

// Analog controls have prefixes
// f = forward or positive number
// r = reverse or negative number
// + = increment by the number UNUSED NOW
// - = decrement by the number UNUSED NOW

// Conceptually, the numbers are proportions of the absolute measures set in the game logic, not any kind of absolute or 'real' number
//Range of all metrics is -99 to +99 (as in percentage forward or back)
// String output line "#f00,r85,f99,f99,f00|0|0"
// 1 Pitch setElevator from r99 to f00 to f99
// 2 Roll setRudder from r99 to f00 to f99
// 3 Port Engine setPortThruster from r99 to f00 to f99
// 4 Starboard Engine setStarboardThruster from r99 to f00 to f99
// 5 Vertical Engine setVerticalThruster from r99 to f00 to f99

// | separators
// first binary number is emergencyAllStop() // stop all engines
// second binary number is  GrabTarget() 
*
 * Example web page to test serial output https://steveturbek.github.io/Tangible-Interfaces-Submarine-Design-Project/examples/microbit-web-serial-demo.html

* Devices is expected to be held flat, buttons upward
* button b adds + 10 enginePower 
* Button A for - 10  enginePower (not using differential left/right engines, setting both with one sensor)
* Pitch uses internal rotation sensor Pitch , from -90 (  edge connector side vertical  to +90 "top" edge vertical
* elevator uses internal rotation sensor Roll, from -90 ( right edge vertical (button B side) ) to +90 button A side edge vertical
* touch logo for Target grabbing
* Push button A and B for emergency stop
*/

// @ts-nocheck // remove errors in VS Code app

music.play(music.tonePlayable(262, music.beat(BeatFraction.Sixteenth)), music.PlaybackMode.UntilDone);
led.enable(false); //turn off display to use inputs 4, 10
serial.redirectToUSB();
serial.writeLine("START Microbit\n\n");

//Engine Power
let enginePower = 0;
let pitch = 0;
let elevator = 0;

////////////

/////////////////////////////////////////////////////////////////////////////
// the main repeating loop
/////////////////////////////////////////////////////////////////////////////
basic.forever(function () {
  basic.pause(50);

  pitch = Math.constrain(input.rotation(Rotation.Pitch), -90, 90);
  pitch = Math.map(pitch, -90, 90, -100, 100);

  elevator = Math.constrain(input.rotation(Rotation.Roll), -90, 90) * -1; // flip roll to steer rudder
  elevator = Math.map(elevator, -90, 90, -100, 100);

  //convert to string
  serial.writeLine(
    "#" +
      RemapSteeringValueForSerialOut(pitch) +
      "," +
      RemapSteeringValueForSerialOut(elevator) +
      "," +
      RemapSteeringValueForSerialOut(enginePower) +
      "," +
      RemapSteeringValueForSerialOut(enginePower) + // note both engines use same control
      "," +
      "f00" + //not using VerticalEnginePowerOutput
      "|" +
      (input.buttonIsPressed(Button.A) && input.buttonIsPressed(Button.B) ? 1 : 0) + // both buttons all stop
      "|" +
      (input.logoIsPressed() ? 1 : 0) // grab target
  );
});

/////////////////////////////////////////////////////////////////////////////

input.onButtonPressed(Button.A, function () {
  enginePower -= 10;
  enginePower = Math.max(-100, enginePower);
});

input.onButtonPressed(Button.B, function () {
  enginePower += 10;
  enginePower = Math.min(100, enginePower);
});

/////////////////////////////////////////////////////////////////////////////
function RemapSteeringValueForSerialOut(InputValue: number) {
  //clean up number and limit to the maximum values
  InputValue = Math.round(InputValue);
  InputValue = Math.min(InputValue, 99);
  InputValue = Math.max(InputValue, -99);

  // set f(forward) or r(reverse) if positive or negative
  let analogDirection = "f";
  if (InputValue < 0) analogDirection = "r";

  InputValue = Math.abs(InputValue);

  if (InputValue < 10) return analogDirection + "0" + InputValue; // prepend a zero if 1 digit
  else return analogDirection + InputValue;
}
