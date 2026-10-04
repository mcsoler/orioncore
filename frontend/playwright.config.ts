import { defineConfig } from '@playwright/test';

// Usa el Chrome instalado (channel: 'chrome'): no descarga navegadores.
// Requiere `pnpm build` previo; sirve el build con `astro preview`.
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4330', channel: 'chrome' },
  webServer: {
    command: 'npx astro preview --port 4330',
    url: 'http://localhost:4330/',
    reuseExistingServer: !process.env.CI,
  },
});
