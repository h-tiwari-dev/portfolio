export type Post = {
  slug: string;
  title: string;
  status?: 'draft' | 'in_review' | 'scheduled' | 'published' | 'archived';
  excerpt: string;
  author?: string | null;
  categories?: string[];
  publishedDate: string | null;
  scheduledDate?: string | null;
  tags: string[];
  coverImage: string | null;
  coverImageAlt?: string | null;
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    canonicalUrl?: string | null;
    ogImage?: string | null;
    twitterCard?: 'summary' | 'summary_large_image' | null;
  };
  content: string;
};

type WorkerPostRow = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  status: Post['status'];
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
  seo_twitter_card: 'summary' | 'summary_large_image' | null;
};

type GetAllPostsOptions = {
  includeDrafts?: boolean;
};

const API_BASE =
  process.env.BLOG_API_BASE || 'https://portfolio-worker.h-tiwari-dev.workers.dev';

function buildPublicPostsUrl(slug?: string): string {
  const base = API_BASE.replace(/\/+$/, '');

  if (base.endsWith('/api/blog/public/posts')) {
    return slug ? `${base}?slug=${encodeURIComponent(slug)}` : base;
  }
  if (base.endsWith('/api/blog')) {
    return slug
      ? `${base}/public/posts?slug=${encodeURIComponent(slug)}`
      : `${base}/public/posts`;
  }
  return slug
    ? `${base}/api/blog/public/posts?slug=${encodeURIComponent(slug)}`
    : `${base}/api/blog/public/posts`;
}

function safeParseStringArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function mapWorkerPost(post: WorkerPostRow): Post {
  return {
    slug: post.slug,
    title: post.title,
    status: post.status,
    excerpt: post.excerpt,
    publishedDate: post.published_date,
    scheduledDate: post.scheduled_date,
    tags: safeParseStringArray(post.tags_json),
    categories: safeParseStringArray(post.categories_json),
    coverImage: post.cover_image,
    coverImageAlt: post.cover_image_alt,
    seo: {
      metaTitle: post.seo_meta_title,
      metaDescription: post.seo_meta_description,
      canonicalUrl: post.seo_canonical_url,
      ogImage: post.seo_og_image,
      twitterCard: post.seo_twitter_card,
    },
    content: post.content,
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Reader fetch failed (${response.status}): ${text}`);
  }
  return (await response.json()) as T;
}

export async function getAllPosts(_options: GetAllPostsOptions = {}) {
  try {
    const data = await fetchJson<{ posts?: WorkerPostRow[] }>(buildPublicPostsUrl());
    return (data.posts || []).map(mapWorkerPost);
  } catch (error) {
    console.warn(
      `[reader] Falling back to empty posts list: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return [];
  }
}

type GetPostOptions = {
  includeDrafts?: boolean;
};

export async function getPost(slug: string, _options: GetPostOptions = {}) {
  try {
    const data = await fetchJson<{ post?: WorkerPostRow }>(buildPublicPostsUrl(slug));
    if (!data.post) return null;
    return mapWorkerPost(data.post);
  } catch {
    return null;
  }
}
