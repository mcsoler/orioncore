import { beforeAll, describe, expect, it } from 'vitest';
import { renderPage } from '../../support/renderAstro';
import { homeView } from '../../support/homeView';
import ServicePage from '../../../src/pages/servicios/[slug].astro';
import MarketingHubPage from '../../../src/pages/marketing-digital/index.astro';
import ShopPage from '../../../src/pages/tienda/index.astro';
import ShopItemPage from '../../../src/pages/tienda/[slug].astro';
import ArticlePage from '../../../src/pages/blog/[slug].astro';

const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, ' ').trim();
const meta = (d: Document, sel: string) => d.querySelector(sel)?.getAttribute('content');
const jsonLdTypes = (d: Document) =>
  [...d.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent!)['@type']);
const sectionIds = (d: Document) => [...d.querySelectorAll('main section[id]')].map((s) => s.id);

/** Reglas comunes de las plantillas de orioncore.html (SEO, accesibilidad y enlaces). */
function commonRules(name: string, load: () => Promise<{ document: Document }>) {
  describe(`${name} — reglas comunes`, () => {
    let document: Document;
    beforeAll(async () => {
      ({ document } = await load());
    });

    it('un solo H1 y encabezados sin saltos de nivel', () => {
      expect(document.querySelectorAll('h1')).toHaveLength(1);
      const levels = [...document.querySelectorAll('h1, h2, h3, h4')].map((h) => Number(h.tagName[1]));
      levels.reduce((prev, level) => {
        expect(level, `h${prev} → h${level}`).toBeLessThanOrEqual(prev + 1);
        return level;
      });
    });

    it('todos los enlaces internos existen (rutas del RouteRegistry y anclas de la página)', async () => {
      const { container } = await homeView();
      const hrefs = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')!);
      expect(hrefs).not.toContain('#');
      const pages = hrefs.filter((h) => h.startsWith('/') && !/\.\w+$/.test(h)).map((h) => h.split('#')[0]!);
      expect(pages.filter((h) => !container.routes.has(h))).toEqual([]);
      const anchors = hrefs.filter((h) => h.startsWith('#'));
      expect(anchors.filter((a) => !document.getElementById(a.slice(1)))).toEqual([]);
    });

    it('todo enlace y botón tiene nombre accesible y los íconos son decorativos o tienen etiqueta', () => {
      for (const el of document.querySelectorAll('a, button')) {
        const label = (el.getAttribute('aria-label') ?? el.textContent ?? '').trim();
        expect(label, el.outerHTML.slice(0, 80)).not.toBe('');
      }
      for (const svg of document.querySelectorAll('svg')) {
        const decorative = svg.getAttribute('aria-hidden') === 'true' || svg.closest('[aria-hidden="true"]');
        expect(decorative || svg.getAttribute('aria-label'), svg.outerHTML.slice(0, 80)).toBeTruthy();
      }
    });

    it('en borrador: noindex y canónica propia; migas con BreadcrumbList', () => {
      expect(meta(document, 'meta[name="robots"]')).toBe('noindex, follow');
      expect(document.querySelector('link[rel="canonical"]')!.getAttribute('href')).toMatch(/^https:\/\/orioncore\.co\/.+\/$/);
      expect(document.querySelector('nav[aria-label="Migas de pan"]')).not.toBeNull();
      expect(jsonLdTypes(document)).toContain('BreadcrumbList');
    });
  });
}

commonRules('/servicios/agentes-ia-whatsapp/', () => renderPage(ServicePage, { slug: 'agentes-ia-whatsapp' }));
commonRules('/servicios/seguridad-control-de-acceso/', () => renderPage(ServicePage, { slug: 'seguridad-control-de-acceso' }));
commonRules('/marketing-digital/', () => renderPage(MarketingHubPage));
commonRules('/tienda/', () => renderPage(ShopPage));
commonRules('/tienda/redes/', () => renderPage(ShopItemPage, { slug: 'redes' }));
commonRules('/tienda/router-wifi-6-malla/', () => renderPage(ShopItemPage, { slug: 'router-wifi-6-malla' }));
commonRules('/blog/cuanto-cuesta-un-chatbot-de-ia-para-whatsapp/', () =>
  renderPage(ArticlePage, { slug: 'cuanto-cuesta-un-chatbot-de-ia-para-whatsapp' }),
);

