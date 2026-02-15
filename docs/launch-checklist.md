# Launch Checklist

## Pre-deploy

- Confirm `npm run qa:all` passes.
- Confirm Worker secrets are configured:
- `RESEND_API_KEY`
- `BLOG_WORKFLOW_TOKEN`
- Confirm Worker has D1 binding:
- `BLOG_DB`
- Optional for image uploads: configure R2 binding `BLOG_MEDIA`.
- Verify at least one published post has complete SEO fields.
- Run latest D1 migrations (including editorial comments column):
- `cd worker && npx wrangler d1 migrations apply portfolio-blog`

## Deploy

- Deploy web app:
- `npm run deploy`
- Deploy Worker:
- `npm run deploy:worker`

## Post-deploy smoke checks

- Open `/blog` and verify published post list renders.
- Open one blog post and verify:
- metadata and canonical URL present
- JSON-LD script present
- cover image renders with alt text fallback
- Verify RSS:
- `/rss.xml`
- Verify sitemap:
- `/sitemap.xml`
- Verify Worker endpoints with admin token:
- `POST /api/blog/workflow`
- `GET /api/blog/history`
- `POST /api/blog/restore`
- `DELETE /api/blog/posts?slug=<slug>`

## Rollback plan

- For content/state issues: use `/api/blog/history` + `/api/blog/restore`.
- For code regressions: redeploy previous Git commit for site and worker.
