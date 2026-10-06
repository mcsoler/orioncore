import { beforeAll, describe, expect, it } from 'vitest';
import { renderPage } from '../../support/renderAstro';
import { homeView } from '../../support/homeView';
import IndexPage from '../../../src/pages/index.astro';
import NotFoundPage from '../../../src/pages/404.astro';
import ServicePage from '../../../src/pages/servicios/[slug].astro';
import MarketingLinePage from '../../../src/pages/marketing-digital/[slug].astro';
import ShopItemPage from '../../../src/pages/tienda/[slug].astro';

const H1 = 'Automatización, inteligencia artificial y marketing digital para empresas en Colombia';
const meta = (d: Document, sel: string) => d.querySelector(sel)?.getAttribute('content');

describe('Home (/) — reglas comunes del Paso 4.4', () => {
  let document: Document;
  let html: string;
  beforeAll(async () => {
    ({ document, html } = await renderPage(IndexPage));
  });

  it('tema oscuro de la referencia en todo el documento', () => {
    expect(document.body.className).toContain('bg-navy');
    expect(document.body.className).toContain('text-white');
  });

  it('<html lang="es-CO"> y un solo H1 con la palabra clave', () => {
    expect(document.documentElement.getAttribute('lang')).toBe('es-CO');
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(document.querySelector('h1')!.textContent?.replace(/\s+/g, ' ').trim()).toBe(H1);
  });

  it('la jerarquía de encabezados no salta niveles', () => {
    const levels = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((h) => Number(h.tagName[1]));
    levels.reduce((prev, level) => {
      expect(level, `h${prev} → h${level}`).toBeLessThanOrEqual(prev + 1);
      return level;
    });
  });

  it('las secciones siguen el orden aprobado', () => {
    const ids = [...document.querySelectorAll('main section[id]')].map((s) => s.id);
    expect(ids).toEqual([
      'inicio', 'dolores', 'servicios', 'marketing360', 'calculadora', 'resultados',
      'proceso', 'tienda', 'guias', 'preguntas', 'contacto',
    ]);
  });

  it('ningún href="#" y todos los enlaces internos existen en el RouteRegistry', async () => {
    const { container } = await homeView();
    const hrefs = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')!);
    expect(hrefs).not.toContain('#');
    // Las rutas de páginas (no los archivos como /sitemap-index.xml) deben existir en el RouteRegistry
    const internal = hrefs.filter((h) => h.startsWith('/') && !/\.\w+$/.test(h));
    expect(internal.filter((h) => !container.routes.has(h))).toEqual([]);
    const anchors = hrefs.filter((h) => h.startsWith('#'));
    expect(anchors.filter((a) => !document.getElementById(a.slice(1)))).toEqual([]);
  });

  it('enlaza a los 4 servicios, al hub y las 7 subpáginas de marketing, a la tienda, a los casos y al blog', () => {
    const hrefs = new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')));
    for (const href of [
      '/servicios/automatizacion-de-procesos/', '/servicios/agentes-ia-whatsapp/', '/servicios/software-a-medida/',
      '/servicios/seguridad-control-de-acceso/', '/marketing-digital/', '/marketing-digital/analisis-web/',
      '/marketing-digital/branding-digital/', '/marketing-digital/community-manager/',
      '/marketing-digital/posicionamiento-presencial/', '/marketing-digital/email-marketing/',
      '/marketing-digital/pauta-digital/', '/marketing-digital/integraciones-web/', '/tienda/', '/casos/', '/blog/',
    ]) {
      expect(hrefs.has(href), href).toBe(true);
    }
  });

  it('todo enlace y botón tiene nombre accesible; los íconos son decorativos o tienen etiqueta', () => {
    for (const el of document.querySelectorAll('a, button')) {
      const name = (el.getAttribute('aria-label') ?? el.textContent ?? '').trim();
      expect(name, el.outerHTML.slice(0, 80)).not.toBe('');
    }
    for (const svg of document.querySelectorAll('svg')) {
      const decorative = svg.getAttribute('aria-hidden') === 'true' || svg.closest('[aria-hidden="true"]');
      expect(decorative || svg.getAttribute('aria-label'), svg.outerHTML.slice(0, 80)).toBeTruthy();
    }
    for (const img of document.querySelectorAll('img')) expect(img.hasAttribute('alt')).toBe(true);
  });

  it('SEO del home: title, description, canónica, robots, Open Graph y JSON-LD', () => {
    expect(document.title).toBe('Automatización, IA y Marketing para Empresas | Orion Core');
    expect(meta(document, 'meta[name="description"]')).toBe(
      'Automatizamos procesos, atendemos WhatsApp con IA 24/7, creamos software y marketing 360°. Diagnóstico gratis en Colombia.',
    );
    expect(document.querySelector('link[rel="canonical"]')!.getAttribute('href')).toBe('https://orioncore.co/');
    expect(meta(document, 'meta[name="robots"]')).toBe('index, follow');
    expect(meta(document, 'meta[property="og:image"]')).toBe('https://orioncore.co/og-image.png');
    const types = [...document.querySelectorAll('script[type="application/ld+json"]')].map(
      (s) => JSON.parse(s.textContent!)['@type'],
    );
    expect(types).toEqual(expect.arrayContaining(['Organization', 'ProfessionalService', 'WebSite', 'FAQPage']));
  });

  it('usa el logo real como favicon y apple-touch-icon', () => {
    expect(document.querySelector('link[rel="icon"]')!.getAttribute('href')).toBe('/favicon.svg');
    expect(document.querySelector('link[rel="apple-touch-icon"]')!.getAttribute('href')).toBe('/apple-touch-icon.png');
  });

  it('fuentes autoalojadas: sin Google Fonts y con precarga del peso del H1', () => {
    expect(html).not.toContain('fonts.googleapis.com');
    const preloads = [...document.querySelectorAll('link[rel="preload"][as="font"]')].map((l) => l.getAttribute('href')!);
    // H1 (Inter 700) y gancho del hero (Poppins 700, el LCP)
    expect(preloads.some((h) => /inter-latin-700-normal.*\.woff2/.test(h))).toBe(true);
    expect(preloads.some((h) => /poppins-latin-700-normal.*\.woff2/.test(h))).toBe(true);
    expect(preloads.every((l) => l.hasAttribute('crossorigin'))).toBe(true);
  });

  it('no queda rastro de Blockchain', () => {
    expect(html).not.toMatch(/blockchain/i);
  });
});

