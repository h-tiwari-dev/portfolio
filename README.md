# Portfolio + Blog CMS Roadmap

Implementation plan for a full-featured blog CMS with draft-to-publish workflow, animations in JSX, and interactive graph/algorithm explainers.

## Current Goal

- [x] Build a production-ready blog workflow: create, draft, review, schedule, publish, and archive posts.
- [x] Add rich interactive content blocks (charts/graphs + algorithm demos).
- [x] Add a reusable animation system for the website and blog UI.

## Development Commands

```bash
bun install
bun run dev
```

Build:

```bash
bun run build
bun run start
```

## Roadmap

## Phase 0: Architecture and Standards

- [x] Finalize content model (`Post`, `Author`, `Category`, `Tag`, `MediaAsset`).
- [x] Finalize post states: `draft`, `in_review`, `scheduled`, `published`, `archived`.
- [x] Define editor stack (MDX/Markdoc + CMS editor). See `docs/editor-stack.md`.
- [x] Define animation standard for React/JSX. See `docs/animation-standard.md`.
- [x] Use CSS/WAAPI for simple transitions.
- [x] Use Motion for React for state/layout-driven animations.
- [x] Use View Transitions API where supported.
- [x] Define interactive visualization standard. See `docs/visualization-standard.md`.
- [x] Charts: SVG-first (D3/Recharts style path).
- [x] Algorithms/graph traversal: node-edge visual layer + playback controls.
- [x] Define accessibility/performance rules. See `docs/accessibility-performance-standard.md`.
- [x] Support `prefers-reduced-motion`.
- [x] Transform/opacity-first animation policy.

## Phase 1: Blog CMS MVP (Draft to Publish)

- [x] Create CMS schema for posts.
- [x] Title, slug, excerpt, body, cover image, tags, categories, publish date.
- [x] Draft state + validation rules.
- [x] Add editor features. See `docs/editor-features.md`.
- [x] Autosave.
- [x] Manual save.
- [x] Live preview.
- [x] Add publishing workflow. See `docs/publishing-workflow.md`.
- [x] Publish now (via Cloudflare Worker API).
- [x] Schedule publish (via Cloudflare Worker API).
- [x] Archive/unpublish (via Cloudflare Worker API).
- [x] Add revisions/version history with restore (via Cloudflare Worker API).
- [x] Add role-based access: skipped (single-admin setup).
- [x] `admin` (only role in use).
- [x] `editor` skipped.
- [x] `author` skipped.
- [x] Add basic admin authentication guard: skipped (single-admin setup).

## Phase 2: Advanced CMS Features

- [x] Add editorial comments on drafts.
- [x] Add approval workflow (`author -> editor -> publish`): skipped (single-admin setup).
- [x] Add media library.
- [x] Upload + browse.
- [x] Alt text required.
- [x] Image optimization.
- [x] Add SEO controls.
- [x] Meta title/description.
- [x] OpenGraph/Twitter card fields.
- [x] Canonical URL field.
- [x] Add auto-generated RSS and sitemap.
- [x] Add structured data for blog posts.
- [x] Add activity/audit logs for content events (Worker + D1 revision history).

## Phase 3: Animation System (JSX)

- [x] Create shared animation tokens.
- [x] Duration scale.
- [x] Easing curves.
- [x] Stagger presets.
- [x] Implement reusable components.
- [x] `FadeIn`
- [x] `SlideIn`
- [x] `ScaleIn`
- [x] `StaggerGroup`
- [x] Add page/section transitions.
- [x] Home page section reveal.
- [x] Blog list reveal and filters transition.
- [x] Blog post hero/content entrance.
- [x] Add micro-interactions.
- [x] Buttons.
- [x] Cards.
- [x] Form inputs.
- [x] Add reduced-motion fallback variants.

## Phase 4: Interactive Graph + Algorithm Blog Blocks

- [x] Define custom content block type: `InteractiveDemo`.
- [x] Add configurable controls:
- [x] `Play`
- [x] `Pause`
- [x] `Step`
- [x] `Reset`
- [x] `Randomize`
- [x] Implement demo preset #1: sorting visualizer.
- [x] Implement demo preset #2: graph traversal visualizer (BFS/DFS).
- [x] Implement demo preset #3: shortest path visualizer (Dijkstra-style).
- [x] Add chart mode for metric/time-series explanations.
- [x] Persist demo configuration in post content (author-editable in Markdoc via tag attrs).
- [x] Add safe fallback rendering for no-JS environments.

## Phase 5: Quality, Reliability, and Launch

- [x] Add tests for content lifecycle.
- [x] Create draft.
- [x] Update draft.
- [x] Schedule publish.
- [x] Publish.
- [x] Archive.
- [x] Add tests for role permissions and approval flow: skipped (single-admin, no approval flow).
- [x] Add tests for interactive demo controls and deterministic playback.
- [x] Add tests for animation behavior and reduced-motion handling.
- [x] Run performance checks on mobile and desktop (manual checklist in `docs/performance-checks.md`).
- [x] Prepare launch checklist and rollout plan.

## Milestones

- [x] Milestone A: Draft-to-publish workflow fully functional.
- [x] Milestone B: CMS collaboration + SEO + media features complete.
- [x] Milestone C: Animation system integrated site-wide.
- [x] Milestone D: Interactive demo blocks live in blog posts.
- [x] Milestone E: Tests passing and production launch readiness (deployment requires env + network access).
