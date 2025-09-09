/**
 * Microbit Javascript demo app demonstrating reading multiple sensor inputs and sending via serial messages to Chrome Browser over USB
 * part of project https://github.com/steveturbek/Tangible-Interfaces-Submarine-Design-Project/tree/main
 *
 * Microbit can read up to 6 analog pins, some digital pins
 * MicrobitPinout is at https://tech.microbit.org/hardware/edgeconnector/
 *
 * Example web page to test serial output https://steveturbek.github.io/Tangible-Interfaces-Submarine-Design-Project/examples/microbit-web-serial-demo.html
 *
 * this demo code needs to be customized for each set of sensors, this is written for an old skool
 * Kraft Thunderstick, an inexpensive joystick for IBM-compatible PCs released in the late 1980s
 * This joystick has:
 * 2 buttons (trigger and two thumb buttons that are actually one button).
 * 2 106k potentiometers, with a physical adjustment slider for pitch, roll of the joystick
 * 1 side sliding linear variable resistor labeled B100k, with a switch in series
 * All potentiometers are connected to same led wire, and use ony 2 wires, E.G. not set up with a voltage divider ground wire
 * Each return wire goes to an analog pim. A 100k resistor is added from pin to ground.
 * I added a 10k resistor to ground for each button pins
 * NOTE pull down resistor on pin11 triggers some kind of bluetooth test mode
 *
 * For the purposes of inspiring the class, I've added a 3d printed frame with 2 additional 10k potentiometers, to control the game submarine port and starboard motors.
 * These pots use all three legs as a voltage divider.  To avoid shorting out the board, a 1k resistor is added to power leg.  ground leg goes to ground, wiper leg goes to the analog pins
 *
 */

let list: number[] = [];
serial.writeLine("START Microbit\n\n");
music.play(music.tonePlayable(262, music.beat(BeatFraction.Sixteenth)), music.PlaybackMode.UntilDone);
led.enable(false); //turn off display to use inputs 4, 10

//Pitch
let pitchPin = AnalogReadWritePin.P0;
let pitchAnalogMin = 375;
// control maximum to one side
// you must observe your sensor to get this number
let pitchAnalogMid = 577;
// the control at rest (may not be exactly in the middle)
// you must observe your sensor to get this number

let pitchAnalogMax = 1012;
// control maximum to other side
// you must observe your sensor to get this number

//Roll
let rollPin = AnalogReadWritePin.P1;
let rollAnalogMin = 500;
// control maximum to one side
// you must observe your sensor to get this number
let rollAnalogMid = 780;
// the control at rest (may not be exactly in the middle)
// you must observe your sensor to get this number
let rollAnalogMax = 1011;
// control maximum to other side
// you must observe your sensor to get this number
////////////
//Port Engine Left Power
let PortEnginePowerPin = AnalogReadWritePin.P4;
let PortEnginePowerAnalogMin = 300;
// control maximum to one side
// you must observe your sensor to get this number
let PortEnginePowerAnalogMid = 845;
// the control at rest (may not be exactly in the middle)
// you must observe your sensor to get this number
let PortEnginePowerAnalogMax = 925;
// control maximum to other side
// you must observe your sensor to get this number
////////////
//Starboard Engine Right Power
// NOTE this potentiometer is wired backwards so Min is higher then Max.  This is corrected in RemapAnalogReadingWithCenterToSerialString
let StarboardEnginePowerPin = AnalogReadWritePin.P10;
let StarboardEnginePowerAnalogMin = 930;
// control maximum to one side
// you must observe your sensor to get this number
let StarboardEnginePowerAnalogMid = 860;
// the control at rest (may not be exactly in the middle)
// you must observe your sensor to get this number
let StarboardEnginePowerAnalogMax = 550;
// control maximum to other side
// you must observe your sensor to get this number
////////////
//Vertical Engine
let VerticalEnginePowerPin = AnalogReadWritePin.P2;
let VerticalEnginePowerAnalogMin = 535;
// control maximum to one side
// you must observe your sensor to get this number
let VerticalEnginePowerAnalogMid = 700;
// the control at rest (may not be exactly in the middle)
// you must observe your sensor to get this number

let VerticalEnginePowerAnalogMax = 1011;
// control maximum to other side
// you must observe your sensor to get this number

//Buttons Digital input pins 5 (button A), 8 ,11 (button b)
let AllStopPin = DigitalPin.P5;
pins.setPull(AllStopPin, PinPullMode.PullDown);

let BlowBallastPin = DigitalPin.P8;
pins.setPull(BlowBallastPin, PinPullMode.PullDown);

