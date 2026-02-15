# Publishing Workflow

## Post states

- `draft`: private work-in-progress.
- `in_review`: editorial review state.
- `scheduled`: publish automatically after `scheduledDate`.
- `published`: publicly visible.
- `archived`: hidden from public lists and post routes.

## Visibility behavior

- `published` posts are visible.
- `scheduled` posts are visible only when `scheduledDate <= today`.
- `draft`, `in_review`, and `archived` are hidden from public readers.

## Cloudflare Worker API

Primary workflow control now runs through the Worker endpoint:

`POST /api/blog/workflow`

Request body:

```json
{
  "action": "publish | schedule | archive | unpublish",
  "slug": "post-slug",
  "date": "YYYY-MM-DD"
}
```

Headers:

- `Authorization: Bearer <BLOG_WORKFLOW_TOKEN>` (or `X-Admin-Token`)

`date` is required only for `schedule`, optional for `publish`.

Revision endpoints:

- `GET /api/blog/history?slug=<slug>&limit=20`
- `POST /api/blog/restore`

Restore request body:

```json
{
  "slug": "post-slug",
  "revisionId": 12
}
```

`/api/blog/history` returns revision metadata from D1, and `/api/blog/restore`
creates a new revision after restoring the selected snapshot.

Post CRUD endpoint (D1-backed):

- `GET /api/blog/posts?slug=<slug>`
- `GET /api/blog/posts?status=draft&limit=50`
- `POST /api/blog/posts` (create/update)
- `DELETE /api/blog/posts?slug=<slug>` (hard delete)

### Required Worker secrets

Set these on the worker:

- `BLOG_WORKFLOW_TOKEN`
- `RESEND_API_KEY` (existing contact form email secret)

Example:

```bash
cd worker
npx wrangler secret put BLOG_WORKFLOW_TOKEN
npx wrangler secret put RESEND_API_KEY
```

### D1 setup

Create D1 database:

```bash
cd worker
npx wrangler d1 create portfolio-blog
```

Copy the `database_id` into `worker/wrangler.jsonc` under `d1_databases`
with binding name `BLOG_DB`.

Apply migration:

```bash
npx wrangler d1 migrations apply portfolio-blog
```

### Optional media upload setup (R2)

If you want image uploads directly from `/admin`, configure an R2 bucket binding:

```jsonc
"r2_buckets": [
  {
    "binding": "BLOG_MEDIA",
    "bucket_name": "portfolio-blog-media"
  }
]
```

Optional public URL base for returned media URLs:

```jsonc
"vars": {
  "BLOG_MEDIA_PUBLIC_BASE": "https://cdn.your-domain.com"
}
```

If you are upgrading an existing database, also apply the latest migration so
editorial comments are persisted:

```bash
npx wrangler d1 migrations apply portfolio-blog
```

## Local fallback CLI (optional)

Use the workflow script to move posts between states:

```bash
npm run post:workflow -- publish <slug> [--date YYYY-MM-DD]
npm run post:workflow -- schedule <slug> --date YYYY-MM-DD
npm run post:workflow -- archive <slug>
npm run post:workflow -- unpublish <slug>
```

Optional:

```bash
--dry-run
```

## What each action does

- `publish`: sets `status: published`, sets `publishedDate`, clears `scheduledDate`.
- `schedule`: sets `status: scheduled`, sets both `scheduledDate` and `publishedDate`.
- `archive`: sets `status: archived`, clears `scheduledDate`.
- `unpublish`: sets `status: draft`, clears `scheduledDate`.
