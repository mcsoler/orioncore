import { SiteRoute, type RouteSection, type SiteRouteProps } from '../entities/SiteRoute';
import { DomainError, RouteNotFoundError } from '../errors/DomainError';

export interface Link {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  /** Sin href cuando la sección no tiene página índice (p. ej. Servicios). */
  href?: string;
  children: Link[];
}

export interface FooterGroup {
  title: string;
  links: Link[];
}

const NAVIGATION: ReadonlyArray<[RouteSection, string]> = [
  ['servicios', 'Servicios'],
  ['marketing', 'Marketing digital'],
  ['tienda', 'Tienda'],
  ['casos', 'Casos'],
  ['blog', 'Blog'],
];

const SHOP_PATTERNS = new Set(['/tienda/[categoria]/', '/tienda/[producto]/']);

/**
 * Fuente única de verdad de las URLs del sitio. De aquí salen la navegación,
 * el footer, las migas de pan, el sitemap y la directiva robots de cada página.
 */
export class RouteRegistry {
  private constructor(private readonly routes: ReadonlyMap<string, SiteRoute>) {}

  static create(props: readonly SiteRouteProps[]): RouteRegistry {
    const routes = new Map<string, SiteRoute>();
    for (const route of props.map(SiteRoute.create)) {
      const existing = routes.get(route.path);
      if (existing) {
        if (SHOP_PATTERNS.has(existing.pattern) && SHOP_PATTERNS.has(route.pattern) && existing.pattern !== route.pattern) {
          throw new DomainError(`Una categoría y un producto de la tienda comparten la ruta ${route.path}`);
        }
        throw new DomainError(`Ruta duplicada: ${route.path}`);
      }
      routes.set(route.path, route);
    }
    return new RouteRegistry(routes);
  }

  all(): SiteRoute[] {
    return [...this.routes.values()];
  }

  /** Patrones de URL del sitio; las páginas de una colección comparten el suyo. */
  patterns(): string[] {
    return [...new Set(this.all().map((r) => r.pattern))];
  }

  has(path: string): boolean {
    return this.routes.has(path);
  }

  get(path: string): SiteRoute {
    const route = this.routes.get(path);
    if (!route) throw new RouteNotFoundError(path);
    return route;
  }

  sitemapEntries(): string[] {
    return this.all().filter((r) => r.status === 'published').map((r) => r.path);
  }

  robotsFor(path: string): 'index, follow' | 'noindex, follow' {
    return this.get(path).status === 'published' ? 'index, follow' : 'noindex, follow';
  }

  breadcrumbsFor(path: string): Link[] {
    this.get(path);
    const segments = path.split('/').filter(Boolean);
    return ['/', ...segments.map((_, i) => `/${segments.slice(0, i + 1).join('/')}/`)]
      .filter((prefix) => this.has(prefix))
      .map((prefix) => toLink(this.get(prefix)));
  }

  navigation(): NavItem[] {
    return NAVIGATION.map(([section, label]) => {
      const index = this.indexOf(section);
      return {
        label,
        ...(index && { href: index.path }),
        children: this.pagesOf(section).filter((r) => r !== index).map(toLink),
      };
    });
  }

  footerSitemap(): FooterGroup[] {
    const indexes = (['tienda', 'casos', 'blog'] as const)
      .map((section) => this.indexOf(section))
      .filter((r): r is SiteRoute => r !== undefined);
    return [
      { title: 'Servicios', links: this.pagesOf('servicios').map(toLink) },
      { title: 'Marketing digital', links: this.pagesOf('marketing').map(toLink) },
      { title: 'Empresa', links: [...indexes, ...this.pagesOf('empresa')].map(toLink) },
      { title: 'Legal', links: this.pagesOf('legal').map(toLink) },
    ];
  }

  /** Páginas fijas de una sección (sin las páginas de colección). */
  private pagesOf(section: RouteSection): SiteRoute[] {
    return this.all().filter((r) => r.section === section && !r.isCollectionItem);
  }

  /** Página índice de una sección: la de primer nivel (`/tienda/`, `/marketing-digital/`). */
  private indexOf(section: RouteSection): SiteRoute | undefined {
    return this.pagesOf(section).find((r) => r.depth === 1);
  }
}

function toLink(route: SiteRoute): Link {
  return { label: route.title, href: route.path };
}
