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
const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, ' ').trim();
const WHATSAPP = /^https:\/\/wa\.me\/573054195433/;

async function whatsappHref() {
  const { container, view } = await homeView();
  return container.whatsappLink(view.business.whatsapp, view.contact.whatsappMessage);
}

describe('Hero', () => {
  async function render() {
    const { view } = await homeView();
    return renderAstro(Hero, { props: { hero: view.hero } });
  }

  it('un solo H1 (palabra clave, en mayúsculas pequeñas); el gancho grande es un <p> con el resaltado', async () => {
    const { document } = await render();
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(text(document.querySelector('h1'))).toBe(H1);
    const hook = document.querySelector('[data-hook]')!;
    expect(hook.tagName).toBe('P');
    expect(text(hook)).toBe('Deja de perder clientes, horas y dinero en lo que la tecnología ya resuelve.');
    expect(text(hook.querySelector('span'))).toBe('clientes, horas y dinero');
  });

  it('CTA principales; el microcopy de valor y la prueba social quedan ocultos hasta tener datos reales', async () => {
    const { document, html } = await render();
    const links = [...document.querySelectorAll('a')];
    expect(links.find((a) => text(a) === 'Reservar mi diagnóstico gratis')!.getAttribute('href')).toBe('#contacto');
    expect(links.find((a) => text(a) === '¿Cuánto estoy perdiendo?')!.getAttribute('href')).toBe('#calculadora');
    expect(html).not.toContain('Valorado en');
    expect(html).not.toContain('[foto]');
    expect(html).not.toContain('★★★★★');
    expect(html).not.toContain('ya confían en nosotros');
  });

  it('conserva el globo y la red de nodos (decisión del cliente), sin cadenas ni velas', async () => {
    const { document, html } = await render();
    expect(document.querySelector('[data-globe]')).not.toBeNull();
    expect(document.querySelector('svg[data-node-network] circle')).not.toBeNull();
    expect(document.querySelectorAll('svg[data-node-network] rect[rx], svg[data-node-network] polyline')).toHaveLength(0);
    expect(html).not.toMatch(/blockchain/i);
  });

  it('carga el globo de forma diferida y tiene imagen estática prioritaria', async () => {
    const { document } = await render();
    expect(document.querySelector('script[src*="globe.gl"]')).toBeNull();
    expect(document.querySelector('[data-globe]')!.getAttribute('data-script')).toBe('/globe.gl.min.js');
    const img = document.querySelector('img[data-globe-fallback]')!;
    expect(img.getAttribute('alt')).toBe('');
    expect(img.getAttribute('loading')).toBe('eager');
  });

  it('el globo gira de forma continua (como la primera versión) y es más transparente', () => {
    const source = readFileSync(new URL('../../../src/ui/components/home/Hero.astro', import.meta.url), 'utf8');
    expect(source).toMatch(/requestAnimationFrame\(spin\)/);
    expect(source).toContain('camera.lookAt(0, 0, 0)');
    expect(source).toMatch(/opacity\(0\.4\)/);
    expect(source).toContain('lg:opacity-80');
  });

  it('respeta prefers-reduced-motion', () => {
    const source = readFileSync(new URL('../../../src/ui/components/home/Hero.astro', import.meta.url), 'utf8');
    expect(source).toMatch(/@media \(prefers-reduced-motion: reduce\)[^}]*animation: none/s);
    expect(source).toContain('pauseAnimations()');
  });
});

describe('ClientLogos', () => {
  it('"Empresas que ya dejaron de perder tiempo:" y 5 logos', async () => {
    const { view } = await homeView();
    const { document } = await renderAstro(ClientLogos, { props: view.clients });
    expect(document.body.textContent).toContain('Empresas que ya dejaron de perder tiempo:');
    expect(document.querySelectorAll('li')).toHaveLength(5);
  });
});

describe('PainPoints', () => {
  it('4 tarjetas con etiqueta de pérdida y el cierre "Es falta de sistema."', async () => {
    const { view } = await homeView();
    const { document } = await renderAstro(PainPoints, { props: view.pains });
    expect(text(document.querySelector('h2'))).toBe(view.pains.title);
    const cards = [...document.querySelectorAll('article')];
    expect(cards.map((c) => text(c.querySelector('.tag')))).toEqual(['Ventas perdidas', 'Horas perdidas', 'Riesgo', 'Pauta quemada']);
    expect(text(cards[0]!.querySelector('h3'))).toBe('Te escriben de noche y nadie responde.');
    expect(text(document.querySelector('[data-closing]'))).toBe('No es falta de esfuerzo. Es falta de sistema.');
    // "Es falta de sistema." en el mismo rojo de las etiquetas de pérdida
    const highlight = document.querySelector('[data-closing] span')!;
    expect(text(highlight)).toBe('Es falta de sistema.');
    expect(highlight.className).toContain('text-danger');
    expect(cards[0]!.querySelector('.tag')!.className).toContain('text-danger');
  });
});

