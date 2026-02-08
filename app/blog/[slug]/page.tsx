import Link from 'next/link';
import { getAllPosts, getPost } from '@/lib/reader';
import {
  ArrowLeft,
  Calendar,
  Tag,
  Clock,
  ArrowRight,
  Share2,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { motion } from 'framer-motion';
import MarkdocRenderer, {
  transformContent,
} from '@/components/blog/MarkdocRenderer';

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
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
    title: `${post.title} | Alpha Betrium`,
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center glass-card p-12"
        >
          <p className="text-slate-400 font-mono text-lg mb-4">
            404: Post Not Found
          </p>
          <Link
            href="/blog"
            className="text-rose-400 hover:text-rose-300 transition-colors font-mono text-sm"
          >
            cd ../blog
          </Link>
        </motion.div>
      </div>
    );
  }

  const content = transformContent(post.content);
  const readingTime = calculateReadingTime(JSON.stringify(post.content));

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] relative">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid opacity-10 pointer-events-none z-[1]"></div>
      <div className="fixed inset-0 scanlines pointer-events-none z-[1] hidden sm:block"></div>

      {/* Gradient Orbs */}
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10"
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-rose-400 transition-colors group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="font-mono">cd ../blog</span>
          </Link>

          {/* Share Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono mr-2 hidden sm:inline">
              Share:
            </span>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                post.title
              )}&url=${encodeURIComponent(
                `https://tiwariharsh.com/blog/${params.slug}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-rose-500/30 hover:bg-rose-500/10 transition-all"
              aria-label="Share on Twitter"
            >
              <Twitter
                size={14}
                className="text-slate-400 hover:text-rose-400"
              />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                `https://tiwariharsh.com/blog/${params.slug}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-rose-500/30 hover:bg-rose-500/10 transition-all"
              aria-label="Share on LinkedIn"
            >
              <Linkedin
                size={14}
                className="text-slate-400 hover:text-rose-400"
              />
            </a>
          </div>
        </motion.nav>

        {/* Post Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          {/* Section Label */}
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-rose-500/50" />
            <span className="text-[11px] font-mono text-rose-400 tracking-[0.3em] uppercase">
              Article
            </span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-rose-500/50" />
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_60px_-20px_rgba(255,51,102,0.15)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-auto object-cover max-h-[400px]"
              />
            </motion.div>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info Bar */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm py-4 border-y border-white/[0.06]">
            {/* Date */}
            {post.publishedDate && (
              <span className="flex items-center gap-2 font-mono text-slate-400">
                <Calendar size={14} className="text-rose-500/50" />
                {new Date(post.publishedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}

            {/* Reading Time */}
            <span className="flex items-center gap-2 font-mono text-slate-400">
              <Clock size={14} className="text-rose-500/50" />
              {readingTime} min read
            </span>

            {/* Divider */}
            <span className="hidden sm:block w-px h-4 bg-white/10"></span>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag size={14} className="text-rose-500/50" />
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400/80 border border-rose-500/10 text-xs font-mono uppercase tracking-wider hover:bg-rose-500/20 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.header>

        {/* Post Content */}
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 sm:p-8 lg:p-12"
        >
          <MarkdocRenderer content={content} />
        </motion.article>

        {/* Article Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 pt-8 border-t border-white/[0.06]"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Back Link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-rose-400 transition-colors group"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span className="font-mono">Back to all posts</span>
            </Link>

            {/* Share Section */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono">
                Share this article:
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    post.title
                  )}&url=${encodeURIComponent(
                    `https://tiwariharsh.com/blog/${params.slug}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-rose-500/30 hover:bg-rose-500/10 transition-all group"
                  aria-label="Share on Twitter"
                >
                  <Twitter
                    size={16}
                    className="text-slate-400 group-hover:text-rose-400 transition-colors"
                  />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    `https://tiwariharsh.com/blog/${params.slug}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-rose-500/30 hover:bg-rose-500/10 transition-all group"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin
                    size={16}
                    className="text-slate-400 group-hover:text-rose-400 transition-colors"
                  />
                </a>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `https://tiwariharsh.com/blog/${params.slug}`
                    )
                  }
                  className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-rose-500/30 hover:bg-rose-500/10 transition-all group"
                  aria-label="Copy link"
                >
                  <Share2
                    size={16}
                    className="text-slate-400 group-hover:text-rose-400 transition-colors"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Terminal-style Footer */}
          <div className="mt-8 p-4 rounded-lg bg-black/30 border border-white/[0.06] font-mono text-xs">
            <p className="text-slate-500">
              <span className="text-rose-500/50">$</span> cat /proc/author
            </p>
            <p className="text-slate-400 mt-1">Written by Alpha Betrium</p>
            <p className="text-slate-500 mt-2">
              <span className="text-rose-500/50">$</span> date -u
            </p>
            <p className="text-slate-400 mt-1">{new Date().toUTCString()}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
