import type { z } from 'zod';
import type { ContentRepository, HomeContent } from '../../application/ports/out/ContentRepository';
import type {
  BlogContent,
  MarketingHubContent,
  PageContentRepository,
  ServicePageContent,
  ShopContent,
} from '../../application/ports/out/PageContentRepository';
import type { RouteRepository } from '../../application/ports/out/RouteRepository';
import { Article } from '../../domain/entities/Article';
import { CaseStudy } from '../../domain/entities/CaseStudy';
import { Faq } from '../../domain/entities/Faq';
import { MarketingLine } from '../../domain/entities/MarketingLine';
import { ProcessStep } from '../../domain/entities/ProcessStep';
import { Product, ShopCategory } from '../../domain/entities/Product';
import { Service } from '../../domain/entities/Service';
import type { SiteRouteProps } from '../../domain/entities/SiteRoute';
import { Testimonial } from '../../domain/entities/Testimonial';
import { PhoneNumber } from '../../domain/value-objects/PhoneNumber';
import { ShippingPolicy } from '../../domain/value-objects/ShippingPolicy';
import { Slots } from '../../domain/value-objects/Slots';
import { pagesContentSchema, siteContentSchema, type PagesContent, type SiteContent } from './schemas';

export class ContentValidationError extends Error {
  constructor(
    readonly issues: string[],
    file = 'content/home/home.es.json',
  ) {
    super(`${file} no es válido:\n${issues.map((i) => `  - ${i}`).join('\n')}`);
    this.name = 'ContentValidationError';
  }
}

function parse<T extends z.ZodTypeAny>(schema: T, raw: unknown, file: string): z.infer<T> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ContentValidationError(
      parsed.error.issues.map((issue) => `${issue.path.join('.') || '(raíz)'}: ${issue.message}`),
      file,
    );
  }
  return parsed.data;
}

/** Title SEO de la ficha de producto (plan SEO): "[Producto] | Precio y Envío | Orion Core". */
export const productSeoTitle = (title: string) => `${title} | Precio y Envío | Orion Core`;

/**
 * Adapter + Repository: lee el contenido estático (JSON), lo valida con Zod
 * y lo convierte en entidades del dominio (Factory).
 * `pagesRaw` (content/pages/pages.es.json) es el contenido propio de cada plantilla de página.
 */
export class StaticContentRepository implements ContentRepository, RouteRepository, PageContentRepository {
  private readonly content: SiteContent;
  private readonly pages?: PagesContent;

  constructor(raw: unknown, pagesRaw?: unknown) {
    this.content = parse(siteContentSchema, raw, 'content/home/home.es.json');
    if (pagesRaw !== undefined) this.pages = parse(pagesContentSchema, pagesRaw, 'content/pages/pages.es.json');
  }

  private get pageContent(): PagesContent {
    if (!this.pages) throw new Error('StaticContentRepository: falta el contenido de las páginas (pages.es.json)');
    return this.pages;
  }

  getServicePage(slug: string): { service: Service; page: ServicePageContent } | undefined {
    const raw = this.content.services.find((s) => s.slug === slug && !s.href);
    const page = this.pageContent.services[slug];
    if (!raw || !page) return undefined;
    return { service: Service.create(raw), page: page as ServicePageContent };
  }

  getMarketingHub(): MarketingHubContent {
    const { marketingHub } = this.pageContent;
    return {
      ...marketingHub,
      lines: this.content.marketingLines.map((m) => ({ line: MarketingLine.create(m), hub: m.hub })),
    };
  }

  getShop(): ShopContent {
    const { shop } = this.pageContent;
    const { product: productTemplate, freeShippingFrom, ...page } = shop;
    return {
      page,
      shipping: ShippingPolicy.freeFrom(freeShippingFrom ?? undefined),
      productTemplate,
      categories: this.content.shop.categories.map((c) => ({
        category: ShopCategory.create(c),
        description: c.description,
        seoText: c.seoText,
      })),
      products: this.content.shop.products.map((p) => ({
        product: Product.create(productProps(p)),
        details: {
          sku: p.sku,
          ...(p.benefits && { benefits: p.benefits }),
          ...(p.variants && { variants: p.variants }),
          ...(p.specs && { specs: p.specs }),
          ...(p.questions && { questions: p.questions }),
          ...(p.bundle && { bundle: p.bundle }),
        },
      })),
    };
  }

