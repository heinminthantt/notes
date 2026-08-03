# Documentation Discipline — Writing Is Designing

Most design systems die not because the components are bad, but because
no one remembers why decisions were made. Six months later, someone (probably
you) will look at a token called `color-surface-overlay` and have no idea
whether it is for modals, tooltips, or dropdowns. Without documentation,
your system is just code waiting to be misused.

Documentation is not something you write after the system is done.
It is how you design. The act of writing forces you to confront decisions
you have been avoiding.

---

## What must be documented (non-negotiable)

### 1. The decision log
For every non-obvious decision, write down:
- What decision was made
- Why this option was chosen over others
- What you considered and rejected
- What would cause you to revisit this

Example:
```markdown
## Decision: 4px base grid over 8px

**Date:** 2024-03
**Decision:** Use 4px as the spacing base unit.

**Why 4px over 8px:**
8px is more common but too coarse for compact UI. We need 4px and 12px
frequently (icon gaps, input height adjustments) which 8px cannot express
cleanly. 4px gives full coverage with no magic numbers.

**What we rejected:**
- 8px: too few intermediate steps
- 5px: does not divide cleanly into common breakpoints
- rem-based only: harder to reason about without a calculator

**Revisit when:** If we move to a purely touch-focused product where compact
spacing is less important.
```

### 2. The usage guide for every token
Every semantic token needs at minimum:
- What it is for
- What it should not be used for
- An example

```markdown
### color-background-subtle

**Use for:** Second-level surfaces — cards, inputs, sidebars, hover states
**Do not use for:** Main page backgrounds (use color-background-default)
**Do not use for:** Text (this is a background color)

Example:
  Card background: ✓ color-background-subtle
  Page background: ✗ use color-background-default
  Hovered list item: ✓ color-background-subtle
```

### 3. The component guide
Each component needs:
- What it is (one sentence)
- When to use it (with examples)
- When NOT to use it (anti-patterns)
- All variants with visual examples
- All states shown
- Accessibility notes
- Related components

### 4. The principles document
One page, maximum. What does your system believe?
Write 5-8 principles that guide every decision. When two paths are
available, your principles should tell you which to take.

Example principles:
```
1. Clarity over cleverness — if it needs explanation, simplify it
2. Defaults that work — every component should be useful with zero props
3. Accessible by default — no accessibility add-ons, accessibility is the design
4. Fewer options, better outcomes — restrict the API to prevent wrong usage
5. Tokens over overrides — extend through the token system, not one-off CSS
```

---

## Documentation as design process

Here is a practice that forces better design thinking:

**Write the documentation before you build the component.**

1. Write "what is this component for?"
2. Write "what are its variants?"
3. Write "what states does it need?"
4. Write "what should it NOT do?"
5. Write "what does a developer need to know?"

If you cannot write this clearly, you do not understand the component well
enough to build it. This is the most underrated technique in design systems.

It also prevents "API regret" — the situation where you build something,
ship it, then realize the props are named wrong or the composition is wrong.
You cannot easily change an API after others depend on it.

---

## The documentation site

Your system needs a living documentation site. This is not optional.

Minimum requirements:
- Searchable
- Shows every token with its value and purpose
- Shows every component with interactive examples
- Shows every component's states and variants
- Shows do/don't examples side by side
- Has a version history (what changed between versions)

Tools to consider:
- **Storybook** — industry standard, excellent for component isolation
- **Docusaurus** — documentation-first, great for written guides + component demos
- **Astro** — very flexible, good for custom documentation sites
- **Your own Next.js site** — full control, requires more setup

For a personal system: a simple Next.js or Astro site is enough.
For a team system: Storybook is the standard and worth learning.

---

## Versioning and changelogs

Your system will change. Plan for it now.

Use semantic versioning: `MAJOR.MINOR.PATCH`

```
PATCH (1.0.0 → 1.0.1)  — Bug fixes, typo corrections, no API changes
MINOR (1.0.0 → 1.1.0)  — New tokens or components added, backwards compatible
MAJOR (1.0.0 → 2.0.0)  — Breaking changes: renamed tokens, removed components,
                          changed APIs
```

For every release, write a changelog entry:

```markdown
## v1.2.0 — 2024-04-15

### Added
- `color-surface-overlay` token for modal/drawer backgrounds
- `Badge` component with size and intent variants

### Changed
- `space-layout-section` value increased from 48px to 64px for better breathing room
- `Button` focus ring now uses `focus-visible` instead of `focus`

### Fixed
- `Input` disabled state was not applying correct text color

### Migration
- `space-section-gap` has been renamed to `space-layout-section` — find/replace
```

---

## The maintenance mindset

A design system is never "done." It is a living thing that must be:
- **Audited regularly** — are all components still being used? Any drift from tokens?
- **Updated with the product** — as the product evolves, the system must follow
- **Pruned** — remove components no one uses, they create maintenance debt
- **Tested** — visual regression tests, accessibility audits, cross-browser checks

Plan for at least one "system health" review every quarter.
Ask: what is not working? What is being misused? What is missing?

---

## The hardest part of documentation

The hardest part is writing down why you made a decision that you thought
was obvious. Future you does not have the context current you has.
Write it down anyway. The more obvious it seems now, the more important
it is to document — because it will not be obvious later.

> "Any organization that designs a system will produce a design whose
> structure is a copy of the organization's communication structure."
> — Conway's Law

Your design system is a communication tool as much as a code tool.
Document it like you are communicating with someone who was not in the room
when you made the decisions.
