import { useEffect, useState } from 'react';
import type { AddToCart } from '../../application/use-cases/AddToCart';
import { interactiveUseCases } from '../../composition/interactive';
import { SELECTION_CHANGED, notifyCartChanged, openCart, type SelectionDetail } from './cartEvents';

export interface StickyAddToCartProps {
  slug: string;
  title: string;
  price: string;
  variant?: string;
  addToCart?: Pick<AddToCart, 'execute'>;
}

/** Barra fija inferior de la ficha: sigue la presentación y la cantidad elegidas arriba. */
export default function StickyAddToCart({ slug, title, price, variant, addToCart }: StickyAddToCartProps) {
  const [selection, setSelection] = useState<SelectionDetail>({ quantity: 1, ...(variant && { variant }) });

  useEffect(() => {
    const update = (event: Event) => setSelection((event as CustomEvent<SelectionDetail>).detail);
    window.addEventListener(SELECTION_CHANGED, update);
    return () => window.removeEventListener(SELECTION_CHANGED, update);
  }, []);

  function add() {
    (addToCart ?? interactiveUseCases().addToCart).execute(slug, selection.quantity);
    notifyCartChanged();
    openCart();
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-surface border-t border-line" data-sticky-cart>
      <div className="wrap flex items-center justify-between gap-4 min-h-[76px]">
        <div className="hidden md:flex items-center gap-3">
          <span className="ph w-12 h-12" aria-hidden="true">
            [img]
          </span>
          <span>
            <strong>{title}</strong>
            {selection.variant && (
              <>
                <br />
                <span className="text-sm text-white/70">{selection.variant}</span>
              </>
            )}
          </span>
        </div>
        <div className="flex flex-1 items-center justify-end gap-3.5">
          <span className="font-poppins text-[22px] font-bold">{price}</span>
          <button type="button" onClick={add} className="btn-primary">
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
