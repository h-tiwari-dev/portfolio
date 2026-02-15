# Visualization Standard (Charts + Algorithm Graphs)

## Scope

Defines how blog posts should render interactive charts and algorithm/graph demos.

## Chart standard

- Rendering base: SVG-first for clarity and accessibility.
- Use React-friendly charting primitives/components for common chart types.
- Start with deterministic, declarative configs stored with post content.

## Algorithm graph standard

- Node-edge model for graph algorithms and traversal demos.
- Explicit simulation state machine:
- `idle` -> `running` -> `paused` -> `completed`.
- Standard controls:
- `Play`, `Pause`, `Step`, `Reset`, `Randomize`.
- Deterministic stepping by seed so demos are reproducible.

## Authoring standard

- Interactive demos are authored through structured fields (not free-form JS in post body).
- Demo config should be serializable and safe for static export.
- Each demo includes fallback content for no-JS contexts.

## Performance and UX rules

- Prefer incremental updates over full re-renders for large node sets.
- Keep animation frame work bounded for mobile.
- Provide keyboard-friendly controls and visible current step/state.
