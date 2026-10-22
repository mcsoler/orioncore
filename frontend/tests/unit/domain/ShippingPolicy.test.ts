import { describe, expect, it } from 'vitest';
import { ShippingPolicy } from '../../../src/domain/value-objects/ShippingPolicy';
import { Money } from '../../../src/domain/value-objects/Money';

describe('ShippingPolicy (envío gratis)', () => {
  const policy = ShippingPolicy.freeFrom(300_000);

  it('calcula cuánto falta y el avance hacia el envío gratis', () => {
    expect(policy.remaining(Money.cop(120_000))?.format()).toBe('$180.000');
    expect(policy.progress(Money.cop(120_000))).toBe(40);
    expect(policy.qualifies(Money.cop(120_000))).toBe(false);
  });

  it('al superar el monto, falta $0, el avance se queda en 100 y aplica', () => {
    expect(policy.remaining(Money.cop(450_000))?.amount).toBe(0);
    expect(policy.progress(Money.cop(450_000))).toBe(100);
    expect(policy.qualifies(Money.cop(450_000))).toBe(true);
  });

  it('sin monto definido no inventa cifras', () => {
    const pending = ShippingPolicy.freeFrom(undefined);
    expect(pending.isDefined).toBe(false);
    expect(pending.remaining(Money.cop(100))).toBeUndefined();
    expect(pending.progress(Money.cop(100))).toBe(0);
    expect(pending.qualifies(Money.cop(100))).toBe(false);
  });
});
