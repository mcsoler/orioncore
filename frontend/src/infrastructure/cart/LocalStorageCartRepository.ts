import type { CartRepository } from '../../application/ports/out/CartRepository';
import { Cart } from '../../domain/entities/Cart';

export const CART_KEY = 'orioncore:cart';

/**
 * Adapter: guarda el carrito en el localStorage del navegador.
 * Si el almacenamiento no existe o está bloqueado (modo privado), el carrito vive solo en la página.
 */
export class LocalStorageCartRepository implements CartRepository {
  private memory = Cart.empty();

  constructor(private readonly storage: Storage | undefined) {}

  load(): Cart {
    try {
      const raw = this.storage?.getItem(CART_KEY);
      return raw ? Cart.from(JSON.parse(raw)) : this.memory;
    } catch {
      return this.memory;
    }
  }

  save(cart: Cart): void {
    this.memory = cart;
    try {
      this.storage?.setItem(CART_KEY, JSON.stringify(cart.lines()));
    } catch {
      // Sin almacenamiento disponible: se conserva en memoria
    }
  }
}
