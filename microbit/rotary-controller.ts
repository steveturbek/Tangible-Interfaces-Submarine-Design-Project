/**
* This is a https://makecode.microbit.org Javascript program for the Microbit V2
* This demo app demonstrates reading multiple sensor inputs and sending via serial messages to Chrome Browser over USB
* part of project https://github.com/steveturbek/Tangible-Interfaces-Submarine-Design-Project/tree/main
* This is a demo code the student can modify for their project.  
* The student should not need to edit the main game javascript to control the sub, just this program
* STATUS: works with multiple encoders.  The encoders do skip readings when fast spinning

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

let current_time = input.runningTime();
let serial_send_time = current_time; // what we use to occasionally send a serial message but not block the main loop
let all_encoders_CLK_time = current_time; // to track when to test the encoders
let rotary_increment = 10; // how much to change for each rotary click

music.play(music.tonePlayable(262, music.beat(BeatFraction.Sixteenth)), music.PlaybackMode.UntilDone);
led.enable(false); //turn off display to use inputs 4, 10
serial.redirectToUSB();
serial.writeLine("START Microbit" + current_time + "\n\n");

//Engine Power
let enginePower = 0; //range is -99 to +99
let enginePinCLK = DigitalPin.P0;
let enginePinDT = DigitalPin.P1;
pins.setPull(enginePinCLK, PinPullMode.PullUp); //NOTE These pins need pull up, as rotary encoder connects to ground
pins.setPull(enginePinDT, PinPullMode.PullUp); //NOTE These pins need pull up, as rotary encoder connects to ground
let engine_encoder_CLK = pins.digitalReadPin(enginePinCLK);
let engine_encoder_CLK_previous = engine_encoder_CLK; // variable to remember position to track rotary encoder
let engine_encoder_DT = pins.digitalReadPin(enginePinDT);

//Pitch
let pitch = 0; //range is -99 to +99
let pitchPinCLK = DigitalPin.P2;
let pitchPinDT = DigitalPin.P3;
pins.setPull(pitchPinCLK, PinPullMode.PullUp); //NOTE These pins need pull up, as rotary encoder connects to ground
pins.setPull(pitchPinDT, PinPullMode.PullUp); //NOTE These pins need pull up, as rotary encoder connects to ground
let pitch_encoder_CLK = pins.digitalReadPin(pitchPinCLK);
let pitch_encoder_CLK_previous = pitch_encoder_CLK; // variable to remember position to track rotary encoder
let pitch_encoder_DT = pins.digitalReadPin(pitchPinDT);

//Elevator
let elevator = 0;
let elevatorPinCLK = DigitalPin.P4;
let elevatorPinDT = DigitalPin.P8;
pins.setPull(elevatorPinCLK, PinPullMode.PullUp); //NOTE These pins need pull up, as rotary encoder connects to ground
pins.setPull(elevatorPinDT, PinPullMode.PullUp); //NOTE These pins need pull up, as rotary encoder connects to ground
let elevator_encoder_CLK = pins.digitalReadPin(elevatorPinCLK);
let elevator_encoder_CLK_previous = elevator_encoder_CLK; // variable to remember position to track rotary encoder
let elevator_encoder_DT = pins.digitalReadPin(elevatorPinDT);

////////////

//Buttons Digital input pins 5 (button A), 8 ,11 (button b)

let GrabTargetPin = DigitalPin.P5;
pins.setPull(GrabTargetPin, PinPullMode.PullUp); // pin is normally HIGH

let AllStopPin = DigitalPin.P11;
pins.setPull(AllStopPin, PinPullMode.PullUp); // pin is normally HIGH

/////////////////////////////////////////////////////////////////////////////
// the main repeating loop
/////////////////////////////////////////////////////////////////////////////
basic.forever(function () {
  // basic.pause(1);
  current_time = input.runningTime();

  // Read encoders every loop iteration (no timing check for better responsiveness)
  // Engine rotary encoder
  engine_encoder_CLK = pins.digitalReadPin(enginePinCLK);
  engine_encoder_DT = pins.digitalReadPin(enginePinDT);
  // Detect falling edge only (1 -> 0) - this is the stable approach
  if (engine_encoder_CLK == 0 && engine_encoder_CLK_previous == 1) {
    if (engine_encoder_DT == 1) {
      //  Counter-clockwise - step down, but not below -99
      enginePower = Math.max(-100, enginePower - rotary_increment);
    } else {
      //  Clockwise - step forward, but not above 99
      enginePower = Math.min(100, enginePower + rotary_increment);
    }
  }
  engine_encoder_CLK_previous = engine_encoder_CLK;

  // pitch rotary encoder
  pitch_encoder_CLK = pins.digitalReadPin(pitchPinCLK);
  pitch_encoder_DT = pins.digitalReadPin(pitchPinDT);
  // Detect falling edge only (1 -> 0) - this is the stable approach
  if (pitch_encoder_CLK == 0 && pitch_encoder_CLK_previous == 1) {
    if (pitch_encoder_DT == 1) {
      //  Counter-clockwise - step down, but not below -99
      pitch = Math.max(-100, pitch - rotary_increment);
    } else {
      //  Clockwise - step forward, but not above 99
      pitch = Math.min(100, pitch + rotary_increment);
    }
  }
  pitch_encoder_CLK_previous = pitch_encoder_CLK;

  // elevator rotary encoder
  elevator_encoder_CLK = pins.digitalReadPin(elevatorPinCLK);
  elevator_encoder_DT = pins.digitalReadPin(elevatorPinDT);
  // Detect falling edge only (1 -> 0) - this is the stable approach
  if (elevator_encoder_CLK == 0 && elevator_encoder_CLK_previous == 1) {
    if (elevator_encoder_DT == 1) {
      //  Counter-clockwise - step down, but not below -99
      elevator = Math.max(-100, elevator - rotary_increment);
    } else {
      //  Clockwise - step forward, but not above 99
      elevator = Math.min(100, elevator + rotary_increment);
    }
  }
  elevator_encoder_CLK_previous = elevator_encoder_CLK;

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
        (pins.digitalReadPin(AllStopPin) ? 0 : 1) + // this sends 1 when clicked, as the pin is naturally High
        "|" +
        (pins.digitalReadPin(GrabTargetPin) ? 0 : 1) // this sends 1 when clicked, as the pin is naturally High
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
