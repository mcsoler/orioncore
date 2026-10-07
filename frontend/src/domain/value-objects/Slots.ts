import { InvalidValueError } from '../errors/DomainError';

/** Cupos del diagnóstico gratuito: cuántos quedan de un total. */
export class Slots {
  private constructor(
    readonly remaining: number,
    readonly total: number,
  ) {}

  static of(props: { remaining: number; total: number }): Slots {
    const { remaining, total } = props;
    if (!Number.isInteger(total) || total < 1) throw new InvalidValueError('slots.total', 'debe ser un entero mayor que 0');
    if (!Number.isInteger(remaining) || remaining < 0 || remaining > total) {
      throw new InvalidValueError('slots.remaining', `debe ser un entero entre 0 y ${total}`);
    }
    return new Slots(remaining, total);
  }

  get taken(): number {
    return this.total - this.remaining;
  }

  /** Porcentaje de cupos tomados (0–100). */
  get progress(): number {
    return Math.round((this.taken / this.total) * 100);
  }
}
