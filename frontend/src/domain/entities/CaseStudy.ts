import { Slug } from '../value-objects/Slug';
import { optionalText, requireText } from './guards';

export interface CaseStudyProps {
  client: string;
  summary: string;
  result: string;
  slug?: string;
  /** Etiqueta: servicio · industria. */
  tag?: string;
  quote?: string;
  quoteAuthor?: string;
}

/** Caso de éxito: /casos/{slug}/. */
export class CaseStudy {
  private constructor(
    readonly client: string,
    readonly slug: Slug,
    readonly summary: string,
    readonly result: string,
    readonly tag?: string,
    readonly quote?: string,
    readonly quoteAuthor?: string,
  ) {}

  static create(props: CaseStudyProps): CaseStudy {
    const client = requireText('client', props.client);
    return new CaseStudy(
      client,
      props.slug ? Slug.of(props.slug) : Slug.fromText(client),
      requireText('summary', props.summary),
      requireText('result', props.result),
      optionalText('tag', props.tag),
      optionalText('quote', props.quote),
      optionalText('quoteAuthor', props.quoteAuthor),
    );
  }

  get href(): string {
    return `/casos/${this.slug.value}/`;
  }
}
