# Editor Stack Decision

## Scope

Defines the content authoring stack for the blog CMS in this repository.

## Decision

- Primary content source: Cloudflare Worker + D1 (`/api/blog/public/posts`).
- Runtime renderer: custom Markdoc renderer in `components/blog/MarkdocRenderer.tsx`.
- Post body format in DB: Markdoc-compatible markdown text.

## Why this stack

- D1 gives centralized content storage and workflow state.
- Worker API provides publishing/history/restore without GitHub file writes.
- Markdoc rendering still supports custom interactive components.

## MDX position

- MDX is **not enabled** in the current implementation.
- If a future feature requires MDX-only behavior, enable it as a controlled extension path.

## Authoring rules

- Use `status` for lifecycle control (`draft`, `in_review`, `scheduled`, `published`, `archived`).
- Use `publishedDate` for visible published posts.
- Use `scheduledDate` only when `status: scheduled`.
- Keep frontmatter complete for SEO and indexing fields.

## Implementation references

- `worker/index.ts`
- `worker/migrations/0001_blog.sql`
- `lib/reader.ts`
- `components/blog/MarkdocRenderer.tsx`
