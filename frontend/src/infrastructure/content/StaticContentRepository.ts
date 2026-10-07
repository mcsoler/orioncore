import type { ContentRepository, HomeContent } from '../../application/ports/out/ContentRepository';
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
import { Slots } from '../../domain/value-objects/Slots';
import { siteContentSchema, type SiteContent } from './schemas';

export class ContentValidationError extends Error {
  constructor(readonly issues: string[]) {
    super(`content/home/home.es.json no es válido:\n${issues.map((i) => `  - ${i}`).join('\n')}`);
    this.name = 'ContentValidationError';
  }
}

/**
 * Adapter + Repository: lee el contenido estático (JSON), lo valida con Zod
 * y lo convierte en entidades del dominio (Factory).
 */
export class StaticContentRepository implements ContentRepository, RouteRepository {
  private readonly content: SiteContent;

  constructor(raw: unknown) {
    const parsed = siteContentSchema.safeParse(raw);
    if (!parsed.success) {
      throw new ContentValidationError(
        parsed.error.issues.map((issue) => `${issue.path.join('.') || '(raíz)'}: ${issue.message}`),
      );
    }
    this.content = parsed.data;
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
        .map((s) => route(Service.create(s).href, s.title, s.status ?? 'draft', 'servicios', s.seoDescription ?? s.description)),
      ...c.marketingLines.map((m) => route(MarketingLine.create(m).href, m.title, m.status, 'marketing', m.description)),
      ...c.shop.categories.map((cat) =>
        route(ShopCategory.create(cat).href, cat.title, cat.status, 'tienda', `Productos de la categoría ${cat.title}.`, '/tienda/[categoria]/'),
      ),
      ...c.shop.products.map((p) =>
        route(Product.create(productProps(p)).href, p.title, p.status, 'tienda', p.description, '/tienda/[producto]/'),
      ),
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
    ...p,
    price: p.price ?? undefined,
    oldPrice: p.oldPrice ?? undefined,
    stock: p.stock ?? undefined,
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
