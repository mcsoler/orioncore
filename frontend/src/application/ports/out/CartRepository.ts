import type { Cart } from '../../../domain/entities/Cart';

/** Puerto de salida: dónde se guarda el carrito (hoy, el navegador). */
export interface CartRepository {
  load(): Cart;
  save(cart: Cart): void;
}
