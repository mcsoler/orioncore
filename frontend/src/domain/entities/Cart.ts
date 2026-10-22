import { InvalidValueError } from '../errors/DomainError';
import { Money } from '../value-objects/Money';
import { Slug } from '../value-objects/Slug';

/** Carrito de la tienda: unidades por producto (slug). Inmutable. */
export class Cart {
  private constructor(private readonly items: ReadonlyMap<string, number>) {}

  static empty(): Cart {
    return new Cart(new Map());
  }

  /** Reconstruye un carrito guardado; descarta líneas que no son válidas. */
  static from(lines: Record<string, unknown>): Cart {
    const valid = Object.entries(lines).filter(
      (entry): entry is [string, number] =>
        Number.isInteger(entry[1]) && (entry[1] as number) > 0 && isSlug(entry[0]),
    );
    return new Cart(new Map(valid));
  }

  add(productSlug: string, quantity = 1): Cart {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new InvalidValueError('quantity', 'debe ser un entero mayor que 0');
    }
    const slug = Slug.of(productSlug).value;
    const items = new Map(this.items);
    items.set(slug, (items.get(slug) ?? 0) + quantity);
    return new Cart(items);
  }

  /** Subtotal con los precios conocidos; los productos sin precio no suman (aún no tienen uno). */
  subtotal(priceOf: (slug: string) => Money | undefined): Money {
    return [...this.items].reduce((sum, [slug, qty]) => {
      const price = priceOf(slug);
      return price ? sum.add(price.multiply(qty)) : sum;
    }, Money.cop(0));
  }

  quantityOf(productSlug: string): number {
    return this.items.get(productSlug) ?? 0;
  }

  get count(): number {
    return [...this.items.values()].reduce((sum, qty) => sum + qty, 0);
  }

  lines(): Record<string, number> {
    return Object.fromEntries(this.items);
  }
}

function isSlug(value: string): boolean {
  try {
    Slug.of(value);
    return true;
  } catch {
    return false;
  }
}
