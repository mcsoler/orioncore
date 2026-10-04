import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Testing Library limpia automáticamente solo con globals: true; aquí se hace explícito.
afterEach(cleanup);

// astro:assets registra las imágenes importadas en un global que solo crea el servidor de Astro.
(globalThis as { astroAsset?: { referencedImages: Set<string> } }).astroAsset ??= { referencedImages: new Set() };
