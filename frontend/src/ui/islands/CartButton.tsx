import type { StoreView } from '../../application/dto/PageViews';
import { openCart } from './cartEvents';
import { useCartSummary, type CartSummaryReader } from './useCart';

export interface CartButtonProps {
  store: Pick<StoreView, 'products' | 'freeShippingFrom'>;
  /** Inyectable para pruebas. */
  reader?: CartSummaryReader;
}

/** "Carrito (N)" del header de la tienda: abre el carrito lateral. */
export default function CartButton({ store, reader }: CartButtonProps) {
  const { count } = useCartSummary(store, reader);
  return (
    <button type="button" onClick={openCart} aria-haspopup="dialog" className="btn-ghost min-h-11 px-4 shrink-0" data-cart-button>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M17 17h-11v-14h-2 M6 5l14 1l-1 7h-13" />
      </svg>
      Carrito ({count})
    </button>
  );
}
