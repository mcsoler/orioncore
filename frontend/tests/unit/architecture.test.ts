import { createRequire } from 'node:module';
import { cruise, type ICruiseResult } from 'dependency-cruiser';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const ruleSet = require('../../.dependency-cruiser.cjs');

async function violationsIn(path: string) {
  const result = await cruise([path], {
    ruleSet,
    validate: true,
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '\\.d\\.ts$' },
  });
  return (result.output as ICruiseResult).summary.violations.map((v) => v.rule.name);
}

describe('arquitectura hexagonal (dependency-cruiser)', () => {
  it('el código real no viola ninguna regla', async () => {
    expect(await violationsIn('src')).toEqual([]);
  });

  it('falla si el dominio importa algo de fuera', async () => {
    expect(await violationsIn('tests/fixtures/arch/src/domain')).toContain('domain-is-pure');
  });

  it('falla si la aplicación importa infraestructura', async () => {
    expect(await violationsIn('tests/fixtures/arch/src/application')).toContain(
      'application-depends-only-on-domain',
    );
  });

  it('falla si la UI instancia un adaptador fuera del composition root', async () => {
    expect(await violationsIn('tests/fixtures/arch/src/ui')).toContain(
      'adapters-only-in-composition-root',
    );
  });
});
