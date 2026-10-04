import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderAstro } from '../../support/renderAstro';
import { homeView, hrefsOf } from '../../support/homeView';
import Hero from '../../../src/ui/components/home/Hero.astro';
import ClientLogos from '../../../src/ui/components/home/ClientLogos.astro';
import PainPoints from '../../../src/ui/components/home/PainPoints.astro';
import Services from '../../../src/ui/components/home/Services.astro';
import Marketing360 from '../../../src/ui/components/home/Marketing360.astro';
import LossCalculatorSection from '../../../src/ui/components/home/LossCalculatorSection.astro';
import Results from '../../../src/ui/components/home/Results.astro';
import Process from '../../../src/ui/components/home/Process.astro';
import Shop from '../../../src/ui/components/home/Shop.astro';
import BlogGuides from '../../../src/ui/components/home/BlogGuides.astro';
import Faq from '../../../src/ui/components/home/Faq.astro';
import ContactSection from '../../../src/ui/components/home/ContactSection.astro';

const H1 = 'Automatización, inteligencia artificial y marketing digital para empresas en Colombia';
const text = (el: Element | null) => el?.textContent?.replace(/\s+/g, ' ').trim();

describe('Hero', () => {
  async function render() {
    const { view } = await homeView();
    return renderAstro(Hero, { props: { hero: view.hero } });
  }

  it('tiene un solo H1 con la palabra clave; el gancho es texto visual, no un encabezado', async () => {
    const { document } = await render();
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(text(document.querySelector('h1'))).toBe(H1);
    const hook = [...document.querySelectorAll('p')].find((p) => text(p)?.startsWith('Deja de perder clientes'));
    expect(hook).toBeDefined();
  });

  it('tiene los dos CTA, el microcopy y la prueba social', async () => {
    const { document } = await render();
    const links = [...document.querySelectorAll('a')];
    expect(links.find((a) => text(a) === 'Reservar mi diagnóstico gratis')!.getAttribute('href')).toBe('#contacto');
    expect(links.find((a) => text(a) === '¿Cuánto estoy perdiendo?')!.getAttribute('href')).toBe('#calculadora');
    expect(document.body.textContent).toContain('Sin compromiso');
    expect(document.body.textContent).toContain('empresas ya trabajan con Orion Core');
  });

  it('conserva el globo y la red de nodos, sin cadenas ni velas de blockchain', async () => {
    const { document, html } = await render();
    expect(document.querySelector('[data-globe]')).not.toBeNull();
    expect(document.querySelector('svg[data-node-network] circle')).not.toBeNull();
    // Las cadenas eran rect redondeados y las velas/tendencia, polylines
    expect(document.querySelectorAll('svg[data-node-network] rect[rx], svg[data-node-network] polyline')).toHaveLength(0);
    expect(html).not.toMatch(/blockchain/i);
  });

  it('carga el globo de forma diferida (solo escritorio, con el navegador libre)', async () => {
    const { document } = await render();
    expect(document.querySelector('script[src*="globe.gl"]')).toBeNull();
    const globe = document.querySelector('[data-globe]')!;
    expect(globe.getAttribute('data-script')).toBe('/globe.gl.min.js');
    expect(globe.getAttribute('data-min-width')).toBe('1024');
  });

  it('tiene una imagen estática optimizada como fallback y para móvil (decorativa, prioritaria)', async () => {
    const { document } = await render();
    const img = document.querySelector('img[data-globe-fallback]')!;
    expect(img.getAttribute('alt')).toBe('');
    expect(img.getAttribute('loading')).toBe('eager');
    expect(img.getAttribute('width')).toBeTruthy();
    expect(img.getAttribute('height')).toBeTruthy();
  });

  it('respeta prefers-reduced-motion: sin animaciones CSS, sin animación SVG y sin globo 3D', () => {
    // Los <style> y <script> de Astro se extraen al bundle; se verifica el componente
    const source = readFileSync(new URL('../../../src/ui/components/home/Hero.astro', import.meta.url), 'utf8');
    expect(source).toMatch(/@media \(prefers-reduced-motion: reduce\)[^}]*animation: none/s);
    expect(source).toContain('pauseAnimations()');
    expect(source).toMatch(/if \(reducedMotion\)[\s\S]*else if[\s\S]*loadGlobe/);
  });
});