describe('Páginas en borrador (plantilla mínima)', () => {
  it('/servicios/{slug}/: H1, intro, CTA, migas y noindex', async () => {
    const { document } = await renderPage(ServicePage, { slug: 'software-a-medida' });
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(document.querySelector('h1')!.textContent?.trim()).toBe('Software empresarial a medida');
    expect(document.querySelector('main')!.textContent).toContain('Creamos plataformas digitales');
    expect(document.querySelector('main a[href="/contacto/"]')).not.toBeNull();
    expect(document.querySelector('nav[aria-label="Migas de pan"]')).not.toBeNull();
    expect(meta(document, 'meta[name="robots"]')).toBe('noindex, follow');
    expect(document.querySelector('link[rel="canonical"]')!.getAttribute('href')).toBe(
      'https://orioncore.co/servicios/software-a-medida/',
    );
  });

  it('/marketing-digital/{slug}/ tiene migas hasta el hub', async () => {
    const { document } = await renderPage(MarketingLinePage, { slug: 'pauta-digital' });
    const crumbs = [...document.querySelectorAll('nav[aria-label="Migas de pan"] a')].map((a) => a.getAttribute('href'));
    expect(crumbs).toEqual(['/', '/marketing-digital/']);
  });

  it('/tienda/{slug}/ sirve tanto categorías como productos', async () => {
    const category = await renderPage(ShopItemPage, { slug: 'categoria-ejemplo' });
    const product = await renderPage(ShopItemPage, { slug: 'laptop-empresarial-14' });
    expect(category.document.querySelector('h1')!.textContent?.trim()).toBe('[Categoría]');
    expect(product.document.querySelector('h1')!.textContent?.trim()).toBe('[Laptop empresarial 14"]');
  });
});

describe('404', () => {
  it('no se indexa y ofrece volver al inicio', async () => {
    const { document } = await renderPage(NotFoundPage);
    expect(meta(document, 'meta[name="robots"]')).toBe('noindex, follow');
    expect(document.querySelector('h1')!.textContent).toMatch(/no encontrada/i);
    expect(document.querySelector('main a[href="/"]')).not.toBeNull();
  });
});
