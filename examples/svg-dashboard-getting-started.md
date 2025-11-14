# Animating SVG Dashboard Instruments with AI

## Quick Start (5 minutes)

You're redesigning instruments for the [Tangible Interfaces Submarine](https://github.com/steveturbek/Tangible-Interfaces-Submarine-Design-Project/tree/main). The project already has working instruments in the `instruments/` folder (battery, speed, depth, compass, etc.).

## Main Steps

1. Design a better-looking instrument and save as SVG
1. Load the default code onto your SVG
1. Work with AI (using ChatGPT in this demo) to animate your instrument
1. Download SVG & Test it in a browser
1. Iterate and Refine

## Step 1: Design a better-looking instrument and save as SVG

I find Adobe Illustrator to be most useful for this specific task as you can open the SVG file directly and it retains the javascript code in the file. [Figma](http://figma.com/) can also work with SVG. [Inkscape](https://inkscape.org) is a commonly noted open source version. If you use Figma, make sure to select "Include ID Attribute". De-select "Outline Text" if you want to change the text in the SVG, for example to show the speed as a number.

**Tips**

- Use vectors as much as possible.
- If you place an PNG image in Illustrator (File > Place). When saving as SVG, select "Link" - keeps the image as an external reference. It usually needs to be in the same folder as the SVG
- Text works fine in SVG, and we often update it in our designs. BUT you have to set a font your browser knows about, not what is in Illustrator or Figma
- Custom fonts can work, we use the see Speed.svg as an example. Ask for help

**Give your layers meaningful names** This is the most important step.

- Bad names: `Rectangle 47`, `Group 3`, `Path 125`
- Good names: `needle`, `indicator`, `fill_bar`, `warning_light`

These layer names become IDs in your SVG code. When you tell the AI "rotate the needle," it knows exactly what you mean.

## Step 2: Add AI Starter code to your SVG file

Use the <a href="https://steveturbek.github.io/Tangible-Interfaces-Submarine-Design-Project/examples/svg-code-setup.html"> SVG Code Setup Tool</a> to add the basic JavaScript template to your SVG. Download the file for the next step

## Step 3: Talk to the AI

_ChatGPT is used in this demo as it is free, but others may work._

Open a new chat with the AI and drag these files onto the window:

1. The [AI 'skill' file](https://raw.githubusercontent.com/steveturbek/Tangible-Interfaces-Submarine-Design-Project/refs/heads/main/examples/svg-dashboard-helper-SKILL.md) or in `examples/svg-dashboard-helper-SKILL.md` (teaches the AI the rules)
1. The instrument SVG file you are replacing (e.g. speed.svg)
1. Your new SVG file (with the code added in step 2), name it speed-new.svg

Then use this template:

```
I'm redesigning the speed.svg instrument for the class project: https://github.com/steveturbek/Tangible-Interfaces-Submarine-Design-Project/tree/main
Please use these uploaded AI Skill instructions to guide you.

Please look at the speed.svg instrument to understand the data range and localStorage key.

I want to update speed-new.svg but add a different behavior in the STUDENT EDIT ZONE only.  Do not change any other code.

I want to fill a bar from left to right. The bar element is called "speed_bar" and
should fill based on the same 0-100 values that the original instrument uses.


```

## Step 4: Download and Test

1. Load file in chrome browser, it should auto animate the Instrument.

   1. The SVG has **built-in test mode** - it will oscillate between 0-100 automatically so you can see how it looks.
   1. **Check the browser console** (Right-click → Inspect → Console) to see debugging info.

1. Drop in `instruments` folder and load game
   1. Make sure it has the same name as the old file

## Step 5: Iterate and Refine

Don't expect perfection on the first try. Most animations take 2-5 rounds.

### If the animation looks wrong:

Upload your animated SVG back to the AI and say:

- "The needle goes backwards"
- "The rotation is too fast"
- "The needle should start pointing up, not left"
- "The range is wrong - it should go from -180° to +180°"

the AI will fix just that part while keeping everything else working.

### If you made a new version of the SVG and lost the code

If you edited the look and feel of the design after you got it working, and lost the code. The [Code merger tool](https://steveturbek.github.io/Tangible-Interfaces-Submarine-Design-Project/examples/svg-code-merger.html) Copies the code from an old SVG to the new one. This wil only work if the main parts of the file, like the layer names are the same.

## Understanding the Code (Optional)

When you open your animated SVG in a text editor, you'll see these important boundary markers:

```javascript
// ========================================
// STUDENT EDIT ZONE
// This section controls how the instrument displays
// ========================================

   ... your animation code here ...

// ========================================
// END STUDENT EDIT ZONE
// ========================================
```

**This is where the magic happens.** These boundary markers are your visual guide:

- Everything **between** these markers is yours to modify safely
- Change the angle ranges, adjust colors, modify formulas
- These markers will be preserved in every iteration
- Everything **outside** this zone handles the plumbing (localStorage, test mode, etc.) - don't touch that unless you know what you're doing.

**Important:** These boundary comment lines are deliberately visual (with lots of `=` signs) so they're easy to spot in your code editor.

## How It Works in Your Dashboard

Your animated SVG reads data from your dashboard using `localStorage`:

**In your dashboard JavaScript:**

```javascript
// Set the battery level (0-100)
localStorage.setItem("battery", 75);
```

**In your SVG (battery.svg):**

```javascript
// Reads 'battery' from localStorage automatically
// Animates to show 75%
```

The SVG detects its own filename and uses it as the localStorage key.

## Common Questions

### Q: Do I need to know JavaScript?

**A:** Just describe what you want and the AI will write the code. You'll learn by seeing the patterns.

### Q: What if I don't see any animation?

**A:**

- Make sure you're opening the SVG in a web browser (not an image viewer)
- Check the browser console for error messages
- Verify the element name in your SVG matches what the AI is trying to animate

### Q: Can I animate multiple things?

**A:** Yes. Tell the AI what each element should do. Example: "Rotate the needle and change the background color from blue to red"

### Q: What if the rotation point is wrong?

**A:** Tell the AI: "The needle should rotate around its left end, not its center"

### Q: Why is my SVG not working in my dashboard?

**A:**

- Check that the filename is an exact replacement of the old one

## Next Steps

1. **Start simple:** Animate just one element first
2. **Test constantly:** Open the SVG in a browser after every change
3. **Iterate:** Describe what's wrong and the AI will fix it
4. **Experiment:** Once one instrument works, try different animation types

## Tools Reference

- **svg-dashboard-helper-SKILL.md** - The instruction file for the AI
- **svg-code-merger.html** - Tool to merge new designs with working code
- **Your browser console** - Shows debugging info and errors

## Getting Help

If something isn't working:

1. Check the browser console for error messages
2. Upload your SVG to the AI and describe the problem
3. Ask the AI to explain what a specific part of the code does
