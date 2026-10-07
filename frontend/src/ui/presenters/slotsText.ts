import type { SlotsView } from '../../application/dto/SlotsView';

/** Rellena `{month}`, `{remaining}`, `{taken}` y `{total}` de los textos de cupos del contenido. */
export function fillSlots(template: string, slots: SlotsView, now: Date = new Date()): string {
  const month = new Intl.DateTimeFormat('es-CO', { month: 'long' }).format(now);
  return template
    .replaceAll('{month}', month)
    .replaceAll('{remaining}', String(slots.remaining))
    .replaceAll('{taken}', String(slots.taken))
    .replaceAll('{total}', String(slots.total));
}
