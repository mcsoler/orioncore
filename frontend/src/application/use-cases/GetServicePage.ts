import type { ServicePageView } from '../dto/PageViews';
import type { PageContentRepository } from '../ports/out/PageContentRepository';
import { RouteNotFoundError } from '../../domain/errors/DomainError';

const number = (n: number) => String(n).padStart(2, '0');

/** Plantilla de servicio (/servicios/{slug}/): hero, qué es, cómo funciona, precios, FAQ y formulario. */
export class GetServicePage {
  constructor(private readonly content: PageContentRepository) {}

  execute(slug: string): ServicePageView {
    const found = this.content.getServicePage(slug);
    if (!found) throw new RouteNotFoundError(`/servicios/${slug}/`);
    const { service, page } = found;

    return {
      slug,
      name: service.title,
      path: service.href,
      description: service.description,
      ...(service.badge && { badge: service.badge }),
      hero: page.hero,
      whatIs: page.whatIs,
      howItWorks: {
        title: page.howItWorks.title,
        steps: page.howItWorks.steps.map((step, i) => ({ number: number(i + 1), ...step })),
      },
      features: page.features,
      comparison: page.comparison,
      pricing: page.pricing,
      // El caso completo vive en /casos/ hasta tener casos reales publicados
      case: { ...page.case, href: '/casos/' },
      faq: page.faq,
      related: page.related,
      contact: page.contact,
    };
  }
}
