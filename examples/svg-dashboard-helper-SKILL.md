# SVG Dashboard Animation Skill

## Purpose

Help beginner UX design students animate SVG dashboard elements using JavaScript. Students export SVGs from Figma/Illustrator and need self-contained, portable animations that work in dashboard projects.

## Target Users

- Beginner UX design students
- Limited coding experience
- Need clear, working examples
- Will iterate multiple times

## Student Prompting Guide

### How to Describe What You Want

**Be specific about:**

- "The needle should rotate from pointing left to pointing right"
- "The bar should fill from bottom to top"
- "The indicator should turn red when above 80"

**Not just:**

- "Make it move"
- "Animate it"

**Name your elements in Figma/Illustrator:**

- If you want a needle to move, name the layer "needle"
- If you want multiple parts, use clear names: "hour_hand", "minute_hand"
- These names become IDs in the code - this helps AI understand what you mean
- Bad names: "Rectangle 47", "Group 3"
- Good names: "speed_needle", "temp_bar", "warning_light"

### Iteration Workflow

**Iterations are expected and normal.** Most animations require 2-5 rounds of refinement.

**For code iterations** (behavior changes, no design changes):

- Upload your current SVG with embedded JavaScript
- Describe what needs to change: "needle goes backwards" or "too slow"
- Claude will revise the code in the STUDENT EDIT ZONE while preserving the framework

**For design iterations** (you changed the visual design in Figma):

- **Option 1: Use the SVG Code Merger tool** (easiest)

  - Open [examples/svg-code-merger.html](examples/svg-code-merger.html) in your browser
  - Drag your NEW SVG (without code) from Figma into slot 1
  - Drag your OLD SVG (with working code) into slot 2
  - Click "Merge Code Into New SVG"
  - Download the merged result
  - Test it by opening directly in browser (it will auto-oscillate)

- **Option 2: Ask Claude to merge**
  - Upload TWO files:
    1. **Old SVG with working code** - has the JavaScript that mostly works
    2. **New SVG without code** - your updated design from Figma
  - Say: "I'm iterating - please apply the working code from file 1 to the new design in file 2"
  - Claude will extract the working logic and map it to your new element structure

**If element names changed:**

- Tell Claude: "I renamed 'needle' to 'pointer' in the new design"
- Or: "Same element names as before"

**Testing your SVG:**

- Just open the SVG file directly in a web browser (Chrome, Firefox, Safari)
- It will automatically animate with oscillating test values (0-100)
- Watch the console for debugging info (Right-click > Inspect > Console)

### Starter Prompt Template

**Replacing an existing gauge (MOST COMMON for this project):**

```
I'm redesigning the [speed/battery/depth/etc.] gauge for my submarine dashboard.

[upload SKILL.md file]
[upload the ORIGINAL stock gauge from instruments/ folder, e.g., instruments/speed.svg]
[upload your NEW DESIGN from Figma - no code inside]

Please apply the same animation behavior from the stock gauge to my new design.

My animated element is called "[element name]" in my new SVG.
[Optional: "Keep the same behavior" OR describe any animation changes needed]
```

**If starting completely fresh (less common):**

```
I need to animate a dashboard gauge.

[upload SKILL.md file]
[upload your SVG from Figma/Illustrator]

The animation should:
- [describe what moves/changes]
- [describe the data range, e.g., "values from 0-100"]
- [describe the visual result, e.g., "needle rotates from left to right"]

The element I want to animate is called "[element name]" in my file.
```

**When iterating on behavior (keeping same design):**

```
I'm tweaking the animation behavior.

[upload your current SVG with code]

What needs to change:
- [be specific: "needle goes backwards" or "angle range should be -90° to +90° instead"]
```

**When iterating on design (you updated your Figma design):**

```
I updated my design in Figma and need to apply the working code to the new version.

[upload old SVG with working code]
[upload new SVG from Figma - updated design, no code]

Please merge the animation code into my updated design.
[Tell Claude if element names changed, or say "same element names as before"]
```

## Technical Requirements

### Core Standards

1. **Self-contained SVGs** - All code embedded within the SVG file
2. **localStorage for data** - Read dashboard values from localStorage
3. **Namespace from filename** - Extracts filename from `window.location.pathname`, so `speed.svg` reads from `localStorage.getItem('speed')`
4. **setInterval timing** - Update at 50ms intervals (20 updates/sec for smooth animation)
5. **CDATA wrapper** - Wrap all JavaScript in `<![CDATA[...]]>`
6. **Student Edit Zone** - Clear section where students modify animation logic
7. **Built-in test mode** - Auto-oscillating values (0-100) when localStorage missing

