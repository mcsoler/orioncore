import { describe, expect, it } from 'vitest';
import type { ContentRepository } from '../../src/application/ports/out/ContentRepository';
import { GetHomeContent } from '../../src/application/use-cases/GetHomeContent';
import { StaticContentRepository } from '../../src/infrastructure/content/StaticContentRepository';
import content from '../../src/content/home/home.es.json';
import { homeContentFixture } from '../support/homeContent';

/** Contrato (Liskov): cualquier ContentRepository alimenta GetHomeContent sin cambios. */
function contentRepositoryContract(name: string, factory: () => ContentRepository) {
  describe(`Contrato ContentRepository: ${name}`, () => {
    it('getHome() entrega un contenido completo que GetHomeContent acepta', async () => {
      const view = await new GetHomeContent(factory()).execute();
      expect(view.services.items.length).toBeGreaterThan(0);
      expect(view.hero.title).toBeTruthy();
    });

    it('getHome() es idempotente', async () => {
      const repo = factory();
      const [a, b] = await Promise.all([repo.getHome(), repo.getHome()]);
      expect(new GetHomeContent({ getHome: async () => a })).toBeTruthy();
      expect(a.services.items.map((s) => s.href)).toEqual(b.services.items.map((s) => s.href));
    });
  });
}

contentRepositoryContract('StaticContentRepository', () => new StaticContentRepository(content));
contentRepositoryContract('en memoria (doble de prueba)', () => ({ getHome: async () => homeContentFixture() }));
