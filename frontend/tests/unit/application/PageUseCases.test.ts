import { describe, expect, it } from 'vitest';
import { GetArticlePage } from '../../../src/application/use-cases/GetArticlePage';
import { GetMarketingHub } from '../../../src/application/use-cases/GetMarketingHub';
import { GetProductPage } from '../../../src/application/use-cases/GetProductPage';
import { GetServicePage } from '../../../src/application/use-cases/GetServicePage';
import { GetShopPage, GetStore } from '../../../src/application/use-cases/GetShopPage';
import { RouteNotFoundError } from '../../../src/domain/errors/DomainError';
import { StaticContentRepository } from '../../../src/infrastructure/content/StaticContentRepository';
import content from '../../../src/content/home/home.es.json';
import pages from '../../../src/content/pages/pages.es.json';

const repository = new StaticContentRepository(content, pages);

describe('GetServicePage (plantilla de orioncore.html)', () => {
  const view = new GetServicePage(repository).execute('agentes-ia-whatsapp');

  it('hero con titular, 24/7 resaltado, CTA a WhatsApp y a precios', () => {
    expect(view.name).toBe('Agentes de IA para WhatsApp');
    expect(view.badge).toBe('Más solicitado');
    expect(view.hero.title).toEqual({ before: 'Agentes de IA para WhatsApp: atiende, califica y vende', highlight: '24/7', after: '' });
    expect(view.hero.primaryCta).toEqual({ label: 'Probar el agente en WhatsApp', href: 'whatsapp' });
    expect(view.hero.secondaryCta).toEqual({ label: 'Ver planes y precios', href: '#precios' });
    expect(view.hero.chat?.messages).toHaveLength(4);
  });

  it('pasos numerados, 6 funcionalidades, comparativa y 3 planes (Pro destacado)', () => {
    expect(view.howItWorks.steps.map((s) => s.number)).toEqual(['01', '02', '03', '04']);
    expect(view.features.items).toHaveLength(6);
    expect(view.comparison.columns).toEqual(['Criterio', 'Atención tradicional', 'Agente de IA Orion']);
    expect(view.comparison.rows).toHaveLength(5);
    expect(view.pricing.plans.map((p) => p.name)).toEqual(['Básico', 'Pro', 'Empresa']);
    expect(view.pricing.plans[1]!.badge).toBe('Más elegido');
  });

  it('el caso de éxito apunta a /casos/ hasta tener casos publicados', () => {
    expect(view.case.href).toBe('/casos/');
  });

  it('los 4 servicios tienen página; Marketing 360° no (vive en el hub)', () => {
    const useCase = new GetServicePage(repository);
    for (const slug of ['automatizacion-de-procesos', 'software-a-medida', 'seguridad-control-de-acceso']) {
      expect(useCase.execute(slug).path).toBe(`/servicios/${slug}/`);
    }
    expect(() => useCase.execute('marketing-digital-360')).toThrow(RouteNotFoundError);
  });
});

describe('GetMarketingHub', () => {
  const view = new GetMarketingHub(repository).execute();

  it('8 filas numeradas: la estrategia 360° primero y luego las 7 líneas con su página', () => {
    expect(view.rows.map((r) => r.number)).toEqual(['01', '02', '03', '04', '05', '06', '07', '08']);
    expect(view.rows.map((r) => r.id)).toEqual([
      'marketing-360', 'analisis-web', 'branding-digital', 'community-manager',
      'posicionamiento-de-marca', 'email-marketing', 'pauta-digital', 'integraciones-web',
    ]);
    expect(view.rows[0]!.href).toBe('#contacto');
    expect(view.rows[1]).toMatchObject({
      href: '/marketing-digital/analisis-web/',
      heading: 'Análisis web: descubre por qué tu página no vende',
      cta: 'Quiero mi análisis web',
    });
  });

  it('planes Presencia, Crecimiento (destacado) y 360°', () => {
    expect(view.plans.plans.map((p) => [p.name, p.badge])).toEqual([
      ['Presencia', undefined],
      ['Crecimiento', 'Más elegido'],
      ['360°', undefined],
    ]);
  });
});

describe('GetShopPage', () => {
  const useCase = new GetShopPage(repository);

  it('/tienda/: 9 productos, pestañas Todo + 5 categorías como enlaces, marcas para filtrar', () => {
    const view = useCase.execute();
    expect(view.items).toHaveLength(9);
    expect(view.tabs.map((t) => [t.label, t.href, t.current])).toEqual([
      ['Todo', '/tienda/', true],
      ['Laptops', '/tienda/laptops/', false],
      ['Redes', '/tienda/redes/', false],
      ['Seguridad', '/tienda/seguridad/', false],
      ['Accesorios', '/tienda/accesorios/', false],
      ['Smart office', '/tienda/smart-office/', false],
    ]);
    expect(view.scope).toBe('Todo');
    expect(view.brands).toEqual(['[Marca A]', '[Marca B]', '[Marca C]']);
    expect(view.seoText.title).toBe('Cómo elegir tecnología para tu empresa');
  });

  it('sin precios definidos, la tarjeta muestra los marcadores [PRECIO] y [ANTES]', () => {
    const router = useCase.execute().items.find((i) => i.slug === 'router-wifi-6-malla')!;
    expect(router).toMatchObject({
      category: 'Redes',
      price: '[PRECIO]',
      oldPrice: '[ANTES]',
      badge: '-[X]%',
      stockLabel: 'En stock · envío 24 h',
      fastShipping: true,
    });
    expect(router.priceValue).toBeUndefined();
  });

  it('/tienda/{categoria}/: solo sus productos, su pestaña activa y su texto SEO propio', () => {
    const view = useCase.execute('seguridad');
    expect(view.items.map((i) => i.slug)).toEqual(['camara-ip-exterior-4mp', 'control-de-acceso-facial']);
    expect(view.tabs.find((t) => t.current)?.label).toBe('Seguridad');
    expect(view.scope).toBe('Seguridad');
    expect(view.seoText.title).toBe('Cómo elegir cámaras y control de acceso');
  });

  it('una categoría que no existe es un error de ruta', () => {
    expect(() => useCase.execute('no-existe')).toThrow(RouteNotFoundError);
  });

  it('GetStore entrega los productos del carrito, los medios de pago y el sugerido', () => {
    const store = new GetStore(repository).execute();
    expect(store.products).toHaveLength(9);
    expect(store.freeShippingFrom).toBeUndefined();
    expect(store.paymentsLine).toBe('PSE · Tarjeta · Nequi · Contraentrega');
    expect(store.crossSell).toBe('kit-teclado-mouse');
  });
});

