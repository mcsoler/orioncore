import type { SlotsView } from '../dto/SlotsView';
import { SlotsUnavailableError, type SlotsGateway } from '../ports/out/SlotsGateway';

/** Cupos actuales; si no se pueden consultar, se conservan los que ya se mostraban. */
export class GetSlots {
  constructor(private readonly gateway: SlotsGateway) {}

  async execute(fallback: SlotsView): Promise<SlotsView> {
    try {
      const slots = await this.gateway.current();
      return { remaining: slots.remaining, taken: slots.taken, total: slots.total, progress: slots.progress };
    } catch (error) {
      if (!(error instanceof SlotsUnavailableError)) throw error;
      return fallback;
    }
  }
}
