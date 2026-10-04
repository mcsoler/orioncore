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
import { siteContentSchema, type SiteContent } from './schemas';

export class ContentValidationError extends Error {
  constructor(readonly issues: string[]) {
    super(`content/home.es.json no es válido:\n${issues.map((i) => `  - ${i}`).join('\n')}`);
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
      announcement: home.announcement,
      hero: home.hero,
      clients: home.clients,
      pains: home.pains,
      services: { ...home.services, items: this.services() },
      marketing: { ...home.marketing, items: this.marketingLines() },
      calculator: home.calculator,
      results: {
        title: home.results.title,
        cases: this.cases(),
        stats: home.results.stats,
        certifications: home.results.certifications,
        testimonials: home.results.testimonials.map((t) => Testimonial.create(t)),
      },
      process: {
        title: home.process.title,
        guarantee: home.process.guarantee,
        steps: home.process.steps.map((s) => ProcessStep.create(s)),
      },
      shop: { ...home.shop, products: this.products() },
      blog: { ...home.blog, articles: this.articles() },
      faq: { title: home.faq.title, items: home.faq.items.map((f) => Faq.create(f)) },
      contact: home.contact,
      business: {
        name: business.name,
        legalName: business.legalName,
        email: business.email,
        phoneLabel: business.phoneLabel,
        address: business.address,
        city: business.city,
        ...(business.whatsapp && { whatsapp: PhoneNumber.parse(business.whatsapp) }),
        ...(business.googleBusinessUrl && { googleBusinessUrl: business.googleBusinessUrl }),
      },
    };
  }

  getRoutes(): SiteRouteProps[] {
    const c = this.content;
    return [
      ...c.pages,
      // Los servicios con href propio (Marketing 360° → hub) no tienen página en /servicios/
      ...c.services
        .filter((s) => !s.href)
        .map((s) => route(Service.create(s).href, s.title, s.status ?? 'draft', 'servicios')),
      ...c.marketingLines.map((m) => route(MarketingLine.create(m).href, m.title, m.status, 'marketing')),
      ...c.shop.categories.map((cat) =>
        route(ShopCategory.create(cat).href, cat.title, cat.status, 'tienda', '/tienda/[categoria]/'),
      ),
      ...c.shop.products.map((p) =>
        route(Product.create({ ...p, price: p.price ?? undefined }).href, p.title, p.status, 'tienda', '/tienda/[producto]/'),
      ),
      ...c.cases.map((cs) => route(CaseStudy.create(cs).href, cs.client, cs.status, 'casos', '/casos/[cliente]/')),
      ...c.articles.map((a) => route(Article.create(a).href, a.title, a.status, 'blog', '/blog/[articulo]/')),
    ];
  }

  private services(): Service[] {
    return this.content.services.map((s) => Service.create(s));
  }

  private marketingLines(): MarketingLine[] {
    return this.content.marketingLines.map((m) => MarketingLine.create(m));
  }

  private products(): Product[] {
    return this.content.shop.products.map((p) => Product.create({ ...p, price: p.price ?? undefined }));
  }

  private cases(): CaseStudy[] {
    return this.content.cases.map((c) => CaseStudy.create(c));
  }

  private articles(): Article[] {
    return this.content.articles.map((a) => Article.create(a));
  }
}

function route(
  path: string,
  title: string,
  status: SiteRouteProps['status'],
  section: SiteRouteProps['section'],
  pattern?: string,
): SiteRouteProps {
  return { path, title, status, section, ...(pattern && { pattern }) };
}
