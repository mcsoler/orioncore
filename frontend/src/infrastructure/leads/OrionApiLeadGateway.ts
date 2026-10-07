import { LeadGatewayError, type LeadGateway, type ValidLead } from '../../application/ports/out/LeadGateway';

export interface OrionApiLeadGatewayOptions {
  /** PUBLIC_API_URL. Vacío = mismo dominio (Nginx enruta /api al backend). */
  baseUrl: string;
  fetch: typeof fetch;
  timeoutMs?: number;
}

/**
 * Adapter hacia el backend FastAPI (POST /api/contact).
 *
 * Contrato actual de backend/app/models.py → ContactCreate: solo name, phone y email.
 * company, services, message y consent existen en ValidLead pero NO se envían
 * hasta que el backend los acepte (ver PR).
 */
export class OrionApiLeadGateway implements LeadGateway {
  private readonly endpoint: string;
  private readonly timeoutMs: number;

  constructor(private readonly options: OrionApiLeadGatewayOptions) {
    this.endpoint = `${options.baseUrl.replace(/\/+$/, '')}/api/contact`;
    this.timeoutMs = options.timeoutMs ?? 10_000;
  }

  async submit(lead: ValidLead): Promise<void> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await this.options.fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: lead.name, phone: lead.phone.value, email: lead.email.value }),
        signal: controller.signal,
      });
    } catch (error) {
      if (controller.signal.aborted) {
        throw new LeadGatewayError(`El backend no respondió a tiempo (${this.timeoutMs} ms)`);
      }
      throw new LeadGatewayError(`No se pudo conectar con el backend: ${(error as Error).message}`);
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      throw new LeadGatewayError(`El backend respondió ${response.status}`, response.status);
    }
  }
}
