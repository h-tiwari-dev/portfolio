import Link from 'next/link';
import { getAllPosts } from '@/lib/reader';
import { ArrowLeft, Calendar, Tag, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export default async function BlogPage() {
  const posts = await getAllPosts();

  // Sort posts by date (newest first)
  const sortedPosts = posts.sort((a, b) => {
    if (!a.publishedDate || !b.publishedDate) return 0;
    return (
      new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    );
  });

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] relative">
      {/* Background Effects - Matching main site */}
      <div className="fixed inset-0 bg-grid opacity-10 pointer-events-none z-[1]"></div>
      <div className="fixed inset-0 scanlines pointer-events-none z-[1] hidden sm:block"></div>

      {/* Gradient Orb Background */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-rose-400 transition-colors mb-10 group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="font-mono">cd ~</span>
          </Link>

          {/* Section Label */}
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-rose-500/50" />
            <span className="text-[11px] font-mono text-rose-400 tracking-[0.3em] uppercase">
              Knowledge Base
            </span>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-rose-500/50" />
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-yellow-300 to-orange-400">
              Blog
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-400 font-mono text-sm flex items-center gap-2">
            <span className="text-rose-500/50">$</span>
            <span className="typing-animation">cat thoughts.log | sort -r</span>
            <span className="inline-block w-2 h-4 bg-rose-500/50 animate-pulse ml-1"></span>
          </p>
        </motion.div>

        {/* Posts Grid */}
        {sortedPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 glass-card"
          >
            <p className="text-slate-500 font-mono text-sm">
              No posts found. Check back soon.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-8">
            {sortedPosts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`} className="block group">
                  <article className="glass-card p-6 sm:p-8 hover:border-rose-500/30 hover:bg-white/[0.04] transition-all duration-500 group-hover:shadow-[0_0_40px_-12px_rgba(255,51,102,0.2)]">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Cover Image */}
                      {post.coverImage && (
                        <div className="lg:w-1/3 shrink-0">
                          <div className="relative overflow-hidden rounded-xl border border-white/10 group-hover:border-rose-500/20 transition-colors">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-full h-48 lg:h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          {/* Title */}
                          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white group-hover:text-rose-400 transition-colors mb-3 leading-tight">
                            {post.title}
                          </h2>

                          {/* Excerpt */}
                          {post.excerpt && (
                            <p className="text-slate-400 text-sm sm:text-base leading-relaxed line-clamp-2 mb-4">
                              {post.excerpt}
                            </p>
                          )}
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-xs">
                          {/* Date */}
                          {post.publishedDate && (
                            <span className="flex items-center gap-1.5 font-mono text-slate-500">
                              <Calendar
                                size={12}
                                className="text-rose-500/50"
                              />
                              {new Date(post.publishedDate).toLocaleDateString(
                                'en-US',
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )}
                            </span>
                          )}

                          {/* Reading Time */}
                          {post.content && (
                            <span className="flex items-center gap-1.5 font-mono text-slate-500">
                              <Clock size={12} className="text-rose-500/50" />
                              {calculateReadingTime(
                                JSON.stringify(post.content)
                              )}{' '}
                              min read
                            </span>
                          )}

                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Tag size={12} className="text-rose-500/50" />
                              <div className="flex flex-wrap gap-2">
                                {post.tags.slice(0, 3).map((tag: string) => (
                                  <span
                                    key={tag}
                                    className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400/80 border border-rose-500/10 text-[10px] font-mono uppercase tracking-wider"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {post.tags.length > 3 && (
                                  <span className="px-2.5 py-1 text-slate-500 text-[10px] font-mono">
                                    +{post.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Read More Link */}
                          <span className="ml-auto flex items-center gap-1 text-rose-400/80 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Read Article
                            <ArrowRight
                              size={12}
                              className="group-hover:translate-x-1 transition-transform"
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 pt-8 border-t border-white/[0.06] text-center"
        >
          <p className="text-slate-500 text-sm font-mono">
            <span className="text-rose-500/50">$</span> echo "Thanks for
            reading!"
          </p>
        </motion.div>
      </div>
    </div>
  );
}
