import Link from 'next/link';
import Image from 'next/image';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { getAllPosts, getPost } from '@/lib/reader';
import { ArrowLeft } from 'lucide-react';
import { FadeIn } from '@/components/animations/FadeIn';
import { CopyLinkButton } from '@/components/blog/CopyLinkButton';
import MarkdocRenderer, {
  transformContent,
} from '@/components/blog/MarkdocRenderer';

export const dynamicParams = false;
export const dynamic = 'force-static';

async function getLocalPostSlugs(): Promise<string[]> {
  try {
    const postsDir = path.join(process.cwd(), 'content', 'posts');
    const entries = await readdir(postsDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.mdoc'))
      .map((entry) => entry.name.replace(/\.mdoc$/, ''))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function calculateReadingTime(content: any): number {
  if (!content) return 0;
  const wordsPerMinute = 200;
  const text = typeof content === 'string' ? content : JSON.stringify(content);
  const words = text.split(/\s+/).filter((word) => word.length > 0).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export const generateStaticParams = async () => {
  const posts = await getAllPosts();
  const remoteSlugs = posts.map((post) => post.slug);
  const localSlugs = await getLocalPostSlugs();
  const slugs = Array.from(new Set([...remoteSlugs, ...localSlugs]));
  return slugs.map((slug) => ({ slug }));
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tiwariharsh.com';

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const canonical = post.seo?.canonicalUrl || `${siteUrl}/blog/${params.slug}`;
  const metaTitle = post.seo?.metaTitle || `${post.title} | Harsh Tiwari`;
  const metaDescription = post.seo?.metaDescription || post.excerpt;
  const ogImage = post.seo?.ogImage || post.coverImage || undefined;
  const ogImageUrl = ogImage
    ? ogImage.startsWith('http')
      ? ogImage
      : `${siteUrl}${ogImage}`
    : undefined;
  const twitterCard = post.seo?.twitterCard || 'summary_large_image';

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: 'article',
      url: canonical,
      images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
    },
    twitter: {
      card: twitterCard,
      title: metaTitle,
      description: metaDescription,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tiwariharsh.com';

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
  const ldImage = post.seo?.ogImage || post.coverImage || undefined;
  const ldImageUrl = ldImage
    ? ldImage.startsWith('http')
      ? ldImage
      : `${siteUrl}${ldImage}`
    : undefined;
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seo?.metaDescription || post.excerpt,
    datePublished: post.publishedDate || post.scheduledDate || undefined,
    dateModified: post.publishedDate || post.scheduledDate || undefined,
    image: ldImageUrl,
    mainEntityOfPage: `${siteUrl}/blog/${params.slug}`,
    author: {
      '@type': 'Person',
      name: 'Harsh Tiwari',
    },
    publisher: {
      '@type': 'Person',
      name: 'Harsh Tiwari',
    },
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
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
            <div className="overflow-hidden relative w-full aspect-[16/9] max-h-[400px]">
              <Image
                src={post.coverImage}
                alt={post.coverImageAlt || post.title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
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