describe('/servicios/agentes-ia-whatsapp/ (plantilla de servicio)', () => {
  let document: Document;
  beforeAll(async () => {
    ({ document } = await renderPage(ServicePage, { slug: 'agentes-ia-whatsapp' }));
  });

  it('title y description del plan SEO; Service y FAQPage (solo preguntas respondidas)', () => {
    expect(document.title).toBe('Agentes de IA para WhatsApp: Atención 24/7 | Orion Core');
    const types = jsonLdTypes(document);
    expect(types).toEqual(expect.arrayContaining(['Service', 'FAQPage', 'BreadcrumbList']));
    const faq = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((s) => JSON.parse(s.textContent!))
      .find((j) => j['@type'] === 'FAQPage');
    expect(faq.mainEntity.map((q: { name: string }) => q.name)).toEqual(['¿Puedo seguir respondiendo yo cuando quiera?']);
  });

  it('hero: distintivo, H1 con 24/7 resaltado, CTA a WhatsApp y a precios, chat de ejemplo', () => {
    expect(text(document.querySelector('main .tag'))).toBe('Más solicitado');
    const h1 = document.querySelector('h1')!;
    expect(text(h1)).toBe('Agentes de IA para WhatsApp: atiende, califica y vende 24/7');
    expect(text(h1.querySelector('span'))).toBe('24/7');
    const links = [...document.querySelectorAll('#inicio a')];
    expect(links.find((a) => text(a) === 'Probar el agente en WhatsApp')!.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/573054195433/);
    expect(links.find((a) => text(a) === 'Ver planes y precios')!.getAttribute('href')).toBe('#precios');
    expect(document.querySelector('[data-chat]')!.textContent).toContain('Una clínica dental');
  });

  it('secciones en el orden del diseño, con índice de anclas', () => {
    expect(sectionIds(document)).toEqual(['inicio', 'que-es', 'como-funciona', 'funcionalidades', 'comparativa', 'precios', 'preguntas', 'contacto']);
    const index = [...document.querySelectorAll('nav[aria-label="En esta página"] a')].map((a) => a.getAttribute('href'));
    expect(index).toEqual(['#que-es', '#como-funciona', '#funcionalidades', '#comparativa', '#precios', '#preguntas']);
  });

  it('comparativa como tabla real con encabezados de fila y columna', () => {
    const table = document.querySelector('#comparativa table')!;
    expect([...table.querySelectorAll('thead th')].map(text)).toEqual(['Criterio', 'Atención tradicional', 'Agente de IA Orion']);
    expect(table.querySelectorAll('tbody th[scope="row"]')).toHaveLength(5);
  });

  it('3 planes con el Pro destacado; los botones llevan al formulario', () => {
    const plans = [...document.querySelectorAll('#precios [data-plan]')];
    expect(plans.map((p) => text(p.querySelector('h3')))).toEqual(['Básico', 'Pro', 'Empresa']);
    expect(text(plans[1]!.querySelector('.tag'))).toBe('Más elegido');
    expect(plans.map((p) => p.querySelector('a')!.getAttribute('href'))).toEqual(['#contacto', '#contacto', '#contacto']);
  });

  it('FAQ con <details> (la primera abierta), caso, relacionados y formulario corto de demo', () => {
    const details = [...document.querySelectorAll('#preguntas details')];
    expect(details).toHaveLength(5);
    expect(details[0]!.hasAttribute('open')).toBe(true);
    expect(document.querySelector('a[href="/blog/cuanto-cuesta-un-chatbot-de-ia-para-whatsapp/"]')).not.toBeNull();
    expect(text(document.querySelector('#contacto h2'))).toBe('Prueba tu agente de IA antes de pagar');
    expect(document.querySelector('#contacto astro-island')!.getAttribute('props')).toContain('Quiero mi demo gratis');
  });
});

