# Blog Editor Features

## Scope

Editor behavior for blog post authoring in the D1 + Worker setup.

## Implemented

- Autosave: `/admin` performs debounced autosave to `POST /api/blog/posts`.
- Manual save: explicit save button calls `POST /api/blog/posts`.
- Live preview:
- In-editor Markdoc preview pane renders current content.
- Public URL preview still available at `/blog/<slug>` once published/scheduled-visible.
- Public pages read from `GET /api/blog/public/posts`.
- Editorial comments are stored with each post (`editorial_comments_json`) and versioned.
- Post deletion is supported through `DELETE /api/blog/posts?slug=<slug>`.
- Media library uploads are supported via Worker R2 endpoints:
- `GET /api/blog/media`
- `POST /api/blog/media` (`multipart/form-data`, field: `file`)
- `DELETE /api/blog/media?key=<object-key>`

## Notes

- Primary write APIs are protected by `BLOG_WORKFLOW_TOKEN`.
- In this static-export setup, admin UI calls Worker APIs directly using the workflow token entered in `/admin`.
