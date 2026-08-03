# Foundation Thinking — Design Tokens Done Right

Design tokens are the DNA of your system. Get them right and everything
downstream is easy. Get them wrong and you spend the rest of your time
fighting yourself.

---

## What a token actually is

A token is a named variable that stores a design decision.

```
Token = Name + Value + Context
```

The value is the obvious part (`#0f172a`, `16px`, `400ms`).
The name and context are where most people fail.

A token without context is just a variable. A token *with* context tells
every future designer or developer: "use me here, not there."

---

## The three tiers you must understand

### Tier 1 — Primitive tokens (raw palette)
These are your raw values. They have no semantic meaning yet.
They are just the full range of what is possible.

```
color-slate-100: #f1f5f9
color-slate-200: #e2e8f0
color-slate-900: #0f172a

font-size-12: 0.75rem
font-size-14: 0.875rem
font-size-16: 1rem

space-1: 4px
space-2: 8px
space-4: 16px
```

Rules for primitive tokens:
- Name them by their scale position, not their use
- Include every value you might ever need — nothing more
- Never use primitive tokens directly in components (that is what tier 2 is for)

### Tier 2 — Semantic tokens (decisions)
These tokens point *to* primitive tokens and assign them *meaning*.
This tier is where design thinking lives.

```
color-background-default  → color-slate-50
color-background-subtle   → color-slate-100
color-text-primary        → color-slate-900
color-text-muted          → color-slate-500
color-border-default      → color-slate-200

space-component-padding   → space-4
space-layout-gap          → space-6
```

Rules for semantic tokens:
- Name them by role, never by appearance
- One semantic token can point to different primitives in light vs dark mode
- This is the layer you use in your components

### Tier 3 — Component tokens (optional, for large systems)
Only add this tier when a component needs a value that is truly unique to it.

```
button-padding-inline     → space-component-padding
button-border-radius      → radius-md
button-font-weight        → font-weight-semibold
```

For a personal or small-team system, tier 2 is usually enough.
Add tier 3 only when you feel real pain without it.

---

## The naming convention you must commit to

Pick one naming convention and never break it.

Recommended pattern:
```
[category]-[property]-[variant]-[state]
```

Examples:
```
color-text-primary              (category: color, property: text, variant: primary)
color-text-primary-hover        (+ state: hover)
color-background-subtle         
space-layout-section-gap        
font-size-body-lg               
border-radius-component-default 
shadow-elevation-low            
motion-duration-quick           
motion-easing-standard          
```

The pattern does not matter as much as the *consistency*. Choose yours.
Write it down. Never deviate.

---

## Scale systems — the math under the design

### Spacing scale
Do not invent arbitrary spacing values. Use a base unit multiplied by a scale.
The most common is a **4px base unit** (everything is a multiple of 4).

```
space-1:  4px   (micro: icon gaps, tight padding)
space-2:  8px   (small: inline gaps, badges)
space-3:  12px  
space-4:  16px  (standard: component padding)
space-5:  20px  
space-6:  24px  (medium: card padding)
space-8:  32px  
space-10: 40px  
space-12: 48px  (large: section padding)
space-16: 64px  
space-20: 80px  (hero: layout breathing room)
space-24: 96px  
```

Why 4px? Because it divides cleanly into 8, 12, 16, 24, 32 — all common
browser rendering dimensions. Your eye will feel when something is "off" and
it is usually because spacing broke the 4px grid.

### Type scale
Use a modular scale. A ratio of 1.25 (Major Third) or 1.333 (Perfect Fourth)
gives you beautiful proportions.

With a 16px base and 1.25 ratio:
```
font-size-xs:   10px   (0.625rem)
font-size-sm:   12px   (0.75rem)
font-size-base: 14px   (0.875rem)  ← body default
font-size-md:   16px   (1rem)
font-size-lg:   20px   (1.25rem)
font-size-xl:   24px   (1.5rem)    ← h3
font-size-2xl:  32px   (2rem)      ← h2
font-size-3xl:  40px   (2.5rem)    ← h1
font-size-4xl:  56px   (3.5rem)    ← display
```

Do not go beyond what you actually use. 6-8 steps is enough for most systems.

### Color scale
Build a 10-step scale per hue (100 through 950, where 100 is lightest).
You typically need 2-4 hues max:

- 1 brand/accent hue
- 1 neutral hue (for surfaces, text, borders)
- 1 semantic hue for feedback (danger/success) — can share one hue with shifts

You do not need separate scales for every color of the rainbow.
More hues = more decisions = more chaos.

---

## The token audit you must do before shipping

Before you call your token layer done, answer every question:

- [ ] Can I switch to dark mode by changing only token values, not component code?
- [ ] Is every color value reachable through a semantic token name?
- [ ] Do I have a token for every state: default, hover, active, disabled, focus?
- [ ] Is my spacing consistent — no magic numbers anywhere?
- [ ] Does every token name make sense to a stranger who has never seen my system?
- [ ] Are there any duplicate values I can collapse into one token?

If any answer is "no", your foundation is not done yet.

---

## The most important principle

**Your tokens are a promise.**

When you use `color-text-primary` in a component, you are promising that
this is the right text color for primary reading in all contexts.
If you break that promise anywhere (by hardcoding a value instead),
you break the system's ability to update itself.

The discipline is: if you cannot find a token for what you need,
create a new token. Never hardcode.
