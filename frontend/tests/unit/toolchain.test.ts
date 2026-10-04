import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Local, DEV y producción deben construir con la misma versión de Node y pnpm.
const read = (file: string) => readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');

describe('toolchain', () => {
  const nvmrc = read('.nvmrc').trim();
  const pkg = JSON.parse(read('package.json'));
  const dockerfile = read('Dockerfile');

  it('.nvmrc fija una versión exacta de Node 22', () => {
    expect(nvmrc).toMatch(/^22\.\d+\.\d+$/);
  });

  it('el Dockerfile usa la misma versión que .nvmrc', () => {
    expect(dockerfile).toContain(`ARG NODE_VERSION=${nvmrc}`);
    expect(dockerfile).toMatch(/FROM node:\$\{NODE_VERSION\}-alpine AS builder/);
    expect(dockerfile).toMatch(/FROM node:\$\{NODE_VERSION\}-alpine AS runner/);
  });

  it('engines exige la versión de .nvmrc', () => {
    expect(pkg.engines.node).toBe(`>=${nvmrc} <23`);
  });

  it('pnpm está fijado a una versión exacta y el Dockerfile usa el lockfile', () => {
    expect(pkg.packageManager).toMatch(/^pnpm@\d+\.\d+\.\d+$/);
    expect(dockerfile).toContain('pnpm install --frozen-lockfile');
  });
});
