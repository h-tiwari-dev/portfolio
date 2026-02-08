import Link from 'next/link';
import { getAllPosts } from '@/lib/reader';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-rose-400 transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            <span className="font-mono">cd ~</span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-rose-500/50" />
            <span className="text-[11px] font-mono text-rose-400 tracking-[0.3em] uppercase">
              Blog
            </span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-rose-500/50" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-yellow-300 to-orange-400">
              Posts
            </span>
          </h1>
          <p className="text-slate-400 font-mono text-sm">
            {'>'} cat thoughts.log | sort -r
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 font-mono text-sm">
              No posts found. Check back soon.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block group"
              >
                <article className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-rose-500/30 hover:bg-white/[0.04] transition-all duration-300">
                  <div className="flex flex-col gap-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-rose-400 transition-colors">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      {post.publishedDate && (
                        <span className="flex items-center gap-1.5 font-mono">
                          <Calendar size={12} className="text-rose-500/50" />
                          {new Date(post.publishedDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
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
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
