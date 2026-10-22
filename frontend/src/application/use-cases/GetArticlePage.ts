import type { ArticlePageView } from '../dto/PageViews';
import type { PageContentRepository } from '../ports/out/PageContentRepository';
import { DomainError, RouteNotFoundError } from '../../domain/errors/DomainError';

/** Plantilla de artículo del blog: /blog/{articulo}/. */
export class GetArticlePage {
  constructor(private readonly content: PageContentRepository) {}

  execute(slug: string): ArticlePageView {
    const blog = this.content.getBlog();
    const entry = blog.articles.find(({ article }) => article.slug.value === slug);
    if (!entry) throw new RouteNotFoundError(`/blog/${slug}/`);
    const { article, body } = entry;
    const author = blog.authors[body.author];
    if (!author) throw new DomainError(`El artículo ${slug} cita un autor que no existe: ${body.author}`);
    const bySlug = new Map(blog.articles.map(({ article: a }) => [a.slug.value, a]));

    return {
      slug,
      title: article.title,
      path: article.href,
      excerpt: article.excerpt,
      category: article.category ?? 'Blog',
      chip: body.chip,
      lead: body.lead,
      author: {
        name: author.name,
        role: author.role,
        bio: author.bio,
        href: author.href,
        ...(author.linkedin && { linkedin: author.linkedin }),
      },
      published: body.published,
      updated: body.updated,
      updatedIso: body.updatedIso,
      // "[N] min de lectura · Actualizado [fecha]" → "[N] min de lectura"
      readingTime: article.readingTime?.split(' · ')[0] ?? '',
      image: body.image,
      quickAnswer: body.quickAnswer,
      sections: body.sections.map((section, i) => ({ ...section, number: i + 1 })),
      inlineCta: body.inlineCta,
      related: body.related
        .map((s) => bySlug.get(s))
        .filter((a) => a !== undefined && a.slug.value !== slug)
        .map((a) => ({ label: a!.title, href: a!.href })),
      sideCta: blog.sideCta,
    };
  }
}
