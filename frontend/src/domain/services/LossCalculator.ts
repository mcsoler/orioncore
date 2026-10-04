import { InvalidValueError } from '../errors/DomainError';
import type { Hours } from '../value-objects/Hours';
import type { Money } from '../value-objects/Money';

export const WEEKS_PER_MONTH = 4.33;
const MONTHS_PER_YEAR = 12;

export interface Loss {
  monthlyLoss: Money;
  annualLoss: Money;
  hoursPerYear: number;
}

/** Cuánto le cuesta a una empresa el tiempo dedicado a tareas que se pueden automatizar. */
export class LossCalculator {
  calculate(hoursPerWeek: Hours, costPerHour: Money): Loss {
    if (costPerHour.amount === 0) throw new InvalidValueError('costPerHour', 'debe ser mayor que cero');

    const monthlyLoss = costPerHour.multiply(hoursPerWeek.value * WEEKS_PER_MONTH);
    return {
      monthlyLoss,
      annualLoss: monthlyLoss.multiply(MONTHS_PER_YEAR),
      hoursPerYear: Math.round(hoursPerWeek.value * WEEKS_PER_MONTH * MONTHS_PER_YEAR),
    };
  }
}
