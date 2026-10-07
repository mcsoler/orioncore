import { describe, expect, it } from 'vitest';
import { GetSlots } from '../../../src/application/use-cases/GetSlots';
import { SlotsUnavailableError, type SlotsGateway } from '../../../src/application/ports/out/SlotsGateway';
import { Slots } from '../../../src/domain/value-objects/Slots';

const fallback = { remaining: 4, taken: 6, total: 10, progress: 60 };

describe('GetSlots', () => {
  it('devuelve los cupos actuales del backend', async () => {
    const gateway: SlotsGateway = { current: async () => Slots.of({ remaining: 2, total: 10 }) };
    expect(await new GetSlots(gateway).execute(fallback)).toEqual({ remaining: 2, taken: 8, total: 10, progress: 80 });
  });

  it('si el backend no responde, mantiene los cupos que ya se mostraban', async () => {
    const gateway: SlotsGateway = { current: async () => { throw new SlotsUnavailableError('caído'); } };
    expect(await new GetSlots(gateway).execute(fallback)).toEqual(fallback);
  });

  it('no oculta errores inesperados', async () => {
    const gateway: SlotsGateway = { current: async () => { throw new TypeError('bug'); } };
    await expect(new GetSlots(gateway).execute(fallback)).rejects.toThrow(TypeError);
  });
});
