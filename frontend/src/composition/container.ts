import { GetHomeContent } from '../application/use-cases/GetHomeContent';
import content from '../content/home.es.json';
import { RouteRegistry } from '../domain/routing/RouteRegistry';
import { StaticContentRepository } from '../infrastructure/content/StaticContentRepository';
import { WhatsAppLinkBuilder } from '../infrastructure/whatsapp/WhatsAppLinkBuilder';
import { createInteractiveUseCases, interactiveConfigFromEnv, type InteractiveConfig } from './interactive';

export type ContainerConfig = InteractiveConfig;

/**
 * Composition root: el único lugar que conoce las clases concretas.
 * Los casos de uso reciben sus puertos por constructor (inyección de dependencias).
 */
export function createContainer(config: ContainerConfig) {
  const contentRepository = new StaticContentRepository(content);
  const interactive = createInteractiveUseCases(config);

  return {
    getHomeContent: new GetHomeContent(contentRepository),
    calculateLoss: interactive.calculateLoss,
    submitLead: interactive.submitLead,
    routes: RouteRegistry.create(contentRepository.getRoutes()),
    /** Enlace de WhatsApp, o undefined mientras no haya número confirmado. */
    whatsappLink: (digits: string | undefined, text: string) =>
      digits ? new WhatsAppLinkBuilder().toDigits(digits).withText(text).build() : undefined,
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
