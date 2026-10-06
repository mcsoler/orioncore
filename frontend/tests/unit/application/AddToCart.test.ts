import { describe, expect, it } from 'vitest';
import { AddToCart, GetCartCount } from '../../../src/application/use-cases/AddToCart';
import type { CartRepository } from '../../../src/application/ports/out/CartRepository';
import { Cart } from '../../../src/domain/entities/Cart';

function memoryRepository(initial = Cart.empty()): CartRepository & { saved: Cart[] } {
  let current = initial;
  const saved: Cart[] = [];
  return {
    saved,
    load: () => current,
    save: (cart) => {
      current = cart;
      saved.push(cart);
    },
  };
}

describe('AddToCart', () => {
  it('agrega el producto, guarda el carrito y devuelve el total de unidades', () => {
    const repo = memoryRepository(Cart.from({ 'laptop-empresarial-14': 1 }));
    expect(new AddToCart(repo).execute('router-wifi-6-malla')).toBe(2);
    expect(repo.saved.at(-1)!.quantityOf('router-wifi-6-malla')).toBe(1);
  });
});

describe('GetCartCount', () => {
  it('devuelve las unidades guardadas', () => {
    expect(new GetCartCount(memoryRepository(Cart.from({ a: 2, b: 1 }))).execute()).toBe(3);
  });
});
