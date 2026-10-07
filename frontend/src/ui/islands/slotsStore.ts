import { useEffect, useState } from 'react';
import type { SlotsView } from '../../application/dto/SlotsView';
import type { GetSlots } from '../../application/use-cases/GetSlots';
import { interactiveUseCases } from '../../composition/interactive';

/** Evento que avisa que los cupos cambiaron (p. ej. alguien envió el formulario). */
export const SLOTS_CHANGED = 'orioncore:slots-changed';

type SlotsReader = Pick<GetSlots, 'execute'>;

let pending: Promise<SlotsView> | undefined;

/** Una sola consulta al backend por página, compartida por todas las islas de cupos. */
function load(fallback: SlotsView, reader: SlotsReader): Promise<SlotsView> {
  pending ??= reader.execute(fallback);
  return pending;
}

export function notifySlotsChanged(): void {
  pending = undefined;
  window.dispatchEvent(new CustomEvent(SLOTS_CHANGED));
}

/** Solo para pruebas: olvida la consulta compartida. */
export function resetSlotsCache(): void {
  pending = undefined;
}

/** Cupos en vivo: arranca con los del HTML y se actualiza con el backend. */
export function useLiveSlots(initial: SlotsView, reader?: SlotsReader): SlotsView {
  const [slots, setSlots] = useState(initial);

  useEffect(() => {
    let active = true;
    const refresh = () =>
      load(initial, reader ?? interactiveUseCases().getSlots).then((value) => {
        if (active) setSlots(value);
      });
    refresh();
    window.addEventListener(SLOTS_CHANGED, refresh);
    return () => {
      active = false;
      window.removeEventListener(SLOTS_CHANGED, refresh);
    };
  }, []);

  return slots;
}
