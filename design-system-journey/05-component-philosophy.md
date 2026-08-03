# Component Philosophy — Building Things That Last

Most design systems fail at the component layer. Not because the components
look bad, but because they were built without a philosophy. They accumulate.
They contradict each other. They each solve the same problem in different ways.
This file is about how to think before you build.

---

## The atomic model — the best mental framework

Think of your design system as chemistry:

```
Tokens        — atoms (the indivisible values: color, space, type)
Primitives    — molecules (one HTML element + tokens: Button, Input, Label)
Compositions  — organisms (primitives assembled: FormField, SearchBar, Card)
Patterns      — templates (organisms assembled: LoginForm, ProductCard, DataTable)
```

Build strictly in this order. A pattern should never hard-code a value.
A composition should never invent its own spacing. Everything flows up
from tokens.

When you find yourself hard-coding a value inside a component,
stop and ask: "should this be a token?" Almost always, yes.

---

## The component contract

Every component in your system must answer these four questions before you
build it. Write the answers down. This is your component contract.

### 1. What is the single purpose of this component?
A component that tries to do two things usually does both badly.
"Button" displays a clickable affordance and triggers an action.
That is one purpose. A "ButtonWithDropdown" is two components assembled,
not one new component.

### 2. What are its variants?
Variants change the visual appearance for different use-cases.
They share the same structure but different token values.

```
Button variants:
  intent:   primary | secondary | ghost | danger | link
  size:     sm | md | lg
  state:    default | hover | active | disabled | loading
```

Do not create variants by guessing. Create them when a real use case demands it.
Every variant you add must be maintained forever. Fewer variants = healthier system.

### 3. What are its states?
Every interactive component has states. Missing a state is a bug.
```
default      — the component at rest
hover        — mouse over it (pointer devices)
focus        — keyboard focus (always visible, always high contrast)
active       — being clicked/pressed
disabled     — not interactive
loading      — async operation pending
error        — something went wrong
empty        — no content to display
```

If you build a button and skip the focus state, your system fails accessibility.
Non-negotiable.

### 4. What does it NOT do?
Constraints are as important as capabilities. A good component has
a narrow, clear scope. Document what it does not handle explicitly.

```
Button does NOT:
  - Handle navigation (use Link for that)
  - Display more than one line of text
  - Know about the context it sits in
```

---

## The API design problem

The way you expose a component's API (its props, in React terms) is permanent
once other code depends on it. Design it carefully the first time.

### Composition over configuration
Prefer composable components over monolithic ones.

BAD approach (monolithic, hard to extend):
```tsx
<Card
  title="Hello"
  subtitle="World"
  image="/hero.jpg"
  badgeText="New"
  badgeColor="green"
  buttonText="Get started"
  buttonHref="/start"
/>
```

GOOD approach (composable, flexible):
```tsx
<Card>
  <Card.Header>
    <Badge>New</Badge>
  </Card.Header>
  <Card.Body>
    <Heading>Hello</Heading>
    <Text>World</Text>
  </Card.Body>
  <Card.Footer>
    <Button asChild><a href="/start">Get started</a></Button>
  </Card.Footer>
</Card>
```

The second version is more code to write once, but infinitely more flexible.
You will never need a `Card.titleBold` prop. You just use `<Heading weight="bold">`.

### Polymorphic components (the `asChild` or `as` pattern)
A Button should look like a button but sometimes it needs to be a link.
A Heading should look like a heading but should output the right HTML tag.

```tsx
<Button asChild>
  <a href="/about">Learn more</a>
</Button>

<Heading as="h3">Section Title</Heading>
```

This separates **visual style** from **HTML semantics** — a critical distinction
for accessibility and SEO.

### Forward refs and accessibility
Every component must:
- Forward refs so parents can access the underlying DOM element
- Accept and pass through `className` for escape hatch styling
- Accept and pass through all native HTML attributes (`aria-*`, `data-*`, `id`, etc.)
- Never override or strip `aria-label` or `role` that a user provides

---

## The five components you must build first

These are your proof of concept. If you can build all five well, your system
is real. If you struggle with any of them, your foundation (tokens) is incomplete.

### 1. Button
The most used, most varied, most tested component.
You need: 3 intents (primary, secondary, ghost), 3 sizes, all states, loading state,
icon support (leading and trailing), icon-only variant, asChild support.

### 2. Input + Label + HelperText
These three always appear together. Build them as a system, not separately.
You need: default, focus, error, disabled, with left icon, with right element (clear button).
The FormField composition wraps all three.

### 3. Badge / Tag
Small, simple, deceptively instructive. Forces you to think about:
- How color tokens work on colored backgrounds
- How type tokens work at small sizes
- Removable vs static variants
- Icon inside a badge

### 4. Card
The layout workhorse. Forces you to think about:
- Composition pattern (header / body / footer)
- Border vs shadow for elevation
- Interactive vs static variants
- How content overflow behaves

### 5. Modal / Dialog
The most complex primitive. Forces you to think about:
- Focus trapping (accessibility requirement)
- Scroll lock
- Animation (open/close transitions)
- z-index management
- Mobile behavior (full-screen bottom sheet)

---

## Accessibility is not a feature — it is a requirement

Your system must be accessible by default. Every component.
This is not optional. This is the law in many countries and the right thing
everywhere.

The five things that must always work:

1. **Keyboard navigation** — Tab moves through interactive elements in logical order.
   Enter/Space activates them. Escape closes overlays.

2. **Focus visibility** — Focus ring must be clearly visible. Never `outline: none`
   without a replacement. Use `focus-visible` to show it only for keyboard users.

3. **Screen reader support** — Semantic HTML first. ARIA only when HTML cannot
   express the meaning. Every interactive element needs an accessible label.
   Images need alt text. Icons need sr-only labels if they have meaning.

4. **Color contrast** — All text must pass WCAG AA (4.5:1 for normal, 3:1 for large).
   Never convey information by color alone (also show it in shape, text, or icon).

5. **Motion safety** — Provide reduced motion versions of all animations.
   ```css
   @media (prefers-reduced-motion: reduce) {
     * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
   }
   ```

---

## What not to build yet

Resist building these until your foundation is solid:
- Data tables (complex, expensive, easy to get wrong)
- Date pickers (very complex, accessibility nightmare)
- Rich text editors
- Charts / visualizations
- Drag and drop

These are high-difficulty components that require a mature foundation.
Build them last, or reach for a well-built accessible library (Radix UI,
React Aria, etc.) and style them to fit your tokens.

---

## Component documentation template

For every component, maintain this record:

```markdown
## [Component Name]

**Purpose:** one sentence

**When to use:** list 2-3 clear use cases
**When NOT to use:** list 2-3 anti-patterns

**Variants:** primary, secondary, ghost...
**Sizes:** sm, md, lg
**States:** default, hover, focus, disabled, loading, error

**Props API:**
  - intent: "primary" | "secondary" | "ghost" | "danger"
  - size: "sm" | "md" | "lg"
  - disabled: boolean
  - loading: boolean
  - asChild: boolean

**Accessibility:**
  - What ARIA attributes does it use?
  - What keyboard behavior does it support?

**Do:** show a correct usage example
**Don't:** show a wrong usage example with explanation

**Token dependencies:**
  - Which tokens does this component use?
```

This documentation is the system. Without it, you have a component library.
With it, you have a design system.
