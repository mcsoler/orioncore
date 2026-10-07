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

  add(productSlug: string): Cart {
    const slug = Slug.of(productSlug).value;
    const items = new Map(this.items);
    items.set(slug, (items.get(slug) ?? 0) + 1);
    return new Cart(items);
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
