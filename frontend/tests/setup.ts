import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Testing Library limpia automáticamente solo con globals: true; aquí se hace explícito.
afterEach(cleanup);
