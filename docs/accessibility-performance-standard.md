# Accessibility and Performance Standard

## Scope

Baseline rules for motion, rendering performance, and inclusive behavior across the site.

## Motion accessibility

- Always support `@media (prefers-reduced-motion: reduce)`.
- In reduced mode:
- Disable movement-heavy transitions.
- Use minimal opacity changes only when needed.
- Skip autoplay behaviors for interactive demos.

## Animation performance

- Default to `transform` and `opacity` animations.
- Avoid layout-triggering animation properties when possible.
- Keep animation count low per viewport section to prevent jank.

## Interactive demo performance

- Use deterministic stepping and bounded update loops.
- Avoid unbounded timers and animation work in background tabs.
- Degrade gracefully for low-power devices.

## QA gates

- Verify keyboard-only control flow for interactive demos.
- Verify reduced-motion mode on at least one desktop and one mobile viewport.
- Confirm no critical UI depends on animation timing.
