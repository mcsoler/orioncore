import { describe, expect, it } from 'vitest';
import { renderAstro } from '../../support/renderAstro';
import { homeView, hrefsOf } from '../../support/homeView';
import AnnouncementBar from '../../../src/ui/components/home/AnnouncementBar.astro';
import Header from '../../../src/ui/components/home/Header.astro';
import Footer from '../../../src/ui/components/home/Footer.astro';
import WhatsAppFloat from '../../../src/ui/components/home/WhatsAppFloat.astro';

describe('AnnouncementBar', () => {
  it('muestra los cupos y lleva al formulario de la misma página', async () => {
    const { view } = await homeView();
    const { document } = await renderAstro(AnnouncementBar, { props: view.announcement });
    expect(document.body.textContent).toContain('quedan [N] de [10] cupos');
    expect(document.querySelector('a')!.getAttribute('href')).toBe('#contacto');
  });
});

describe('Header', () => {
  async function render() {
    const { container } = await homeView();
    return renderAstro(Header, { props: { nav: container.routes.navigation() } });
  }

  it('el logo enlaza al inicio y la navegación principal está etiquetada', async () => {
    const { document } = await render();
    const home = document.querySelector('header a[href="/"]')!;
    expect(home.getAttribute('aria-label')).toBe('Orion Core Tecnologías, inicio');
    expect(document.querySelector('nav[aria-label="Principal"]')).not.toBeNull();
  });

  it('muestra Servicios, Marketing digital, Tienda, Casos y Blog desde el RouteRegistry', async () => {
    const { document } = await render();
    const nav = document.querySelector('nav[aria-label="Principal"]')!;
    for (const label of ['Servicios', 'Marketing digital', 'Tienda', 'Casos', 'Blog']) {
      expect(nav.textContent).toContain(label);
    }
    expect(hrefsOf(document)).toEqual(expect.arrayContaining(['/tienda/', '/casos/', '/blog/']));
  });

  it('los submenús son botones de despliegue accesibles con enlaces reales', async () => {
    const { document } = await render();
    const toggle = document.querySelector('button[data-submenu-toggle]')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    const menu = document.getElementById(toggle.getAttribute('aria-controls')!)!;
    expect([...menu.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toEqual([
      '/servicios/automatizacion-de-procesos/',
      '/servicios/agentes-ia-whatsapp/',
      '/servicios/software-a-medida/',
      '/servicios/seguridad-control-de-acceso/',
    ]);
    expect(hrefsOf(document)).toContain('/marketing-digital/pauta-digital/');
  });

  it('tiene carrito y CTA "Diagnóstico gratis" hacia /contacto/', async () => {
    const { document } = await render();
    expect(document.querySelector('a[aria-label^="Carrito"]')!.getAttribute('href')).toBe('/tienda/');
    const cta = [...document.querySelectorAll('a')].find((a) => a.textContent?.includes('Diagnóstico gratis'))!;
    expect(cta.getAttribute('href')).toBe('/contacto/');
  });

  it('el menú móvil se abre con un botón con aria-expanded y aria-controls', async () => {
    const { document } = await render();
    const button = document.querySelector('button[data-mobile-toggle]')!;
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Abrir menú');
    expect(document.getElementById(button.getAttribute('aria-controls')!)).not.toBeNull();
  });

  it('conserva el estilo translúcido (nav-glass + blur) y es sticky', async () => {
    const { html } = await render();
    expect(html).toContain('bg-nav-glass');
    expect(html).toContain('backdrop-blur');
    expect(html).toContain('sticky');
  });

  it('no tiene href="#"', async () => {
    const { document } = await render();
    expect(hrefsOf(document)).not.toContain('#');
  });
});

describe('Footer', () => {
  async function render() {
    const { container, view } = await homeView();
    return renderAstro(Footer, {
      props: {
        groups: container.routes.footerSitemap(),
        business: view.business,
        whatsappHref: container.whatsappLink(view.business.whatsapp, view.contact.whatsappMessage),
      },
    });
  }

  it('muestra el logo y el mapa del sitio desde el RouteRegistry', async () => {
    const { document } = await render();
    expect(document.querySelector('footer svg')).not.toBeNull();
    const headings = [...document.querySelectorAll('footer h2')].map((h) => h.textContent?.trim());
    expect(headings).toEqual(['Servicios', 'Marketing digital', 'Empresa', 'Legal']);
    expect(hrefsOf(document)).toEqual(expect.arrayContaining(['/privacidad/', '/terminos/', '/contacto/', '/nosotros/']));
  });

  it('incluye <address> con nombre, teléfono, WhatsApp y correo reales', async () => {
    const { document } = await render();
    const address = document.querySelector('address')!;
    expect(address.textContent).toContain('Orion Core Tecnologías');
    expect(address.querySelector('a[href="tel:+573054195433"]')!.textContent).toContain('+57 305 419 5433');
    expect(address.querySelector('a[href="mailto:orioncoretechnologies@gmail.com"]')).not.toBeNull();
    expect(address.querySelector('a[href^="https://wa.me/573054195433"]')).not.toBeNull();
  });

  it('elimina Blockchain, Twitter y los href="#"', async () => {
    const { document } = await render();
    expect(document.body.textContent).not.toMatch(/blockchain|twitter/i);
    expect(hrefsOf(document)).not.toContain('#');
  });

  it('no publica marcadores [X] de dirección como enlace a Google Business inexistente', async () => {
    const { document } = await render();
    expect(hrefsOf(document).some((h) => h.includes('google'))).toBe(false);
  });
});

describe('WhatsAppFloat', () => {
  it('es un enlace a wa.me con nombre accesible y no tapa contenido (fijo, esquina inferior)', async () => {
    const { container, view } = await homeView();
    const href = container.whatsappLink(view.business.whatsapp, view.contact.whatsappMessage);
    const { document } = await renderAstro(WhatsAppFloat, { props: { href } });
    const a = document.querySelector('a')!;
    expect(a.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/573054195433\?text=/);
    expect(a.getAttribute('aria-label')).toBe('Escríbenos por WhatsApp');
    expect(a.className).toContain('fixed');
    expect(a.className).toContain('bottom-');
  });

  it('sin número confirmado no se muestra', async () => {
    const { document } = await renderAstro(WhatsAppFloat, { props: { href: undefined } });
    expect(document.querySelector('a')).toBeNull();
  });
});
