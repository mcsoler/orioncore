import { describe, expect, it } from 'vitest';
import { AddToCart, GetCartCount, GetCartSummary } from '../../../src/application/use-cases/AddToCart';
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

describe('AddToCart (cantidad)', () => {
  it('agrega la cantidad elegida en la ficha de producto', () => {
    const repo = memoryRepository();
    expect(new AddToCart(repo).execute('router-wifi-6-malla', 3)).toBe(3);
  });
});

describe('GetCartSummary', () => {
  it('líneas, subtotal y cuánto falta para el envío gratis', () => {
    const summary = new GetCartSummary(memoryRepository(Cart.from({ a: 2, b: 1 }))).execute({ a: 100_000, b: 50_000 }, 300_000);
    expect(summary).toEqual({
      count: 3,
      lines: [{ slug: 'a', quantity: 2 }, { slug: 'b', quantity: 1 }],
      subtotal: '$250.000',
      shipping: { remaining: '$50.000', progress: 83, qualifies: false },
    });
  });

  it('con envío gratis alcanzado', () => {
    const summary = new GetCartSummary(memoryRepository(Cart.from({ a: 4 }))).execute({ a: 100_000 }, 300_000);
    expect(summary.shipping).toEqual({ remaining: '$0', progress: 100, qualifies: true });
  });

  it('si falta un precio o el monto del envío gratis, muestra marcadores en lugar de cifras inventadas', () => {
    const noPrice = new GetCartSummary(memoryRepository(Cart.from({ a: 1, b: 1 }))).execute({ a: 100_000 }, 300_000);
    expect(noPrice.subtotal).toBe('[SUBTOTAL]');
    expect(noPrice.shipping).toEqual({ remaining: '[$X]', progress: 0, qualifies: false });

    const noPolicy = new GetCartSummary(memoryRepository(Cart.from({ a: 1 }))).execute({ a: 100_000 });
    expect(noPolicy.subtotal).toBe('$100.000');
    expect(noPolicy.shipping.remaining).toBe('[$X]');
  });
});
