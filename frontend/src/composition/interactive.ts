import type { AnalyticsTracker } from '../application/ports/out/AnalyticsTracker';
import type { LeadGateway } from '../application/ports/out/LeadGateway';
import { AddToCart, GetCartCount } from '../application/use-cases/AddToCart';
import { CalculateLoss } from '../application/use-cases/CalculateLoss';
import { SubmitLead } from '../application/use-cases/SubmitLead';
import { LossCalculator } from '../domain/services/LossCalculator';
import { LocalStorageCartRepository } from '../infrastructure/cart/LocalStorageCartRepository';
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
  /** localStorage del navegador; sin él, el carrito vive solo en la página. */
  storage?: Storage;
}

/**
 * Parte del composition root que necesitan las islas en el navegador
 * (calculadora, formulario y carrito), sin el contenido ni las rutas del sitio.
 */
export function createInteractiveUseCases(config: InteractiveConfig) {
  const leadGateway: LeadGateway =
    config.leadDestination === 'console'
      ? new ConsoleLeadGateway()
      : new OrionApiLeadGateway({ baseUrl: config.apiUrl, fetch: config.fetch });

  const analytics: AnalyticsTracker =
    config.gtmId && config.dataLayer ? new GtmAnalyticsTracker(config.dataLayer) : new NoopAnalyticsTracker();

  const cart = new LocalStorageCartRepository(config.storage);

  return {
    calculateLoss: new CalculateLoss(new LossCalculator()),
    submitLead: new SubmitLead(leadGateway, analytics),
    addToCart: new AddToCart(cart),
    cartCount: new GetCartCount(cart),
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
    storage: safeLocalStorage(),
  };
}

let fromEnv: ReturnType<typeof createInteractiveUseCases> | undefined;

/** Casos de uso de las islas, creados una sola vez por página. */
export function interactiveUseCases() {
  fromEnv ??= createInteractiveUseCases(interactiveConfigFromEnv());
  return fromEnv;
}

/** En modo privado o con cookies bloqueadas, acceder a localStorage puede lanzar un error. */
function safeLocalStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}
