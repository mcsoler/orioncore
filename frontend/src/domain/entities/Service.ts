import { Slug } from '../value-objects/Slug';
import { requireInternalPath, requireItems, requireText } from './guards';

export interface ServiceProps {
  title: string;
  description: string;
  items: readonly string[];
  slug?: string;
  badge?: string;
  /** Destino distinto de /servicios/{slug}/ (p. ej. Marketing 360° → /marketing-digital/). */
  href?: string;
}

/** Servicio de Orion Core con su página en /servicios/{slug}/. */
export class Service {
  private constructor(
    readonly title: string,
    readonly slug: Slug,
    readonly description: string,
    readonly items: readonly string[],
    readonly href: string,
    readonly badge?: string,
  ) {}

  static create(props: ServiceProps): Service {
    const title = requireText('title', props.title);
    const slug = props.slug ? Slug.of(props.slug) : Slug.fromText(title);
    return new Service(
      title,
      slug,
      requireText('description', props.description),
      requireItems('items', props.items),
      props.href ? requireInternalPath('href', props.href) : `/servicios/${slug.value}/`,
      props.badge?.trim() || undefined,
    );
  }
}
