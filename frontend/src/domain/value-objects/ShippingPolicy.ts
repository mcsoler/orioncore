import { Money } from './Money';

/**
 * Envío gratis desde un monto. Mientras el monto no esté definido, la política no
 * calcula nada: la UI muestra el marcador ([$X]) en lugar de inventar una cifra.
 */
export class ShippingPolicy {
  private constructor(readonly freeFrom?: Money) {}

  static freeFrom(amount: number | undefined): ShippingPolicy {
    return new ShippingPolicy(amount === undefined ? undefined : Money.cop(amount));
  }

  get isDefined(): boolean {
    return this.freeFrom !== undefined;
  }

  /** Cuánto falta para el envío gratis (0 si ya lo alcanzó). */
  remaining(subtotal: Money): Money | undefined {
    if (!this.freeFrom) return undefined;
    return Money.cop(Math.max(0, this.freeFrom.amount - subtotal.amount));
  }

  /** Avance hacia el envío gratis, 0–100. */
  progress(subtotal: Money): number {
    if (!this.freeFrom || this.freeFrom.amount === 0) return this.freeFrom ? 100 : 0;
    return Math.min(100, Math.round((subtotal.amount / this.freeFrom.amount) * 100));
  }

  qualifies(subtotal: Money): boolean {
    return this.remaining(subtotal)?.amount === 0;
  }
}
