import { describe, expect, it } from 'vitest';
import { SubmitLead } from '../../../src/application/use-cases/SubmitLead';
import type { LeadRequest } from '../../../src/application/dto/LeadRequest';
import { LeadGatewayError, type LeadGateway, type ValidLead } from '../../../src/application/ports/out/LeadGateway';
import type { AnalyticsEvent, AnalyticsTracker } from '../../../src/application/ports/out/AnalyticsTracker';

const validRequest: LeadRequest = {
  name: '  Ana Gómez ',
  whatsapp: '300 123 4567',
  email: 'Ana@Empresa.com',
  company: 'Empresa S.A.S.',
  services: ['agentes-ia-whatsapp'],
  message: 'Quiero automatizar el WhatsApp',
  consent: true,
};

function setup(gatewayFails = false) {
  const sent: ValidLead[] = [];
  const events: AnalyticsEvent[] = [];
  const gateway: LeadGateway = {
    submit: async (lead) => {
      if (gatewayFails) throw new LeadGatewayError('backend caído');
      sent.push(lead);
    },
  };
  const tracker: AnalyticsTracker = { track: (event) => void events.push(event) };
  return { useCase: new SubmitLead(gateway, tracker), sent, events };
}

describe('SubmitLead', () => {
  it('con datos válidos envía el lead normalizado y registra generate_lead', async () => {
    const { useCase, sent, events } = setup();
    expect(await useCase.execute(validRequest)).toEqual({ ok: true });

    expect(sent).toHaveLength(1);
    const [lead] = sent;
    expect(lead!.name).toBe('Ana Gómez');
    expect(lead!.phone.value).toBe('+573001234567');
    expect(lead!.email.value).toBe('ana@empresa.com');
    expect(lead!.services).toEqual(['agentes-ia-whatsapp']);
    expect(lead!.company).toBe('Empresa S.A.S.');
    expect(events).toEqual([{ name: 'generate_lead', params: { services: 'agentes-ia-whatsapp' } }]);
  });

  it.each([
    ['name', { name: ' ' }],
    ['name', { name: 'A' }],
    ['whatsapp', { whatsapp: '123' }],
    ['email', { email: 'no-es-correo' }],
    ['services', { services: [] }],
    ['consent', { consent: false }],
  ] as const)('marca el campo %s cuando es inválido y no envía nada', async (field, patch) => {
    const { useCase, sent, events } = setup();
    const result = await useCase.execute({ ...validRequest, ...patch });

    expect(result.ok).toBe(false);
    expect(!result.ok && result.errors[field]).toBeTruthy();
    expect(sent).toHaveLength(0);
    expect(events).toHaveLength(0);
  });

  it('exige el consentimiento citando la Ley 1581', async () => {
    const { useCase } = setup();
    const result = await useCase.execute({ ...validRequest, consent: false });
    expect(!result.ok && result.errors.consent).toMatch(/1581/);
  });

  it('reporta todos los campos inválidos a la vez', async () => {
    const { useCase } = setup();
    const result = await useCase.execute({ ...validRequest, name: '', email: 'x', consent: false });
    expect(!result.ok && Object.keys(result.errors).sort()).toEqual(['consent', 'email', 'name']);
  });

  it('si el gateway está caído devuelve un error de formulario y registra el fallo', async () => {
    const { useCase, events } = setup(true);
    const result = await useCase.execute(validRequest);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.errors.form).toMatch(/WhatsApp/);
    expect(events).toEqual([{ name: 'lead_submit_error', params: {} }]);
  });

  it('no oculta errores inesperados del gateway', async () => {
    const gateway: LeadGateway = { submit: async () => { throw new TypeError('bug'); } };
    const useCase = new SubmitLead(gateway, { track: () => {} });
    await expect(useCase.execute(validRequest)).rejects.toThrow(TypeError);
  });
});
