import type { Slots } from '../../../domain/value-objects/Slots';

/** No se pudieron consultar los cupos (red, timeout, respuesta inválida). */
export class SlotsUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SlotsUnavailableError';
  }
}

/** Puerto de salida: de dónde salen los cupos actuales del diagnóstico. */
export interface SlotsGateway {
  current(): Promise<Slots>;
}
