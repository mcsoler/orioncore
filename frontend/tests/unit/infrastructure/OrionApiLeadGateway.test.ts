import { describe, expect, it, vi } from 'vitest';
import { OrionApiLeadGateway } from '../../../src/infrastructure/leads/OrionApiLeadGateway';
import { LeadGatewayError, type ValidLead } from '../../../src/application/ports/out/LeadGateway';
import { Email } from '../../../src/domain/value-objects/Email';
import { PhoneNumber } from '../../../src/domain/value-objects/PhoneNumber';

const lead: ValidLead = {
  name: 'Ana Gómez',
  phone: PhoneNumber.parse('3001234567'),
  email: Email.parse('ana@empresa.com'),
  company: 'Empresa',
  services: ['agentes-ia-whatsapp'],
  message: 'Hola',
  consent: true,
};

const ok = () => new Response(JSON.stringify({ id: '1' }), { status: 200 });

describe('OrionApiLeadGateway', () => {
  it('hace POST a ${PUBLIC_API_URL}/api/contact solo con name, phone y email (contrato actual)', async () => {
    const fetchFn = vi.fn(async () => ok());
    await new OrionApiLeadGateway({ baseUrl: 'https://orioncore.co', fetch: fetchFn }).submit(lead);

    expect(fetchFn).toHaveBeenCalledOnce();
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://orioncore.co/api/contact');
    expect(init.method).toBe('POST');
    expect(new Headers(init.headers).get('Content-Type')).toBe('application/json');
    expect(JSON.parse(init.body as string)).toEqual({
      name: 'Ana Gómez',
      phone: '+573001234567',
      email: 'ana@empresa.com',
    });
  });

  it('con PUBLIC_API_URL vacío usa una ruta relativa (mismo dominio, Nginx enruta /api)', async () => {
    const fetchFn = vi.fn(async () => ok());
    await new OrionApiLeadGateway({ baseUrl: '', fetch: fetchFn }).submit(lead);
    expect(fetchFn.mock.calls[0]![0]).toBe('/api/contact');
  });

  it('tolera una barra final en la URL base', async () => {
    const fetchFn = vi.fn(async () => ok());
    await new OrionApiLeadGateway({ baseUrl: 'https://api.orioncore.co/', fetch: fetchFn }).submit(lead);
    expect(fetchFn.mock.calls[0]![0]).toBe('https://api.orioncore.co/api/contact');
  });

  it.each([400, 422, 500, 503])('convierte una respuesta %i en LeadGatewayError con el estado', async (status) => {
    const fetchFn = vi.fn(async () => new Response('error', { status }));
    const error = await new OrionApiLeadGateway({ baseUrl: '', fetch: fetchFn }).submit(lead).catch((e) => e);
    expect(error).toBeInstanceOf(LeadGatewayError);
    expect(error.status).toBe(status);
  });

  it('convierte un error de red en LeadGatewayError', async () => {
    const fetchFn = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    await expect(new OrionApiLeadGateway({ baseUrl: '', fetch: fetchFn }).submit(lead)).rejects.toThrow(LeadGatewayError);
  });

  it('cancela la petición al superar el timeout', async () => {
    const fetchFn = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        }),
    );
    const gateway = new OrionApiLeadGateway({ baseUrl: '', fetch: fetchFn, timeoutMs: 20 });
    await expect(gateway.submit(lead)).rejects.toThrow(/tiempo/);
  });
});
