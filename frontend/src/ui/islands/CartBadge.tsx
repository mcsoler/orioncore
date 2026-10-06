import { useEffect, useState } from 'react';
import type { GetCartCount } from '../../application/use-cases/AddToCart';
import { interactiveUseCases } from '../../composition/interactive';
import { CART_CHANGED } from './cartEvents';

export interface CartBadgeProps {
  /** Inyectable para pruebas; por defecto, el caso de uso GetCartCount. */
  getCount?: Pick<GetCartCount, 'execute'>;
}

/** Número de productos en el carrito, sobre el ícono del header. */
export default function CartBadge({ getCount }: CartBadgeProps) {
  const read = () => (getCount ?? interactiveUseCases().cartCount).execute();
  // Empieza en 0 como el HTML del servidor y lee el navegador al montar (sin desajustes de hidratación)
  const [count, setCount] = useState(0);

  useEffect(() => {
    const refresh = () => setCount(read());
    refresh();
    window.addEventListener(CART_CHANGED, refresh);
    window.addEventListener('storage', refresh); // otras pestañas
    return () => {
      window.removeEventListener(CART_CHANGED, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return (
    <>
      <span
        aria-hidden="true"
        data-testid="cart-count"
        className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-brand-blue text-white text-xs font-bold flex items-center justify-center"
      >
        {count}
      </span>
      <span className="sr-only">{`${count} productos en el carrito`}</span>
    </>
  );
}
