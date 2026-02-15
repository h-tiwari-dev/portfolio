'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import MarkdocRenderer, { transformContent } from '@/components/blog/MarkdocRenderer';

type PostStatus = 'draft' | 'in_review' | 'scheduled' | 'published' | 'archived';

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  status: PostStatus;
  published_date: string | null;
  scheduled_date: string | null;
  tags_json: string;
  categories_json: string;
  cover_image: string | null;
  cover_image_alt: string | null;
  seo_meta_title: string | null;
  seo_meta_description: string | null;
  seo_canonical_url: string | null;
  seo_og_image: string | null;
  seo_twitter_card: string | null;
  editorial_comments_json?: string;
};

type Revision = {
  id: number;
  revision_type: string;
  actor: string;
  created_at: string;
};

type MediaFile = {
  key: string;
  url: string;
  size: number;
  uploaded: string;
};

type FormState = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  status: PostStatus;
  publishedDate: string;
  scheduledDate: string;
  tags: string;
  categories: string;
  coverImage: string;
  coverImageAlt: string;
  seoMetaTitle: string;
  seoMetaDescription: string;
  seoCanonicalUrl: string;
  seoOgImage: string;
  seoTwitterCard: string;
  editorialComments: string[];
};

const emptyForm: FormState = {
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  status: 'draft',
  publishedDate: '',
  scheduledDate: '',
  tags: '',
  categories: '',
  coverImage: '',
  coverImageAlt: '',
  seoMetaTitle: '',
  seoMetaDescription: '',
  seoCanonicalUrl: '',
  seoOgImage: '',
  seoTwitterCard: 'summary_large_image',
  editorialComments: [],
};

