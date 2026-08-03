# Space and Layout — The Mathematics of Breathing Room

Space is invisible but it is the most powerful tool in your system.
Users do not consciously notice good spacing. They do notice bad spacing —
it feels "cluttered," "cheap," or "off." They cannot explain why.
You need to be able to explain exactly why.

---

## Space as a language

Space communicates relationships. Elements that are close together are related.
Elements that are far apart are separate. This is called the **Gestalt principle
of proximity** and your entire layout system is built on it.

When two things should feel related, the space between them should be smaller
than the space between them and unrelated things. This sounds obvious.
It is almost never applied consistently without a system.

```
Example:
  [Label]       ← 4px gap ← label and input are related
  [Input field]
  
  ← 24px gap ← input and next field are separate
  
  [Label]
  [Another Input]
```

If you eyeball this, you will be inconsistent. If you have tokens for it,
you will be consistent automatically.

---

## The 4px base grid

Everything in your spacing system should be a multiple of 4px.

Why 4px specifically:
- Screen pixels render cleanly at multiples of 4 on all device pixel ratios
- 4 divides into 8, 12, 16, 24, 32, 64 — all natural breakpoints
- Designers and developers can share the same mental model easily

The full usable scale:
```
4px   — micro spacing (icon-to-label gap, input icon padding)
8px   — tight spacing (inline elements, tight lists)
12px  — small spacing (within a compact component)
16px  — standard spacing (default component padding)
20px  — medium spacing (comfortable component padding)
24px  — generous spacing (card padding, section-within-layout gaps)
32px  — large spacing (between major components in a panel)
40px  — xlarge spacing (between sections in a page)
48px  — 2x-large spacing (generous section separation)
64px  — 3x-large spacing (major layout sections)
80px  — hero spacing
96px  — maximum spacing (very spacious marketing layouts)
```

Never use values that fall outside this scale without a documented reason.

---

## The three types of space

Understanding these three types stops you from using the wrong token in the wrong place.

### 1. Component space (inner)
Space *inside* a component. Padding between content and its container border.

```
button padding:        8px 16px   (vertical: space-2, horizontal: space-4)
input padding:         8px 12px   
card padding:          24px       (space-6)
modal padding:         32px       (space-8)
table cell padding:    12px 16px  
```

Rule: Component space scales with the size variant of the component.
A "small" button has less padding than a "default" button, which has less than "large."

### 2. Component space (between)
Space *between* components of the same type within a container.

```
form field gap:        16px   (space-4)
list item gap:         8px    (space-2)
button group gap:      8px    (space-2)
card grid gap:         24px   (space-6)
```

Rule: Sibling spacing should be consistent within any given context.
All form fields have the same gap. All cards in a grid have the same gap.

### 3. Layout space
Space between major sections, sidebars, headers, and content areas.

```
page horizontal padding:   24px–64px depending on viewport
sidebar width:             240px–280px (not a spacing token, a layout token)
section vertical gap:      48px–96px
header height:             56px–64px
content max-width:         720px (reading), 1200px (layout), 1440px (wide)
```

Rule: Layout space is bigger than component space. If your section gap equals
your card padding, your hierarchy collapses.

---

## Semantic spacing tokens

Do not use raw scale values in components. Use semantic tokens that explain intent.

```
space-component-padding-sm:     8px
space-component-padding-md:    16px     ← default
space-component-padding-lg:    24px

space-component-gap-sm:         4px
space-component-gap-md:         8px     ← default between inline elements
space-component-gap-lg:        12px

space-layout-inline-gap:       16px     ← between horizontal layout pieces
space-layout-stack-gap:        24px     ← between vertical layout pieces
space-layout-section:          64px     ← between major page sections
space-layout-page-padding:     32px     ← page horizontal margin
```

---

## Layout primitives — build these before any real pages

Instead of building layouts ad hoc, create a small set of layout primitives
that all your pages compose from. These are not visual components — they
are invisible structure components.

### Stack
Arranges children vertically with consistent gap.
```tsx
<Stack gap="md">
  <Component />
  <Component />
  <Component />
</Stack>
```

### Inline
Arranges children horizontally with consistent gap and wrapping.
```tsx
<Inline gap="sm" align="center">
  <Badge />
  <Badge />
  <Badge />
</Inline>
```

### Grid
A column grid for layout.
```tsx
<Grid columns={3} gap="lg">
  <Card />
  <Card />
  <Card />
</Grid>
```

### Container
Controls max-width and horizontal padding.
```tsx
<Container size="content"> ← 720px max
<Container size="layout">  ← 1200px max
<Container size="wide">    ← 1440px max
```

### Spacer
An explicit gap when you need to push something down/right with intent.
(Use sparingly — the other primitives should handle most cases.)

---

## Responsive space — how spacing changes at different viewports

Space should breathe more on larger screens and compress on smaller ones.

A practical approach — multiply or divide by a factor per breakpoint:

```
Mobile  (< 640px):    section gap = 40px, page padding = 16px
Tablet  (640–1024px): section gap = 56px, page padding = 24px
Desktop (> 1024px):   section gap = 80px, page padding = 40px
```

This is called **fluid typography and spacing** when done with CSS clamp():
```css
--space-section: clamp(40px, 6vw, 80px);
--space-page-padding: clamp(16px, 3vw, 40px);
```

CSS `clamp(min, preferred, max)` gives you smooth scaling without breakpoint jumps.
This is the modern approach. Learn it.

---

## The layout tests you must run

1. **The content-too-long test** — what happens when a text is twice as long as expected?
2. **The empty state test** — what does a component look like with no content at all?
3. **The small screen test** — does your layout survive at 320px width?
4. **The density test** — place 20 items in a list. Does the spacing hold up?
5. **The zoom test** — zoom to 200% in the browser. Does anything break?

If you cannot answer "yes, it handles this" to all five — your layout system
needs more work.
