import type { SlotsView } from '../../application/dto/SlotsView';
import type { GetSlots } from '../../application/use-cases/GetSlots';
import { fillSlots } from '../presenters/slotsText';
import { useLiveSlots } from './slotsStore';

export interface LiveSlotsTextProps {
  /** Texto con {month}, {remaining}, {taken} y {total}. */
  template: string;
  initial: SlotsView;
  /** Inyectable para pruebas; por defecto, el caso de uso GetSlots. */
  getSlots?: Pick<GetSlots, 'execute'>;
}

/** Texto de cupos que se actualiza con el número real del backend. */
export default function LiveSlotsText({ template, initial, getSlots }: LiveSlotsTextProps) {
  const slots = useLiveSlots(initial, getSlots);
  return <span>{fillSlots(template, slots)}</span>;
}
