import Link from 'next/link';
import { getAllPosts } from '@/lib/reader';
import { ArrowLeft } from 'lucide-react';
import { FadeIn } from '@/components/animations/FadeIn';
import { BlogPostList } from '@/components/blog/BlogPostList';

export default async function BlogPage() {
  const posts = await getAllPosts();

  const sortedPosts = posts
    .sort((a, b) => {
      if (!a.publishedDate || !b.publishedDate) return 0;
      return (
        new Date(b.publishedDate).getTime() -
        new Date(a.publishedDate).getTime()
      );
    })
    .map(({ slug, title, excerpt, publishedDate, tags }) => ({
      slug,
      title,
      excerpt,
      publishedDate,
      tags,
    }));

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Header */}
        <FadeIn className="mb-14">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-10 group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Blog
          </h1>
          <p className="text-slate-500 text-sm">
            Writing about things I find interesting.
          </p>
        </FadeIn>

        <BlogPostList posts={sortedPosts} />
      </div>
    </div>
  );
}
