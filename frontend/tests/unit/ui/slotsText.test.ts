import { describe, expect, it } from 'vitest';
import { fillSlots } from '../../../src/ui/presenters/slotsText';

const slots = { remaining: 4, taken: 6, total: 10, progress: 60 };

describe('fillSlots', () => {
  it('reemplaza el mes actual y los cupos en la plantilla', () => {
    const october = new Date(2026, 9, 6);
    expect(fillSlots('Diagnóstico gratuito de {month}: quedan solo {remaining} de {total} cupos', slots, october)).toBe(
      'Diagnóstico gratuito de octubre: quedan solo 4 de 10 cupos',
    );
    expect(fillSlots('{taken} de {total} tomados', slots, october)).toBe('6 de 10 tomados');
  });

  it('usa el mes en curso', () => {
    expect(fillSlots('Cupos de {month}', slots, new Date(2027, 0, 15))).toBe('Cupos de enero');
  });
});
