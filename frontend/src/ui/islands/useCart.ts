import { useEffect, useState } from 'react';
import type { CartSummary, GetCartSummary } from '../../application/use-cases/AddToCart';
import type { StoreView } from '../../application/dto/PageViews';
import { interactiveUseCases } from '../../composition/interactive';
import { CART_CHANGED } from './cartEvents';

export type CartSummaryReader = Pick<GetCartSummary, 'execute'>;

const EMPTY: CartSummary = {
  count: 0,
  lines: [],
  subtotal: '$0',
  shipping: { remaining: '[$X]', progress: 0, qualifies: false },
};

/**
 * Resumen del carrito para las islas de la tienda. Empieza vacío como el HTML del servidor
 * y lee el navegador al montar; se actualiza con cada cambio (también desde otras pestañas).
 */
export function useCartSummary(store: Pick<StoreView, 'products' | 'freeShippingFrom'>, reader?: CartSummaryReader): CartSummary {
  const [summary, setSummary] = useState<CartSummary>(EMPTY);

  useEffect(() => {
    const prices = Object.fromEntries(store.products.map((p) => [p.slug, p.priceValue]));
    const refresh = () => setSummary((reader ?? interactiveUseCases().cartSummary).execute(prices, store.freeShippingFrom));
    refresh();
    window.addEventListener(CART_CHANGED, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(CART_CHANGED, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return summary;
}
