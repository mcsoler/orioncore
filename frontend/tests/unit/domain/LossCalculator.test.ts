import { describe, expect, it } from 'vitest';
import { LossCalculator, WEEKS_PER_MONTH } from '../../../src/domain/services/LossCalculator';
import { Hours } from '../../../src/domain/value-objects/Hours';
import { Money } from '../../../src/domain/value-objects/Money';
import { InvalidValueError } from '../../../src/domain/errors/DomainError';

describe('Hours (horas por semana)', () => {
  it.each([1, 10, 37.5, 60])('acepta %s', (h) => {
    expect(Hours.perWeek(h).value).toBe(h);
  });

  it.each([0, 0.5, 60.5, -3, Number.NaN, Number.POSITIVE_INFINITY])('rechaza %s', (h) => {
    expect(() => Hours.perWeek(h)).toThrow(InvalidValueError);
  });
});

describe('LossCalculator', () => {
  const calculator = new LossCalculator();

  it('usa 4,33 semanas por mes', () => {
    expect(WEEKS_PER_MONTH).toBe(4.33);
  });

  it('calcula pérdida mensual, anual y horas al año', () => {
    const result = calculator.calculate(Hours.perWeek(10), Money.cop(25_000));
    expect(result.monthlyLoss.amount).toBe(1_082_500); // 10 × 4,33 × 25.000
    expect(result.annualLoss.amount).toBe(12_990_000); // mensual × 12
    expect(result.hoursPerYear).toBe(520); // 10 × 4,33 × 12 = 519,6
  });

  it('funciona en el límite inferior (1 h/semana)', () => {
    const result = calculator.calculate(Hours.perWeek(1), Money.cop(10_000));
    expect(result.monthlyLoss.amount).toBe(43_300);
    expect(result.annualLoss.amount).toBe(519_600);
    expect(result.hoursPerYear).toBe(52);
  });

  it('funciona en el límite superior (60 h/semana)', () => {
    const result = calculator.calculate(Hours.perWeek(60), Money.cop(100_000));
    expect(result.monthlyLoss.amount).toBe(25_980_000);
    expect(result.annualLoss.amount).toBe(311_760_000);
    expect(result.hoursPerYear).toBe(3_118);
  });

  it('no acumula errores de flotantes (7 × 4,33 = 30,31)', () => {
    const result = calculator.calculate(Hours.perWeek(7), Money.cop(10_000));
    expect(result.monthlyLoss.amount).toBe(303_100);
  });

  it('rechaza un costo por hora de cero', () => {
    expect(() => calculator.calculate(Hours.perWeek(5), Money.cop(0))).toThrow(InvalidValueError);
  });
});
