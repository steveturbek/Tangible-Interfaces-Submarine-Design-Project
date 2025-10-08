# Tangible Interfaces Submarine Design Project

## Introduction

This Submarine Design Project is part of [Steve Turbek's "Tangible Interfaces" Industrial Design class](https://turbek.com/articles/tangible-interfaces-class.html) at Pratt Institute. This collaborative challenge sits at the intersection of industrial design, user experience, and physical computing. Throughout this project, you'll work in teams to create an immersive submarine piloting experience that combines digital interfaces with physical controls.

![Illustration of a Submarine Cockpit](artwork/submarine-illus.png "Illustration of a Submarine Cockpit")

## The Design Challenge

You are a design team tasked by "AquaNova Submarine" with creating the next generation of personal submersibles. Your submersible needs to navigate complex underwater environments while providing an intuitive interface for beginner pilots.

Success in this project will require balancing aesthetic appeal with functional clarity. Your instruments must be visually consistent with your cockpit design while providing clear information. Your physical controls must feel natural while providing the precision needed for delicate maneuvers.

You'll work in teams of three to cover all the tasks. At the end of the project, visiting guests will test each design to determine which provides the most intuitive user experience, their average time to complete the mission will be a factor in rating the design of the team.

Your mission:

1. Research and identify a target market
1. Create the brand for your sub
1. Research and design the vehicle exterior and interior
1. Design the visual styling of your submersible user experience for the instruments that effectively communicate critical vehicle information
1. Build physical control set (buttons, joysticks, etc.) to drive the submarine that provide an intuitive piloting experience
1. Write and Design a User Start Guide (Printed, PDF, or interactive)
1. Test with real people
1. Write up and present design, process, and findings

## Physical Prototype

To make this project possible for a design student, we have a technical framework to build from. This GitHub Project builds a web app 'game' with on-screen UX instruments that can be customized. The project contains basic recipes to connect hardware controls to this game. Very little electronics or programming is expected. Examples are provided to learn from.

The student will design and fabricate

1. A cockpit design prototype, either beautiful or rough, from wood or cardboard
1. An innovative and beautiful physical control set
1. The controls will send signals to the Micro:bit board
1. The board will send a USB message to the student laptop
1. The laptop drive an external monitor(s) embedded in cockpit design prototype (blue rectangle)

The four teams will each design a cockpit for a pilot who could be:

- Seated upright
- Prone (like a swimmer)
- Recumbent
- Standing/leaning

## Submarine Description

The student will have the ability to design the submarine. Here are the technical design constraints. A clever team can write code to change these, but they are responsible for these customizations.

- Left (Port) and Right(Starboard) [Underwater thrusters](https://en.wikipedia.org/wiki/Underwater_thruster) : These face forward and are centered front to back and top to bottom. They operate like tank treads, if both drive forward, the vehicle goes forward; both back: back; one front the other back, vehicle turns. One operating, the other not, the vehicle goes at half speed and turns in the opposite direction.
- [Rudder](https://en.wikipedia.org/wiki/Rudder): turns vehicle left and right, proportional to vehicle speed
- [Elevators](<https://en.wikipedia.org/wiki/Elevator_(aeronautics)>): points vehicle up and down, proportional to vehicle speed
- Vertical thrusters; Small thrusters that point vehicle up and down; very slow, but works when not in motion

The submarine simulation is an idealized vehicle to keep the project fun!

## Submarines for Inspiration

- https://www.uboatworx.com/custom2
- https://tritonsubs.com/subs/
- https://en.wikipedia.org/wiki/DeepFlight_Super_Falcon
- https://www.seamagine.com/small-submarines-models.html
- https://www.thejetshark.com/
- https://robbreport.com/motors/marine/gallery/personal-submersibles-exploration-1234848269/
- [User instructions to flush a toilet underwater](https://firehead.net/2009/08/submarine-toilet-flushing-instructions/). Funny only [if it is not you](https://en.wikipedia.org/wiki/German_submarine_U-1206#Fate)!

## Videos of Submarines, with a focus on their controls

### Triton

- [TRITON 660 AVA intro video](https://youtu.be/dR12ckJUCU8)
- [Triton control panels shown](https://youtu.be/SAGwGN_V4nk)
- [Triton controls shown](https://youtu.be/xcJ-XV-aP7Q)
- [Making of deep submergence vehicle](https://youtu.be/pb5j9oeZCm0)
- [NOVA PBS episode](https://www.pbs.org/wgbh/nova/video/building-stuff-reach-it/) - Triton section can be found between these timings: 14:50 - 27.26.

### U-Boat Worx

- [U Boat-Worx Controls](https://youtu.be/eqIBfny8q70)
- [Nemo vehicle](https://youtu.be/AvE27dh70qM)
- [Super Sub vehicle](https://www.youtube.com/watch?v=VdqN9sgdrtU)
- [Controls demo](https://youtu.be/JPVJ8ZV5em8)
- [Mexico Expedition C-Explorer 5 - Whale Shark Diving](https://www.youtube.com/watch?v=fpxmoK-bL9c)

## (Fictional) Movies for inspiration

- [Last Breath (2025)](https://www.imdb.com/title/tt14403504) - Submarine Divers in trouble
- [The Abyss (1989)](https://www.imdb.com/title/tt0096754/) - James Cameron's sci-fi thriller about a deep-sea oil rig crew encountering mysterious underwater phenomena
- [Das Boot (1981)](https://www.imdb.com/title/tt0082096/) - German WWII epic following a U-boat crew's harrowing Atlantic patrol
- [The Hunt for Red October (1990)](https://www.imdb.com/title/tt0099810/) - Cold War thriller about a Soviet submarine captain's defection attempt
- [Gravity (2013)](https://www.imdb.com/title/tt1454468) - In space, but key scene involves learning old user controls

## Submarine Technical Reference

- [Pressure Vessel for Human Occupancy](https://en.wikipedia.org/wiki/Pressure_vessel_for_human_occupancy)
- [PVHO-1 - Safety Standard for Pressure Vessels for Human Occupancy](https://www.asme.org/codes-standards/find-codes-standards/safety-standard-for-pressure-vessels-for-human-occupancy/2023/pdf)
- [DNV Manned submersibles classification ](https://www.dnv.com/services/manned-submersibles-1102/)

## Learning Objectives

By completing this project, you will:

- Apply industrial design principles to vehicle interface design
- Translate abstract data into meaningful visual instruments
- Create physical control systems that map intuitively to digital actions
- Test and iterate based on user feedback
- Collaborate effectively with a design team
- Present and defend design decisions

## Design Evaluation Criteria

These criteria balance the practical requirements (can users actually pilot the submarine effectively?) with the design education goals of the course (research, process, aesthetics, and user-centered thinking).

- Innovation
- Aesthetics and Desirability
- Integration of parts into a whole
- Teamwork
- Presentation and communication

### 1. Usability & Intuitive Control Mapping

- How naturally do the physical controls map to submarine movements?
- Can users quickly understand and operate the interface without extensive training?
- Are critical functions easily accessible during navigation tasks?
- Does the control layout follow established conventions or create new, logical patterns?

### 2. Mission Performance & User Testing Results

- Average completion time for the underwater navigation mission
- Success rate of test users reaching the target destination
- Oxygen and battery resource management effectiveness
- Error rates and recovery time when users make mistakes

### 3. Information Design & Visual Clarity

- Effectiveness of the instrument panel in communicating critical data (oxygen, battery, depth, compass, etc.)
- Visual hierarchy and readability under simulated underwater conditions
- Integration between digital instruments and overall cockpit aesthetic
- Appropriate use of color, typography, and iconography for the submarine context

### 4. Physical Design Integration & Ergonomics

- How well the physical controls integrate with the cockpit design (seated vs. prone configurations)
- Comfort and reach considerations for extended use
- Build quality and durability of the physical prototype
- Aesthetic coherence between the brand identity, cockpit styling, and control interfaces

### 5. Design Process & Research Documentation

- Quality of target market research and user personas
- Evidence of iterative design and testing cycles
- Documentation of design decisions and problem-solving approaches
- Brand development and its consistent application across all designs

### 6. Innovation and Delight

- We want the control experience to be THE major selling point of this sub - what innovative and cool experience can you design?

## Game Overview

## The Gameplay Experience

Your submersible will navigate through an underwater maze of coral reefs. The pilot must reach an underwater base before running out of oxygen or electricity. The gameplay emphasizes careful resource management and precise navigation through challenging 3D environments.

[Submarine Simulator](https://steveturbek.github.io/Tangible-Interfaces-Submarine-Design-Project)

Note the game is intended to be played with custom hardware controls, but can be steered with USB gamepad for development or keyboard (See below for tips).

### 💡 Tips for New Pilots

1. **Start slow**: Begin with small adjustments to get a feel for the submarine's response.
2. **Watch your depth**
3. **Turn gradually**
4. **Monitor your systems**:

### Game Mechanics

- Oxygen management (countdown timer)
- Electric power management (reduced by engine usage)
- Navigation challenges (tight passageways, 3D maze)

### Cockpit Instruments

Students will design and implement SVG-based instruments displaying:

- Oxygen level 0-100%
- Battery level 0-100%
- Speed
- Pitch (up / down)
- Yaw (left/right)
- Sonar distance to target
- Depth
- Compass direction 0-359°

### Physical Controls

Using the Micro:bit v2 as a bridge to the computer, students will implement at a minimum:

- Game start/selection controls
- "Blow tanks" emergency button
- Forward/backward propulsion (digital and analog)
- Pitch and yaw steering (digital and analog)

## Getting Started

### Technical Requirements

- **Computer**: Mac Laptop (others may work as well)
- **Browser**: Chrome (latest version)
- **Hardware**: Micro:bit v2 for physical controls configuration, connected to Mac with USB
- **UX design**: Figma, illustrator, AI tools for coding
- **Programming**: Basic HTML and CSS (examples provided)

<!--
### Installation
<!--### Local Development Setup

**IMPORTANT:** When developing locally, you must use a local web server due to browser security restrictions. Opening HTML files directly (via `file://`) will prevent the instruments from working.

**Option 1: Python (Recommended for macOS, should not need installation)**

```bash
# Navigate to the project directory
cd /path/to/Tangible-Interfaces-Submarine-Design-Project

# Start the server (Python 3 comes pre-installed on macOS)
python3 -m http.server 8080

# Open in Chrome
# http://localhost:8080
```


**Option 2: VS Code Live Server Extension**

1. Install the "Live Server" extension in VS Code
2. Right-click `index.html` and select "Open with Live Server"

**Option 3: Node.js**

```bash
# Install http-server globally (if you have Node.js)
npm install -g http-server

# Run the server
http-server -p 8080
``` -->

### Set up

1. [Download this repo zip](https://github.com/steveturbek/Tangible-Interfaces-Submarine-Design-Project/archive/refs/heads/main.zip)
1. Unzip, move folder to your Documents folder (~/Documents)
1. Open Terminal.app
1. Go to the project directory, type `cd ~/Documents/Tangible-Interfaces-Submarine-Design-Project`
1. Start web server just on your computer, type `python3 -m http.server 8080` (you may occasionally need to re-do this,like after a computer restart). To stop the web server `lsof -ti:8080 | xargs kill`
1. Open Chrome, go to `http://localhost:8080/`

### Development Workflow

1. Modify the SVG instrument files in `instruments/` folder
1. Test your implementation using keyboard controls or USB gamepad
1. Build physical controls using sensors from class kit
1. Program Micro:bit to interpret the sensors, use the provided example file `microbit/thunderstick-serial-demo.microbitJavascript`
1. Upload to Google drive to collaborate with your partners
1. At the end, upload the project to github as a 'fork' (help will be provided)

**Students should:**

- use HTML and CSS to design the instruments window
- Design the instrument files using Figma or Illustrator
- Use AI to modify the instrument logic, for example changing line chart to a dial chart
- **If instruments are not updating, do 'hard reload' ( Cmd + Shift + R on a Mac) **

## Project Structure

The repository is organized as follows:

```
***Design Me, Program Me!***
├── instruments/
│   ├── instruments-oxygen.svg     # Oxygen gauge
│   ├── instruments-battery.svg    # Battery gauge
│   └── etc...

***These should not need to be edited***
├── index.html          # Game page
├── js/                 # JavaScript files
│   ├── game.js                 # Core game mechanics
│   ├── controls.js             # Input handling
│   ├── rendering.js            # 3D scene rendering
│   ├── hardware-controls.js    # to interpret the sub controls from the microbit
│   ├── instruments.js          # Cockpit instrument displays
│   └── microbit-serial.js      # Receive and interpret messages from microbit board
├── artwork/            # Other visual assets
└── examples/           # Example code
```

### Submarine Control via Keyboard

Note the game is intended to be played with custom hardware controls, but can be clumsily steered with keyboard for development.

```
| Key   | Function                   | Effect                                   |
| ----- | -----------------------    | ---------------------------------------- |
| `↑`   | Elevator Up                | Pitches the submarine downward (descend) |
| `↓`   | Elevator Down              | Pitches the submarine upward (ascend)    |
| `←`   | Rudder Left                | Turns the submarine to the left          |
| `→`   | Rudder Right               | Turns the submarine to the right         |
| `a`   | Left Thruster Increase     | Increases power to the left thruster     |
| `z`   | Left Thruster Decrease     | Decreases power to the left thruster     |
| `s`   | Right Thruster Increase    | Increases power to the right thruster    |
| `x`   | Right Thruster Decrease    | Decreases power to the right thruster    |
| `TAB` | Sub-Data-Overlay Toggle    | Toggles the submarine data overlay       |
| `ESC` | Emergency Brake            | Slows it down                            |
| `P`   | Vertical Thruster Increase | Increases power to the Vertical thruster |
| `L`   | Vertical Thruster Decrease | Decreases power to the Vertical thruster |
| `B`   | Emergency Surface          | Activates emergency surfacing procedure  |
```
