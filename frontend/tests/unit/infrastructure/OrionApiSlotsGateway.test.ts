import { describe, expect, it, vi } from 'vitest';
import { OrionApiSlotsGateway } from '../../../src/infrastructure/slots/OrionApiSlotsGateway';
import { SlotsUnavailableError } from '../../../src/application/ports/out/SlotsGateway';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe('OrionApiSlotsGateway', () => {
  it('hace GET a ${PUBLIC_API_URL}/api/slots sin caché y devuelve los cupos', async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => json({ remaining: 3, taken: 7, total: 10 }));
    const slots = await new OrionApiSlotsGateway({ baseUrl: '', fetch: fetchFn }).current();
    expect(fetchFn.mock.calls[0]![0]).toBe('/api/slots');
    expect(fetchFn.mock.calls[0]![1]!.cache).toBe('no-store');
    expect(slots.remaining).toBe(3);
    expect(slots.total).toBe(10);
  });

  it.each([
    ['un error del servidor', async () => json({ error: 'x' }, 500)],
    ['una respuesta con forma inválida', async () => json({ remaining: 'muchos' })],
    ['cupos imposibles', async () => json({ remaining: 20, total: 10 })],
    ['un error de red', async () => { throw new TypeError('Failed to fetch'); }],
  ])('convierte %s en SlotsUnavailableError', async (_, impl) => {
    const gateway = new OrionApiSlotsGateway({ baseUrl: '', fetch: vi.fn<typeof fetch>(impl as never) });
    await expect(gateway.current()).rejects.toBeInstanceOf(SlotsUnavailableError);
  });
});