describe('GetProductPage', () => {
  const useCase = new GetProductPage(repository);
  const view = useCase.execute('router-wifi-6-malla');

  it('ficha del diseño: marca, SKU, precio pendiente, ahorro, presentaciones y beneficios', () => {
    expect(view).toMatchObject({
      title: '[Router Wi‑Fi 6 malla x3]',
      category: { label: 'Redes', href: '/tienda/redes/' },
      brand: '[Marca C]',
      sku: '[XXXX]',
      price: '[PRECIO]',
      oldPrice: '[ANTES]',
      savings: '[$X]',
      variants: ['1 nodo', 'Pack x2', 'Pack x3'],
    });
    expect(view.benefits[0]).toBe('[Beneficio 1: cobertura hasta X m²]');
    expect(view.gallery).toEqual(['Foto principal', 'Foto en uso', 'Detalle puertos', 'Video 15 s', 'Comparativa']);
  });

  it('"Se compran juntos": este producto + switch PoE + instalación', () => {
    expect(view.bundle?.items.map((i) => i.label)).toEqual(['Este producto', '[Switch 8 puertos PoE]', '[Instalación]']);
    expect(view.bundle?.slugs).toEqual(['router-wifi-6-malla', 'switch-8-puertos-poe']);
  });

  it('especificaciones y preguntas propias; reseñas con distribución de 5★ a 1★', () => {
    expect(view.details.specs.map((s) => s.label)).toEqual(['Estándar', 'Cobertura', 'Puertos', 'Garantía', 'En la caja']);
    expect(view.details.questions[0]!.question).toBe('¿Sirve para una oficina de 2 pisos?');
    expect(view.reviews.distribution).toEqual([
      { stars: 5, percent: 78 },
      { stars: 4, percent: 15 },
      { stars: 3, percent: 4 },
      { stars: 2, percent: 2 },
      { stars: 1, percent: 1 },
    ]);
  });

  it('relacionados: 4 productos, primero los de la misma categoría y nunca el actual', () => {
    expect(view.related).toHaveLength(4);
    expect(view.related[0]!.slug).toBe('switch-8-puertos-poe');
    expect(view.related.map((r) => r.slug)).not.toContain('router-wifi-6-malla');
  });

  it('un producto sin datos propios usa la plantilla (sin combo)', () => {
    const plain = useCase.execute('monitor-27-qhd');
    expect(plain.bundle).toBeUndefined();
    expect(plain.variants).toEqual([]);
    expect(plain.details.questions[0]!.question).toBe('¿Incluye instalación?');
  });

  it('un producto que no existe es un error de ruta', () => {
    expect(() => useCase.execute('no-existe')).toThrow(RouteNotFoundError);
  });
});

describe('GetArticlePage', () => {
  const view = new GetArticlePage(repository).execute('cuanto-cuesta-un-chatbot-de-ia-para-whatsapp');

  it('respuesta rápida, secciones numeradas con anclas y CTA después de la primera', () => {
    expect(view.chip).toBe('Agentes de IA · Guía 2026');
    expect(view.quickAnswer).toMatch(/^En Colombia, un agente de IA para WhatsApp cuesta/);
    expect(view.sections.map((s) => [s.number, s.id])).toEqual([
      [1, 'rangos'],
      [2, 'factores'],
      [3, 'roi'],
      [4, 'errores'],
    ]);
    expect(view.sections[0]!.table?.rows).toHaveLength(3);
    expect(view.inlineCta).toMatchObject({ after: 'rangos', href: '/servicios/agentes-ia-whatsapp/#precios' });
    expect(view.readingTime).toBe('[N] min de lectura');
  });

  it('autor (E-E-A-T) y artículos relacionados reales', () => {
    expect(view.author).toMatchObject({ name: 'Michael [Apellido]', href: '/nosotros/' });
    expect(view.author.linkedin).toBeUndefined();
    expect(view.related.map((r) => r.href)).toEqual([
      '/blog/chatbot-vs-agente-de-ia/',
      '/blog/automatizar-facturacion-electronica-dian/',
      '/blog/senales-de-que-tu-empresa-necesita-un-crm/',
    ]);
  });
});
