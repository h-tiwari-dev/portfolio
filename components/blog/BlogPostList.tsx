'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface BlogPost {
  slug: string;
  title: string;
  excerpt?: string;
  publishedDate?: string | null;
  tags?: string[];
}

export function BlogPostList({ posts }: { posts: BlogPost[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags ?? []))
  ).sort();

  const filtered = activeTag
    ? posts.filter((p) => p.tags?.includes(activeTag))
    : posts;

  return (
    <>
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setActiveTag(null)}
            className={`text-xs font-mono px-2.5 py-1 border transition-colors ${
              activeTag === null
                ? 'text-rose-500 border-rose-900 bg-rose-950'
                : 'text-slate-500 border-neutral-800 hover:text-slate-300 hover:border-neutral-700'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`text-xs font-mono px-2.5 py-1 border transition-colors ${
                activeTag === tag
                  ? 'text-rose-500 border-rose-900 bg-rose-950'
                  : 'text-slate-500 border-neutral-800 hover:text-slate-300 hover:border-neutral-700'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-slate-500 text-sm py-20">No posts found.</p>
      ) : (
        <motion.div className="space-y-1" layout>
          <AnimatePresence mode="popLayout">
            {filtered.map((post) => (
              <motion.div
                key={post.slug}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/blog/${post.slug}`} className="block group">
                  <article className="py-5 border-b border-neutral-800 group-hover:border-neutral-700 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4 mb-1.5">
                      <h2 className="text-base font-medium text-slate-200 group-hover:text-white transition-colors leading-snug">
                        {post.title}
                      </h2>
                      {post.publishedDate && (
                        <span className="text-xs text-slate-600 font-mono shrink-0">
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
                    </div>

                    {post.excerpt && (
                      <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex items-center gap-2 mt-2.5">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] text-slate-600 font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </>
  );
}
