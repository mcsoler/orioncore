/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

// getViteConfig permite renderizar componentes .astro con el Container API.
export default getViteConfig({
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    environment: 'node',
    environmentMatchGlobs: [['tests/component/**/*.test.tsx', 'jsdom']],
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/domain/**', 'src/application/**'],
      exclude: ['**/ports/**', '**/dto/**'],
      thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 },
    },
  },
});
