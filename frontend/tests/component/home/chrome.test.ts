import { describe, expect, it } from 'vitest';
import { renderAstro } from '../../support/renderAstro';
import { homeView, hrefsOf } from '../../support/homeView';
import AnnouncementBar from '../../../src/ui/components/home/AnnouncementBar.astro';
import Header from '../../../src/ui/components/home/Header.astro';
import Footer from '../../../src/ui/components/home/Footer.astro';
import WhatsAppFloat from '../../../src/ui/components/home/WhatsAppFloat.astro';

const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, ' ').trim();

describe('AnnouncementBar (escasez)', () => {
  it('fondo azul, texto de cupos y enlace "Reservar el mío →" al formulario', async () => {
    const { view } = await homeView();
    const { document, html } = await renderAstro(AnnouncementBar, { props: { ...view.announcement, slots: view.slots } });
    expect(document.body.textContent).toMatch(/Diagnóstico gratuito de [a-záéíóú]+: quedan solo 4 de 10 cupos/);
    expect(document.querySelector('astro-island')).not.toBeNull(); // se actualiza con los cupos reales
    const link = document.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('#contacto');
    expect(text(link)).toBe('Reservar el mío →');
    expect(html).toContain('bg-brand-blue');
  });
});

describe('Header', () => {
  async function render() {
    const { container } = await homeView();
    return renderAstro(Header, { props: { nav: container.routes.navigation() } });
  }

  it('el logo enlaza al inicio y la navegación principal está etiquetada', async () => {
    const { document } = await render();
    expect(document.querySelector('header a[href="/"]')!.getAttribute('aria-label')).toBe('Orion Core Tecnologías, inicio');
    expect(document.querySelector('nav[aria-label="Principal"]')).not.toBeNull();
  });

  it('muestra Servicios, Marketing digital, Tienda, Casos y Blog desde el RouteRegistry', async () => {
    const { document } = await render();
    const nav = document.querySelector('nav[aria-label="Principal"]')!;
    for (const label of ['Servicios', 'Marketing digital', 'Tienda', 'Casos', 'Blog']) expect(nav.textContent).toContain(label);
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
    expect(hrefsOf(document)).toContain('/marketing-digital/posicionamiento-presencial/');
  });

  it('carrito con contador (isla) y CTA "Diagnóstico gratis"', async () => {
    const { document } = await render();
    const cart = document.querySelector('header a[data-cart]')!;
    expect(cart.getAttribute('href')).toBe('/tienda/');
    // Nombre accesible desde el contenido (incluye el contador), no con aria-label
    expect(cart.hasAttribute('aria-label')).toBe(false);
    expect(text(cart.querySelector('.sr-only'))).toBe('Carrito (ir a la tienda)');
    expect(cart.querySelector('astro-island')).not.toBeNull();
    const cta = [...document.querySelectorAll('a')].find((a) => text(a) === 'Diagnóstico gratis')!;
    expect(cta.getAttribute('href')).toBe('/contacto/');
    expect(cta.className).toContain('btn-primary');
  });

  it('menú móvil con aria-expanded y aria-controls', async () => {
    const { document } = await render();
    const button = document.querySelector('button[data-mobile-toggle]')!;
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Abrir menú');
    expect(document.getElementById(button.getAttribute('aria-controls')!)).not.toBeNull();
  });

  it('header sólido de la referencia: sticky, fondo navy y borde inferior', async () => {
    const { html } = await render();
    expect(html).toMatch(/<header[^>]*class="[^"]*sticky[^"]*bg-navy[^"]*border-line/);
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
      props: { groups: container.routes.footerSitemap(), legal: container.routes.legalLinks(), business: view.business },
    });
  }

  it('mapa del sitio con la estructura de la referencia', async () => {
    const { document } = await render();
    const headings = [...document.querySelectorAll('footer h2')].map((h) => text(h));
    expect(headings).toEqual(['Servicios', 'Marketing digital', 'Tienda', 'Empresa']);
    expect(hrefsOf(document)).toEqual(expect.arrayContaining(['/marketing-digital/', '/tienda/', '/nosotros/', '/contacto/']));
  });

  it('<address> con nombre, dirección, ciudad, teléfono, correo y horario (NAP)', async () => {
    const { document } = await render();
    const address = document.querySelector('address')!;
    expect(address.textContent).toContain('[Dirección], [Barrio]');
    expect(address.textContent).toContain('Bogotá D.C., Colombia');
    expect(address.querySelector('a[href="tel:+573054195433"]')!.textContent).toContain('+57 305 419 5433');
    expect(address.querySelector('a[href="mailto:orioncoretechnologies@gmail.com"]')).not.toBeNull();
    expect(address.textContent).toContain('Lun a vie');
    expect(text(document.querySelector('footer strong'))).toBe('Orion Core Tecnologías');
  });

  it('barra inferior: razón social, NIT, legales y mapa del sitio', async () => {
    const { document } = await render();
    expect(document.body.textContent).toMatch(/© \d{4} Orion Core Tecnologías S\.A\.S\. · NIT \[número\]/);
    expect(hrefsOf(document)).toEqual(expect.arrayContaining(['/privacidad/', '/terminos/', '/sitemap-index.xml']));
  });

  it('sin Blockchain, Twitter, href="#" ni enlaces a Google Business inexistentes', async () => {
    const { document } = await render();
    expect(document.body.textContent).not.toMatch(/blockchain|twitter/i);
    expect(hrefsOf(document)).not.toContain('#');
    expect(hrefsOf(document).some((h) => h.includes('google'))).toBe(false);
  });
});

describe('WhatsAppFloat', () => {
  it('enlace a wa.me, 60 px, verde de WhatsApp, con nombre accesible', async () => {
    const { container, view } = await homeView();
    const href = container.whatsappLink(view.business.whatsapp, view.contact.whatsappMessage);
    const { document } = await renderAstro(WhatsAppFloat, { props: { href } });
    const a = document.querySelector('a')!;
    expect(a.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/573054195433\?text=/);
    expect(a.getAttribute('aria-label')).toBe('Escribir por WhatsApp');
    expect(a.className).toContain('fixed');
    expect(a.className).toContain('bg-whatsapp');
    expect(a.className).toContain('w-[60px]');
  });

  it('sin número confirmado no se muestra', async () => {
    const { document } = await renderAstro(WhatsAppFloat, { props: { href: undefined } });
    expect(document.querySelector('a')).toBeNull();
  });
});
