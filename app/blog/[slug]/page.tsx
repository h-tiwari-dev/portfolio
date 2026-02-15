import Link from 'next/link';
import { getAllPosts, getPost } from '@/lib/reader';
import { ArrowLeft } from 'lucide-react';
import { FadeIn } from '@/components/animations/FadeIn';
import { CopyLinkButton } from '@/components/blog/CopyLinkButton';
import MarkdocRenderer, {
  transformContent,
} from '@/components/blog/MarkdocRenderer';

export const dynamicParams = false;

function calculateReadingTime(content: any): number {
  if (!content) return 0;
  const wordsPerMinute = 200;
  const text = typeof content === 'string' ? content : JSON.stringify(content);
  const words = text.split(/\s+/).filter((word) => word.length > 0).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} | Harsh Tiwari`,
    description: post.excerpt,
  };
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <FadeIn className="text-center p-12">
          <p className="text-slate-400 text-lg mb-4">
            Post not found
          </p>
          <Link
            href="/blog"
            className="text-slate-300 hover:text-white transition-colors text-sm underline underline-offset-4"
          >
            Back to blog
          </Link>
        </FadeIn>
      </div>
    );
  }

  const content = transformContent(post.content);
  const readingTime = calculateReadingTime(post.content);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Navigation */}
        <FadeIn className="mb-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Blog
          </Link>
        </FadeIn>

        {/* Post Header */}
        <FadeIn delay={0.1} className="mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            {post.publishedDate && (
              <time>
                {new Date(post.publishedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
            <span>{readingTime} min read</span>
            {post.tags && post.tags.length > 0 && (
              <span className="text-slate-600">
                {post.tags.join(', ')}
              </span>
            )}
          </div>
        </FadeIn>

        {/* Cover Image */}
        {post.coverImage && (
          <FadeIn delay={0.15} className="mb-10">
            <div className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-auto object-cover max-h-[400px]"
              />
            </div>
          </FadeIn>
        )}

        {/* Post Content */}
        <FadeIn delay={0.2}>
          <article className="prose-custom">
            <MarkdocRenderer content={content} />
          </article>
        </FadeIn>

        {/* Footer */}
        <FadeIn delay={0.3} className="mt-14 pt-8 border-t border-neutral-800">
          <div className="flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors group"
            >
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-1 transition-transform"
              />
              All posts
            </Link>

            <CopyLinkButton
              url={`https://tiwariharsh.com/blog/${params.slug}`}
            />
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
