// This code is meant to be pasted into the https://makecode.microbit.org/#editor as javascript
// public code example https://makecode.microbit.org/S29415-59060-61162-04364

// Note this code shows errors in visual studio code editor as the microbit editor uses a combination of javascript and static typescript

let list: number[] = [];
let B = 0;
let A = 0;
serial.writeLine('"START Microbit"');
music.play(music.tonePlayable(262, music.beat(BeatFraction.Sixteenth)), music.PlaybackMode.UntilDone);
led.enable(false);
basic.forever(function () {
  basic.pause(100);
  if (input.buttonIsPressed(Button.A)) {
    A = 1;
  } else {
    A = 0;
  }
  if (input.buttonIsPressed(Button.B)) {
    B = 1;
  } else {
    B = 0;
  }
  // Microbit held LED matrix up, cable away;
  // Y is Pitch
  // X is Roll
  // Z is like Pitch, but when cable is pointing up
  list = [
    A,
    B,
    Math.max(Math.min(Math.round(input.acceleration(Dimension.Y) / 10.24), 99), -99),
    Math.max(Math.min(Math.round(input.acceleration(Dimension.X) / 10.24), 99), -99),
    input.rotation(Rotation.Pitch),
    input.rotation(Rotation.Pitch),
    pins.analogReadPin(AnalogPin.P0),
    pins.analogReadPin(AnalogReadWritePin.P1),
    pins.analogReadPin(AnalogReadWritePin.P2),
    pins.digitalReadPin(DigitalPin.P3),
    pins.digitalReadPin(DigitalPin.P4),
    pins.digitalReadPin(DigitalPin.P5),
  ];
  serial.writeNumbers(list);
});
