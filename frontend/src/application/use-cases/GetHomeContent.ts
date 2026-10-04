import type { HomeViewModel, LinkCardView, ServiceView } from '../dto/HomeViewModel';
import type { GetHomeContentUseCase } from '../ports/in/GetHomeContentUseCase';
import type { ContentRepository, HomeContent } from '../ports/out/ContentRepository';
import type { MarketingLine } from '../../domain/entities/MarketingLine';
import type { Service } from '../../domain/entities/Service';

export const PRICE_PENDING = 'Precio por confirmar';

export class MissingSectionError extends Error {
  constructor(readonly section: string) {
    super(`Falta la sección "${section}" en el contenido del home`);
    this.name = 'MissingSectionError';
  }
}

const SECTIONS: ReadonlyArray<keyof HomeContent> = [
  'announcement', 'hero', 'clients', 'pains', 'services', 'marketing', 'calculator',
  'results', 'process', 'shop', 'blog', 'faq', 'contact', 'business',
];

/** Listas que no pueden llegar vacías al home. */
const REQUIRED_LISTS: ReadonlyArray<[string, (c: HomeContent) => readonly unknown[]]> = [
  ['pains', (c) => c.pains.items],
  ['services', (c) => c.services.items],
  ['marketing', (c) => c.marketing.items],
  ['results.cases', (c) => c.results.cases],
  ['process', (c) => c.process.steps],
  ['shop', (c) => c.shop.products],
  ['blog', (c) => c.blog.articles],
  ['faq', (c) => c.faq.items],
];

export class GetHomeContent implements GetHomeContentUseCase {
  constructor(private readonly content: ContentRepository) {}

  async execute(): Promise<HomeViewModel> {
    const home = await this.content.getHome();
    assertComplete(home);

    return {
      announcement: home.announcement,
      hero: home.hero,
      clients: home.clients,
      pains: home.pains,
      services: { ...home.services, items: home.services.items.map(toServiceView) },
      marketing: { ...home.marketing, items: home.marketing.items.map(toServiceView) },
      calculator: home.calculator,
      results: {
        title: home.results.title,
        cases: home.results.cases.map((c) => ({ title: c.client, description: c.summary, result: c.result, href: c.href })),
        stats: home.results.stats,
        certifications: home.results.certifications,
        testimonials: home.results.testimonials.map((t) => ({ quote: t.quote, author: t.author, company: t.company })),
      },
      process: {
        title: home.process.title,
        guarantee: home.process.guarantee,
        steps: [...home.process.steps]
          .sort((a, b) => a.order - b.order)
          .map((s) => ({ order: s.order, title: s.title, description: s.description })),
      },
      shop: {
        title: home.shop.title,
        cta: home.shop.cta,
        products: home.shop.products.map((p) => ({
          title: p.title,
          description: p.description,
          href: p.href,
          price: p.price?.format() ?? PRICE_PENDING,
        })),
      },
      blog: {
        title: home.blog.title,
        cta: home.blog.cta,
        articles: home.blog.articles.map((a): LinkCardView => ({ title: a.title, description: a.excerpt, href: a.href })),
      },
      faq: { title: home.faq.title, items: home.faq.items.map((f) => ({ question: f.question, answer: f.answer })) },
      contact: home.contact,
      business: { ...home.business, whatsapp: home.business.whatsapp?.digits },
    };
  }
}

function assertComplete(home: HomeContent): void {
  for (const section of SECTIONS) {
    if (!home[section]) throw new MissingSectionError(section);
  }
  for (const [section, list] of REQUIRED_LISTS) {
    if (list(home).length === 0) throw new MissingSectionError(section);
  }
}

function toServiceView(item: Service | MarketingLine): ServiceView {
  return {
    title: item.title,
    description: item.description,
    items: item.items,
    href: item.href,
    ...('badge' in item && item.badge && { badge: item.badge }),
    ...('headline' in item && item.headline && { headline: item.headline }),
    ...('cta' in item && item.cta && { cta: item.cta }),
  };
}
