import { DomainError, InvalidValueError } from '../errors/DomainError';
import { requireInternalPath, requireText } from './guards';

export const ROUTE_STATUSES = ['draft', 'published'] as const;
export type RouteStatus = (typeof ROUTE_STATUSES)[number];

export const ROUTE_SECTIONS = ['home', 'servicios', 'marketing', 'tienda', 'casos', 'blog', 'empresa', 'legal'] as const;
export type RouteSection = (typeof ROUTE_SECTIONS)[number];

export interface SiteRouteProps {
  path: string;
  title: string;
  status: RouteStatus;
  section: RouteSection;
  /** Patrón dinámico al que pertenece (p. ej. `/tienda/[producto]/`). Por defecto, la propia ruta. */
  pattern?: string;
  /** Meta description de la página. */
  description?: string;
  /** Title SEO propio; si no hay, la página usa "{title} | Orion Core". */
  seoTitle?: string;
}

/** Una URL del sitio. `draft` = existe pero no se indexa; `published` = indexable y en el sitemap. */
export class SiteRoute {
  private constructor(
    readonly path: string,
    readonly title: string,
    readonly status: RouteStatus,
    readonly section: RouteSection,
    readonly pattern: string,
    readonly description?: string,
    readonly seoTitle?: string,
  ) {}

  static create(props: SiteRouteProps): SiteRoute {
    const path = requireInternalPath('path', props.path);
    if (!ROUTE_STATUSES.includes(props.status)) {
      throw new InvalidValueError('status', `"${props.status}" no es draft ni published`);
    }
    if (!ROUTE_SECTIONS.includes(props.section)) {
      throw new InvalidValueError('section', `"${props.section}" no es una sección conocida`);
    }
    const pattern = props.pattern ?? path;
    if (!patternToRegExp(pattern).test(path)) {
      throw new DomainError(`La ruta ${path} no corresponde al patrón ${pattern}`);
    }
    return new SiteRoute(
      path,
      requireText('title', props.title),
      props.status,
      props.section,
      pattern,
      props.description?.trim() || undefined,
      props.seoTitle?.trim() || undefined,
    );
  }

  /** Página generada desde una colección (producto, caso, artículo...). */
  get isCollectionItem(): boolean {
    return this.pattern !== this.path;
  }

  get depth(): number {
    return this.path.split('/').filter(Boolean).length;
  }
}

function patternToRegExp(pattern: string): RegExp {
  const source = pattern
    .split(/(\[[a-z]+\])/)
    .map((part) => (/^\[[a-z]+\]$/.test(part) ? '[a-z0-9-]+' : part.replace(/[.*+?^${}()|\\]/g, '\\$&')))
    .join('');
  return new RegExp(`^${source}$`);
}
