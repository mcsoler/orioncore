import { describe, expect, it } from 'vitest';
import { ContentValidationError, StaticContentRepository } from '../../../src/infrastructure/content/StaticContentRepository';
import { GetHomeContent } from '../../../src/application/use-cases/GetHomeContent';
import { RouteRegistry } from '../../../src/domain/routing/RouteRegistry';
import content from '../../../src/content/home.es.json';
import { SeoMetaBuilder } from '../../../src/infrastructure/seo/SeoMetaBuilder';

const repository = () => new StaticContentRepository(content);
const registry = () => RouteRegistry.create(repository().getRoutes());

/** Mapa de URLs aprobado (Paso 0.5). Las rutas de colección cuentan por su patrón. */
const APPROVED_URL_MAP = [
  '/',
  '/servicios/automatizacion-de-procesos/',
  '/servicios/agentes-ia-whatsapp/',
  '/servicios/software-a-medida/',
  '/servicios/seguridad-control-de-acceso/',
  '/marketing-digital/',
  '/marketing-digital/analisis-web/',
  '/marketing-digital/branding-digital/',
  '/marketing-digital/community-manager/',
  '/marketing-digital/posicionamiento-de-marca/',
  '/marketing-digital/email-marketing/',
  '/marketing-digital/pauta-digital/',
  '/marketing-digital/integraciones-web/',
  '/tienda/',
  '/tienda/[categoria]/',
  '/tienda/[producto]/',
  '/casos/',
  '/casos/[cliente]/',
  '/blog/',
  '/blog/[articulo]/',
  '/nosotros/',
  '/contacto/',
  '/privacidad/',
  '/terminos/',
];

describe('StaticContentRepository (content/home.es.json)', () => {
  it('el contenido real es válido', () => {
    expect(repository).not.toThrow();
  });

  it('el RouteRegistry contiene exactamente las 24 URLs del mapa aprobado', () => {
    expect(registry().patterns().sort()).toEqual([...APPROVED_URL_MAP].sort());
    expect(APPROVED_URL_MAP).toHaveLength(24);
  });

  it('todas las rutas tienen title (≤ 60) y description (≤ 155) válidos para SEO', () => {
    const site = { url: 'https://orioncore.co', name: 'Orion Core', locale: 'es_CO', image: '/og-image.png' };
    for (const route of registry().all()) {
      expect(route.description, route.path).toBeTruthy();
      expect(() =>
        new SeoMetaBuilder(site)
          .forPath(route.path)
          .withTitle(route.seoTitle ?? `${route.title} | Orion Core`)
          .withDescription(route.description!)
          .build(),
      ).not.toThrow();
    }
  });

  it('el home usa el title y la description SEO aprobados', () => {
    const home = registry().get('/');
    expect(home.seoTitle).toBe('Automatización, IA y Marketing para Empresas | Orion Core');
    expect(home.description).toBe(
      'Automatizamos procesos, atendemos WhatsApp con IA 24/7, creamos software y marketing 360°. Diagnóstico gratis en Colombia.',
    );
  });

  it('el home es la única ruta publicada en la fase 1', () => {
    expect(registry().sitemapEntries()).toEqual(['/']);
  });

  it('entrega los 5 servicios en el orden oficial', async () => {
    const home = await repository().getHome();
    expect(home.services.items.map((s) => s.href)).toEqual([
      '/servicios/automatizacion-de-procesos/',
      '/servicios/agentes-ia-whatsapp/',
      '/servicios/software-a-medida/',
      '/servicios/seguridad-control-de-acceso/',
      '/marketing-digital/',
    ]);
    expect(home.services.items.find((s) => s.badge)?.href).toBe('/servicios/agentes-ia-whatsapp/');
  });

  it('entrega las líneas de marketing, productos, casos y artículos del home', async () => {
    const home = await repository().getHome();
    expect(home.marketing.items).toHaveLength(7);
    expect(home.shop.products).toHaveLength(4);
    expect(home.results.cases).toHaveLength(3);
    expect(home.blog.articles).toHaveLength(3);
    expect(home.process.steps).toHaveLength(4);
    expect(home.pains.items).toHaveLength(4);
  });

  it('usa los datos de contacto confirmados', async () => {
    const { business } = await repository().getHome();
    expect(business.email).toBe('orioncoretechnologies@gmail.com');
    expect(business.phoneLabel).toBe('+57 305 419 5433');
    expect(business.whatsapp?.value).toBe('+573054195433');
  });

  it('muestra las cifras confirmadas y deja pendiente la que no lo está', async () => {
    const { results } = await repository().getHome();
    expect(results.stats.map((s) => s.value)).toEqual(['10+', '5+', '5+', '[X]']);
  });

  it('integridad de enlaces: todo href interno del home existe en el RouteRegistry', async () => {
    const view = await new GetHomeContent(repository()).execute();
    const hrefs = [...JSON.stringify(view).matchAll(/"href":"([^"]+)"/g)].map((m) => m[1]!);
    const internal = hrefs.filter((h) => h.startsWith('/'));

    expect(internal.length).toBeGreaterThan(20);
    expect(internal.filter((h) => !registry().has(h))).toEqual([]);
    expect(hrefs).not.toContain('#');
    expect(hrefs.filter((h) => h.startsWith('#'))).toEqual(
      expect.arrayContaining(['#contacto']),
    );
  });

  describe('con JSON inválido', () => {
    it('falla si falta una sección, indicando la ruta del campo', () => {
      const { home: _home, ...broken } = content;
      expect(() => new StaticContentRepository(broken)).toThrow(ContentValidationError);
      expect(() => new StaticContentRepository(broken)).toThrow(/home/);
    });

    it('falla si un servicio no tiene ítems', () => {
      const broken = structuredClone(content);
      broken.services[0]!.items = [];
      expect(() => new StaticContentRepository(broken)).toThrow(/services\.0\.items/);
    });

    it('falla si un estado no es draft ni published', () => {
      const broken = structuredClone(content) as { pages: { status: string }[] };
      broken.pages[0]!.status = 'oculto';
      expect(() => new StaticContentRepository(broken)).toThrow(ContentValidationError);
    });

    it('falla si una entidad del dominio rechaza el dato (slug inválido)', () => {
      const broken = structuredClone(content);
      broken.articles[0]!.slug = 'Slug Malo';
      expect(() => new StaticContentRepository(broken).getRoutes()).toThrow();
    });

    it('falla si no es un objeto', () => {
      expect(() => new StaticContentRepository('texto')).toThrow(ContentValidationError);
    });
  });
});
