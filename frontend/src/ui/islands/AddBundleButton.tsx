import type { AddToCart } from '../../application/use-cases/AddToCart';
import { interactiveUseCases } from '../../composition/interactive';
import { notifyCartChanged, openCart } from './cartEvents';

export interface AddBundleButtonProps {
  slugs: string[];
  addToCart?: Pick<AddToCart, 'execute'>;
}

/** "Se compran juntos": agrega al carrito los productos del combo. */
export default function AddBundleButton({ slugs, addToCart }: AddBundleButtonProps) {
  function add() {
    const cart = addToCart ?? interactiveUseCases().addToCart;
    slugs.forEach((slug) => cart.execute(slug));
    notifyCartChanged();
    openCart();
  }
  return (
    <button type="button" onClick={add} className="btn-primary">
      Agregar el combo al carrito
    </button>
  );
}
