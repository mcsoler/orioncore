import { describe, expect, it } from 'vitest';
import { Money } from '../../../src/domain/value-objects/Money';
import { InvalidValueError } from '../../../src/domain/errors/DomainError';

describe('Money (COP)', () => {
  it('formatea pesos colombianos con separador de miles y sin decimales', () => {
    expect(Money.cop(1_299_000).format()).toBe('$1.299.000');
    expect(Money.cop(0).format()).toBe('$0');
    expect(Money.cop(950).format()).toBe('$950');
    expect(Money.cop(12_500_000_000).format()).toBe('$12.500.000.000');
  });

  it('rechaza montos negativos', () => {
    expect(() => Money.cop(-1)).toThrow(InvalidValueError);
  });

  it('rechaza montos que no son números finitos', () => {
    expect(() => Money.cop(Number.NaN)).toThrow(InvalidValueError);
    expect(() => Money.cop(Number.POSITIVE_INFINITY)).toThrow(InvalidValueError);
  });

  it('redondea al peso más cercano al crearse', () => {
    expect(Money.cop(1_000.4).amount).toBe(1_000);
    expect(Money.cop(1_000.5).amount).toBe(1_001);
  });

  it('suma sin errores de punto flotante', () => {
    expect(Money.cop(100).add(Money.cop(200)).amount).toBe(300);
  });

  it('multiplica sin errores de punto flotante', () => {
    expect(Money.cop(100).multiply(0.07).amount).toBe(7);
    expect(Money.cop(15_000).multiply(4.33).amount).toBe(64_950);
    expect(Money.cop(25_000).multiply(10 * 4.33).amount).toBe(1_082_500);
  });

  it('rechaza multiplicar por un factor negativo o no finito', () => {
    expect(() => Money.cop(100).multiply(-1)).toThrow(InvalidValueError);
    expect(() => Money.cop(100).multiply(Number.NaN)).toThrow(InvalidValueError);
  });

  it('compara por valor', () => {
    expect(Money.cop(500).equals(Money.cop(500))).toBe(true);
    expect(Money.cop(500).equals(Money.cop(501))).toBe(false);
  });

  it('acepta otra estrategia de formato (Strategy)', () => {
    const plain = { format: (amount: number) => `${amount} COP` };
    expect(Money.cop(1_500).format(plain)).toBe('1500 COP');
  });
});
