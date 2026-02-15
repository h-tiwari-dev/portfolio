# Animation Standard (React/JSX)

## Scope

Defines the default animation approach for app pages, blog UI, and interactive content.

## Stack Standard

- Simple transitions: CSS transitions and Web Animations API (WAAPI).
- Component/state/layout animation: `framer-motion` (already installed).
- Route and page view transitions: View Transitions API as progressive enhancement.

## Selection rules

- Use CSS/WAAPI for hover/focus/press, opacity fades, and small reveals.
- Use Framer Motion for coordinated enter/exit, list transitions, and shared layout changes.
- Use View Transitions API only with safe fallback when unsupported.

## Performance rules

- Animate `transform` and `opacity` first.
- Avoid animating layout-heavy properties (`width`, `height`, `top`, `left`) unless required.
- Keep default durations short (`150ms` to `500ms`) and avoid stacking many long animations.

## Accessibility rules

- Respect `prefers-reduced-motion: reduce`.
- Provide reduced-motion variants (no movement, minimal fade).
- Never make critical actions depend on animation completion.

## Initial implementation targets

- Blog list card reveal and filter transitions.
- Blog post header and metadata entrance.
- Shared utility components for `FadeIn`, `SlideIn`, `ScaleIn`, and stagger groups.
