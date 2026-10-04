import { InvalidValueError } from '../errors/DomainError';

/** Strategy: cómo se presenta un monto en pesos. */
export interface MoneyFormat {
  format(amount: number): string;
}

/** Formato COP: `$1.299.000` (punto de miles, sin decimales). */
export const copFormat: MoneyFormat = {
  format: (amount) => `$${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`,
};

/** Monto en pesos colombianos enteros. Los pesos no tienen centavos en la práctica. */
export class Money {
  private constructor(readonly amount: number) {}

  static cop(amount: number): Money {
    if (!Number.isFinite(amount)) throw new InvalidValueError('money', 'debe ser un número finito');
    if (amount < 0) throw new InvalidValueError('money', 'no puede ser negativo');
    return new Money(Math.round(amount));
  }

  add(other: Money): Money {
    return Money.cop(this.amount + other.amount);
  }

  multiply(factor: number): Money {
    if (!Number.isFinite(factor) || factor < 0) {
      throw new InvalidValueError('factor', 'debe ser un número finito no negativo');
    }
    // toPrecision elimina el ruido binario (64949.99999999999 → 64950) antes de redondear
    return Money.cop(Number((this.amount * factor).toPrecision(12)));
  }

  equals(other: Money): boolean {
    return this.amount === other.amount;
  }

  format(strategy: MoneyFormat = copFormat): string {
    return strategy.format(this.amount);
  }
}
