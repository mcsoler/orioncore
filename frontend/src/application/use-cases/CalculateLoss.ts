import type { LossRequest, LossResult } from '../dto/LossResult';
import type { CalculateLossUseCase } from '../ports/in/CalculateLossUseCase';
import { InvalidValueError } from '../../domain/errors/DomainError';
import type { LossCalculator } from '../../domain/services/LossCalculator';
import { Hours } from '../../domain/value-objects/Hours';
import { groupThousands, Money } from '../../domain/value-objects/Money';

export class CalculateLoss implements CalculateLossUseCase {
  constructor(private readonly calculator: LossCalculator) {}

  execute(request: LossRequest): LossResult {
    const errors: Partial<Record<keyof LossRequest, string>> = {};
    const hours = attempt(() => Hours.perWeek(request.hoursPerWeek), (m) => (errors.hoursPerWeek = m));
    const cost = attempt(() => Money.cop(request.costPerHour), (m) => (errors.costPerHour = m));
    if (!hours || !cost) return { ok: false, errors };

    const loss = attempt(() => this.calculator.calculate(hours, cost), (m) => (errors.costPerHour = m));
    if (!loss) return { ok: false, errors };

    return {
      ok: true,
      monthlyLoss: loss.monthlyLoss.format(),
      annualLoss: loss.annualLoss.format(),
      hoursPerYear: groupThousands(loss.hoursPerYear),
    };
  }
}

function attempt<T>(fn: () => T, onInvalid: (message: string) => void): T | undefined {
  try {
    return fn();
  } catch (error) {
    if (!(error instanceof InvalidValueError)) throw error;
    onInvalid(error.message);
    return undefined;
  }
}
