import { config, fields, collection } from '@keystatic/core';

const isLocal = process.env.NODE_ENV === 'development';

export default config({
  storage: isLocal
    ? { kind: 'local' }
    : {
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
