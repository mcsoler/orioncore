import type { SlotsView } from '../../application/dto/SlotsView';
import type { GetSlots } from '../../application/use-cases/GetSlots';
import { fillSlots } from '../presenters/slotsText';
import { useLiveSlots } from './slotsStore';

export interface SlotsMeterProps {
  label: string;
  value: string;
  initial: SlotsView;
  /** Inyectable para pruebas; por defecto, el caso de uso GetSlots. */
  getSlots?: Pick<GetSlots, 'execute'>;
}

/** Caja de cupos de la sección de contacto: tomados y barra de avance en vivo. */
export default function SlotsMeter({ label, value, initial, getSlots }: SlotsMeterProps) {
  const slots = useLiveSlots(initial, getSlots);
  const labelText = fillSlots(label, slots);
  return (
    <div className="rounded-[14px] bg-navy border border-line p-[18px]">
      <p className="flex justify-between text-sm">
        <span>{labelText}</span>
        <strong className="text-amber">{fillSlots(value, slots)}</strong>
      </p>
      <div
        role="progressbar"
        aria-label={labelText}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={slots.progress}
        className="h-2 bg-surface-2 rounded-full mt-2.5"
      >
        <div className="h-full bg-amber rounded-full transition-all" style={{ width: `${slots.progress}%` }} />
      </div>
    </div>
  );
}
