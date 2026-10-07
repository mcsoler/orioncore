import { Slug } from '../value-objects/Slug';
import { optionalText, requireText } from './guards';

export interface ArticleProps {
  title: string;
  excerpt: string;
  slug?: string;
  category?: string;
  /** Texto libre, p. ej. "6 min de lectura · Actualizado 3 oct 2026". */
  readingTime?: string;
  /** Title SEO propio para títulos largos (el sufijo " | Orion Core" no cabe en 60). */
  seoTitle?: string;
}

/** Artículo o guía del blog: /blog/{slug}/. */
export class Article {
  private constructor(
    readonly title: string,
    readonly slug: Slug,
    readonly excerpt: string,
    readonly category?: string,
    readonly readingTime?: string,
    readonly seoTitle?: string,
  ) {}

  static create(props: ArticleProps): Article {
    const title = requireText('title', props.title);
    return new Article(
      title,
      props.slug ? Slug.of(props.slug) : Slug.fromText(title),
      requireText('excerpt', props.excerpt),
      optionalText('category', props.category),
      optionalText('readingTime', props.readingTime),
      optionalText('seoTitle', props.seoTitle),
    );
  }

  get href(): string {
    return `/blog/${this.slug.value}/`;
  }
}