### Code Structure Template

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 256">
  <script type="text/javascript">
  //<![CDATA[

    function updateSVG(instrumentValue){
    // ========================================
    // STUDENT EDIT ZONE
    // This section controls how the gauge displays
    // ========================================

    /**
     * Clear description of what this animation does
     * - Describe the visual effect
     * - Show the data range (e.g., 0% = left, 100% = right)
     * - Explain the formula if applicable
     */

      // Animation logic here
      const element = document.getElementById('animated-element');
      if (!element) {
        console.log('Cannot find element to animate');
        return;
      }

      // Apply transformations based on instrumentValue (0-100)
      // Example: const angle = -180 + instrumentValue * 1.8;
      // element.setAttribute('transform', `rotate(${angle}, cx, cy)`);

    // ========================================
    // END STUDENT EDIT ZONE
    // ========================================
    }

    setInterval(() => {
      // Auto-detect localStorage key from filename
      const thisSVGfilename = window.location.pathname;
      const localStorageName = thisSVGfilename.substring(
        thisSVGfilename.lastIndexOf('/') + 1,
        thisSVGfilename.lastIndexOf('.')
      );
      let instrumentValue = localStorage.getItem(localStorageName);

      if (instrumentValue !== null) {
        // Clamp value between 0 and 100
        instrumentValue = Math.max(0, Math.min(100, instrumentValue));
      } else {
        // Test mode: oscillate between 0-100
        if (typeof window.testValue === 'undefined') {
          window.testValue = 0;
          window.testDirection = 1;
        }
        window.testValue += window.testDirection * 2;
        if (window.testValue >= 100) {
          window.testValue = 100;
          window.testDirection = -1;
        } else if (window.testValue <= 0) {
          window.testValue = 0;
          window.testDirection = 1;
        }
        instrumentValue = window.testValue;
        console.log('No localStorage "'+localStorageName+'", using test value:', instrumentValue);
      }

      updateSVG(instrumentValue);
    }, 50);

  //]]>
  </script>

  <!-- SVG visual elements -->
