// This code interprets the data coming from the microbit via USB serial cable to control the sub game
// This is where you write the code to handle physical controls or UI clicks)

// this code is generate in/microbit/thunderstick-serial-demo.microbitJavascript
// also found at https://makecode.microbit.org/S29415-59060-61162-04364

// The microbit reads in the analog ports and sends a serial message like #f00,r85,f99,f99,f00|0|0
// # is to double check the serial message start
//\n for message end

// Analog controls have prefixes
// f = forward or positive number
// r = reverse or negative number
// + = increment by the number UNUSED NOW
// - = decrement by the number UNUSED NOW

// Conceptually, the numbers are proportions of the absolute measures set in the game logic, not any kind of absolute or 'real' number

// [0] Pitch setElevator/adjustElevator
// [1] Roll setRudder, adjustRudder
// [2] Port Engine setPortThruster, adjustPortThruster
// [3] Starboard Engine setStarboardThruster, adjustStarboardThruster
// [4] Vertical Engine setVerticalThruster, adjustVerticalThruster

// | separators
// first binary number is emergencyAllStop() // stop all engines
// second binary number is  emergencyBlowTanks() // currently unused

/*
// Absolute control setters
    setPortThruster(value) // Sets left thruster to an exact percentage value (-100 to 100) - Example: window.submarineControls.setPortThruster(50);
    setStarboardThruster(value) // Sets right thruster to an exact percentage value (-100 to 100) - Example: window.submarineControls.setStarboardThruster(50);
    setElevator(value) // Sets elevator angle to an exact percentage value (-100 to 100) - Example: window.submarineControls.setElevator(-30);
    setRudder(value) // Sets rudder angle to an exact percentage value (-100 to 100) - Example: window.submarineControls.setRudder(25);
    setVerticalThruster(value) // Sets aft thruster to an exact percentage value (-100 to 100) - Example: window.submarineControls.setVerticalThruster(75);
  
    // Relative control adjusters
    adjustPortThruster(value) // Increases/decreases left thruster by specified amount - Example: window.submarineControls.adjustPortThruster(10);
    adjustStarboardThruster(value) // Increases/decreases right thruster by specified amount - Example: window.submarineControls.adjustStarboardThruster(-5);
    adjustElevator(value) // Increases/decreases elevator angle by specified amount - Example: window.submarineControls.adjustElevator(2);
    adjustRudder(value) // Increases/decreases rudder angle by specified amount - Example: window.submarineControls.adjustRudder(-3);
    adjustVerticalThruster(value) // Increases/decreases aft thruster by specified amount - Example: window.submarineControls.adjustVerticalThruster(15);
  
    // Special functions
    emergencyBlowTanks() // Performs emergency surfacing procedure (full upward pitch and aft thruster) - Example: window.submarineControls.emergencyBlowTanks();
      emergencyAllStop() // stop all engines

 */

// Elements
// const connectButton = document.getElementById("connectButton");
// const outputDiv = document.getElementById("output");
// const connectionStatus = document.getElementById("connectionStatus");

// Serial port object
let port;
let reader;
let readingInProgress = false;

