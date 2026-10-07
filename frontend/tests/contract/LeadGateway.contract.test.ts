import { describe, expect, it, vi } from 'vitest';
import { leadGatewayContract, contractLead } from './LeadGateway.contract';
import { OrionApiLeadGateway } from '../../src/infrastructure/leads/OrionApiLeadGateway';
import { ConsoleLeadGateway } from '../../src/infrastructure/leads/ConsoleLeadGateway';

leadGatewayContract('OrionApiLeadGateway', {
  available: () => new OrionApiLeadGateway({ baseUrl: '', fetch: async () => new Response('{}', { status: 200 }) }),
  unavailable: () => new OrionApiLeadGateway({ baseUrl: '', fetch: async () => new Response('', { status: 503 }) }),
});

leadGatewayContract('ConsoleLeadGateway', {
  available: () => new ConsoleLeadGateway({ info: () => {} }),
});

describe('ConsoleLeadGateway', () => {
  it('registra el lead normalizado en el logger sin enviarlo a ningún lado', async () => {
    const info = vi.fn();
    await new ConsoleLeadGateway({ info }).submit(contractLead);
    expect(info).toHaveBeenCalledWith('[lead]', {
      name: 'Contrato',
      phone: '+573001234567',
      email: 'contrato@empresa.com',
      services: ['software-a-medida'],
    });
  });
});
