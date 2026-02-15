import { Resend } from 'resend';

interface Env {
  RESEND_API_KEY: string;
  BLOG_WORKFLOW_TOKEN: string;
  BLOG_DB: D1Database;
  BLOG_MEDIA?: R2Bucket;
  BLOG_MEDIA_PUBLIC_BASE?: string;
}

type WorkflowAction = 'publish' | 'schedule' | 'archive' | 'unpublish';
type PostStatus = 'draft' | 'in_review' | 'scheduled' | 'published' | 'archived';

const VALID_STATUSES = new Set<PostStatus>([
  'draft',
  'in_review',
  'scheduled',
  'published',
  'archived',
]);

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token',
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...getCorsHeaders(),
      'Content-Type': 'application/json',
    },
  });
}

function getAdminTokenFromRequest(request: Request): string {
  const bearer = request.headers.get('Authorization');
  if (bearer?.startsWith('Bearer ')) {
    return bearer.slice('Bearer '.length).trim();
  }
  return request.headers.get('X-Admin-Token')?.trim() || '';
}

function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]*$/.test(slug);
}

function isValidDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  return !Number.isNaN(new Date(date).getTime());
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowIso(): string {
  return new Date().toISOString();
}

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function mediaPublicUrl(env: Env, key: string): string {
  const base = (env.BLOG_MEDIA_PUBLIC_BASE || '').trim().replace(/\/+$/, '');
  if (!base) return key;
  return `${base}/${key}`;
}

function safeJsonArray(raw: unknown): string {
  if (Array.isArray(raw)) {
    return JSON.stringify(raw.filter((item) => typeof item === 'string'));
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return JSON.stringify(parsed.filter((item) => typeof item === 'string'));
      }
    } catch {
      return JSON.stringify([]);
    }
  }
  return JSON.stringify([]);
}

type PostRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  status: PostStatus;
  published_date: string | null;
  scheduled_date: string | null;
  tags_json: string;
  categories_json: string;
  cover_image: string | null;
  cover_image_alt: string | null;
  seo_meta_title: string | null;
  seo_meta_description: string | null;
  seo_canonical_url: string | null;
  seo_og_image: string | null;
  seo_twitter_card: string | null;
  editorial_comments_json: string;
  created_at: string;
  updated_at: string;
};

function serializePostSnapshot(post: PostRow) {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    status: post.status,
    published_date: post.published_date,
    scheduled_date: post.scheduled_date,
    tags_json: post.tags_json,
    categories_json: post.categories_json,
    cover_image: post.cover_image,
    cover_image_alt: post.cover_image_alt,
    seo_meta_title: post.seo_meta_title,
    seo_meta_description: post.seo_meta_description,
    seo_canonical_url: post.seo_canonical_url,
    seo_og_image: post.seo_og_image,
    seo_twitter_card: post.seo_twitter_card,
    editorial_comments_json: post.editorial_comments_json,
  };
}

async function getPostBySlug(db: D1Database, slug: string): Promise<PostRow | null> {
  const result = await db
    .prepare('SELECT * FROM posts WHERE slug = ?1 LIMIT 1')
    .bind(slug)
    .first<PostRow>();
  return result || null;
}

async function insertRevision(
  db: D1Database,
  postId: number,
  revisionType: string,
  snapshot: unknown,
  actor: string
) {
  await db
    .prepare(
      `INSERT INTO post_revisions (post_id, revision_type, snapshot_json, actor, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5)`
    )
    .bind(postId, revisionType, JSON.stringify(snapshot), actor, nowIso())
    .run();
}

function requireAdmin(request: Request, env: Env): Response | null {
  const token = getAdminTokenFromRequest(request);
  if (!token || token !== env.BLOG_WORKFLOW_TOKEN) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  return null;
}

async function handleContactRequest(request: Request, env: Env) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const { name, email, message } = await request.json();
    if (!name || !email || !message) {
      return jsonResponse({ error: 'All fields are required' }, 400);
    }

    const resend = new Resend(env.RESEND_API_KEY);
    const data = await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: 'h.tiwari.dev@gmail.com',
      subject: `New Message from ${name} via Portfolio`,
      replyTo: email,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    return jsonResponse({ success: true, data });
  } catch (error) {
    console.error('Email dispatch failed:', error);
    return jsonResponse({ error: 'Failed to send email' }, 500);
  }
}

