/**
* This is a https://makecode.microbit.org Javascript program for the Microbit V2
* This demo app demonstrates reading multiple sensor inputs and sending via serial messages to Chrome Browser over USB
* part of project https://github.com/steveturbek/Tangible-Interfaces-Submarine-Design-Project/tree/main
* This is a demo code the student can modify for their project.  
* The student should not need to edit the main game javascript to control the sub, just this program
* 
* This microbit program 
*   Reads several rotary encoders and buttons
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

// String output line "#f00,r85,f99,f99,f00|0|0"
// 1 Pitch setElevator from r99 to f00 to f99
// 2 Roll setRudder from r99 to f00 to f99
// 3 Port Engine setPortThruster from r99 to f00 to f99
// 4 Starboard Engine setStarboardThruster from r99 to f00 to f99
// 5 Vertical Engine setVerticalThruster from r99 to f00 to f99

// | separators
// first binary number is emergencyAllStop() // stop all engines
// second binary number is  emergencyBlowTanks() // currently unused
*
 * Example web page to test serial output https://steveturbek.github.io/Tangible-Interfaces-Submarine-Design-Project/examples/microbit-web-serial-demo.html

* ABOUT THIS HARDWARE
* this demo code is written for this KY-040 rotary encoder https://www.amazon.com/dp/B07DM2YMT4
* It has a 3 pin side which has the rotation, from left to right: CLK, Ground, DT 
* On 2 pin side, from left to right: Ground, Switch (button) 
* NOTE These pins need pull up, as rotary encoder connects to ground
* 
* Encoder for forward and back engine (not using differential left/right engines, setting both with one sensor)
* Encoder for rudder Yaw (left / right)
* Encoder for elevator Pitch (nose up / down)
* Button for Target grabbing
* Button for emergency stop
*/

// @ts-nocheck // remove errors in VS Code app

music.play(music.tonePlayable(262, music.beat(BeatFraction.Sixteenth)), music.PlaybackMode.UntilDone);
led.enable(false); //turn off display to use inputs 4, 10
serial.redirectToUSB();
serial.writeLine("START Microbit\n\n");

//Engine Power
let enginePower = 0; //range is -99 to +99
let enginePinCLK = DigitalPin.P0;
let enginePinDT = DigitalPin.P1;
pins.setPull(enginePinCLK, PinPullMode.PullUp); //NOTE These pins need pull up, as rotary encoder connects to ground
pins.setPull(enginePinDT, PinPullMode.PullUp); //NOTE These pins need pull up, as rotary encoder connects to ground

//Range of all metrics is -99 to +99 (as in percentage forward or back)

//Pitch
let pitch = 0; //range is -99 to +99
let pitchPinCLK = DigitalPin.P2;
let pitchPinDT = DigitalPin.P3;
pins.setPull(pitchPinCLK, PinPullMode.PullUp); //NOTE These pins need pull up, as rotary encoder connects to ground
pins.setPull(pitchPinDT, PinPullMode.PullUp); //NOTE These pins need pull up, as rotary encoder connects to ground

//Elevator
let elevator = 0;
let elevatorPinCLK = DigitalPin.P4;
let elevatorPinDT = DigitalPin.P5;
pins.setPull(elevatorPinCLK, PinPullMode.PullUp); //NOTE These pins need pull up, as rotary encoder connects to ground
pins.setPull(elevatorPinDT, PinPullMode.PullUp); //NOTE These pins need pull up, as rotary encoder connects to ground

////////////

//Buttons Digital input pins 5 (button A), 8 ,11 (button b)

let GrabTargetPin = DigitalPin.P5;
pins.setPull(GrabTargetPin, PinPullMode.PullDown);
// these need resistors to ground!

let AllStopPin = DigitalPin.P11;
pins.setPull(AllStopPin, PinPullMode.PullDown);
// these need resistors to ground!

let serial_send_time = input.runningTime();
let current_time = input.runningTime();
let encoder_engine_a;

/////////////////////////////////////////////////////////////////////////////
// the main repeating loop
/////////////////////////////////////////////////////////////////////////////
basic.forever(function () {
  basic.pause(10);

  // Check encoder
  current_time = input.runningTime();
  if (current_time - serial_send_time > 500) {
    serial_send_time = current_time;

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
        pins.digitalReadPin(AllStopPin) +
        "|" +
        pins.digitalReadPin(GrabTargetPin)
    );
  }
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