describe('Services', () => {
  async function render() {
    const { view } = await homeView();
    return renderAstro(Services, { props: { ...view.services, whatsappHref: await whatsappHref() } });
  }

  it('5 filas numeradas en el orden oficial, con titular h3 y su ilustración decorativa', async () => {
    const { document } = await render();
    const rows = [...document.querySelectorAll('article')];
    expect(rows.map((r) => text(r.querySelector('.tag')))).toEqual([
      '01 · Automatización de procesos',
      '02 · Agentes de IA para WhatsApp',
      '03 · Software empresarial a medida',
      '04 · Seguridad y control de acceso',
      '05 · Marketing digital 360°',
    ]);
    expect(text(rows[0]!.querySelector('h3'))).toBe('Deja de invertir días en lo que debería tomar minutos.');
    for (const row of rows) expect(row.querySelector('[data-illustration][aria-hidden="true"]')).not.toBeNull();
  });

  it('el chat del agente de IA es una conversación técnica sobre un ERP', async () => {
    const { document } = await render();
    const chat = [...document.querySelectorAll('article')][1]!.querySelector('[data-illustration]')!;
    expect(chat.textContent).toContain('sistema ERP');
    expect(chat.textContent).toContain('¡Claro, excelente idea! Tenemos un ERP integrado con diferentes modelos para multiagentes de IA.');
    expect(chat.textContent).not.toContain('cámaras');
  });

  it('viñetas en los 4 primeros y chips de plataformas en marketing', async () => {
    const { document } = await render();
    const rows = [...document.querySelectorAll('article')];
    expect(rows.slice(0, 4).map((row) => row.querySelectorAll('ul li').length)).toEqual([3, 3, 5, 3]);
    expect([...rows[4]!.querySelectorAll('.chip')].map((c) => text(c))).toEqual(['Meta', 'Google', 'TikTok', 'Pinterest', 'LinkedIn']);
  });

  it('CTAs: el agente abre WhatsApp, marketing baja a las 8 líneas y el resto va al formulario', async () => {
    const { document } = await render();
    const ctas = [...document.querySelectorAll('article a.btn-primary')];
    expect(ctas.map((a) => text(a))).toEqual([
      'Quiero automatizar procesos',
      'Probar el agente ahora en WhatsApp',
      'Cotizar mi software',
      'Evaluar mi seguridad gratis',
      'Ver los 8 servicios de marketing ↓',
    ]);
    const hrefs = ctas.map((a) => a.getAttribute('href')!);
    expect(hrefs[0]).toBe('#contacto');
    expect(hrefs[1]).toMatch(WHATSAPP);
    expect(hrefs[4]).toBe('#marketing360');
  });

  it('"Más solicitado" en Agentes de IA y enlaces a la página de cada servicio', async () => {
    const { document } = await render();
    expect([...document.querySelectorAll('article')][1]!.textContent).toContain('Más solicitado');
    const links = [...document.querySelectorAll('article a[data-detail]')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/servicios/automatizacion-de-procesos/',
      '/servicios/agentes-ia-whatsapp/',
      '/servicios/software-a-medida/',
      '/servicios/seguridad-control-de-acceso/',
      '/marketing-digital/',
    ]);
    expect(text(links[0])).toBe('Ver automatización de procesos →');
  });
});

describe('Marketing360', () => {
  it('#marketing360 con 8 tarjetas numeradas (hub primero) enlazadas a su página', async () => {
    const { view } = await homeView();
    const { document } = await renderAstro(Marketing360, { props: view.marketing });
    expect(document.querySelector('section#marketing360')).not.toBeNull();
    const cards = [...document.querySelectorAll('a[data-card]')];
    expect(cards).toHaveLength(8);
    expect(cards.map((c) => c.getAttribute('href'))).toEqual([
      '/marketing-digital/',
      '/marketing-digital/analisis-web/',
      '/marketing-digital/branding-digital/',
      '/marketing-digital/community-manager/',
      '/marketing-digital/posicionamiento-presencial/',
      '/marketing-digital/email-marketing/',
      '/marketing-digital/pauta-digital/',
      '/marketing-digital/integraciones-web/',
    ]);
    expect(text(cards[0]!.querySelector('[data-number]'))).toBe('01');
    expect(text(cards[6]!.querySelector('h3'))).toBe('Pauta multicanal');
    expect(cards[6]!.textContent).toContain('Meta Ads · Google Ads · TikTok Ads · Pinterest Ads · LinkedIn Ads');
    expect(text(cards[0]!.querySelector('[data-more]'))).toBe('Ver servicio →');
    expect(hrefsOf(document).filter((h) => h === '/marketing-digital/')).toHaveLength(2);
  });
});

describe('LossCalculatorSection', () => {
  it('es la sección #calculadora con título de la referencia y la isla', async () => {
    const { view } = await homeView();
    const { document } = await renderAstro(LossCalculatorSection, { props: view.calculator });
    expect(text(document.querySelector('section#calculadora h2'))).toBe('¿Cuánto te cuesta hacerlo a mano?');
    expect(document.querySelectorAll('input[type="range"]')).toHaveLength(2);
    expect(document.querySelector('astro-island')).not.toBeNull();
  });
});

