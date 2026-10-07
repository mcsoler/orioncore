import { describe, expect, it } from 'vitest';
import { validateLead, STEP_FIELDS } from '../../../src/application/use-cases/validateLead';

const valid = {
  name: 'Ana',
  whatsapp: '3001234567',
  email: 'ana@empresa.com',
  services: ['software-a-medida'],
  consent: true,
};

describe('validateLead', () => {
  it('sin errores devuelve el lead normalizado', () => {
    const result = validateLead(valid);
    expect(result.errors).toEqual({});
    expect(result.lead?.phone.value).toBe('+573001234567');
  });

  it('devuelve los errores por campo y ningún lead', () => {
    const result = validateLead({ ...valid, email: 'x', services: [] });
    expect(Object.keys(result.errors).sort()).toEqual(['email', 'services']);
    expect(result.lead).toBeUndefined();
  });

  it('expone los campos de cada paso del formulario (referencia del home)', () => {
    expect(STEP_FIELDS).toEqual([
      ['services', 'name', 'whatsapp', 'consent'],
      ['email'],
    ]);
  });
});
