import Link from 'next/link';
import { getAllPosts } from '@/lib/reader';
import { ArrowLeft, Calendar, Tag, Clock, ArrowRight } from 'lucide-react';
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from '@/components/animations/FadeIn';

function calculateReadingTime(content: any): number {
  if (!content) return 0;
  const wordsPerMinute = 200;
  const text = typeof content === 'string' ? content : JSON.stringify(content);
  const words = text.split(/\s+/).filter((word) => word.length > 0).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
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
        <FadeIn className="mb-16">
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
        </FadeIn>

        {/* Posts Grid */}
        {sortedPosts.length === 0 ? (
          <FadeIn className="text-center py-20 glass-card">
            <p className="text-slate-500 font-mono text-sm">
              No posts found. Check back soon.
            </p>
          </FadeIn>
        ) : (
          <StaggerContainer className="grid gap-6">
            {sortedPosts.map((post, index) => (
              <StaggerItem key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="block group">
                  <article className="relative overflow-hidden border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-transparent hover:border-rose-500/25 hover:from-white/[0.05] hover:to-rose-500/[0.02] transition-all duration-500 group-hover:shadow-[0_4px_20px_-4px_rgba(255,51,102,0.15)] p-5 sm:p-6">
                    {/* Left accent border */}
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-rose-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Post number indicator */}
                    <div className="absolute top-4 right-4 text-[10px] font-mono text-slate-600 group-hover:text-rose-500/50 transition-colors">
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    <div className="flex flex-col lg:flex-row gap-5">
                      {/* Cover Image */}
                      {post.coverImage && (
                        <div className="lg:w-2/5 shrink-0">
                          <div className="relative overflow-hidden border border-white/[0.08] group-hover:border-rose-500/20 transition-all duration-500 shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-full h-44 lg:h-48 object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60"></div>
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          {/* Title */}
                          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white group-hover:text-rose-400 transition-colors mb-2 leading-tight">
                            {post.title}
                          </h2>

                          {/* Excerpt */}
                          {post.excerpt && (
                            <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4 group-hover:text-slate-300 transition-colors">
                              {post.excerpt}
                            </p>
                          )}
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-3 text-[11px] pt-3 border-t border-white/[0.04]">
                          {/* Date */}
                          {post.publishedDate && (
                            <span className="flex items-center gap-1.5 font-mono text-slate-500">
                              <Calendar
                                size={11}
                                className="text-rose-500/60"
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
                              <Clock size={11} className="text-rose-500/60" />
                              {calculateReadingTime(
                                JSON.stringify(post.content)
                              )}{' '}
                              min
                            </span>
                          )}

                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex items-center gap-1.5 ml-auto">
                              {post.tags.slice(0, 2).map((tag: string) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 bg-white/[0.04] text-slate-400 border border-white/[0.06] text-[10px] font-mono uppercase tracking-wide group-hover:border-rose-500/20 group-hover:text-rose-400/70 transition-colors"
                                >
                                  {tag}
                                </span>
                              ))}
                              {post.tags.length > 2 && (
                                <span className="text-slate-600 text-[10px] font-mono">
                                  +{post.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Footer */}
        <FadeIn
          delay={0.5}
          className="mt-16 pt-8 border-t border-white/[0.06] text-center"
        >
          <p className="text-slate-500 text-sm font-mono">
            <span className="text-rose-500/50">$</span> echo &quot;Thanks for
            reading!&quot;
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
