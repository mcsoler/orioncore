import { Slug } from '../value-objects/Slug';
import { InvalidValueError } from '../errors/DomainError';
import { optionalText, requireInternalPath, requireItems, requireText } from './guards';

/** Destinos válidos del CTA de un servicio: un ancla del home o el WhatsApp de la empresa. */
const CTA_TARGET = /^(#[a-z][a-z0-9-]*|whatsapp)$/;

export interface ServiceProps {
  title: string;
  description: string;
  items: readonly string[];
  slug?: string;
  badge?: string;
  /** Titular de beneficio que se muestra en el home. */
  headline?: string;
  /** Texto del botón del servicio. */
  cta?: string;
  /** Destino del botón: `#contacto` (por defecto), otra ancla del home o `whatsapp`. */
  ctaHref?: string;
  /** Texto del enlace a la página del servicio. */
  linkLabel?: string;
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
    readonly headline?: string,
    readonly cta?: string,
    readonly ctaHref: string = '#contacto',
    readonly linkLabel?: string,
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
      optionalText('headline', props.headline),
      optionalText('cta', props.cta),
      ctaTarget(props.ctaHref),
      optionalText('linkLabel', props.linkLabel),
    );
  }
}

function ctaTarget(href: string | undefined): string {
  if (href === undefined) return '#contacto';
  if (!CTA_TARGET.test(href)) throw new InvalidValueError('ctaHref', `"${href}" debe ser un ancla (#id) o "whatsapp"`);
  return href;
}
