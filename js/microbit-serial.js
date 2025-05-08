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
  //   console.log("connectToMicrobit");
  window.alert("In the next screen, pick the option named BBC micro:bit ...");
  try {
    // Request a port and open a connection
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

  const stringArray = lineIn.split(","); //text is separated by commas, split into an array (a list)
  if (stringArray.length != 10) return; //we will always send 10 values as an error check, so skip this read if not 10 values

  // console.log(stringArray);
  // Convert to numbers and replace empty or NaN values with 0
  const intArray = stringArray.map((str) => {
    const num = +str;
    return str === "" || isNaN(num) ? 0 : num;
  });

  getSerialMessageFromMicrobit(intArray); //send to student code
}
