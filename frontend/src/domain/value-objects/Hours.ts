import { InvalidValueError } from '../errors/DomainError';

export const MIN_HOURS_PER_WEEK = 1;
export const MAX_HOURS_PER_WEEK = 60;

/** Horas por semana dedicadas a tareas manuales (entre 1 y 60). */
export class Hours {
  private constructor(readonly value: number) {}

  static perWeek(value: number): Hours {
    if (!Number.isFinite(value) || value < MIN_HOURS_PER_WEEK || value > MAX_HOURS_PER_WEEK) {
      throw new InvalidValueError(
        'hours',
        `deben estar entre ${MIN_HOURS_PER_WEEK} y ${MAX_HOURS_PER_WEEK} por semana`,
      );
    }
    return new Hours(value);
  }
}
