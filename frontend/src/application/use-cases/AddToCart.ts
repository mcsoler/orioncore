import type { CartRepository } from '../ports/out/CartRepository';
import { Money } from '../../domain/value-objects/Money';
import { ShippingPolicy } from '../../domain/value-objects/ShippingPolicy';

/** Agrega unidades del producto (1 por defecto) y devuelve el total de unidades del carrito. */
export class AddToCart {
  constructor(private readonly cart: CartRepository) {}

  execute(productSlug: string, quantity = 1): number {
    const updated = this.cart.load().add(productSlug, quantity);
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

/** Marcadores mientras falten precios o el monto del envío gratis. */
export const SUBTOTAL_PENDING = '[SUBTOTAL]';
export const AMOUNT_PENDING = '[$X]';

export interface CartSummary {
  count: number;
  lines: { slug: string; quantity: number }[];
  /** `$1.299.000`, o el marcador si algún producto aún no tiene precio. */
  subtotal: string;
  shipping: { remaining: string; progress: number; qualifies: boolean };
}

/** Resumen del carrito: líneas, subtotal y cuánto falta para el envío gratis. */
export class GetCartSummary {
  constructor(private readonly cart: CartRepository) {}

  execute(prices: Readonly<Record<string, number | undefined>>, freeShippingFrom?: number): CartSummary {
    const cart = this.cart.load();
    const lines = Object.entries(cart.lines()).map(([slug, quantity]) => ({ slug, quantity }));
    const priceOf = (slug: string) => (prices[slug] === undefined ? undefined : Money.cop(prices[slug]!));
    const complete = lines.every((line) => priceOf(line.slug) !== undefined);
    const subtotal = cart.subtotal(priceOf);
    const policy = ShippingPolicy.freeFrom(freeShippingFrom);
    const known = complete && policy.isDefined;

    return {
      count: cart.count,
      lines,
      subtotal: complete ? subtotal.format() : SUBTOTAL_PENDING,
      shipping: {
        remaining: known ? policy.remaining(subtotal)!.format() : AMOUNT_PENDING,
        progress: known ? policy.progress(subtotal) : 0,
        qualifies: known && policy.qualifies(subtotal),
      },
    };
  }
}
