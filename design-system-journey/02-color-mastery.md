# Color Mastery — Color for Systems, Not Decoration

Color is the most misunderstood part of a design system. Most people pick
colors they like and call it a palette. That is decoration, not design.
Color in a system has *work to do*. Every color must earn its place.

---

## The job of color in an interface

Color does exactly three things in a UI system:

1. **Communicates hierarchy** — what is most important right now
2. **Communicates state** — what is interactive, selected, disabled, broken
3. **Communicates brand** — the emotional character of the product

If a color is not doing one of those three jobs, it should not be in your system.

---

## The color roles you must define

Every system needs tokens for these roles, regardless of the actual hues you choose:

### Surface roles (backgrounds)
```
background           The main canvas — almost always the lightest or darkest value
background-subtle    One step off the canvas — for cards, sidebars, inputs
background-muted     Further off — for hover states, tags, secondary panels
background-inverse   Opposite of background — for tooltips, toasts
```

### Text roles
```
text-primary         Highest contrast — headings, body, labels
text-secondary       One step down — subheadings, captions, helpers
text-muted           Lowest readable contrast — placeholders, disabled labels
text-inverse         On dark or colored backgrounds
text-on-accent       On your brand/accent background specifically
```

### Border roles
```
border-default       Standard dividers, input outlines
border-strong        Focused inputs, selected states, separators with weight
border-subtle        Very light dividers, section breaks
```

### Feedback / semantic roles (these are not brand colors)
```
color-success        Confirmation, complete, valid
color-warning        Caution, pending, at-risk
color-danger         Error, destructive action, invalid
color-info           Neutral information, not alarming
```

Each of these needs its own surface, text, and border variant:
```
color-danger-surface    (light red background for error banners)
color-danger-text       (dark enough red for readable error messages)
color-danger-border     (red border for error inputs)
```

### Brand / accent roles
```
color-accent            Your primary brand color, for CTAs, highlights
color-accent-subtle     A very light tint — for hover backgrounds on accent elements
color-accent-text       Accessible version for text on white backgrounds
```

---

## The science you must understand

### Contrast ratio (WCAG)
This is not optional. Contrast ratio is the ratio between a text color and its
background. If it is too low, people cannot read your interface.

Minimum requirements:
- **Normal text (under 18px or non-bold):** 4.5:1
- **Large text (18px+ or 14px bold):** 3:1
- **UI components and icons:** 3:1

AA compliance (4.5:1 for text) is the minimum.
AAA compliance (7:1 for text) is the ideal for body copy.

Tools to measure: [Accessible Colors](https://accessible-colors.com),
[Contrast](https://www.figma.com/community/plugin/748533339900865438) (Figma plugin),
`color-contrast()` in CSS.

You *will* fail this if you pick colors by eye alone. Always check numbers.

### HSL — the color space you should think in
Stop thinking in hex. Think in HSL (Hue, Saturation, Lightness).

```
H — the hue angle on the color wheel (0–360)
S — how vivid vs gray (0% is gray, 100% is pure hue)
L — how light vs dark (0% is black, 100% is white)
```

Why HSL matters for systems:
- You can build a full 10-step scale by only changing L
- You can desaturate a color for disabled states by only changing S
- You can tell at a glance whether two colors will work together
- Consistency becomes mathematical, not accidental

Example — building a neutral scale in HSL:
```
neutral-100: hsl(220, 14%, 96%)
neutral-200: hsl(220, 13%, 91%)
neutral-300: hsl(220, 11%, 82%)
neutral-400: hsl(220,  9%, 68%)
neutral-500: hsl(220,  8%, 56%)
neutral-600: hsl(220,  9%, 46%)
neutral-700: hsl(220, 10%, 37%)
neutral-800: hsl(220, 12%, 27%)
neutral-900: hsl(220, 14%, 18%)
neutral-950: hsl(220, 16%, 10%)
```

Notice: hue stays the same (220), lightness drops steadily, saturation
subtly adjusts. This creates a scale that feels *alive*, not flat.

### Perceived lightness vs actual lightness
Here is something AI always gets wrong: yellow at 50% lightness looks
far brighter than blue at 50% lightness to the human eye.

This is because human vision is most sensitive to green, then red, then blue.
A mathematically equal lightness is not a perceptually equal lightness.

This is why:
- Yellow and lime warning colors need to be darker than you think
- Blue can be lighter than you think and still pass contrast
- Never trust a color just because it looks "right" in isolation

Use the tool **OKLCH** instead of HSL for precision work. OKLCH is a
perceptually uniform color space — equal lightness steps *look* equal.
This is now supported natively in modern CSS:
```css
color: oklch(0.6 0.15 220);
```

---

## Color pairing rules

### The 60-30-10 rule
- 60% of your UI uses your neutral scale (backgrounds, text, borders)
- 30% uses your secondary/supporting palette
- 10% uses your accent/brand color

If your accent appears more than 10% of the time, it stops being accenting.

### Temperature pairing
Warm colors (red, orange, yellow) and cool colors (blue, green, purple)
create natural tension. Use this intentionally:
- Warm accent on cool neutral: energetic, forward
- Cool accent on warm neutral: calm, trustworthy
- Same temperature throughout: harmonious, focused

### Opacity vs separate colors
Instead of creating a new color for every hover state, use opacity layers:
```css
--color-text-primary: hsl(220, 14%, 10%);
/* hover state: same color at 70% opacity */
--color-text-primary-hover: hsl(220, 14%, 10% / 0.7);
```
This scales beautifully and requires far fewer tokens.

---

## Dark mode — the real test of your system

If your color system requires you to change component code for dark mode,
your system is broken. Dark mode should be purely a token swap.

The pattern:
```css
:root {
  --color-background: hsl(0, 0%, 100%);
  --color-text-primary: hsl(220, 14%, 10%);
}

[data-theme="dark"] {
  --color-background: hsl(220, 14%, 10%);
  --color-text-primary: hsl(220, 11%, 92%);
}
```

Every component uses `var(--color-background)`. Dark mode is free.

Dark mode is not just "invert everything." It requires:
- Surfaces get darker but not as dark as true black
- Elevation is shown by *lightening* (dark surfaces get lighter as they stack)
- Saturations often need to decrease slightly
- Some accent colors need separate dark-mode variants for contrast

Build your semantic tokens for both modes from the start.
Do not bolt on dark mode afterward. It is exponentially harder.

---

## What to study

- **"Refactoring UI"** — Chapter 1-3 specifically on color
- **Radix Colors** — study how they built their semantic-ready scales
- **Linear's color system** — one of the best dark-first systems built
- **OKLCH color picker** — oklch.com, understand why it is better than HSL
- **Tailwind palette** — not to copy, but to understand how a 10-step scale works
