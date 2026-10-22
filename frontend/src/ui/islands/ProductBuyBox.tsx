import { useEffect, useState } from 'react';
import type { AddToCart } from '../../application/use-cases/AddToCart';
import { interactiveUseCases } from '../../composition/interactive';
import { SELECTION_CHANGED, notifyCartChanged, openCart, type SelectionDetail } from './cartEvents';

export interface ProductBuyBoxProps {
  slug: string;
  title: string;
  variants: string[];
  addToCart?: Pick<AddToCart, 'execute'>;
}

/** Presentación, cantidad y botones de compra de la ficha de producto. */
export default function ProductBuyBox({ slug, title, variants, addToCart }: ProductBuyBoxProps) {
  // Como en el diseño, la presentación del medio (p. ej. Pack x2) viene marcada
  const [variant, setVariant] = useState(Math.min(1, variants.length - 1));
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const detail: SelectionDetail = { quantity, ...(variants[variant] && { variant: variants[variant] }) };
    window.dispatchEvent(new CustomEvent<SelectionDetail>(SELECTION_CHANGED, { detail }));
  }, [variant, quantity]);

  function buy() {
    (addToCart ?? interactiveUseCases().addToCart).execute(slug, quantity);
    notifyCartChanged();
    openCart();
  }

  return (
    <>
      {variants.length > 0 && (
        <fieldset>
          <legend className="font-semibold mb-2.5">
            Presentación: <span className="font-medium text-white/70">{variants[variant]}</span>
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {variants.map((label, i) => (
              <button
                key={label}
                type="button"
                aria-pressed={variant === i}
                onClick={() => setVariant(i)}
                className={variant === i ? 'btn-primary min-h-11' : 'btn-ghost min-h-11'}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap gap-2.5">
        <div className="flex items-center rounded-xl border border-line">
          <button type="button" aria-label="Restar" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-12 min-h-[52px] text-xl">
            −
          </button>
          <span aria-live="polite" aria-label={`Cantidad: ${quantity}`} className="min-w-8 text-center font-semibold" data-testid="quantity">
            {quantity}
          </span>
          <button type="button" aria-label="Sumar" onClick={() => setQuantity((q) => q + 1)} className="w-12 min-h-[52px] text-xl">
            +
          </button>
        </div>
        <button type="button" onClick={buy} className="btn-primary flex-1 min-w-[200px] min-h-[52px]" aria-label={`Agregar al carrito: ${title}`}>
          Agregar al carrito
        </button>
      </div>
      <button type="button" onClick={buy} className="btn-ghost w-full min-h-[52px]">
        Comprar ahora
      </button>
    </>
  );
}
