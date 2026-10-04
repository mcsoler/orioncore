import type { AnalyticsTracker } from '../application/ports/out/AnalyticsTracker';
import type { LeadGateway } from '../application/ports/out/LeadGateway';
import { CalculateLoss } from '../application/use-cases/CalculateLoss';
import { GetHomeContent } from '../application/use-cases/GetHomeContent';
import { SubmitLead } from '../application/use-cases/SubmitLead';
import content from '../content/home.es.json';
import { RouteRegistry } from '../domain/routing/RouteRegistry';
import { LossCalculator } from '../domain/services/LossCalculator';
import { GtmAnalyticsTracker } from '../infrastructure/analytics/GtmAnalyticsTracker';
import { NoopAnalyticsTracker } from '../infrastructure/analytics/NoopAnalyticsTracker';
import { StaticContentRepository } from '../infrastructure/content/StaticContentRepository';
import { ConsoleLeadGateway } from '../infrastructure/leads/ConsoleLeadGateway';
import { OrionApiLeadGateway } from '../infrastructure/leads/OrionApiLeadGateway';
import { WhatsAppLinkBuilder } from '../infrastructure/whatsapp/WhatsAppLinkBuilder';

export interface ContainerConfig {
  /** PUBLIC_API_URL; vacío = mismo dominio. */
  apiUrl: string;
  /** Strategy del destino del lead. */
  leadDestination: 'api' | 'console';
  fetch: typeof fetch;
  gtmId?: string;
  dataLayer?: unknown[];
}

/**
 * Composition root: el único lugar que conoce las clases concretas.
 * Los casos de uso reciben sus puertos por constructor (inyección de dependencias).
 */
export function createContainer(config: ContainerConfig) {
  const contentRepository = new StaticContentRepository(content);

  const leadGateway: LeadGateway =
    config.leadDestination === 'console'
      ? new ConsoleLeadGateway()
      : new OrionApiLeadGateway({ baseUrl: config.apiUrl, fetch: config.fetch });

  const analytics: AnalyticsTracker =
    config.gtmId && config.dataLayer ? new GtmAnalyticsTracker(config.dataLayer) : new NoopAnalyticsTracker();

  return {
    getHomeContent: new GetHomeContent(contentRepository),
    calculateLoss: new CalculateLoss(new LossCalculator()),
    submitLead: new SubmitLead(leadGateway, analytics),
    routes: RouteRegistry.create(contentRepository.getRoutes()),
    /** Enlace de WhatsApp, o undefined mientras no haya número confirmado. */
    whatsappLink: (digits: string | undefined, text: string) =>
      digits ? new WhatsAppLinkBuilder().toDigits(digits).withText(text).build() : undefined,
    adapters: { leadGateway, analytics },
  };
}

export type Container = ReturnType<typeof createContainer>;

/** Contenedor configurado con las variables PUBLIC_* del build. */
export function containerFromEnv(): Container {
  const dataLayer =
    typeof window === 'undefined'
      ? undefined
      : ((window as unknown as { dataLayer?: unknown[] }).dataLayer ??= []);
  return createContainer({
    apiUrl: import.meta.env.PUBLIC_API_URL ?? '',
    leadDestination: import.meta.env.PUBLIC_LEAD_DESTINATION === 'console' ? 'console' : 'api',
    fetch: (...args) => globalThis.fetch(...args),
    gtmId: import.meta.env.PUBLIC_GTM_ID || undefined,
    dataLayer,
  });
}
