import { describe, expect, it, vi } from 'vitest';
import { createContainer, type ContainerConfig } from '../../../src/composition/container';
import { OrionApiLeadGateway } from '../../../src/infrastructure/leads/OrionApiLeadGateway';
import { ConsoleLeadGateway } from '../../../src/infrastructure/leads/ConsoleLeadGateway';
import { GtmAnalyticsTracker } from '../../../src/infrastructure/analytics/GtmAnalyticsTracker';
import { NoopAnalyticsTracker } from '../../../src/infrastructure/analytics/NoopAnalyticsTracker';

const baseConfig: ContainerConfig = {
  apiUrl: '',
  leadDestination: 'api',
  fetch: vi.fn(async () => new Response('{}')),
};

describe('createContainer (composition root)', () => {
  it('envía los leads al backend por defecto', () => {
    expect(createContainer(baseConfig).adapters.leadGateway).toBeInstanceOf(OrionApiLeadGateway);
  });

  it('usa la consola como destino de leads cuando se configura (desarrollo)', () => {
    const container = createContainer({ ...baseConfig, leadDestination: 'console' });
    expect(container.adapters.leadGateway).toBeInstanceOf(ConsoleLeadGateway);
  });

  it('usa GTM solo si hay ID y dataLayer; si no, el Null Object', () => {
    expect(createContainer(baseConfig).adapters.analytics).toBeInstanceOf(NoopAnalyticsTracker);
    const withGtm = createContainer({ ...baseConfig, gtmId: 'GTM-XXXX', dataLayer: [] });
    expect(withGtm.adapters.analytics).toBeInstanceOf(GtmAnalyticsTracker);
  });

  it('expone los casos de uso ya conectados', async () => {
    const container = createContainer(baseConfig);
    const home = await container.getHomeContent.execute();
    expect(home.hero.title).toMatch(/empresas en Colombia/);
    expect(container.calculateLoss.execute({ hoursPerWeek: 10, costPerHour: 25_000 })).toMatchObject({ ok: true });
  });

  it('el envío de un lead llega al fetch configurado', async () => {
    const fetchFn = vi.fn(async () => new Response('{}'));
    const container = createContainer({ ...baseConfig, fetch: fetchFn });
    const result = await container.submitLead.execute({
      name: 'Ana',
      whatsapp: '3001234567',
      email: 'ana@empresa.com',
      services: ['software-a-medida'],
      consent: true,
    });
    expect(result).toEqual({ ok: true });
    expect(fetchFn).toHaveBeenCalledOnce();
  });

  it('expone el RouteRegistry construido desde el contenido', () => {
    const { routes } = createContainer(baseConfig);
    expect(routes.has('/')).toBe(true);
    expect(routes.patterns()).toHaveLength(24);
  });

  it('seoFor() arma los metadatos de una ruta desde el RouteRegistry', () => {
    const { seoFor } = createContainer(baseConfig);
    const home = seoFor('/');
    expect(home.title).toBe('Automatización, IA y Marketing para Empresas | Orion Core');
    expect(home.robots).toBe('index, follow');
    expect(home.canonical).toBe('https://orioncore.co/');

    const draft = seoFor('/servicios/software-a-medida/');
    expect(draft.title).toBe('Software Empresarial a Medida | Orion Core');
    expect(draft.robots).toBe('noindex, follow');
  });

  it('seoFor() del home incluye Organization, LocalBusiness, WebSite y FAQPage', async () => {
    const container = createContainer(baseConfig);
    const view = await container.getHomeContent.execute();
    const types = container.seoFor('/', container.homeJsonLd(view)).jsonLd.map((j) => j['@type']);
    expect(types).toEqual(['Organization', 'ProfessionalService', 'WebSite', 'FAQPage']);
  });

  it('notFoundSeo() no se indexa', () => {
    const meta = createContainer(baseConfig).notFoundSeo();
    expect(meta.robots).toBe('noindex, follow');
    expect(meta.title).toBe('Página no encontrada | Orion Core');
  });

  it('construye el enlace de WhatsApp solo si hay número confirmado', () => {
    const { whatsappLink } = createContainer(baseConfig);
    expect(whatsappLink(undefined, 'Hola')).toBeUndefined();
    expect(whatsappLink('573001234567', 'Hola')).toBe('https://wa.me/573001234567?text=Hola');
  });
});
