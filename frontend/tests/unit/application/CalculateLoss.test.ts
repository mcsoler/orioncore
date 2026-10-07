import { describe, expect, it } from 'vitest';
import { CalculateLoss } from '../../../src/application/use-cases/CalculateLoss';
import { LossCalculator } from '../../../src/domain/services/LossCalculator';

const calculateLoss = new CalculateLoss(new LossCalculator());

describe('CalculateLoss', () => {
  it('devuelve los montos formateados para la UI', () => {
    expect(calculateLoss.execute({ hoursPerWeek: 10, costPerHour: 25_000 })).toEqual({
      ok: true,
      weeklyLoss: '$250.000',
      monthlyLoss: '$1.125.000',
      annualLoss: '$13.500.000',
    });
  });

  it('devuelve un error por campo si las horas están fuera de rango', () => {
    const result = calculateLoss.execute({ hoursPerWeek: 0, costPerHour: 25_000 });
    expect(result.ok).toBe(false);
    expect(!result.ok && result.errors.hoursPerWeek).toMatch(/entre 1 y 60/);
  });

  it('devuelve un error por campo si el costo por hora no es válido', () => {
    const result = calculateLoss.execute({ hoursPerWeek: 5, costPerHour: -10 });
    expect(result.ok).toBe(false);
    expect(!result.ok && result.errors.costPerHour).toBeTruthy();
  });

  it('devuelve un error si el costo por hora es cero', () => {
    const result = calculateLoss.execute({ hoursPerWeek: 5, costPerHour: 0 });
    expect(!result.ok && result.errors.costPerHour).toMatch(/mayor que cero/);
  });
});
