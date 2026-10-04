import type { AnalyticsTracker } from '../application/ports/out/AnalyticsTracker';
import type { LeadGateway } from '../application/ports/out/LeadGateway';
import { CalculateLoss } from '../application/use-cases/CalculateLoss';
import { SubmitLead } from '../application/use-cases/SubmitLead';
import { LossCalculator } from '../domain/services/LossCalculator';
import { GtmAnalyticsTracker } from '../infrastructure/analytics/GtmAnalyticsTracker';
import { NoopAnalyticsTracker } from '../infrastructure/analytics/NoopAnalyticsTracker';
import { ConsoleLeadGateway } from '../infrastructure/leads/ConsoleLeadGateway';
import { OrionApiLeadGateway } from '../infrastructure/leads/OrionApiLeadGateway';

export interface InteractiveConfig {
  /** PUBLIC_API_URL; vacío = mismo dominio. */
  apiUrl: string;
  /** Strategy del destino del lead. */
  leadDestination: 'api' | 'console';
  fetch: typeof fetch;
  gtmId?: string;
  dataLayer?: unknown[];
}

/**
 * Parte del composition root que necesitan las islas en el navegador
 * (calculadora y formulario), sin el contenido ni las rutas del sitio.
 */
export function createInteractiveUseCases(config: InteractiveConfig) {
  const leadGateway: LeadGateway =
    config.leadDestination === 'console'
      ? new ConsoleLeadGateway()
      : new OrionApiLeadGateway({ baseUrl: config.apiUrl, fetch: config.fetch });

  const analytics: AnalyticsTracker =
    config.gtmId && config.dataLayer ? new GtmAnalyticsTracker(config.dataLayer) : new NoopAnalyticsTracker();

  return {
    calculateLoss: new CalculateLoss(new LossCalculator()),
    submitLead: new SubmitLead(leadGateway, analytics),
    adapters: { leadGateway, analytics },
  };
}

/** Configuración desde las variables PUBLIC_* del build. */
export function interactiveConfigFromEnv(): InteractiveConfig {
  const dataLayer =
    typeof window === 'undefined'
      ? undefined
      : ((window as unknown as { dataLayer?: unknown[] }).dataLayer ??= []);
  return {
    apiUrl: import.meta.env.PUBLIC_API_URL ?? '',
    leadDestination: import.meta.env.PUBLIC_LEAD_DESTINATION === 'console' ? 'console' : 'api',
    fetch: (...args) => globalThis.fetch(...args),
    gtmId: import.meta.env.PUBLIC_GTM_ID || undefined,
    dataLayer,
  };
}

let fromEnv: ReturnType<typeof createInteractiveUseCases> | undefined;

/** Casos de uso de las islas, creados una sola vez por página. */
export function interactiveUseCases() {
  fromEnv ??= createInteractiveUseCases(interactiveConfigFromEnv());
  return fromEnv;
}
