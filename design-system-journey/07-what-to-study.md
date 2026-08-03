# What to Study — Real Resources for Real Understanding

This is not a list of tutorials. This is a curated reading list of things
that will genuinely change how you think. Read them slowly. Read them twice.

---

## Books (read these in order)

### 1. Refactoring UI — Adam Wathan & Steve Schoger
The single most important practical book on UI design for developers.
Dense with actual techniques. Not theory — real decisions with before/after.

Focus chapters: Color, Typography, Spacing, and "Working with Shadows."
You will reference this book for years.

### 2. The Design of Everyday Things — Don Norman
Not about digital design specifically. About how humans understand objects
and systems. The concepts of affordance, feedback, mapping, and mental models
apply directly to every component you will ever build.

Read this to understand *why* buttons look like buttons.

### 3. Elements of Typographic Style — Robert Bringhurst
The bible of typography. Dense and precise. You do not need to read it
cover to cover — read Chapters 1-4 and Chapter 8 deeply.
You will understand line-height, measure, kerning, and scale at a level
no tutorial can give you.

### 4. Grid Systems in Graphic Design — Josef Müller-Brockmann
A thin book. Every page is a masterclass in spatial thinking.
This is where the 4px grid and the 8px grid come from — centuries of
print design distilled. It will change how you see every layout you encounter.

---

## Design Systems to Study (not to copy)

Read their documentation. Understand their decisions. Ask "why did they do it
this way?" for every choice.

### Radix Themes (radix-ui.com/themes)
One of the best-engineered token systems available. Study:
- Their color scale approach (10 steps, semantic meaning built in)
- How their semantic tokens map to primitive tokens
- Their spacing and sizing approach
- The relationship between their design and code

### Linear's Design System
Not publicly documented, but you can inspect it. Linear is the gold standard
for dense, data-rich interface design. Every spacing choice is deliberate.
Study their use of whitespace in a compact product.

### IBM Carbon Design System (carbondesignsystem.com)
Extremely well documented. Read their philosophy, principles, and motion guides
even if you never use Carbon. Their motion and accessibility documentation
is exceptional.

### Atlassian Design System (atlassian.design)
Excellent component documentation. Particularly study their "do / don't"
sections — each one is a lesson in how components get misused.

### Vercel's Design Language
Study vercel.com, v0.dev, and the Vercel dashboard. Ultra-minimal, high
information density, excellent use of hierarchy. Notice:
- How they use gray to create depth
- How typography alone separates sections
- How interactive states are communicated

### Apple Human Interface Guidelines (developer.apple.com/design)
The most comprehensive free resource on human interface design.
Do not read it as "how to build Apple things." Read it as "how humans
perceive and interact with interfaces." Their sections on:
- Feedback and affordance
- Typography and readability
- Navigation patterns
...are universal.

---

## Concepts to master (with resources)

### CSS Custom Properties (design tokens in CSS)
```
MDN: CSS Custom Properties (Variables)
Article: "A Complete Guide to Custom Properties" — CSS Tricks
```
You cannot build a real token system without deep knowledge of CSS variables.
Understand: inheritance, fallbacks, computed values, scope.

### CSS Grid and Flexbox
```
"Grid by Example" — Rachel Andrew (gridbyexample.com)
"A Complete Guide to Flexbox" — CSS Tricks
"A Complete Guide to Grid" — CSS Tricks
```
Layout primitives are built on these. Know them inside out.
Understand when to use which. (Short answer: flexbox for one direction,
grid for two directions. Reality is more nuanced — learn the nuance.)

### CSS clamp() and fluid design
```
"Fluid Typography" — CSS Tricks
"Modern Fluid Typography" — Smashing Magazine
Tool: utopia.fyi (generates fluid type and space scales)
```
The future of responsive design is fluid, not stepped breakpoints.
`clamp(min, preferred, max)` is one of the most powerful modern CSS tools.

### OKLCH and modern color in CSS
```
"OKLCH in CSS" — Evil Martians blog
Tool: oklch.com
```
The browser now supports `oklch()` natively. It is perceptually uniform
and better than HSL for building consistent color scales.

### Accessibility fundamentals
```
"Inclusive Components" — Heydon Pickering (free online at inclusive-components.design)
"WebAIM Contrast Checker" — contrast checker + education
"The A11y Project" — a11yproject.com (practical checklist)
```
Read Heydon Pickering's Inclusive Components in full. Every chapter is a
masterclass in building a common component accessibly. This will permanently
change how you think about Button, Modal, Accordion, Cards, and more.

### Motion and animation
```
"Designing Interface Animation" — Val Head
"The Illusion of Life" — Disney's 12 principles of animation
```
Motion is a token system too. You need: duration scale, easing library,
and a philosophy about when motion is appropriate.
Core principle: motion should communicate meaning, not decorate.

---

## Tools to learn properly

### Figma (design side)
- Variables and tokens (the new system, not the old styles)
- Auto layout (flexbox in Figma)
- Component properties and variants
- Design documentation using sections and annotations

### Storybook (development side)
- Addon: Accessibility (a11y)
- Addon: Chromatic (visual regression testing)
- Args and controls for interactive component exploration
- How to write meaningful stories (not just "default")

---

## The one habit that separates great systems builders

**Inspect everything.**

When you use a product that feels good — stop and ask why.
Open DevTools. Look at the actual values. What font size? What line-height?
What color? What spacing? What transition?

When you find something that feels off — ask why that too.
Is the contrast too low? Is the spacing inconsistent? Is the font too heavy?

Do this for 15 minutes a day for a month. You will develop taste — the
ability to feel what is right before you can articulate it. Then you
learn to articulate it, and that is when the system writing comes easily.

---

## A reading order recommendation

If you read one thing per week:

```
Week 1-2:  Refactoring UI (full)
Week 3:    Apple HIG — Inputs, Buttons, Navigation
Week 4:    Radix UI docs — Color system section
Week 5:    Atlassian Design System — Foundations
Week 6:    Inclusive Components — Button, Cards, Menus (Heydon Pickering)
Week 7:    Elements of Typographic Style — Chapters 1-4
Week 8:    IBM Carbon — Motion guidelines + Accessibility

From week 9 onward: build while reading.
Every chapter becomes a feature in your system.
```

---

## What NOT to study (the traps)

- **Do not study too many design systems at once.** One deep study is worth
  ten shallow ones. Pick one (Radix is the best for tokens), go deep.

- **Do not study "UI inspiration" sites as design education.** Dribbble and
  Behance are portfolios, not education. They show you what things look like,
  not why they work. You need the why.

- **Do not let AI generate your foundations.** Use AI to generate boilerplate,
  documentation drafts, or to ask "explain this concept." Never let AI decide
  your token names, your color palette, or your component API. Those decisions
  are the system. If AI makes them, you do not have a system — you have AI output.
