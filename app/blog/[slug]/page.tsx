import Link from 'next/link';
import { getAllPosts, getPost } from '@/lib/reader';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import MarkdocRenderer, {
  transformContent,
} from '@/components/blog/MarkdocRenderer';

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 font-mono">Post not found.</p>
      </div>
    );
  }

  const content = transformContent(post.content);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-rose-400 transition-colors mb-10"
        >
          <ArrowLeft size={16} />
          <span className="font-mono">cd ../blog</span>
        </Link>

        {/* Post header */}
        <header className="mb-10">
          {post.coverImage && (
            <div className="mb-6 overflow-hidden rounded-xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            {post.publishedDate && (
              <span className="flex items-center gap-1.5 font-mono">
                <Calendar size={12} className="text-rose-500/50" />
                {new Date(post.publishedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Tag size={12} className="text-rose-500/50" />
                <div className="flex gap-2">
                  {post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400/80 border border-rose-500/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent mb-10" />

        {/* Post content */}
        <article>
          <MarkdocRenderer content={content} />
        </article>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/[0.06]">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-rose-400 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="font-mono">Back to all posts</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
