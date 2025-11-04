# Getting Started: Animated SVG Dashboards with Claude

## Quick Start (5 minutes)

Want to make your dashboard gauges come alive? This guide shows you how to use Claude AI to add animations to your SVG designs - no coding experience needed!

## Project Context

You're redesigning gauges for a **submarine dashboard**. The project already has working gauges in the `instruments/` folder (battery, speed, depth, compass, etc.). Your job is to:

1. Design a better-looking version in Figma/Illustrator
2. Use Claude to copy the animation code from the stock gauge to your design
3. Test it in a browser
4. Drop it into the dashboard project

**Key insight:** You don't have to explain the animation from scratch - just upload the stock gauge you're replacing and Claude will copy its behavior!

## What You'll Need

1. Your SVG file from Figma or Illustrator (your new design)
2. The project GitHub URL (provided below - just copy it!)
3. Access to Claude AI (claude.ai)
4. The `examples/svg-dashboard-helper-SKILL.md` file
5. A web browser (Chrome, Firefox, or Safari)

**Project URL:** `https://github.com/steveturbek/Tangible-Interfaces-Submarine-Design-Project/tree/main`

## Step 1: Prepare Your SVG in Figma/Illustrator

**Give your layers meaningful names!** This is the most important step.

- Bad names: `Rectangle 47`, `Group 3`, `Path 125`
- Good names: `needle`, `indicator`, `fill_bar`, `warning_light`

**Example:** If you want a needle to rotate, name that layer "needle" in Figma before exporting.

**Why?** These layer names become IDs in your SVG code. When you tell Claude "rotate the needle," it knows exactly what you mean!

## Step 2: Export Your SVG

1. In Figma: Select your artboard → Right-click → Export → SVG
2. In Illustrator: File → Export → Export As → SVG

Save it with a descriptive filename like `speed.svg` or `battery.svg`

## Step 3: Talk to Claude

Open a new chat with Claude and provide **TWO** things:

1. **The SKILL file:** `examples/svg-dashboard-helper-SKILL.md` (teaches Claude the rules)
2. **Your new design:** The SVG you just exported from Figma

Plus copy-paste the project URL (shown below).

**That's it!** You don't need to upload the stock gauge - Claude will fetch it from GitHub automatically.

Then use this template:

```
I'm redesigning the speed gauge for my submarine dashboard, as part of my design class.
The project is here:
https://github.com/steveturbek/Tangible-Interfaces-Submarine-Design-Project/tree/main

[upload examples/svg-dashboard-helper-SKILL.md]
[upload my-new-speed-design.svg]

Please fetch the stock speed gauge from the instruments/ folder and apply
the same animation behavior to my new design.

My animated element is called "speedometer_needle" in my new SVG.
Keep the same behavior as the original.
```

**Why this workflow is better:**
- Only 2 files to upload instead of 3
- Claude fetches the latest version from GitHub
- Less clutter, cleaner conversation
- Ensures you're using the current stock gauge
- Less confusing - you just focus on your new design

**If you want different behavior,** say so:
```
My animated element is called "needle".
Change the angle range to -90° to +90° instead of the original range.
```

**Special case - iterating on your own custom code:**
If you've already made a custom gauge and want to apply it to a new design, then upload your working SVG file:
```
I'm updating my custom battery gauge design.

[upload examples/svg-dashboard-helper-SKILL.md]
[upload my-old-working-battery.svg]
[upload my-new-battery-design.svg]

Please apply the animation code from my old file to my new design.
```

## Step 4: Test Your Animated SVG

Claude will give you a new SVG file with animation code embedded inside.

**To test it:**
1. Download the SVG file Claude created
2. Double-click it (or drag it into Chrome/Firefox/Safari)
3. Watch it animate automatically! 🎉

The SVG has **built-in test mode** - it will oscillate between 0-100 automatically so you can see how it looks.

**Check the browser console** (Right-click → Inspect → Console) to see debugging info.

## Step 5: Iterate and Refine

Don't expect perfection on the first try! Most animations take 2-5 rounds.

### If the animation looks wrong:

Upload your animated SVG back to Claude and say:
- "The needle goes backwards"
- "The rotation is too fast"
- "The needle should start pointing up, not left"
- "The range is wrong - it should go from -180° to +180°"

Claude will fix just that part while keeping everything else working.

### If you changed your design in Figma:

**Option 1: Use the SVG Code Merger** (easiest!)
1. Open `examples/svg-code-merger.html` in your browser
2. Drag your NEW SVG (from Figma) into slot 1
3. Drag your OLD SVG (with working animation) into slot 2
4. Click "Merge Code Into New SVG"
5. Download and test!

**Option 2: Ask Claude to merge**
1. Upload your OLD SVG (with working code)
2. Upload your NEW SVG (fresh from Figma)
3. Say: "Please apply the animation code from the old file to my new design"

## Understanding the Code (Optional)

