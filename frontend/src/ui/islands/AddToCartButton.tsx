import { useState } from 'react';
import type { AddToCart } from '../../application/use-cases/AddToCart';
import { interactiveUseCases } from '../../composition/interactive';
import { CART_CHANGED } from './cartEvents';

export interface AddToCartButtonProps {
  slug: string;
  name: string;
  /** Inyectable para pruebas; por defecto, el caso de uso AddToCart. */
  addToCart?: Pick<AddToCart, 'execute'>;
}

export default function AddToCartButton({ slug, name, addToCart }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  function add() {
    (addToCart ?? interactiveUseCases().addToCart).execute(slug);
    window.dispatchEvent(new CustomEvent(CART_CHANGED));
    setAdded(true);
  }

  return (
    <>
      <button type="button" onClick={add} aria-label={`Agregar al carrito: ${name}`} className="btn-primary w-full mt-auto">
        Agregar al carrito
      </button>
      <span role="status" className="text-xs text-success min-h-[1rem]">
        {added ? '✓ Agregado al carrito' : ''}
      </span>
    </>
  );
}