function parseStringArray(raw: string | undefined | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export default function AdminPage() {
  const [workflowToken, setWorkflowToken] = useState('');
  const [workerBase, setWorkerBase] = useState(
    process.env.NEXT_PUBLIC_BLOG_API_BASE ||
      'https://portfolio-worker.h-tiwari-dev.workers.dev'
  );
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [history, setHistory] = useState<Revision[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [statusFilter, setStatusFilter] = useState<'all' | PostStatus>('all');
  const [searchText, setSearchText] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState(JSON.stringify(emptyForm));
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [previewMode, setPreviewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [mediaSearch, setMediaSearch] = useState('');
  const [cursorInfo, setCursorInfo] = useState({ line: 1, column: 1 });
  const [rightTab, setRightTab] = useState<'meta' | 'media' | 'outline' | 'schedule' | 'history'>('meta');
  const [showExplorer, setShowExplorer] = useState(false);
  const [showInspector, setShowInspector] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const storedWorker = localStorage.getItem('blog_worker_base');
    const storedToken = localStorage.getItem('blog_workflow_token');
    if (storedWorker) setWorkerBase(storedWorker);
    if (storedToken) setWorkflowToken(storedToken);
  }, []);

  useEffect(() => {
    localStorage.setItem('blog_worker_base', workerBase);
  }, [workerBase]);

  useEffect(() => {
    localStorage.setItem('blog_workflow_token', workflowToken);
  }, [workflowToken]);

  const selectedPost = useMemo(
    () => posts.find((p) => p.slug === selectedSlug) || null,
    [posts, selectedSlug]
  );

  const stats = useMemo(() => {
    const by = {
      draft: 0,
      in_review: 0,
      scheduled: 0,
      published: 0,
      archived: 0,
    } as Record<PostStatus, number>;
    for (const p of posts) by[p.status] += 1;
    return by;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return posts.filter((post) => {
      if (statusFilter !== 'all' && post.status !== statusFilter) return false;
      if (!q) return true;
      return (
        post.slug.toLowerCase().includes(q) ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q)
      );
    });
  }, [posts, searchText, statusFilter]);

  const scheduledPosts = useMemo(
    () =>
      posts
        .filter((post) => post.status === 'scheduled' && !!post.scheduled_date)
        .sort((a, b) => (a.scheduled_date || '').localeCompare(b.scheduled_date || '')),
    [posts]
  );

  const formSnapshot = useMemo(() => JSON.stringify(form), [form]);
  const hasUnsavedChanges = formSnapshot !== lastSavedSnapshot;

  const previewContent = useMemo(() => {
    try {
      return transformContent(form.content || '');
    } catch {
      return null;
    }
  }, [form.content]);

  const wordCount = useMemo(
    () => form.content.split(/\s+/).filter(Boolean).length,
    [form.content]
  );

  const readMinutes = useMemo(() => Math.max(1, Math.ceil(wordCount / 220)), [wordCount]);

  const headingOutline = useMemo(() => {
    const lines = form.content.split('\n');
    const outline: Array<{ level: number; text: string; line: number }> = [];
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (!match) return;
      outline.push({ level: match[1].length, text: match[2], line: index + 1 });
    });
    return outline;
  }, [form.content]);

  const filteredMediaFiles = useMemo(() => {
    const q = mediaSearch.trim().toLowerCase();
    if (!q) return mediaFiles;
    return mediaFiles.filter(
      (file) => file.key.toLowerCase().includes(q) || file.url.toLowerCase().includes(q)
    );
  }, [mediaFiles, mediaSearch]);

  const callAdminApi = useCallback(
    async (path: string, init?: RequestInit) => {
      const base = workerBase.replace(/\/+$/, '');
      const headers = new Headers(init?.headers || {});

      if (workflowToken) {
        headers.set('Authorization', `Bearer ${workflowToken}`);
      }

      if (!(init?.body instanceof FormData) && !headers.get('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }

      const response = await fetch(`${base}${path}`, {
        ...init,
        headers,
      });

      const text = await response.text();
      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = { error: text };
      }

      if (!response.ok) {
        throw new Error(json?.error || `Request failed (${response.status})`);
      }
      return json;
    },
    [workerBase, workflowToken]
  );

  const hydrateFormFromPost = useCallback((post: Post | null) => {
    if (!post) {
      setForm(emptyForm);
      setLastSavedSnapshot(JSON.stringify(emptyForm));
      return;
    }

    const nextForm: FormState = {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      status: post.status,
      publishedDate: post.published_date || '',
      scheduledDate: post.scheduled_date || '',
      tags: parseStringArray(post.tags_json).join(', '),
      categories: parseStringArray(post.categories_json).join(', '),
      coverImage: post.cover_image || '',
      coverImageAlt: post.cover_image_alt || '',
      seoMetaTitle: post.seo_meta_title || '',
      seoMetaDescription: post.seo_meta_description || '',
      seoCanonicalUrl: post.seo_canonical_url || '',
      seoOgImage: post.seo_og_image || '',
      seoTwitterCard: post.seo_twitter_card || 'summary_large_image',
      editorialComments: parseStringArray(post.editorial_comments_json),
    };

    setForm(nextForm);
    setLastSavedSnapshot(JSON.stringify(nextForm));
  }, []);

  const loadPosts = useCallback(async () => {
    if (!workflowToken) return;
    setLoading(true);
    setMessage('Loading posts...');
    try {
      const search = statusFilter === 'all' ? '' : `?status=${statusFilter}`;
      const data = await callAdminApi(`/api/blog/posts${search}`);
      setPosts(data.posts || []);
      setMessage(`Loaded ${data.posts?.length || 0} posts.`);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [callAdminApi, statusFilter, workflowToken]);

  const loadHistory = useCallback(
    async (slug: string) => {
      if (!slug) return;
      try {
        const data = await callAdminApi(
          `/api/blog/history?slug=${encodeURIComponent(slug)}&limit=30`
        );
        setHistory(data.history || []);
      } catch (error) {
        setMessage((error as Error).message);
      }
    },
    [callAdminApi]
  );

  const loadMedia = useCallback(async () => {
    if (!workflowToken) return;
    setMediaLoading(true);
    try {
      const data = await callAdminApi('/api/blog/media?limit=100');
      setMediaFiles(data.files || []);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setMediaLoading(false);
    }
  }, [callAdminApi, workflowToken]);

  useEffect(() => {
    if (!selectedPost) {
      hydrateFormFromPost(null);
      setHistory([]);
      return;
    }
    hydrateFormFromPost(selectedPost);
    setScheduleDate(selectedPost.scheduled_date || '');
    void loadHistory(selectedPost.slug);
  }, [hydrateFormFromPost, loadHistory, selectedPost]);

  const buildPayload = useCallback(() => {
    return {
      slug: form.slug,
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      status: form.status,
      publishedDate: form.publishedDate || null,
      scheduledDate: form.scheduledDate || null,
      tags: form.tags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      categories: form.categories
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      coverImage: form.coverImage || null,
      coverImageAlt: form.coverImageAlt || null,
      seo: {
        metaTitle: form.seoMetaTitle || null,
        metaDescription: form.seoMetaDescription || null,
        canonicalUrl: form.seoCanonicalUrl || null,
        ogImage: form.seoOgImage || null,
        twitterCard: form.seoTwitterCard || null,
      },
      editorialComments: form.editorialComments,
      actor: 'admin-ui',
    };
  }, [form]);

  const savePost = useCallback(
    async (opts?: { autosave?: boolean }) => {
      if (!form.slug || !workflowToken) return;

      if (opts?.autosave) {
        setAutoSaving(true);
      } else {
        setLoading(true);
        setMessage('Saving post...');
      }

      try {
        await callAdminApi('/api/blog/posts', {
          method: 'POST',
          body: JSON.stringify(buildPayload()),
        });

        await loadPosts();
        setSelectedSlug(form.slug);
        setLastSavedSnapshot(JSON.stringify(form));
        setLastSavedAt(new Date().toISOString());
        if (!opts?.autosave) {
          setMessage('Post saved.');
        }
      } catch (error) {
        setMessage((error as Error).message);
      } finally {
        setAutoSaving(false);
        setLoading(false);
      }
    },
    [buildPayload, callAdminApi, form, loadPosts, workflowToken]
  );

  useEffect(() => {
    if (!autoSaveEnabled || !hasUnsavedChanges || !workflowToken || !form.slug || loading) return;
    const timeout = setTimeout(() => {
      void savePost({ autosave: true });
    }, 1300);
    return () => clearTimeout(timeout);
  }, [autoSaveEnabled, form.slug, hasUnsavedChanges, loading, savePost, workflowToken]);

  const runWorkflow = useCallback(
    async (action: 'publish' | 'schedule' | 'archive' | 'unpublish', targetSlug?: string) => {
      const slug = targetSlug || form.slug;
      if (!slug) return;
      setLoading(true);
      setMessage(`Running ${action}...`);
      try {
        await callAdminApi('/api/blog/workflow', {
          method: 'POST',
          body: JSON.stringify({
            action,
            slug,
            date: action === 'schedule' ? scheduleDate : undefined,
            actor: 'admin-ui',
          }),
        });
        await loadPosts();
        setSelectedSlug(slug);
        await loadHistory(slug);
        setMessage(`Workflow ${action} complete.`);
      } catch (error) {
        setMessage((error as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [callAdminApi, form.slug, loadHistory, loadPosts, scheduleDate]
  );

  async function restoreRevision(revisionId: number) {
    if (!form.slug) return;
    if (!confirm(`Restore revision #${revisionId}?`)) return;

    setLoading(true);
    setMessage(`Restoring revision ${revisionId}...`);
    try {
      await callAdminApi('/api/blog/restore', {
        method: 'POST',
        body: JSON.stringify({
          slug: form.slug,
          revisionId,
          actor: 'admin-ui',
        }),
      });
      await loadPosts();
      setSelectedSlug(form.slug);
      await loadHistory(form.slug);
      setMessage('Revision restored.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function deletePost() {
    if (!form.slug) return;
    if (!confirm(`Delete post "${form.slug}" permanently?`)) return;

    setLoading(true);
    setMessage('Deleting post...');
    try {
      await callAdminApi(`/api/blog/posts?slug=${encodeURIComponent(form.slug)}`, {
        method: 'DELETE',
      });
      setPosts((prev) => prev.filter((post) => post.slug !== form.slug));
      setSelectedSlug('');
      setHistory([]);
      setForm(emptyForm);
      setLastSavedSnapshot(JSON.stringify(emptyForm));
      setMessage('Post deleted.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function uploadOneMedia(file: File): Promise<{ url: string; key: string }> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'blog');
    const data = await callAdminApi('/api/blog/media', {
      method: 'POST',
      body: fd,
    });
    return { url: data?.file?.url || '', key: data?.file?.key || file.name };
  }

  async function uploadMedia(files: FileList | File[], insertIntoEditor = false) {
    if (!workflowToken) return;
    const list = Array.from(files);
    if (list.length === 0) return;

    setUploadingMedia(true);
    setMessage(`Uploading ${list.length} file(s)...`);
    try {
      const uploaded: Array<{ url: string; key: string }> = [];
      for (const file of list) {
        uploaded.push(await uploadOneMedia(file));
      }
      await loadMedia();
      if (insertIntoEditor) {
        const markdown = uploaded
          .filter((item) => item.url)
          .map((item) => `![${item.key}](${item.url})`)
          .join('\n');
        if (markdown) insertAtCursor(`\n${markdown}\n`);
      }
      setMessage('Media uploaded.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setUploadingMedia(false);
    }
  }

  async function deleteMedia(key: string) {
    if (!confirm(`Delete media ${key}?`)) return;
    try {
      await callAdminApi(`/api/blog/media?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      setMediaFiles((prev) => prev.filter((f) => f.key !== key));
    } catch (error) {
      setMessage((error as Error).message);
    }
  }

  const replaceSelection = useCallback((before: string, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = form.content.slice(start, end) || 'text';
    const next =
      form.content.slice(0, start) + before + selected + after + form.content.slice(end);

    setForm((prev) => ({ ...prev, content: next }));
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + before.length + selected.length + after.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }, [form.content]);

  const insertAtCursor = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = form.content.slice(0, start) + text + form.content.slice(end);

    setForm((prev) => ({ ...prev, content: next }));
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + text.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }, [form.content]);

  const addBlock = useCallback((block: string) => {
    insertAtCursor(`\n${block}\n`);
  }, [insertAtCursor]);

  const markdownActions = [
    { label: 'H1', run: () => addBlock('# Heading') },
    { label: 'H2', run: () => addBlock('## Section') },
    { label: 'B', run: () => replaceSelection('**', '**') },
    { label: 'I', run: () => replaceSelection('*', '*') },
    { label: 'Code', run: () => replaceSelection('`', '`') },
    { label: 'Quote', run: () => addBlock('> Quote') },
    { label: 'UL', run: () => addBlock('- Item 1\n- Item 2') },
    { label: 'OL', run: () => addBlock('1. Item 1\n2. Item 2') },
    { label: 'Link', run: () => replaceSelection('[', '](https://example.com)') },
    { label: 'Image', run: () => addBlock('![alt](https://example.com/image.png)') },
    { label: 'Table', run: () => addBlock('| Col A | Col B |\n| --- | --- |\n| A | B |') },
    { label: 'Fence', run: () => addBlock('```ts\nconsole.log("hello");\n```') },
    { label: 'Demo', run: () => addBlock('{% interactiveDemo preset="sorting" /%}') },
    { label: 'Callout', run: () => addBlock('> [!NOTE]\n> Important note') },
    { label: 'Checklist', run: () => addBlock('- [ ] Task 1\n- [x] Task 2') },
  ];

  function onEditorKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Tab') {
      event.preventDefault();
      insertAtCursor('  ');
      return;
    }
    if (!(event.metaKey || event.ctrlKey)) return;
    const key = event.key.toLowerCase();
    if (key === 'b') {
      event.preventDefault();
      replaceSelection('**', '**');
    } else if (key === 'i') {
      event.preventDefault();
      replaceSelection('*', '*');
    } else if (key === 'k') {
      event.preventDefault();
      replaceSelection('[', '](https://example.com)');
    } else if (key === 's') {
      event.preventDefault();
      void savePost();
    }
  }

  function updateCursorInfo() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const before = textarea.value.slice(0, textarea.selectionStart);
    const lines = before.split('\n');
    setCursorInfo({
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    });
  }

  async function handleEditorPaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = Array.from(event.clipboardData.items || []);
    const images = items
      .filter((item) => item.type.startsWith('image/'))
      .map((item) => item.getAsFile())
      .filter((file): file is File => !!file);

    if (images.length === 0) return;
    event.preventDefault();
    await uploadMedia(images, true);
  }

  function jumpToLine(line: number) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const lines = form.content.split('\n');
    let offset = 0;
    for (let i = 0; i < Math.min(line - 1, lines.length); i += 1) {
      offset += lines[i].length + 1;
    }
    textarea.focus();
    textarea.setSelectionRange(offset, offset);
    updateCursorInfo();
  }

  return (
    <main className="min-h-screen bg-[#0f111a] text-[#d4d4d4] p-3">
      <div className="mx-auto max-w-[1950px]">
        <header className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#2a2d2e] bg-[#181a1f] px-3 py-1.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[#9cdcfe]">EDITORIAL STUDIO</span>
            <span className="text-[#808080]">Draft {stats.draft}</span>
            <span className="text-[#808080]">Review {stats.in_review}</span>
            <span className="text-[#808080]">Scheduled {stats.scheduled}</span>
            <span className="text-[#808080]">Published {stats.published}</span>
          </div>
          <div className="text-[#808080]">
            {autoSaving ? 'Autosaving' : hasUnsavedChanges ? 'Unsaved' : 'Saved'}
            {lastSavedAt ? ` · ${new Date(lastSavedAt).toLocaleTimeString()}` : ''}
          </div>
        </header>

        <div className="grid grid-cols-[48px_1fr] gap-2">
          <aside className="rounded-md border border-[#2a2d2e] bg-[#181a1f] p-1 flex flex-col gap-1">
            <button onClick={() => setShowExplorer((v) => !v)} className={`h-9 rounded ${showExplorer ? 'bg-[#2a2d2e]' : 'hover:bg-[#24262b]'}`} title="Explorer">E</button>
            <button onClick={() => setShowInspector((v) => !v)} className={`h-9 rounded ${showInspector ? 'bg-[#2a2d2e]' : 'hover:bg-[#24262b]'}`} title="Inspector">I</button>
          </aside>

          <div className={`grid gap-2 ${showExplorer && showInspector ? 'xl:grid-cols-[180px_1fr_260px]' : showExplorer ? 'xl:grid-cols-[180px_1fr]' : showInspector ? 'xl:grid-cols-[1fr_260px]' : 'xl:grid-cols-[1fr]'}`}>
            {showExplorer && (
              <section className="rounded-md border border-[#2a2d2e] bg-[#181a1f] p-2 space-y-2">
                <details>
                  <summary className="cursor-pointer text-[11px] text-[#9aa0a6]">Connection</summary>
                  <div className="mt-2 space-y-2">
                    <input value={workerBase} onChange={(e) => setWorkerBase(e.target.value)} className="w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1.5 text-xs" placeholder="worker url" />
                    <input type="password" value={workflowToken} onChange={(e) => setWorkflowToken(e.target.value)} className="w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1.5 text-xs" placeholder="token" />
                    <div className="grid grid-cols-2 gap-1">
                      <button onClick={loadPosts} disabled={loading || !workflowToken} className="rounded border border-[#3c3c3c] px-2 py-1.5 text-[11px] hover:bg-[#2a2d2e]">Load</button>
                      <button onClick={loadMedia} disabled={mediaLoading || !workflowToken} className="rounded border border-[#3c3c3c] px-2 py-1.5 text-[11px] hover:bg-[#2a2d2e]">Media</button>
                    </div>
                  </div>
                </details>
                <div className="space-y-2">
                  <p className="text-[10px] text-[#808080]">{message}</p>
                </div>
                <div className="flex gap-1">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | PostStatus)} className="rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1.5 text-[11px]">
                    <option value="all">all</option><option value="draft">draft</option><option value="in_review">in_review</option><option value="scheduled">scheduled</option><option value="published">published</option><option value="archived">archived</option>
                  </select>
                  <input value={searchText} onChange={(e) => setSearchText(e.target.value)} className="flex-1 rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1.5 text-[11px]" placeholder="search" />
                </div>
                <button onClick={() => { setSelectedSlug(''); setHistory([]); setForm(emptyForm); setLastSavedSnapshot(JSON.stringify(emptyForm)); }} className="w-full rounded border border-[#3c3c3c] px-2 py-1.5 text-[11px] hover:bg-[#2a2d2e]">New Post</button>
                <div className="max-h-[74vh] space-y-1 overflow-auto">
                  {filteredPosts.map((post) => (
                    <button key={post.slug} onClick={() => setSelectedSlug(post.slug)} className={`w-full rounded border px-2 py-2 text-left ${selectedSlug === post.slug ? 'border-[#4ec9b0] bg-[#213236]' : 'border-[#2a2d2e] hover:border-[#3c3c3c]'}`}>
                      <div className="truncate text-xs">{post.title || post.slug}</div>
                      <div className="mt-0.5 truncate text-[10px] text-[#808080]">{post.slug}</div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-md border border-[#2a2d2e] bg-[#181a1f] p-0 overflow-hidden">
              <div className="border-b border-[#2a2d2e] bg-[#1e1e1e] px-3 py-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded bg-[#2a2d2e] px-2 py-1">{form.title || 'untitled.mdoc'}</span>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="title" className="min-w-[220px] flex-1 rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1" />
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PostStatus })} className="rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1">
                  <option value="draft">draft</option><option value="in_review">in_review</option><option value="scheduled">scheduled</option><option value="published">published</option><option value="archived">archived</option>
                </select>
                <button onClick={() => setPreviewMode('edit')} className={`rounded border px-2 py-1 ${previewMode === 'edit' ? 'border-[#4ec9b0]' : 'border-[#3c3c3c]'}`}>Edit</button>
                <button onClick={() => setPreviewMode('split')} className={`rounded border px-2 py-1 ${previewMode === 'split' ? 'border-[#4ec9b0]' : 'border-[#3c3c3c]'}`}>Split</button>
                <button onClick={() => setPreviewMode('preview')} className={`rounded border px-2 py-1 ${previewMode === 'preview' ? 'border-[#4ec9b0]' : 'border-[#3c3c3c]'}`}>Preview</button>
                {form.slug && <Link href={`/blog/${form.slug}`} target="_blank" className="rounded border border-[#3c3c3c] px-2 py-1">Open</Link>}
              </div>

              <div className="border-b border-[#2a2d2e] bg-[#181a1f] px-3 py-2 flex flex-wrap gap-1.5">
                {markdownActions.map((action) => (
                  <button key={action.label} onClick={action.run} className="rounded border border-[#3c3c3c] px-2 py-1 text-[11px] hover:bg-[#2a2d2e]">{action.label}</button>
                ))}
              </div>

              <div className="grid gap-0" style={{ gridTemplateColumns: previewMode === 'split' ? '1fr 1fr' : '1fr' }}>
                {previewMode !== 'preview' && (
                  <textarea ref={textareaRef} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} onKeyDown={onEditorKeyDown} onKeyUp={updateCursorInfo} onClick={updateCursorInfo} onSelect={updateCursorInfo} onPaste={(e) => void handleEditorPaste(e)} placeholder="Write markdown here..." className="h-[78vh] min-h-[620px] w-full resize-none border-r border-[#2a2d2e] bg-[#1e1e1e] px-4 py-3 font-mono text-sm leading-relaxed outline-none" />
                )}
                {previewMode !== 'edit' && (
                  <div className="h-[78vh] min-h-[620px] overflow-auto bg-[#1b1f27] px-5 py-4">
                    {previewContent ? <article className="prose-custom max-w-none"><MarkdocRenderer content={previewContent} /></article> : <p className="text-xs text-[#808080]">Preview unavailable for current content.</p>}
                  </div>
                )}
              </div>

              <div className="border-t border-[#2a2d2e] bg-[#1e1e1e] px-3 py-2 text-[11px] text-[#808080] flex flex-wrap justify-between gap-2">
                <span>{wordCount} words · ~{readMinutes} min · Ln {cursorInfo.line}, Col {cursorInfo.column}</span>
                <span>{autoSaving ? 'autosaving' : hasUnsavedChanges ? 'unsaved' : 'saved'}</span>
              </div>
            </section>

            {showInspector && (
              <section className="rounded-md border border-[#2a2d2e] bg-[#181a1f] p-3 space-y-3">
                <div className="grid grid-cols-5 gap-1 rounded border border-[#2a2d2e] bg-[#1e1e1e] p-1 text-[11px]">
                  {(['meta', 'media', 'outline', 'schedule', 'history'] as const).map((tab) => (
                    <button key={tab} onClick={() => setRightTab(tab)} className={`rounded px-1 py-1 capitalize ${rightTab === tab ? 'bg-[#2a2d2e] text-[#9cdcfe]' : 'text-[#808080] hover:bg-[#252526]'}`}>{tab}</button>
                  ))}
                </div>

                {rightTab === 'meta' && (
                  <div className="space-y-2">
                    <input value={form.slug} onChange={(e) => setForm({ ...form, slug: normalizeSlug(e.target.value) })} placeholder="slug" className="w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1.5 text-xs" />
                    <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="tags comma-separated" className="w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1.5 text-xs" />
                    <input value={form.categories} onChange={(e) => setForm({ ...form, categories: e.target.value })} placeholder="categories comma-separated" className="w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1.5 text-xs" />
                    <input value={form.publishedDate} onChange={(e) => setForm({ ...form, publishedDate: e.target.value })} placeholder="published YYYY-MM-DD" className="w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1.5 text-xs" />
                    <input value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} placeholder="scheduled YYYY-MM-DD" className="w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1.5 text-xs" />
                    <input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="cover image URL" className="w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1.5 text-xs" />
                    <input value={form.coverImageAlt} onChange={(e) => setForm({ ...form, coverImageAlt: e.target.value })} placeholder="cover image alt" className="w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1.5 text-xs" />
                    <input value={form.seoMetaTitle} onChange={(e) => setForm({ ...form, seoMetaTitle: e.target.value })} placeholder="SEO meta title" className="w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1.5 text-xs" />
                    <input value={form.seoCanonicalUrl} onChange={(e) => setForm({ ...form, seoCanonicalUrl: e.target.value })} placeholder="SEO canonical URL" className="w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1.5 text-xs" />
                    <input value={form.seoOgImage} onChange={(e) => setForm({ ...form, seoOgImage: e.target.value })} placeholder="SEO OG image URL" className="w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1.5 text-xs" />
                    <select value={form.seoTwitterCard} onChange={(e) => setForm({ ...form, seoTwitterCard: e.target.value })} className="w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1.5 text-xs">
                      <option value="summary_large_image">summary_large_image</option><option value="summary">summary</option>
                    </select>
                    <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="excerpt" className="h-20 w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1.5 text-xs" />
                    <textarea value={form.seoMetaDescription} onChange={(e) => setForm({ ...form, seoMetaDescription: e.target.value })} placeholder="SEO meta description" className="h-24 w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1.5 text-xs" />
                    <div className="space-y-1">
                      <div className="text-[11px] text-[#808080]">Editorial comments</div>
                      <div className="max-h-20 space-y-1 overflow-auto">
                        {form.editorialComments.map((comment, idx) => (
                          <div key={`${comment}-${idx}`} className="flex items-start justify-between gap-2 rounded border border-[#2a2d2e] p-1.5">
                            <p className="text-[11px] text-[#cccccc]">{comment}</p>
                            <button onClick={() => setForm({ ...form, editorialComments: form.editorialComments.filter((_, i) => i !== idx) })} className="text-[10px] text-[#ce9178]">x</button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="add comment" className="flex-1 rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1 text-[11px]" />
                        <button onClick={() => { const next = newComment.trim(); if (!next) return; setForm({ ...form, editorialComments: [...form.editorialComments, next] }); setNewComment(''); }} className="rounded border border-[#3c3c3c] px-2 py-1 text-[11px]">Add</button>
                      </div>
                    </div>
                  </div>
                )}

                {rightTab === 'media' && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-xs font-semibold">Media</h3>
                      <button onClick={loadMedia} className="rounded border border-[#3c3c3c] px-2 py-1 text-[11px]">Refresh</button>
                    </div>
                    <input value={mediaSearch} onChange={(e) => setMediaSearch(e.target.value)} placeholder="search media..." className="mb-2 w-full rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1.5 text-xs" />
                    <label className="mb-2 block cursor-pointer rounded border border-dashed border-[#3c3c3c] p-2 text-[11px] text-[#808080]">
                      {uploadingMedia ? 'Uploading...' : 'Upload images'}
                      <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => { if (!e.target.files) return; void uploadMedia(e.target.files); e.currentTarget.value = ''; }} />
                    </label>
                    <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void uploadMedia(e.dataTransfer.files, true); }} className="mb-2 text-[10px] text-[#808080]">Drop to upload+insert</div>
                    <div className="max-h-[54vh] space-y-2 overflow-auto">
                      {filteredMediaFiles.map((file) => (
                        <div key={file.key} className="rounded border border-[#2a2d2e] p-2 text-[11px]">
                          <div className="truncate font-mono">{file.key}</div>
                          <div className="mb-1 text-[#808080]">{formatBytes(file.size)}</div>
                          <div className="flex gap-1">
                            <button onClick={() => insertAtCursor(`![${file.key}](${file.url})`)} className="rounded border border-[#3c3c3c] px-1.5 py-0.5">Insert</button>
                            <button onClick={() => navigator.clipboard.writeText(file.url)} className="rounded border border-[#3c3c3c] px-1.5 py-0.5">Copy</button>
                            <button onClick={() => void deleteMedia(file.key)} className="rounded border border-[#f44747] px-1.5 py-0.5 text-[#f44747]">Del</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {rightTab === 'outline' && (
                  <div className="max-h-[70vh] space-y-1 overflow-auto">
                    {headingOutline.map((h, idx) => (
                      <button key={`${h.text}-${idx}`} onClick={() => jumpToLine(h.line)} className="block w-full truncate rounded border border-[#2a2d2e] px-2 py-1 text-left text-xs hover:border-[#3c3c3c]" style={{ paddingLeft: `${0.5 + (h.level - 1) * 0.4}rem` }}>{h.text}</button>
                    ))}
                  </div>
                )}

                {rightTab === 'schedule' && (
                  <div className="max-h-[70vh] space-y-2 overflow-auto">
                    {scheduledPosts.map((post) => (
                      <div key={post.slug} className="rounded border border-[#2a2d2e] p-2 text-[11px]">
                        <div className="truncate font-mono">{post.slug}</div>
                        <div className="text-[#808080]">{post.scheduled_date}</div>
                        <button onClick={() => runWorkflow('publish', post.slug)} className="mt-1 rounded border border-[#3c3c3c] px-1.5 py-0.5">Publish now</button>
                      </div>
                    ))}
                  </div>
                )}

                {rightTab === 'history' && (
                  <div className="max-h-[70vh] space-y-2 overflow-auto">
                    {history.map((item) => (
                      <div key={item.id} className="rounded border border-[#2a2d2e] p-2 text-[11px]">
                        <div className="font-mono">#{item.id} {item.revision_type}</div>
                        <div className="text-[#808080]">{item.actor} · {new Date(item.created_at).toLocaleString()}</div>
                        <button onClick={() => void restoreRevision(item.id)} className="mt-1 rounded border border-[#3c3c3c] px-1.5 py-0.5">Restore</button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-1 text-[11px]">
                  <button onClick={() => savePost()} disabled={loading || !workflowToken || !form.slug} className="rounded border border-[#4ec9b0] px-2 py-1 hover:bg-[#213236]">Save</button>
                  <button onClick={() => runWorkflow('publish')} disabled={loading || !form.slug} className="rounded border border-[#3c3c3c] px-2 py-1 hover:bg-[#252526]">Publish</button>
                  <button onClick={() => runWorkflow('archive')} disabled={loading || !form.slug} className="rounded border border-[#3c3c3c] px-2 py-1 hover:bg-[#252526]">Archive</button>
                  <button onClick={() => runWorkflow('unpublish')} disabled={loading || !form.slug} className="rounded border border-[#3c3c3c] px-2 py-1 hover:bg-[#252526]">Unpublish</button>
                  <input value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} placeholder="YYYY-MM-DD" className="rounded border border-[#3c3c3c] bg-[#1e1e1e] px-2 py-1" />
                  <button onClick={() => runWorkflow('schedule')} disabled={loading || !form.slug || !scheduleDate} className="rounded border border-[#3c3c3c] px-2 py-1 hover:bg-[#252526]">Schedule</button>
                  <button onClick={deletePost} disabled={loading || !form.slug} className="col-span-2 rounded border border-[#f44747] px-2 py-1 text-[#f44747] hover:bg-[#3a1f22]">Delete</button>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
