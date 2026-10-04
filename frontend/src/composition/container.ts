import type { HomeViewModel } from '../application/dto/HomeViewModel';
import { GetHomeContent } from '../application/use-cases/GetHomeContent';
import content from '../content/home/home.es.json';
import { RouteRegistry } from '../domain/routing/RouteRegistry';
import { StaticContentRepository } from '../infrastructure/content/StaticContentRepository';
import {
  faqPageJsonLd,
  localBusinessJsonLd,
  organizationJsonLd,
  webSiteJsonLd,
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
  const contentRepository = new StaticContentRepository(content);
  const interactive = createInteractiveUseCases(config);
  const routes = RouteRegistry.create(contentRepository.getRoutes());

  return {
    getHomeContent: new GetHomeContent(contentRepository),
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

    /** Organization + LocalBusiness + WebSite + FAQPage del home. */
    homeJsonLd(view: HomeViewModel): JsonLd[] {
      return [
        organizationJsonLd(view.business, SITE.url),
        localBusinessJsonLd(view.business, SITE.url),
        webSiteJsonLd(SITE.name, SITE.url),
        faqPageJsonLd(view.faq.items),
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