describe('ClientLogos', () => {
  it('lista los logos (marcados [Logo] hasta tenerlos)', async () => {
    const { view } = await homeView();
    const { document } = await renderAstro(ClientLogos, { props: view.clients });
    expect(text(document.querySelector('h2'))).toBe('Empresas que confían en nosotros');
    expect(document.querySelectorAll('li')).toHaveLength(5);
  });
});

describe('PainPoints', () => {
  it('"¿Te suena familiar?" con 4 tarjetas h3 y un cierre', async () => {
    const { view } = await homeView();
    const { document } = await renderAstro(PainPoints, { props: view.pains });
    expect(text(document.querySelector('h2'))).toBe('¿Te suena familiar?');
    expect(document.querySelectorAll('h3')).toHaveLength(4);
    expect(document.body.textContent).toContain(view.pains.closing);
  });
});

describe('Services', () => {
  async function render() {
    const { view } = await homeView();
    return renderAstro(Services, { props: view.services });
  }

  it('5 filas en el orden oficial con titular, 3 viñetas, CTA y enlace a su URL', async () => {
    const { document } = await render();
    const rows = [...document.querySelectorAll('article')];
    expect(rows).toHaveLength(5);
    expect(rows.map((r) => text(r.querySelector('h3')))).toEqual([
      'Automatización de Procesos',
      'Agentes de IA para WhatsApp',
      'Software Empresarial a Medida',
      'Seguridad y Control de Acceso',
      'Marketing Digital 360°',
    ]);
    for (const row of rows) {
      expect(row.querySelectorAll('li')).toHaveLength(3);
      expect(row.querySelector('a[href="#contacto"]')).not.toBeNull();
    }
    expect(hrefsOf(document)).toEqual(
      expect.arrayContaining([
        '/servicios/automatizacion-de-procesos/',
        '/servicios/agentes-ia-whatsapp/',
        '/servicios/software-a-medida/',
        '/servicios/seguridad-control-de-acceso/',
        '/marketing-digital/',
      ]),
    );
  });

  it('Agentes de IA lleva la etiqueta "Más solicitado"', async () => {
    const { document } = await render();
    const row = [...document.querySelectorAll('article')][1]!;
    expect(row.textContent).toContain('Más solicitado');
  });

  it('los enlaces de detalle tienen nombres accesibles distintos que incluyen el texto visible', async () => {
    const { document } = await render();
    const links = [...document.querySelectorAll('a[aria-label^="Ver detalles"]')];
    expect(new Set(links.map((a) => a.getAttribute('aria-label'))).size).toBe(5);
    for (const a of links) expect(a.getAttribute('aria-label')).toContain(a.textContent!.trim());
  });
});

describe('Marketing360', () => {
  it('7 tarjetas con todo su contenido en el HTML, enlazadas a /marketing-digital/{slug}/, y enlace al hub', async () => {
    const { view } = await homeView();
    const { document } = await renderAstro(Marketing360, { props: view.marketing });
    const cards = [...document.querySelectorAll('a[href^="/marketing-digital/"][data-card]')];
    expect(cards).toHaveLength(7);
    for (const [i, card] of cards.entries()) {
      const line = view.marketing.items[i]!;
      expect(card.getAttribute('href')).toBe(line.href);
      expect(text(card.querySelector('h3'))).toBe(line.title);
      expect(card.textContent).toContain(line.description);
      expect(card.querySelectorAll('li')).toHaveLength(line.items.length);
    }
    expect(hrefsOf(document)).toContain('/marketing-digital/');
  });
});

