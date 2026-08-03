# Typography Mastery — The Backbone of Every Interface

Typography is not decoration. In a great design system, type does 80% of
the visual heavy lifting. Get typography right and you can be surprisingly
minimal with everything else.

---

## Why typography is the hardest part

Color can be changed in a day. Spacing can be adjusted in an afternoon.
Typography, if chosen badly, requires redesigning everything that uses it —
every heading, every body block, every label. Pick your typefaces *slowly*.

The most common mistake: picking fonts because they look beautiful in isolation.
The right question is: how does this typeface behave at 12px in a table cell?
At 48px in a hero? In a disabled input label? Typography is a working material,
not a decoration.

---

## The anatomy of type in a system

### Type families
Limit yourself to 2 typefaces maximum. You do not need more.

```
--font-sans:   for UI, body, labels, interfaces
--font-serif:  for editorial, marketing, display (optional)
--font-mono:   for code, data, technical content
```

Most systems only need one family (`--font-sans`) and use `--font-mono`
for code. Adding a serif is a brand decision, not a functional one.

### The properties you must control
Every type token is a combination of these properties:

```
font-family    which typeface
font-size      how big
line-height    vertical rhythm
font-weight    how bold
letter-spacing tracking — the space between letters
```

A typographic style is all five working together. Never set just one.

---

## Building your type scale

### Step 1 — Pick your base size
Your base size is the font-size you read most. For interfaces: **14px or 16px**.
16px is the browser default and requires no adjustment. 14px feels more
"tool-like" and compact (think Linear, Figma, VS Code).

### Step 2 — Build the scale with a ratio
Use the Major Third (1.25) or Perfect Fourth (1.333) ratio.

Base: 16px, Ratio: 1.25
```
xs:    10px   (0.625rem)  — small labels, timestamps, captions
sm:    12px   (0.75rem)   — secondary labels, badges
base:  14px   (0.875rem)  — body text (we prefer 14 over 16 for UI)
md:    16px   (1rem)      — slightly prominent body, sub-headings
lg:    20px   (1.25rem)   — card titles, section headings
xl:    24px   (1.5rem)    — page headings
2xl:   30px   (1.875rem)  — major headings
3xl:   38px   (2.375rem)  — display, hero
4xl:   48px   (3rem)      — very large display
```

You likely only use 5-6 steps regularly. Define all of them but restrain yourself.

### Step 3 — Assign line-heights
Line-height is the most ignored property and the most felt when wrong.

```
leading-none:    1       (headings at very large sizes, display text)
leading-tight:   1.2     (headings, titles — anything above 24px)
leading-snug:    1.35    (subheadings, UI labels)
leading-normal:  1.5     (body text, the comfortable default)
leading-relaxed: 1.65    (long-form reading, documentation)
leading-loose:   2       (rarely needed, spacious lists)
```

Rule of thumb: the larger the font, the tighter the line-height.
The smaller the font and the longer the line, the more generous the line-height.

### Step 4 — Assign weights
You typically only need 3-4 weights:
```
font-weight-regular:   400   (body, labels, most UI)
font-weight-medium:    500   (slightly emphasized labels, nav)
font-weight-semibold:  600   (headings, strong emphasis, buttons)
font-weight-bold:      700   (display, marketing, strong CTAs)
```

Avoid 300 (light) in interfaces — it reads as weak and fails contrast on
subpixel-rendered screens. Avoid 800+ unless it is a display-only context.

### Step 5 — Assign letter-spacing (tracking)
```
tracking-tight:  -0.02em   (large headings — they have too much space by default)
tracking-normal:  0        (body text)
tracking-wide:    0.05em   (uppercase labels, badges, small caps)
tracking-wider:   0.1em    (very small uppercase labels)
```

IMPORTANT: Never apply letter-spacing to body text. It reduces readability.
Letter-spacing is for display and labels only.

---

## Semantic type tokens — the roles

Just like color, type needs semantic roles. These are the tokens your
components actually use:

```
text-display-lg      Largest hero text, marketing
text-display-md      Secondary display
text-heading-xl      Page titles (h1)
text-heading-lg      Section titles (h2)
text-heading-md      Sub-section (h3)
text-heading-sm      Card titles, panel headings (h4)
text-body-lg         Lead body text, introductions
text-body-md         Standard body text
text-body-sm         Secondary body, captions
text-label-lg        Button text, nav items
text-label-md        Form labels, tags
text-label-sm        Small labels, timestamps
text-code            Inline code, technical strings
text-mono-table      Numeric data in tables (tabular-nums)
```

Each token defines all five properties (size, family, weight, line-height,
tracking) — not just the size.

---

## The typographic details that separate good from great

### Optical alignment
Certain characters (O, C, G, round letters) extend slightly past the baseline
to look visually aligned. Great type systems account for this with negative
margin adjustments on headings. Do not ignore it when you see headings that
feel slightly indented.

### Tabular numerals for data
When you show numbers in tables or dashboards, use `font-variant-numeric: tabular-nums`.
This makes all digits the same width so columns align perfectly.
```css
.data-cell {
  font-variant-numeric: tabular-nums;
}
```

### Measure (line length)
The optimal line length for reading is **50-75 characters** (roughly 60ch).
Beyond 75 characters, readers lose their place. Below 40, the eye jumps too
frequently. Use `max-width: 65ch` on your body text containers.

### Vertical rhythm
All vertical spacing in your layout should be a multiple of your base
line-height unit. If your body line-height is 24px, your section gaps
should be 24px, 48px, 72px, 96px — not 20px, 35px, 55px. The eye feels
rhythm even when it cannot name it.

### Kerning
Modern fonts handle kerning automatically, but for display text (headlines 32px+)
always set `font-kerning: normal` and let the browser do its job.
For hand-set display headings in marketing, adjust manually.

---

## Choosing a typeface — what to actually look for

### For UI work (sans-serif)
Look for:
- **Clear legibility at 12px** — test it small before committing
- **Distinct characters** — 1, l, I must be distinguishable (critical for passwords, codes)
- **Multiple weights** — you need at least 400, 500, 600
- **Consistent spacing** — letters should feel evenly paced, not cramped
- **Variable font support** — one file for all weights (performance win)

Excellent choices to study (not to copy blindly):
Inter, Geist, Plus Jakarta Sans, IBM Plex Sans, DM Sans, Instrument Sans

### For editorial (serif)
- **Readable at small sizes** — some serifs fail below 16px
- **Elegant at large sizes** — good for display headings
- **Pairs well with your sans** — choose serifs and sans from similar optical traditions

---

## The test you must run

Before locking your type system, build a test page with:

1. A full paragraph of lorem ipsum at body size
2. A heading hierarchy (h1 through h4)
3. A form with labels, inputs, and helper text
4. A data table with numbers
5. A navigation bar
6. A button

If any of these feel wrong — too heavy, too light, uneven spacing, hard to
scan — your type system needs adjustment. Fix it at the token level, not
by overriding individual components.
