import { describe, expect, it } from 'vitest';
import { RouteRegistry } from '../../../src/domain/routing/RouteRegistry';
import type { SiteRouteProps } from '../../../src/domain/entities/SiteRoute';
import { DomainError, InvalidValueError } from '../../../src/domain/errors/DomainError';

const routes: SiteRouteProps[] = [
  { path: '/', title: 'Inicio', status: 'published', section: 'home' },
  { path: '/servicios/automatizacion-de-procesos/', title: 'Automatización de procesos', status: 'draft', section: 'servicios' },
  { path: '/servicios/agentes-ia-whatsapp/', title: 'Agentes de IA para WhatsApp', status: 'published', section: 'servicios' },
  { path: '/marketing-digital/', title: 'Marketing digital', status: 'draft', section: 'marketing' },
  { path: '/marketing-digital/analisis-web/', title: 'Análisis web', status: 'draft', section: 'marketing' },
  { path: '/tienda/', title: 'Tienda', status: 'draft', section: 'tienda' },
  { path: '/tienda/kits/', title: 'Kits', status: 'draft', section: 'tienda', pattern: '/tienda/[categoria]/' },
  { path: '/tienda/kit-1/', title: 'Kit 1', status: 'draft', section: 'tienda', pattern: '/tienda/[producto]/' },
  { path: '/casos/', title: 'Casos', status: 'draft', section: 'casos' },
  { path: '/casos/cliente-1/', title: 'Cliente 1', status: 'draft', section: 'casos', pattern: '/casos/[cliente]/' },
  { path: '/blog/', title: 'Blog', status: 'draft', section: 'blog' },
  { path: '/blog/guia-1/', title: 'Guía 1', status: 'draft', section: 'blog', pattern: '/blog/[articulo]/' },
  { path: '/nosotros/', title: 'Nosotros', status: 'draft', section: 'empresa' },
  { path: '/contacto/', title: 'Contacto', status: 'published', section: 'empresa' },
  { path: '/privacidad/', title: 'Privacidad', status: 'draft', section: 'legal' },
];

const registry = () => RouteRegistry.create(routes);

describe('RouteRegistry', () => {
  describe('validación', () => {
    it('rechaza rutas sin barra final', () => {
      expect(() => RouteRegistry.create([{ ...routes[0]!, path: '/nosotros' }])).toThrow(InvalidValueError);
    });

    it('rechaza rutas duplicadas', () => {
      expect(() => RouteRegistry.create([...routes, { ...routes[1]! }])).toThrow(/duplicada/);
    });

    it('impide que una categoría y un producto de la tienda compartan slug', () => {
      const clash: SiteRouteProps = {
        path: '/tienda/kits/', title: 'Producto Kits', status: 'draft', section: 'tienda', pattern: '/tienda/[producto]/',
      };
      expect(() => RouteRegistry.create([...routes, clash])).toThrow(/categoría.*producto|producto.*categoría/);
    });

    it('rechaza un patrón al que no corresponde la ruta', () => {
      const wrong: SiteRouteProps = {
        path: '/blog/x/', title: 'X', status: 'draft', section: 'blog', pattern: '/casos/[cliente]/',
      };
      expect(() => RouteRegistry.create([...routes, wrong])).toThrow(DomainError);
    });

    it('rechaza estados desconocidos', () => {
      expect(() =>
        RouteRegistry.create([{ ...routes[0]!, status: 'hidden' as unknown as 'draft' }]),
      ).toThrow(InvalidValueError);
    });
  });

  it('cada ruta expone su description y su title SEO opcional', () => {
    const route = RouteRegistry.create([
      { ...routes[0]!, description: 'Descripción del home', seoTitle: 'Título SEO | Orion Core' },
    ]).get('/');
    expect(route.description).toBe('Descripción del home');
    expect(route.seoTitle).toBe('Título SEO | Orion Core');
    expect(registry().get('/nosotros/').seoTitle).toBeUndefined();
  });

  it('todas las rutas terminan en barra', () => {
    expect(registry().all().every((r) => r.path.endsWith('/'))).toBe(true);
  });

  it('agrupa las páginas de colecciones bajo su patrón', () => {
    expect(registry().patterns()).toContain('/tienda/[producto]/');
    expect(registry().patterns()).not.toContain('/tienda/kit-1/');
    expect(registry().patterns()).toContain('/servicios/agentes-ia-whatsapp/');
  });

  it('has() indica si una ruta existe', () => {
    expect(registry().has('/contacto/')).toBe(true);
    expect(registry().has('/no-existe/')).toBe(false);
  });

  it('sitemapEntries() solo incluye rutas publicadas', () => {
    expect(registry().sitemapEntries()).toEqual(['/', '/servicios/agentes-ia-whatsapp/', '/contacto/']);
  });

  it('robotsFor() devuelve noindex para draft e index para published', () => {
    expect(registry().robotsFor('/nosotros/')).toBe('noindex, follow');
    expect(registry().robotsFor('/contacto/')).toBe('index, follow');
  });

  it('robotsFor() falla con una ruta desconocida', () => {
    expect(() => registry().robotsFor('/no-existe/')).toThrow(DomainError);
  });

  it('breadcrumbsFor() construye la ruta desde el inicio, saltando niveles sin página', () => {
    expect(registry().breadcrumbsFor('/marketing-digital/analisis-web/')).toEqual([
      { label: 'Inicio', href: '/' },
      { label: 'Marketing digital', href: '/marketing-digital/' },
      { label: 'Análisis web', href: '/marketing-digital/analisis-web/' },
    ]);
    expect(registry().breadcrumbsFor('/servicios/agentes-ia-whatsapp/')).toEqual([
      { label: 'Inicio', href: '/' },
      { label: 'Agentes de IA para WhatsApp', href: '/servicios/agentes-ia-whatsapp/' },
    ]);
  });

  it('navigation() expone Servicios, Marketing digital, Tienda, Casos y Blog', () => {
    const nav = registry().navigation();
    expect(nav.map((n) => n.label)).toEqual(['Servicios', 'Marketing digital', 'Tienda', 'Casos', 'Blog']);

    const [servicios, marketing, tienda] = nav;
    expect(servicios!.href).toBeUndefined();
    expect(servicios!.children.map((c) => c.href)).toEqual([
      '/servicios/automatizacion-de-procesos/',
      '/servicios/agentes-ia-whatsapp/',
    ]);
    expect(marketing!.href).toBe('/marketing-digital/');
    expect(marketing!.children.map((c) => c.href)).toEqual(['/marketing-digital/analisis-web/']);
    // Las páginas de colección (productos, categorías) no van en el menú
    expect(tienda).toEqual({ label: 'Tienda', href: '/tienda/', children: [] });
  });

  it('footerSitemap() agrupa servicios, marketing, empresa y legal', () => {
    const footer = registry().footerSitemap();
    expect(footer.map((g) => g.title)).toEqual(['Servicios', 'Marketing digital', 'Empresa', 'Legal']);
    expect(footer[1]!.links.map((l) => l.href)).toEqual(['/marketing-digital/', '/marketing-digital/analisis-web/']);
    expect(footer[2]!.links.map((l) => l.href)).toEqual(['/tienda/', '/casos/', '/blog/', '/nosotros/', '/contacto/']);
    expect(footer[3]!.links.map((l) => l.href)).toEqual(['/privacidad/']);
  });
});