async function handlePostsRequest(request: Request, env: Env) {
  const unauthorized = requireAdmin(request, env);
  if (unauthorized) return unauthorized;

  if (request.method === 'GET') {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug')?.trim();
    const status = url.searchParams.get('status')?.trim();
    const limit = Math.min(Number(url.searchParams.get('limit') || 50), 100);

    if (slug) {
      const post = await getPostBySlug(env.BLOG_DB, slug);
      if (!post) return jsonResponse({ error: 'Post not found' }, 404);
      return jsonResponse({ success: true, post });
    }

    let query = 'SELECT * FROM posts';
    const bindParams: unknown[] = [];
    if (status && VALID_STATUSES.has(status as PostStatus)) {
      query += ' WHERE status = ?1';
      bindParams.push(status);
    }
    query += ' ORDER BY updated_at DESC LIMIT ?' + (bindParams.length + 1);
    bindParams.push(limit);

    const rows = await env.BLOG_DB.prepare(query)
      .bind(...bindParams)
      .all<PostRow>();
    return jsonResponse({ success: true, posts: rows.results || [] });
  }

  if (request.method === 'DELETE') {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug')?.trim() || '';
    if (!isValidSlug(slug)) return jsonResponse({ error: 'Invalid slug' }, 400);

    const post = await getPostBySlug(env.BLOG_DB, slug);
    if (!post) return jsonResponse({ error: 'Post not found' }, 404);

    await insertRevision(
      env.BLOG_DB,
      post.id,
      'delete',
      serializePostSnapshot(post),
      'admin'
    );
    await env.BLOG_DB.prepare('DELETE FROM posts WHERE id = ?1').bind(post.id).run();
    return jsonResponse({ success: true, deleted: true, slug });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const payload = (await request.json()) as {
      slug?: string;
      title?: string;
      excerpt?: string;
      content?: string;
      status?: PostStatus;
      publishedDate?: string | null;
      scheduledDate?: string | null;
      tags?: string[];
      categories?: string[];
      coverImage?: string | null;
      coverImageAlt?: string | null;
      seo?: {
        metaTitle?: string | null;
        metaDescription?: string | null;
        canonicalUrl?: string | null;
        ogImage?: string | null;
        twitterCard?: string | null;
      };
      editorialComments?: string[];
      actor?: string;
    };

    const slug = payload.slug?.trim() || '';
    if (!isValidSlug(slug)) return jsonResponse({ error: 'Invalid slug' }, 400);

    const status = payload.status || 'draft';
    if (!VALID_STATUSES.has(status)) return jsonResponse({ error: 'Invalid status' }, 400);

    const title = payload.title?.trim() || slug;
    const excerpt = payload.excerpt?.trim() || '';
    const content = payload.content || '';
    const publishedDate = payload.publishedDate || null;
    const scheduledDate = payload.scheduledDate || null;

    const existing = await getPostBySlug(env.BLOG_DB, slug);
    const actor = payload.actor || 'admin';
    const timestamp = nowIso();

    if (!existing) {
      const insert = await env.BLOG_DB.prepare(
        `INSERT INTO posts (
          slug, title, excerpt, content, status, published_date, scheduled_date,
          tags_json, categories_json, cover_image, cover_image_alt,
          seo_meta_title, seo_meta_description, seo_canonical_url, seo_og_image, seo_twitter_card, editorial_comments_json,
          created_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19)`
      )
        .bind(
          slug,
          title,
          excerpt,
          content,
          status,
          publishedDate,
          scheduledDate,
          safeJsonArray(payload.tags),
          safeJsonArray(payload.categories),
          payload.coverImage || null,
          payload.coverImageAlt || null,
          payload.seo?.metaTitle || null,
          payload.seo?.metaDescription || null,
          payload.seo?.canonicalUrl || null,
          payload.seo?.ogImage || null,
          payload.seo?.twitterCard || null,
          safeJsonArray(payload.editorialComments),
          timestamp,
          timestamp
        )
        .run();

      const createdId = Number(insert.meta.last_row_id);
      const created = await env.BLOG_DB.prepare('SELECT * FROM posts WHERE id = ?1 LIMIT 1')
        .bind(createdId)
        .first<PostRow>();

      if (created) {
        await insertRevision(
          env.BLOG_DB,
          created.id,
          'create',
          serializePostSnapshot(created),
          actor
        );
      }
      return jsonResponse({ success: true, created: true, post: created });
    }

    await env.BLOG_DB.prepare(
      `UPDATE posts SET
        title = ?1,
        excerpt = ?2,
        content = ?3,
        status = ?4,
        published_date = ?5,
        scheduled_date = ?6,
        tags_json = ?7,
        categories_json = ?8,
        cover_image = ?9,
        cover_image_alt = ?10,
        seo_meta_title = ?11,
        seo_meta_description = ?12,
        seo_canonical_url = ?13,
        seo_og_image = ?14,
        seo_twitter_card = ?15,
        editorial_comments_json = ?16,
        updated_at = ?17
       WHERE slug = ?18`
    )
      .bind(
        title,
        excerpt,
        content,
        status,
        publishedDate,
        scheduledDate,
        safeJsonArray(payload.tags),
        safeJsonArray(payload.categories),
        payload.coverImage || null,
        payload.coverImageAlt || null,
        payload.seo?.metaTitle || null,
        payload.seo?.metaDescription || null,
        payload.seo?.canonicalUrl || null,
        payload.seo?.ogImage || null,
        payload.seo?.twitterCard || null,
        safeJsonArray(payload.editorialComments),
        timestamp,
        slug
      )
      .run();

    const updated = await getPostBySlug(env.BLOG_DB, slug);
    if (updated) {
      await insertRevision(
        env.BLOG_DB,
        updated.id,
        'update',
        serializePostSnapshot(updated),
        actor
      );
    }
    return jsonResponse({ success: true, created: false, post: updated });
  } catch (error) {
    console.error('Posts upsert failed:', error);
    return jsonResponse(
      {
        error: 'Failed to upsert post',
        detail: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
}

async function handlePublicPostsRequest(request: Request, env: Env) {
  if (request.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug')?.trim();

    const now = todayDate();

    if (slug) {
      if (!isValidSlug(slug)) return jsonResponse({ error: 'Invalid slug' }, 400);
      const post = await env.BLOG_DB.prepare(
        `SELECT * FROM posts
         WHERE slug = ?1
           AND (
             status = 'published'
             OR (status = 'scheduled' AND scheduled_date <= ?2)
           )
         LIMIT 1`
      )
        .bind(slug, now)
        .first<PostRow>();

      if (!post) return jsonResponse({ error: 'Post not found' }, 404);
      return jsonResponse({ success: true, post });
    }

    const posts = await env.BLOG_DB.prepare(
      `SELECT * FROM posts
       WHERE status = 'published'
          OR (status = 'scheduled' AND scheduled_date <= ?1)
       ORDER BY COALESCE(published_date, scheduled_date, updated_at) DESC`
    )
      .bind(now)
      .all<PostRow>();

    return jsonResponse({ success: true, posts: posts.results || [] });
  } catch (error) {
    console.error('Public posts fetch failed:', error);
    return jsonResponse(
      {
        error: 'Failed to fetch public posts',
        detail: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
}

async function handleWorkflowRequest(request: Request, env: Env) {
  const unauthorized = requireAdmin(request, env);
  if (unauthorized) return unauthorized;

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const payload = (await request.json()) as {
      action?: WorkflowAction;
      slug?: string;
      date?: string;
      actor?: string;
    };

    const action = payload.action;
    const slug = payload.slug?.trim() || '';
    const date = payload.date?.trim();
    const actor = payload.actor || 'admin';

    if (!action || !['publish', 'schedule', 'archive', 'unpublish'].includes(action)) {
      return jsonResponse({ error: 'Invalid action' }, 400);
    }
    if (!isValidSlug(slug)) return jsonResponse({ error: 'Invalid slug' }, 400);
    if (date && !isValidDate(date)) return jsonResponse({ error: 'Invalid date format' }, 400);
    if (action === 'schedule' && !date) {
      return jsonResponse({ error: 'Schedule requires a date' }, 400);
    }

    const post = await getPostBySlug(env.BLOG_DB, slug);
    if (!post) return jsonResponse({ error: 'Post not found' }, 404);

    let status: PostStatus = post.status;
    let publishedDate = post.published_date;
    let scheduledDate = post.scheduled_date;
    const effectiveDate = date || todayDate();

    if (action === 'publish') {
      status = 'published';
      publishedDate = effectiveDate;
      scheduledDate = null;
    } else if (action === 'schedule') {
      status = 'scheduled';
      scheduledDate = effectiveDate;
      publishedDate = effectiveDate;
    } else if (action === 'archive') {
      status = 'archived';
      scheduledDate = null;
    } else {
      status = 'draft';
      scheduledDate = null;
    }

    await env.BLOG_DB.prepare(
      `UPDATE posts
       SET status = ?1, published_date = ?2, scheduled_date = ?3, updated_at = ?4
       WHERE id = ?5`
    )
      .bind(status, publishedDate, scheduledDate, nowIso(), post.id)
      .run();

    const updated = await getPostBySlug(env.BLOG_DB, slug);
    if (updated) {
      await insertRevision(
        env.BLOG_DB,
        updated.id,
        `workflow:${action}`,
        serializePostSnapshot(updated),
        actor
      );
    }
    return jsonResponse({ success: true, post: updated, action });
  } catch (error) {
    console.error('Workflow update failed:', error);
    return jsonResponse(
      {
        error: 'Failed to update workflow',
        detail: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
}

async function handleHistoryRequest(request: Request, env: Env) {
  const unauthorized = requireAdmin(request, env);
  if (unauthorized) return unauthorized;

  if (request.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug')?.trim() || '';
    const limit = Math.max(1, Math.min(Number(url.searchParams.get('limit') || 20), 100));

    if (!isValidSlug(slug)) return jsonResponse({ error: 'Invalid slug' }, 400);
    const post = await getPostBySlug(env.BLOG_DB, slug);
    if (!post) return jsonResponse({ error: 'Post not found' }, 404);

    const revisions = await env.BLOG_DB.prepare(
      `SELECT id, revision_type, actor, created_at
       FROM post_revisions
       WHERE post_id = ?1
       ORDER BY id DESC
       LIMIT ?2`
    )
      .bind(post.id, limit)
      .all();

    return jsonResponse({ success: true, slug, history: revisions.results || [] });
  } catch (error) {
    console.error('History fetch failed:', error);
    return jsonResponse(
      {
        error: 'Failed to fetch history',
        detail: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
}

async function handleRestoreRequest(request: Request, env: Env) {
  const unauthorized = requireAdmin(request, env);
  if (unauthorized) return unauthorized;

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const payload = (await request.json()) as {
      slug?: string;
      revisionId?: number;
      actor?: string;
    };
    const slug = payload.slug?.trim() || '';
    const revisionId = Number(payload.revisionId);
    const actor = payload.actor || 'admin';

    if (!isValidSlug(slug)) return jsonResponse({ error: 'Invalid slug' }, 400);
    if (!Number.isInteger(revisionId) || revisionId <= 0) {
      return jsonResponse({ error: 'Invalid revisionId' }, 400);
    }

    const post = await getPostBySlug(env.BLOG_DB, slug);
    if (!post) return jsonResponse({ error: 'Post not found' }, 404);

    const revision = await env.BLOG_DB.prepare(
      `SELECT snapshot_json
       FROM post_revisions
       WHERE id = ?1 AND post_id = ?2
       LIMIT 1`
    )
      .bind(revisionId, post.id)
      .first<{ snapshot_json: string }>();

    if (!revision) return jsonResponse({ error: 'Revision not found' }, 404);

    const snapshot = JSON.parse(revision.snapshot_json) as ReturnType<
      typeof serializePostSnapshot
    >;

    await env.BLOG_DB.prepare(
      `UPDATE posts SET
        title = ?1,
        excerpt = ?2,
        content = ?3,
        status = ?4,
        published_date = ?5,
        scheduled_date = ?6,
        tags_json = ?7,
        categories_json = ?8,
        cover_image = ?9,
        cover_image_alt = ?10,
        seo_meta_title = ?11,
        seo_meta_description = ?12,
        seo_canonical_url = ?13,
        seo_og_image = ?14,
        seo_twitter_card = ?15,
        editorial_comments_json = ?16,
        updated_at = ?17
      WHERE id = ?18`
    )
      .bind(
        snapshot.title,
        snapshot.excerpt,
        snapshot.content,
        snapshot.status,
        snapshot.published_date,
        snapshot.scheduled_date,
        snapshot.tags_json,
        snapshot.categories_json,
        snapshot.cover_image,
        snapshot.cover_image_alt,
        snapshot.seo_meta_title,
        snapshot.seo_meta_description,
        snapshot.seo_canonical_url,
        snapshot.seo_og_image,
        snapshot.seo_twitter_card,
        snapshot.editorial_comments_json ?? JSON.stringify([]),
        nowIso(),
        post.id
      )
      .run();

    const updated = await getPostBySlug(env.BLOG_DB, slug);
    if (updated) {
      await insertRevision(
        env.BLOG_DB,
        updated.id,
        'restore',
        serializePostSnapshot(updated),
        actor
      );
    }

    return jsonResponse({ success: true, post: updated, restoredFromRevisionId: revisionId });
  } catch (error) {
    console.error('Restore failed:', error);
    return jsonResponse(
      {
        error: 'Failed to restore revision',
        detail: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
}

async function handleMediaRequest(request: Request, env: Env) {
  const unauthorized = requireAdmin(request, env);
  if (unauthorized) return unauthorized;

  if (!env.BLOG_MEDIA) {
    return jsonResponse(
      {
        error:
          'BLOG_MEDIA binding is missing. Configure r2_buckets in worker/wrangler.jsonc and redeploy worker.',
      },
      500
    );
  }

  if (request.method === 'GET') {
    const url = new URL(request.url);
    const limit = Math.max(1, Math.min(Number(url.searchParams.get('limit') || 50), 200));
    const prefix = (url.searchParams.get('prefix') || 'blog/').trim();
    const listed = await env.BLOG_MEDIA.list({ limit, prefix });
    return jsonResponse({
      success: true,
      files: listed.objects.map((obj) => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded.toISOString(),
        etag: obj.etag,
        url: mediaPublicUrl(env, obj.key),
      })),
      truncated: listed.truncated,
    });
  }

  if (request.method === 'DELETE') {
    const url = new URL(request.url);
    const key = url.searchParams.get('key')?.trim() || '';
    if (!key) return jsonResponse({ error: 'Missing key' }, 400);
    await env.BLOG_MEDIA.delete(key);
    return jsonResponse({ success: true, deleted: key });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return jsonResponse({ error: 'Missing file form field' }, 400);
    }

    const folderRaw = (form.get('folder')?.toString() || 'blog').trim().replace(/^\/+|\/+$/g, '');
    const folder = folderRaw || 'blog';
    const filename = sanitizeFileName(file.name || 'upload.bin') || 'upload.bin';
    const key = `${folder}/${Date.now()}-${filename}`;

    await env.BLOG_MEDIA.put(key, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type || 'application/octet-stream',
      },
    });

    return jsonResponse({
      success: true,
      file: {
        key,
        name: filename,
        size: file.size,
        type: file.type,
        url: mediaPublicUrl(env, key),
      },
    });
  } catch (error) {
    console.error('Media upload failed:', error);
    return jsonResponse(
      {
        error: 'Failed to upload media',
        detail: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: getCorsHeaders() });
    }

    if (!env.BLOG_DB) {
      return jsonResponse(
        {
          error:
            'BLOG_DB binding is missing. Configure d1_databases in worker/wrangler.jsonc and redeploy worker.',
        },
        500
      );
    }

    if (pathname === '/api/blog/posts') return handlePostsRequest(request, env);
    if (pathname === '/api/blog/public/posts') return handlePublicPostsRequest(request, env);
    if (pathname === '/api/blog/workflow') return handleWorkflowRequest(request, env);
    if (pathname === '/api/blog/history') return handleHistoryRequest(request, env);
    if (pathname === '/api/blog/restore') return handleRestoreRequest(request, env);
    if (pathname === '/api/blog/media') return handleMediaRequest(request, env);

    if (pathname === '/' || pathname === '/api/contact') {
      return handleContactRequest(request, env);
    }

    return jsonResponse({ error: 'Not found' }, 404);
  },
} satisfies ExportedHandler;