describe('Results', () => {
  it('3 casos con etiqueta, métrica, cita y enlace; 4 cifras y certificaciones', async () => {
    const { view } = await homeView();
    const { document } = await renderAstro(Results, { props: view.results });
    const cases = [...document.querySelectorAll('article')];
    expect(cases).toHaveLength(3);
    expect(text(cases[0]!.querySelector('.chip'))).toBe('Agente IA · Servicios');
    expect(cases[0]!.querySelector('blockquote')!.textContent).toContain('[Frase real del cliente]');
    expect(cases.map((c) => c.querySelector('a')!.getAttribute('href'))).toEqual([
      '/casos/cliente-ejemplo-1/', '/casos/cliente-ejemplo-2/', '/casos/cliente-ejemplo-3/',
    ]);
    expect(document.querySelectorAll('dl > div')).toHaveLength(4);
    expect(document.body.textContent).toContain('24/7');
    expect(document.querySelectorAll('[data-certification]')).toHaveLength(3);
  });
});

describe('Process', () => {
  it('4 pasos numerados y la garantía con su CTA', async () => {
    const { view } = await homeView();
    const { document } = await renderAstro(Process, { props: view.process });
    expect(document.querySelectorAll('ol > li')).toHaveLength(4);
    expect(text(document.querySelector('ol > li [data-number]'))).toBe('01');
    expect(document.body.textContent).toContain('Garantía Orion: [condición de la garantía]');
    const cta = [...document.querySelectorAll('a')].find((a) => text(a) === 'Empezar sin riesgo')!;
    expect(cta.getAttribute('href')).toBe('#contacto');
  });
});

describe('Shop', () => {
  it('4 productos con distintivo, precio pendiente, enlace y botón "Agregar al carrito"', async () => {
    const { view } = await homeView();
    const { document } = await renderAstro(Shop, { props: view.shop });
    const products = [...document.querySelectorAll('article')];
    expect(products).toHaveLength(4);
    expect(text(products[0]!.querySelector('[data-badge]'))).toBe('Más vendido');
    expect(products[0]!.textContent).toContain('[PRECIO]');
    expect(products[0]!.querySelector('a[href="/tienda/laptop-empresarial-14/"]')).not.toBeNull();
    expect(document.querySelectorAll('astro-island')).toHaveLength(4);
    expect(hrefsOf(document)).toContain('/tienda/');
  });
});

describe('BlogGuides', () => {
  it('3 guías con categoría, título enlazado y tiempo de lectura', async () => {
    const { view } = await homeView();
    const { document } = await renderAstro(BlogGuides, { props: view.blog });
    const articles = [...document.querySelectorAll('article')];
    expect(articles).toHaveLength(3);
    expect(text(articles[0]!.querySelector('.chip'))).toBe('Agentes de IA');
    expect(text(articles[0]!.querySelector('h3 a'))).toBe('¿Cuánto cuesta un chatbot de IA para WhatsApp en Colombia?');
    expect(articles[0]!.textContent).toContain('[N] min de lectura');
    expect(hrefsOf(document)).toContain('/blog/');
  });
});

describe('Faq', () => {
  it('4 preguntas con <details>; la primera abierta', async () => {
    const { view } = await homeView();
    const { document } = await renderAstro(Faq, { props: view.faq });
    const details = [...document.querySelectorAll('details')];
    expect(details).toHaveLength(4);
    expect(details[0]!.hasAttribute('open')).toBe(true);
    expect(text(details[0]!.querySelector('summary'))).toBe('¿El diagnóstico de verdad es gratis?');
  });
});

describe('ContactSection', () => {
  async function render() {
    const { view } = await homeView();
    return renderAstro(ContactSection, { props: { contact: view.contact, slots: view.slots, whatsappHref: await whatsappHref() } });
  }

  it('#contacto con cupos (barra de avance), beneficios y la persona que revisa el diagnóstico', async () => {
    const { document } = await render();
    expect(document.querySelector('section#contacto')).not.toBeNull();
    expect(document.body.textContent).toContain('6 de 10 tomados');
    expect(document.querySelector('[role="progressbar"][aria-valuenow="60"]')).not.toBeNull();
    expect(document.querySelectorAll('[data-benefits] li')).toHaveLength(3);
    expect(document.body.textContent).toContain('Revisa personalmente cada diagnóstico');
  });

  it('formulario (isla) y "Prefiero escribir por WhatsApp"', async () => {
    const { document } = await render();
    expect(document.querySelector('astro-island')).not.toBeNull();
    const wa = [...document.querySelectorAll('a')].find((a) => text(a) === 'Prefiero escribir por WhatsApp')!;
    expect(wa.getAttribute('href')).toMatch(WHATSAPP);
  });
});