describe('/servicios/{slug}/ sin chat usa la ilustración del servicio', () => {
  it('seguridad y control de acceso', async () => {
    const { document } = await renderPage(ServicePage, { slug: 'seguridad-control-de-acceso' });
    expect(document.querySelector('[data-chat]')).toBeNull();
    expect(document.querySelector('#inicio [data-illustration]')).not.toBeNull();
    expect(document.title).toBe('Control de Acceso y Reconocimiento Facial | Orion Core');
  });
});

describe('/marketing-digital/ (hub Marketing 360°)', () => {
  let document: Document;
  beforeAll(async () => {
    ({ document } = await renderPage(MarketingHubPage));
  });

  it('H1, title del plan, Service con OfferCatalog de las 7 líneas', () => {
    expect(text(document.querySelector('h1'))).toBe('Agencia de marketing digital 360° en Colombia');
    expect(document.title).toBe('Agencia de Marketing Digital 360° en Colombia | Orion Core');
    const service = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((s) => JSON.parse(s.textContent!))
      .find((j) => j['@type'] === 'Service');
    expect(service.hasOfferCatalog.itemListElement).toHaveLength(7);
  });

  it('índice de anclas y 8 filas alternadas; cada línea enlaza a su página', () => {
    const anchors = [...document.querySelectorAll('nav[aria-label="Servicios de marketing"] a')].map((a) => a.getAttribute('href'));
    expect(anchors).toHaveLength(8);
    const rows = [...document.querySelectorAll('article[id]')];
    expect(rows.map((r) => r.id)).toEqual(anchors.map((a) => a!.slice(1)));
    expect(text(rows[0]!.querySelector('.tag'))).toBe('01 · Marketing Digital 360°');
    expect(rows[4]!.querySelector('a[href="/marketing-digital/posicionamiento-de-marca/"]')).not.toBeNull();
    expect(rows[1]!.className).toContain('lg:[&>*:first-child]:order-2');
  });

  it('planes, FAQ y auditoría gratuita con el campo de sitio web', () => {
    expect(sectionIds(document)).toEqual(['inicio', 'planes', 'preguntas', 'contacto']);
    expect([...document.querySelectorAll('#planes [data-plan] h3')].map(text)).toEqual(['Presencia', 'Crecimiento', '360°']);
    const form = document.querySelector('#contacto astro-island')!.getAttribute('props')!;
    expect(form).toContain('Quiero mi auditoría');
    expect(form).toContain('websiteField');
  });
});

describe('/tienda/ (catálogo)', () => {
  let document: Document;
  beforeAll(async () => {
    ({ document } = await renderPage(ShopPage));
  });

  it('header de la tienda: logo "Tecnologías · Tienda", buscador y carrito; barra de envío gratis', () => {
    const header = document.querySelector('header[data-header]')!;
    expect(header.textContent).toContain('Tecnologías · Tienda');
    const search = header.querySelector('form[role="search"]')!;
    expect(search.getAttribute('action')).toBe('/tienda/');
    expect(search.querySelector('input[type="search"][name="q"]')!.getAttribute('placeholder')).toBe('Busca laptops, routers, cámaras…');
    expect(header.querySelector('a[href="/#servicios"]')).not.toBeNull();
    expect(document.body.textContent).toContain('para envío gratis');
  });

  it('H1, intro, combo y pestañas de categoría como enlaces rastreables', () => {
    expect(text(document.querySelector('h1'))).toBe('Tienda de tecnología para empresas');
    expect(document.title).toBe('Tienda de Tecnología para Empresas | Orion Core');
    expect(document.body.textContent).toContain('Arma tu oficina conectada y ahorra en el combo');
    const tabs = [...document.querySelectorAll('nav[aria-label="Categorías"] a')];
    expect(tabs.map(text)).toEqual(['Todo', 'Laptops', 'Redes', 'Seguridad', 'Accesorios', 'Smart office']);
    expect(tabs[0]!.getAttribute('aria-current')).toBe('page');
  });

  it('los 9 productos vienen en el HTML del servidor (rastreables) y en el CollectionPage', () => {
    expect(document.querySelectorAll('#catalogo article[data-product]')).toHaveLength(9);
    const collection = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((s) => JSON.parse(s.textContent!))
      .find((j) => j['@type'] === 'CollectionPage');
    expect(collection.mainEntity.itemListElement).toHaveLength(9);
  });

  it('texto SEO, venta B2B y barra de confianza', () => {
    expect(document.body.textContent).toContain('Cómo elegir tecnología para tu empresa');
    expect(document.querySelector('a[href="/contacto/"]')!.textContent).toBeTruthy();
    const trust = [...document.querySelectorAll('section[aria-label="Por qué comprar con nosotros"] li')].map((li) => text(li.querySelector('strong')));
    expect(trust).toEqual(['Envío a todo Colombia', 'Garantía oficial', 'Pago seguro', 'Asesor por WhatsApp']);
  });
});