////////////////////////////////////////////////
async function connectToMicrobit() {
  try {
    // Request a port and open a connection
    // NOTE: The instructions for selecting "BBC micro:bit" are important:
    // In the browser dialog, pick "BBC micro:bit" or "micro:bit"
    // AVOID anything with "debug" or "Bluetooth" in the name
    port = await navigator.serial.requestPort();

    // Open the port with appropriate settings for Micro:bit
    // Micro:bit v2 default baud rate is 115200
    await port.open({ baudRate: 115200 });

    // connectionStatus.textContent = "Connected to Micro:bit";
    // connectionStatus.classList.remove("disconnected");
    // connectionStatus.classList.add("connected");
    // connectButton.textContent = "Disconnect";
    // connectButton.removeEventListener("click", connectToMicrobit);
    // connectButton.addEventListener("click", disconnectFromMicrobit);

    // Start reading data
    readSerialData();

    console.log("Connected to Micro:bit successfully");
    document.getElementById("instruments-microBitGauge").contentDocument.getElementById("circuit-board-top-layer").setAttribute("fill", "#00ff00");

    document
      .getElementById("instruments-microBitGauge")
      .contentDocument.getElementById("circuit-board-top-layer")
      .removeEventListener("click", connectToMicrobit);
    document
      .getElementById("instruments-microBitGauge")
      .contentDocument.getElementById("circuit-board-top-layer")
      .addEventListener("click", disconnectFromMicrobit);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}
////////////////////////////////////////////////////////////
async function disconnectFromMicrobit() {
  if (reader) {
    await reader.cancel();
    reader = null;
  }

  if (port) {
    await port.close();
    port = null;
  }

  readingInProgress = false;
  //   connectionStatus.textContent = "Not connected";
  //   connectionStatus.classList.remove("connected");
  //   connectionStatus.classList.add("disconnected");
  //   connectButton.textContent = "Connect to Micro:bit";

  document
    .getElementById("instruments-microBitGauge")
    .contentDocument.getElementById("circuit-board-top-layer")
    .removeEventListener("click", disconnectFromMicrobit);
  document.getElementById("instruments-microBitGauge").contentDocument.getElementById("circuit-board-top-layer").addEventListener("click", connectToMicrobit);

  document.getElementById("instruments-microBitGauge").contentDocument.getElementById("circuit-board-top-layer").setAttribute("fill", "#ffffff");

  console.log("Disconnected from Micro:bit");
}

////////////////////////////////////////////////////////////////////////
// Try to auto-connect when the game loads - this is activated in instruments.js window.addEventListener(load)
async function autoConnectToMicrobit() {
  // console.log("Attempting to auto-connect to Micro:bit...");

  try {
    // Check if Web Serial API is available
    if (!("serial" in navigator)) {
      console.log("Web Serial API is not supported in this browser.");
      return;
    }

    // Get list of previously paired devices
    const ports = await navigator.serial.getPorts();

    if (ports.length === 0) {
      // console.log("No previously paired devices found. Please connect manually.");
      return;
    }

    // Assume the first port is the Micro:bit (you could add more logic to identify it if needed)
    port = ports[0];

    // Open the port with appropriate settings for Micro:bit
    await port.open({ baudRate: 115200 });

    // Start reading data
    readSerialData();

    // console.log("Auto-connected to Micro:bit successfully");
    document.getElementById("instruments-microBitGauge").contentDocument.getElementById("circuit-board-top-layer").setAttribute("fill", "#00ff00");

    document
      .getElementById("instruments-microBitGauge")
      .contentDocument.getElementById("circuit-board-top-layer")
      .removeEventListener("click", connectToMicrobit);
    document
      .getElementById("instruments-microBitGauge")
      .contentDocument.getElementById("circuit-board-top-layer")
      .addEventListener("click", disconnectFromMicrobit);
  } catch (error) {
    console.log(`Auto-connect error: ${error.message}`);
    // If auto-connect fails, we leave the manual connect option available
  }
}

// Modify the window.addEventListener in instruments.js to call autoConnectToMicrobit
// Add this to the end of the load event listener in instruments.js:
//
// if ("serial" in navigator) {
//   // Try to auto-connect first
//   autoConnectToMicrobit();
// }

////////////////////////////////////////////////////////////////////////
async function readSerialData() {
  if (readingInProgress) return;
  readingInProgress = true;

  // Create a reader and a decoder for text
  reader = port.readable.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (port && readingInProgress) {
      const { value, done } = await reader.read();

      if (done) {
        // Reader has been canceled
        break;
      }

      // Decode the received data
      const text = decoder.decode(value);

      // Add to buffer and check for newline
      buffer += text;

      // Process complete lines
      const lines = buffer.split("\n");

      // Keep the last incomplete line in the buffer
      buffer = lines.pop();

      // Process complete lines
      for (const line of lines) {
        if (line.trim()) {
          //   console.log(`Received: ${line.trim()}`);
          parseMicrobitSerialLine(line.trim());
        }
      }
    }
  } catch (error) {
    console.log(`Error reading data: ${error.message}`);
  } finally {
    readingInProgress = false;
    if (reader) {
      reader.releaseLock();
    }
  }
}

function parseMicrobitSerialLine(lineIn) {
  // serial data can have errors, missing values, etc

  //first character must be a #
  if (lineIn.charAt(0) != "#") return;
  var dataString = lineIn.substring(1);

  // dataString = "f00,f00,f20,f20,f00|0|0";

  // console.log(dataString);

  //reject any data with another #
  if (dataString.indexOf("#") > 0) return;

  var ButtonArray = dataString.split("|");

  if (ButtonArray.length != 3) return; // reject bad data

  if (ButtonArray[1] == 1) emergencyAllStop();
  // if (ButtonArray[2] == 1) emergencyBlowTanks();

  //controls include motors, steering,
  var ControlInputValuesArray = ButtonArray[0].split(",");
  if (ControlInputValuesArray.length != 5) return; // reject bad data

  // ControlInputValuesArray[2] = ControlInputValuesArray[3]; // hack to make it drive straight
  // console.log(ControlInputValuesArray);

  //expecting a three letter string like f00, r99, +10, or -20
  //f and r are absolute measurements, forward or reverse, + or -
  //+, - are incremental

  // ControlInputValuesArray.forEach((element) => {
  //   if (element.length != 3) return false;
  //   // var ValueAsNumber = parseInt(element.substring(1));
  //   if (isNaN(parseInt(element.substring(1)))) return false;
  // });

  const commandArray = [
    [setElevator, adjustElevator], // [0] Pitch
    [setRudder, adjustRudder], // [1] Roll
    [setPortThruster, adjustPortThruster], // [2] Port Engine
    [setStarboardThruster, adjustStarboardThruster], // [3] Starboard Engine
    [setVerticalThruster, adjustVerticalThruster], // [4] Vertical Engine
  ];

  for (a = 0; a < 5; a++) {
    var direction = 1; // forward or reverse
    var SetOrAdjust = 0; //position in  commandArray[x][SetOrAdjust]

    switch (ControlInputValuesArray[a].charAt(0)) {
      case "r":
        direction = -1;
      case "f":
        // SetOrAdjust = 0; // set
        break;
      // case "-":
      //   direction = -1;
      // case "+":
      //   SetOrAdjust = 1; // adjust
      //   break;
    }

    const value = parseInt(ControlInputValuesArray[a].substring(1));

    if (isNaN(value)) {
      // console.log("NaN " + ControlInputValuesArray[a].substring(1));
      continue;
    }
    commandArray[a][SetOrAdjust](value * direction);
  }
}
