import type { HomeViewModel } from '../application/dto/HomeViewModel';
import type { ArticlePageView, MarketingHubView, ProductPageView, ServicePageView, ShopPageView } from '../application/dto/PageViews';
import { GetArticlePage } from '../application/use-cases/GetArticlePage';
import { GetHomeContent } from '../application/use-cases/GetHomeContent';
import { GetMarketingHub } from '../application/use-cases/GetMarketingHub';
import { GetProductPage } from '../application/use-cases/GetProductPage';
import { GetServicePage } from '../application/use-cases/GetServicePage';
import { GetShopPage, GetStore } from '../application/use-cases/GetShopPage';
import content from '../content/home/home.es.json';
import pages from '../content/pages/pages.es.json';
import { RouteRegistry } from '../domain/routing/RouteRegistry';
import { StaticContentRepository } from '../infrastructure/content/StaticContentRepository';
import {
  articleJsonLd,
  collectionPageJsonLd,
  confirmedFaqs,
  faqPageJsonLd,
  localBusinessJsonLd,
  organizationJsonLd,
  productJsonLd,
  serviceJsonLd,
  webSiteJsonLd,
  type BusinessSeo,
} from '../infrastructure/seo/jsonLd';
import { SeoMetaBuilder, type JsonLd, type SeoMeta, type SiteSeo } from '../infrastructure/seo/SeoMetaBuilder';
import { WhatsAppLinkBuilder } from '../infrastructure/whatsapp/WhatsAppLinkBuilder';
import { createInteractiveUseCases, interactiveConfigFromEnv, type InteractiveConfig } from './interactive';

export type { JsonLd, SeoMeta };
export type ContainerConfig = InteractiveConfig;

export const SITE: SiteSeo = {
  url: 'https://orioncore.co',
  name: 'Orion Core Tecnologías',
  locale: 'es_CO',
  image: '/og-image.png',
};
const TITLE_SUFFIX = ' | Orion Core';

/**
 * Composition root: el único lugar que conoce las clases concretas.
 * Los casos de uso reciben sus puertos por constructor (inyección de dependencias).
 */
export function createContainer(config: ContainerConfig) {
  const contentRepository = new StaticContentRepository(content, pages);
  const interactive = createInteractiveUseCases(config);
  const routes = RouteRegistry.create(contentRepository.getRoutes());
  const getHomeContent = new GetHomeContent(contentRepository);
  const business = async (): Promise<BusinessSeo> => (await getHomeContent.execute()).business;
  /** FAQPage solo con las preguntas que ya tienen respuesta real. */
  const faqJsonLd = (items: { question: string; answer: string }[]) => {
    const answered = confirmedFaqs(items);
    return answered.length > 0 ? [faqPageJsonLd(answered)] : [];
  };

  return {
    getHomeContent,
    getServicePage: new GetServicePage(contentRepository),
    getMarketingHub: new GetMarketingHub(contentRepository),
    getShopPage: new GetShopPage(contentRepository),
    getStore: new GetStore(contentRepository),
    getProductPage: new GetProductPage(contentRepository),
    getArticlePage: new GetArticlePage(contentRepository),
    calculateLoss: interactive.calculateLoss,
    submitLead: interactive.submitLead,
    routes,
    site: SITE,
    /** Enlace de WhatsApp, o undefined mientras no haya número confirmado. */
    whatsappLink: (digits: string | undefined, text: string) =>
      digits ? new WhatsAppLinkBuilder().toDigits(digits).withText(text).build() : undefined,

    /** Metadatos SEO de una ruta del RouteRegistry (robots según draft/published). */
    seoFor(path: string, jsonLd: JsonLd[] = []): SeoMeta {
      const route = routes.get(path);
      const builder = new SeoMetaBuilder(SITE)
        .forPath(path)
        .withTitle(route.seoTitle ?? `${route.title}${TITLE_SUFFIX}`)
        .withDescription(route.description ?? route.title)
        .withRobots(routes.robotsFor(path));
      jsonLd.forEach((block) => builder.withJsonLd(block));
      return builder.build();
    },

    notFoundSeo(): SeoMeta {
      return new SeoMetaBuilder(SITE)
        .forPath('/404/')
        .withTitle(`Página no encontrada${TITLE_SUFFIX}`)
        .withDescription('La página que buscas no existe. Vuelve al inicio de Orion Core Tecnologías.')
        .withRobots('noindex, follow')
        .build();
    },

    /**
     * Organization + LocalBusiness + WebSite del home, y FAQPage solo si el FAQ se muestra
     * (los datos estructurados deben coincidir con el contenido visible).
     */
    homeJsonLd(view: HomeViewModel, { withFaq = false }: { withFaq?: boolean } = {}): JsonLd[] {
      return [
        organizationJsonLd(view.business, SITE.url),
        localBusinessJsonLd(view.business, SITE.url),
        webSiteJsonLd(SITE.name, SITE.url),
        ...(withFaq ? [faqPageJsonLd(view.faq.items)] : []),
      ];
    },

    /** Service + FAQPage (preguntas respondidas) de /servicios/{slug}/. */
    async serviceJsonLd(view: ServicePageView): Promise<JsonLd[]> {
      const route = routes.get(view.path);
      return [
        serviceJsonLd({ name: view.name, description: route.description ?? view.description, path: view.path }, await business(), SITE.url),
        ...faqJsonLd(view.faq.items),
      ];
    },

    /** Service con el catálogo de las líneas (OfferCatalog) + FAQPage del hub. */
    async marketingHubJsonLd(view: MarketingHubView, path = '/marketing-digital/'): Promise<JsonLd[]> {
      const route = routes.get(path);
      const catalog = view.rows.filter((row) => routes.has(row.href)).map((row) => ({ name: row.title, path: row.href }));
      return [
        serviceJsonLd({ name: view.hero.title, description: route.description ?? route.title, path, catalog }, await business(), SITE.url),
        ...faqJsonLd(view.faq.items),
      ];
    },

    shopJsonLd(view: ShopPageView, path: string): JsonLd[] {
      const route = routes.get(path);
      const items = view.items.map((item) => ({ name: item.title, path: item.href }));
      return [collectionPageJsonLd({ name: view.title, description: route.description ?? view.intro, path, items }, SITE.url)];
    },

    productJsonLd(view: ProductPageView): JsonLd[] {
      const block = productJsonLd(
        { name: view.title, description: view.description, path: view.path, sku: view.sku, brand: view.brand, price: view.priceValue, inStock: view.inStock },
        SITE.url,
      );
      return block ? [block] : [];
    },

    async articleJsonLd(view: ArticlePageView): Promise<JsonLd[]> {
      return [
        articleJsonLd(
          { title: view.title, description: view.excerpt, path: view.path, author: view.author, updatedIso: view.updatedIso },
          await business(),
          SITE.url,
        ),
      ];
    },
    adapters: interactive.adapters,
  };
}

export type Container = ReturnType<typeof createContainer>;

let fromEnv: Container | undefined;

/** Contenedor del build (páginas .astro), configurado con las variables PUBLIC_*. */
export function container(): Container {
  fromEnv ??= createContainer(interactiveConfigFromEnv());
  return fromEnv;
}
