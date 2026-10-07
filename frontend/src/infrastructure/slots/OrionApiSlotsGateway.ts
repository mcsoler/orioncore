import { SlotsUnavailableError, type SlotsGateway } from '../../application/ports/out/SlotsGateway';
import { InvalidValueError } from '../../domain/errors/DomainError';
import { Slots } from '../../domain/value-objects/Slots';

export interface OrionApiSlotsGatewayOptions {
  /** PUBLIC_API_URL. Vacío = mismo dominio (Nginx enruta /api al backend). */
  baseUrl: string;
  fetch: typeof fetch;
  timeoutMs?: number;
}

/** Adapter hacia el backend: GET /api/slots → { remaining, taken, total }. */
export class OrionApiSlotsGateway implements SlotsGateway {
  private readonly endpoint: string;

  constructor(private readonly options: OrionApiSlotsGatewayOptions) {
    this.endpoint = `${options.baseUrl.replace(/\/+$/, '')}/api/slots`;
  }

  async current(): Promise<Slots> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.options.timeoutMs ?? 5_000);
    try {
      const response = await this.options.fetch(this.endpoint, { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new SlotsUnavailableError(`El backend respondió ${response.status}`);
      const body = (await response.json()) as { remaining?: unknown; total?: unknown };
      return Slots.of({ remaining: body.remaining as number, total: body.total as number });
    } catch (error) {
      if (error instanceof SlotsUnavailableError) throw error;
      if (error instanceof InvalidValueError) throw new SlotsUnavailableError(`Cupos inválidos: ${error.message}`);
      throw new SlotsUnavailableError(`No se pudieron consultar los cupos: ${(error as Error).message}`);
    } finally {
      clearTimeout(timer);
    }
  }
}
