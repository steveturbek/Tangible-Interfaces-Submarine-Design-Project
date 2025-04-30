# Tangible Interfaces Submarine Design Project

Welcome to the Tangible Interfaces Submarine Design Project! This repository contains the foundational code and resources for creating an interactive submarine simulation game with physical controls, to enable college-level industrial design students to design and prototype innovative user controls.
## Introduction

Welcome to the Tangible Interfaces AquaNova Submarine Design Project! This collaborative challenge sits at the intersection of industrial design, user experience, and physical computing. Throughout this project, you'll work in teams to create an immersive submarine piloting experience that combines digital interfaces with tangible controls.

## The Challenge

You are a design team tasked with creating the next generation of personal submersibles. Your submersible needs to navigate complex underwater environments while providing an intuitive interface for pilots of varying experience levels.

Your mission is threefold:
1. Design the visual styling of your submersible cockpit
2. Create digital instruments that effectively communicate critical information
3. Build physical controls that provide an intuitive piloting experience

You'll work in teams of three, with two teams designing seated cockpits and two teams designing prone cockpits. At the end of the project, visiting guests will test each design to determine which provides the most intuitive user experience.

## Learning Objectives

By completing this project, you will:
- Apply industrial design principles to vehicle interface design
- Translate abstract data into meaningful visual instruments
- Create physical control systems that map intuitively to digital actions
- Test and iterate based on user feedback
- Collaborate effectively with a design team
- Present and defend design decisions

## The Gameplay Experience

Your submersible will navigate through an underwater maze of coral reefs. The pilot must reach an underwater base before running out of oxygen or electricity. The gameplay emphasizes careful resource management and precise navigation through challenging 3D environments.

Success in this project will require balancing aesthetic appeal with functional clarity. Your instruments must be visually consistent with your cockpit design while providing clear information. Your physical controls must feel natural while providing the precision needed for delicate maneuvers.

Are you ready to dive in?


## Project Overview

In this project, student teams will design:

1. A submarine vehicle design (styling concept)
2. An on-screen user experience with instruments displaying vehicle data
3. A physical control set (buttons, joysticks, etc.) to drive the submarine
4. Present their design and process

The game challenges players to navigate a personal submersible through an underwater maze of coral reefs to reach an underwater base before running out of oxygen or electricity.


## Project Structure

The repository is organized as follows:

```
├── index.html          # Main game page
├── js/                 # JavaScript files
│   ├── game.js         # Core game mechanics
│   ├── controls.js     # Input handling
│   ├── rendering.js    # 3D scene rendering
│   └── instruments.js  # Cockpit instrument displays
├── css/                # Styling files
├── assets/             # Images and other static assets
├── levels/             # Level configuration files
└── examples/           # Example code for students
```

## Technical Requirements

- **Browser**: Chrome (latest version)
- **Hardware**: Micro:bit v2 for physical controls
- **Programming**: Basic JavaScript and CSS (examples provided)
- **Publishing**: GitHub Pages for hosting

## Game Features

### Environment
- First-person 3D underwater environment
- Randomly generated levels (with seed options for competitive play)
- 10 learning levels of increasing complexity

### Game Mechanics
- Oxygen management (countdown timer)
- Electric power management (reduced by engine usage)
- Navigation challenges (tight passageways, 3D maze)

### Cockpit Instruments
Students will design and implement SVG-based instruments displaying:
- Oxygen level
- Battery status
- Speed
- Sonar distance
- Depth
- Compass direction

### Physical Controls
Using the Micro:bit v2, students will implement:
- Game start/selection controls
- "Blow tanks" emergency button
- Forward/backward propulsion (digital and analog)
- Pitch and yaw steering (digital and analog)

## Getting Started

### Prerequisites
- A GitHub account
- Chrome browser
- Micro:bit v2 with USB cable
- Basic text editor or IDE

### Installation
1. Fork this repository
2. Enable GitHub Pages in your repository settings
3. Connect your Micro:bit v2 via USB
4. Open the game URL in Chrome

### Development Workflow
1. Fork the repository
2. Modify the SVG elements in the HTML/CSS for cockpit design
3. Update the configuration in `config.js` for control scaling
4. Test your implementation using keyboard controls
5. Integrate Micro:bit controls using the provided examples

## Testing Your Design

The final class session will involve user testing with visiting guests. They will test each team's design to determine which interface is most intuitive and effective.

## Future Enhancements (Phase 2)
- Damage mechanics (wall collisions, shark attacks)
- Use of lights to see better (with strategic consequences, uses electricity, attracts sharks)
- Different vehicle designs with tradeoffs
- Supplies (oxygen)
- Supply grabber arm
- Beacon placement system
