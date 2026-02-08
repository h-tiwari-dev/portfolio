import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../keystatic.config';

// config() wraps the return value — actual config is in .default at runtime
const cfg = (keystaticConfig as any).default || keystaticConfig;
const reader = createReader(process.cwd(), cfg);

export type Post = {
  title: string;
  excerpt: string;
  publishedDate: string | null;
  tags: string[];
  coverImage: string | null;
  content: any;
};

export async function getAllPosts() {
  const slugs = await reader.collections.posts.list();
  const posts = await Promise.all(
    slugs.map(async (slug: string) => {
      const post = (await reader.collections.posts.read(slug)) as Post | null;
      return { slug, ...post! };
    })
  );
  return posts.sort((a, b) => {
    if (!a.publishedDate || !b.publishedDate) return 0;
    return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
  });
}

export async function getPost(slug: string) {
  return (await reader.collections.posts.read(slug, {
    resolveLinkedFiles: true,
  })) as Post | null;
}

export { reader };