When you open your animated SVG in a text editor, you'll see these important boundary markers:

```javascript
// ========================================
// STUDENT EDIT ZONE
// This section controls how the gauge displays
// ========================================

   ... your animation code here ...

// ========================================
// END STUDENT EDIT ZONE
// ========================================
```

**This is where the magic happens!** These boundary markers are your visual guide:
- Everything **between** these markers is yours to modify safely
- Change the angle ranges, adjust colors, modify formulas
- These markers will be preserved in every iteration
- Everything **outside** this zone handles the plumbing (localStorage, test mode, etc.) - don't touch that unless you know what you're doing!

**Important:** These boundary comment lines are deliberately visual (with lots of `=` signs) so they're easy to spot in your code editor.

## How It Works in Your Dashboard

Your animated SVG reads data from your dashboard using `localStorage`:

**In your dashboard JavaScript:**
```javascript
// Set the battery level (0-100)
localStorage.setItem('battery', 75);
```

**In your SVG (battery.svg):**
```javascript
// Reads 'battery' from localStorage automatically
// Animates to show 75%
```

The SVG detects its own filename and uses it as the localStorage key. No configuration needed!

## Common Questions

### Q: Do I need to know JavaScript?
**A:** Nope! Just describe what you want and Claude will write the code. You'll learn by seeing the patterns.

### Q: What if I don't see any animation?
**A:**
- Make sure you're opening the SVG in a web browser (not an image viewer)
- Check the browser console for error messages
- Verify the element name in your SVG matches what Claude is trying to animate

### Q: Can I animate multiple things?
**A:** Yes! Tell Claude what each element should do. Example: "Rotate the needle and change the background color from blue to red"

### Q: What if the rotation point is wrong?
**A:** Tell Claude: "The needle should rotate around its left end, not its center"

### Q: Why is my SVG not working in my dashboard?
**A:**
- Make sure your dashboard sets the localStorage value
- Use `<object>` or `<embed>` tags in your HTML, NOT `<img>`
- Check that the localStorage key matches the filename

## Example Prompts That Work Well

**Replacing a stock gauge (most common - simplest workflow):**
```
I'm redesigning the battery gauge for my submarine dashboard, as part of my design class.
The project is here:
https://github.com/steveturbek/Tangible-Interfaces-Submarine-Design-Project/tree/main

[upload examples/svg-dashboard-helper-SKILL.md]
[upload my-battery-redesign.svg]

Please fetch the stock battery gauge from the instruments/ folder and apply
the same animation behavior to my new design.

My animated element is called "battery_needle".
Keep the same behavior as the original.
```

**Replacing with a different animation style:**
```
I'm redesigning the speed gauge for my submarine dashboard, as part of my design class.
The project is here:
https://github.com/steveturbek/Tangible-Interfaces-Submarine-Design-Project/tree/main

[upload examples/svg-dashboard-helper-SKILL.md]
[upload my-speed-redesign.svg]

Please look at the stock speed gauge in the instruments/ folder to understand
the data range and localStorage key, but instead of rotating a needle, I want
to fill a bar from left to right. The bar element is called "speed_bar" and
should fill based on the same 0-100 values that the original gauge uses.
```

**Starting from scratch (no stock gauge reference):**
```
I have a custom temperature indicator SVG.

[upload examples/svg-dashboard-helper-SKILL.md]
[upload my-temp-gauge.svg]

The circle called "temp_indicator" should change color:
- Blue at 0
- Green at 50
- Red at 100
Values range from 0-100.
```

**Multiple animations:**
```
I'm redesigning the battery gauge with extra features, as part of my design class.
The project is here:
https://github.com/steveturbek/Tangible-Interfaces-Submarine-Design-Project/tree/main

[upload examples/svg-dashboard-helper-SKILL.md]
[upload my-battery-redesign.svg]

Please look at the stock battery gauge in the instruments/ folder and copy
the needle rotation behavior, but also add a color change to the arc background:
- Green above 50%
- Yellow between 20-50%
- Red below 20%

The needle is "battery_needle" and the arc is "battery_arc".
```

## Next Steps

1. **Start simple:** Animate just one element first
2. **Test constantly:** Open the SVG in a browser after every change
3. **Iterate:** Describe what's wrong and Claude will fix it
4. **Experiment:** Once one gauge works, try different animation types!

## Tools Reference

- **svg-dashboard-helper-SKILL.md** - The instruction file for Claude
- **svg-code-merger.html** - Tool to merge new designs with working code
- **Your browser console** - Shows debugging info and errors

## Getting Help

If something isn't working:
1. Check the browser console for error messages
2. Upload your SVG to Claude and describe the problem
3. Ask Claude to explain what a specific part of the code does

Remember: Claude is here to help! Be specific about what you want, and don't be afraid to iterate.

---

**Ready to get started?** Open Claude, upload your SVG and the SKILL file, and describe what you want to animate!
