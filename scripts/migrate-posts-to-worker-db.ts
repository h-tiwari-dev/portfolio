import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';

const POSTS_DIR = resolve(process.cwd(), 'content/posts');
const WORKER_URL = process.env.BLOG_WORKER_URL;
const TOKEN = process.env.BLOG_WORKFLOW_TOKEN;

if (!WORKER_URL || !TOKEN) {
  console.error(
    'Missing env vars. Set BLOG_WORKER_URL and BLOG_WORKFLOW_TOKEN before running.'
  );
  process.exit(1);
}

function parseMdoc(raw: string): { frontmatter: string; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error('Could not parse frontmatter');
  return { frontmatter: match[1], body: match[2] };
}

function parseFrontmatter(frontmatter: string): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  const lines = frontmatter.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const kvMatch = line.match(/^(\w[\w-]*?):\s*(.*)$/);
    if (kvMatch) {
      const [, key, value] = kvMatch;

      if (value === '' && i + 1 < lines.length && lines[i + 1].startsWith('  - ')) {
        const arr: string[] = [];
        i++;
        while (i < lines.length && lines[i].startsWith('  - ')) {
          arr.push(lines[i].replace(/^\s+-\s+/, ''));
          i++;
        }
        fields[key] = arr;
        continue;
      }

      if (value === '>-') {
        let scalar = '';
        i++;
        while (i < lines.length && lines[i].startsWith('  ')) {
          scalar += (scalar ? ' ' : '') + lines[i].trim();
          i++;
        }
        fields[key] = scalar;
        continue;
      }

      fields[key] = value.replace(/^['"]|['"]$/g, '');
    }
    i++;
  }

  return fields;
}

async function upsertPost(slug: string, data: Record<string, unknown>, content: string) {
  const response = await fetch(`${WORKER_URL}/api/blog/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      slug,
      title: data.title || slug,
      excerpt: data.excerpt || '',
      content,
      status: data.status || 'draft',
      publishedDate: data.publishedDate || null,
      scheduledDate: data.scheduledDate || null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      categories: Array.isArray(data.categories) ? data.categories : [],
      coverImage: data.coverImage || null,
      coverImageAlt: data.coverImageAlt || null,
      seo: {
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        canonicalUrl: data.canonicalUrl || null,
      },
      actor: 'migration-script',
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed ${slug}: ${response.status} ${text}`);
  }
}

async function main() {
  const files = readdirSync(POSTS_DIR).filter((name) => name.endsWith('.mdoc'));
  for (const file of files) {
    const slug = file.replace(/\.mdoc$/, '');
    const raw = readFileSync(resolve(POSTS_DIR, file), 'utf8');
    const { frontmatter, body } = parseMdoc(raw);
    const data = parseFrontmatter(frontmatter);
    await upsertPost(slug, data, body);
    console.log(`Migrated: ${slug}`);
  }
  console.log(`Done. Migrated ${files.length} posts.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
