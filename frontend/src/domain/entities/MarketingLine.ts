import { Slug } from '../value-objects/Slug';
import { optionalText, requireItems, requireText } from './guards';

export interface MarketingLineProps {
  title: string;
  description: string;
  items: readonly string[];
  slug?: string;
  /** Gancho corto de la tarjeta del home. */
  hook?: string;
}

/** Línea de Marketing 360° con su página en /marketing-digital/{slug}/. */
export class MarketingLine {
  private constructor(
    readonly title: string,
    readonly slug: Slug,
    readonly description: string,
    readonly items: readonly string[],
    readonly hook?: string,
  ) {}

  static create(props: MarketingLineProps): MarketingLine {
    const title = requireText('title', props.title);
    return new MarketingLine(
      title,
      props.slug ? Slug.of(props.slug) : Slug.fromText(title),
      requireText('description', props.description),
      requireItems('items', props.items),
      optionalText('hook', props.hook),
    );
  }

  get href(): string {
    return `/marketing-digital/${this.slug.value}/`;
  }
}
