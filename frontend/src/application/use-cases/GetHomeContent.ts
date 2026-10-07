import type { HomeViewModel, MarketingCardView, ServiceView } from '../dto/HomeViewModel';
import type { GetHomeContentUseCase } from '../ports/in/GetHomeContentUseCase';
import type { ContentRepository, HomeContent } from '../ports/out/ContentRepository';
import type { Service } from '../../domain/entities/Service';

/** Precio aún no definido: se marca, no se inventa. */
export const PRICE_PENDING = '[PRECIO]';

export class MissingSectionError extends Error {
  constructor(readonly section: string) {
    super(`Falta la sección "${section}" en el contenido del home`);
    this.name = 'MissingSectionError';
  }
}

const SECTIONS: ReadonlyArray<keyof HomeContent> = [
  'slots', 'announcement', 'hero', 'clients', 'pains', 'services', 'marketing', 'calculator',
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

const number = (n: number) => String(n).padStart(2, '0');

export class GetHomeContent implements GetHomeContentUseCase {
  constructor(private readonly content: ContentRepository) {}

  async execute(): Promise<HomeViewModel> {
    const home = await this.content.getHome();
    assertComplete(home);
    const { marketing, results, process, shop, blog, faq } = home;

    return {
      slots: { remaining: home.slots.remaining, taken: home.slots.taken, total: home.slots.total, progress: home.slots.progress },
      announcement: home.announcement,
      hero: home.hero,
      clients: home.clients,
      pains: home.pains,
      services: { eyebrow: home.services.eyebrow, title: home.services.title, items: home.services.items.map(toServiceView) },
      marketing: {
        eyebrow: marketing.eyebrow,
        title: marketing.title,
        subtitle: marketing.subtitle,
        hub: marketing.hub,
        cards: [
          { ...marketing.hubCard, href: marketing.hub.href },
          ...marketing.items.map((line) => ({ title: line.title, hook: line.hook ?? line.description, items: line.items, href: line.href })),
        ].map((card, i): MarketingCardView => ({ number: number(i + 1), ...card })),
      },
      calculator: home.calculator,
      results: {
        eyebrow: results.eyebrow,
        title: results.title,
        cases: results.cases.map((c) => ({
          title: c.client,
          description: c.summary,
          result: c.result,
          href: c.href,
          tag: c.tag,
          quote: c.quote,
          quoteAuthor: c.quoteAuthor,
        })),
        stats: results.stats,
        certifications: results.certifications,
        testimonials: results.testimonials.map((t) => ({ quote: t.quote, author: t.author, company: t.company })),
      },
      process: {
        eyebrow: process.eyebrow,
        title: process.title,
        guarantee: process.guarantee,
        steps: [...process.steps]
          .sort((a, b) => a.order - b.order)
          .map((s) => ({ order: s.order, number: number(s.order), title: s.title, description: s.description })),
      },
      shop: {
        eyebrow: shop.eyebrow,
        title: shop.title,
        subtitle: shop.subtitle,
        cta: shop.cta,
        products: shop.products.map((p) => ({
          slug: p.slug.value,
          title: p.title,
          description: p.description,
          href: p.href,
          price: p.price?.format() ?? PRICE_PENDING,
          oldPrice: p.oldPrice?.format(),
          badge: p.badge,
          stock: p.stock === undefined ? undefined : `Solo quedan ${p.stock}`,
        })),
      },
      blog: {
        eyebrow: blog.eyebrow,
        title: blog.title,
        subtitle: blog.subtitle,
        cta: blog.cta,
        articles: blog.articles.map((a) => ({
          title: a.title,
          description: a.excerpt,
          href: a.href,
          category: a.category,
          readingTime: a.readingTime,
        })),
      },
      faq: { eyebrow: faq.eyebrow, title: faq.title, items: faq.items.map((f) => ({ question: f.question, answer: f.answer })) },
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

function toServiceView(service: Service, index: number): ServiceView {
  return {
    number: number(index + 1),
    title: service.title,
    description: service.description,
    items: service.items,
    href: service.href,
    ctaHref: service.ctaHref,
    ...(service.badge && { badge: service.badge }),
    ...(service.headline && { headline: service.headline }),
    ...(service.cta && { cta: service.cta }),
    ...(service.linkLabel && { linkLabel: service.linkLabel }),
  };
}
