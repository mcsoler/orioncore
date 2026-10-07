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

  it('usa 4,5 semanas por mes', () => {
    expect(WEEKS_PER_MONTH).toBe(4.5);
  });

  it('semanal = horas por empleado × costo por hora; mensual = semanal × 4,5; anual = mensual × 12', () => {
    const result = calculator.calculate(Hours.perWeek(10), Money.cop(25_000));
    expect(result.weeklyLoss.amount).toBe(250_000);
    expect(result.monthlyLoss.amount).toBe(1_125_000);
    expect(result.annualLoss.amount).toBe(13_500_000);
  });

  it('funciona en el límite inferior (1 h/semana)', () => {
    const result = calculator.calculate(Hours.perWeek(1), Money.cop(10_000));
    expect(result.weeklyLoss.amount).toBe(10_000);
    expect(result.monthlyLoss.amount).toBe(45_000);
    expect(result.annualLoss.amount).toBe(540_000);
  });

  it('funciona en el límite superior (60 h/semana)', () => {
    const result = calculator.calculate(Hours.perWeek(60), Money.cop(100_000));
    expect(result.weeklyLoss.amount).toBe(6_000_000);
    expect(result.monthlyLoss.amount).toBe(27_000_000);
    expect(result.annualLoss.amount).toBe(324_000_000);
  });

  it('no acumula errores de flotantes (7 h × $35.000 × 4,5)', () => {
    expect(calculator.calculate(Hours.perWeek(7), Money.cop(35_000)).monthlyLoss.amount).toBe(1_102_500);
  });

  it('rechaza un costo por hora de cero', () => {
    expect(() => calculator.calculate(Hours.perWeek(5), Money.cop(0))).toThrow(InvalidValueError);
  });
});