/////////////////////////////////////////////////////////////////////////////
// the main repeating loop
/////////////////////////////////////////////////////////////////////////////
basic.forever(function () {
  basic.pause(400);

  // serial.writeValue("Pin 0 (pitch)", pins.analogReadPin(pitchPin))
  let pitchOutput = RemapAnalogReadingWithCenterToSerialString(pins.analogReadPin(pitchPin), pitchAnalogMin, pitchAnalogMid, pitchAnalogMax);
  // serial.writeLine("pitchOutput:" + pitchOutput)

  // serial.writeValue("Pin 1 (roll)", pins.analogReadPin(rollPin))
  let rollOutput = RemapAnalogReadingWithCenterToSerialString(pins.analogReadPin(rollPin), rollAnalogMin, rollAnalogMid, rollAnalogMax);

  // just for fun, plot the pitch + roll on LED screen
  // this does not work when using pins 8 and 10
  // basic.clearScreen(); // Clear the screen
  // let PitchPlotPixel = Math.round(Math.map(pins.analogReadPin(pitchPin), pitchAnalogMin, pitchAnalogMax, 0, 4));
  // let RollPlotPixel = Math.round(Math.map(pins.analogReadPin(rollPin), rollAnalogMin, rollAnalogMax, 4, 0));
  // led.plot(RollPlotPixel, PitchPlotPixel);

  let PortEnginePowerOutput = RemapAnalogReadingWithCenterToSerialString(
    pins.analogReadPin(PortEnginePowerPin),
    PortEnginePowerAnalogMin,
    PortEnginePowerAnalogMid,
    PortEnginePowerAnalogMax
  );
  // serial.writeLine("PortAnalog:" + pins.analogReadPin(PortEnginePowerPin) + "     PortEnginePower:" + PortEnginePowerOutput);

  let StarboardEnginePowerOutput = RemapAnalogReadingWithCenterToSerialString(
    pins.analogReadPin(StarboardEnginePowerPin),
    StarboardEnginePowerAnalogMin,
    StarboardEnginePowerAnalogMid,
    StarboardEnginePowerAnalogMax
  );
  // serial.writeLine("StarboardAnalog:" + pins.analogReadPin(StarboardEnginePowerPin) + "   StarboardEnginePower:" + StarboardEnginePowerOutput);

  let VerticalEnginePowerOutput = RemapAnalogReadingWithCenterToSerialString(
    pins.analogReadPin(VerticalEnginePowerPin),
    VerticalEnginePowerAnalogMin,
    VerticalEnginePowerAnalogMid,
    VerticalEnginePowerAnalogMax
  );
  // serial.writeValue("VerticalEnginePower", pins.analogReadPin(VerticalEnginePowerPin))

  //potential 6th analog pin for ballast control

  //Digital input pins 5 (button A), 8 ,11 (button b)

  // serial.writeValue("AllStopPin", pins.digitalReadPin(AllStopPin))
  // serial.writeValue("BlowBallastPin", pins.digitalReadPin(BlowBallastPin))
  // haven't a use for pin 8 yet

  //serial output message will take the form of a string of 5 analog values and 3 digital values
  // Absolute value analog out: P (positive) or N (negative) + 00-99, so Full forward if F99 and Reverse half is R50
  // Incremental change is +10 or -10
  //--- is equal to zero, for readability, is equivalent to N00 and P00
  // Example string &P00,P00,P00,P00,P00,P00,DDD#

  //old way
  //  list = [pitchOutput, rollOutput, PortEnginePowerOutput, StarboardEnginePowerOutput, VerticalEnginePowerOutput];
  //  serial.writeNumbers(list);

  //convert to string
  serial.writeLine(
    "#" +
      pitchOutput +
      "," +
      rollOutput +
      "," +
      PortEnginePowerOutput +
      "," +
      StarboardEnginePowerOutput +
      "," +
      VerticalEnginePowerOutput +
      "|" +
      pins.digitalReadPin(AllStopPin) +
      "|" +
      pins.digitalReadPin(BlowBallastPin)
  );
});

/////////////////////////////////////////////////////////////////////////////
function RemapAnalogReadingWithCenterToSerialString(value: number, minVal: number, midVal: number, maxVal: number) {
  //This function takes the rough and variable analog input and converts to a number from 0 to 99
  let outputVal = 50; //Halfway
  let analogDirection = "f";
  let backwardsPotentiometer = false;

  // NOTE that the range may go backwards, e.g. a lower voltage may equal more,
  // as when the potentiometer is mounted in opposite direction, as on Thunderstick right (starboard) side potentiometer
  if (minVal > maxVal) {
    backwardsPotentiometer = true;
    let tempVal = maxVal;
    maxVal = minVal;
    minVal = tempVal;
  }

  //sometimes input values are errors, way too high or low, so clamp them into the range (which you checked right??)
  if (value < minVal) value = minVal;
  if (value > maxVal) value = maxVal;

  // If close to the center, return the center number so there is less drift (a common problem)
  let centerRangeAmount = 0.1; // 5% of total range
  let MinMidBuffer = Math.abs(midVal - minVal) * centerRangeAmount;
  let MaxMidBuffer = Math.abs(maxVal - midVal) * centerRangeAmount;

  if (value > midVal - MinMidBuffer && value < midVal + MaxMidBuffer) {
    return "f00"; // Return center output if within dead zone around midVal
  }

  //if not in the center, proportionally convert the input to a value from 0 to 1

  if (value <= midVal) {
    // Map lower half: minVal to midVal becomes 0 to 99
    outputVal = Math.map(value, minVal, midVal, 99, 0);

    //Reverse
    if (backwardsPotentiometer) analogDirection = "f"; //backwards potentiometer
    else analogDirection = "r";
  } else {
    // Map upper half: midVal to maxVal becomes 0 to 99
    outputVal = Math.map(value, midVal, maxVal, 0, 99);
    //Forward
    if (backwardsPotentiometer) analogDirection = "r"; //backwards potentiometer
    else analogDirection = "f";
  }

  outputVal = Math.round(outputVal);
  if (outputVal < 10) return analogDirection + "0" + outputVal; // prepend a zero if 1 digit
  else return analogDirection + outputVal;
}