</svg>
```

## Questions to Ask Students

### Initial Setup

1. **What is the data range?**

   - 0-100 (percentage, like speed, temperature)
   - -100 to +100 (bidirectional, like thrust, balance)
   - Custom range (ask for min/max)

2. **What should animate?**

   - Rotation (needles, gauges)
   - Translation (sliders, indicators)
   - Color (fill changes based on value)
   - Scale (growing/shrinking elements)
   - Opacity (fading elements)
   - Multiple elements

3. **Which elements animate?**

   - Ask student to identify element IDs from their SVG
   - If no IDs exist, explain they need to name layers in Figma/Illustrator
   - Common names: needle, indicator, bar, dial, pointer

4. **Edge cases:**
   - What happens at minimum value?
   - What happens at maximum value?
   - Default value if localStorage empty? (usually midpoint)

### During Iterations

1. **What needs to change?**

   - Visual (color, size) vs behavioral (direction, speed)
   - New design upload vs code revision only

2. **Did design elements change?**
   - If student re-exported from Figma, element IDs may have changed
   - Need to map old code to new structure

## Common Animation Patterns

### Rotation (Gauges, Needles)

```javascript
// Map value to angle range
// Example: 0-100 maps to -45° to +45°
const angle = -45 + numValue * 0.9; // 0.9 = 90°/100
element.setAttribute("transform", `rotate(${angle} 100 100)`);
// Note: 100 100 is rotation origin, adjust to SVG center point
```

### Translation (Sliders, Bars)

```javascript
// Map value to position
// Example: 0-100 maps to y=150 to y=50
const y = 150 - numValue * 1; // 1 = 100px range
element.setAttribute("transform", `translate(0 ${y})`);
```

### Color Interpolation

```javascript
// Example: blue at 0, red at 100
const r = Math.round(numValue * 2.55);
const b = Math.round(255 - numValue * 2.55);
element.setAttribute("fill", `rgb(${r}, 0, ${b})`);
```

### Bidirectional (Thrust Example)

```javascript
// -100 to +100 maps to different positions/angles
// Normalize to 0-1 range
const normalized = (numValue + 100) / 200;
const angle = -90 + normalized * 180; // -90° to +90°
```

## Workflow

### Replacing a Stock Gauge (MOST COMMON for this project)

1. Student uploads SKILL.md, **stock gauge SVG** (e.g., instruments/speed.svg), and their new design
2. **Analyze the stock gauge:**
   - Read the STUDENT EDIT ZONE to understand the animation behavior
   - Note the data range (0-100, -100 to +100, etc.)
   - Identify the element being animated and the transformation type (rotation, translation, etc.)
   - Note the formula/mapping (e.g., `-180 + instrumentValue * 1.8`)
   - Check for any color changes or multi-element animations
   - **This is your reference for what behavior to replicate**
3. **Analyze the new design:**
   - Find the element(s) to animate (student should have named them)
   - Determine rotation/transformation origins (center points, pivot points)
   - Check if the visual layout requires formula adjustments
4. **Apply the behavior:**
   - Copy the animation logic from stock gauge STUDENT EDIT ZONE
   - Adapt element IDs to match new design
   - Adjust rotation origins or positions if needed based on new design geometry
   - Keep the same localStorage key (filename-based detection will handle this)
   - Preserve all the boilerplate (test mode, interval, clamp logic, etc.)
   - Update the comments to describe the new design
5. Generate complete merged SVG with embedded script
6. Student tests by opening in browser

### First Time Animation (Less Common)

1. Student uploads SKILL.md and SVG file
2. Ask clarifying questions (see Questions to Ask Students section)
3. Generate complete merged SVG with embedded script and clear comments
4. Student tests by opening in browser
5. Student iterates and requests changes

### When SVG Contains Existing Code

**Always ask:** "Are you iterating on this animation, or starting fresh?"

**If iterating:**

- Ask what needs to change specifically
- Analyze existing code in STUDENT EDIT ZONE and comments
- Make surgical edits to specific parts
- Preserve: localStorage detection, element IDs, timing, working logic, test mode
- Update comments if intent changed

**If starting fresh:**

- Treat as new animation
- Can reference old code for patterns but don't preserve logic

### Iteration - Code Changes Only

1. Student uploads SVG with embedded script
2. Student describes what's wrong or what to change
3. Read self-prompting comments to understand original intent
4. Make surgical edits
5. Update comments if behavior intent changed
6. Output updated SVG

### Iteration - Design Changes from Figma

1. Student uploads TWO files:
   - Old SVG with working code
   - New SVG with updated design (no code)
2. Extract script and self-prompting comments from old file
3. Ask student if element names stayed the same
4. Map code to new element structure
5. Test and adjust rotation origins or positions if needed
6. Output merged SVG with updated comments

## Testing During Development

### Built-in Test Mode

Every SVG has **automatic test mode** built-in. No external test page needed!

**Testing workflow:**

1. Open your SVG file directly in a web browser
2. The animation automatically starts with oscillating values (0→100→0)
3. Watch the browser console for debugging info
4. Iterate based on visual feedback

**Test mode features:**

- Auto-detects when localStorage is missing
- Oscillates smoothly between 0-100 at 2% per update
- Logs to console: `No localStorage "filename", using test value: 42`
- Updates 20 times per second (50ms intervals) for smooth animation

**Production mode:**

- When deployed in your dashboard project
- SVG reads from localStorage using its filename as the key
- Example: `battery.svg` reads `localStorage.getItem('battery')`
- Your dashboard code sets the value: `localStorage.setItem('battery', 75)`

**No external tools needed** - just open the SVG in any browser to test!

## Common Issues & Solutions

### Element not found

- Check element ID exists in SVG
- Figma/Illustrator may generate random IDs
- Student needs to name layers properly
- Open SVG in text editor to verify IDs

### Animation backwards

- Reverse calculation: `angle = maxAngle - (value * range)`
- Or flip sign: `angle = -45 - (value * 0.9)`
- Use universal test page to verify across full range

### localStorage not found

- Filename became storage key with sanitization
- Console warning shows actual key being used
- Student needs to set value in their dashboard
- Universal test page should work immediately with auto-cycle

### Script doesn't run

- Check CDATA wrapper is correct
- Check for syntax errors (missing brackets, quotes)
- SVG must be loaded as `<object>` or standalone file, not innerHTML
- Universal test page uses `<object>` tag correctly

### Animation only works in test page

- Check that dashboard/project uses `<object>` tag, not `<img>`
- Check that dashboard sets localStorage with correct key
- Verify dashboard's setInterval or update mechanism running

### Wrong range selected on test page

- Student needs to toggle between [0-100] and [-100 to +100]
- Check self-prompting comments in SVG to confirm intended range

## Output Format

Always provide a complete, production-ready SVG file:

### Production SVG ([filename].svg)

Complete, downloadable SVG file with:

- All original SVG elements preserved
- Script embedded in CDATA with proper wrappers
- **STUDENT EDIT ZONE** clearly marked
- Built-in test mode (auto-oscillates when no localStorage)
- Auto-detects localStorage key from filename
- Descriptive comments explaining the animation
- Console logging for debugging
- 50ms update interval for smooth animation

**Testing:**
Students open the SVG directly in any web browser to see it animate automatically.

### Comment Style in STUDENT EDIT ZONE

Include clear, student-friendly comments that explain the animation intent:

```javascript
/**
 * Updates the battery gauge display
 * - The gauge needle (line) rotates to show battery level
 * - 0% = -180 degrees (pointing left, empty)
 * - 50% = -90 degrees (pointing up, half)
 * - 100% = 0 degrees (pointing right, full)
 */

