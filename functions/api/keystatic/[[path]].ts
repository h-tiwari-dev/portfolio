/// <reference types="@cloudflare/workers-types" />
import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';
import { config, fields, collection } from '@keystatic/core';

interface Env {
  KEYSTATIC_GITHUB_CLIENT_ID: string;
  KEYSTATIC_GITHUB_CLIENT_SECRET: string;
  KEYSTATIC_SECRET: string;
}

// Keystatic config for GitHub mode
const keystaticConfig = config({
  storage: {
    kind: 'github',
    repo: 'h-tiwari-dev/portfolio',
  },
  collections: {
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'content/posts/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        excerpt: fields.text({ label: 'Excerpt', multiline: true }),
        publishedDate: fields.date({ label: 'Published Date' }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
        }),
        coverImage: fields.image({
          label: 'Cover Image',
          directory: 'public/content/posts',
          publicPath: '/content/posts',
        }),
        content: fields.markdoc({ label: 'Content' }),
      },
    }),
  },
});

interface KeystaticResponse {
  body: string | Uint8Array | null;
  status: number;
  headers?: Array<[string, string]>;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const handler = makeGenericAPIRouteHandler({
    config: keystaticConfig,
    clientId: env.KEYSTATIC_GITHUB_CLIENT_ID,
    clientSecret: env.KEYSTATIC_GITHUB_CLIENT_SECRET,
    secret: env.KEYSTATIC_SECRET,
  });

  const result = (await handler(request)) as KeystaticResponse;

  const headers = new Headers();
  if (result.headers) {
    for (const [key, value] of result.headers) {
      headers.append(key, value);
    }
  }

  return new Response(result.body as BodyInit | null, {
    status: result.status,
    headers,
  });
};