describe('/tienda/{categoria}/', () => {
  it('muestra solo los productos de la categoría con su pestaña activa', async () => {
    const { document } = await renderPage(ShopItemPage, { slug: 'redes' });
    expect(text(document.querySelector('h1'))).toBe('Redes');
    expect([...document.querySelectorAll('#catalogo article[data-product]')].map((a) => a.getAttribute('data-product'))).toEqual([
      'router-wifi-6-malla',
      'switch-8-puertos-poe',
    ]);
    expect(text(document.querySelector('nav[aria-label="Categorías"] a[aria-current="page"]'))).toBe('Redes');
    expect(document.body.textContent).toContain('Cómo elegir la red Wi‑Fi de tu oficina');
  });
});

describe('/tienda/{producto}/ (ficha)', () => {
  let document: Document;
  beforeAll(async () => {
    ({ document } = await renderPage(ShopItemPage, { slug: 'router-wifi-6-malla' }));
  });

  it('migas Inicio / Tienda / Categoría / Producto y title del plan', () => {
    const crumbs = [...document.querySelectorAll('nav[aria-label="Migas de pan"] li')].map(text);
    expect(crumbs).toEqual(['Inicio /', 'Tienda /', 'Redes /', '[Router Wi‑Fi 6 malla x3]']);
    expect(document.title).toBe('[Router Wi‑Fi 6 malla x3] | Precio y Envío | Orion Core');
  });

  it('caja de compra: marca, SKU, precio pendiente con ahorro, beneficios, presentaciones y asesor', () => {
    const main = document.querySelector('main')!;
    expect(text(main.querySelector('h1'))).toBe('[Router Wi‑Fi 6 malla x3]');
    expect(main.textContent).toContain('SKU [XXXX]');
    expect(text(main.querySelector('[data-testid="price"]'))).toBe('[PRECIO]');
    expect(main.textContent).toContain('Ahorras [$X]');
    expect(main.textContent).toContain('[Beneficio 1: cobertura hasta X m²]');
    expect([...main.querySelectorAll('button[aria-pressed]')].map(text)).toContain('Pack x3');
    const advisor = [...main.querySelectorAll('a')].find((a) => text(a) === '¿Dudas? Habla con un asesor')!;
    expect(advisor.getAttribute('href')).toMatch(/^https:\/\/wa\.me\//);
  });

  it('combo, descripción, especificaciones en tabla, envío, preguntas, reseñas y relacionados', () => {
    expect(document.getElementById('combo')!.textContent).toContain('[Switch 8 puertos PoE]');
    expect([...document.querySelectorAll('main table th[scope="row"]')].map(text)).toEqual(['Estándar', 'Cobertura', 'Puertos', 'Garantía', 'En la caja']);
    expect(document.querySelector('main a[href="/servicios/seguridad-control-de-acceso/"]')!.textContent).toBe('servicio de instalación');
    expect(document.getElementById('resenas')!.textContent).toContain('reseñas verificadas');
    const related = document.querySelectorAll('section[aria-labelledby="relacionados-titulo"] li a');
    expect(related).toHaveLength(4);
  });

  it('barra fija de compra y sin botón flotante de WhatsApp encima', () => {
    expect(document.querySelector('[data-whatsapp-float]')).toBeNull();
    const islands = [...document.querySelectorAll('astro-island')].map((i) => i.getAttribute('component-url') ?? '');
    expect(islands.some((u) => u.includes('StickyAddToCart'))).toBe(true);
    expect(islands.some((u) => u.includes('CartDrawer'))).toBe(true);
  });

  it('sin precio confirmado no publica Product (Google exige precio o reseñas)', () => {
    expect(jsonLdTypes(document)).not.toContain('Product');
  });
});

describe('/blog/{articulo}/ (plantilla de artículo)', () => {
  let document: Document;
  beforeAll(async () => {
    ({ document } = await renderPage(ArticlePage, { slug: 'cuanto-cuesta-un-chatbot-de-ia-para-whatsapp' }));
  });

  it('cabecera: categoría, H1, entradilla, autor y fecha de actualización con <time>', () => {
    expect(text(document.querySelector('article .chip'))).toBe('Agentes de IA · Guía 2026');
    expect(text(document.querySelector('h1'))).toBe('¿Cuánto cuesta un chatbot de IA para WhatsApp en Colombia?');
    expect(document.querySelector('article header a[href="/nosotros/"]')).not.toBeNull();
    expect(document.querySelector('article header time')!.getAttribute('datetime')).toBe('2026-10-01');
  });

  it('respuesta rápida, índice, secciones numeradas con anclas, tabla y CTA dentro del contenido', () => {
    expect(document.querySelector('[data-quick-answer]')!.textContent).toContain('Respuesta rápida');
    const toc = [...document.querySelectorAll('nav[aria-label="Contenido del artículo"] a')].map((a) => a.getAttribute('href'));
    expect(toc).toEqual(['#rangos', '#factores', '#roi', '#errores']);
    expect([...document.querySelectorAll('article h2[id]')].map(text)).toEqual([
      '1. Rangos de precio',
      '2. Qué hace subir o bajar el costo',
      '3. Cómo calcular si te conviene',
      '4. Errores al contratar',
    ]);
    expect(document.querySelectorAll('article table tbody tr')).toHaveLength(3);
    const cta = document.querySelector('aside[aria-label="¿Quieres saber cuánto costaría el tuyo?"]')!;
    expect(cta.previousElementSibling!.tagName).toBe('DIV'); // justo después de la tabla de "Rangos de precio"
    expect(cta.querySelector('a')!.getAttribute('href')).toBe('/servicios/agentes-ia-whatsapp/#precios');
  });

  it('enlaces internos dentro del texto, autor y lateral con relacionados', () => {
    expect(document.querySelector('article p a[href="/servicios/automatizacion-de-procesos/"]')).not.toBeNull();
    expect(document.querySelector('article p a[href="/#calculadora"]')).not.toBeNull();
    expect(document.querySelector('section[aria-label="Sobre el autor"]')!.textContent).toContain('Michael [Apellido]');
    const related = [...document.querySelectorAll('nav[aria-label="Artículos relacionados"] a')].map((a) => a.getAttribute('href'));
    expect(related).toHaveLength(3);
  });

  it('Article en JSON-LD (sin autor mientras su apellido esté pendiente)', () => {
    const article = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((s) => JSON.parse(s.textContent!))
      .find((j) => j['@type'] === 'Article');
    expect(article.headline).toBe('¿Cuánto cuesta un chatbot de IA para WhatsApp en Colombia?');
    expect(article).not.toHaveProperty('author');
  });
});
