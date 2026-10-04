import { Slug } from '../value-objects/Slug';
import { requireText } from './guards';

/** Artículo o guía del blog: /blog/{slug}/. */
export class Article {
  private constructor(
    readonly title: string,
    readonly slug: Slug,
    readonly excerpt: string,
  ) {}

  static create(props: { title: string; excerpt: string; slug?: string }): Article {
    const title = requireText('title', props.title);
    return new Article(
      title,
      props.slug ? Slug.of(props.slug) : Slug.fromText(title),
      requireText('excerpt', props.excerpt),
    );
  }

  get href(): string {
    return `/blog/${this.slug.value}/`;
  }
}
