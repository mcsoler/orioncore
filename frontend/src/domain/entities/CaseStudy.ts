import { Slug } from '../value-objects/Slug';
import { requireText } from './guards';

/** Caso de éxito: /casos/{slug}/. */
export class CaseStudy {
  private constructor(
    readonly client: string,
    readonly slug: Slug,
    readonly summary: string,
    readonly result: string,
  ) {}

  static create(props: { client: string; summary: string; result: string; slug?: string }): CaseStudy {
    const client = requireText('client', props.client);
    return new CaseStudy(
      client,
      props.slug ? Slug.of(props.slug) : Slug.fromText(client),
      requireText('summary', props.summary),
      requireText('result', props.result),
    );
  }

  get href(): string {
    return `/casos/${this.slug.value}/`;
  }
}