  getBlog(): BlogContent {
    const { authors, blog } = this.pageContent;
    return {
      articles: this.content.articles.map((a) => ({
        article: Article.create(a),
        body: {
          chip: a.chip,
          lead: a.lead,
          author: a.author,
          published: a.published,
          updated: a.updated,
          updatedIso: a.updatedIso,
          image: a.image,
          quickAnswer: a.quickAnswer,
          sections: a.sections,
          inlineCta: a.inlineCta,
          related: a.related,
        },
      })),
      authors,
      sideCta: blog.sideCta,
    };
  }

  async getHome(): Promise<HomeContent> {
    const { home, business } = this.content;
    return {
      ...home,
      slots: Slots.of(home.slots),
      services: { ...home.services, items: this.services() },
      marketing: { ...home.marketing, items: this.marketingLines() },
      results: {
        ...home.results,
        cases: this.cases(),
        testimonials: home.results.testimonials.map((t) => Testimonial.create(t)),
      },
      process: { ...home.process, steps: home.process.steps.map((s) => ProcessStep.create(s)) },
      shop: { ...home.shop, products: this.products() },
      blog: { ...home.blog, articles: this.articles() },
      faq: { ...home.faq, items: home.faq.items.map((f) => Faq.create(f)) },
      business: {
        name: business.name,
        legalName: business.legalName,
        nit: business.nit,
        email: business.email,
        phoneLabel: business.phoneLabel,
        address: business.address,
        city: business.city,
        hours: business.hours,
        ...(business.whatsapp && { whatsapp: PhoneNumber.parse(business.whatsapp) }),
        ...(business.googleBusinessUrl && { googleBusinessUrl: business.googleBusinessUrl }),
      },
    };
  }

  getRoutes(): SiteRouteProps[] {
    const c = this.content;
    return [
      ...c.pages.map((p) => ({ ...p })),
      // Los servicios con href propio (Marketing 360° → hub) no tienen página en /servicios/
      ...c.services
        .filter((s) => !s.href)
        .map((s) => ({
          ...route(Service.create(s).href, s.title, s.status ?? 'draft', 'servicios', s.seoDescription ?? s.description),
          ...(s.seoTitle && { seoTitle: s.seoTitle }),
        })),
      ...c.marketingLines.map((m) => ({
        ...route(MarketingLine.create(m).href, m.title, m.status, 'marketing', m.seoDescription ?? m.description),
        ...(m.seoTitle && { seoTitle: m.seoTitle }),
      })),
      ...c.shop.categories.map((cat) =>
        route(ShopCategory.create(cat).href, cat.title, cat.status, 'tienda', cat.description, '/tienda/[categoria]/'),
      ),
      ...c.shop.products.map((p) => ({
        ...route(Product.create(productProps(p)).href, p.title, p.status, 'tienda', p.description, '/tienda/[producto]/'),
        seoTitle: productSeoTitle(p.title),
      })),
      ...c.cases.map((cs) => route(CaseStudy.create(cs).href, cs.client, cs.status, 'casos', cs.summary, '/casos/[cliente]/')),
      ...c.articles.map((a) => ({
        ...route(Article.create(a).href, a.title, a.status, 'blog', a.excerpt, '/blog/[articulo]/'),
        ...(a.seoTitle && { seoTitle: a.seoTitle }),
      })),
    ];
  }

  private services(): Service[] {
    return this.content.services.map((s) => Service.create(s));
  }

  private marketingLines(): MarketingLine[] {
    return this.content.marketingLines.map((m) => MarketingLine.create(m));
  }

  private products(): Product[] {
    return this.content.shop.products.map((p) => Product.create(productProps(p)));
  }

  private cases(): CaseStudy[] {
    return this.content.cases.map((c) => CaseStudy.create(c));
  }

  private articles(): Article[] {
    return this.content.articles.map((a) => Article.create(a));
  }
}

/** JSON usa null para "pendiente"; las entidades usan undefined. */
function productProps(p: SiteContent['shop']['products'][number]) {
  return {
    title: p.title,
    slug: p.slug,
    category: p.category,
    description: p.description,
    price: p.price ?? undefined,
    oldPrice: p.oldPrice ?? undefined,
    stock: p.stock ?? undefined,
    badge: p.badge,
    stockLabel: p.stockLabel,
    availability: p.availability,
    fastShipping: p.fastShipping,
    installation: p.installation,
    brand: p.brand,
    featured: p.featured,
  };
}

function route(
  path: string,
  title: string,
  status: SiteRouteProps['status'],
  section: SiteRouteProps['section'],
  description: string,
  pattern?: string,
): SiteRouteProps {
  return { path, title, status, section, description, ...(pattern && { pattern }) };
}
