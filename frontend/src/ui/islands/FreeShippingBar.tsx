import type { StoreView } from '../../application/dto/PageViews';
import { useCartSummary, type CartSummaryReader } from './useCart';

export interface FreeShippingBarProps {
  store: Pick<StoreView, 'products' | 'freeShippingFrom'>;
  reader?: CartSummaryReader;
  /** Variante compacta para el carrito lateral. */
  compact?: boolean;
}

/** "Te faltan $X para envío gratis" con su barra de avance (CRO). */
export default function FreeShippingBar({ store, reader, compact = false }: FreeShippingBarProps) {
  const { shipping } = useCartSummary(store, reader);
  const message = shipping.qualifies ? (
    <span>¡Tienes envío gratis!</span>
  ) : (
    <span>
      Te faltan <strong>{shipping.remaining}</strong> para envío gratis
    </span>
  );
  const bar = (
    <div
      role="progressbar"
      aria-label="Avance hacia el envío gratis"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={shipping.progress}
      className={compact ? 'h-1.5 rounded-full bg-surface-2 mt-2' : 'w-[180px] h-1.5 rounded-full bg-navy'}
    >
      <div className="h-full rounded-full bg-success transition-all" style={{ width: `${shipping.progress}%` }} />
    </div>
  );

  if (compact) {
    return (
      <div className="rounded-xl bg-navy p-3 text-sm">
        {message}
        {bar}
      </div>
    );
  }
  return (
    <div className="wrap flex flex-wrap items-center justify-center gap-3.5 min-h-11 py-2 text-sm">
      {message}
      {bar}
    </div>
  );
}
