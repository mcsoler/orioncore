import { describe, expect, it } from 'vitest';
import { renderAstro } from '../../support/renderAstro';
import Logo from '../../../src/ui/components/shared/Logo.astro';
import Button from '../../../src/ui/components/shared/Button.astro';
import Section from '../../../src/ui/components/shared/Section.astro';
import Icon from '../../../src/ui/components/shared/Icon.astro';
import Breadcrumbs from '../../../src/ui/components/shared/Breadcrumbs.astro';
import Chip from '../../../src/ui/components/shared/Chip.astro';
import Card from '../../../src/ui/components/shared/Card.astro';

describe('Logo', () => {
  it('variant full: isotipo de la constelación de Orión + wordmark de dos líneas', async () => {
    const { document } = await renderAstro(Logo, { props: { variant: 'full', tone: 'dark' } });
    const svg = document.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('viewBox')).toBe('0 0 36 36');
    expect(svg.querySelectorAll('circle')).toHaveLength(8); // 7 nodos + halo
    expect(svg.querySelectorAll('line')).toHaveLength(8);
    expect(document.body.textContent).toContain('Orion Core');
    expect(document.body.textContent).toContain('Tecnologías');
  });

  it('variant isotype: solo el símbolo, con nombre accesible', async () => {
    const { document } = await renderAstro(Logo, { props: { variant: 'isotype' } });
    expect(document.querySelector('svg')!.getAttribute('role')).toBe('img');
    expect(document.querySelector('svg')!.getAttribute('aria-label')).toBe('Orion Core Tecnologías');
    expect(document.body.textContent?.trim()).not.toContain('Tecnologías');
  });

  it('tone dark (fondo oscuro) usa texto blanco; tone light (fondo claro) usa ink', async () => {
    const dark = await renderAstro(Logo, { props: { tone: 'dark' } });
    const light = await renderAstro(Logo, { props: { tone: 'light' } });
    expect(dark.html).toContain('text-white');
    expect(light.html).toContain('text-ink');
  });
});

describe('Button', () => {
  it('es un enlace real con la variante indicada', async () => {
    const { document } = await renderAstro(Button, {
      props: { href: '/contacto/', variant: 'primary' },
      slots: { default: 'Hablemos' },
    });
    const a = document.querySelector('a')!;
    expect(a.getAttribute('href')).toBe('/contacto/');
    expect(a.className).toContain('btn-primary');
    expect(a.textContent?.trim()).toBe('Hablemos');
  });

  it('los enlaces externos abren en otra pestaña con rel seguro', async () => {
    const { document } = await renderAstro(Button, {
      props: { href: 'https://wa.me/573054195433', variant: 'whatsapp' },
      slots: { default: 'WhatsApp' },
    });
    const a = document.querySelector('a')!;
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('nunca acepta href="#"', async () => {
    await expect(renderAstro(Button, { props: { href: '#' }, slots: { default: 'x' } })).rejects.toThrow(/href/);
  });
});

describe('Section', () => {
  it('es un <section> etiquetado por su H2 y con el fondo indicado', async () => {
    const { document } = await renderAstro(Section, {
      props: { id: 'servicios', tone: 'light', eyebrow: 'Soluciones', title: 'Nuestros servicios', subtitle: 'Sub' },
      slots: { default: '<p>contenido</p>' },
    });
    const section = document.querySelector('section')!;
    const h2 = section.querySelector('h2')!;
    expect(section.id).toBe('servicios');
    expect(section.getAttribute('aria-labelledby')).toBe(h2.id);
    expect(h2.textContent).toBe('Nuestros servicios');
    expect(section.className).toContain('bg-bg-main');
    expect(section.textContent).toContain('contenido');
  });

  it('tone dark usa el navy de la marca', async () => {
    const { document } = await renderAstro(Section, { props: { id: 'x', tone: 'dark', title: 'T' } });
    expect(document.querySelector('section')!.className).toContain('bg-navy');
  });
});

describe('Icon', () => {
  it('es decorativo por defecto (aria-hidden)', async () => {
    const { document } = await renderAstro(Icon, { props: { name: 'check' } });
    expect(document.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('con label se anuncia como imagen', async () => {
    const { document } = await renderAstro(Icon, { props: { name: 'whatsapp', label: 'WhatsApp' } });
    const svg = document.querySelector('svg')!;
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('WhatsApp');
  });

  it('falla con un ícono desconocido', async () => {
    await expect(renderAstro(Icon, { props: { name: 'no-existe' } })).rejects.toThrow(/no-existe/);
  });
});

describe('Breadcrumbs', () => {
  const items = [
    { label: 'Inicio', href: '/' },
    { label: 'Marketing digital', href: '/marketing-digital/' },
    { label: 'Análisis web', href: '/marketing-digital/analisis-web/' },
  ];

  it('es una lista ordenada navegable; el último elemento es la página actual', async () => {
    const { document } = await renderAstro(Breadcrumbs, { props: { items } });
    const nav = document.querySelector('nav')!;
    expect(nav.getAttribute('aria-label')).toBe('Migas de pan');
    expect([...nav.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toEqual(['/', '/marketing-digital/']);
    expect(nav.querySelector('[aria-current="page"]')!.textContent).toBe('Análisis web');
  });

  it('incluye el JSON-LD BreadcrumbList con URLs absolutas', async () => {
    const { document } = await renderAstro(Breadcrumbs, { props: { items, site: 'https://orioncore.co' } });
    const json = JSON.parse(document.querySelector('script[type="application/ld+json"]')!.textContent!);
    expect(json['@type']).toBe('BreadcrumbList');
    expect(json.itemListElement[2].item).toBe('https://orioncore.co/marketing-digital/analisis-web/');
  });
});

describe('Chip y Card', () => {
  it('Chip muestra su texto', async () => {
    const { document } = await renderAstro(Chip, { slots: { default: 'Más solicitado' } });
    expect(document.body.textContent?.trim()).toBe('Más solicitado');
  });

  it('Card con href es un enlace con un título de nivel configurable', async () => {
    const { document } = await renderAstro(Card, {
      props: { href: '/blog/x/', title: 'Guía', headingLevel: 3 },
      slots: { default: '<p>Resumen</p>' },
    });
    expect(document.querySelector('a')!.getAttribute('href')).toBe('/blog/x/');
    expect(document.querySelector('h3')!.textContent).toBe('Guía');
  });
});