describe('LossCalculatorSection', () => {
  it('es la sección #calculadora con la isla prerenderizada', async () => {
    const { view } = await homeView();
    const { document } = await renderAstro(LossCalculatorSection, { props: view.calculator });
    expect(document.querySelector('section#calculadora')).not.toBeNull();
    expect(document.querySelectorAll('input[type="range"]')).toHaveLength(2);
    expect(document.querySelector('astro-island')).not.toBeNull();
  });
});

describe('Results', () => {
  it('3 casos enlazados a /casos/{slug}/, 4 cifras y certificaciones', async () => {
    const { view } = await homeView();
    const { document } = await renderAstro(Results, { props: view.results });
    expect(hrefsOf(document).filter((h) => h.startsWith('/casos/'))).toHaveLength(3);
    expect(document.querySelectorAll('dl > div')).toHaveLength(4);
    expect(document.body.textContent).toContain('10+');
    expect(document.body.textContent).toContain('[Certificación 1]');
  });
});

describe('Process', () => {
  it('4 pasos en una lista ordenada y la garantía', async () => {
    const { view } = await homeView();
    const { document } = await renderAstro(Process, { props: view.process });
    expect(document.querySelectorAll('ol > li')).toHaveLength(4);
    expect(document.querySelectorAll('ol h3')).toHaveLength(4);
    expect(document.body.textContent).toContain(view.process.guarantee);
  });
});

describe('Shop', () => {
  it('4 productos destacados enlazados a /tienda/{producto}/ con su precio y enlace a la tienda', async () => {
    const { view } = await homeView();
    const { document } = await renderAstro(Shop, { props: view.shop });
    expect(hrefsOf(document).filter((h) => /^\/tienda\/.+\//.test(h))).toHaveLength(4);
    expect(document.body.textContent).toContain('Precio por confirmar');
    expect(hrefsOf(document)).toContain('/tienda/');
  });
});

describe('BlogGuides', () => {
  it('3 artículos enlazados a /blog/{articulo}/ y enlace al blog', async () => {
    const { view } = await homeView();
    const { document } = await renderAstro(BlogGuides, { props: view.blog });
    expect(hrefsOf(document).filter((h) => /^\/blog\/.+\//.test(h))).toHaveLength(3);
    expect(hrefsOf(document)).toContain('/blog/');
  });
});

describe('Faq', () => {
  it('usa <details>/<summary> para cada pregunta', async () => {
    const { view } = await homeView();
    const { document } = await renderAstro(Faq, { props: view.faq });
    const details = [...document.querySelectorAll('details')];
    expect(details).toHaveLength(view.faq.items.length);
    expect(text(details[0]!.querySelector('summary'))).toBe(view.faq.items[0]!.question);
    expect(details[0]!.textContent).toContain(view.faq.items[0]!.answer);
  });
});

describe('ContactSection', () => {
  async function render() {
    const { container, view } = await homeView();
    return renderAstro(ContactSection, {
      props: {
        contact: view.contact,
        services: view.services.items,
        whatsappHref: container.whatsappLink(view.business.whatsapp, view.contact.whatsappMessage),
      },
    });
  }

  it('es la sección #contacto con cupos, beneficios y la foto de Michael', async () => {
    const { document } = await render();
    expect(document.querySelector('section#contacto')).not.toBeNull();
    expect(document.body.textContent).toContain('Quedan [N] de [10] cupos este mes');
    expect(document.querySelectorAll('[data-benefits] li')).toHaveLength(3);
    expect(document.querySelector('[role="img"][aria-label^="Michael"]')).not.toBeNull();
  });

  it('incluye el LeadForm (isla) y la alternativa por WhatsApp', async () => {
    const { document } = await render();
    expect(document.querySelector('astro-island')).not.toBeNull();
    expect(document.querySelector('a[href^="https://wa.me/573054195433"]')!.textContent).toContain('WhatsApp');
  });
});
