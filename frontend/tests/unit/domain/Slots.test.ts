import { describe, expect, it } from 'vitest';
import { Slots } from '../../../src/domain/value-objects/Slots';
import { InvalidValueError } from '../../../src/domain/errors/DomainError';

describe('Slots (cupos del diagnóstico)', () => {
  it('expone los que quedan, los tomados, el total y el avance', () => {
    const slots = Slots.of({ remaining: 4, total: 10 });
    expect(slots.remaining).toBe(4);
    expect(slots.taken).toBe(6);
    expect(slots.total).toBe(10);
    expect(slots.progress).toBe(60);
  });

  it.each([
    [{ remaining: -1, total: 10 }],
    [{ remaining: 11, total: 10 }],
    [{ remaining: 1.5, total: 10 }],
    [{ remaining: 0, total: 0 }],
  ])('rechaza %o', (props) => {
    expect(() => Slots.of(props)).toThrow(InvalidValueError);
  });
});
