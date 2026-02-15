import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../keystatic.config';

// config() wraps the return value — actual config is in .default at runtime
const cfg = (keystaticConfig as any).default || keystaticConfig;
const reader = createReader(process.cwd(), cfg);

export type Post = {
  title: string;
  status?: 'draft' | 'published';
  excerpt: string;
  publishedDate: string | null;
  tags: string[];
  coverImage: string | null;
  content: any;
};

type GetAllPostsOptions = {
  includeDrafts?: boolean;
};

function isPublished(post: Post) {
  // Backward compatibility for older posts without a status field.
  return !post.status || post.status === 'published';
}

export async function getAllPosts(options: GetAllPostsOptions = {}) {
  const { includeDrafts = false } = options;
  const slugs = await reader.collections.posts.list();
  const posts = await Promise.all(
    slugs.map(async (slug: string) => {
      const post = (await reader.collections.posts.read(slug)) as Post | null;
      return { slug, ...post! };
    })
  );
  const filteredPosts = includeDrafts
    ? posts
    : posts.filter((post) => isPublished(post));

  return filteredPosts.sort((a, b) => {
    if (!a.publishedDate || !b.publishedDate) return 0;
    return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
  });
}

type GetPostOptions = {
  includeDrafts?: boolean;
};

export async function getPost(slug: string, options: GetPostOptions = {}) {
  const { includeDrafts = false } = options;

  const post = (await reader.collections.posts.read(slug, {
    resolveLinkedFiles: true,
  })) as Post | null;

  if (!post) return null;
  if (!includeDrafts && !isPublished(post)) return null;
  return post;
}

export { reader };
