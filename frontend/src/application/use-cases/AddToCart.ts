import type { CartRepository } from '../ports/out/CartRepository';

/** Agrega una unidad del producto y devuelve el total de unidades del carrito. */
export class AddToCart {
  constructor(private readonly cart: CartRepository) {}

  execute(productSlug: string): number {
    const updated = this.cart.load().add(productSlug);
    this.cart.save(updated);
    return updated.count;
  }
}

export class GetCartCount {
  constructor(private readonly cart: CartRepository) {}

  execute(): number {
    return this.cart.load().count;
  }
}
