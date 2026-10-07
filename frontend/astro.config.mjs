import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import content from './src/content/home/home.es.json' with { type: 'json' };
import { StaticContentRepository } from './src/infrastructure/content/StaticContentRepository.ts';
import { RouteRegistry } from './src/domain/routing/RouteRegistry.ts';

// El sitemap solo incluye las rutas published del RouteRegistry (las draft llevan noindex).
const routes = RouteRegistry.create(new StaticContentRepository(content).getRoutes());
const published = new Set(routes.sitemapEntries());

export default defineConfig({
  site: 'https://orioncore.co',
  trailingSlash: 'always',
  integrations: [
    tailwind(),
    react(),
    sitemap({ filter: (page) => published.has(new URL(page).pathname) }),
  ],
  server: {
    host: '0.0.0.0',
    port: 4321,
  },
});