// Calculate rotation angle
// Formula: -180 degrees + (percentage * 1.8)
const angle = -180 + instrumentValue * 1.8;
```

These comments help students understand what's happening AND help Claude understand intent for future iterations.

## Student-Friendly Practices

1. **Use descriptive comments** - explain what each section does
2. **Single responsibility** - one animation per SVG file
3. **Magic numbers explained** - comment why `0.9` or specific angles chosen
4. **Default values** - graceful fallback if localStorage empty
5. **Element ID guidance** - explain how to set IDs in design tools

## Example Complete SVG

**Production file: speed.svg**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 256">
  <defs>
    <style>
      #needle { stroke: #F00; stroke-width: 5px; fill: none; }
      #background { fill: #231f20; }
    </style>
  </defs>

  <!-- Gauge background arc -->
  <path id="background" d="M503.8,256c0-136.9-110.9-247.8-247.8-247.8S8.2,119.1,8.2,256"/>

  <!-- Needle line (student designed this in Figma) -->
  <line id="needle" x1="256" y1="252.9" x2="492.4" y2="252.9"/>

  <!-- Label text -->
  <text x="0" y="40" style="font-family: Arial; font-size: 50px; font-weight: bold; fill: lime;">
    Speed
  </text>

  <script type="text/javascript">
  //<![CDATA[

    function updateSVG(instrumentValue){
    // ========================================
    // STUDENT EDIT ZONE
    // This section controls how the gauge displays
    // ========================================

    /**
     * Updates the speed gauge display
     * - The needle rotates to show speed level
     * - 0% = -180 degrees (pointing left)
     * - 50% = -90 degrees (pointing up)
     * - 100% = 0 degrees (pointing right)
     */

      // Calculate rotation angle
      // Formula: -180 degrees + (percentage * 1.8)
      const angle = -180 + instrumentValue * 1.8;

      // Get the needle element
      const needle = document.getElementById('needle');
      if (!needle) {
        console.log('Cannot find element to animate');
        return;
      }

      // Get the pivot point (start of the line)
      const x1 = parseFloat(needle.getAttribute('x1'));
      const y1 = parseFloat(needle.getAttribute('y1'));

      // Rotate the needle around its pivot point
      needle.setAttribute('transform', `rotate(${angle}, ${x1}, ${y1})`);

    // ========================================
    // END STUDENT EDIT ZONE
    // ========================================
    }

    setInterval(() => {
      // Auto-detect localStorage key from filename
      const thisSVGfilename = window.location.pathname;
      const localStorageName = thisSVGfilename.substring(
        thisSVGfilename.lastIndexOf('/') + 1,
        thisSVGfilename.lastIndexOf('.')
      );
      let instrumentValue = localStorage.getItem(localStorageName);

      if (instrumentValue !== null) {
        // Clamp value between 0 and 100
        instrumentValue = Math.max(0, Math.min(100, instrumentValue));
      } else {
        // Test mode: oscillate between 0-100
        if (typeof window.testValue === 'undefined') {
          window.testValue = 0;
          window.testDirection = 1;
        }
        window.testValue += window.testDirection * 2;
        if (window.testValue >= 100) {
          window.testValue = 100;
          window.testDirection = -1;
        } else if (window.testValue <= 0) {
          window.testValue = 0;
          window.testDirection = 1;
        }
        instrumentValue = window.testValue;
        console.log('No localStorage "'+localStorageName+'", using test value:', instrumentValue);
      }

      updateSVG(instrumentValue);
    }, 50);

  //]]>
  </script>
</svg>
```

**Testing:**
Student opens `speed.svg` directly in Chrome/Firefox/Safari and watches it auto-animate.

## Remember

- Students are visual designers, not programmers
- Iterations are expected and normal
- Code should be readable and self-explanatory with clear STUDENT EDIT ZONE
- Each SVG is a self-contained component with built-in test mode
- Filename → localStorage key is the namespace strategy (auto-detected)
- **Test mode is built into every SVG** - just open it in a browser to see it animate
- STUDENT EDIT ZONE makes it clear what students can safely modify
- SVG Code Merger tool ([examples/svg-code-merger.html](examples/svg-code-merger.html)) helps merge designs and code
