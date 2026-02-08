import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  integrations: [react(), keystatic()],
  vite: {
    resolve: {
      alias: {
        'react-dom/server': 'react-dom/server.edge',
      },
    },
  },
});
