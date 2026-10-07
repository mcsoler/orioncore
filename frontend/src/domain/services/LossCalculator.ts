import { InvalidValueError } from '../errors/DomainError';
import type { Hours } from '../value-objects/Hours';
import type { Money } from '../value-objects/Money';

export const WEEKS_PER_MONTH = 4.5;
const MONTHS_PER_YEAR = 12;

export interface Loss {
  weeklyLoss: Money;
  monthlyLoss: Money;
  annualLoss: Money;
}

/**
 * Cuánto le cuesta a una empresa el tiempo que un empleado dedica a tareas repetitivas:
 * semanal = horas × costo por hora; mensual = semanal × 4,5; anual = mensual × 12.
 */
export class LossCalculator {
  calculate(hoursPerWeek: Hours, costPerHour: Money): Loss {
    if (costPerHour.amount === 0) throw new InvalidValueError('costPerHour', 'debe ser mayor que cero');

    const weeklyLoss = costPerHour.multiply(hoursPerWeek.value);
    const monthlyLoss = weeklyLoss.multiply(WEEKS_PER_MONTH);
    return { weeklyLoss, monthlyLoss, annualLoss: monthlyLoss.multiply(MONTHS_PER_YEAR) };
  }
}
